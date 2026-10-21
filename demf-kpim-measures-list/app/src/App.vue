<template>
  <v-layout>
    <v-main :class="containerState">
      <v-container id="main-container" :fluid="true">
        <!-- Toolbar -->
        <v-app-bar id="upp-bar" color="white" :flat="true" class="px-4">
          <div class="d-flex align-center">
            <v-icon color="secondary" class="mr-2" size="large"> mdi-ruler </v-icon>
            <div class="text-secondary text-h5 font-weight-bold">
              {{ $t("labels.page-title") }}
            </div>
          </div>

          <v-spacer></v-spacer>
          <v-row class="d-flex justify-end align-center">
            <v-col
              cols="12"
              sm="12"
              md="10"
              lg="8"
              xl="6"
              class="d-flex align-center align-self-center"
            >
              <v-text-field
                v-model="search"
                class="mr-4 align-self-center"
                density="compact"
                :loading="false"
                variant="solo"
                type="text"
                :label="$t('labels.search')"
                :append-inner-icon="!search ? 'mdi-magnify' : ''"
                :clearable="true"
                :single-line="true"
                hide-details
              ></v-text-field>
            </v-col>
          </v-row>
          <!--Button-Dialog-Create-->
          <v-btn
            color="secondary"
            variant="elevated"
            class="text-white ml-2"
            @click="createMeasure()"
          >
            {{ $t("labels.create-measure") }}
          </v-btn>
        </v-app-bar>
        <!-- Table -->
        <v-card tile :flat="true">
          <v-data-table
            v-model="selected"
            :headers="headers"
            :items="measures"
            :single-select="singleSelect"
            :sort-by="[{ key: 'name', order: 'asc' }]"
            show-select
            :search="search"
            :loading="loader"
            hover
          >
            <!-- Actions Toolbar over table -->
            <template v-slot:[`header.name`]>
              <div class="d-inline-flex justify-start align-center">
                <v-tooltip location="top">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      icon="mdi-refresh"
                      variant="plain"
                      color="secondary"
                      v-bind="props"
                      @click="getMeasuresList()"
                    >
                    </v-btn>
                  </template>
                  <span>{{ $t("labels.refresh") }}</span>
                </v-tooltip>

                <v-tooltip location="top">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      :class="showDeleteIcon"
                      icon="mdi-delete"
                      variant="plain"
                      color="secondary"
                      v-bind="props"
                      @click="deleteMultipleMeasure()"
                    >
                    </v-btn>
                  </template>
                  <span>{{ $t("labels.delete") }}</span>
                </v-tooltip>
              </div>
            </template>
            <!--END Actions Toolbar over table -->

            <!-- NO DATA template -->
            <template v-slot:[`no-data`]>
              <div
                style="
                  display: flex;
                  flex-direction: column;
                  justify-content: center;
                  align-items: center;
                "
              >
                <img
                  :src="measuresListConfig.storageImgs + '/commons/watermark-comic.png'"
                  width="200"
                />
                <p class="text-black font-weight-bold text-h6 text-uppercase mb-3">
                  {{ $t("strings.no-measures") }}
                </p>
                <p>{{ $t("strings.please-add-measure") }}</p>
              </div>
            </template>

            <!-- Table's row definition -->
            <template v-slot:[`item.name`]="{ item }">
              <v-tooltip location="top">
                <template v-slot:activator="{ props }">
                  <v-list-item
                    lines="two"
                    class="px-0 py-2 no-highlight"
                    v-bind="props"
                    @click="routeToMeasure(item)"
                  >
                    <v-list-item-title class="font-weight-medium" :search="search">
                      {{ item.name }}
                    </v-list-item-title>
                    <v-list-item-subtitle
                      :search="search"
                      class="d-inline-block text-truncate"
                      style="max-width: 150px"
                    >
                      {{ item.source.uri }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </template>
                <span>{{ $t("labels.open") }} {{ item.name }}</span>
              </v-tooltip>
            </template>
            <template v-slot:[`item.type`]="{ item }">
              {{ item.source.type }}
            </template>
            <template v-slot:[`item.description`]="{ item }">
              {{ item.description }}
            </template>

            <template v-slot:[`item.functions`]="{ item }">
              <v-spacer></v-spacer>
              <v-menu location="bottom left">
                <template v-slot:activator="{ props }">
                  <v-btn icon="mdi-dots-vertical" variant="flat" v-bind="props"> </v-btn>
                </template>
                <v-list dense>
                  <v-list-item @click="duplicateMeasureProject(item)">
                    <template v-slot:append>
                      <v-icon color="primary">mdi-content-duplicate</v-icon>
                    </template>
                    <v-list-item-title>{{ $t("labels.duplicate") }}</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="openShareForm(item)">
                    <template v-slot:append>
                      <v-icon color="primary">mdi-share</v-icon>
                    </template>
                    <v-list-item-title>{{ $t("labels.share") }}</v-list-item-title>
                  </v-list-item>

                  <v-list-item @click="deleteMeasure(item)">
                    <template v-slot:append>
                      <v-icon color="primary">mdi-delete</v-icon>
                    </template>
                    <v-list-item-title>{{ $t("labels.delete") }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </template>

            <!-- END Table's row definition -->
          </v-data-table>
        </v-card>
        <!-- Share Dialog -->
        <shareDialog
          :measureName="shareItem.name"
          :id="shareItem.id"
          :dialogState="shareDialogActive"
          @close-dialog="closeShareForm()"
          :realm="realm"
          :measuresListConfig="measuresListConfig"
        ></shareDialog>
        <!--Dialog Delete-->
        <v-dialog v-model="dialogDelete" max-width="500px">
          <v-card>
            <v-toolbar :flat="true" color="secondary">
              <v-toolbar-title class="text-white">
                {{ $t("labels.delete") }}
              </v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn color="white" icon="mdi-close" @click="closeDeleteMeasure"> </v-btn>
            </v-toolbar>
            <v-card-text>
              <p class="text-h6">
                {{ $t("strings.delete-measure-question", numDelete) }}
              </p>
              <p>
                {{ $t("strings.delete-measure-disclaimer-part1") }}
              </p>
              <p>
                {{ $t("strings.delete-measure-disclaimer-part2") }}
              </p>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary darken-1" variant="text" @click="closeDeleteMeasure">
                {{ $t("labels.cancel") }}
              </v-btn>
              <v-btn color="secondary darken-1" variant="text" @click="deleteConfirm">
                {{ $t("labels.delete") }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <!--Dialog Duplicate-->
        <v-dialog v-model="dialogDuplicate" max-width="500px">
          <v-form ref="duplicateForm" v-model="validationDuplicate">
            <v-card>
              <v-toolbar :flat="true" color="secondary">
                <v-toolbar-title class="text-white">
                  {{ $t("labels.duplicate") }}
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn color="white" icon="mdi-close" @click="closeDuplicateMeasure"> </v-btn>
              </v-toolbar>

              <v-card-text>
                <v-text-field
                  v-model="editedItem.name"
                  :counter="20"
                  :rules="nameRules"
                  :label="$t('labels.name')"
                  required
                  variant="outlined"
                  density="compact"
                  hint="Insert a new name for the measure"
                  persistent-hint
                ></v-text-field>
                <p class="mt-4 text-caption text-primary">
                  {{ $t("strings.duplicate-advice") }}
                </p>
              </v-card-text>
              <v-divider></v-divider>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary darken-1" variant="text" @click="closeDuplicateMeasure">
                  {{ $t("labels.cancel") }}
                </v-btn>
                <v-btn
                  :disabled="!this.validationDuplicate"
                  color="secondary darken-1"
                  variant="text"
                  @click="duplicateMeasureConfirm"
                >
                  {{ $t("labels.duplicate") }}
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-form>
        </v-dialog>

        <v-overlay :value="overlay" z-index="100">
          <v-progress-circular indeterminate size="64"></v-progress-circular>
        </v-overlay>
      </v-container>
    </v-main>
  </v-layout>
</template>

<script>
import events from "@/mixins/events.js";
import utils from "@/mixins/utils.js";
import version from "../version";
import MeasuresList from "@/mixins/MeasuresList.js";
import shareDialog from "@/components/shareDialog.vue";
export default {
  name: "MeasuresList",
  mixins: [utils, events, MeasuresList],
  props: ["measuresListConfig", "realm"],

  components: {
    shareDialog,
  },
  data: function () {
    return {
      appVersion: version,
      loader: false,
      overlay: false,
      containerState: "expanded",
      search: "",
      dialogDelete: false,
      singleSelect: false,
      dialogDuplicate: false,
      validationDuplicate: true,
      selected: [],
      numDelete: 1,
      showDeleteIcon: "d-none",
      headers: [
        {
          text: "",
          align: "start",
          sortable: true,
          key: "name",
        },
        {
          text: "",
          align: "center",
          sortable: false,
          key: "type",
        },
        {
          text: "",
          align: "start",
          sortable: false,
          key: "description",
        },
        {
          text: "",
          align: "end",
          sortable: false,
          key: "functions",
        },
      ],
      measures: [],
      nameRules: [
        (value) => {
          if (value) return true;
          return this.$t("strings.name-required");
        },
        (value) => {
          if (value?.length <= 20) return true;
          return this.$t("strings.name-less-20-chars");
        },

        (v) => {
          //check if name already exists
          return !this.validName(v) || this.$t("errors.measure-name-exists");
        },
      ],

      shareItem: {},
    };
  },

  mounted() {
    console.log("Mounted demf-measures-list v", this.appVersion);
    this.getMeasuresList();

    document.addEventListener("language-localstorage-changed", (event) => {
      this.setLocale(event.detail.storage);
    });

    this.containerState = localStorage.getItem("sidenav") === "opened" ? "reduced" : "expanded";

    document.addEventListener("sidenav-localstorage-changed", (event) => {
      this.containerState = event.detail.storage === "opened" ? "reduced" : "expanded";
    });

    //Cleans sessionStorage from previous kpi/measure data
    sessionStorage.removeItem("measure");
    sessionStorage.removeItem("kpi");
  },
  methods: {
    validName(name) {
      return this.measures.some(
        (measure) => measure.name.trim().replace(/\s/g, "") === name.trim().replace(/\s/g, "")
      );
    },
  },
  watch: {
    selected() {
      this.showDeleteIcon = this.selected.length > 0 ? "d-block" : "d-none";
    },
  },
};
</script>
<style scoped>
.table-no-data {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
main.expanded {
  margin-left: 56px;
}
main.expanded header#upp-bar {
  margin-left: 56px;
  width: calc(100% - 56px) !important;
}
main.reduced {
  margin-left: 256px;
}
main.reduced header#upp-bar {
  margin-left: 256px;
  width: calc(100% - 256px) !important;
}
#main-container {
  height: calc(100vh - 104px);
  overflow-y: auto;
  background-color: white;
}
.no-highlight :deep(.v-list-item__overlay) {
  background: transparent !important;
}
</style>
