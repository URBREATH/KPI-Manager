<template>
  <v-dialog v-model="startMenu" max-width="290px">
    <template #activator="{ props }">
      <v-form ref="startForm" v-model="validFormStart">
        <v-text-field
          v-model="startDisplay"
          :label="$t('labels.start-date')"
          prepend-icon="mdi-calendar"
          readonly
          v-bind="props"
          density="compact"
          variant="solo-filled"
          rounded="0"
          clearable
          persistent-clear
          flat
          :disabled="disabled"
          required
          :rules="[(v) => !!v || $t('labels.required')]"
          :width="customWidth"
        >
        </v-text-field>
      </v-form>
    </template>

    <v-date-picker
      v-model="startDate"
      :title="$t('labels.select-start-date')"
      show-adjacent-months
      :max="endDate"
      ><template v-slot:actions>
        <v-select
          v-model="startHour"
          class="me-2"
          :label="$t('labels.hours')"
          :items="Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))"
          variant="solo-filled"
          density="compact"
          flat
          rounded="0"
          hide-details="true"
        ></v-select>
        <v-select
          v-model="startMinute"
          class="me-2"
          :label="$t('labels.minutes')"
          :items="Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'))"
          variant="solo-filled"
          density="compact"
          flat
          hide-details="true"
          rounded="0"
        ></v-select>
        <v-btn @click="startMenu = false">{{ $t("labels.ok") }}</v-btn>
      </template>
    </v-date-picker>
  </v-dialog>
  <span class="mx-4"></span>
  <v-dialog v-model="endMenu" max-width="290px">
    <template #activator="{ props }">
      <v-form ref="endForm" v-model="validFormEnd">
        <v-text-field
          v-model="endDisplay"
          :label="$t('labels.end-date')"
          prepend-icon="mdi-calendar"
          readonly
          v-bind="props"
          density="compact"
          variant="solo-filled"
          rounded="0"
          clearable
          persistent-clear
          :disabled="disabled"
          flat
          required
          :rules="[(v) => !!v || $t('labels.required')]"
          :width="customWidth"
        ></v-text-field>
      </v-form>
    </template>

    <v-date-picker
      v-model="endDate"
      :title="$t('labels.select-end-date')"
      show-adjacent-months
      :min="startDate"
      ><template v-slot:actions>
        <v-select
          v-model="endHour"
          class="me-2"
          :label="$t('labels.hours')"
          :items="Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))"
          variant="solo-filled"
          density="compact"
          flat
          rounded="0"
          hide-details="true"
        ></v-select>
        <v-select
          v-model="endMinute"
          class="me-2"
          :label="$t('labels.minutes')"
          :items="Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'))"
          variant="solo-filled"
          density="compact"
          flat
          rounded="0"
          hide-details="true"
        ></v-select>
        <v-btn @click="endMenu = false">{{ $t("labels.ok") }}</v-btn>
      </template>
    </v-date-picker>
  </v-dialog>
</template>

<script>
import { ref, watch } from "vue";
import { useDate } from "vuetify";

