import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NoteDto } from '../dto/noteDTO/note.output';
import { Note } from '../entities/note.entity';
import { CreateNoteInput } from '../dto/noteDTO/create-note.input';
import { UpdateNoteInput } from '../dto/noteDTO/update-note.input';
import { CustomerError, CustomerErrorCode } from 'src/exceptions/customer-error';
import { DistributionError, DistributionErrorCode } from 'src/exceptions/distribution-error';

@Injectable()
export class NoteService {

    constructor(private readonly prisma: PrismaService) { }

    async getNotes(): Promise<NoteDto[]> {
        const notes = await this.prisma.note.findMany();
        return notes.map(customer => this.getNoteDto(customer));
    }

    async create(note: CreateNoteInput): Promise<NoteDto> {
        if(note.distribution_id){
            const distribution = await this.prisma.distribution.findFirst({where: {id: note.distribution_id, delete_at: null}});
            if(!distribution) throw new DistributionError(DistributionErrorCode.DISTRIBUTION_NOT_FOUND, `No existe una distribución con id ${note.distribution_id}`);
        }
        const customer = await this.prisma.customer.findFirst({where: {id: note.customer_id, delete_at: null}});
        if(!customer) throw new CustomerError(CustomerErrorCode.CUSTOMER_NOT_FOUND, `No existe un cliente con id ${note.customer_id}`);
        const newNote = await this.prisma.note.create({
            data: {
                ...note
            }
        });
        return this.getNoteDto(newNote);
    }

    async update(note: UpdateNoteInput): Promise<NoteDto> {
        const value = await this.prisma.note.findFirst({ where: { id: note.id } });
        if (!value) throw new CustomerError(CustomerErrorCode.NOTE_NOT_FOUND, `No se encuentra la nota con el id: ${note.id}`);
        const { id, distribution_id, description } = note;
        if(note.distribution_id){
            const distribution = await this.prisma.distribution.findFirst({where: {id: note.distribution_id, delete_at: null}});
            if(!distribution) throw new DistributionError(DistributionErrorCode.DISTRIBUTION_NOT_FOUND, `No existe una distribución con id ${note.distribution_id}`);
        }
        const updated_note = await this.prisma.note.update({
            where: { id },
            data: {
                description,
                distribution: distribution_id === undefined ?
                    undefined : distribution_id === null ? { disconnect: true } : { connect: { id: distribution_id } }
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