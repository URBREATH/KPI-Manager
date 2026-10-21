<template>
  <v-layout v-if="!publicToken && !publicListMode">
    <v-main :class="containerState">
      <v-container id="main-container" :fluid="true">
        <!-- Toolbar -->
        <v-app-bar id="upp-bar" color="white" :flat="true" class="px-4">
          <div class="d-flex align-center">
            <v-icon color="secondary" class="mr-2" size="large"> mdi-gauge </v-icon>
            <div class="text-secondary text-h5 font-weight-bold">
              {{ $t("labels.kpis", 2) }}
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
                variant="outlined"
                type="text"
                :label="$t('labels.search')"
                :append-inner-icon="!search ? 'mdi-magnify' : ''"
                :clearable="true"
                single-line
                hide-details
              ></v-text-field>
            </v-col>
          </v-row>
          <!--Create Button/Dialog-->
          <v-dialog v-model="dialogCreate" max-width="800px">
            <template v-slot:activator="{ props: activatorProps }">
              <v-btn
                variant="elevated"
                color="secondary"
                v-bind="activatorProps"
                class="ml-2 text-white"
              >
                {{ $t("labels.create-kpi") }}
              </v-btn>
            </template>
            <v-card>
              <v-toolbar :flat="true" color="secondary">
                <v-toolbar-title class="text-white">
                  {{ $t("labels.create-kpi") }}
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn color="white" icon @click="closeCreateKPI">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </v-toolbar>
              <v-card-text>
                <v-form ref="createForm" v-model="validForm" validate-on="lazy">
                  <v-text-field
                    v-model="sessionItem.name"
                    :label="$t('labels.name')"
                    :hint="$t('strings.kpi-name')"
                    persistent-hint
                    variant="outlined"
                    :rules="nameRules"
                    required
                    type="text"
                    density="default"
                    name="name"
                    hide-details="auto"
                    class="mb-6"
                    maxlength="20"
                    :counter="20"
                  ></v-text-field>
                  <v-textarea
                    v-model="sessionItem.description"
                    :label="$t('labels.description')"
                    :hint="$t('strings.kpi-description')"
                    persistent-hint
                    variant="outlined"
                    type="text"
                    density="compact"
                    name="description"
                    hide-details="auto"
                    class="mb-6"
                    maxlength="200"
                  ></v-textarea>
                  <v-select
                    class="w-25"
                    v-model="sessionItem.context"
                    variant="outlined"
                    :items="contexts"
                    density="compact"
                    :rules="contextRules"
                    :label="$t('labels.context')"
                    :hint="$t('strings.kpi-context')"
                    required
                    name="context"
                    persistent-hint
                  ></v-select>
                </v-form>
              </v-card-text>
              <v-divider></v-divider>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary darken-1" variant="text" @click="closeCreateKPI">{{
                  $t("labels.cancel")
                }}</v-btn>
                <v-btn
                  color="secondary darken-1"
                  variant="text"
                  :disabled="!validForm"
                  @click="confirmSaveKpi"
                  >{{ $t("labels.save") }}</v-btn
                >
              </v-card-actions></v-card
            >
          </v-dialog>
        </v-app-bar>
        <v-data-table
          v-model="selected"
          :headers="headers"
          :items="KPIs"
          :single-select="singleSelect"
          :sort-by="[{ key: 'title', order: 'asc' }]"
          show-select
          :search="search"
          :loading="loader"
          return-object
          hover
        >
          <!-- Actions over table (refresh and delete) -->
          <template v-slot:[`header.title`]>
            <div class="d-inline-flex justify-start align-center">
              <v-tooltip>
                <template v-slot:activator="{ props }">
                  <v-btn
                    icon
                    variant="plain"
                    color="secondary"
                    v-bind="props"
                    @click="getKPIsList()"
                  >
                    <v-icon>mdi-refresh</v-icon>
                  </v-btn>
                </template>
                <span>{{ $t("labels.refresh") }}</span>
              </v-tooltip>

              <v-tooltip location="top">
                <template v-slot:activator="{ props }">
                  <v-btn
                    :class="showDeleteIcon"
                    icon
                    variant="plain"
                    color="secondary"
                    v-bind="props"
                    @click="dialogDeleteMultiple = true"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </template>
                <span>{{ $t("labels.deleteMulti") }}</span>
              </v-tooltip>
            </div>
          </template>
          <!--END Actions over table -->

          <!-- NO DATA template -->
          <template v-slot:[`no-data`]>
            <div class="table-no-data">
              <img
                :src="kpisListConfig.storageImgs + '/commons/watermark-comic.png'"
                alt="watermark no data"
                width="200"
              />
              <p class="black--text font-weight-bold text-h6 text-uppercase mb-3">
                {{ $t("strings.no-KPIs") }}
              </p>
              <p>{{ $t("strings.please-add-KPI") }}</p>
                                
            </div>

          </template>

          <!-- Table's row definition -->
          <template v-slot:[`item.title`]="{ item }">
            <span class="d-flex flex-row align-center ga-8">
              <v-tooltip>
                <template v-slot:activator="{ props }">
                  <v-badge
                    v-bind="props"
                    :color="getStatusColor(item.dependencyStatus)"
                    text-color="white"
                    class="text-uppercase"
                    dense
                  ></v-badge>
                </template>
                <div v-if="item.dependencyStatus" class="my-2 d-flex align-center">
                  <v-badge
                    class="mb-1 me-2"
                    dot
                    :color="getStatusColor(item.dependencyStatus)"
                  ></v-badge>
                  <span>{{ $t(`labels.badge-${item.dependencyStatus}`) }}</span>
                </div>
              </v-tooltip>
              <v-tooltip location="top">
                <template v-slot:activator="{ props }">
                  <v-list-item
                    lines="two"
                    class="px-0 py-2 no-highlight"
                    v-bind="props"
                    @click="routeToKPI(item)"
                  >
                    <v-list-item-title class="font-weight-medium" :search="search">
                      {{ item.name }}
                      <v-chip
                        v-if="item.orionPublished"
                        class="ml-2"
                        size="x-small"
                        color="success"
                        variant="tonal"
                      >
                        {{ $t("labels.publishedOnOrion") }}
                      </v-chip>
                    </v-list-item-title>
                    <v-list-item-subtitle
                      :search="search"
                      class="d-inline-block text-truncate"
                      style="max-width: 150px"
                    >
                      {{ item.description }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </template>
                <span>{{ $t("labels.open") }} {{ item.name }} </span>
              </v-tooltip>
            </span>
          </template>
          <template v-slot:[`item.lastUpdate`]="{ item }">
            <div>{{ readableDate(item.lastUpdate) }}</div>
          </template>
          <!-- row menu -->
          <template v-slot:[`item.functions`]="{ item }">
            <v-menu location="bottom left">
              <template v-slot:activator="{ props }">
                <v-btn variant="plain" icon v-bind="props">
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list density="default">
                <v-list-item @click="openDuplicateKPI(item)">
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-content-duplicate</v-icon>
                  </template>
                  <v-list-item-title>{{ $t("labels.duplicate") }}</v-list-item-title>
                </v-list-item>
                <v-list-item @click="routeToCompare(item)">
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-compare</v-icon>
                  </template>
                  <v-list-item-title>{{ $t("labels.compare") }}</v-list-item-title>
                </v-list-item>
                <v-list-item @click="createPublicLink(item)">
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-link-variant</v-icon>
                  </template>
                  <v-list-item-title>{{ $t("labels.sharePublicLink") }}</v-list-item-title>
                </v-list-item>
                <v-list-item disabled @click="exportKPI(item)">
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-download</v-icon>
                  </template>
                  <v-list-item-title>{{ $t("labels.export") }}</v-list-item-title>
                </v-list-item>
                <v-tooltip location="top">
                  <template v-slot:activator="{ props }">
                    <v-list-item @click="routeToPublishKpi(item)" v-bind="props">
                      <template v-slot:prepend>
                        <v-icon color="primary">mdi-database-export</v-icon>
                      </template>
                      <v-list-item-title>{{ $t("labels.publishDataset") }}</v-list-item-title>
                    </v-list-item>
                  </template>
                  <span>{{ $t("strings.publishAsDatasetOnIdra") }}</span>
                </v-tooltip>
                <v-tooltip location="top">
                  <template v-slot:activator="{ props }">
                    <v-list-item @click="routeToPublishOnFrostServer(item)" v-bind="props">
                      <template v-slot:prepend>
                        <v-icon color="primary">mdi-server-network</v-icon>
                      </template>
                      <v-list-item-title>{{ $t("labels.publishOnFrostServer") }}</v-list-item-title>
                    </v-list-item>
                  </template>
                  <span>{{ $t("strings.publishOnFrostServer") }}</span>
                </v-tooltip>
                <v-tooltip location="top">
                  <template v-slot:activator="{ props }">
                    <v-list-item v-if="!item.orionPublished" @click="publishKpi(item)" v-bind="props">
                      <template v-slot:prepend>
                        <v-icon color="primary">mdi-cloud-upload</v-icon>
                      </template>
                      <v-list-item-title>{{ $t("labels.publish") }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item v-else @click="deleteKpiFromOrion(item)" v-bind="props">
                      <template v-slot:prepend>
                        <v-icon color="error">mdi-cloud-off-outline</v-icon>
                      </template>
                      <v-list-item-title>{{ $t("labels.deleteFromOrion") }}</v-list-item-title>
                    </v-list-item>
                  </template>
                  <span>{{ $t(item.orionPublished ? "labels.deleteFromOrion" : "strings.publishAsKpiEntity") }}</span>
                </v-tooltip>
                <v-tooltip location="left">
                  <template v-slot:activator="{ props }">
                    <v-list-item @click="openDeleteKPI(item)" v-bind="props">
                      <template v-slot:prepend>
                        <v-icon color="primary">mdi-delete</v-icon>
                      </template>
                      <v-list-item-title>{{ $t("labels.delete") }}</v-list-item-title>
                    </v-list-item>
                  </template>
                  <span>{{ $t("strings.delete-kpi-tooltip") }}</span>
                </v-tooltip>
              </v-list>
            </v-menu>
          </template>
          <!-- END row menu -->
          <!-- END Table's row definition -->
        </v-data-table>
        <!-- Share Dialog -->
        <shareDialog
          :kpiName="shareItem.name"
          :id="shareItem.id"
          :dialogState="shareDialogActive"
          @close-dialog="closeShareForm()"
          :isOwner="shareItem.isOwner"
          :realm="realm"
          :apiUrl="apiUrl"
          :kpisListConfig="kpisListConfig"
          @writeSnackbarStatus="snackbar = $event"
          @writeSnackbarText="snackbarText = $event"
        ></shareDialog>
        <!--Dialog Duplicate-->
        <v-form ref="duplicateForm" v-model="validDialogForm">
          <v-dialog v-model="dialogDuplicate" max-width="500px">
            <v-card>
              <v-toolbar :flat="true" color="secondary">
                <v-toolbar-title class="text-white">
                  {{ $t("labels.duplicate") }}
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn color="white" icon="mdi-close" @click="closeDuplicateKPI"> </v-btn>
              </v-toolbar>

              <v-card-text>
                <v-text-field
                  v-model="duplicateItem.name"
                  :counter="20"
                  :rules="nameRules"
                  :label="$t('labels.name')"
                  required
                  variant="outlined"
                  density="compact"
                  hint="Insert a new name for the KPI"
                  persistent-hint
                  maxlength="20"
                ></v-text-field>
              </v-card-text>
              <v-divider></v-divider>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary darken-1" variant="text" @click="closeDuplicateKPI">
                  {{ $t("labels.cancel") }}
                </v-btn>
                <v-btn
                  :disabled="!this.validDialogForm || loader"
                  color="secondary darken-1"
                  variant="text"
                  @click="duplicateKPI"
                >
                  {{ $t("labels.duplicate") }}
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-form>
        <!--Dialog Delete-->
        <v-dialog v-model="dialogDelete" max-width="500px">
          <v-card>
            <v-toolbar flat color="secondary">
              <v-toolbar-title class="text-white">
                {{ $t("labels.delete") }}
              </v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn color="white" icon @click="closeDeleteKPI">
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
              <v-btn color="primary darken-1" variant="text" @click="closeDeleteKPI">
                {{ $t("labels.cancel") }}
              </v-btn>
              <v-btn color="secondary darken-1" variant="text" @click="deleteKpiConfirm">
                {{ $t("labels.delete") }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <!-- Public link dialog -->
        <v-dialog v-model="publicLinkDialog" max-width="600px">
          <v-card>
            <v-toolbar flat color="secondary">
              <v-toolbar-title class="text-white">{{ $t("labels.sharePublicLink") }}</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn color="white" icon @click="publicLinkDialog = false"><v-icon>mdi-close</v-icon></v-btn>
            </v-toolbar>
            <v-card-text>
              <p class="mb-4">{{ $t("strings.publicLinkHint") }}</p>
              <v-text-field v-model="publicUrl" readonly variant="outlined" hide-details />
            </v-card-text>
            <v-card-actions>
              <v-btn color="error" variant="text" :loading="publicLinkLoading" @click="revokePublicLink">
                {{ $t("labels.revokePublicLink") }}
              </v-btn>
              <v-spacer></v-spacer>
              <v-btn @click="publicLinkDialog = false">{{ $t("labels.close") }}</v-btn>
              <v-btn color="secondary" variant="flat" :loading="publicLinkLoading" @click="copyPublicLink">
                <v-icon start>mdi-content-copy</v-icon>{{ $t("labels.copyLink") }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <!--Dialog Delete Multiple-->
        <v-dialog v-model="dialogDeleteMultiple" max-width="500px">
          <v-card>
            <v-toolbar flat color="secondary">
              <v-toolbar-title class="text-white">
                {{ $t("labels.delete") }}
              </v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn color="white" icon @click="closeDeleteMultipleKPIs">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-toolbar>
            <v-card-text>
              <p class="text-h6">
                <span>
                  {{ $t("strings.delete-multiple-kpi-question") }}
                </span>
              </p>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary darken-1" variant="text" @click="closeDeleteMultipleKPIs">
                {{ $t("labels.cancel") }}
              </v-btn>
              <v-btn color="secondary darken-1" variant="text" @click="deleteMultipleKpis()">
                {{ $t("labels.delete") }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <div class="">
<v-btn
  variant="text"
  color="secondary"
  href="/kpi-manager-user-guide.pdf"
  target="_blank"
  download
  prepend-icon="mdi-file-pdf-box">
 {{ $t("labels.userGuide") }}
</v-btn>
</div>
        <!--Snackbar-->
        <v-snackbar v-model="snackbar" location="top" :color="snackbarColor" timeout="5000">
          {{ snackbarText }}
          <template v-slot:actions>
            <v-btn
              v-if="snackbarActionUrl"
              color="white"
              variant="text"
              :href="snackbarActionUrl"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ $t("labels.openEntity") }}
            </v-btn>
            <v-btn color="white" variant="text" @click="snackbar = false">OK</v-btn>
          </template>
        </v-snackbar>
        <v-dialog v-model="frostPublishDialog" max-width="640px">
          <v-card>
            <v-toolbar flat color="secondary">
              <v-toolbar-title class="text-white">{{ $t("labels.frostResources") }}</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn color="white" icon="mdi-close" @click="frostPublishDialog = false"></v-btn>
            </v-toolbar>
            <v-card-text>
              <p class="mb-3">{{ $t("strings.frostResourcesHint") }}</p>
              <v-list density="compact">
                <v-list-item
                  v-for="resource in frostReferences"
                  :key="resource.key"
                  :href="resource.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  :title="$t(resource.label)"
                  :subtitle="resource.url"
                >
                  <template v-slot:append>
                    <v-icon>mdi-open-in-new</v-icon>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="secondary" @click="frostPublishDialog = false">{{ $t("labels.close") }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
    

      </v-container>
    </v-main>
  </v-layout>
  <v-layout v-else-if="publicListMode">
    <v-main :class="containerState">
      <v-container id="main-container" :fluid="true">
        <v-app-bar id="upp-bar" color="white" :flat="true" class="px-4">
          <div class="d-flex align-center">
            <v-icon color="secondary" class="mr-2" size="large">mdi-eye</v-icon>
            <div class="text-secondary text-h5 font-weight-bold">
              {{ $t("labels.publicKpis") }}
            </div>
          </div>
          <v-spacer></v-spacer>
          <v-btn
            icon
            variant="plain"
            color="secondary"
            :aria-label="$t('labels.refresh')"
            :loading="publicKpisLoading"
            @click="getPublicKpis"
          >
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
        </v-app-bar>

        <v-alert v-if="publicKpisError" type="error" variant="tonal" class="ma-4">
          {{ $t("strings.publicKpisLoadFailed") }}
        </v-alert>

        <v-data-table
          v-else
          :headers="publicKpiHeaders"
          :items="publicKpis"
          :loading="publicKpisLoading"
          :sort-by="[{ key: 'name', order: 'asc' }]"
          hover
        >
          <template v-slot:[`header.name`]>
            <div class="d-flex align-center">
              <v-icon color="secondary" class="mr-2" @click="getPublicKpis">mdi-refresh</v-icon>
              {{ $t("labels.name") }}
            </div>
          </template>
          <template v-slot:[`item.name`]="{ item }">
            <div class="py-2">
              <div class="font-weight-medium">{{ item.name }}</div>
              <div v-if="item.description" class="text-caption text-medium-emphasis public-kpi-description">
                {{ item.description }}
              </div>
              <div
                v-if="item.definition?.selected?.length"
                class="text-caption text-medium-emphasis public-kpi-description"
              >
                {{ item.definition.selected.map((measure) => measure.name).join(", ") }}
              </div>
            </div>
          </template>
          <template v-slot:[`item.lastValue`]="{ item }">
            <span class="font-weight-medium text-secondary">
              {{ item.lastValue }} {{ item.definition?.unitMeasure }}
            </span>
          </template>
          <template v-slot:[`item.lastUpdate`]="{ item }">
            {{ item.lastUpdate ? readableDate(item.lastUpdate) : "—" }}
          </template>
          <template v-slot:[`item.actions`]="{ item }">
            <v-btn
              v-if="item.publicUrl"
              color="secondary"
              variant="text"
              :href="item.publicUrl"
              target="_blank"
              rel="noopener noreferrer"
              prepend-icon="mdi-open-in-new"
            >
              {{ $t("labels.openPublicKpi") }}
            </v-btn>
          </template>
          <template v-slot:[`no-data`]>
            <div class="table-no-data py-8">
              <v-icon color="grey" size="64" class="mb-3">mdi-eye-off-outline</v-icon>
              <p class="text-h6">{{ $t("strings.noPublicKpis") }}</p>
            </div>
          </template>
        </v-data-table>
      </v-container>
    </v-main>
  </v-layout>
  <v-container v-else class="public-kpi-page fill-height" fluid>
    <v-card v-if="!publicKpiLoading && publicKpi" class="public-kpi-card mx-auto pa-6" max-width="720" width="100%" elevation="4">
      <div class="d-flex align-center mb-5">
        <v-icon color="secondary" size="large" class="mr-3">mdi-gauge</v-icon>
        <div>
          <div class="text-overline">{{ $t("labels.publicKpi") }}</div>
          <h1 class="text-h4">{{ publicKpi.name }}</h1>
        </div>
      </div>
      <div v-if="publicKpi.description" class="public-kpi-description mb-6">
        <div class="text-overline">{{ $t("labels.description") }}</div>
        <p class="text-body-1">{{ publicKpi.description }}</p>
      </div>
      <v-divider class="mb-6"></v-divider>
      <div class="text-overline">{{ $t("labels.value") }}</div>
      <div class="text-h3 text-secondary mb-4">
        {{ publicKpi.lastValue }} <span class="text-h6">{{ publicKpi.definition?.unitMeasure }}</span>
      </div>
      <v-card variant="tonal" class="pa-4 mb-6">
        <div class="text-subtitle-1 font-weight-medium mb-3">{{ $t("labels.trend") }}</div>
        <div class="public-kpi-chart">
          <canvas ref="publicChartCanvas"></canvas>
        </div>
      </v-card>
      <div class="d-flex flex-wrap ga-8">
        <div v-if="publicKpi.definition?.targetValue !== undefined">
          <div class="text-overline">{{ $t("labels.target") }}</div>
          <div class="text-h6">{{ publicKpi.definition.targetValue }} {{ publicKpi.definition.unitMeasure }}</div>
        </div>
        <div v-if="publicKpi.lastUpdate">
          <div class="text-overline">{{ $t("labels.lastUpdate") }}</div>
          <div>{{ readableDate(publicKpi.lastUpdate) }}</div>
        </div>
      </div>
    </v-card>
    <v-alert v-else-if="!publicKpiLoading" class="mx-auto" max-width="720" type="error" variant="tonal">
      {{ $t("strings.publicKpiUnavailable") }}
    </v-alert>
    <v-progress-circular v-else class="mx-auto" indeterminate color="secondary" size="48" />
  </v-container>
</template>

<script>
import axios from "axios";
import Chart from "chart.js/auto";
import annotationPlugin from "chartjs-plugin-annotation";
import events from "@/mixins/events.js";
import utils from "@/mixins/utils.js";
import KPIsList from "@/mixins/KPIsList.js";
import version from "../version";
import shareDialog from "./components/shareDialog.vue";
export default {
  name: "KpisList",
  mixins: [events, utils, KPIsList],
  props: ["kpisListConfig", "realm"],
  components: {
    shareDialog,
  },
  created() {
    Chart.register(annotationPlugin);
  },
  data: function () {
    return {
      singleSelect: false,
      dialogDuplicate: false,
      dialogDelete: false,
      dialogDeleteMultiple: false,
      apiUrl: this.kpisListConfig.api,
      selected: [],
      contexts: [],
      showDeleteIcon: "d-none",
      headers: [
        {
          title: "KPI",
          value: "name",
          key: "title",
          width: "auto",
        },
        {
          title: this.$t("labels.value"),
          value: "lastValue",
          width: "auto",
        },

        {
          title: this.$t("labels.target"),
          value: "definition.targetValue",
          width: "auto",
        },

        {
          title: this.$t("labels.unitMeasure"),
          value: "definition.unitMeasure",
          width: "auto",
        },
        {
          title: this.$t("labels.lastUpdate"),
          value: "lastUpdate",
          width: "auto",
        },

        {
          title: this.$t("labels.context"),
          value: "context",
          width: "auto",
        },
        {
          title: "",
          value: "functions",
          width: "5",
        },
      ],
      publicKpiHeaders: [
        { title: this.$t("labels.name"), key: "name", sortable: true },
        { title: this.$t("labels.value"), key: "lastValue", sortable: true },
        { title: this.$t("labels.target"), key: "definition.targetValue", sortable: true },
        { title: this.$t("labels.unitMeasure"), key: "definition.unitMeasure", sortable: true },
        { title: this.$t("labels.lastUpdate"), key: "lastUpdate", sortable: true },
        { title: "", key: "actions", sortable: false, align: "end" },
      ],
      appVersion: version,
      containerState: localStorage.getItem("sidenav") === "opened" ? "reduced" : "expanded",
      search: "",
      loggedUserId: "",
      nameRules: [
        (value) => !!value || this.$t("errors.kpi-name-required"),
        (v) => {
          //check if input contains only letters and numbers
          const validPattern = /^[a-zA-Z0-9 ]+$/;
          return validPattern.test(v) || this.$t("errors.kpi-name-invalid");
        },
        (v) => {
          //check if name already exists
          return !this.validName(v) || this.$t("errors.kpi-name-exists");
        },
      ],
      contextRules: [(value) => !!value || this.$t("errors.kpi-context-required")],
      snackbar: false,
      snackbarText: "",
      snackbarColor: "success",
      snackbarActionUrl: "",
      orionActionLoading: false,
      frostPublishDialog: false,
      frostReferences: [],
      validForm: true,
      validDialogForm: true,
      dialogCreate: false,
      loader: false,
      KPIs: [],
      sessionItem: {
        name: "",
        description: "",
        context: "",
      },
      duplicateItem: {
        name: "",
        description: "",
        context: "",
      },
      defaultItem: {
        name: "",
        description: "",
        context: "",
      },
      id: "",
      shareItem: {},
      publicToken: new URLSearchParams(window.location.search).get("token") || window.location.pathname.match(/\/public\/kpi\/([^/]+)/)?.[1] || "",
      publicListMode: window.location.pathname.replace(/\/+$/, "") === "/public/kpis",
      publicKpis: [],
      publicKpisLoading: false,
      publicKpisError: false,
      publicKpi: null,
      publicKpiLoading: false,
      publicChartInstance: null,
      publicLinkDialog: false,
      publicLinkLoading: false,
      publicUrl: "",
      publicLinkKpiId: "",
    };
  },

  async beforeMount() {
    if (!this.publicToken && !this.publicListMode) await this.getContext();
  },

  mounted() {
    //remove possible residues of previous projects
    sessionStorage.removeItem("kpi");

    if (this.publicToken) {
      this.getPublicKpi();
      return;
    }
    if (this.publicListMode) {
      this.getPublicKpis();
      return;
    }

    console.log("Mounted demf-kpis-list v", this.appVersion);
    this.loggedUserId = localStorage.getItem("loggedUserId");
    this.getKPIsList();

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
  },
  beforeUnmount() {
    if (this.publicChartInstance) {
      this.publicChartInstance.destroy();
      this.publicChartInstance = null;
    }
  },
  methods: {
    async getPublicKpis() {
      this.publicKpisLoading = true;
      this.publicKpisError = false;
      try {
        const apiBase = this.apiUrl.replace(/\/+$/, "");
        const response = await axios.get(`${apiBase}/public/kpi`);
        this.publicKpis = response.data?.data ?? [];
      } catch (error) {
        this.publicKpisError = true;
        console.error("Could not load public KPIs:", error.response?.data || error.message);
      } finally {
        this.publicKpisLoading = false;
      }
    },

    async getPublicKpi() {
      this.publicKpiLoading = true;
      try {
        const apiBase = this.apiUrl.replace(/\/+$/, "");
        const response = await axios.get(`${apiBase}/public/kpi/${encodeURIComponent(this.publicToken)}`);
        this.publicKpi = response.data?.data ?? null;
      } catch (_error) {
        this.publicKpi = null;
      } finally {
        this.publicKpiLoading = false;
      }
      if (this.publicKpi) {
        await this.$nextTick();
        this.renderPublicKpiChart();
      }
    },

    renderPublicKpiChart() {
      if (!this.publicKpi || !this.$refs.publicChartCanvas) return;

      const history = this.publicKpi.history || {};
      const hasHistory = Array.isArray(history.value) && history.value.length > 0;
      const labels = hasHistory
        ? history.timestamp.map((timestamp) => this.readableSummaryDate(timestamp))
        : [this.publicKpi.lastUpdate ? this.readableDate(this.publicKpi.lastUpdate) : this.$t("labels.value")];
      const values = hasHistory ? history.value : [Number(this.publicKpi.lastValue) || 0];
      const configuredType = this.publicKpi.dashboard?.chart?.type;
      const chartType = ["bar", "line", "area", "doughnut"].includes(configuredType)
        ? configuredType
        : "line";
      const isDoughnut = chartType === "doughnut";
      const targetValue = Number(this.publicKpi.definition?.targetValue);

      if (this.publicChartInstance) this.publicChartInstance.destroy();
      this.publicChartInstance = new Chart(this.$refs.publicChartCanvas, {
        type: chartType === "area" ? "line" : chartType,
        data: {
          labels,
          datasets: [{
            label: this.publicKpi.name,
            data: values,
            borderColor: "#303F9F",
            backgroundColor: isDoughnut ? ["#303F9F", "#4CAF50", "#FF9800", "#03A9F4", "#9C27B0", "#E91E63"] : "#303F9F",
            pointRadius: values.length === 1 ? 5 : 3,
            pointBackgroundColor: "#303F9F",
            fill: chartType === "area",
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 4,
          plugins: {
            legend: { position: "top" },
            annotation: {
              annotations: !isDoughnut && Number.isFinite(targetValue)
                ? {
                    targetLine: {
                      type: "line",
                      yMin: targetValue,
                      yMax: targetValue,
                      borderColor: "#4CAF50",
                      borderWidth: 2,
                      label: {
                        content: `Target: ${targetValue}`,
                        enabled: true,
                        position: "end",
                      },
                    },
                  }
                : {},
            },
          },
          scales: chartType === "bar"
            ? { x: { stacked: true }, y: { stacked: true } }
            : {},
        },
      });
    },

    readableSummaryDate(timestamp) {
      const date = new Date(timestamp);
      const day = String(date.getUTCDate()).padStart(2, "0");
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const year = date.getUTCFullYear();
      const hours = String((date.getUTCHours() + 2) % 24).padStart(2, "0");
      const minutes = String(date.getUTCMinutes()).padStart(2, "0");
      const seconds = String(date.getUTCSeconds()).padStart(2, "0");
      return `${day}/${month}/${year} at ${hours}:${minutes}:${seconds}`;
    },

    async createPublicLink(item) {
      this.publicLinkLoading = true;
      this.publicLinkKpiId = item.id;
      try {
        const apiBase = this.apiUrl.replace(/\/+$/, "");
        const response = await axios.post(
          `${apiBase}/${this.realm}/kpi/public-link/${item.id}`,
          {},
          { withCredentials: true },
        );
        this.publicUrl = response.data?.data?.publicUrl || `${window.location.origin}/public/kpi/${response.data?.data?.token}`;
        this.publicLinkDialog = true;
      } catch (error) {
        this.setError(error, false);
      } finally {
        this.publicLinkLoading = false;
      }
    },

    async copyPublicLink() {
      try {
        await navigator.clipboard.writeText(this.publicUrl);
        this.snackbarText = this.$t("strings.publicLinkCopied");
        this.snackbar = true;
      } catch (_error) {
        this.snackbarText = this.$t("strings.publicLinkCopyFailed");
        this.snackbar = true;
      }
    },

    async revokePublicLink() {
      this.publicLinkLoading = true;
      try {
        const apiBase = this.apiUrl.replace(/\/+$/, "");
        await axios.delete(`${apiBase}/${this.realm}/kpi/public-link/${this.publicLinkKpiId}`, { withCredentials: true });
        this.publicLinkDialog = false;
        this.snackbarText = this.$t("strings.publicLinkRevoked");
        this.snackbar = true;
      } catch (error) {
        this.setError(error, false);
      } finally {
        this.publicLinkLoading = false;
      }
    },

    //ingests the dependencyStatus and returns the color for the badge
    getStatusColor(status) {
      const statusColors = {
        active: "success",
        warning: "warning",
        error: "error",
      };
      return statusColors[status] || "error";
    },

 async getContext() {
      try {
        const response = await axios.get(`${this.apiUrl}/${this.realm}/users/contexts`, {
          withCredentials: true,
        });
         console.log('KpimList - Risposta API per i contesti (raw):', response.data);
   
        this.contexts = response.data.map((item) => {
          return item.name;
        });
         console.log('Kpim-list - Contesti mappati (formato v-select items):', this.contexts);
   
      } catch (error) {
        this.setError(error, false);
         console.error('KpimMeasure - Errore nel recupero dei contesti:', error);
      } finally {
        this.loading = false;
      }
    },
    //ingests the timestamp and returns a readable date
    readableDate(itemDate) {
      const timestamp = itemDate;

      // Create a new Date object from the timestamp
      const date = new Date(timestamp);

      // Extract the components
      const day = String(date.getUTCDate()).padStart(2, "0");
      const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Months are zero-indexed
      const year = date.getUTCFullYear();
      const hours = String(date.getUTCHours()).padStart(2, "0");
      const minutes = String(date.getUTCMinutes()).padStart(2, "0");
      const seconds = String(date.getUTCSeconds()).padStart(2, "0");

      // Format the date and time
      const formattedDate = `${day}/${month}/${year} at ${hours}:${minutes}:${seconds}`;
      return formattedDate;
    },
    validName(name) {
      return this.KPIs.some(
        (kpi) => kpi.name.trim().replace(/\s/g, "") === name.trim().replace(/\s/g, "")
      );
    },
  },
  watch: {
    //disable delete button if there aren't any selected KPIs
    selected() {
      this.showDeleteIcon = this.selected.length > 0 ? "d-block" : "d-none";
    },
    dialogDuplicate(val) {
      if (!val) {
        this.duplicateItem = Object.assign({}, this.defaultItem);
      }
    },
  },
};

</script>
<style scoped>
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
.user-guide-link {
  position: fixed;
  bottom: 16px;
  left: 24px;
  z-index: 1000;
}
.public-kpi-description {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.public-kpi-chart {
  position: relative;
  height: 300px;
}
</style>
