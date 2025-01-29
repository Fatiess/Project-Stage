import { useState, useEffect } from "react";
import axios from "axios";
import "../Styles/Depart.css";
import Header from "../Components/Header";
import { TbEditCircle } from "react-icons/tb";
import { RiDeleteBin2Fill } from "react-icons/ri";
import { IoSearchCircle } from "react-icons/io5";
import { RiUploadCloud2Fill } from "react-icons/ri";

// Fonction principale
function Depart() {
  const today = new Date();
  const currentDate = today.toISOString().split("T")[0];
  const [departList, setDepartList] = useState([]);
  const [years, setYears] = useState([]);

  const [selected, setSelected] = useState(null);
  const [add, setAdd] = useState(false);
  const [edit, setEdit] = useState(false);
  const [inspect, setInspect] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const [dateD, setDateD] = useState(currentDate);
  const [destinataire, setDestinataire] = useState("");
  const [obj, setObj] = useState("");
  const [img, setImg] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");

  useEffect(() => {
    const extractYearsFromDates = () => {
      const yearSet = new Set();
      departList.forEach((item) => {
        const year = new Date(item.date_depart).getFullYear();
        yearSet.add(year);
      });
      setYears(Array.from(yearSet).sort((a, b) => a - b));
    };
    extractYearsFromDates();
  }, [departList]);

  const fetchDepart = async () => {
    try {
      const response = await axios.get(`http://localhost:8887/depart`, {
        params: { year: selectedYear },
      });
      setDepartList(response.data);
    } catch (error) {
      console.error("Error fetching depart:", error);
    }
  };

  const fetchYears = async () => {
    try {
      const response = await axios.get(`http://localhost:8887/depart/years`);
      setYears(response.data);
    } catch (error) {
      console.error("Error fetching years:", error);
    }
  };

  useEffect(() => {
    fetchDepart();
    fetchYears();
  }, [selectedYear]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return "";
    return date.toISOString().split("T")[0];
  };

  const getNumbr = (data) => {
    const currentYear = new Date().getFullYear();
    return data
      .filter(
        (item) => new Date(item.date_depart).getFullYear() === currentYear
      )
      .reduce(
        (max, item) =>
          item.num_dordre_depart > max ? item.num_dordre_depart : max,
        0
      );
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    const maxSize = 20 * 1024 * 1024; // 20MB

    if (selectedFile) {
      if (!allowedTypes.includes(selectedFile.type)) {
        alert(
          "Type de fichier invalide. Veuillez télécharger un fichier JPEG, PNG ou PDF."
        );
        event.target.value = null;
        setImg(null);
        setSelectedFileName("");
        return;
      }

      if (selectedFile.size > maxSize) {
        alert(
          "Le fichier est trop volumineux. La taille maximale est de 20 Mo."
        );
        event.target.value = null;
        setImg(null);
        setSelectedFileName("");
        return;
      }

      setImg(selectedFile);
      setSelectedFileName(selectedFile.name);
    }
  };

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  const departPost = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("dateD", dateD);
      formData.append("destinataire", destinataire);
      formData.append("obj", obj);

      if (img) {
        formData.append("file", img);
      }

      let response;
      if (add) {
        response = await axios.post("http://localhost:8887/depart", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else if (edit && selected) {
        formData.append("id", selected.num_dordre_depart);

        response = await axios.put(
          `http://localhost:8887/depart/${selected.num_dordre_depart}`,
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
      fetchDepart();
    } catch (error) {
      console.error("Erreur lors de la soumission :", error);
      alert("Échec de l'ajout/modification du document. Veuillez réessayer.");
    }
  };

  const deleteDepart = async (id) => {
    const isConfirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer ce départ ?"
    );
    if (!isConfirmed) return;

    try {
      await axios.delete(`http://localhost:8887/depart/${id}`);
      fetchDepart();
      alert("Départ supprimé avec succès.");
    } catch (error) {
      console.error("Erreur lors de la suppression :", error.message);
      alert("Erreur lors de la suppression. Veuillez réessayer.");
    }
  };

  useEffect(() => {
    fetchDepart();
  }, []);

  useEffect(() => {
    if (add) {
      setDateD(currentDate);
      setDestinataire("");
      setObj("");
      setImg(null);
      setSelectedFileName("");
      setEdit(false);
    } else if (edit) {
      setDateD(formatDateForInput(selected.date_depart));
      setDestinataire(selected.destinataire);
      setObj(selected.objet);
      setSelectedFileName(selected.file_path);
      setAdd(false);
    }
  }, [add, edit, selected]);

  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
  };

  const filteredDepartList = errorMessage
    ? departList
    : departList.filter((dp) => dp.objet.toLowerCase().includes(searchTerm));

  return (
    <main>
      <Header />
      <div className="depart">
        <div className="toper">
          <h1>Départ</h1>
          <div className="searcher">
            <input
              type="text"
              placeholder="Rechercher par objet"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <IoSearchCircle className="serico" />
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
            <select
              id="year-select"
              className="SelectAn"
              value={selectedYear}
              onChange={handleYearChange}
            >
              <option value="">Toutes les années</option>
              {years.length > 0 ? (
                years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  Aucune année disponible
                </option>
              )}
            </select>
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
          <form onSubmit={departPost}>
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
              {add ? "Ajouter un nouveau départ" : "Modifier le départ"}
              <span className="lmo9">
                N° Départ:{" "}
                {add ? (
                  <span className="nbr6">{getNumbr(departList) + 1}</span>
                ) : (
                  <span className="nbr6">{selected.num_dordre_depart}</span>
                )}
              </span>
            </h4>
            <div className="add-inputs">
              <div className="single-input">
                <input
                  type="date"
                  className="inp1"
                  value={dateD}
                  onChange={(e) => setDateD(e.target.value)}
                  required
                />
                <label className="lab1">Date de départ</label>
              </div>
              <div className="single-input">
                <input
                  type="text"
                  className="inp1"
                  placeholder=""
                  value={destinataire}
                  onChange={(e) => setDestinataire(e.target.value)}
                  required
                />
                <label className="lab">Destinataire</label>
              </div>
            </div>
            <div className="obj5">
              <textarea
                className={add ? "inp1 iop3" : "inp1 iop4"}
                placeholder="Objet"
                value={obj}
                onChange={(e) => setObj(e.target.value)}
              />
              <div className={add ? "inp6" : "inp7"}>
                {edit && selected.file_path ? (
                  <object
                    data={`http://localhost:8887${selected.file_path}`}
                    width="100%"
                    height={inspect ? "600px" : "100px"}
                  ></object>
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
                    <span className="loir55">Sélectionner un fichier</span>
                  </div>
                </label>
                {selectedFileName && (
                  <p className="opky5">
                    <span className="llmm6">{selectedFileName}</span>
                  </p>
                )}
                {edit && selected.file_path ? (
                  <button
                    type="button"
                    className="insp6"
                    onClick={() => setInspect(!inspect)}
                  >
                    {inspect ? "⩞" : "⩣"}
                  </button>
                ) : null}
              </div>
            </div>
            <div className="btns">
              <input
                type="submit"
                className="main-btn2"
                value={add ? "Ajouter" : "Modifier"}
              />
            </div>
          </form>
        ) : null}
        <div className="lists">
          <div className="columns">
            <span className="cl column0">Documents</span>
            <span className="cl column1">N° Départ</span>
            <span className="cl column2">Date de départ</span>
            <span className="cl column3">Destinataire</span>
            <span className="cl column4">Objet</span>
            <span className="cl column5">Actions</span>
          </div>

          {filteredDepartList.map((dp) => {
            return (
              <div className="columns" key={dp.num_dordre_depart}>
                <span className="cl column0">
                  {dp.file_path ? "1" : "- - -"}
                </span>
                <span className="cl column1">{dp.num_dordre_depart}</span>
                <span className="cl column2">{formatDate(dp.date_depart)}</span>
                <span className="cl column3">{dp.destinataire}</span>
                <span className="cl column4">{dp.objet}</span>
                <span className="cl column5 ui">
                  <button className="action a1">
                    <TbEditCircle
                      className="icon1"
                      onClick={() => {
                        setSelected(dp);
                        setEdit(true);
                      }}
                    />
                  </button>
                  <button className="action a2">
                    <RiDeleteBin2Fill
                      className="icon1"
                      onClick={() => deleteDepart(dp.num_dordre_depart)}
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

export default Depart;
