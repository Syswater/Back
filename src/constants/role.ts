export enum Role {
    ADMIN = 'ADMIN',
    PRE_SELLER = 'PRE_SELLER',
    DISTRIBUTOR = 'DISTRIBUTOR'
}

export function convertRoleEnumToString(enumValues: Role[]): string {
    const daysString = enumValues.map(value => Role[value]).join(',');
    return daysString;
}