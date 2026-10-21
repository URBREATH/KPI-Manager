import {NextFunction, Request, Response} from 'express';

export async function checkHealth(
        req: Request,
        res: Response,
        next: NextFunction
) {
    return res.status(200).json();
}
