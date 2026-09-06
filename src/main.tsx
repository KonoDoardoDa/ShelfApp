import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

import App from "./App";
import Home from "./pages/Home";
import Users from "./pages/Users";
import Kits from "./pages/Items/Kits";
import Estoque from "./pages/Items/Estoque";
import Fornecedores from "./pages/Items/Fornecedores";
import Software from "./pages/Softwares";
import About from "./pages/About";
import Login from "./pages/Login";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./context/AuthContext";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <App />,
        children: [
          { index: true, element: <Home /> },
          {
            element: <ProtectedRoute allowedRoles={["Admin"]} />,
            children: [{ path: "users", element: <Users /> }],
          },
          {
            path: "items",
            children: [
              { path: "kits", element: <Kits /> },
              { path: "estoque", element: <Estoque /> },
              { path: "fornecedores", element: <Fornecedores /> },
            ],
          },
          { path: "softwares", element: <Software /> },
          { path: "about", element: <About /> },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  </React.StrictMode>
);
