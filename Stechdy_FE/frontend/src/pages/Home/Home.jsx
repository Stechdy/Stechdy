import React from "react";
import { useTranslation } from "react-i18next";
import "./Home.css";

const Home = () => {
  const { t } = useTranslation();

  return (
    <div className="home">
      <h1>{t("home.welcome")}</h1>
      <p>{t("home.subtitle")}</p>
    </div>
  );
};

export default Home;
