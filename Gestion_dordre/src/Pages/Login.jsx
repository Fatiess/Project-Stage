import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";

import img1 from "../Images/bureau.jpg";
import { TbArrowBackUp } from "react-icons/tb";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import "../Styles/Login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passShow, setPassShow] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://localhost:8887/login", {
        username,
        password,
      });

      const data = {
        token: response.data.token,
        user: response.data.user,
      };

      Cookies.set("authData", JSON.stringify(data), { expires: 7 });

      navigate("/");
    } catch (error) {
      setError(
        error.response?.data?.error || "Login failed. Please try again."
      );
    }
  };

  return (
    <div className="login-container">
      <div className="login">
        <div className="l-img">
          <img alt="Login-img" src={img1} width="350px" />
        </div>
        <form className="form2" onSubmit={handleSubmit}>
          <h1>bureau d'ordre login page</h1>
          <div className="inpu-lab22">
            <input
              required
              value={username}
              minLength={4}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              className="inp226"
              id={error ? "redo" : null}
              placeholder=""
            />
            <label className="lab55" id={error ? "redo1" : null}>
              Nom d'utilisateur
            </label>
          </div>
          <div className="inpu-lab22">
            <input
              required
              value={password}
              minLength={6}
              onChange={(e) => setPassword(e.target.value)}
              type={passShow ? "text" : "password"}
              className="inp226"
              id={error ? "redo" : null}
              placeholder=""
            />
            {passShow ? (
              <MdVisibility
                onClick={() => setPassShow(!passShow)}
                className="visible22"
              />
            ) : (
              <MdVisibilityOff
                onClick={() => setPassShow(!passShow)}
                className="visible22"
              />
            )}
            <label className="lab55" id={error ? "redo1" : null}>
              Mot de passe
            </label>
          </div>
          <input type="submit" value="LogIn" className="login-btn22" />

          <Link className="back22" to="/">
            <TbArrowBackUp /> Retour à la page d'accueil
          </Link>
        </form>
      </div>
    </div>
  );
}

export default Login;