export default {
  props: {
    parentDateRange: Object,
    validateForms: Boolean,
    loading: Boolean,
  },
  emits: ["date-range-changed", "validForms"],
  setup(props, { emit }) {
    const date = useDate();
    const toggle_exclusive = ref(null);
    const dateRange = ref(props.parentDateRange);

    const startForm = ref(null);
    const startDate = ref(null);
    const startMenu = ref(false);
    const startDisplay = ref(null);

    const startHour = ref("00");
    const startMinute = ref("00");

    const endForm = ref(null);
    const endDate = ref(null);
    const endMenu = ref(false);
    const endDisplay = ref(null);

    const endHour = ref("23");
    const endMinute = ref("59");

    const validFormStart = ref(null);
    const validFormEnd = ref(null);

    const disabled = ref(false);
    const customWidth = ref("15rem");

    //sets the date range to the parent date range when the first KPI is loaded
    watch(
      () => props.parentDateRange,
      (val) => {
        if (val.rangeAtLoading) {
          startDate.value = date.date(val.start);
          startHour.value = date.format(date.date(val.start), "hours24h");
          startMinute.value = date.format(date.date(val.start), "minutes");
          if (startMinute.value.length === 1) {
            startMinute.value = "0" + startMinute.value;
          }

          endDate.value = date.date(val.end);
          endHour.value = date.format(date.date(val.end), "hours24h");
          endMinute.value = date.format(date.date(val.end), "minutes");
          if (endMinute.value.length === 1) {
            endMinute.value = "0" + endMinute.value;
          }

          dateRange.value.rangeAtLoading = false;
        }
      }
    );

    function changeDateRange() {
      emit("date-range-changed", dateRange.value);
    }

    watch(
      () => props.loading,
      (val) => {
        disabled.value = val;
      }
    );

    //after receiving input form updateInput, validate the forms and emit the result
    watch(
      () => props.validateForms,
      async (val, oldVal) => {
        if (val !== oldVal) {
          startForm.value.validate().then((validStart) => {
            endForm.value.validate().then((validEnd) => {
              emit("validForms", validStart.valid && validEnd.valid);
            });
          });
        }
      }
    );

    watch(
      () => startDate.value,
      (val) => {
        if (val) {
          let formattedVal =
            date.format(val, "keyboardDate") + `, ${startHour.value}:${startMinute.value}`;
          dateRange.value.start = formattedVal;
          startDisplay.value = formattedVal;
          changeDateRange();
        }
      }
    );

    watch(
      () => endDate.value,
      (val) => {
        if (val) {
          let formattedVal =
            date.format(val, "keyboardDate") + `, ${endHour.value}:${endMinute.value}`;
          dateRange.value.end = formattedVal;
          endDisplay.value = formattedVal;
          changeDateRange();
        }
      }
    );

    watch(
      () => startHour.value,
      (val, oldVal) => {
        if (val !== oldVal) {
          let formattedVal =
            date.format(date.date(startDate.value), "keyboardDate") +
            `, ${val}:${startMinute.value}`;
          dateRange.value.start = formattedVal;
          startDisplay.value = formattedVal;
          changeDateRange();
        }
      }
    );

    watch(
      () => startMinute.value,
      (val, oldVal) => {
        if (val !== oldVal) {
          let formattedVal =
            date.format(date.date(startDate.value), "keyboardDate") + `, ${startHour.value}:${val}`;
          dateRange.value.start = formattedVal;
          startDisplay.value = formattedVal;
          changeDateRange();
        }
      }
    );

    watch(
      () => endHour.value,
      (val, oldVal) => {
        if (val !== oldVal) {
          let formattedVal =
            date.format(date.date(endDate.value), "keyboardDate") + `, ${val}:${endMinute.value}`;
          dateRange.value.end = formattedVal;
          endDisplay.value = formattedVal;
          changeDateRange();
        }
      }
    );

    watch(
      () => endMinute.value,
      (val, oldVal) => {
        if (val !== oldVal) {
          let formattedVal =
            date.format(date.date(endDate.value), "keyboardDate") + `, ${endHour.value}:${val}`;
          dateRange.value.end = formattedVal;
          endDisplay.value = formattedVal;
          changeDateRange();
        }
      }
    );

    watch(
      () => startDisplay.value,
      (val) => {
        if (!val) {
          dateRange.value.start = null;
          startDate.value = null;
          changeDateRange();
        }
      }
    );

    watch(
      () => endDisplay.value,
      (val) => {
        if (!val) {
          dateRange.value.end = null;
          endDate.value = null;
          changeDateRange();
        }
      }
    );

    return {
      dateRange,
      toggle_exclusive,
      startForm,
      startDate,
      startDisplay,
      startMenu,
      startHour,
      startMinute,
      endForm,
      endMenu,
      endDate,
      endDisplay,
      endHour,
      endMinute,
      validFormStart,
      validFormEnd,
      disabled,
      customWidth,
    };
  },
};
</script>
