"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishNgsiBroker = publishNgsiBroker;
const tslib_1 = require("tslib");
const axios_1 = tslib_1.__importDefault(require("axios"));
const constants_1 = require("src/utils/constants");
function removeEmptyFields(obj) {
    const cleaned = {};
    Object.keys(obj).forEach((key) => {
        const value = obj[key];
        if (value !== "" && value !== null && value !== undefined) {
            cleaned[key] = value;
        }
    });
    return cleaned;
}
async function publishNgsiBroker(distribution, dataset) {
    try {
        console.log(distribution);
        console.log(dataset);
        // 🔹 1. Publish Distribution
        const distributionRes = await axios_1.default.post(`${constants_1.NGSI_BROKER_URL}/api/distributiondcatap`, distribution);
        const datasetCleaned = removeEmptyFields(dataset);
        // 🔹 3. Publish Dataset
        const datasetRes = await axios_1.default.post(`${constants_1.NGSI_BROKER_URL}/api/dataset`, datasetCleaned);
        const distributionId = distribution.id;
        const datasetId = dataset.id;
        return {
            distributionId,
            datasetId
        };
    }
    catch (error) {
        console.error("Publish error:", error?.response?.status, error?.response?.data);
        throw error;
    }
}
