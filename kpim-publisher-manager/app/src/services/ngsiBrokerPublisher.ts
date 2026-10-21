import axios from 'axios';
import { NGSI_BROKER_URL } from '../utils/constants';




type PublishResponse = {
  distributionId: string;
  datasetId: string;
};
function removeEmptyFields(obj: any) {
  const cleaned: any = {};

  Object.keys(obj).forEach((key) => {
    const value = obj[key];

    if (value !== "" && value !== null && value !== undefined) {
      cleaned[key] = value;
    }
  });

  return cleaned;
}

export async function publishNgsiBroker(
  distribution,
  dataset
):Promise<PublishResponse>{
  try {
    console.log(distribution);
    console.log(dataset);
    // 🔹 1. Publish Distribution
   const distributionRes = await axios.post(
      `${NGSI_BROKER_URL}/api/distributiondcatap`,
      distribution
    );

    const datasetCleaned= removeEmptyFields(dataset);
   // 🔹 3. Publish Dataset
    const datasetRes = await axios.post(
       `${NGSI_BROKER_URL}/api/dataset`,
      datasetCleaned
    );
  
    const distributionId= distribution.id;
    const datasetId = dataset.id

 

    
    return {
  distributionId,
  datasetId
    };
  } catch (error: any) {
  console.error(
    "Publish error:",
    error?.response?.status,
    error?.response?.data
  );

  throw error;
}
}
