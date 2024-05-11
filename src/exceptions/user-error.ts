import { SsError } from './error-type';

export class UserError extends SsError {
  constructor(code: UserErrorCode, description?: any) {
    super(code, UserErrorCode, UserError.name, description);
  }
}

export enum UserErrorCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  EXISTING_USERNAME = 'EXISTING_USERNAME',
  WRONG_USER_PASSWORD = 'WRONG_USER_PASSWORD',
}
