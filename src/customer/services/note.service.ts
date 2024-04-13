import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchNoteInput } from '../dto/noteDTO/search-note.input';
import { NoteDto } from '../dto/noteDTO/note.output';
import { Note } from '../entities/note.entity';
import { CreateNoteInput } from '../dto/noteDTO/create-note.input';
import { UpdateNoteInput } from '../dto/noteDTO/update-note.input';
import { CustomerError, CustomerErrorCode } from 'src/exceptions/customer-error';

@Injectable()
export class NoteService{

    constructor(private readonly prisma:PrismaService){}

    async getNotes(): Promise<NoteDto[]> {
        const notes = await this.prisma.note.findMany({where:{customer_id: null}});
        return notes.map(customer => this.getNoteDto(customer));
    }

    async create(note: CreateNoteInput): Promise<NoteDto> {
        const newNote = await this.prisma.note.create({
            data:{
                ...note
            }
        });
        return this.getNoteDto(newNote);
    }

    async update(note: UpdateNoteInput): Promise<NoteDto> {
        const {id, distribution_id, customer_id, description} = note;
        let distribution = null;
        if(distribution_id !== undefined && distribution_id !== null){
            distribution = distribution_id? await this.prisma.distribution.findFirstOrThrow({where: {id: distribution_id}}) : undefined;
        }else if(distribution_id === null){
            distribution = null;
        }
        const customer = customer_id? await this.prisma.customer.findFirstOrThrow({where: {id: customer_id}}): undefined;
        const updated_note = await this.prisma.note.update({
            where: { id },
            data: { description,
                    customer: customer_id? {connect: {id: customer.id}}:undefined,
                    distribution: distribution_id? distribution_id !== null? {connect: {id: distribution_id}}:{}:undefined
                }
        });
        return this.getNoteDto(updated_note)
    }

    async delete(id: number): Promise<NoteDto> {
        const note = await this.prisma.note.findFirst({ where: { id } });

        if (!note) {
            throw new CustomerError(CustomerErrorCode.NOTE_NOT_FOUND, `No se encuentra la nota con el id: ${id}`);
        } else {
            const deletedNote = await this.prisma.note.delete({
                where: { id }
            });
            return this.getNoteDto(deletedNote);
        }
    }

    private getNoteDto(note: Note): NoteDto {
        const { ...info } = note;
        return {
            ...info
        };
    }

}