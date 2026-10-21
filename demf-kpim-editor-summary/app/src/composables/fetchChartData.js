import { ref } from "vue";
import axios from "axios";

export async function fetchChartData(apiUrl, realm) {
  const kpiName = ref(JSON.parse(sessionStorage.getItem("kpi")).name);

  function readableDate(itemDate) {
    const timestamp = itemDate;

    // Create a new Date object from the timestamp
    const date = new Date(timestamp);

    // Time zone offset in hours (for UTC+2, this is 2)
    const timezoneOffset = 2;

    // Extract the components
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Months are zero-indexed
    const year = date.getUTCFullYear();
    const hours = String(date.getUTCHours() + timezoneOffset).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    const seconds = String(date.getUTCSeconds()).padStart(2, "0");

    // Format the date and time
    const formattedDate = `${day}/${month}/${year} at ${hours}:${minutes}:${seconds}`;
    return formattedDate;
  }

  const data = ref({
    message: "HistoricalData",
    data: {
      value: [17, 65, 36, 25, 58, 73, 13, 50, 28, 19, 92, 84],
      timestamp: [
        "1970-01-01T00:28:40.529780612Z",
        "1970-01-01T00:28:41.529956753Z",
        "1970-01-01T00:28:42.530068146Z",
        "1970-01-01T00:28:43.530156731Z",
        "1970-01-01T00:28:44.530256123Z",
        "1970-01-01T00:28:45.530345678Z",
        "1970-01-01T00:28:46.530456789Z",
        "1970-01-01T00:28:47.530567890Z",
        "1970-01-01T00:28:48.530678901Z",
        "1970-01-01T00:28:49.530789012Z",
        "1970-01-01T00:28:50.530890123Z",
        "1971-01-01T00:28:51.530901234Z",
      ],
      statistics: {
        min: 0,
        max: 100,
        avg: 45.4567,
      },
    },
    status: 200,
  });

  const mockupAlert = ref(true);

  await axios
    .get(`${apiUrl}/${realm}/historical-data/query/all`, {
      withCredentials: true,
      params: {
        bucket: realm,
        measurement: kpiName.value,
        kpimEngineRequest: false,
      },
    })
    .then((response) => {
      if (response.data.data.value.length > 0) {
        data.value.data = response.data.data;
        mockupAlert.value = false;
      }
    })
    .catch((err) => {
      console.error(err);
    });

  const chartData = {
    labels: data.value.data.timestamp.map((item) => readableDate(item)),
    datasets: [
      {
        label: kpiName.value,
        data: data.value.data.value,
      },
    ],
  };

  return { chartData, data, mockupAlert };
}
