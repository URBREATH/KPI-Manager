import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export function startMeasureTour(t) {
  const driverObj = driver({
    showProgress: true,
    allowClose: true,
    nextBtnText: t("tour.next"),
    prevBtnText: t("tour.back"),
    doneBtnText: t("tour.done"),

    steps: [
      {
        popover: {
          title: t("tour.measure.title"),
          description: t("tour.measure.intro"),
        },
      },
      {
        element: ".tour-context",
        popover: {
          title: t("tour.context.title"),
          description: t("tour.context.desc"),
        },
      },
      {
        element: ".tour-name",
        popover: {
          title: t("tour.name.title"),
          description: t("tour.name.desc"),
        },
      },
      {
        element: ".tour-type",
        popover: {
          title: t("tour.type.title"),
          description: t("tour.type.desc"),
        },
      },
      {
        element: ".tour-description",
        popover: {
          title: t("tour.description.title"),
          description: t("tour.description.desc"),
        },
      },
      {
        element: ".tour-method",
        popover: {
          title: t("tour.method.title"),
          description: t("tour.method.desc"),
        },
      },
      {
        element: ".tour-protocol",
        popover: {
          title: t("tour.protocol.title"),
          description: t("tour.protocol.desc"),
        },
      },
      {
        element: ".tour-url",
        popover: {
          title: t("tour.url.title"),
          description: t("tour.url.desc"),
        },
      },
      {
        element: ".tour-jsonpath",
        popover: {
          title: t("tour.mapping.title"),
          description: t("tour.mapping.desc"),
        },
      },
      {
        element: ".tour-private",
        popover: {
          title: t("tour.security.title"),
          description: t("tour.security.desc"),
        },
      },
      {
        element: ".tour-auth",
        popover: {
          title: t("tour.auth.title"),
          description: t("tour.auth.desc"),
        },
      },
      {
        popover: {
          title: t("tour.end.title"),
          description: t("tour.end.desc"),
        },
      },
    ],
  });

  driverObj.drive();
}
