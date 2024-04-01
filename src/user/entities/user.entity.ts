import { user } from "@prisma/client";

export class User implements user {
    id: number;
    name: string;
    cellphone: string;
    username: string;
    password: string;
    roles: string;
    update_at: Date;
    delete_at: Date;
}