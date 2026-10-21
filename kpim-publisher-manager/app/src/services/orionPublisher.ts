import axios from 'axios';
import { ORION_URL } from '../utils/constants';

export async function publishToOrion(entity: any) {
    console.log('pubblico su orion');
    const response = await axios.post(
        `${ORION_URL}/ngsi-ld/v1/entities`,
        entity,
        {
            headers: {
                'Content-Type': 'application/ld+json'
            }
        }
    );

    return {
        status: response.status,
        location: response.headers.location || response.headers.Location || null,
        data: response.data
    };
}

export function getOrionKpiEntityUrl(kpiId: string): string {
    const entityId = `urn:ngsi-ld:KPI:${kpiId}`;
    return `${ORION_URL.replace(/\/+$/, '')}/ngsi-ld/v1/entities/${encodeURIComponent(entityId)}`;
}

export async function getOrionKpiStatus(kpiId: string) {
    const entityUrl = getOrionKpiEntityUrl(kpiId);
    try {
        const response = await axios.get(entityUrl, {
            headers: { Accept: 'application/ld+json' }
        });
        return {
            published: true,
            entityId: response.data?.id || response.data?.['@id'] || `urn:ngsi-ld:KPI:${kpiId}`,
            entityUrl,
            entity: response.data
        };
    } catch (error: any) {
        if (error?.response?.status === 404) {
            return { published: false, entityUrl };
        }
        throw error;
    }
}

export async function deleteKpiFromOrion(kpiId: string) {
    const entityUrl = getOrionKpiEntityUrl(kpiId);
    const response = await axios.delete(entityUrl);
    return { entityUrl, status: response.status };
}