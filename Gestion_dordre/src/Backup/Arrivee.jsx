import { useState, useEffect } from "react";
import axios from "axios";

import "../Styles/Arrivee.css";
import Header from "../Components/Header";

import { TbEditCircle } from "react-icons/tb";
import { RiDeleteBin2Fill } from "react-icons/ri";
import { IoSearchCircle } from "react-icons/io5";
import { RiUploadCloud2Fill } from "react-icons/ri";

function Arrivee() {
  const currentDate = new Date().toISOString().split("T")[0];
  const [arriveeList, setArriveeList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [add, setAdd] = useState(false);
  const [edit, setEdit] = useState(false);
  const [inspect, setInspect] = useState(false);

  const [dateA, setDateA] = useState(currentDate);
  const [dateL, setDateL] = useState("");
  const [exp, setExp] = useState("");
  const [num, setNum] = useState(0);
  const [obj, setObj] = useState("");

  const [img, setImg] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");

  const fetcharrive = async () => {
    try {
      const response = await axios.get(`http://localhost:8082/arrivee`);
      setArriveeList(response.data);
    } catch (error) {
      console.error("Error fetching arrive:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  function formatDateForInput(dateString) {
    const date = new Date(dateString);
    if (isNaN(date)) return "";
    return date.toISOString().split("T")[0];
  }

  const getNumbr = (data) => {
    const currentYear = new Date().getFullYear();
    return data
      .filter(
        (item) => new Date(item.date_darrivee).getFullYear() === currentYear
      )
      .reduce(
        (max, item) => (item.id_arrivee > max ? item.id_arrivee : max),
        0
      );
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    // Allowed types and max size validation
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    const maxSize = 20 * 1024 * 1024; // 20MB

    if (selectedFile) {
      if (!allowedTypes.includes(selectedFile.type)) {
        alert("Invalid file type. Please upload JPEG, PNG, or PDF.");
        event.target.value = null;
        setImg(null);
        setSelectedFileName("");
        return;
      }

      if (selectedFile.size > maxSize) {
        alert("File is too large. Maximum size is 20MB.");
        event.target.value = null;
        setImg(null);
        setSelectedFileName("");
        return;
      }

      setImg(selectedFile);
      setSelectedFileName(selectedFile.name);
    }
  };

  const arriveePost = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("dateA", dateA);
      formData.append("dateL", dateL);
      formData.append("exp", exp);
      formData.append("num", num);
      formData.append("obj", obj);

      // Always append file if it exists
      if (img) {
        formData.append("file", img);
      }

      let response;
      if (add) {
        // New entry
        const nextOrderNumber = getNumbr(arriveeList) + 1;
        formData.append("nbr", nextOrderNumber);

        response = await axios.post("http://localhost:8082/arrivee", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else if (edit && selected) {
        // Edit existing entry
        formData.append("id", selected.id_arrivee);

        response = await axios.put(
          `http://localhost:8082/arrivee/${selected.id_arrivee}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      setAdd(false);
      setEdit(false);
      setSelected(null);
      setImg(null);
      setSelectedFileName("");
      fetcharrive();
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to add/edit document. Please try again.");
    }
  };

  const deleteArrivee = async (id) => {
    const isConfirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer cette arrivée ?"
    );
    if (!isConfirmed) return;

    try {
      await axios.delete(`http://localhost:8082/arrive/${id}`);
      fetcharrive();
      alert("Arrivée supprimée avec succès.");
    } catch (error) {
      console.error("Erreur lors de la suppression :", error.message);
      alert("Erreur lors de la suppression. Veuillez réessayer.");
    }
  };

  useEffect(() => {
    fetcharrive();
  }, []);

  useEffect(() => {
    if (add) {
      setDateA("");
      setDateL("");
      setExp("");
      setNum(0);
      setObj("");
      setImg(null);
      setSelectedFileName("");
      setEdit(false);
    } else if (edit) {
      setDateA(formatDateForInput(selected.date_darrivee));
      setDateL(formatDateForInput(selected.date_lettre));
      setExp(selected.expediteur);
      setNum(selected.numero_lettre);
      setObj(selected.objet);
      setSelectedFileName(selected.file_path);
      setAdd(false);
    }
  }, [add, edit, selected]);

  return (
    <main>
      <Header />
      <div className="arrivee">
        <div className="toper">
          <h1>Arrivee</h1>
          <div className="searcher">
            <input type="text" placeholder="Search" />
            <IoSearchCircle className="serico" />
          </div>
          <button
            className="main-btn"
            onClick={() => setAdd(true)}
            disabled={add}
          >
            Ajouter
          </button>
        </div>
        {add || edit ? (
          <form onSubmit={arriveePost}>
            <button
              type="button"
              className="exit"
              onClick={() => {
                setAdd(false);
                setSelected(null);
                setEdit(false);
              }}
            >
              ⨉
            </button>
            <h4>
              {add ? "Modifier l'arrivée" : null}
              {selected ? "Ajouter une nouvelle arrivée" : null}
              <span className="lmo9">
                N° ref:{" "}
                {add ? (
                  <span className="nbr6">{getNumbr(arriveeList) + 1}</span>
                ) : (
                  <span className="nbr6">{selected.num_dordre_arrivee}</span>
                )}
              </span>
              <span></span>
            </h4>
            <div className="add-inputs">
              <div className="single-input">
                <input
                  type="date"
                  className="inp1"
                  value={dateA}
                  onChange={(e) => setDateA(e.target.value)}
                />
                <label className="lab1">Date d'arrivee</label>
              </div>
              <div className="single-input">
                <input
                  type="date"
                  className="inp1"
                  value={dateL}
                  onChange={(e) => setDateL(e.target.value)}
                />
                <label className="lab1">Date de lettre</label>
              </div>
            </div>
            <div className="add-inputs">
              <div className="single-input">
                <input
                  type="text"
                  className="inp1"
                  placeholder=""
                  value={exp}
                  onChange={(e) => setExp(e.target.value)}
                />
                <label className="lab">Expéditeur</label>
              </div>
              <div className="single-input">
                <input
                  type="number"
                  className="inp1"
                  placeholder=""
                  value={num}
                  onChange={(e) => setNum(e.target.valueAsNumber)}
                />
                <label className="lab">Numéro de lettre</label>
              </div>
            </div>
            <div className="obj5">
              <textarea
                className={add ? "inp1 iop3" : "inp1 iop4"}
                placeholder="Object"
                value={obj}
                onChange={(e) => setObj(e.target.value)}
              />
              <div className={add ? "inp6" : "inp7"}>
                {edit ? (
                  selected.file_path ? (
                    <object
                      data={`http://localhost:8082${selected.file_path}`}
                      width="100%"
                      height={inspect ? "600px" : "100px"}
                    ></object>
                  ) : null
                ) : null}
                <input
                  style={{ display: "none" }}
                  id="user_img"
                  name="user_img"
                  type="file"
                  accept="image/png, image/jpeg, application/pdf"
                  onChange={handleFileChange}
                  multiple
                />
                <label htmlFor="user_img" className="ddvv7">
                  <div className="upload1">
                    <RiUploadCloud2Fill className="kkio5" />
                    <span className="loir55">Sélectionner une fichier</span>
                  </div>
                </label>
                {selectedFileName && (
                  <p>
                    <span className="llmm6">{selectedFileName}</span>
                  </p>
                )}
                {edit ? (
                  selected.file_path ? (
                    <button
                      type="button"
                      className="insp6"
                      onClick={() => setInspect(!inspect)}
                    >
                      {inspect ? "⩞" : "⩣"}
                    </button>
                  ) : null
                ) : null}
              </div>
            </div>
            <div className="btns">
              <input
                type="submit"
                className="main-btn2"
                value={add ? "Submit" : "Edit"}
              />
            </div>
          </form>
        ) : null}
        <div className="lists">
          <div className="columns">
            <span className="cl column0">Documents</span>
            <span className="cl column1">N° d'ordre</span>
            <span className="cl column2">Date d'ordre</span>
            <span className="cl column3">Date de lettre</span>
            <span className="cl column4">N° de lettre</span>
            <span className="cl column5">Expéditeur</span>
            <span className="cl column6">Objet</span>
            <span className="cl column7">Actions</span>
          </div>

          {arriveeList.map((ar) => {
            return (
              <div className="columns" key={ar.id_arrivee}>
                <span className="cl column0">
                  {ar.file_path ? "1" : "- - -"}
                </span>
                <span className="cl column1">{ar.num_dordre_arrivee}</span>
                <span className="cl column2">
                  {formatDate(ar.date_darrivee)}
                </span>
                <span className="cl column3">{formatDate(ar.date_lettre)}</span>
                <span className="cl column4">{ar.numero_lettre}</span>
                <span className="cl column5">{ar.expediteur}</span>
                <span className="cl column6">{ar.objet}</span>
                <span className="cl column7 ui">
                  <button className="action a1">
                    <TbEditCircle
                      className="icon1"
                      onClick={() => {
                        setSelected(ar);
                        setEdit(true);
                      }}
                    />
                  </button>
                  <button className="action a2">
                    <RiDeleteBin2Fill
                      className="icon1"
                      onClick={() => deleteArrivee(ar.id_arrivee)}
                    />
                  </button>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

export default Arrivee;
