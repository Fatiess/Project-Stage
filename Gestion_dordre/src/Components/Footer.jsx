import React from 'react';
import '../Styles/Footer.css';

import img from "../Images/vv.png";


const Footer = () => {
  return (  
    <footer className="footer">
      <img src={img} alt="Logo" style={{ width: "90px", height: "90px" }} />
      <p>Notre mission est de contribuer à l'efficacité des services de santé à travers une gestion optimale de l'information et des documents</p>

      <div className="social-icons">
      <span className="social-text">Suivez-nous sur Facebook pour découvrir nos dernières nouveautés !</span>
        <a href="https://web.facebook.com/DMSOUARZAZATE" target="_blank" rel="noopener noreferrer">
          <i className="fab fa-facebook"></i>
        </a>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2025 Délégation Provinciale de La Santé Ouarzazate. Tous droits réservés.</p>
      </div>
    </footer>
  );
};

export default Footer;