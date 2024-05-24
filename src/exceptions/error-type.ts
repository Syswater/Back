import { BadRequestException } from '@nestjs/common';

class EnumUtils {
    getKeyByValue<T extends string | number>(
        enumObj: Record<string, T>,
        value: T,
    ): string {
        return Object.keys(enumObj).find((key) => enumObj[key] === value);
    }
}

export const enumUtils = new EnumUtils();

export abstract class SsError extends BadRequestException {
    protected constructor(
        code: string,
        enumObj: Record<string, any>,
        className: string,
        description?: any,
    ) {
        super(code, {
            description: JSON.stringify({
                code: enumUtils.getKeyByValue(enumObj, code),
                type: className,
                description: description as object,
            }),
        });
    }
}