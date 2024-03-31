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
}