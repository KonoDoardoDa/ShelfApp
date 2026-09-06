import { Outlet } from "react-router-dom";
import Sidebar from "./layout/Sidebar";
import Topbar from "./layout/Topbar";
import "./App.css";

export default function App() {
  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-area">
        <Topbar />

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}