import { SsError } from "./error-type";

export class SaleError extends SsError {
    constructor(code: SaleErrorCode, description?: any) {
        super(code, SaleErrorCode, SaleError.name, description);
    }
}

export enum SaleErrorCode {
    SALE_NOT_FOUND = 'SALE_NOT_FOUND',
}