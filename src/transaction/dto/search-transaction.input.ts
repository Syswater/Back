import { PaginationInput } from "src/util/pagination/pagination.input";

export class SearchTransactionInput implements PaginationInput{
    pageNumber: number;
    size: number;
    customer_id: number;
}