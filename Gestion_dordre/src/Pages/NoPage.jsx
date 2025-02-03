import { TbError404 } from "react-icons/tb";
import "../Styles/Not.css";

import Header from "../Components/Header";

function NoPage() {
  return (
    <main>
      <Header />
      <div className="out33">
        <TbError404 className="hhlo33" />
        <p>Cette page n'existe pas!</p>
      </div>
    </main>
  );
}

export default NoPage;
