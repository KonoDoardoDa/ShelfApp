export interface ItemXmlExtraido {
  idTemporario: string;
  nome: string;
  codigoReferencia?: string;
  quantidade: number;
  unidade?: string;
  descricao?: string;
  selecionado: boolean;
}

export interface ResultadoParseXml {
  tipoXml: "NFE" | "GENERICO";
  notaFiscal?: string;
  fornecedorNome?: string;
  cnpj?: string;
  itens: ItemXmlExtraido[];
}

/**
 * Função auxiliar para buscar o texto do primeiro elemento pelo nome da tag,
 * ignorando namespaces XML (ex: "nfe:cProd" ou "cProd").
 */
function getTagText(parent: Element | Document, tagName: string): string | null {
  // 1. Tentar busca padrão
  const elements = parent.getElementsByTagName(tagName);
  if (elements.length > 0 && elements[0].textContent) {
    return elements[0].textContent.trim();
  }

  // 2. Tentar busca com namespace coringa ou localName
  const allElements = parent.getElementsByTagName("*");
  for (let i = 0; i < allElements.length; i++) {
    const el = allElements[i];
    if (el.localName === tagName || el.tagName.endsWith(":" + tagName)) {
      return el.textContent ? el.textContent.trim() : null;
    }
  }

  return null;
}

/**
 * Faz o parse de string XML (NF-e SEFAZ ou XML genérico) e extrai os itens para conferência.
 */
export function parseXmlEstoque(xmlContent: string): ResultadoParseXml {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, "text/xml");

  const parserError = xmlDoc.getElementsByTagName("parsererror");
  if (parserError.length > 0) {
    throw new Error(
      "O arquivo selecionado não contém uma estrutura XML válida: " +
        (parserError[0].textContent || "Erro de sintaxe XML")
    );
  }

  // 1. Verificar se é uma NF-e SEFAZ (possui infNFe, det ou nfeProc)
  const isNFe =
    xmlDoc.getElementsByTagName("infNFe").length > 0 ||
    xmlDoc.getElementsByTagName("NFe").length > 0 ||
    xmlDoc.getElementsByTagName("nfeProc").length > 0;

  if (isNFe) {
    return parseNfeXml(xmlDoc);
  }

  // 2. Se não for NF-e, tentar parse de XML genérico de itens
  return parseGenericXml(xmlDoc);
}

function parseNfeXml(xmlDoc: Document): ResultadoParseXml {
  // Extrair número da Nota Fiscal (<ide><nNF>)
  let notaFiscal: string | undefined;
  const ideEl = xmlDoc.getElementsByTagName("ide")[0];
  if (ideEl) {
    notaFiscal = getTagText(ideEl, "nNF") || undefined;
  } else {
    notaFiscal = getTagText(xmlDoc, "nNF") || undefined;
  }

  // Extrair Fornecedor / Emitente (<emit><xNome>)
  let fornecedorNome: string | undefined;
  let cnpj: string | undefined;
  const emitEl = xmlDoc.getElementsByTagName("emit")[0];
  if (emitEl) {
    fornecedorNome = getTagText(emitEl, "xNome") || getTagText(emitEl, "xFant") || undefined;
    cnpj = getTagText(emitEl, "CNPJ") || undefined;
  }

  // Extrair Itens (<det>)
  const detElements = xmlDoc.getElementsByTagName("det");
  const itens: ItemXmlExtraido[] = [];

  for (let i = 0; i < detElements.length; i++) {
    const det = detElements[i];
    const prod = det.getElementsByTagName("prod")[0] || det;

    const xProd = getTagText(prod, "xProd");
    if (!xProd) continue;

    const cProd = getTagText(prod, "cProd") || undefined;
    const qComStr = getTagText(prod, "qCom") || "1";
    const uCom = getTagText(prod, "uCom") || undefined;

    // Normalizar quantidade (NF-e utiliza ponto para decimais, ex: 10.0000)
    let quantidade = Math.round(parseFloat(qComStr.replace(",", ".")));
    if (isNaN(quantidade) || quantidade <= 0) {
      quantidade = 1;
    }

    itens.push({
      idTemporario: `nfe_item_${i + 1}_${Date.now()}`,
      nome: xProd,
      codigoReferencia: cProd,
      quantidade,
      unidade: uCom,
      descricao: cProd ? `Ref / Código Fabricante: ${cProd}` : undefined,
      selecionado: true,
    });
  }

  if (itens.length === 0) {
    throw new Error(
      "O arquivo XML da NF-e foi identificado, porém nenhuma tag de produto (<det><prod>) foi encontrada."
    );
  }

  return {
    tipoXml: "NFE",
    notaFiscal,
    fornecedorNome,
    cnpj,
    itens,
  };
}

function parseGenericXml(xmlDoc: Document): ResultadoParseXml {
  const notaFiscal = getTagText(xmlDoc, "notaFiscal") || getTagText(xmlDoc, "nf") || undefined;
  const fornecedorNome =
    getTagText(xmlDoc, "fornecedor") || getTagText(xmlDoc, "fornecedorNome") || undefined;

  // Buscar elementos <item>
  const itemElements = xmlDoc.getElementsByTagName("item");
  if (itemElements.length === 0) {
    throw new Error(
      "Estrutura XML não reconhecida. Para XMLs de NF-e garanta a tag <NFe>/<infNFe>; para XML genérico utilize a tag <itens><item>...</item></itens>."
    );
  }

  const itens: ItemXmlExtraido[] = [];
  for (let i = 0; i < itemElements.length; i++) {
    const itemEl = itemElements[i];
    const nome =
      getTagText(itemEl, "nome") ||
      getTagText(itemEl, "name") ||
      getTagText(itemEl, "descricao") ||
      getTagText(itemEl, "xProd");

    if (!nome) continue;

    const codigo = getTagText(itemEl, "codigo") || getTagText(itemEl, "codigoReferencia") || getTagText(itemEl, "cProd") || undefined;
    const qtdStr = getTagText(itemEl, "quantidade") || getTagText(itemEl, "qtd") || getTagText(itemEl, "quantity") || "1";
    const descricao = getTagText(itemEl, "descricao") || undefined;

    let quantidade = Math.round(parseFloat(qtdStr.replace(",", ".")));
    if (isNaN(quantidade) || quantidade <= 0) {
      quantidade = 1;
    }

    itens.push({
      idTemporario: `gen_item_${i + 1}_${Date.now()}`,
      nome,
      codigoReferencia: codigo,
      quantidade,
      descricao,
      selecionado: true,
    });
  }

  if (itens.length === 0) {
    throw new Error("Nenhum item com nome ou descrição válida foi encontrado no XML.");
  }

  return {
    tipoXml: "GENERICO",
    notaFiscal,
    fornecedorNome,
    itens,
  };
}
