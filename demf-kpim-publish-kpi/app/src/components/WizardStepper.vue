 <!-- CONTENT -->
         <template>
<v-sheet color="white" class="activePosition">

  <v-stepper v-model="step" style="overflow-y: auto;">

    <!-- HEADER -->
    <v-stepper-header>
      <v-stepper-item :complete="step > 1" value="1">
        {{ $t("labels.distribution") }}
      </v-stepper-item>

      <v-divider></v-divider>

      <v-stepper-item value="2">
        {{ $t("labels.dataset") }}
      </v-stepper-item>
    </v-stepper-header>

    <!-- CONTENT -->
    <v-stepper-window>

      <!-- STEP 1 -->
      <v-stepper-window-item value="1">
        <DistributionStep v-model="distribution" />
        

        <div class="mt-4">
          <v-btn color="primary" @click="step = '2'">
            {{ $t('labels.next') }}
          </v-btn>
        </div>
      </v-stepper-window-item>

      <!-- STEP 2 -->
      <v-stepper-window-item value="2">
        <DatasetStep v-model="dataset" />

        <div class="mt-4 d-flex justify-space-between">
          <v-btn @click="step = '1'">
            {{ $t('labels.back') }}
          </v-btn>

          <v-btn color="primary" @click="publish(dataset,distribution)">
            {{ $t('labels.publish') }}
          </v-btn>
        </div>
      </v-stepper-window-item>

    </v-stepper-window>

  </v-stepper>

  <v-dialog v-model="publishSuccess" max-width="500">
  <v-card>
    <v-card-title class="text-h6">
      {{ $t('strings.publishCompleted') }}
    </v-card-title>

    <v-card-text>
      {{ $t('strings.publishSuccess') }}
    </v-card-text>

    <v-card-actions>
      <v-spacer />

      <v-btn
        color="primary"
        @click="goToKpis"
      >
        {{ $t('labels.close') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>
<v-dialog v-model="errorDialog" max-width="500">
  <v-card>
    <v-card-title class="text-h6">
      {{ $t('strings.publishFailed') }}
    </v-card-title>

    <v-card-text>
      {{ errorMessage }}
    </v-card-text>

    <v-card-actions>
      <v-spacer />

      <v-btn
        color="primary"
        @click="errorDialog =false"
      >
        {{ $t('labels.close') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>

</v-sheet>
      </template>

      <script>
      import DistributionStep from "./distributionStep.vue";
    import DatasetStep from "./datasetStep.vue";
     
    import axios from "axios";
    export default {
  name: "demf-kpim-publish-kpi",

  props: ["config", "realm"],

  components: {
   DistributionStep,
    DatasetStep,
  
  },


  data() {
    return {
      step: "1",
      dataset: {},
      distribution:{} ,
      sessionItem: {},
      kpi: JSON.parse(sessionStorage.getItem("kpi")),
      apiUrl: this.config.api,
      publishSuccess: false,
      errorMessage: "",
      errorDialog: false
 

    };
  },
  

  mounted() {

    // 👉 prendi KPI da sessionStorage (come editor)
    console.log(this.license);
    const kpi = sessionStorage.getItem("kpi");

    if (kpi) {
      console.log('chiamo map');
      this.sessionItem = JSON.parse(kpi);
      this.mapToDatasetAndDistribution();
    }
  },

  methods: {
     mapScheduleToFrequency(schedule){
  if (!schedule) return "unknown";

  const { time, value } = schedule;

  if (time === "minute") {
    return "minutely"; // opzionale
  }

  if (time === "hour") {
    return "hourly";
  }

  if (time === "day") {
    return "daily";
  }

  if (time === "week") {
    return "weekly";
  }

  if (time === "month") {
    if (value === 1) return "monthly";
    if (value === 2) return "bimonthly";
    if (value === 3) return "quarterly";
    if (value === 6) return "semiannual";
    return "monthly"; // fallback
  }

  if (time === "year") {
    return "yearly";
  }

  return "unknown";

},
    mapToDatasetAndDistribution() {
      const kpi = this.sessionItem;

      // 🔹 DISTRIBUTIONS

      // Measures → distributions
          this.distribution= {
            id: "dist-historical" + "-" + kpi.id,
            title: `${kpi.name} historical data`,
            description: "Time series of KPI values",
            accessUrl:  this.config.apiHistoricalData + kpi.name,
            format: "application/json",
            mediaType: "application/json",
            license: '',
            accessRights: ''
          };
    
    
      // 🔹 DATASET
      const frequency = this.mapScheduleToFrequency(kpi.formula.job.schedule);
      // Spatial GeoJSON
  let spatial = [];

  const geo = kpi.definition?.geolocation;

  if (geo?.latitude && geo?.longitude) {
    spatial = [
      {
        type: "Point",
        coordinates: [
          Number(geo.longitude),
          Number(geo.latitude)
        ]
      }
    ];
  }

      
      this.dataset = {
        id: `kpi-${kpi.id}`,
        title: kpi.name,
        description: kpi.description,
        spatial: spatial,
        frequency: frequency,
        publisher: "",
        theme:"",
        keyword: [kpi.name],
        datasetDistribution: [this.distribution.id],
        accessRights: "",
      };

    },
    goToKpis() {
  this.publishSuccess = false;
  this.$router.push("/kpis");
},
 

  

    async publish(dataset,distribution) {
       try {
    console.log("Publishing...", dataset, distribution);

    const res = await axios.post(
      `${this.apiUrl}/${this.realm}/dataset/publish`,
      {
        dataset,
        distribution,
      },
      {
        withCredentials: true,
      }
    );

    console.log(res);
    // apre il popup
this.publishSuccess = true;

    return res.data;

  } catch (err) {
    this.publishSuccess = false;
    console.error(err);
if (err.response?.status === 409) {
      this.errorMessage = this.$t('strings.publishAlreadyExists');
    } else {
      this.errorMessage = this.$t('strings.publishError');
    }

    this.errorDialog = true;
  }
    

     
    },
    setError(error) {
  console.error(error);
}
    
  },
};

      </script>