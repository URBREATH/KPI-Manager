import {
    Auth,
    createResponseDto,
    mapToClass,
    Measure,
    MeasureDto,
    ResponseDTO,
    Source,
    SourceDto,
    Spec,
    UserDto
} from '@he_hurbreath/kpi-models-support-main';
import {AppDataSource} from '../utils/dbUtils';
import * as $log from '../modules/Logger';
import {deleteSecretFromVault, putSecretIntoVault} from './vaultClient';
import {KPIM_INDICATORS_MANAGER_API_URL} from "../utils/constants";
import {In} from "typeorm";
import {MeasureError} from "../utils/enum";
import axios from "axios";
import {checkOwnership, filterMeasuresByAccess} from "./entityPermissionService";

const MeasureRepository = AppDataSource.getRepository(Measure);
const SourceRepository = AppDataSource.getRepository(Source);

export async function getMeasures(user: UserDto): Promise<ResponseDTO> {
    let foundMeasuresDtos: MeasureDto[] = [];
    let foundMeasures: Measure[] = await MeasureRepository.find({
        relations: ["source", "source.auth", "source.spec_FK"],
    });
    foundMeasures = filterMeasuresByAccess(foundMeasures, user);
    for (let measure of foundMeasures) {
        foundMeasuresDtos.push(mapToClass(measure, MeasureDto));
    }
    return createResponseDto("Measures found", 200, foundMeasuresDtos);
}

export function removeIdsForClone(measureDto: MeasureDto): MeasureDto {
    const cleanedMeasureDto: MeasureDto = measureDto;
    delete cleanedMeasureDto.id;
    if (cleanedMeasureDto.source) {
        delete cleanedMeasureDto.source.id;
        delete cleanedMeasureDto.source.auth?.id;
        delete cleanedMeasureDto.source.spec?.id;
    }
    return cleanedMeasureDto
}

export async function createMeasure(measureDto: MeasureDto, user: UserDto): Promise<ResponseDTO> {
    const newMeasure: Measure = mapToClass(measureDto, Measure);
    newMeasure.ownerId = user['X-User-Id'];
    newMeasure.tenantId = user['X-Tenant-Id'];
    $log.info("measureService.ts - Trying to create:", `${newMeasure}`)
    if (measureDto.source?.auth?.username !== undefined && measureDto.source?.auth?.accessKey !== undefined) {
        let secretName: string = measureDto.name + "_" + measureDto.source.auth.databaseName;
        try {
            newMeasure.source.auth.secretPath = await putSecretIntoVault(secretName, measureDto.source.auth.username, measureDto.source.auth.accessKey);
        } catch (error) {
            return createResponseDto("Error in saving secret in vault", 400, {"error:": MeasureError.SAVING_SECRETS_IN_VAULT});
        }
    }
    const checkUniqueName: Measure | null = await MeasureRepository.findOneBy({name: measureDto.name});
    if (checkUniqueName !== null) return createResponseDto("Name should be unique", 409, {"error": MeasureError.MEASURE_NAME_MUST_BE_UNIQUE});
    const result: Measure = await MeasureRepository.save(newMeasure);
    const resultDto: MeasureDto = mapToClass(result, MeasureDto);

    if (!result) {
        createResponseDto("Measure not created", 400, {"error": MeasureError.MEASURE_CANNOT_BE_CREATED});
    }
    return createResponseDto("Measure created", 201, resultDto);
}

export async function deleteMeasure(id: string, user: UserDto): Promise<ResponseDTO> {
    const toBeDeletedIds: string[] = id.split(',').map(id => id.trim());

    return AppDataSource.transaction(async transactionalEntityManager => {
        const measures: Measure[] = await transactionalEntityManager.find(Measure, {
            where: {id_PK: In(toBeDeletedIds)},
            relations: ['source', 'source.auth', 'source.spec_FK']
        });

        if (measures.length === 0) {
            return createResponseDto("Measure not found", 404, {});
        }

        if (user) {
            if (!checkOwnership(measures, user, "DELETE")) throw new Error('User does not have permission to delete this KPIs');
        }

        const {
            authIdsToDelete,
            specIdsToDelete,
            sourceIdsToDelete,
            secretPathsToDelete
        } = createArrayOfEntityToDelete(measures);

        await transactionalEntityManager.delete(Measure, {id_PK: In(toBeDeletedIds)});

        if (sourceIdsToDelete.length > 0) {
            await transactionalEntityManager.delete(Source, {id_PK: In(sourceIdsToDelete)});
        }

        if (authIdsToDelete.length > 0) {
            await transactionalEntityManager.delete(Auth, {id_PK: In(authIdsToDelete)});
        }

        if (secretPathsToDelete.length > 0) {
            for (const secretPath of secretPathsToDelete) {
                await deleteSecretFromVault(secretPath);
            }
        }

        if (specIdsToDelete.length > 0) {
            await transactionalEntityManager.delete(Spec, {id_PK: In(specIdsToDelete)});
        }
        for (let measureId of toBeDeletedIds) {
            await axios.patch(KPIM_INDICATORS_MANAGER_API_URL + `/api/v1/kpi/measures/${measureId}`)
        }
        return createResponseDto("Measure deleted", 204, {toBeDeletedIds});
    }).catch(error => {
        return createResponseDto(error.message, 400, {});
    });
}

