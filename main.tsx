import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set document direction to RTL
document.documentElement.dir = "rtl";
document.documentElement.lang = "ar";

createRoot(document.getElementById("root")!).render(<App />);