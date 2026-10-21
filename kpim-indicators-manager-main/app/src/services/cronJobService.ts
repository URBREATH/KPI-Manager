import * as k8s from "@kubernetes/client-node";
import {createResponseDto, JobDto, JobStatus, ResponseDTO} from "@he_hurbreath/kpi-models-support-main";
import * as $log from "../modules/Logger";
import {
    KPIM_INDICATORS_MANAGER_API_URL,
    KAFKA_AUTH_CA,
    KAFKA_AUTH_CERT,
    KAFKA_AUTH_KEY,
    KAFKA_BROKERS,
    KPIM_ENGINE_IMAGE,
    KPIM_CONNECTORS_MANAGER_URL,
    KPIM_LISTENERS_MANAGER_API_URL,
    KPIM_MEASURE_MANAGER_API_URL,
    SERVICE_ACCOUNT_NAME,
    KAFKA_AUTH_ENABLED,
    K8S_NAMESPACE
} from "../utils/constants";
import {timeDTOToCron} from "../utils/cronJobUtils";
import {configureKubeClient, getK8sConfigurations, logErrorDetails} from "./K8sService";
import {KpiError} from "../utils/enum";
import {updateJobStatusById} from "./kpiService";

export async function createCronJobService(kpiDto: object, cronName: string): Promise<ResponseDTO> {
    try {
        $log.info("jobService", "Starting createCronJobService with kpiDto: " + JSON.stringify(kpiDto),{ durationMs:0});
        const k8sBatchV1Api: k8s.BatchV1Api = await configureKubeClient();
        const cronJobObject = await createCronJobObject(kpiDto, cronName);
        const createNamespacedCronJobResult = await createNamespacedCronJob(k8sBatchV1Api, K8S_NAMESPACE, cronJobObject);
        return createResponseDto("CronJob created", 200, createNamespacedCronJobResult);
    } catch (error) {
        $log.error("jobService", "Error in the creation of the cronJob: " + error.message);
        logErrorDetails(error);
        return createResponseDto("Error creating cronJob", 400, {"error": KpiError.CREATING_CRON_JOB});
    }
}

async function createNamespacedCronJob(apiClient: k8s.BatchV1Api, namespace: string, cronJob: k8s.V1CronJob): Promise<ResponseDTO> {
    try {
        $log.info("jobService", "Starting createNamespacedCronJob with namespace: " + namespace + " and cronJob: " + JSON.stringify(cronJob),{ durationMs:0});

        const response = await apiClient.createNamespacedCronJob(namespace, cronJob);
        $log.info("jobService", "API call to createNamespacedCronJob successful. Response: " + JSON.stringify(response),{ durationMs:0});

        if (response.body.metadata) {
            $log.info("jobService", "CronJob created: " + <string>response.body.metadata.name,{ durationMs:0});
            return createResponseDto("CronJob created", 200, response.body.metadata);
        } else {
            $log.info("jobService", "No metadata in response body.",{ durationMs:0});
            throw new Error("No metadata in response body.")
        }
    } catch (error) {
        $log.error("jobService", "Error in the creation of the cronJob: " + error.message);
        logErrorDetails(error);
        return createResponseDto("Error creating cronJob", 400, {"error": KpiError.CREATING_CRON_JOB});
    }
}

async function deleteNamespacedCronJob(apiClient: k8s.BatchV1Api, namespace: string, jobId: string): Promise<ResponseDTO> {
    try {
        const response = await apiClient.deleteNamespacedCronJob(jobId, namespace, undefined, undefined, 0, undefined, "Background");
        if (response.body.metadata) {
            $log.info("jobService", "CronJob deleted: " + <string>response.body.metadata,{ durationMs:0});
            console.log(JSON.stringify(response))
            return createResponseDto("cronJob deleted", 200, response.body.metadata);
        }
    } catch (error) {
        $log.error("jobService", "Error " + error);
        return createResponseDto("Error deleting cronJob", 400, error);
    }
    return createResponseDto("Error deleting cronJob", 500, {});
}

export async function deleteCronJobService(jobId: string) {
    const k8sBatchV1Api: k8s.BatchV1Api = await configureKubeClient()
    return deleteNamespacedCronJob(k8sBatchV1Api, K8S_NAMESPACE, jobId)
}

