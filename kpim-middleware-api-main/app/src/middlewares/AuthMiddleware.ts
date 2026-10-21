import { RequestHandler, Request, Response, NextFunction } from "express";
import { AuthApiService } from "../services/AuthApiService";
import { KeycloakService } from "../services/KeycloakService";
import * as $log from '../modules/Logger';
import createHttpError, { HttpError } from "http-errors";

const authService = new AuthApiService(new KeycloakService());

export const protect: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    let access_token = "";
    let refresh_token = ""
    let initSession = false;

    if (req.session && (req.session as any).token) {
        access_token = (req.session as any).token;
        refresh_token = (req.session as any).refreshToken
    } else {
        access_token = req.headers.authorization?.trim().split(' ')[1] ?? "";

        if (req.query.access_token) {
            access_token = req.query.access_token as string;
        }

        if (req.session) initSession = true;
    }

    if (!access_token) {
        $log.warn("AuthMiddleware", "no access token")
        req.session.destroy((error: any) => {
            if (error) {
                $log.error("AuthMiddleware", `error destroying session: ${error}`);
            } else {
                $log.info("AuthMiddleware", "session destroyed");
            }
        });
        const err: HttpError = createHttpError(401, 'Unauthorized');
        return next(err);
    }

    try {
        const user_res = await authService.getUserInfo(req.params.tenantId, access_token, refresh_token);
        if (!user_res) {
            const err: HttpError = createHttpError(400, 'Could not fetch user info');
            return next(err);
        }

        if (initSession) {// if session has expired but there's still a valid token, re-init session

            const userInfo = user_res.user

            const user: any = {
                _id: userInfo.id,
                roles: userInfo.roles,
                email: userInfo.email,
                username: userInfo.username,
                firstname: userInfo.firstname,
                lastname: userInfo.lastname,
                locale: userInfo.locale
            };

            (req.session as any).user = user;
        }

        (req.session as any).token = user_res.access_token;
        (req.session as any).refreshToken = user_res.refresh_token;

    } catch (error: any) {
        $log.error("AuthMiddleware", `an error occurred getting user info: ${error.message}`)
        req.session.destroy((error: any) => {
            if (error) {
                $log.error("AuthMiddleware", `error destroying session: ${error}`);
            } else {
                $log.info("AuthMiddleware", "session destroyed");
            }
        });
        const err: HttpError = createHttpError(error.status, error.message);
        return next(err);
    }

    return next();
}

