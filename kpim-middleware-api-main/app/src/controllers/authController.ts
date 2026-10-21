import { RequestHandler } from 'express';
import { AuthApiService } from '../services/AuthApiService';
import { KeycloakService } from '../services/KeycloakService';
import * as $log from '../modules/Logger';
import { KEYCLOAK_CLIENT_ID, GUI_BASE_URL } from '../utils/constants';

const authService = new AuthApiService(new KeycloakService());

export const getLoginUrl: RequestHandler = async (req, res, next) => {
    const tenantId: string = req.params.tenantId;
    try {
        const url = await authService.getLoginURL(tenantId)
        $log.info("authController", `login request for ${KEYCLOAK_CLIENT_ID}@${tenantId}: ${url}`)
        res.redirect(url as string);
    } catch (err) {
        $log.error("authController", `an error occurred getting login url for ${KEYCLOAK_CLIENT_ID}@${tenantId}: ${err}`)
    }
};

export const callbackUrl: RequestHandler = async (req, res, next) => {
    const tenantId = req.params.tenantId;
    const code = req.query.code as string;

    // ⛔ già autenticato
    if ((req.session as any).token) {
        return res.redirect(GUI_BASE_URL.replace('TENANT_ID', tenantId));
    }

    // ⛔ code già usato
    if ((req.session as any).oauthCode === code) {
        return res.status(400).send("Authorization code already used");
    }

    (req.session as any).oauthCode = code;

    const tkns = await authService.getToken(tenantId, code);
    if (!tkns) return next(new Error("Could not fetch token"));

    const info = await authService.getUserInfo(
        tenantId,
        tkns.access_token,
        tkns.refresh_token
    );

    if (!info) return next(new Error("Could not fetch user info"));

    (req.session as any).user = {
        _id: info.user.id,
        roles: info.user.roles,
        email: info.user.email,
        username: info.user.username,
        firstname: info.user.firstname,
        lastname: info.user.lastname,
        locale: info.user.locale
    };

    (req.session as any).token = tkns.access_token;
    (req.session as any).refreshToken = tkns.refresh_token;

    let redirectUrl = GUI_BASE_URL.replace('TENANT_ID', tenantId);
    return res.redirect(redirectUrl);
};


export const logoutUrl: RequestHandler = async (req, res, next) => {
    const tenantId: string = req.params.tenantId;

    const refreshToken = (req.session as any).refreshToken;

    req.session.destroy((err) => { return });

    res.redirect(await authService.logout(tenantId, refreshToken) as string);

};