import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Cookies from "js-cookie";
import "./Styles/index.css";
import App from "./Pages/App";
import Arrivee from "./Pages/Arrivee";
import Depart from "./Pages/Depart";
import Login from "./Pages/Login";

const AppWrapper = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const cookieData = Cookies.get("authData");
    if (cookieData) {
      setUser(JSON.parse(cookieData));
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/arrivee" element={<Arrivee userToken={user} />} />
        <Route path="/depart" element={<Depart userToken={user} />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppWrapper />
  </StrictMode>
);
