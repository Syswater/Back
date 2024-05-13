import { SsError } from "./error-type";

export class TransactionError extends SsError {
    constructor(code: TransactionErrorCode, description?: any) {
        super(code, TransactionErrorCode, TransactionError.name, description);
    }
}

export enum TransactionErrorCode {
    PARAMETERS_ARE_NUMBERS = 'PARAMETERS_ARE_NUMBERS',
    PARAMETERS_POSITIVE_VALUES = 'PARAMETERS_POSITIVE_VALUES',
    PAYMENT_EXCEEDS_DEBT = 'PAYMENT_EXCEEDS_DEBT',
    CONTAINERS_EXCEED_BORROWED = 'CONTAINERS_EXCEED_BORROWED'
}