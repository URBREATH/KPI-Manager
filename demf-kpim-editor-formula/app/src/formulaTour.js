import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export function startFormulaTour(t) {
  const driverObj = driver({
    showProgress: true,
    allowClose: true,
    nextBtnText: t("tour.next"),
    prevBtnText: t("tour.back"),
    doneBtnText: t("tour.done"),
    steps: [
      {
        element: ".tour-measures-list",
        popover: {
          title: t("tour.measures-list.title"),
          description: t("tour.measures-list.desc"),
        },
      },
      {
        element: ".tour-formula",
        popover: {
          title: t("tour.formula.title"),
          description: t("tour.formula.desc"),
        },
      },
      {
        element: ".tour-validate",
        popover: {
          title: t("tour.validate.title"),
          description: t("tour.validate.desc"),
        },
      },
      {
        element: ".tour-schedule",
        popover: {
          title: t("tour.schedule.title"),
          description: t("tour.schedule.desc"),
        },
      },
      {
        element: ".tour-target",
        popover: {
          title: t("tour.target.title"),
          description: t("tour.target.desc"),
        },
      },
      {
        element: ".tour-continue-formula",
        popover: {
          title: t("tour.continue-formula.title"),
          description: t("tour.continue-formula.desc"),
        },
      },
    ],
  });

  driverObj.drive();
}
