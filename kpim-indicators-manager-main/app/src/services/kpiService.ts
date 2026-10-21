import {
    createResponseDto,
    Formula,
    Job, JobStatus,
    Kpi,
    KpiDto,
    mapKpiDaoToKpiDto,
    mapToClass,
    ResponseDTO, UserDto
} from '@he_hurbreath/kpi-models-support-main';
import {AppDataSource} from '../utils/dbUtils';

import {In} from 'typeorm';
import {checkIfInfluxReceivedTheData, formulaPreviewService} from "./jobService";
import {createCronJobService, deleteCronJobService} from "./cronJobService";
import {KpiError} from "../utils/enum";
import {generateUniqueCronJobName} from "../utils/cronJobUtils";
import {dependencyStatus} from "@he_hurbreath/kpi-models-support-main/dist/models/utils/enum";
import {checkOwnership, filterMeasuresByAccess} from "./entityPermissionService";
import * as $log from '../modules/Logger';
import { randomBytes } from 'crypto';
import axios from 'axios';
import { KPIM_LISTENERS_MANAGER_API_URL } from '../utils/constants';
import { OrionPublication } from '../models/OrionPublication';

const KpiRepository = AppDataSource.getRepository(Kpi);
const JobRepository = AppDataSource.getRepository(Job);
const OrionPublicationRepository = AppDataSource.getRepository(OrionPublication);

export async function getKpi(user: UserDto): Promise<ResponseDTO> {
    let foundKpisDtos: KpiDto[] = [];
    let foundKpis: Kpi[] = await KpiRepository.find({
        relations: ['formula_FK', 'job_FK'],
    });
    foundKpis = filterMeasuresByAccess(foundKpis, user);
    const publications = foundKpis.length
        ? await OrionPublicationRepository.find({
            where: {
                kpiId: In(foundKpis.map((kpi) => kpi.id_PK)),
                tenantId: user['X-Tenant-Id']
            }
        })
        : [];
    const publicationByKpiId = new Map(publications.map((publication) => [publication.kpiId, publication]));
    for (let kpi of foundKpis) {
        const publication = publicationByKpiId.get(kpi.id_PK);
        foundKpisDtos.push({
            ...mapKpiDaoToKpiDto(kpi) as any,
            orionPublication: publication
                ? {
                    published: true,
                    entityId: publication.entityId,
                    entityUrl: publication.entityUrl,
                    publishedAt: publication.publishedAt
                }
                : { published: false }
        } as KpiDto);
    }
    return createResponseDto('Kpi found', 200, foundKpisDtos);
}

export async function saveOrionPublication(
    kpiId: string,
    entityId: string,
    entityUrl: string,
    user: UserDto
): Promise<ResponseDTO> {
    const kpi = await KpiRepository.findOne({ where: { id_PK: kpiId } });
    if (!kpi) return createResponseDto('Kpi not found', 404, {});
    if (kpi.tenantId !== user['X-Tenant-Id'] || !checkOwnership([kpi], user, 'UPDATE')) {
        return createResponseDto('Forbidden', 403, {});
    }
    if (!entityId || !entityUrl) {
        return createResponseDto('Orion entity ID and URL are required', 400, {});
    }

    const publication = OrionPublicationRepository.create({
        kpiId,
        tenantId: kpi.tenantId,
        entityId,
        entityUrl
    });
    await OrionPublicationRepository.save(publication);
    return createResponseDto('Orion publication saved', 200, {
        published: true,
        entityId,
        entityUrl,
        publishedAt: publication.publishedAt
    });
}

export async function clearOrionPublication(kpiId: string, user: UserDto): Promise<ResponseDTO> {
    const kpi = await KpiRepository.findOne({ where: { id_PK: kpiId } });
    if (!kpi) return createResponseDto('Kpi not found', 404, {});
    if (kpi.tenantId !== user['X-Tenant-Id'] || !checkOwnership([kpi], user, 'UPDATE')) {
        return createResponseDto('Forbidden', 403, {});
    }

    await OrionPublicationRepository.delete({ kpiId, tenantId: kpi.tenantId });
    return createResponseDto('Orion publication state cleared', 200, { published: false });
}

