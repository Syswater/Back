import { note } from "@prisma/client";

export class Note implements note{
    id: number;
    description: string;
    distribution_id: number;
    customer_id: number; 
}