import { useState } from "react";
import { Link } from "react-router-dom";
import { GrHomeRounded } from "react-icons/gr";
import { BsDownload } from "react-icons/bs";
import { BsUpload } from "react-icons/bs";
import { MdLogin } from "react-icons/md";
import "../Styles/Header.css";
import img from "../Images/vv.png";
import Login from "../Pages/Login";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleLoginPopup = () => {
    setIsLoginOpen(!isLoginOpen);
  };

  const handleLogin = async (credentials) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        setIsLoginOpen(false);
        alert("Connexion réussie !");
      } else {
        alert("Identifiants incorrects !");
      }
    } catch (error) {
      console.error("Erreur lors de la connexion :", error);
    }
  };

  const handleSignup = async (userData) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        alert("Inscription réussie !");
        setIsLoginOpen(false);
      } else {
        alert("Erreur lors de l'inscription !");
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription :", error);
    }
  };

  return (
    <header>
      <div className="logos">
        <img src={img} alt="Logo" width="70px" />
        <label>bureau d'ordre</label>
      </div>

      <div
        className={`hamburger ${isMenuOpen ? "active" : ""}`}
        onClick={toggleMenu}
      >
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
      </div>

      <div className={`nav-links ${isMenuOpen ? "active" : ""}`}>
        <Link className="link" to="/" onClick={toggleMenu}>
          <GrHomeRounded /> Home
        </Link>
        <span></span>
        <Link
          className="link"
          to={isAuthenticated ? "/arrivee" : "#"}
          onClick={() => {
            if (!isAuthenticated) {
              toggleLoginPopup();
            }
          }}
        >
          <BsDownload /> Arrivée
        </Link>
        <span></span>
        <Link
          className="link"
          to={isAuthenticated ? "/depart" : "#"}
          onClick={() => {
            if (!isAuthenticated) {
              toggleLoginPopup();
            }
          }}
        >
          <BsUpload /> Départ
        </Link>
        <span></span>
        <button className="link login-link" onClick={toggleLoginPopup}>
          <MdLogin /> Se Connecter
        </button>
      </div>

      {isLoginOpen && <Login toggle={toggleLoginPopup} onLogin={handleLogin} onSignup={handleSignup} />}
    </header>
  );
}

export default Header;
