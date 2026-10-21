<template>
  <v-layout>
    <v-app-bar
      id="sidebarToolbar"
      color="bg-white"
      dark
      :flat="true"
      class="pa-0"
    >
      <template v-slot:prepend>
        <v-toolbar-title v-if="!mini" class="px-1 white text-primary">
          <v-btn
            id="openSidebar"
            fab
            min-width="56"
            small
            depressed
            @click.stop="setDrawerSidebar"
            color="transparent"
          >
            <v-icon size="x-large" color="secondary">mdi-menu</v-icon>
          </v-btn>
          <v-img
            :src="imgsPath + logo"
            position="center right"
            class="ml-8"
            height="auto"
            width="216"
          />
        </v-toolbar-title>
        <v-toolbar-title v-else class="white text-primary text-center">
          <v-img
            :src="imgsPath + miniLogo"
            height="auto"
            width="52"
            position="center center"
          />
        </v-toolbar-title>
      </template>
    </v-app-bar>
    <v-btn
      id="closedSidebar"
      min-width="56px"
      variant="outlined"
      v-if="mini"
      depressed
      color="transparent"
      @click.stop="setDrawerSidebar"
    >
      <v-icon size="x-large" color="secondary">mdi-menu</v-icon>
    </v-btn>
    <v-navigation-drawer
      v-model="drawer"
      id="sidebar"
      :permanent="true"
      class="bg-primary text-white"
      :style="
        mini
          ? 'transform: translateY(24px); height: calc(100% - 128px)'
          : 'height: calc(100% - 104px)'
      "
      height="calc(100% - 40px)"
      dark
      :rail="mini"
    >
      <v-list :nav="true" density="compact">
        <v-list-item
          v-for="item in items"
          :key="item.title"
          :link="true"
          @click="linkRoute(item.link)"
        >
          <template v-slot:prepend>
            <v-icon class="text-white">
              {{ item.icon }}
              <v-tooltip activator="parent" location="bottom">
                {{ $t(item.title) }}
              </v-tooltip>
            </v-icon>
          </template>

          <v-list-item-title class="text-white text-uppercase">
            {{ $t(item.title) }}
          </v-list-item-title>
        </v-list-item>
      </v-list>

      <div v-if="favorites?.enabled">
        <v-divider></v-divider>
        <p
          class="ma-3 text-white opacity"
          v-if="favoriteItems.length === 0 && !mini"
        >
          <small>{{ $t("strings.favorite-text-first") }}</small>
          <v-spacer class="ma-3"></v-spacer>
          <small>{{ $t("strings.favorite-text-second") }}</small>
        </p>
      </div>

      <v-list :nav="true" density="compact" v-if="favorites?.enabled">
        <v-list-item :key="item" v-for="item in favoriteItems">
          <template v-slot:prepend>
            <v-icon class="text-white">
              {{ item.icon }}
              <v-tooltip activator="parent" location="bottom">
                {{ $t(item.title) }}
              </v-tooltip>
            </v-icon>
          </template>

          <v-list-item-title
            :target="item.link"
            :to="item.link"
            :href="item.link"
            class="text-white text-uppercase no-decoration-link"
          >
            <router-link
              class="text-white text-decoration-none"
              :to="item.link"
              target="_blank"
            >
              {{ $t(item.title) }}
            </router-link>
          </v-list-item-title>
          <v-icon
            v-if="!mini"
            x-small
            class="remove-favorite"
            @click="removeFavorite(item)"
            >mdi-close
            <v-tooltip activator="parent" location="top right">
              <span>{{ $tc("labels.remove-favorite-tooltip") }}</span>
            </v-tooltip>
          </v-icon>
        </v-list-item>
      </v-list>

      <template v-slot:append>
        <MenuItemTools
          v-if="showServicesMenu"
          :jsonTools="sidebarConfig.jsonTools"
          :tenant="realm"
        ></MenuItemTools>
        <MenuUser :realm="realm" :sidebarConfig="sidebarConfig"></MenuUser>
      </template>
    </v-navigation-drawer>
    <v-overlay z-index="10" v-if="overlay" text>
      <div class="ma-5 text-center">
        <div class="ma-5">
          {{ $t("strings.overlay-text") }}
        </div>
        <v-btn color="info" @click="overlay = false"> OK </v-btn>
      </div>
    </v-overlay>
  </v-layout>
</template>

<script>
import utils from "@/mixins/utils.js";
import pkg from "../package.json";
import axios from "axios";
import MenuUser from "@/components/MenuUser";
import MenuItemTools from "@/components/MenuItemTools";