export async function createKpi(kpiDto: KpiDto, user: UserDto): Promise<ResponseDTO> {
    const newKpi = mapToClass(kpiDto, Kpi);
    const cronJobName: string = generateUniqueCronJobName();
    newKpi.ownerId = user['X-User-Id'];
    newKpi.tenantId = user['X-Tenant-Id'];
    newKpi.job_FK.status = JobStatus.RUNNING;
    newKpi.job_FK.cronJobId = cronJobName;
    await KpiRepository.save(newKpi);
    const result: any = mapKpiDaoToKpiDto(newKpi);
    if (!result) {
        return createResponseDto('Kpi not created', 400, {"error": KpiError.KPI_CANNOT_BE_CREATED});
    }
    const firstExecution: boolean = true;
    try {
        $log.info("kpiService", "Before formulaPreviewService");
        const createJobServiceResult: ResponseDTO = await formulaPreviewService(result.formula, firstExecution, result.name, result.id)
         $log.info("kpiService", "After formulaPreviewService");
        if (createJobServiceResult.status !== 200){
              $log.error("kpiService", "formulaPreviewService failed");
              throw new Error("Error creating job");
        } 
        $log.info("kpiService", "Before checkIfInfluxReceivedTheData");

        const firstExecutionResult: boolean = await checkIfInfluxReceivedTheData(result.name);
        $log.info(
   "kpiService",
   `After checkIfInfluxReceivedTheData: ${firstExecutionResult}`
);
        if (!firstExecutionResult){
             $log.error("kpiService", "Influx did not receive data");
             throw new Error("First execution did not receive data in Influx");

        } 
    }catch (error)
    {
         console.error("CREATE KPI ERROR");
    console.error(error);

    const errorResponse = (error as any)?.response as { body?: unknown } | undefined;
    if (errorResponse) {
        console.error(errorResponse.body);
    }

    $log.error(
       "kpiService",
       "Create KPI failed: " + JSON.stringify(error)
    );
        await deleteKpi(result.id, user)
        return createResponseDto('Error creating cron job', 500, {"error": KpiError.CREATING_CRON_JOB});
    }
    $log.info("kpiService", "Before createCronJobService");
    await createCronJobService(result, cronJobName)
     $log.info("kpiService", "After createCronJobService");
    return createResponseDto('Kpi created', 201, result);
}

