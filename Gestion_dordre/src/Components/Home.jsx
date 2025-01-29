import React from "react";
import "../Styles/Home.css";
import Footer from "./Footer";



const Home = () => {
  return (
    <div className="home">
      {/* Slider Section */}
      <div className="slider">
  <div className="slider-overlay">
    <h1>Bienvenue sur notre plateforme</h1>
    <p>Découvrez nos services professionnels et nos domaines d'expertise.</p>
  </div>
</div>
<div className="services">
  <h2>Nos Services</h2>
  <div className="service-cards">
    <div className="service-card">
      <i className="fas fa-inbox"></i> {/* Icône pour Service d'arrivée */}
      <h3>Service d'arrivée</h3>
      <p>Collecte tous les courriers physiques ou numériques provenant d'autres administrations, partenaires, ou particuliers.</p>
    </div>
    <div className="service-card">
      <i className="fas fa-paper-plane"></i> {/* Icône pour Service de départ */}
      <h3>Service de départ</h3>
      <p>Vérifie que les courriers sortants respectent les normes administratives et les expédie correctement.</p>
    </div>
    <div className="service-card">
      <i className="fas fa-archive"></i> {/* Icône pour Service d’archivage */}
      <h3>Service d'archivage</h3>
      <p>Classe et conserve tous les courriers (entrants et sortants) en format papier ou numérique pour un accès futur.</p>
    </div>
  </div>
</div>

      <section className="expertise">
        <h2>Nos domaines d'expertise</h2>
        <div className="expertise-list">
          <div className="expertise-item">
            <i className="fas fa-hospital"></i>
            <p>Hôpital</p>
          </div>
          <div className="expertise-item">
            <i className="fas fa-pills"></i>
            <p>Médicaments</p>
          </div>
          <div className="expertise-item">
            <i className="fas fa-user-md"></i>
            <p>Consultation</p>
          </div>
          <div className="expertise-item">
            <i className="fas fa-flask"></i>
            <p>Recherche</p>
          </div>
          <div className="expertise-item">
            <i className="fas fa-virus"></i>
            <p>Microbiologie</p>
          </div>
          <div className="expertise-item">
            <i className="fas fa-brain"></i>
            <p>Neurologie</p>
          </div>
          <div className="expertise-item">
            <i className="fas fa-heart"></i>
            <p>Cardiologie</p>
          </div>
          <div className="expertise-item">
            <i className="fas fa-eye"></i>
            <p>Ophtalmologie</p>
          </div>
          <div className="expertise-item">
            <i className="fas fa-tooth"></i>
            <p>Dentisterie</p>
          </div>
        </div>
      </section>

      <Footer/>
    </div>
  );
};

export default Home;