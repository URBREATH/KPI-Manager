console.log("**** Load Import Map ****");

const storeUrl = window.env.storeUrl;

let tenant =
  window.env.developerMode === "true"
    ? "dev"
    : window.location.hostname.split(/\./g)[1];

let fixedTenant = window.env.tenantName;
if (fixedTenant) tenant = fixedTenant;

let script = document.createElement("script");
script.rel = "preload";
script.type = "systemjs-importmap";
script.src = storeUrl + "/mf-" + tenant + "/kpim/kpim-import-map.json";
//script.src ="https://raw.githubusercontent.com/URBREATH/UI-Configs-kpim/main/mf-dev/kpim/kpim-import-map.json";
 

document.getElementsByTagName("head")[0].appendChild(script);

console.log("ImportMap:::", script.src);
