<template>
  <!-- Toolbar -->
  <v-app-bar id="upp-bar" color="white" :flat="true" class="px-4">
  <div class="d-flex align-center">
      <v-icon color="primary" class="mr-2" size="large"> mdi-gauge </v-icon>
      <a class="text-primary text-h5 text-decoration-none font-weight-light" href="/kpis">
        {{ $t("labels.page-title") }}
      </a>
      <v-icon>mdi-chevron-right</v-icon>
      <v-tooltip bottom color="primary" class="hidden-lg-and-up">
        <template v-slot:activator="{ props }">
          <div
            id="mashup_title"
            class="text-primary text-h5 font-weight-bold text-truncate"
            v-bind="props"
          >
            {{ kpi.name }}
          </div>
        </template>
        <span>{{ kpi.name }}</span>
      </v-tooltip>
    </div>
    <template v-slot:append>
      <v-responsive>
        <!--Dots Menu-->
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" icon="mdi-dots-vertical" flat density="comfortable"> </v-btn>
          </template>
          <v-list>
            <v-list-item @click.stop="deleteKpi()" :disabled="!kpiId">
              <v-list-item-title>
                <v-icon color="primary">mdi-delete</v-icon>
                <span class="ml-5">{{ $t("labels.delete") }}</span>
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-responsive>
    </template>
    <!--Dialog Delete-->
    <v-dialog v-model="dialogDelete" max-width="500px">
      <v-card>
        <v-toolbar flat color="secondary">
          <v-toolbar-title class="text-white">
            {{ $t("labels.delete") }}
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn color="white" icon @click="closeDeleteKpi">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <p class="text-h6">
            <span>
              {{ $t("strings.delete-kpi-question") }}
            </span>
          </p>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary darken-1" variant="text" @click="closeDeleteKpi">
            {{ $t("labels.cancel") }}
          </v-btn>
          <v-btn color="secondary darken-1" variant="text" @click="deleteKpiConfirm">
            {{ $t("labels.delete") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app-bar>
</template>

<script>
import events from "@/mixins/events.js";
import utils from "@/mixins/utils.js";
import axios from "axios";

export default {
  mixins: [utils, events],
  props: ["kpi", "realm", "apiUrl"],
  data: function () {
    return {
      loading: false,
      editedItem: null,
      dialogDelete: false,
    };
  },
  computed: {
    kpiId() {
      return this.kpi.id;
    },
  },
  methods: {
    // DELETE KPI
    deleteKpi() {
      this.editedItem = Object.assign({}, this.kpi);
      this.dialogDelete = true;
    },
    async deleteKpiConfirm() {
      this.loading = true;
      try {
        await axios.delete(
          this.apiUrl + "/" + this.realm + "/kpi/" + this.editedItem?.id,
          this.opts
        );
        // Emit the snackbar event
        this.$emit("snackbarEvent", true, this.$t("strings.kpi-deleted"));
        // Wait for a short delay (e.g., 1 second) to allow the snackbar to display
        await new Promise((resolve) => setTimeout(resolve, 1500));
        // Redirect to Home
        this.$router.push("/kpis");
      } catch (error) {
        this.setError(error, false);
        this.loading = false;
      } finally {
        this.loading = false;
      }
    },

    closeDeleteKpi() {
      this.dialogDelete = false;
    },
  },
};
</script>
