/* 
//Loads single-spa instructions and configs to start application
System.import("@he_urbreath/kpim-gui");

System.import(window.location.origin + "/environment/env.js");

window.addEventListener("message", (event) => {
     console.log("Messaggio ricevuto", event.data);
     
  const data = event.data;

  if (data.embedded) {
    console.log("App embedded. Ricevuto token:", data.accessToken);

    // Salva i token in sessionStorage
    sessionStorage.setItem('token', data.accessToken);
    sessionStorage.setItem('refreshToken', data.refreshToken);

    // Salva lingua e stato menu se servono
    if (data.language) {
      sessionStorage.setItem('language', data.language);
    }
    if (data.sideMenu) {
      sessionStorage.setItem('sideMenu', data.sideMenu);
    }
  }
});

axios.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});


//Hide the application Welcome Loader 
function hideWelcomeLoader() {
    let loader = document.getElementById("loaderApp")
    loader.classList.add("welcome-off")
    loader.classList.remove("welcome-on")
}
//Listen to the Hide-Welcome-Loader event sent by any microfrontend
document.addEventListener("hide-welcome-loader",
    function () {
        hideWelcomeLoader();
    }
);

//Listen to the Mounted event sent by Auth mf and can redirect to other page or simply hide welcome-loader
document.addEventListener("mf-auth-mounted",
    function () {
        if (sessionStorage.getItem("first-login") == null || window.location.pathname == "/") {
            history.pushState({}, '', "/kpis");
        } else {
            hideWelcomeLoader();
        }
    }
); */

function loadApp() {
    System.import("@he_urbreath/kpim-gui");
    System.import(window.location.origin + "/environment/env.js");
}

// -----------------------------
// Patch globale per fetch e XMLHttpRequest
// -----------------------------
function patchGlobalHttp() {
    const token = sessionStorage.getItem("token");
    const internalOrigins = [
        window.location.origin, // il dominio corrente del microfrontend
        "https://kpim-mid-dev.urbreath.tech" // eventuali altri domini interni
    ];

    // Patch fetch
    if (window.fetch) {
        const originalFetch = window.fetch;
        window.fetch = function(input, init = {}) {
            init.headers = init.headers || {};
            try {
                const url = typeof input === "string" ? input : input.url;
                if (token && internalOrigins.some(origin => url.startsWith(origin))) {
                    init.headers["Authorization"] = `Bearer ${token}`;
                }
            } catch (e) {
                console.warn("Errore nel patch fetch:", e);
            }
            return originalFetch(input, init);
        };
    }

    // Patch XMLHttpRequest
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
        this._url = url; // memorizzo l'URL per il send
        originalOpen.apply(this, arguments);
    };

    const originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function(body) {
        if (token && internalOrigins.some(origin => this._url.startsWith(origin))) {
            this.setRequestHeader("Authorization", `Bearer ${token}`);
        }
        originalSend.apply(this, arguments);
    };
}

function fixLayoutWhenEmbedded() {
  const root = document.querySelector("main");
  if (root && root.classList.contains("reduced")) {
    root.classList.remove("reduced");
  }
}

// -----------------------------
// Embedded or standalone
// -----------------------------
const isEmbedded = window !== window.parent;

if (isEmbedded) {
  document.body.classList.add("hide-sidebar");
  document.documentElement.classList.add("embedded-mode");
  const main = document.querySelector("main")
main?.classList.remove("expanded")
main?.classList.remove("reduced")
  
  // Osserva quando single-spa monta la sidebar
  const hideSidebar = () => {
    const el = document.querySelector('#single-spa-application\\:\\@digital-enabler\\/sidebar');
    if (el) {
      el.style.display = "none";
      return true;
    }
    return false;
  };
  fixLayoutWhenEmbedded();

  // Prova subito
  if (!hideSidebar()) {
    // Se non esiste ancora, osserva il DOM
    const observer = new MutationObserver(() => {
      if (hideSidebar()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

    window.addEventListener("message", (event) => {
        const data = event.data;
        if (data.embedded && data.accessToken) {
            sessionStorage.setItem('token', data.accessToken);
            sessionStorage.setItem('refreshToken', data.refreshToken || '');
            if (data.language) sessionStorage.setItem('language', data.language);
            if (data.sideMenu) sessionStorage.setItem('sideMenu', data.sideMenu);

            patchGlobalHttp(); // patch prima di caricare MF
            loadApp();
        }
    });
} else {
    // Standalone: patch e carica subito
    patchGlobalHttp();
    loadApp();
}

// -----------------------------
// Loader
// -----------------------------
function hideWelcomeLoader() {
    const loader = document.getElementById("loaderApp");
    loader?.classList.add("welcome-off");
    loader?.classList.remove("welcome-on");
}
document.addEventListener("hide-welcome-loader", () => hideWelcomeLoader());

// -----------------------------
// Mounted Event
// -----------------------------
document.addEventListener("mf-auth-mounted", () => {
    console.log("[gui-root] mf-auth-mounted, pathname:", window.location.pathname);
    console.log("[gui-root] first-login:", sessionStorage.getItem("first-login"));
    const path = window.location.pathname.replace(/\/+$/, "");
    const publicKpiPrefix = "/public/kpi/";

    const isPublicKpiRoute =
        path === "/public/kpis" ||
        (path.startsWith(publicKpiPrefix) &&
            path.slice(publicKpiPrefix.length).length > 0 &&
            !path.slice(publicKpiPrefix.length).includes("/"));

    if (isPublicKpiRoute) {
        hideWelcomeLoader();
        return;
    }

    if (!sessionStorage.getItem("first-login") || path === "") {
        history.pushState({}, "", "/kpis");
    } else {
        hideWelcomeLoader();
    }
});
