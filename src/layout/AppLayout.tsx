import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./Layout.css";

interface Props {
  children: React.ReactNode;
}

export default function AppLayout({ children }: Props) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area">
        <Topbar />
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
}