<template>
  <div v-if="user != null">
    <v-menu
      v-model="menu"
      :close-on-content-click="false"
      min-width="460"
      location="right"
    >
      <template v-slot:activator="{ props }">
        <v-list class="bordered">
          <v-list-item class="px-2" v-bind="props">
            <template v-slot:prepend>
              <v-avatar color="white" size="36">
                <v-icon size="x-large" color="secondary">mdi-face-man</v-icon>
              </v-avatar>
            </template>
            <v-list-item-title v-if="user.username" class="white--text">
              {{ user.username }}
            </v-list-item-title>
            <v-list-item-subtitle class="white--text">
              {{ user.email }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </template>

      <v-card>
        <v-list>
          <v-list-item>
            <template v-slot:prepend>
              <v-avatar color="white" size="36">
                <v-icon size="x-large" color="secondary">mdi-face-man</v-icon>
              </v-avatar>
            </template>
            <v-list-item-title>
              <div v-if="user.firstname">
                {{ user.firstname }}
                &nbsp;
                {{ user.lastname }}
              </div>
            </v-list-item-title>
            <v-list-item-subtitle>{{ user.email }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>

        <v-divider></v-divider>

        <v-list :nav="true" density="compact">
          <v-list-item @click="openProfile">
            <template v-slot:prepend>
              <v-icon>mdi-account-circle</v-icon>
            </template>
            <v-list-item-title>
              {{ $t("labels.my-profile") }}
            </v-list-item-title>
          </v-list-item>

          <menu-item-locale></menu-item-locale>

          <v-list-item @click="logout">
            <template v-slot:prepend>
              <v-icon>mdi-logout</v-icon>
            </template>

            <v-list-item-title>{{ $t("labels.logout") }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>
  </div>
</template>

<script>
import MenuItemLocale from "./MenuItemLocale.vue";
import { mapGetters, mapActions } from "vuex";
import events from "@/mixins/events.js";
import utils from "@/mixins/utils.js";
import axios from "axios";
export default {
  name: "MenuUser",
  mixins: [events, utils],
  components: { MenuItemLocale },
  props: ["realm", "sidebarConfig"],
  data: () => ({
    menu: false,
    loggedUser: null,
  }),
  computed: {
    user() {
      return this.loggedUser;
    },
    apiUrl() {
      return this.sidebarConfig ? this.sidebarConfig.api : null;
    },
  },

mounted() {
  const path = window.location.pathname.replace(/\/+$/, "");

  const isPublicKpiRoute =
    path === "/public/kpis" ||
    /^\/public\/kpi\/[^/]+$/.test(path);

  console.log("[MenuUser] pathname:", path);
  console.log("[MenuUser] isPublicKpiRoute:", isPublicKpiRoute);

  if (isPublicKpiRoute) {
    console.log("[MenuUser] Skip getUserMe()");
    return;
  }

  this.getUserMe();
},

  methods: {
    ...mapGetters("loginModule", ["getState", "getUser"]),
    ...mapActions("loginModule", ["setState", "setUser"]),

    login(tenantId) {
      window.location.assign(this.apiUrl + "/" + tenantId + "/auth/login");
    },
    logout() {
      document.dispatchEvent(new CustomEvent("logout-callback"));
    },
    getUserMe() {
      axios
        .get(this.apiUrl + "/" + this.realm + "/me", {
          withCredentials: true,
        })
        .then((response) => {
          this.setUser(response.data);
          this.loggedUser = this.getState().user;
          localStorage.setItem("loggedUserId", response.data._id);
          if (localStorage.getItem("lang") == null) {
            this.setLocale(this.loggedUser.locale);
          } else {
            this.setLocale(localStorage.getItem("lang"));
          }
        })
        .catch((error) => {
          let logged = sessionStorage.getItem("first-login");
          if (logged == null || logged != "true") {
            this.setError(error, true, "error-login-callback");
          } else {
            this.setError(error, false);
          }
        });
    },
    //Open User IdM page profile
    openProfile() {
      window.open(this.apiUrl + "/" + this.realm + "/me/account/", "_blank");
    },
  },
};
</script>

<style scoped>
.v-list.bordered {
  border: 1px solid white;
  border-right: 0;
  border-left: 0;
}
</style>
