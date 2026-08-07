import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  fallbackLng: "zh-CN",
  resources: {
    en: {
      translation: {
        appName: "Copilot Knowledge",
        titleHomePage: "Knowledge Home",
      },
    },
    "zh-CN": {
      translation: {
        appName: "Copilot Knowledge",
        titleHomePage: "知识工作台",
      },
    },
  },
});
