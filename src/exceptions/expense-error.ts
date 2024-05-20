import { SsError } from "./error-type";

export class ExpenseError extends SsError {
    constructor(code: ExpenseErrorCode, description?: any) {
        super(code, ExpenseErrorCode, ExpenseError.name, description);
    }
}

export enum ExpenseErrorCode {
    CATEGORY_NOT_FOUND = 'CATEGORY_NOT_FOUND',
    EXPENSE_NOT_FOUND = 'EXPENSE_NOT_FOUND',
}