<template>
  <v-dialog v-model="isOpen" max-width="500">
    <v-card rounded="lg">
      <v-toolbar flat color="secondary">
        <v-toolbar-title class="text-white">{{ $t("labels.share-measure") }}</v-toolbar-title>
        <v-btn class="ms-4" icon @click="isOpen = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-divider class="mb-4"></v-divider>
      <v-form ref="form" validate-on="submit lazy" @submit.prevent="submit">
        <v-card-text>
          <div class="text-medium-emphasis mb-4">
            <strong>{{ $t("strings.name-hint") }}</strong
            >{{ measureName }}
          </div>
          <div class="text-medium-emphasis mb-4">{{ $t("strings.share-hint") }}</div>
          <v-autocomplete
            clearable
            v-model="selectedUsers"
            :disabled="loading"
            :items="users"
            variant="outlined"
            :label="$t('labels.select')"
            chips
            closable-chips
            multiple
            :rules="rules"
            :hint="$t('strings.select-recipient')"
            persistent-hint
          >
            <template v-slot:chip="{ props, item }">
              <v-chip v-bind="props" :text="item.raw.username">{{ item.raw.username }}</v-chip>
            </template>
            <template v-slot:item="{ props, item }">
              <v-list-item v-bind="props" :title="item.raw.username"></v-list-item>
            </template>
          </v-autocomplete>
        </v-card-text>

        <v-divider class="mt-2"></v-divider>

        <v-card-actions class="my-2 d-flex justify-end">
          <v-btn class="text-none" @click="isOpen = false">{{ $t("labels.cancel") }}</v-btn>

          <v-btn
            :loading="loading"
            type="submit"
            :text="$t('labels.share')"
            color="secondary"
            variant="flat"
          ></v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
  <!--Snackbar-->
  <v-snackbar v-model="snackbar" location="top" color="green" timeout="3000">
    {{ snackbarText }}
    <template v-slot:actions>
      <v-btn color="white" variant="text" @click="snackbar = false">OK</v-btn>
    </template>
  </v-snackbar>
</template>
<script>
import axios from "axios";
import events from "@/mixins/events";
import MeasuresList from "../mixins/MeasuresList";
export default {
  props: ["dialogState", "measureName", "id", "realm", "measuresListConfig"],
  mixins: [events, MeasuresList],
  emits: ["close-dialog"],
  data() {
    return {
      isOpen: false,
      users: [],
      selectedUsers: [],
      loading: false,
      apiUrl: this.measuresListConfig.api,
      rules: [
        (value) => {
          if (value && value.length > 0) {
            return true;
          }
          return this.$t("errors.select-recipient");
        },
      ],

      snackbarStatus: false,
      snackbarText: "",
    };
  },

  methods: {
    async fetchUsers() {
      this.loading = true;
      axios
        .get(`${this.apiUrl}/${this.realm}/users`, {
          withCredentials: true,
        })
        .then((response) => {
          this.users = response.data;
          this.loading = false;
        })
        .catch((err) => {
          this.setError(err, false);
          this.loading = false;
        });
    },

    submit() {
      const isValid = this.selectedUsers.length > 0;

      if (isValid) {
        this.loading = true;

        const data = {
          editorIds: [],
        };

        this.selectedUsers.forEach((user) => {
          data.editorIds.push(user.id);
        });

        this.shareMeasure(data);
        this.loading = false;
        this.isOpen = false;
      }
    },

    async shareMeasure(data) {
      axios
        .post(`${this.apiUrl}/${this.realm}/measures/${this.id}/share`, data, {
          withCredentials: true,
        })
        .then((response) => {
          console.log(response);
          if (response.status === 200) {
            this.activateSnackbar(true, this.$t("strings.measure-shared"));
          }
        })
        .catch((err) => {
          this.setError(err, false);
        });
    },
  },

  mounted() {
    this.isOpen = this.dialogState;
  },

  watch: {
    dialogState(newVal) {
      this.isOpen = newVal;
      if (this.isOpen) {
        this.resetSnackbar();
        this.selectedUsers = [];
        this.fetchUsers();
      }
    },
    isOpen(newVal) {
      if (!newVal) {
        this.$emit("close-dialog");
      }
    },
  },
};
</script>
