<template>
  <!-- Toolbar -->
  <v-app-bar id="upp-bar" color="white" :flat="true" class="px-4">
    <div class="d-flex align-center">
      <v-icon color="primary" class="mr-2" size="large"> mdi-ruler </v-icon>
      <a
        class="text-primary text-h5 text-decoration-none font-weight-light"
        href="/measures"
      >
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
            {{ measure.name ? measure.name : $t("strings.new-measure") }}
          </div>
        </template>
        <span>
          {{ measure.name ? measure.name : $t("strings.new-measure") }}
        </span>
      </v-tooltip>
    </div>
    <template v-slot:append>
      <v-responsive>
        <!--Dots Menu-->
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              icon="mdi-dots-vertical"
              flat
              density="comfortable"
            >
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click.stop="deleteMeasure()" :disabled="!measureId">
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
        <v-card-title
          class="d-flex justify-space-between align-center bg-secondary"
        >
          <div class="text-h5">
            {{ $t("labels.delete") }}
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="closeDeleteMeasure"
          ></v-btn>
        </v-card-title>
        <v-divider class=""></v-divider>
        <v-card-text>
          <p class="text-h6">
            {{ $t("strings.delete-measure-question") }}
          </p>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary darken-1" text @click="closeDeleteMeasure">
            {{ $t("labels.cancel") }}
          </v-btn>
          <v-btn
            color="secondary darken-1"
            text
            @click="deleteMeasureConfirm"
            :loading="loading"
            :disabled="loading"
          >
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
  props: ["measure", "realm", "apiUrl"],
  data: function () {
    return {
      loading: false,
      dialogDelete: false,
    };
  },
  computed: {
    measureId() {
      return this.measure.id;
    },
  },
  methods: {
    // DELETE MEASURE
    async deleteMeasure() {
      this.dialogDelete = true;
    },
    async deleteMeasureConfirm() {
      this.loading = true;
      try {
        await axios.delete(
          this.apiUrl + "/" + this.realm + "/measures/" + this.measureId,
          this.opts,
        );
        // Emit the snackbar event
        this.$emit("snackbarEvent", true, this.$t("strings.measure-deleted"));
        // Wait for a short delay (e.g., 1 second) to allow the snackbar to display
        await new Promise((resolve) => setTimeout(resolve, 1500));
        // Redirect to Home
        this.$router.push("/measures");
      } catch (error) {
        this.setError(error, false);
        this.loading = false;
      } finally {
        this.loading = false;
      }
    },
    closeDeleteMeasure() {
      this.dialogDelete = false;
    },
  },
};
</script>
