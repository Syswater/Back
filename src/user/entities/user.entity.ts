import { user } from "@prisma/client";
import { Role } from "../../constants/role";

export class User implements user {
    id: number;
    name: string;
    cellphone: string;
    username: string;
    password: string;
    roles: string;
    update_at: Date;
    delete_at: Date;

    static getRoles(roles: string): Role[] {
        if (typeof roles === 'string') {
            const array = roles.split(',');
            return array.map(role => Role[role.toUpperCase() as keyof typeof Role]);

        }
        return [];
    }

    static rolesToString(roles: Role[]): string {
        let rolesString: string = "";
        roles.forEach(role => {
            rolesString += Role[role] + ","
        });
        return rolesString;
    }
}