import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"; // Import Router
import "./Styles/index.css";
import App from "./Pages/App";
import Arrivee from "./Pages/Arrivee";
import Depart from "./Pages/Depart";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/arrivee" element={<Arrivee />} />
        <Route path="/depart" element={<Depart />} />
      </Routes>
    </Router>
  </StrictMode>
);
