import { customer_tape_preference } from "@prisma/client";
import { NoteDto } from "../noteDTO/note.output";
import { OrderDto } from "src/order/dto/order.output";
import { SaleDto } from "../../../distribution/dto/saleDTO/sale.output";

export class CustomerDto {
    id: number;
    address: string;
    neighborhood: string;
    route_order: number;
    tape_preference: customer_tape_preference;
    is_contactable: boolean;
    name: string | null;
    cellphone: string | null;
    route_id: number;
    note?: NoteDto[];
    order?: OrderDto;
    totalDebt?: number;
    borrowedContainers?: number;
    sale?: SaleDto;
}