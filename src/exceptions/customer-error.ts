import { SsError } from "./error-type";

export class CustomerError extends SsError {
    constructor(code: CustomerErrorCode, description?: any) {
        super(code, CustomerErrorCode, CustomerError.name, description);
    }
}

export enum CustomerErrorCode {
    CUSTOMER_NOT_FOUND = 'CUSTOMER_NOT_FOUND',
    NOTE_NOT_FOUND = 'NOTE_NOT_FOUND',
    CUSTOMER_ROUTE_NOT_FOUND = 'CUSTOMER_ROUTE_NOT_FOUND'
}