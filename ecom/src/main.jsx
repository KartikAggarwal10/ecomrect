import React from "react";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { Provider } from "react-redux"; // ✅ ADD THIS
import { store } from "./store";         // ✅ Your Redux store

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>            {/* ✅ Redux context */}
      <BrowserRouter>                   {/* ✅ Routing context */}
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);

