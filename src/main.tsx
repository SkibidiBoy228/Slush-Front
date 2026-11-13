import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { SignalRProvider } from "./context/SignalRContext";
import "./i18n";
import "./index.css";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <SignalRProvider>
            <App />
        </SignalRProvider>
    </StrictMode>
);