export default {
  name: "NavigationDrawer",
  mixins: [utils],
  components: {
    MenuUser,
    MenuItemTools,
  },
  props: ["realm", "sidebarConfig"],
  data() {
    return {
      appVersion: pkg.version,
      favoriteItems: [],
      mini: true,
      drawer: true,
      loggedin: false,
      overlay: false,
      windowWidth: window.outerWidth,
      orientationType: window.screen.orientation.type,
    };
  },
  mounted() {
    console.log("Mounted demf-sidebar v", this.appVersion);
    if (this.windowWidth <= 1024) {
      localStorage.setItem("sidenav", "closed");
      this.emitSidenavChange();
    }
    this.mini = localStorage.getItem("sidenav") !== "opened";
    window.onresize = () => {
      this.windowWidth = window.outerWidth;
    };
    this.overlay = this.$vuetify.display.thresholds.xs;
    this.getFavoriteServices();
    document.addEventListener("favorite-items-changed", () => {
      this.getFavoriteServices();
    });
  },
  watch: {
    mini(val) {
      localStorage.setItem("sidenav", val ? "closed" : "opened");
      this.emitSidenavChange();
    },
  },
  computed: {
    imgsPath() {
      return this.sidebarConfig ? this.sidebarConfig.storageImgs : null;
    },
    items() {
      const configuredLinks = this.sidebarConfig ? this.sidebarConfig.links || [] : [];
      return [
        ...configuredLinks,
        {
          title: "labels.public-kpis",
          icon: "mdi-eye",
          link: "/public/kpis",
        },
      ];
    },
    apiUrl() {
      return this.sidebarConfig ? this.sidebarConfig.api : null;
    },
    logo() {
      return this.sidebarConfig ? this.sidebarConfig.logo : null;
    },
    miniLogo() {
      return this.sidebarConfig ? this.sidebarConfig.miniLogo : null;
    },
    favorites() {
      return this.sidebarConfig ? this.sidebarConfig.favorites : null;
    },
    showServicesMenu() {
      return this.sidebarConfig ? this.sidebarConfig.showServicesMenu : null;
    },
  },
  methods: {
    setDrawerSidebar: function () {
      this.mini = !this.mini;
    },
    emitSidenavChange() {
      document.dispatchEvent(
        new CustomEvent("sidenav-localstorage-changed", {
          detail: {
            storage: localStorage.getItem("sidenav"),
          },
        }),
      );
    },
    removeFavorite(item, index) {
      axios
        .delete(this.apiUrl + "/favorites/" + item.sid, {
          withCredentials: true,
        })
        .then(() => {
          this.getFavoriteServices();
          this.favoriteItems.splice(index, 1);
        })
        .catch(() => {});
      document.dispatchEvent(
        new CustomEvent("favorite-item-removed", {
          detail: {
            favoriteItems: this.favoriteItems,
            favoriteItem: item,
          },
        }),
      );
    },
    getFavoriteServices() {
      if (this.favorites?.enabled) {
        axios
          .get(this.apiUrl + "/favorites", { withCredentials: true })
          .then((response) => {
            this.favoriteItems = response.data;
          })
          .catch(() => {});
      }
    },
    linkRoute(link) {
      if (link.includes("http")) {
        window.open(link, "_blank");
      } else {
        this.$router.push(link);
      }
    },
  },
};
</script>

<style scoped>
#sidebar #sidebarToolbar :deep(.v-toolbar__content),
#sidebar #sidebarToolbar :deep(.v-toolbar__extension) {
  padding: 0 !important;
}

#sidebarToolbar {
  z-index: 1004 !important;
}

.divider-left {
  width: 6%;
}

#sidebar :deep(.v-navigation-drawer__content) {
  transform: translateY(20px) !important;
}

.favorite-content {
  position: relative !important;
}
.no-decoration-link {
  text-decoration: none;
}

.favorite-title {
  white-space: normal;
}

.remove-favorite {
  position: absolute !important;
  right: 0;
  cursor: pointer;
  top: 25%;
}

.divider-middle {
  width: 9%;
}

.mini-divider-left {
  width: 27.5%;
}

.mini-divider-right {
  width: 27.5%;
}

.opacity {
  opacity: 0.6;
}

.v-icon {
  opacity: 1 !important;
}

.divider-right {
  width: 44.2%;
}

.icon-middle {
  vertical-align: middle;
}

.favorite-text {
  vertical-align: bottom;
  margin-left: 10px;
  margin-right: 5px;
  font-size: 0.8125rem;
  text-transform: uppercase;
}

#openSidebar {
  position: absolute;
  z-index: 1;
  left: 0;
  top: 15px;
}

#closedSidebar {
  position: absolute;
  z-index: 1;
  left: 0;
  top: 56px;
}
</style>
