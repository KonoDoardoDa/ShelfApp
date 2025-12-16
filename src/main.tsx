import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App";
import Home from "./pages/Home";
import Users from "./pages/Users";
import Kits from "./pages/Items/Kits";
import Estoque from "./pages/Items/Estoque";
import Fornecedores from "./pages/Items/Fornecedores";
import Software from "./pages/Softwares";
import About from "./pages/About";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // layout
    children: [
      { index: true, element: <Home /> },
      { path: "users", element: <Users /> },
      { path: "items", 
       children: [
        { path: "kits", element: <Kits /> },
        { path: "estoque", element: <Estoque /> },
        { path: "fornecedores", element: <Fornecedores /> }
       ]
       },
      { path: "softwares", element: <Software /> },
      { path: "about", element: <About /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
