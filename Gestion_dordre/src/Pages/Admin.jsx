import { useEffect, useState } from "react";
import axios from "axios";

import { MdVisibility } from "react-icons/md";
import { MdVisibilityOff } from "react-icons/md";
import { AiFillDelete } from "react-icons/ai";

import Header from "../Components/Header";

import "../Styles/Admin.css";

function Admin() {
  const [allUsers, setAllUsers] = useState([]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [priv, setPriv] = useState(3);
  const [sel, setSel] = useState(null);

  const [edit, setEdit] = useState(0);
  const [passV, setPassV] = useState(false);

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8887/register", {
        username: username,
        password: password,
        privileges: priv,
      });
      fetchUsers();
      setUsername("");
      setPassword("");
      setPriv(3);
      setEdit(0);
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8887/users/${sel.user_id}`, {
        username: username,
        password: password,
        privileges: priv,
      });
      fetchUsers();
      setUsername("");
      setPassword("");
      setPriv(3);
      setSel(null);
      setEdit(0);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const deleteUser = async () => {
    if (window.confirm("Etes-vous sûr de vouloir supprimer cet utilisateur?")) {
      try {
        await axios.delete(`http://localhost:8887/users/${sel.user_id}`);
        fetchUsers();
        setUsername("");
        setPassword("");
        setPriv(3);
        setSel(null);
        setEdit(0);
      } catch (error) {
        console.error("Error:", error.response?.data || error.message);
      }
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`http://localhost:8887/users`);
      setAllUsers(response.data);
    } catch (error) {
      console.error("Error fetching arrive:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <main>
      <Header />
      <div className="admin">
        <div className="hed5874">
          <span>Utilisateurs</span>
          <button
            className="add-bt8877"
            onClick={() => {
              setEdit(1);
            }}
          >
            Ajouter
          </button>
        </div>
        <div className="users">
          <div className="users-list">
            {allUsers.map((u) => {
              return (
                <div
                  key={u.user_id}
                  className="user-card"
                  onClick={() => {
                    setEdit(2);
                    setUsername(u.username);
                    setPriv(u.privileges);
                    setSel(u);
                  }}
                  id={
                    sel ? (u.user_id === sel.user_id ? "sel58469" : null) : null
                  }
                >
                  <p>
                    Nom d'utilisateur : <span>{u.username}</span>
                  </p>
                  <p>
                    User ID : <span>{u.user_id}</span>
                  </p>
                  <p>
                    Privilèges :
                    <span>
                      {u.privileges === 1
                        ? "Admin"
                        : u.privileges === 3
                        ? "Personnel"
                        : "Invité"}
                    </span>
                  </p>
                </div>
              );
            })}
          </div>
          {edit === 1 || edit === 2 ? (
            <form
              className="user-form"
              onSubmit={edit === 2 ? handleUpdateUser : handleAddUser}
            >
              <h4>
                {edit === 2
                  ? "mode d'inspection"
                  : "Ajouter un nouvel administrateur"}
              </h4>
              <div className="user-input1">
                <label>Nom d'utilisateur</label>
                <input
                  className="user-input335"
                  type="text"
                  value={username}
                  minLength={4}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="user-input1">
                <label>Mot de passe</label>
                <input
                  className="user-input335"
                  type={passV ? "text" : "password"}
                  value={password}
                  minLength={6}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {passV ? (
                  <MdVisibility
                    className="vis2568"
                    onClick={() => setPassV(!passV)}
                  />
                ) : (
                  <MdVisibilityOff
                    className="vis2568"
                    onClick={() => setPassV(!passV)}
                  />
                )}
              </div>
              <div className="user-input15">
                <input disabled className="select-priv" value="Privilèges" />
                <select
                  className="user-input445"
                  value={priv}
                  onChange={(e) => setPriv(e.target.value)}
                >
                  <option value={3}>Personnel</option>
                  <option value={1}>Admin</option>
                  <option value={2} disabled>
                    Invité
                  </option>
                </select>
              </div>
              <div className="oku554">
                <input
                  type="button"
                  value="Annuler"
                  className="add-bt884"
                  onClick={() => {
                    setEdit(0);
                    setUsername("");
                    setPassword("");
                    setPriv(3);
                    setSel(null);
                  }}
                />
                {edit === 2 ? (
                  <button type="button" className="deto58" onClick={deleteUser}>
                    <AiFillDelete />
                  </button>
                ) : null}
                <input
                  type="submit"
                  value={edit === 1 ? "Ajouter" : "Changer"}
                  className="add-bt887"
                />
              </div>
            </form>
          ) : null}
        </div>
      </div>
    </main>
  );
}

export default Admin;
