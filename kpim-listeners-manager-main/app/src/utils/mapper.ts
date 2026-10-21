export interface ResponseDTO{
    message: string;
    status: number;
    data: object;
}

export function createResponseDto(message: string, status: number, data: object): ResponseDTO {
    return {
        message,
        data,
        status
    };
}
