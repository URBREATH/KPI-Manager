import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export function startKpiTour(t) {
  const driverObj = driver({
    showProgress: true,
    allowClose: true,
    nextBtnText: t("tour.next"),
    prevBtnText: t("tour.back"),
    doneBtnText: t("tour.done"),
    steps: [
      {
        element: ".tour-description",
        popover: {
          title: t("tour.description.title"),
          description: t("tour.description.desc"),
        },
      },
      {
        element: ".tour-map",
        popover: {
          title: t("tour.map.title"),
          description: t("tour.map.desc"),
        },
      },
       {
        element: ".tour-location-button",
        popover: {
          title: t("tour.location-button.title"),
          description: t("tour.location-button.desc"),
        },
      },
     
      {
        element: ".tour-measures",
        popover: {
          title: t("tour.measures.title"),
          description: t("tour.measures.desc"),
        },
      },
      {
        element: ".tour-continue",
        popover: {
          title: t("tour.continue.title"),
          description: t("tour.continue.desc"),
        },
      },
    ],
  });

  driverObj.drive();
}
