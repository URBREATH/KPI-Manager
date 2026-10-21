(function (window) {
    window["env"] = window["env"] || {};

    // Environment variables

    // Developer mode (true string or empty string)
    window["env"]["developerMode"] = "${DEVELOPER_MODE}";

    // Configs storage URL (default: https://raw.githubusercontent.com/digital-enabler/UI-Configs/main)
 


    window["env"]["storeUrl"] =  "https://raw.githubusercontent.com/URBREATH/UI-Configs-kpim/localSettingsRita";

    // Tenant name (default: dev  -  if developerMode is true)
    window["env"]["tenantName"] = "${TENANT_NAME}";

    // Realm name (by default the tenantName variable value)
    window["env"]["realmName"] = "${REALM_NAME}";
})(this);