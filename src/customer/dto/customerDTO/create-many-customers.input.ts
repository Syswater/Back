import { customer_tape_preference } from '@prisma/client';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  validate,
} from 'class-validator';
import XLSX from 'xlsx';

export class ExcelRow {
  @IsNumber()
  @IsNotEmpty()
  route_order: number;

  @IsString()
  @IsOptional()
  note?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsNotEmpty()
  tape_preference: customer_tape_preference;

  @IsInt()
  @Min(0)
  @IsNotEmpty()
  containers: number;

  @IsInt()
  @Min(0)
  @IsNotEmpty()
  debit: number;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsOptional()
  neighborhood?: string;

  @IsString()
  @IsOptional()
  cellphone?: string;

  @IsInt()
  @Min(0)
  @IsNotEmpty()
  product_inventroy_id: number;
}

export async function validateExcelData(filePath) {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet);

  const validationResults = [];

  for (const row of rows) {
    const excelRow = new ExcelRow();
    excelRow.name = row['name'];
    excelRow.address = row['address'];
    excelRow.cellphone = row['cellphone'];
    excelRow.containers = row['containers'];
    excelRow.debit = row['debit'];
    excelRow.neighborhood = row['neighborhood'];
    excelRow.note = row['note'];
    excelRow.route_order = row['route_order'];
    excelRow.tape_preference = row['tape_preference'];

    const errors = await validate(excelRow);
    if (errors.length > 0) {
      validationResults.push({ row, errors });
    }
  }

  return validationResults;
}
