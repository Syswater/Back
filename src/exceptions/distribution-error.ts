import { SsError } from "./error-type";

export class DistributionError extends SsError {
    constructor(code: DistributionErrorCode, description?: any) {
        super(code, DistributionErrorCode, DistributionError.name, description);
    }
}

export enum DistributionErrorCode {
    STATUS_PREORDER_CHANGE = 'STATUS_PREORDER_CHANGE',
    EXISTING_DISTRIBUTION = 'EXISTING_DISTRIBUTION'
}