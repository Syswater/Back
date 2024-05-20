import { SsError } from "./error-type";

export class ProductError extends SsError {
    constructor(code: ProductErrorCode, description?: any) {
        super(code, ProductErrorCode, ProductError.name, description);
    }
}

export enum ProductErrorCode {
    PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
}