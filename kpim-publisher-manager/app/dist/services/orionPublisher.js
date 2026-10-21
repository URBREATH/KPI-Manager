"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishToOrion = publishToOrion;
exports.getOrionKpiEntityUrl = getOrionKpiEntityUrl;
exports.getOrionKpiStatus = getOrionKpiStatus;
exports.deleteKpiFromOrion = deleteKpiFromOrion;
const tslib_1 = require("tslib");
const axios_1 = tslib_1.__importDefault(require("axios"));
const constants_1 = require("src/utils/constants");
async function publishToOrion(entity) {
    console.log('pubblico su orion');
    const response = await axios_1.default.post(`${constants_1.ORION_URL}/ngsi-ld/v1/entities`, entity, {
        headers: {
            'Content-Type': 'application/ld+json'
        }
    });
    return {
        status: response.status,
        location: response.headers.location || response.headers.Location || null,
        data: response.data
    };
}
function getOrionKpiEntityUrl(kpiId) {
    const entityId = `urn:ngsi-ld:KPI:${kpiId}`;
    return `${constants_1.ORION_URL.replace(/\/+$/, '')}/ngsi-ld/v1/entities/${encodeURIComponent(entityId)}`;
}
async function getOrionKpiStatus(kpiId) {
    const entityUrl = getOrionKpiEntityUrl(kpiId);
    try {
        const response = await axios_1.default.get(entityUrl, {
            headers: { Accept: 'application/ld+json' }
        });
        return { published: true, entityUrl, entity: response.data };
    }
    catch (error) {
        if (error?.response?.status === 404) {
            return { published: false, entityUrl };
        }
        throw error;
    }
}
async function deleteKpiFromOrion(kpiId) {
    const entityUrl = getOrionKpiEntityUrl(kpiId);
    const response = await axios_1.default.delete(entityUrl);
    return { entityUrl, status: response.status };
}