export async function executionStateCronJobService(cronJobId: string, suspend: boolean) {
    const k8sBatchV1Api: k8s.BatchV1Api = await configureKubeClient()
    try {
        const cronJob = await k8sBatchV1Api.readNamespacedCronJob(cronJobId, K8S_NAMESPACE);
        const oldStateCronJob: boolean | undefined = cronJob.body.spec!.suspend;
        cronJob.body.spec!.suspend = suspend;
        await k8sBatchV1Api.replaceNamespacedCronJob(cronJobId, K8S_NAMESPACE, cronJob.body);
        const resultUpdateJobStatus: ResponseDTO = await updateJobStatusById(cronJobId, suspend ? JobStatus.PENDING : JobStatus.RUNNING);
        if (resultUpdateJobStatus.status !== 200) {
            cronJob.body.spec!.suspend = oldStateCronJob;
            await k8sBatchV1Api.replaceNamespacedCronJob(cronJobId, K8S_NAMESPACE, cronJob.body);
        }
        console.log(`CronJob ${cronJobId} in namespace ${K8S_NAMESPACE} is now ${suspend ? 'paused' : 'resumed'}.`);
        return createResponseDto(`CronJob ${cronJobId} in namespace ${K8S_NAMESPACE} is now ${suspend ? 'paused' : 'resumed'}.`, 200, {});
    } catch (error) {
        console.error('Error updating CronJob:', error);
        return createResponseDto('Error updating CronJob', 200, {});
    }
}

async function createCronJobObject(kpiDto: any, cronName: string) {
    $log.info("createCronJob", cronName,{ durationMs:0})
    const envVars = [
        {name: 'KPI_ID', value: kpiDto.id },
        {name: "TARGET_LOCATION_OUTPUT", value: 'kafka'},
        {name: "KAFKA_AUTH_ENABLED", value: KAFKA_AUTH_ENABLED.toString()},
        { name: 'KAFKA_BROKERS', value: KAFKA_BROKERS },
        {name: `KAFKA_AUTH_CA`, value: KAFKA_AUTH_CA},
        {name: `KAFKA_AUTH_KEY`, value: KAFKA_AUTH_KEY},
        {name: `KAFKA_AUTH_CERT`, value: KAFKA_AUTH_CERT},
        {name: 'SERVER_MODE', value: 'false'},
        {name: 'KPIM_LISTENERS_MANAGER_API_URL', value: KPIM_LISTENERS_MANAGER_API_URL},
        {name: 'KPIM_CONNECTORS_MANAGER_URL', value: KPIM_CONNECTORS_MANAGER_URL},
        {name: 'KPIM_MEASURE_MANAGER_API_URL', value: KPIM_MEASURE_MANAGER_API_URL},
        {name: 'KPIM_INDICATORS_MANAGER_API_URL', value: KPIM_INDICATORS_MANAGER_API_URL},

    ];

    const Job: JobDto = kpiDto.formula.job;
    const { volumeMounts, imagePullSecrets, volumes } = getK8sConfigurations(KAFKA_AUTH_ENABLED);

   return {
    apiVersion: 'batch/v1',
    kind: 'CronJob',
    metadata: {
        name: cronName
    },
    spec: {
        schedule: timeDTOToCron(Job.schedule),
        concurrencyPolicy: 'Forbid',
        startingDeadlineSeconds: 120,
        ttlSecondsAfterFinished: 300,
        jobTemplate: {
            spec: {
                activeDeadlineSeconds: 600,
                backoffLimit: 2,
                template: {
                    spec: {
                        restartPolicy: 'Never',
                        serviceAccountName: SERVICE_ACCOUNT_NAME,
                        imagePullSecrets: [{name: 'registry-secret'}],
                        volumes: volumes,
                        containers: [{
                            name: cronName,
                            image: KPIM_ENGINE_IMAGE,
                            env: envVars,
                            volumeMounts: volumeMounts,
                            resources: {
                                requests: {
                                    cpu: '250m',
                                    memory: '256Mi'
                                },
                                limits: {
                                    cpu: '1000m',
                                    memory: '1Gi'
                                }
                            }
                        }],
                    }
                },
            }
        }
    }
};
}
