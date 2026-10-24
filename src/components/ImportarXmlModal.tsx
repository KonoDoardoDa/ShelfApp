import React, { useState, useRef, useMemo } from "react";
import {
  Upload,
  FileCode,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building,
  Package,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { Modal } from "./Modal";
import { parseXmlEstoque, type ResultadoParseXml, type ItemXmlExtraido } from "../utils/xmlParser";
import { estoqueService } from "../services/estoqueService";
import type { Fornecedor } from "../types/fornecedor";
import type { Item, ImportarLoteRequestDto } from "../types/item";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage } from "../api/http";

interface ImportarXmlModalProps {
  isOpen: boolean;
  onClose: () => void;
  fornecedores: Fornecedor[];
  itensExistentes: Item[];
  onSuccess: () => Promise<void>;
}

export const ImportarXmlModal: React.FC<ImportarXmlModalProps> = ({
  isOpen,
  onClose,
  fornecedores,
  itensExistentes,
  onSuccess,
}) => {
  const { success, error: toastError, warning } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [parsedData, setParsedData] = useState<ResultadoParseXml | null>(null);
  const [errorParsing, setErrorParsing] = useState<string | null>(null);

  // Campos de Configuração do Lote
  const [notaFiscal, setNotaFiscal] = useState<string>("");
  const [selectedFornecedorId, setSelectedFornecedorId] = useState<number | "novo">("novo");
  const [novoFornecedorNome, setNovoFornecedorNome] = useState<string>("");
  const [itensPreview, setItensPreview] = useState<ItemXmlExtraido[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Mapa de itens existentes para verificação em tempo real
  const existingMap = useMemo(() => {
    const map = new Map<string, Item>();
    itensExistentes.forEach((it) => {
      map.set(it.nome.trim().toLowerCase(), it);
    });
    return map;
  }, [itensExistentes]);

  const handleReset = () => {
    setFile(null);
    setParsedData(null);
    setErrorParsing(null);
    setNotaFiscal("");
    setSelectedFornecedorId("novo");
    setNovoFornecedorNome("");
    setItensPreview([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const processFile = (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith(".xml")) {
      setErrorParsing("Por favor, selecione um arquivo válido com extensão .xml");
      return;
    }

    setFile(selectedFile);
    setErrorParsing(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const resultado = parseXmlEstoque(content);
        setParsedData(resultado);

        // Preencher NF
        setNotaFiscal(resultado.notaFiscal || "");

        // Detectar se o fornecedor do XML já existe
        if (resultado.fornecedorNome) {
          const nomeFornBusca = resultado.fornecedorNome.trim().toLowerCase();
          const matchExistente = fornecedores.find(
            (f) =>
              f.nome.trim().toLowerCase() === nomeFornBusca ||
              f.nome.trim().toLowerCase().includes(nomeFornBusca) ||
              nomeFornBusca.includes(f.nome.trim().toLowerCase())
          );

          if (matchExistente) {
            setSelectedFornecedorId(matchExistente.id);
            setNovoFornecedorNome("");
          } else {
            setSelectedFornecedorId("novo");
            setNovoFornecedorNome(resultado.fornecedorNome);
          }
        } else {
          // Sem fornecedor no XML
          const primeiroAtivo = fornecedores.find((f) => f.ativo !== false);
          if (primeiroAtivo) {
            setSelectedFornecedorId(primeiroAtivo.id);
          } else {
            setSelectedFornecedorId("novo");
            setNovoFornecedorNome("Fornecedor XML");
          }
        }

        setItensPreview(resultado.itens);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Erro desconhecido ao processar arquivo XML.";
        setErrorParsing(msg);
        setParsedData(null);
      }
    };
    reader.onerror = () => {
      setErrorParsing("Falha ao ler o arquivo selecionado no navegador.");
    };
    reader.readAsText(selectedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Manipulação de Itens da Tabela de Conferência
  const handleToggleItem = (idTemp: string) => {
    setItensPreview((prev) =>
      prev.map((item) =>
        item.idTemporario === idTemp ? { ...item, selecionado: !item.selecionado } : item
      )
    );
  };

  const handleToggleAll = (selecionarTodos: boolean) => {
    setItensPreview((prev) => prev.map((item) => ({ ...item, selecionado: selecionarTodos })));
  };

  const handleItemQuantidadeChange = (idTemp: string, novaQtd: number) => {
    const qtdValida = isNaN(novaQtd) || novaQtd <= 0 ? 1 : novaQtd;
    setItensPreview((prev) =>
      prev.map((item) =>
        item.idTemporario === idTemp ? { ...item, quantidade: qtdValida } : item
      )
    );
  };

  const handleItemNomeChange = (idTemp: string, novoNome: string) => {
    setItensPreview((prev) =>
      prev.map((item) =>
        item.idTemporario === idTemp ? { ...item, nome: novoNome } : item
      )
    );
  };

  const handleRemoveItem = (idTemp: string) => {
    setItensPreview((prev) => prev.filter((item) => item.idTemporario !== idTemp));
  };

  // Contadores
  const itensSelecionados = itensPreview.filter((i) => i.selecionado);
  const totalPecas = itensSelecionados.reduce((acc, curr) => acc + curr.quantidade, 0);

  const novosItensCount = itensSelecionados.filter(
    (i) => !existingMap.has(i.nome.trim().toLowerCase())
  ).length;

  const existentesItensCount = itensSelecionados.length - novosItensCount;

  // Efetivação da Importação
  const handleConfirmarImportacao = async () => {
    if (itensSelecionados.length === 0) {
      warning("Selecione pelo menos 1 item na tabela para importar.");
      return;
    }

    if (selectedFornecedorId === "novo" && !novoFornecedorNome.trim()) {
      warning("Informe o nome do novo fornecedor a ser cadastrado.");
      return;
    }

    try {
      setSubmitting(true);

      const payload: ImportarLoteRequestDto = {
        notaFiscal: notaFiscal.trim() || undefined,
        fornecedorIdPadrao: selectedFornecedorId === "novo" ? undefined : Number(selectedFornecedorId),
        novoFornecedorNome: selectedFornecedorId === "novo" ? novoFornecedorNome.trim() : undefined,
        usuarioNome: user?.nome || user?.email || "Operador",
        itens: itensSelecionados.map((it) => ({
          nome: it.nome.trim(),
          codigoReferencia: it.codigoReferencia,
          quantidade: it.quantidade,
          descricao: it.descricao,
        })),
      };

      const res = await estoqueService.importarLote(payload);
      success(res.message, "Importação Concluída com Sucesso!");
      await onSuccess();
      handleReset();
      onClose();
    } catch (err) {
      toastError(getErrorMessage(err), "Falha na Importação do XML");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!submitting) {
          handleReset();
          onClose();
        }
      }}
      title="Importação Massiva de Itens via XML (NF-e / SEFAZ)"
      maxWidth="1150px"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        {/* Seção 1: Área de Upload se nenhum arquivo estiver carregado */}
        {!parsedData ? (
          <div>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              style={{
                border: `2px dashed ${isDragging ? "var(--accent, #3b82f6)" : "var(--border-color, #334155)"}`,
                borderRadius: "12px",
                padding: "36px 20px",
                textAlign: "center",
                backgroundColor: isDragging
                  ? "rgba(59, 130, 246, 0.08)"
                  : "var(--bg-tertiary, rgba(255,255,255,0.02))",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xml"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(59, 130, 246, 0.15)",
                  color: "var(--accent, #3b82f6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <Upload size={28} />
              </div>
              <h4 style={{ margin: "0 0 8px", fontSize: "16px", color: "var(--text-primary)" }}>
                Clique para selecionar ou arraste o arquivo XML aqui
              </h4>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)" }}>
                Suporte nativo para <strong>NF-e da SEFAZ (Modelo 55)</strong> emitida por fornecedores ou XML genérico de itens
              </p>
            </div>

            {errorParsing && (
              <div
                style={{
                  marginTop: "14px",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#f87171",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "13px",
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{errorParsing}</span>
              </div>
            )}

            <div
              style={{
                marginTop: "16px",
                padding: "14px",
                borderRadius: "8px",
                backgroundColor: "var(--bg-secondary, rgba(255,255,255,0.03))",
                border: "1px solid var(--border-color, rgba(255,255,255,0.08))",
                fontSize: "12.5px",
                color: "var(--text-secondary)",
              }}
            >
              <strong style={{ color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                💡 Como funciona a importação inteligente:
              </strong>
              <ul style={{ margin: 0, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "4px" }}>
                <li>Extrai automaticamente o número da <strong>Nota Fiscal (NF-e)</strong> e a <strong>Razão Social do Fornecedor</strong>.</li>
                <li>Identifica se a peça já existe no sistema: itens novos serão criados e itens existentes terão seu estoque incrementado.</li>
                <li>Todas as movimentações geram histórico de auditoria vinculado à NF da compra.</li>
              </ul>
            </div>
          </div>
        ) : (
          /* Seção 2: Pré-visualização e Conferência */
          <div>
            {/* Barra de Informações da Nota e Fornecedor */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "14px",
                backgroundColor: "var(--bg-card, #1e293b)",
                border: "1px solid var(--border-color, #334155)",
                borderRadius: "10px",
                padding: "16px",
                marginBottom: "14px",
              }}
            >
              <div>
                <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <FileCode size={14} color="var(--accent, #3b82f6)" />
                  Arquivo XML
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={file?.name}
                  >
                    {file?.name}
                  </span>
                  <span className="badge badge-blue font-mono" style={{ fontSize: "11px" }}>
                    {parsedData.tipoXml === "NFE" ? "NF-e SEFAZ" : "XML Genérico"}
                  </span>
                </div>
              </div>

              <div>
                <label className="form-label" htmlFor="import-nf" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <FileText size={14} color="#10b981" />
                  Nota Fiscal (NF-e)
                </label>
                <input
                  id="import-nf"
                  type="text"
                  className="form-input"
                  placeholder="Ex: 10452"
                  value={notaFiscal}
                  onChange={(e) => setNotaFiscal(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="form-label" htmlFor="import-fornecedor" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Building size={14} color="var(--accent, #3b82f6)" />
                  Fornecedor Vinculado
                </label>
                <select
                  id="import-fornecedor"
                  className="form-select"
                  value={selectedFornecedorId}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "novo") {
                      setSelectedFornecedorId("novo");
                    } else {
                      setSelectedFornecedorId(Number(val));
                    }
                  }}
                  disabled={submitting}
                >
                  <option value="novo">
                    {novoFornecedorNome ? `+ Cadastrar Novo: "${novoFornecedorNome}"` : "+ Cadastrar Novo Fornecedor"}
                  </option>
                  <optgroup label="Fornecedores Cadastrados no ERP">
                    {fornecedores.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.nome} {f.ativo === false ? "(Inativo)" : ""}
                      </option>
                    ))}
                  </optgroup>
                </select>

                {selectedFornecedorId === "novo" && (
                  <input
                    type="text"
                    className="form-input"
                    style={{ marginTop: "8px" }}
                    placeholder="Nome do Novo Fornecedor"
                    value={novoFornecedorNome}
                    onChange={(e) => setNovoFornecedorNome(e.target.value)}
                    disabled={submitting}
                  />
                )}
              </div>
            </div>

            {/* Resumo Executivo dos Itens */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
                marginBottom: "12px",
                padding: "8px 12px",
                backgroundColor: "var(--bg-tertiary, rgba(255,255,255,0.03))",
                borderRadius: "8px",
                border: "1px solid var(--border-color, rgba(255,255,255,0.08))",
              }}
            >
              <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                <span className="badge badge-gray font-mono">
                  {itensSelecionados.length} de {itensPreview.length} item(ns) selecionado(s)
                </span>
                <span className="badge badge-green font-mono">
                  Total: {totalPecas} un
                </span>
                <span
                  className="badge"
                  style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10b981", fontWeight: 600 }}
                >
                  🟢 {novosItensCount} Novo(s)
                </span>
                <span
                  className="badge"
                  style={{ backgroundColor: "rgba(245, 158, 11, 0.15)", color: "#f59e0b", fontWeight: 600 }}
                >
                  🟡 {existentesItensCount} Existente(s) (Entrada)
                </span>
              </div>

              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleToggleAll(true)}
                  disabled={submitting}
                >
                  Selecionar Todos
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleToggleAll(false)}
                  disabled={submitting}
                >
                  Desmarcar Todos
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleReset}
                  disabled={submitting}
                  title="Carregar outro arquivo XML"
                >
                  <RefreshCw size={13} style={{ marginRight: "4px" }} />
                  Trocar XML
                </button>
              </div>
            </div>

            {/* Tabela de Conferência dos Itens */}
            <div className="table-container" style={{ maxHeight: "380px", overflowY: "auto", overflowX: "auto" }}>
              <table className="data-table" style={{ minWidth: "950px" }}>
                <thead>
                  <tr>
                    <th style={{ width: "40px", textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={itensPreview.length > 0 && itensPreview.every((i) => i.selecionado)}
                        onChange={(e) => handleToggleAll(e.target.checked)}
                        disabled={submitting}
                      />
                    </th>
                    <th style={{ width: "130px" }}>Ação / Status</th>
                    <th style={{ width: "130px" }}>Ref / Código</th>
                    <th>Componente / Peça (NF-e)</th>
                    <th style={{ width: "110px", textAlign: "center" }}>Qtd Faturada</th>
                    <th style={{ width: "70px", textAlign: "center" }}>Un</th>
                    <th style={{ width: "60px", textAlign: "center" }}>Excluir</th>
                  </tr>
                </thead>
                <tbody>
                  {itensPreview.map((item) => {
                    const existente = existingMap.get(item.nome.trim().toLowerCase());
                    const isNovo = !existente;

                    return (
                      <tr
                        key={item.idTemporario}
                        style={{
                          opacity: item.selecionado ? 1 : 0.45,
                          backgroundColor: item.selecionado ? undefined : "rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        <td style={{ textAlign: "center" }}>
                          <input
                            type="checkbox"
                            checked={item.selecionado}
                            onChange={() => handleToggleItem(item.idTemporario)}
                            disabled={submitting}
                          />
                        </td>
                        <td>
                          {isNovo ? (
                            <span
                              className="badge"
                              style={{
                                backgroundColor: "rgba(16, 185, 129, 0.15)",
                                color: "#10b981",
                                fontWeight: 700,
                                fontSize: "11px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                              title="Item novo no ERP: será cadastrado automaticamente com o saldo inicial."
                            >
                              <Plus size={12} />
                              Novo Item
                            </span>
                          ) : (
                            <span
                              className="badge"
                              style={{
                                backgroundColor: "rgba(245, 158, 11, 0.15)",
                                color: "#f59e0b",
                                fontWeight: 700,
                                fontSize: "11px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                              title={`Item existente no sistema (ID #${existente.id}). O saldo atual de ${existente.quantidadeEstoque ?? 0} un receberá entrada.`}
                            >
                              <Package size={12} />
                              Entrada (#{existente.id})
                            </span>
                          )}
                        </td>
                        <td>
                          <span style={{ fontSize: "12px", fontFamily: "monospace", color: "var(--text-secondary)" }}>
                            {item.codigoReferencia || "—"}
                          </span>
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-input"
                            style={{ padding: "4px 8px", fontSize: "13px", width: "100%" }}
                            value={item.nome}
                            onChange={(e) => handleItemNomeChange(item.idTemporario, e.target.value)}
                            disabled={submitting || !item.selecionado}
                          />
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <input
                            type="number"
                            className="form-input font-mono"
                            style={{
                              padding: "4px 8px",
                              fontSize: "13px",
                              width: "80px",
                              textAlign: "center",
                              fontWeight: 700,
                              color: "#10b981",
                            }}
                            min={1}
                            max={1000000}
                            value={item.quantidade}
                            onChange={(e) =>
                              handleItemQuantidadeChange(item.idTemporario, parseInt(e.target.value) || 1)
                            }
                            disabled={submitting || !item.selecionado}
                          />
                        </td>
                        <td style={{ textAlign: "center", fontSize: "12px", color: "var(--text-muted)" }}>
                          {item.unidade || "UN"}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <button
                            type="button"
                            className="action-btn text-danger"
                            title="Remover este item da importação"
                            onClick={() => handleRemoveItem(item.idTemporario)}
                            disabled={submitting}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Ações do Rodapé */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "16px",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  handleReset();
                  onClose();
                }}
                disabled={submitting}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirmarImportacao}
                disabled={submitting || itensSelecionados.length === 0}
                style={{
                  backgroundColor: "#10b981",
                  borderColor: "#10b981",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "9px 20px",
                  fontWeight: 600,
                }}
              >
                {submitting ? (
                  <>
                    <RefreshCw size={16} className="spinner" />
                    Processando Importação...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Confirmar Importação ({itensSelecionados.length} itens / {totalPecas} un)
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
