import axios from "axios";
import { useDate } from "vuetify";

export default {
  data() {
    return {
      apiUrl: this.compareConfig.api,
      kpiName: "",
      defaultData: {
        data: {
          value: [],
          timestamp: [],
          statistics: {
            min: 0,
            max: 0,
            avg: 0,
          },
        },
      },
      fetchedKpi: {},
      mockData: {},
      mockupAlert: true,
      date: useDate(),
      backgroundColorCount: 0,
      baseKpi: false,
    };
  },
  methods: {
    readableDate(itemDate) {
      //slice is for removing the seconds: 12/01/2024, 18:09:24 => 12/20/2024, 18:09
      const formattedDate = this.date.format(itemDate, "keyboardDateTime").slice(0, -3);

      return formattedDate;
    },

    getBackgroundColor(index) {
      const colors = ["#303F9F", "#FFD700", "#FF1493", "#8B0000", "#008000", "#FF8C00", "#800080"];

      return colors[index];
    },

    async updateChartData(kpiName, isbaseKpi) {
      //fetch kpi data from the server
      await this.fetchChartData(kpiName);

      //check if it is the base kpi
      isbaseKpi === 0 ? (this.baseKpi = true) : (this.baseKpi = false);

      //add the fetched data to the chart object
      this.addDataset(kpiName, isbaseKpi);
      this.fetchedKpi = this.defaultData;
    },

    async fetchChartData(kpiName) {
      this.timesCalled++;
      await axios
        .get(`${this.apiUrl}/${this.realm}/historical-data/query/all`, {
          withCredentials: true,
          params: {
            bucket: this.realm,
            measurement: kpiName,
            kpimEngineRequest: false,
          },
        })
        .then((response) => {
          this.fetchedKpi = response.data.data;
        })
        .catch((err) => {
          console.error(err);
        });
    },

    async addDataset(kpiName, index) {
      let color = this.getBackgroundColor(index);
      let newDataset = {
        label: kpiName,
        backgroundColor: color,
        borderColor: color,
        data: [],
      };

      await this.fetchedKpi.timestamp.forEach((item, index) => {
        let currentStamp = this.date.date(item);
        let startOfRange = this.date.date(this.dateRange.start);
        let endOfRange = this.date.date(this.dateRange.end);

        //if the user selects a range and the stamp is within the range
        if (this.date.isWithinRange(currentStamp, [startOfRange, endOfRange])) {
          //if the stamp does not exist in the labels
          if (!this.chartData.labels.includes(this.readableDate(item))) {
            //if it is the base kpi
            if (this.baseKpi === true) {
              this.chartData.labels.push(this.readableDate(item));
              newDataset.data.push({ x: this.readableDate(item), y: this.fetchedKpi.value[index] });
            }
            //else if it is not the base kpi
            else {
              let currentDate = this.date.date(this.readableDate(item));
              let startOfLabels = this.date.date(this.chartData.labels[0]);
              let endOfLabels = this.date.date(
                this.chartData.labels[this.chartData.labels.length - 1]
              );

              //if there is only one date in the labels
              if (startOfLabels === endOfLabels) {
                if (currentDate === startOfLabels) {
                  newDataset.data.push({
                    x: this.readableDate(item),
                    y: this.fetchedKpi.value[index],
                  });
                } else if (this.date.isBefore(currentDate, startOfLabels)) {
                  this.chartData.labels.unshift(this.readableDate(item));
                  newDataset.data.push({
                    x: this.readableDate(item),
                    y: this.fetchedKpi.value[index],
                  });
                } else if (this.date.isAfter(currentDate, startOfLabels)) {
                  this.chartData.labels.push(this.readableDate(item));
                  newDataset.data.push({
                    x: this.readableDate(item),
                    y: this.fetchedKpi.value[index],
                  });
                }
              }
              //if the date is within the range of the labels
              else if (
                startOfLabels !== endOfLabels &&
                this.date.isWithinRange(currentDate, [startOfLabels, endOfLabels])
              ) {
                for (let i = 1; i < this.chartData.labels.length; i++) {
                  //if it is between two of the labels
                  if (
                    this.date.isWithinRange(currentDate, [
                      this.date.date(this.chartData.labels[i - 1]),
                      this.date.date(this.chartData.labels[i]),
                    ])
                  ) {
                    //if the time between the labels is higher than the time scheduled
                    // or higher than double the time scheduled - 1 if rounded is 1
                    if (
                      this.date.getDiff(
                        this.date.date(this.chartData.labels[i]),
                        this.date.date(this.chartData.labels[i - 1]),
                        this.scheduleTime.time + "s"
                      ) >
                      this.scheduleTime.value +
                        (this.rounded === 1 ? this.scheduleTime.value - 1 : 0)
                    ) {
                      //insert a new date
                      this.chartData.labels.splice(i, 0, this.readableDate(item));
                      newDataset.data.push({
                        x: this.readableDate(item),
                        y: this.fetchedKpi.value[index],
                      });
                    } else {
                      //else push the value and associate it to the closest existing date, roundwed up or down
                      newDataset.data.push({
                        x: this.readableDate(this.chartData.labels[i - 1 + this.rounded]),
                        y: this.fetchedKpi.value[index],
                      });
                    }
                    break;
                  }
                }
              }
              //if the date is before the labels
              else if (this.date.isBefore(currentDate, startOfLabels)) {
                this.chartData.labels.unshift(this.readableDate(item));
                newDataset.data.push({
                  x: this.readableDate(item),
                  y: this.fetchedKpi.value[index],
                });
              }
              //if the date is after the labels
              else if (this.date.isAfter(currentDate, endOfLabels)) {
                //if rounded is higher than 0, insert a new date
                if (this.rounded > 0) {
                  this.chartData.labels.push(this.readableDate(item));
                  newDataset.data.push({
                    x: this.readableDate(item),
                    y: this.fetchedKpi.value[index],
                  });
                  //if rounded is 0 and the new date is equal or higher than the scheduled time, insert a new date
                } else if (
                  //NOTE: pls ask BE to put schedule time units in plural (that's why we have to add the 's' at the end)
                  this.date.getDiff(currentDate, endOfLabels, this.scheduleTime.time + "s") >=
                  this.scheduleTime.value
                ) {
                  this.chartData.labels.push(this.readableDate(item));
                  newDataset.data.push({
                    x: this.readableDate(item),
                    y: this.fetchedKpi.value[index],
                  });
                  //if rounded is 0 and the new date is lower than the scheduled time, push the value and associate it to the closest existing date
                } else {
                  newDataset.data.push({
                    x: this.readableDate(this.chartData.labels[this.chartData.labels.length - 1]),
                    y: this.fetchedKpi.value[index],
                  });
                }
              }
            }
          } else {
            //if label already exists
            newDataset.data.push({ x: this.readableDate(item), y: this.fetchedKpi.value[index] });
          }
        } else {
          //do nothing
        }
      });

      this.chartData.datasets.push(newDataset);

      if (this.chartData.datasets.length === this.selected.length) {
        console.log(this.chartData);
        this.updateInput = true;
        this.loading = false;
      }
    },

    async setRangeAtLoading(kpiName) {
      await this.fetchChartData(kpiName);
      this.dateRange = {
        start: this.fetchedKpi.timestamp[0],
        end: this.fetchedKpi.timestamp[this.fetchedKpi.timestamp.length - 1],
        rangeAtLoading: true,
      };
    },

    getKPIsList() {
      this.loading = true;
      axios
        .get(`${this.apiUrl}/${this.realm}/kpi`, {
          withCredentials: true,
        })
        .then((response) => {
          this.KPIs = response.data.data;
          this.loading = false;

          this.KPIs.sort((a, b) => {
            const dateA = new Date(a.lastUpdate);
            const dateB = new Date(b.lastUpdate);
            return dateA - dateB;
          });
        })
        .catch((err) => {
          this.setError(err, false);
          this.loading = false;
        });
    },

    sortAZ() {
      this.KPIs.sort((a, b) => a.name.localeCompare(b.name));
      this.sort = "ZA";
    },

    sortZA() {
      this.KPIs.sort((a, b) => b.name.localeCompare(a.name));
      this.sort = "AZ";
    },
  },
};