/*export async function deleteKpi(ids: string, user: UserDto): Promise<ResponseDTO> {
    const toBeDeletedIds: string[] = ids.split(',').map(id => id.trim());
    let deletedKpiIds: string[] = [];

    try {
        await AppDataSource.transaction(async transactionalEntityManager => {
            let kpis: Kpi[] = await transactionalEntityManager.find(Kpi, {
                where: { id_PK: In(toBeDeletedIds) },
                relations: ['formula_FK', 'job_FK']
            });

            if (kpis.length === 0) {
                throw new Error('No Kpi found');
            }

            if (user) {
                if (!checkOwnership(kpis, user, 'DELETE')) throw new Error('User does not have permission to delete this KPIs');
            }

            const formulaIdsToDelete = kpis
                .filter(kpi => kpi.formula_FK)
                .map(kpi => kpi.formula_FK.id_PK);

            const jobIdsToDelete = kpis
                .filter(kpi => kpi.job_FK)
                .map(kpi => kpi.job_FK.id_PK);

            const cronJobToDelete = kpis
                    .filter(kpi => kpi.job_FK)
                    .map(kpi => kpi.job_FK.cronJobId);


            await transactionalEntityManager.delete(Kpi, { id_PK: In(toBeDeletedIds) });

            if (formulaIdsToDelete.length > 0) {
                await transactionalEntityManager.delete(Formula, { id_PK: In(formulaIdsToDelete) });
            }

            if (jobIdsToDelete.length > 0) {
                await transactionalEntityManager.delete(Job, { id_PK: In(jobIdsToDelete) });

            }
            deletedKpiIds = toBeDeletedIds;

            await iterativeUpdateStatus(toBeDeletedIds);
            for (let cronJob of cronJobToDelete) {
                await deleteCronJobService(cronJob)
            }
        });

        return createResponseDto('Kpi deleted', 204, deletedKpiIds);

    } catch (error) {
        return createResponseDto(error.message, 200, {"error": KpiError.KPI_CANNOT_BE_DELETED});
    }
}*/
export async function deleteKpi(ids: string, user: UserDto): Promise<ResponseDTO> {

    const toBeDeletedIds: string[] = ids.split(',').map(id => id.trim());

    let deletedKpiIds: string[] = [];

    // 👇 array esterno alla transaction
    let cronJobsToDelete: string[] = [];

    try {

        await AppDataSource.transaction(async transactionalEntityManager => {

            let kpis: Kpi[] = await transactionalEntityManager.find(Kpi, {
                where: { id_PK: In(toBeDeletedIds) },
                relations: ['formula_FK', 'job_FK']
            });

            if (kpis.length === 0) {
                throw new Error('No Kpi found');
            }

            if (user) {
                if (!checkOwnership(kpis, user, 'DELETE')) {
                    throw new Error('User does not have permission to delete this KPIs');
                }
            }

            const formulaIdsToDelete = kpis
                .filter(kpi => kpi.formula_FK)
                .map(kpi => kpi.formula_FK.id_PK);

            const jobIdsToDelete = kpis
                .filter(kpi => kpi.job_FK)
                .map(kpi => kpi.job_FK.id_PK);

            // 👇 SALVI QUI I CRONJOB
            cronJobsToDelete = kpis
                .filter(kpi => kpi.job_FK)
                .map(kpi => kpi.job_FK.cronJobId);

            await transactionalEntityManager.delete(Kpi, {
                id_PK: In(toBeDeletedIds)
            });

            await transactionalEntityManager.delete(OrionPublication, {
                kpiId: In(toBeDeletedIds)
            });

            if (formulaIdsToDelete.length > 0) {
                await transactionalEntityManager.delete(Formula, {
                    id_PK: In(formulaIdsToDelete)
                });
            }

            if (jobIdsToDelete.length > 0) {
                await transactionalEntityManager.delete(Job, {
                    id_PK: In(jobIdsToDelete)
                });
            }

            deletedKpiIds = toBeDeletedIds;

            await iterativeUpdateStatus(toBeDeletedIds);
        });

        // 👇 FUORI DALLA TRANSACTION
        for (const cronJob of cronJobsToDelete) {

            try {

                await deleteCronJobService(cronJob);

            } catch (error) {

                console.error("Error deleting cronjob", cronJob, error);

            }
        }

        return createResponseDto('Kpi deleted', 204, deletedKpiIds);

    } catch (error: any) {

        return createResponseDto(
            error.message,
            500,
            { error: KpiError.KPI_CANNOT_BE_DELETED }
        );
    }
}

export async function getKpiById(id: string): Promise<ResponseDTO> {
    let kpiDto: KpiDto | null = null;
    const kpiFound: Kpi | null = await KpiRepository.findOne({
        where: { id_PK: id },
        relations: ['formula_FK', 'job_FK']
    });
    if (kpiFound) {
        kpiDto = <KpiDto>mapKpiDaoToKpiDto(kpiFound);
    }
    return createResponseDto('Kpi found', 200, kpiDto || {});
}

export async function createPublicKpiLink(id: string, user: UserDto): Promise<ResponseDTO> {
    const kpi = await KpiRepository.findOne({ where: { id_PK: id } });
    if (!kpi) return createResponseDto('Kpi not found', 404, {});
    if (kpi.ownerId !== user['X-User-Id'] || kpi.tenantId !== user['X-Tenant-Id']) {
        return createResponseDto('Forbidden', 403, {});
    }

    const scope: any = { ...(kpi.scope ?? {}) };
    const token = /^[a-f0-9]{64}$/i.test(scope.publicToken ?? '')
        ? scope.publicToken
        : randomBytes(32).toString('hex');
    if (scope.publicToken !== token) {
        kpi.scope = { ...scope, publicToken: token } as any;
        await KpiRepository.save(kpi);
    }
    return createResponseDto('Public KPI link created', 200, { token });
}

