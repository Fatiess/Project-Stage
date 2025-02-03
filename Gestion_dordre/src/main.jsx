import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Cookies from "js-cookie";
import "./Styles/index.css";
import App from "./Pages/App";
import Arrivee from "./Pages/Arrivee";
import Depart from "./Pages/Depart";
import Login from "./Pages/Login";
import Admin from "./Pages/Admin";
import NotAutor from "./Pages/NotAutor";
import NoPage from "./Pages/NoPage";

const AppWrapper = () => {
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const cookieData = Cookies.get("authData");
    setUser(cookieData ? JSON.parse(cookieData) : null);
  }, [location.pathname]);

  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route
        path="/arrivee"
        element={user ? <Arrivee userToken={user} /> : <NotAutor />}
      />
      <Route
        path="/depart"
        element={user ? <Depart userToken={user} /> : <NotAutor />}
      />
      <Route
        path="/admin"
        element={
          user ? (
            user.user.privileges === 1 ? (
              <Admin userToken={user} />
            ) : (
              <NotAutor />
            )
          ) : (
            <NotAutor />
          )
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/noaccess" element={<NotAutor />} />
      <Route path="*" element={<NoPage />} />
    </Routes>
  );
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <AppWrapper />
    </Router>
  </StrictMode>
);
