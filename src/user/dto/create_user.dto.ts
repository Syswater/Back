export class CreateUserDto {
    name: string;
    cellphone: string;
    username: string;
    password: string;
    roles: string[];
    update_at: Date;
    delete_at: Date;
}