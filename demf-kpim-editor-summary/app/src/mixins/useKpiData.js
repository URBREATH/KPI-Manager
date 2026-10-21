import axios from "axios";
import { ref } from "vue";

export function useKpiData(api, tenantId) {
  const kpiData = ref(null);
  const loading = ref(false);
  const error = ref(null);

  async function fetchKpiData(id) {
    loading.value = true;
    try {
      const response = await axios.get(`${api}/${tenantId}/kpi/${id}`, {
        withCredentials: true,
      });
      return response.data.data;
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  }

  return {
    kpiData,
    loading,
    error,
    fetchKpiData,
  };
}
