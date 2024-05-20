import { SsError } from "./error-type";

export class OrderError extends SsError {
    constructor(code: OrderErrorCode, description?: any) {
        super(code, OrderErrorCode, OrderError.name, description);
    }
}

export enum OrderErrorCode {
    EXISTING_ORDER = 'EXISTING_ORDER',
    ORDER_NOT_FOUND = 'ORDER_NOT_FOUND'
}