import React, { useState } from "react";
import "../Styles/Login.css";

function Login(props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isLogin, setIsLogin] = useState(true); // État pour basculer entre connexion et inscription
  const [error, setError] = useState(""); // État pour afficher les erreurs

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Réinitialiser les erreurs

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        credentials: "include", // Inclure les cookies
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Login successful:", data);
        props.onLogin(data); // Appeler la fonction parente pour mettre à jour l'état de l'application
        props.toggle(); // Fermer le popup
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Erreur de connexion");
      }
    } catch (err) {
      setError("Erreur réseau ou serveur");
      console.error("Login error:", err);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(""); // Réinitialiser les erreurs

    try {
      const response = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
        credentials: "include", // Inclure les cookies
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Signup successful:", data);
        props.onSignup(data); // Appeler la fonction parente pour mettre à jour l'état de l'application
        props.toggle(); // Fermer le popup
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Erreur d'inscription");
      }
    } catch (err) {
      setError("Erreur réseau ou serveur");
      console.error("Signup error:", err);
    }
  };

  return (
    <div className="popup">
      <div className="popup-inner">
        <div className="image-side"></div>

        <div className="form-side">
          <h2>{isLogin ? "Se connecter" : "Inscription"}</h2>
          <p>
            {isLogin
              ? "Veuillez vous connecter pour avoir plus."
              : "Créez un compte pour accéder à votre espace personnel."}
          </p>

          {error && <p style={{ color: "red" }}>{error}</p>}

          {isLogin ? (
            // Formulaire de connexion
            <form onSubmit={handleLogin}>
              <label>
                Nom d'utilisateur:
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </label>
              <label>
                Mot de passe:
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>
              <button type="submit">Se Connecter</button>
            </form>
          ) : (
            // Formulaire d'inscription
            <form onSubmit={handleSignup}>
              <label>
                Nom d'utilisateur:
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </label>
              <label>
                Email:
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
              <label>
                Mot de passe:
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>
              <label>
                Confirmez le mot de passe:
                <input type="password" required />
              </label>
              <button type="submit">S'inscrire</button>
            </form>
          )}

          <p>
            {isLogin ? (
              <>
                Vous n'avez pas de compte ?{" "}
                <span
                  style={{ color: "#007bff", cursor: "pointer" }}
                  onClick={() => setIsLogin(false)}
                >
                  Inscrivez-vous ici.
                </span>
              </>
            ) : (
              <>
                Vous avez déjà un compte ?{" "}
                <span
                  style={{ color: "#007bff", cursor: "pointer" }}
                  onClick={() => setIsLogin(true)}
                >
                  Connectez-vous ici.
                </span>
              </>
            )}
          </p>

          <button onClick={props.toggle}>Fermer</button>
        </div>
      </div>
    </div>
  );
}

export default Login;