import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "@/routes";
import "@/styles.css";
import { WithQuery } from "@/app/query";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <WithQuery>
    <RouterProvider router={router} />
  </WithQuery>
);
