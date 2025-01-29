import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";

import { GrHomeRounded } from "react-icons/gr";
import { BsDownload } from "react-icons/bs";
import { BsUpload } from "react-icons/bs";
import { MdLogin } from "react-icons/md";
import { LuUser } from "react-icons/lu";

import "../Styles/Header.css";

import img from "../Images/vv.png";

function Header() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const cookieData = Cookies.get("authData");
    if (cookieData) {
      setUser(JSON.parse(cookieData));
    }
  }, []);

  return (
    <header>
      <div className="logos">
        <img src={img} alt="Logo" width="70px" />
        <label>bureau d'ordre</label>
      </div>
      <div className="nav-links">
        <Link className="link" to="/">
          <GrHomeRounded /> Home
        </Link>
        <span></span>
        <Link className="link" to="/arrivee">
          <BsDownload /> Arrivée
        </Link>
        <span></span>
        <Link className="link" to="/depart">
          <BsUpload /> Départ
        </Link>
      </div>
      <div className="nav-links">
        {user ? (
          <div className="spany11">
            <p className="login-admin" to="/login">
              <LuUser /> {user.user.username}
            </p>
            <div className="logout-btn" to="/login">
              <div /> Déconnexion
            </div>
          </div>
        ) : (
          <Link className="link login-link" to="/login">
            <MdLogin /> Se Connecter
          </Link>
        )}
      </div>
    </header>
  );
}

export default Header;
