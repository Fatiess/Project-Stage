import { FaCircleExclamation } from "react-icons/fa6";

import "../Styles/Not.css";

import Header from "../Components/Header";

function NotAutor() {
  return (
    <main>
      <Header />
      <div className="out33">
        <FaCircleExclamation className="hhlo33" />
        <p>Vous n'êtes pas autorisé à accéder à cette page.</p>
      </div>
    </main>
  );
}

export default NotAutor;
