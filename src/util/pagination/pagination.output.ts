export class Pagination <T> {
    currentPage: number;
    totalPages: number;
    size: number;
    items: T[];
}