export async function revokePublicKpiLink(id: string, user: UserDto): Promise<ResponseDTO> {
    const kpi = await KpiRepository.findOne({ where: { id_PK: id } });
    if (!kpi) return createResponseDto('Kpi not found', 404, {});
    if (kpi.ownerId !== user['X-User-Id'] || kpi.tenantId !== user['X-Tenant-Id']) {
        return createResponseDto('Forbidden', 403, {});
    }

    const scope: any = { ...(kpi.scope ?? {}) };
    delete scope.publicToken;
    kpi.scope = scope;
    await KpiRepository.save(kpi);
    return createResponseDto('Public KPI link revoked', 200, {});
}

export async function getPublicKpiByToken(token: string): Promise<ResponseDTO> {
    const kpi = await KpiRepository.createQueryBuilder('kpi')
        .leftJoinAndSelect('kpi.formula_FK', 'formula')
        .leftJoinAndSelect('kpi.job_FK', 'job')
        .where("kpi.scope ->> 'publicToken' = :token", { token })
        .getOne();

    if (!kpi) return createResponseDto('Public KPI not found', 404, {});

    let history = { timestamp: [], value: [] };
    try {
        const historyResponse = await axios.get(
            `${KPIM_LISTENERS_MANAGER_API_URL}/api/v1/historical-data/query/all`,
            {
                params: {
                    bucket: kpi.tenantId,
                    measurement: kpi.name,
                    kpimEngineRequest: false
                },
                timeout: 10000
            }
        );
        const historyData = historyResponse.data?.data;
        if (Array.isArray(historyData?.value) && Array.isArray(historyData?.timestamp)) {
            const start = Math.max(0, historyData.value.length - 50);
            history = {
                value: historyData.value.slice(start),
                timestamp: historyData.timestamp.slice(start)
            };
        }
    } catch (error) {
        $log.warn('kpiService', `Could not load public KPI history for ${kpi.id_PK}: ${error}`);
    }

    return createResponseDto('Public KPI found', 200, {
        ...toPublicKpiData(kpi),
        history
    });
}

export async function getPublicKpis(): Promise<ResponseDTO> {
    const kpis = await KpiRepository.createQueryBuilder('kpi')
        .leftJoinAndSelect('kpi.formula_FK', 'formula')
        .leftJoinAndSelect('kpi.job_FK', 'job')
        .where("kpi.scope ->> 'publicToken' IS NOT NULL")
        .orderBy('kpi.last_update', 'DESC')
        .getMany();

    const publicKpis = kpis.map((kpi) => {
        const publicData: any = mapKpiDaoToKpiDto(kpi);
        // Sharing permissions are private collaboration metadata; don't expose them publicly.
        delete publicData.scope;
        return {
            ...publicData,
            publicToken: (kpi.scope as any)?.publicToken
        };
    });

    return createResponseDto('Public KPIs found', 200, publicKpis);
}

function toPublicKpiData(kpi: Kpi): object {
    const publicData: any = mapKpiDaoToKpiDto(kpi);
    delete publicData.scope;
    return publicData;
}

export async function updateLastValueKpi(id: string, lastValue: number): Promise<ResponseDTO> {
    try {
        const kpi: Kpi | null = await KpiRepository.findOne({
            where: { id_PK: id },
            relations: ['formula_FK', 'job_FK']
        });

        if (!kpi) {
            return createResponseDto('Kpi not found', 404, {"error:": KpiError.KPI_NOT_FOUND});
        }
        kpi.last_value = lastValue;
        await KpiRepository.save(kpi);
        return createResponseDto('Kpi updated successfully', 200, <KpiDto>mapKpiDaoToKpiDto(kpi));
    } catch (error) {
        return createResponseDto('Error updating Kpi', 500, { "error": KpiError.KPI_CANNOT_BE_UPDATED });
    }
}

export async function updateJobStatusById(cronJobId: string, jobStatus: JobStatus): Promise<ResponseDTO> {
    try {
        await JobRepository.update({cronJobId: cronJobId}, { status: jobStatus });
    }
    catch(error){
        return createResponseDto('Error updating Job', 500, { "error": KpiError.JOB_CANNOT_BE_UPDATED});
}
    return createResponseDto('Job updated successfully', 200, {cronJobId: cronJobId, status: jobStatus})
}

