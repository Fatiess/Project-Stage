// Arrivee.jsx
import { useState, useEffect } from "react";
import axios from "axios";

import "../Styles/Arrivee.css";
import Header from "../Components/Header";

import { TbEditCircle } from "react-icons/tb";
import { RiDeleteBin2Fill } from "react-icons/ri";
import { IoSearchCircle } from "react-icons/io5";
import { RiUploadCloud2Fill } from "react-icons/ri";

// Fonction principale
function Arrivee() {
  const today = new Date();
  const currentDate = today.toISOString().split('T')[0];
  const [arriveeList, setArriveeList] = useState([]);
  const [years , setYears] = useState([]);


  const [selected, setSelected] = useState(null);
  const [add, setAdd] = useState(false);
  const [edit, setEdit] = useState(false);
  const [inspect, setInspect] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedYear,setSelectedYear] = useState("");

  

  const [dateA, setDateA] = useState(currentDate);
  const [dateL, setDateL] = useState("");
  const [exp, setExp] = useState("");
  const [num, setNum] = useState(0);
  const [obj, setObj] = useState("");

  const [img, setImg] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");

  useEffect(() => {
    const extractYearsFromDates = () => {
      // Create a Set to store unique years
      const yearSet = new Set();
  
      // Iterate through the arriveeList array
      arriveeList.forEach((item) => {
        // Extract the year from the date_darrivee property
        const year = new Date(item.date_darrivee).getFullYear();
  
        // Add the year to the Set
        yearSet.add(year);
      });
  
      // Convert the Set to an array, sort it, and update the state
      setYears(Array.from(yearSet).sort((a, b) => a - b));
    };
  
    extractYearsFromDates();
  }, [arriveeList]); // This useEffect runs whenever arriveeList changes


  // Fonction pour récupérer les données d'arrivée
  const fetcharrive = async () => {
    try {
      const response = await axios.get(`http://localhost:8082/arrivee`,{params:{year:selectedYear}});
      setArriveeList(response.data);
    } catch (error) {
      console.error("Error fetching arrive:", error);
    }
  };

  // Fonction pour récuperer les années distinctes

  const fetchYears = async () => {
    try {
      const response = await axios.get(`http://localhost:8082/arrivee/years`);
      setYears(response.data); // Stocker les années dans l'état
    } catch (error) {
      console.error("Error fetching years:", error);
    }
  };

  // Effet pour charger les données et les années au montage du composant
  useEffect(() => {
    fetcharrive();
    fetchYears();
  }, [selectedYear]);

  // Formatage de la date pour l'affichage
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  // Formatage de la date pour l'input de type date
  function formatDateForInput(dateString) {
    const date = new Date(dateString);
    if (isNaN(date)) return "";
    return date.toISOString().split("T")[0];
  }

  // Calcul du prochain numéro d'ordre
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

  // Gestion du changement de fichier
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    // Types autorisés et validation de la taille maximale
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    const maxSize = 20 * 1024 * 1024; // 20MB

    if (selectedFile) {
      if (!allowedTypes.includes(selectedFile.type)) {
        alert("Type de fichier invalide. Veuillez télécharger un fichier JPEG, PNG ou PDF.");
        event.target.value = null;
        setImg(null);
        setSelectedFileName("");
        return;
      }

      if (selectedFile.size > maxSize) {
        alert("Le fichier est trop volumineux. La taille maximale est de 20 Mo.");
        event.target.value = null;
        setImg(null);
        setSelectedFileName("");
        return;
      }

      setImg(selectedFile);
      setSelectedFileName(selectedFile.name);
    }
  };

  // Gestion du changement de année
  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };
  

  // Soumission du formulaire d'arrivée
  const arriveePost = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("dateA", dateA);
      formData.append("dateL", dateL);
      formData.append("exp", exp);
      formData.append("num", num);
      formData.append("obj", obj);

      // Ajouter le fichier s'il existe
      if (img) {
        formData.append("file", img);
      }

      let response;
      if (add) {
        // Nouvelle entrée
        const nextOrderNumber = getNumbr(arriveeList) + 1;
        formData.append("nbr", nextOrderNumber);

        response = await axios.post("http://localhost:8082/arrivee", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else if (edit && selected) {
        // Modification d'une entrée existante
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
      console.error("Erreur lors de la soumission :", error);
      alert("Échec de l'ajout/modification du document. Veuillez réessayer.");
    }
  };


  // Suppression d'une arrivée
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

  // Effet pour charger les données au montage du composant
  useEffect(() => {
    fetcharrive();
  }, []);

  // Effet pour réinitialiser les champs du formulaire
  useEffect(() => {
    if (add) {
      setDateA(currentDate);
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

  // Gestion du changement de la recherche
  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase(); // Convertir en minuscules pour une recherche insensible à la casse
    setSearchTerm(value);
  };
  
  // Filtrer les résultats en fonction de la recherche
  const filteredArriveeList = errorMessage
    ? arriveeList
    : arriveeList.filter((ar) =>
        ar.num_dordre_arrivee.toString().includes(searchTerm) || // Recherche par numéro d'ordre
        ar.objet.toLowerCase().includes(searchTerm) // Recherche par objet
      );
  


  return (
    <main>
      <Header />
      <div className="arrivee">
        <div className="toper">
          <h1>Arrivee</h1>
          <div className="searcher">
            <input
              type="text"
              placeholder="Rechercher par N° d'ordre"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <IoSearchCircle className="serico" />
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
            <select id="year-select" className="SelectAn" value={selectedYear} onChange={handleYearChange}>
              <option value="">Toutes les années</option>
                {years.length > 0 ? (
              years.map((year) => (
            <option key={year} value={year}>{year}</option>
            ))
            ) : (
            <option value="" disabled>Aucune année disponible</option>
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
              {add ? "Ajouter une nouvelle arrivée" : "Modifier l'arrivée"}
              <span className="lmo9">
                N° D'arrivvee:{" "}
                {add ? (
                  <span className="nbr6">{getNumbr(arriveeList) + 1}</span>
                ) : (
                  <span className="nbr6">{selected.num_dordre_arrivee}</span>
                )}
              </span>
            </h4>
            <div className="add-inputs">
              <div className="single-input">
                <input
                  type="date"
                  className="inp1"
                  value={dateA}
                  onChange={(e) => setDateA(e.target.value)}
                />
                <label className="lab1">Date d'arrivée</label>
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
                placeholder="Objet"
                value={obj}
                onChange={(e) => setObj(e.target.value)}
              />
              <div className={add ? "inp6" : "inp7"}>
                {edit && selected.file_path ? (
                  <object
                    data={`http://localhost:8082${selected.file_path}`}
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
                  <p>
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
            <span className="cl column1">N° d'ordre</span>
            <span className="cl column2">Date d'ordre</span>
            <span className="cl column3">Date de lettre</span>
            <span className="cl column">N° de lettre</span>
            <span className="cl column5">Expéditeur</span>
            <span className="cl column6">Objet</span>
            <span className="cl column7">Actions</span>
          </div>

          {filteredArriveeList.map((ar) => {
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
                <span className="cl column">{ar.numero_lettre}</span>
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