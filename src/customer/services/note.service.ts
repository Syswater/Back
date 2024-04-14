import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NoteDto } from '../dto/noteDTO/note.output';
import { Note } from '../entities/note.entity';
import { CreateNoteInput } from '../dto/noteDTO/create-note.input';
import { UpdateNoteInput } from '../dto/noteDTO/update-note.input';
import { CustomerError, CustomerErrorCode } from 'src/exceptions/customer-error';

@Injectable()
export class NoteService {

    constructor(private readonly prisma: PrismaService) { }

    async getNotes(): Promise<NoteDto[]> {
        const notes = await this.prisma.note.findMany();
        return notes.map(customer => this.getNoteDto(customer));
    }

    async create(note: CreateNoteInput): Promise<NoteDto> {
        const newNote = await this.prisma.note.create({
            data: {
                ...note
            }
        });
        return this.getNoteDto(newNote);
    }

    async update(note: UpdateNoteInput): Promise<NoteDto> {
        const { id, distribution_id, description } = note;
        if (distribution_id !== undefined && distribution_id !== null) {
            await this.prisma.distribution.findFirstOrThrow({ where: { id: distribution_id } });
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