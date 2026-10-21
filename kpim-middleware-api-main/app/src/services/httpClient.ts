import axios, {AxiosRequestConfig, AxiosResponse} from "axios";
import {Request, Response} from "express";
import * as $log from '../modules/Logger';
import {getUserContextsService} from "./contextService";

async function buildRequestConfig(req: Request, baseUrl: string): Promise<AxiosRequestConfig> {
    let url = baseUrl;
    if (req.params.id && !(url.includes('share'))) {
        url += `/${req.params.id}`;
    }

    const queryParams = new URLSearchParams(req.query as Record<string, string>).toString();
    if (queryParams) {
        url += `?${queryParams}`;
    }

    const headers = { ...req.headers } as { [key: string]: string };
    headers['Cache-Control'] = 'no-cache';
    headers['Pragma'] = 'no-cache';
    headers['Expires'] = '0';
    headers['X-User-Role'] = (req.session as any).user.roles;
    headers['X-User-Id'] = (req.session as any).user._id;
    headers['X-Tenant-Id'] = req.params.tenantId;
    const contexts: AxiosResponse = await getUserContextsService(headers['X-Tenant-Id'], headers['X-User-Id']);
    console.log(contexts.status)
    if (contexts.status === 200) headers['X-User-Contexts'] = contexts.data.map((context: any) => context.name).join(',');
    delete headers['authorization']
    delete headers['content-length'];
    delete headers['postman-token'];
    delete headers['cookie'];

    const config: AxiosRequestConfig = {
        url: url,
        method: req.method as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
        headers: headers,
        timeout: 20000,
    };

     if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        headers['Content-Type'] = 'application/json';
        config.data = req.body ?? {};
    }

    return config;
}

export async function handleApiRequest(req: Request, res: Response, baseURL: string, mapResponse?: (data: any) => any) {
    try {
        $log.info(`httpClient`, `Handling API request: ${req.method} ${req.url}`);
        $log.info(`httpClient`, `With the current user: ${(req.session as any).user} `);
        const config = await buildRequestConfig(req, baseURL);
        console.log("Axios Config:", config);

        const result: AxiosResponse = await axios.request(config);
        return res.status(result.status).json(mapResponse ? mapResponse(result.data) : result.data);

    } catch (error: any) {
        const status = error?.response?.status || 500;
    const data = error?.response?.data || {
      error: error?.message || "Unknown error"
    };

    return res.status(status).json(data);
    }
}

