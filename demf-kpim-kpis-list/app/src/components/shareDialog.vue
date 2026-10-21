<template>
  <v-dialog v-model="isOpen" max-width="500">
    <v-card rounded="lg">
      <v-toolbar flat color="secondary">
        <v-toolbar-title class="text-white">{{ $t("labels.share-kpi") }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn color="white" icon @click="isOpen = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-form ref="form" validate-on="submit lazy" @submit.prevent="submit">
        <v-card-text>
          <div class="text-medium-emphasis mb-4">
            <strong>{{ $t("strings.name-hint") }}</strong
            >{{ kpiName }}
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
          <v-select
            v-model="role"
            v-if="isOwner"
            :items="['Editor', 'Viewer']"
            :label="$t('labels.role')"
            required
            variant="outlined"
            class="mt-4"
            :hint="$t('strings.select-role')"
            persistent-hint
          >
          </v-select>
        </v-card-text>

        <v-divider class="mt-2"></v-divider>
        <v-card-actions class="my-2 d-flex justify-end">
          <v-btn @click="isOpen = false">{{ $t("labels.cancel") }}</v-btn>

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
</template>
<script>
import axios from "axios";
import events from "@/mixins/events";
export default {
  props: ["dialogState", "kpiName", "isOwner", "realm", "kpisListConfig", "id"],
  mixins: [events],
  emits: ["close-dialog", "writeSnackbarStatus", "writeSnackbarText"],
  data() {
    return {
      isOpen: false,
      users: [],
      selectedUsers: [],
      apiUrl: this.kpisListConfig.api,
      loading: false,
      role: "Editor",
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
        let editorIds = [];
        let viewerIds = [];

        const data = {};
        if (!this.isOwner) {
          this.role = "Viewer";
        }
        this.selectedUsers.forEach((user) => {
          if (this.role === "Editor") {
            editorIds.push(user.id);
          } else {
            viewerIds.push(user.id);
          }
        });

        if (editorIds.length) {
          data.editorIds = editorIds;
        }
        if (viewerIds.length) {
          data.viewerIds = viewerIds;
        }
        this.shareKpi(data);
        this.loading = false;
        this.isOpen = false;
      }
    },

    async shareKpi(data) {
      axios
        .post(`${this.apiUrl}/${this.realm}/kpi/${this.id}/share`, data, {
          withCredentials: true,
        })
        .then((response) => {
          if (response.status === 200) {
            this.snackbarStatus = true;
            this.snackbarText = this.$t("strings.kpi-shared");
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
        (this.snackbarStatus = false), (this.snackbarText = ""), (this.selectedUsers = []);
        this.fetchUsers();
      }
    },
    isOpen(newVal) {
      if (!newVal) {
        this.$emit("close-dialog");
      }
    },
    snackbarStatus(newVal) {
      if (newVal) {
        this.$emit("writeSnackbarStatus", newVal);
      }
    },
    snackbarText(newVal) {
      if (newVal) {
        this.$emit("writeSnackbarText", newVal);
      }
    },
  },
};
</script>
