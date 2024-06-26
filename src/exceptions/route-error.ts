import { SsError } from "./error-type";

export class RouteError extends SsError {
    constructor(code: RouteErrorCode, description?: any) {
        super(code, RouteErrorCode, RouteError.name, description);
    }
}

export enum RouteErrorCode {
    ROUTE_NOT_FOUND = 'ROUTE_NOT_FOUND',
    ROUTE_DOES_NOT_YET_HAVE_DISTRIBUTIONS = 'ROUTE_DOES_NOT_YET_HAVE_DISTRIBUTIONS',
    NON_DELETABLE_ROUTE = "NON_DELETABLE_ROUTE"
}