export async function updateKpiById(id: string, body: any, user: UserDto): Promise<ResponseDTO> {
    try {
        return await AppDataSource.transaction(async transactionalEntityManager => {
            const kpi = await transactionalEntityManager.findOne(Kpi, {
                where: { id_PK: id },
                relations: ['formula_FK', 'job_FK']
            });

            if (!kpi) {
                return createResponseDto('Kpi not found', 404, {"error:": KpiError.KPI_NOT_FOUND});
            }
            if (kpi.dependency_status === dependencyStatus.warning) return createResponseDto('Kpi cannot be updated', 403, {"error": KpiError.KPI_CANNOT_BE_UPDATED})
            if (user && kpi){
                if (!checkOwnership([kpi], user, 'UPDATE')) throw new Error('User does not have permission');
            }

            if (kpi.name === body.name) {
                delete body.name;
            }

            const publicToken = (kpi.scope as any)?.publicToken;
            transactionalEntityManager.merge(Kpi, kpi, mapToClass(body, Kpi));
            if (publicToken) {
                kpi.scope = { ...(kpi.scope ?? {}), publicToken } as any;
            }

            if (body.formula) {
                if (!kpi.formula_FK) {
                    kpi.formula_FK = transactionalEntityManager.create(Formula, body.formula);
                } else {
                    transactionalEntityManager.merge(Formula, kpi.formula_FK, body.formula);
                }
            }
            await transactionalEntityManager.save(kpi); 
            return createResponseDto('Kpi updated successfully', 200, <KpiDto>mapKpiDaoToKpiDto(kpi));
        });
    } catch (error) {
        return createResponseDto('Error updating Kpi', 500, { "error": KpiError.KPI_CANNOT_BE_UPDATED });
    }
}

export async function cloneKpi(kpiDto: any): Promise<ResponseDTO> {
    delete kpiDto?.id;
    delete kpiDto?.formula?.job?.id;
    delete kpiDto?.formula?.id;
    const newKpi = mapToClass(kpiDto, Kpi);
    if (newKpi.job_FK?.status) newKpi.job_FK.status = JobStatus.PENDING;
    try {
        await KpiRepository.save(newKpi);
        const result = mapKpiDaoToKpiDto(newKpi);
        return createResponseDto("Kpi duplicated", 201, result);
    }catch (error){
        console.log(error)
        return createResponseDto("Error in duplicating the Kpi", 500, {"error": KpiError.KPI_CANNOT_BE_DUPLICATED});
    }
}

export async function findAndSetErrorStatusBySelectedIds(targetIds: string[]): Promise<string[]> {
    if (targetIds.length === 0) {
        throw new Error("No target IDs provided");
    }

    const kpisToSetError = await KpiRepository
            .createQueryBuilder('kpi')
            .select('kpi.id_PK')
            .where(`
            EXISTS (
                SELECT 1 
                FROM json_array_elements(kpi.selected) AS sel 
                WHERE sel->>'id' IN (:...ids)
            )
        `, { ids: targetIds })
            .getMany();

    const kpiIds = kpisToSetError.map(kpi => kpi.id_PK);

    if (kpiIds.length > 0) {
        await KpiRepository
                .createQueryBuilder()
                .update(Kpi)
                .set({ dependency_status: dependencyStatus.error })
                .whereInIds(kpiIds)
                .execute();
    }

    return kpiIds;
}


export async function findAndSetWarningStatusBySelectedSourceIds(targetIds: string[]): Promise<string[]> {
    if (targetIds.length === 0) {
        return [];
    }

    const kpisToSetWarning = await KpiRepository
            .createQueryBuilder('kpi')
            .select('kpi.id_PK')
            .where(`
            EXISTS (
                SELECT 1 
                FROM json_array_elements(kpi.selected) AS source 
                WHERE source->>'id' IN (:...ids)
            )
        `, { ids: targetIds })
            .getMany();

    const kpiIds = kpisToSetWarning.map(kpi => kpi.id_PK);

    if (kpiIds.length > 0) {
        await KpiRepository
                .createQueryBuilder()
                .update(Kpi)
                .set({ dependency_status: dependencyStatus.warning })
                .whereInIds(kpiIds)
                .execute();
    }

    return kpiIds;
}


