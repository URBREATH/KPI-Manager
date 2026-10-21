<template>
  <v-layout>
    <v-main :class="containerState">
      <v-container ref="mainContainerFormula" id="main-container-formula" :fluid="true">
        <v-card id="card_formula" class="mx-auto d-flex flex-column" flat height="100%">
          <v-card-text class="pa-1">
            <v-row>
              <!-- Measure/KPI list -->
              <v-col cols="6">
                <v-card :height="this.containerHeight">
                  <v-toolbar :flat="true" color="primary">
                    <v-toolbar-title class="text-white">
                      {{ $t("labels.kpi/measures") }}

                      <div class="text-caption">
                        {{ $t("strings.kpi/measures-hint") }}
                      </div>
                    </v-toolbar-title>
                  </v-toolbar>
                  <v-virtual-scroll
                    :height="300"
                    class="pa-0 tour-measures-list"
                    :items="this.sessionItem.definition.selected"
                    :item-height="40"
                  >
                    <template v-slot="{ item }">
                      <v-list-item class="pa-1 border-b-sm">
                        <v-list-item-title>
                          <div
                            draggable="true"
                            @dragstart="dragStart($event)"
                            class="d-flex align-center"
                          >
                            <v-icon color="primary" class="mx-2 my-1" :icon="checkIcon(item)">
                            </v-icon>
                            <span>{{ item.name }}</span>
                          </div>
                        </v-list-item-title>
                      </v-list-item>
                    </template>
                  </v-virtual-scroll>
                </v-card>
              </v-col>
              <!-- Form -->
              <v-col cols="6">
                <v-form
                  :style="{ height: containerHeight }"
                  class="d-flex flex-column justify-start ga-2"
                  ref="formulaForm"
                  v-model="validFields"
                >
                  <v-card class="pa-2">
                    <div class="text-subtitle-1 mx-1 mb-2 text-primary">
                      {{ $t("labels.title-formula") }}
                      <v-tooltip text="Tooltip">
                        <template v-slot:activator="{ props }">
                          <v-icon
                            class="mb-2"
                            v-bind="props"
                            icon="mdi-information-outline"
                          ></v-icon>
                        </template>
                        <div class="my-2">{{ $t("strings.formula-hint") }}</div>
                        <FormulaHint
                          :measuresArray="this.sessionItem.definition.selected"
                        ></FormulaHint>
                      </v-tooltip>
                    </div>
                    <MathliveField @writeFormula="writeFormula" :valueFormula="formula" class="tour-formula" />

                    <p class="text-caption ms-2 latex-field">
                      LaTeX:
                      <span :class="placeholder">
                        {{ errorHint() }}
                      </span>
                    </p>

                    <v-card-actions class="d-flex justify-end align-center ga-0">
                      <!--Preview Button/Dialog-->
                      <div v-if="enableContinue" class="text-green mr-2">
                        {{ $t("strings.validation-ok") }}
                      </div>
                      <div v-if="!enableContinue" class="text-red mr-2">
                        {{ $t("strings.exec-validation") }}
                      </div>
                      <v-dialog v-model="previewDialog" max-width="800px">
                        <template v-slot:activator="{ props: activatorProps }">
                          <span class="d-flex justify-end"
                            ><v-btn
                            class="tour-validate"
                              :disabled="formula.length === 0 || placeholder.length > 0"
                              rounded="xl"
                              size="small"
                              variant="outlined"
                              color="secondary"
                              v-bind="activatorProps"
                              @click="this.getPreview(this.formula)"
                            >
                              {{ $t("labels.validate") }}
                            </v-btn></span
                          >
                        </template>

                        <v-card>
                          <v-toolbar :flat="true" color="secondary">
                            <v-toolbar-title class="text-white">
                              {{ $t("labels.formula-preview") }}
                            </v-toolbar-title>
                            <v-spacer></v-spacer>
                            <v-btn color="white" icon @click="previewDialog = false">
                              <v-icon>mdi-close</v-icon>
                            </v-btn>
                          </v-toolbar>
                          <v-card-text>
                            <PreviewMathField
                              @writeFormula="writeFormula"
                              :valueFormula="formula"
                            />
                            <div class="mt-2">
                              {{ resultPreview }}
                              <div class="d-flex flex-column align-center">
                                <v-progress-circular
                                  v-if="loading"
                                  indeterminate
                                ></v-progress-circular>
                                <div v-if="loading" class="text-caption mt-2">
                                  {{ $t("strings.loading") }}
                                </div>
                              </div>
                            </div>
                          </v-card-text>
                          <v-divider></v-divider>
                          <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn variant="text" color="secondary" @click="previewDialog = false"
                              >Ok</v-btn
                            >
                          </v-card-actions></v-card
                        >
                      </v-dialog></v-card-actions
                    >
                  </v-card>
                  <!-- END preview -->
                  <!-- Scheduling -->
  
                  <v-card class="px-2 pt-2 tour-schedule">
                    <div class="d-flex align-center text-subtitle-1 mx-1 mb-2 text-primary">
  {{ $t("labels.title-schedule") }}

  <v-tooltip>
    <template v-slot:activator="{ props }">
      <v-icon
        class="ms-2"
        v-bind="props"
        icon="mdi-information-outline"
        size="18"
      />
    </template>

    <div class="my-2">
      {{ $t("strings.schedule-hint") }}
    </div>
  </v-tooltip>
