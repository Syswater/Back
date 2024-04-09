import { TapePreference } from "src/constants/tape_preference";

export class CustomerDto{
    id: number;
    address: string;
    neighborhood: string;
    route_order: number;
    tape_preference: TapePreference;
    is_contactable: boolean;
    name: string | null;
    cellphone: string | null;
    route_id: number;
}