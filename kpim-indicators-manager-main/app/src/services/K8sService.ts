import * as $log from "../modules/Logger";
import * as k8s from "@kubernetes/client-node";
import {K8S_NAMESPACE, KAFKA_AUTH_ENABLED, KUBE_CONFIG_PATH} from "../utils/constants";


export async function configureKubeClient() {
    try {
         const t0 = Date.now();
        $log.info("K8sService", "Configuring Kubernetes client",{ durationMs:t0});
        const kc = new k8s.KubeConfig();
        if (KUBE_CONFIG_PATH){
            $log.info("K8sService", "Loading kube config from file",{ durationMs:t0})
            kc.loadFromFile(KUBE_CONFIG_PATH);
        }else {
            $log.info("K8sService", "Loading kube config from cluster",{ durationMs:t0})
            kc.loadFromCluster();
            $log.info("K8Service", "kebe config loaded ",{ durationMs:t0})
        }
          $log.info("K8sService", "KubeConfig loaded", {
            durationMs: Date.now() - t0
        });
       const api = kc.makeApiClient(k8s.BatchV1Api);
          $log.info("K8sService", "BatchV1Api client created", {
            durationMs: Date.now() - t0
        });
        return api;
    } catch (error) {
        console.error("Failed to configure Kubernetes client:", error);
        throw new Error("Failed to configure Kubernetes client");
    }
}

export function getK8sConfigurations(KAFKA_AUTH_ENABLED: boolean) {
    if (!KAFKA_AUTH_ENABLED) {
        $log.warn("K8s Service", "Kafka auth is disabled. This is not recommended for production environments.")
        return {
            volumeMounts: [],
            imagePullSecrets: [],
            volumes: []
        };
    } else {
        $log.info("connectorService", "Kafka auth is enabled, please verify your certificates",{ durationMs:0})
        return {
            volumeMounts: [
                {
                    name: 'secret-dekafka-cluster-ca-cert',
                    mountPath: '/etc/secret-volume/ca.crt',
                    subPath: 'ca.crt',
                    readOnly: true
                },
                {
                    name: `kafka-${K8S_NAMESPACE}-user`,
                    mountPath: '/etc/user-secret-volume/user.crt',
                    subPath: 'user.crt',
                    readOnly: true
                },
                {
                    name: `kafka-${K8S_NAMESPACE}-user`,
                    mountPath: '/etc/user-secret-volume/user.key',
                    subPath: 'user.key',
                    readOnly: true
                }
            ],
            imagePullSecrets: [{ name: 'registry-secret' }],
            volumes: [
                {
                    name: 'secret-dekafka-cluster-ca-cert',
                    secret: {
                        secretName: 'dekafka-cluster-ca-cert',
                        items: [{ key: 'ca.crt', path: 'ca.crt' }]
                    }
                },
                {
                    name: `kafka-${K8S_NAMESPACE}-user`,
                    secret: {
                        secretName: `kafka-${K8S_NAMESPACE}-user`,
                        items: [{ key: 'user.crt', path: 'user.crt' }, { key: 'user.key', path: 'user.key' }]
                    }
                }
            ]
        };
    }
}

export function logErrorDetails(error: any) {
    if (error.response) {
        $log.info("jobService", "Error response status: " + error.response.statusCode,{ durationMs:0});
        $log.info("jobService", "Error response headers: " + JSON.stringify(error.response.headers),{ durationMs:0});
        $log.info("jobService", "Error response body: " + JSON.stringify(error.response.body),{ durationMs:0});
    }
    if (error.body) {
        $log.info("jobService", "Error body: " + JSON.stringify(error.body),{ durationMs:0});
    }
    if (error.statusCode) {
        $log.info("jobService", "Error statusCode: " + error.statusCode,{ durationMs:0});
    }
    $log.info("jobService", "Error stack: " + error.stack,{ durationMs:0});
}