function createArrayOfEntityToDelete(measures: Measure[]): {
    authIdsToDelete: string[],
    specIdsToDelete: string[],
    sourceIdsToDelete: string[],
    secretPathsToDelete: string[]
} {
    let authIdsToDelete: string[] = [];
    let specIdsToDelete: string[] = [];
    let sourceIdsToDelete: string[] = [];
    let secretPathsToDelete: string[] = [];

    for (let measure of measures) {
        if (measure.source) {
            sourceIdsToDelete.push(measure.source.id_PK);
            if (measure.source.auth) {
                authIdsToDelete.push(measure.source.auth.id_PK);
                secretPathsToDelete.push(measure.source.auth.secretPath);
            }
            if (measure.source.spec_FK) {
                specIdsToDelete.push(measure.source.spec_FK.id_PK);
            }
        }
    }
    return {authIdsToDelete, specIdsToDelete, sourceIdsToDelete, secretPathsToDelete}
}


export async function getMeasureById(id: string): Promise<ResponseDTO> {
    $log.info("getMeasureById", "Getting measure by id: " + id);
    const measure: Measure | null = await MeasureRepository.findOne({
        where: {id_PK: id},
        relations: ['source', 'source.auth', 'source.spec_FK']
    });

    return createResponseDto("Measure found", 200, measure || {});
}

export async function updateMeasureById(id: string, body: any, user: UserDto): Promise<ResponseDTO> {
    return AppDataSource.transaction(async transactionalEntityManager => {
        const measure: Measure | null = await transactionalEntityManager.findOne(Measure, {
            where: {id_PK: id},
            relations: ['source', 'source.auth', 'source.spec_FK']
        });

        if (!measure) {
            return createResponseDto("Measure not found", 404, {});
        }

        if (user && measure) {
            if (!checkOwnership([measure], user, 'UPDATE')) throw new Error('User does not have permission');
        }


        if (measure.name === body.name) {
            delete body.name;
        }

        body = mapToClass(body, Measure);
        transactionalEntityManager.merge(Measure, measure, body);

        if (body.source.auth?.username && body.source.auth?.accessKey) {
            let secretName: string = measure.name + "_" + measure.source.auth.database_name;
            try {
                await deleteSecretFromVault(measure.source.auth.secretPath);
                measure.source.auth.secretPath = await putSecretIntoVault(secretName, body.source.auth.username, body.source.auth.accessKey);
            } catch (error) {
                throw new Error("Error in saving secret in vault");
            }
        } else {
            body.source.auth = measure.source.auth;
        }

        if (body.source) {
            transactionalEntityManager.merge(Source, measure.source, body.source);
        }
        if (body.auth) {
            transactionalEntityManager.merge(Auth, measure.source.auth, body.auth);
        }
        if (body.spec) {
            transactionalEntityManager.merge(Spec, measure.source.spec_FK, body.spec);
        }

        await transactionalEntityManager.save(Measure, measure);
        return createResponseDto("Measure updated successfully", 200, measure);
    }).catch(error => {
        $log.error("measureService", error);
        return createResponseDto(error.message, 400, {"error": MeasureError.MEASURE_CANNOT_BE_UPDATED});
    });
}

export async function getOneSourceById(id: string): Promise<SourceDto> {
    let sourceFound: SourceDto;
    let fountSources: Source[] = await SourceRepository.find({
        where: {id_PK: id},
        relations: ["auth", "spec_FK"],
    });
    if (fountSources.length > 0) {
        sourceFound = mapToClass(fountSources[0], SourceDto);
        return sourceFound;
    }
    return {} as SourceDto;
}

export async function addEditorsToMeasureService(id: string, editorIds: string[], user: UserDto): Promise<ResponseDTO> {
    const findMeasureById: ResponseDTO = await getMeasureById(id);
    if (findMeasureById.data) {
        const measureToUpdate: Measure = findMeasureById.data as Measure;
        if (measureToUpdate.ownerId !== user["X-User-Id"]) return createResponseDto(MeasureError.MEASURE_CANNOT_BE_UPDATED, 403, {'error': 'Cannot perform the action due to lack of permissions'})
        if (!measureToUpdate.scope) {
            measureToUpdate.scope = {editorIds: [], viewerIds: []};
        }
        if (!measureToUpdate.scope.viewerIds) {
            measureToUpdate.scope.viewerIds = [];
        }
        if (!measureToUpdate.scope.editorIds) {
            measureToUpdate.scope.editorIds = [];
        }
        if (editorIds) {
            measureToUpdate.scope.editorIds = [
                ...new Set([...measureToUpdate.scope.editorIds, ...editorIds])
            ];
            const measureUpdated: ResponseDTO = await updateMeasureById(id, measureToUpdate, user);
            return createResponseDto("editorIds Updated", 200, measureUpdated.data);
        }
    }
    return createResponseDto(MeasureError.MEASURE_CANNOT_BE_UPDATED, 403, {});
}
