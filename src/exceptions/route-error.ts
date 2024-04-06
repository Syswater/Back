import { SsError } from "./error-type";

export class RouteError extends SsError {
    constructor(code: RouteErrorCode, description?: any) {
        super(code, RouteErrorCode, RouteError.name, description);
    }
}

export enum RouteErrorCode {
    ROUTE_NOT_FOUND = 'ROUTE_NOT_FOUND',
}