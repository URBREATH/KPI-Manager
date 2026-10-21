import { registerApplication, start } from "single-spa";
import {
  constructApplications,
  constructRoutes,
  constructLayoutEngine,
} from "single-spa-layout";
import microfrontendLayout from "./microfrontend-layout.html";

//Exstract tool name from package.json
const tool_name = process.env.npm_package_name.split("/")[1].split("-")[0];
//Show project version on console
console.log(
  tool_name.toUpperCase() + " Root-Config v",
  process.env.npm_package_version
);

const storeUrl = window.env.storeUrl;

console.log("Storage::: ", storeUrl);
let tenant =
  window.env.developerMode === "true"
    ? "dev"
    : window.location.hostname.split(/\./g)[1];

if (window.env.tenantName) tenant = window.env.tenantName;
const tenantStore = "mf-" + tenant;
console.log("Tenant::: ", tenant);

let realm = window.env.realmName || tenant;
console.log("Realm::: ", realm);

let realmConfigs = {};
let toolConfigs = {};
let arrayPromises = [];

//Retrieve the main config file related to the Realm/Tenant used
const mainConfigPromise = new Promise((resolve, reject) => {
  resolve(
    fetch(storeUrl + "/" + tenantStore + "/config.json").then((realm) => {
      if (!realm.ok) {
        throw new Error("HTTP error " + realm.status);
      }
      return realm.json();
    })
  );
  reject(function (error) {
    console.error("Error: ");
    console.error(error); // Stacktrace
  });
});
mainConfigPromise
  .then(function (config) {
    realmConfigs = config;
    //Create an object with common and specific config files urls needed
    toolConfigs = Object.assign(
      realmConfigs.configs.common,
      realmConfigs.configs[tool_name]
    );
  })
  .then(function () {
    let count = 0;
    //Retrieve all config files related to this tool
    Object.entries(toolConfigs).forEach(([_key, value]) => {
      let confUrl = storeUrl + "/" + tenantStore + value;
      arrayPromises[count] = new Promise((resolve, _reject) => {
        fetch(confUrl)
          .then((response) => {
            if (!response.ok) {
              throw new Error("HTTP error " + response.status);
            }
            return response.json();
          })
          .then((data) => {
            resolve(data);
          });
      });
      count++;
      // Activate this console to view configuration files loaded
      console.log(count, " - ", value);
    });

    //Resolves all previous Promises and init the operations to start the Aplication
    let mfConfigArray = [];
    Promise.all(arrayPromises).then((results) => {
      results.forEach((result) => {
        mfConfigArray[result.mf] = result;
      });
      //Props to share with MFs (see microfrontend-layout.html)
      let data = {
        props: {
          palette: realmConfigs.palette,
          realm: tenant,
          authConfig: mfConfigArray["Auth"],
          footerConfig: mfConfigArray["Footer"],
          sidebarConfig: mfConfigArray["Sidebar"],
          eventHandlerConfig: mfConfigArray["Event Handler"],
          kpisListConfig: mfConfigArray["KPIs List"],
          kpimEditorConfig: mfConfigArray["KPIM Editor"],
          measuresListConfig: mfConfigArray["Measures List"],
          kpimMeasureConfig: mfConfigArray["KPIM Measure"],
          compareConfig: mfConfigArray["KPIM Compare"],
          publishKpiConfig: mfConfigArray["KPIM Publish"]
        },
      };
      //Code to create and mount all MF for this tool
      const routes = constructRoutes(microfrontendLayout, data);
      const applications = constructApplications({
        routes,
        loadApp({ name }) {
          return System.import(name);
        },
      });
      const layoutEngine = constructLayoutEngine({
        routes,
        applications,
      });

      applications.forEach(registerApplication);
      layoutEngine.activate();
      // Start Single-SPA with the urlRerouteOnly option set to true. Fix VueRoute warning in Vuejs3.
      start({
        // urlRerouteOnly: true,
      });
    });
  });