export async function iterativeUpdateStatus(initialIds: string[]): Promise<ResponseDTO> {
    let currentIds = initialIds;
    let allUpdatedKpis: string[] = [];

    while (currentIds.length > 0) {
        const errorKpiIds = await findAndSetErrorStatusBySelectedIds(currentIds);
        allUpdatedKpis = [...allUpdatedKpis, ...errorKpiIds];
        if (errorKpiIds.length === 0) {
            break;
        }
        const warningKpiIds = await findAndSetWarningStatusBySelectedSourceIds(errorKpiIds);
        allUpdatedKpis = [...allUpdatedKpis, ...warningKpiIds];
        currentIds = warningKpiIds;
    }

    return createResponseDto('KPI status updated', 200, allUpdatedKpis);
}

export async function shareKpiService(id: string, editorIds: string[], viewerIds: string[], user: UserDto): Promise<ResponseDTO> {
    const findKpiById: ResponseDTO = await getKpiById(id);
    if (findKpiById.data) {
        const kpiToUpdate: Kpi = findKpiById.data as Kpi;
        if (kpiToUpdate.ownerId !== user["X-User-Id"]) return createResponseDto(KpiError.KPI_CANNOT_BE_UPDATED, 403, {'error': 'Cannot perform the action due to lack of permissions'})
        if (!kpiToUpdate.scope) {
            kpiToUpdate.scope = { editorIds: [], viewerIds: [] };
        }
        if (!kpiToUpdate.scope.viewerIds) {
            kpiToUpdate.scope.viewerIds = [];
        }
        if (!kpiToUpdate.scope.editorIds) {
            kpiToUpdate.scope.editorIds = [];
        }
        if (viewerIds) {
            kpiToUpdate.scope.viewerIds = [
                ...new Set([...kpiToUpdate.scope.viewerIds, ...viewerIds])
            ];
        }
        if (editorIds) {
            kpiToUpdate.scope.editorIds = [
                ...new Set([...kpiToUpdate.scope.editorIds, ...editorIds])
            ];
        }
        const kpiUpdated: ResponseDTO = await updateKpiById(id, kpiToUpdate, user);
        return createResponseDto("editorIds Updated", 200, kpiUpdated.data);
    }
    return createResponseDto(KpiError.KPI_CANNOT_BE_UPDATED, 403, {});
}


export async function addViewersToKpiService(id: string, viewerIds: string[], user: UserDto): Promise<ResponseDTO> {
    const findKpiById: ResponseDTO = await getKpiById(id);
    if (findKpiById.data) {
        const kpiToUpdate: Kpi = findKpiById.data as Kpi;
        if (kpiToUpdate.ownerId !== user["X-User-Id"]) return createResponseDto(KpiError.KPI_CANNOT_BE_UPDATED, 403, {})
        if (kpiToUpdate.scope?.viewerIds) {
            kpiToUpdate.scope.viewerIds = [
                ...new Set([...kpiToUpdate.scope.viewerIds, ...viewerIds])
            ];
            const kpiUpdated: ResponseDTO = await updateKpiById(id, kpiToUpdate, user);
            return createResponseDto("editorIds Updated", 200, kpiUpdated.data);
        }
    }
    return createResponseDto(KpiError.KPI_CANNOT_BE_UPDATED, 403, {});
}

export async function compareUnitMeasureService(ids: string[]): Promise<ResponseDTO> {
    const kpis: KpiPartial[] = [];
    for (const id of ids) {
        const kpi: any | undefined = ((await getKpiById(id)).data) as KpiDto;
        if (kpi) {
            kpis.push({
                id: kpi.id ?? '',
                name: kpi.name,
                unitMeasure: kpi.definition.unitMeasure,
                schedule: kpi.formula.job.schedule
            });
        }
    }
    if (kpis.length === 0) {
        return createResponseDto('No KPIs provided', 400, []);
    }

    const referenceUnitMeasure = kpis[0].unitMeasure;
    const referenceTime = kpis[0].schedule.time;

    const kpiWithMatchingUnitMeasureAndTime = kpis.filter(
            kpi => kpi.unitMeasure === referenceUnitMeasure && kpi.schedule.time === referenceTime
    );

    if (kpiWithMatchingUnitMeasureAndTime.length === 0) {
        return createResponseDto('No KPIs with matching unit-measures and granularity found', 200, []);
    }

    return createResponseDto(
            'KPIs with matching unit-measures and granularity found',
            200,
            kpiWithMatchingUnitMeasureAndTime
    );
}
