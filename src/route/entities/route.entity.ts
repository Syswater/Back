import { route } from "@prisma/client";

export class Route implements route {
    id: number;
    name: string;
    location: string;
    weekdays: string;
    price: number;
    update_at: Date;
    delete_at: Date;
}