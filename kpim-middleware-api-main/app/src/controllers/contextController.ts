import {Request, Response} from "express";
import {
    checkPermissions,
    createContextService,
    deleteContextService,
    getContextByIdService,
    getContextsService, getUserContextsService, updateContextService
} from "../services/contextService";

export async function getContextsController(req: Request, res: Response) {
    const tenantId: string = req.params.tenantId;
    try {
        const resultGetContexts = await getContextsService(tenantId);
        return res.status(resultGetContexts.status).json(resultGetContexts.data);
    } catch (err) {
        console.error(err)
        return res.status(500).json({error: err.message});
    }}

export async function getContextByIdController(req: Request, res: Response){
    const tenantId: string = req.params.tenantId;
    const contextId: string = req.params.id;
    try {
        const resultGetContext = await getContextByIdService(tenantId, contextId);
        return res.status(resultGetContext.status).json(resultGetContext.data);
    } catch (err) {
        console.error(err)
        return res.status(500).json({error: err.message});
    }}

export async function deleteContextController(req: Request, res: Response){
    const tenantId: string = req.params.tenantId;
    const contextId: string = req.params.id;
    const userId: string = ((req.session) as any).user._id;
    const isAdmin: boolean = await checkPermissions(tenantId,userId,req.headers.authorization as string);
    try {
        if(isAdmin) {
            const resultDeleteContext = await deleteContextService(tenantId, contextId);
            return res.status(resultDeleteContext.status).json(resultDeleteContext.data);
        }
        return res.status(403).json({error: 'Forbidden'});
    } catch (err) {
        console.error(err)
        return res.status(500).json({error: err.message});
    }
}

export async function createContextController(req: Request, res: Response){
    const tenantId: string = req.params.tenantId;
    const keycloakGroup: KeycloakGroup = req.body;
    const userId: string = ((req.session) as any).user._id;
    const isAdmin: boolean = await checkPermissions(tenantId,userId,req.headers.authorization as string);
    try {
        if (isAdmin) {
            const resultCreateContext = await createContextService(tenantId, keycloakGroup);
            return res.status(resultCreateContext.status).json(resultCreateContext.data);
        }
        return res.status(403).json({error: 'Forbidden'});
    } catch (err) {
        console.error(err)
        return res.status(500).json({error: err.message});
    }
}

export async function updateContextController(req: Request, res: Response){
    const tenantId: string = req.params.tenantId;
    const contextId: string = req.params.id;
    const groupAttributes = req.body;
    const userId: string = ((req.session) as any).user._id;
    const isAdmin: boolean = await checkPermissions(tenantId,userId,req.headers.authorization as string);
    try {
        if (!isAdmin) {
            const resultUpdateContext = await updateContextService(tenantId, contextId, groupAttributes);
            return res.status(resultUpdateContext.status).json(resultUpdateContext.data);
        }
        return res.status(403).json({error: 'Forbidden'});
    } catch (err) {
        console.error(err)
        return res.status(500).json({error: err.message});
    }
}

export async function getUserContextsController(req: Request, res: Response){
    const tenantId: string = req.params.tenantId;
    const userId: string = ((req.session) as any).user._id;
    try {
        const userContexts = await getUserContextsService(tenantId, userId);
        return res.status(userContexts.status).json(userContexts.data);
    } catch (err) {
        console.error(err)
        return res.status(500).json({error: err.message});
    }
}