</div>

                    <div class="d-flex ga-4 pb-0 pt-0">
                      <v-text-field
                        class="w-50 custom-number-input"
                        v-model="sessionItem.formula.job.schedule.value"
                        :label="$t('labels.schedule')"
                        variant="outlined"
                        density="compact"
                        name="scheduleValue"
                        maxlength="10"
                        :rules="[(v) => v > 0 || $t('labels.minimum')]"
                        :update:modelValue="
                          this.schedulePositiveNumber(sessionItem.formula.job.schedule.value)
                        "
                        ><template #append-inner>
                          <div class="custom-buttons">
                            <v-icon compact @click="increment" class="custom-button"
                              >mdi-chevron-up</v-icon
                            >
                            <v-icon compact @click="decrement" class="custom-button"
                              >mdi-chevron-down</v-icon
                            >
                          </div>
                        </template>
                      </v-text-field>
                      <v-select
                        class="w-50"
                        v-model="sessionItem.formula.job.schedule.time"
                        variant="outlined"
                        :items="[
                          { value: 'minute', text: $t('labels.minutes') },
                          { value: 'hour', text: $t('labels.hours') },
                          { value: 'day', text: $t('labels.days') },
                          { value: 'week', text: $t('labels.weeks') },
                          { value: 'month', text: $t('labels.months') },
                          { value: 'quarter', text: $t('labels.quarters') },
                          { value: 'year', text: $t('labels.years') },
                        ]"
                        item-title="text"
                        item-value="value"
                        density="compact"
                        :label="$t('labels.time')"
                        name="time"
                        :rules="[(v) => !!v || $t('labels.required')]"
                      ></v-select>
                    </div>
                  </v-card>

                  <targetComponent 
                  class="tour-target"
                    :parentTargetValue="sessionItem.definition.targetValue"
                    :parentUnitMeasure="sessionItem.definition.unitMeasure"
                    @writeTargetValue="writeTargetValue"
                    @writeUnitMeasure="writeUnitMeasure"
                    :kpimEditorConfig="kpimEditorConfig"
                    :realm="realm"
                    :parentValidFields="targetFormFields"
                    @writeValidFields="writeValidFields"
                  ></targetComponent>
                </v-form>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="mt-auto px-0">
          <v-btn
    variant="text"
    size="small"
    color="primary"
    @click="startTour"
  >
    {{ $t("tour.help") }}
  </v-btn>
            <v-btn variant="outlined" color="secondary" class="me-auto" @click="routeToHome">
              {{ $t("labels.cancel") }}
            </v-btn>
            <v-btn
              variant="elevated"
              color="secondary"
              class="ml-2 text-white"
              @click.stop="routeToDefinition()"
            >
              {{ $t("labels.back") }}
            </v-btn>
            <v-btn
              :disabled="
                !enableContinue ||
                !validFields ||
                !targetFormFields ||
                formula.length === 0 ||
                placeholder.length > 0
              "
              variant="elevated"
              color="secondary"
              class="ml-2 text-white tour-continue-formula"
              @click.stop="saveAndContinue()"
            >
              {{ $t("labels.continue") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-container>
    </v-main>
  </v-layout>
</template>

<script>
import events from "@/mixins/events.js";
import utils from "@/mixins/utils.js";
import commonMethods from "./mixins/commonMethods.js";
import version from "../version";
import MathliveField from "./components/MathliveField.vue";
import PreviewMathField from "./components/previewMathField.vue";
import targetComponent from "./components/targetComponent.vue";
import FormulaHint from "./components/FormulaHint.vue";
import {startFormulaTour} from "./formulaTour";
export default {
  name: "demf-kpim-editor-formula",
  components: {
    MathliveField,
    PreviewMathField,
    targetComponent,
    FormulaHint,
  },
  mixins: [events, utils, commonMethods],
  props: ["kpimEditorConfig", "realm"],
  data: function () {
    return {
      appVersion: version,
      containerState: "expanded",
      search: "",

      formula: "",
      placeholder: "",

      unitMeasures: [],

      measures: [],
      KPIs: [],

      containerHeight: "100%",

      selectedVariable: null,
      tab: null,

      //validate the form
      validFields: false,
      targetFormFields: false,

      previewDialog: false,
      resultPreview: "",
      loading: false,

      sessionItem: {
        definition: {
          selected: [],
          unitMeasure: "",
          targetValue: "",
        },
        formula: {
          expression: "",
          details: [],
          job: {
            schedule: {
              time: "",
              value: 0,
            },
            status: "PENDING",
          },
        },
      },
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.updateContainerHeight(); // Update dimensions
      window.addEventListener("resize", this.updateContainerHeight);
    });

    console.log("Mounted demf-kpi-editor-formula v", this.appVersion);

    document.addEventListener("language-localstorage-changed", (event) => {
      this.setLocale(event.detail.storage);
    });

    this.containerState = localStorage.getItem("sidenav") === "opened" ? "reduced" : "expanded";

    document.addEventListener("sidenav-localstorage-changed", (event) => {
      this.containerState = event.detail.storage === "opened" ? "reduced" : "expanded";
    });

    document.addEventListener("toggle-overlay", (event) => {
      this.overlay = event.detail.released;
    });

    this.sessionItem = Object.assign(
      {},
      this.sessionItem,
      JSON.parse(sessionStorage.getItem("kpi"))
    );

    this.sessionItem.definition = Object.assign(
      {},
      JSON.parse(sessionStorage.getItem("kpi")).definition
    );

    if (this.sessionItem.formula.expression.length !== 0) {
      this.formula = this.reverseValues(this.sessionItem.formula.expression);
    }

    this.dispatch();
  },
  methods: {
       startTour() {
    this.$nextTick(() => {
      startFormulaTour(this.$t);
    });
  },
    deepMerge(target, source) {
      for (const key of Object.keys(source)) {
        if (source[key] instanceof Object && key in target && target[key] instanceof Object) {
          this.deepMerge(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      }
      return target;
    },
    updateContainerHeight() {
      const element = document.getElementById("main-container-formula");
      if (element) {
        const elementCss = window.getComputedStyle(element);
        this.containerHeight = parseFloat(elementCss.height);

        this.containerHeight = `${this.containerHeight - 93}px`;
      } else {
        console.warn("Not Found: ", element);
      }
    },
    setEditableStep(step, value) {
      document.dispatchEvent(
        new CustomEvent("editable-steps", {
          detail: { step, value },
        })
      );
    },

    increment() {
      this.sessionItem.formula.job.schedule.value++;
    },
    decrement() {
      if (this.sessionItem.formula.job.schedule.value > 0) {
        this.sessionItem.formula.job.schedule.value--;
      }
    },

    errorHint() {
      if (this.formula.length === 0) {
        this.placeholder = "bg-secondary pa-1 rounded";
        return this.$t("labels.placeholder");
      }

      if (this.formula.length > 0) {
        if (
          !this.sessionItem.definition.selected.some((item) =>
            this.formula.trim().replace(/\s/g, "").includes(item.name.trim().replace(/\s/g, ""))
          )
        ) {
          this.placeholder = "bg-secondary pa-1 rounded";
          return this.$t("labels.no-measure-formula");
        } else if (
          this.formula.includes("()") ||
          this.formula.includes("[]") ||
          this.formula.includes("{}") ||
          this.formula.includes("\\left\\lbrace\\right\\rbrace") ||
          this.formula.includes("\\placeholder") ||
          this.formula.includes("\\left(\\right)") ||
          this.formula.includes("\\left\\lbrack\\right\\rbrack") ||
          !this.checkBalancedDelimiters(this.formula) ||
          //check math operators before closing parenthesis
          /(\+|-|\*|\/|\\cdot)\s*\\right\)/.test(this.formula) ||
          //check dot operator at the beginning of the formula
          /^\\cdot/.test(this.formula) ||
          this.formula.includes("\\left(\\cdot") ||
          this.formula.includes("\\left\\lbrace\\cdot") ||
          this.formula.includes("\\left\\lbrack\\cdot") ||
          this.formula.includes("-+") ||
          this.formula.includes("--") ||
          this.formula.includes("++") ||
          this.formula.includes("\\cdot\\cdot") ||
          /-$/.test(this.formula) ||
          /\+$/.test(this.formula) ||
          /\\cdot$/.test(this.formula)
        ) {
          this.placeholder = "bg-secondary pa-1 rounded";
          return this.$t("labels.invalid-formula");
        } else {
          this.placeholder = "";
          return this.replaceValues(this.formula);
        }
      }
    },
    dispatch() {
      this.sessionItem.definition.selected.forEach((item) => {
        switch (item.type) {
          case "measure":
            this.measures.push(item);
            break;

          default:
            this.KPIs.push(item);
            break;
        }
      });
    },
    saveAndContinue() {
      this.grabUsedMeasures();
      this.sessionItem.formula.expression = this.formula;
      this.routeToDashboard();
    },
    writeFormula(val) {
      if (this.formula !== val) {
        this.formula = val; // Only update if the value has actually changed
      }
    },
    writeTargetValue(targetValue) {
      this.sessionItem.definition.targetValue = targetValue;
    },
    writeUnitMeasure(unitMeasure) {
      this.sessionItem.definition.unitMeasure = unitMeasure;
    },
    writeValidFields(targetFormFields) {
      this.targetFormFields = targetFormFields;
    },
    dragStart(e) {
      e.dataTransfer.setData("text/plain", e.target.innerText);
    },
    checkIcon(item) {
      if (item.type === "measure") {
        return "mdi-ruler";
      }
      if (item.type === "kpi") {
        return "mdi-gauge";
      }
    },
  },
  watch: {
    previewDialog(val) {
      if (!val) {
        window.stop();
      }
    },
    formula(val) {
      this.validCheck(val);
    },
  },
};
</script>
<style scoped>
main.expanded {
  margin-left: 56px;
}
main.reduced {
  margin-left: 256px;
}
main #main-container-formula {
  margin-top: 170px;
  /*ControlPanel total height - toolbar - stepper - Footer*/
  height: calc(100vh - 64px - 104px - 40px);
}
@media only screen and (max-height: 768px) {
  main #main-container-formula {
    margin-top: 170px;
    height: calc(100vh - 64px - 104px - 40px);
  }
}
.custom-number-input .v-input__append-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.custom-number-input .custom-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
}

.custom-number-input .v-icon {
  cursor: pointer;
  font-size: 16px; /* Adjust the size as needed */
  padding: 2px 0; /* Reduced padding */
  margin: 0; /* No margin */
}

.custom-button {
  transition: background-color 0.3s;
}

.custom-button:hover {
  background-color: rgba(0, 0, 0, 0.1); /* Change to your desired hover color */
  border-radius: 2px; /* Optional: to make the background color look nicer */
}

.latex-field > * {
  height: 15%;
  overflow: hidden;
}
</style>
