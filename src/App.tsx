import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar/Sidebar";
import "./App.css";

export default function App() {
   return (
    <div className="app-layout">
      <Sidebar />
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
