import { BadRequestException, Body, Controller, Delete, Get, Post, Put, Query } from "@nestjs/common";
import { Auth } from "src/auth/decorators/auth.decorator";
import { NoteService } from '../services/note.service';
import { SearchNoteInput } from "../dto/noteDTO/search-note.input";
import { NoteDto } from "../dto/noteDTO/note.output";
import { CreateNoteInput } from "../dto/noteDTO/create-note.input";
import { UpdateNoteInput } from "../dto/noteDTO/update-note.input";
import { DeleteNoteInput } from "../dto/noteDTO/delete-note.input";

@Auth()
@Controller('note')
export class NoteController {

    constructor(private readonly noteService: NoteService){}
    
    @Get('findAll')
    async findAll(): Promise<NoteDto[]> {
        return await this.noteService.getNotes();
    }

    @Post('create')
    async create(@Body() note: CreateNoteInput): Promise<NoteDto> {
        try {
            const newNote = await this.noteService.create(note);
            return newNote;
        } catch (error) {
            throw new BadRequestException("Los datos proporcionados son incorrectos");
        }
    }

    @Put('update')
    async update(@Body() note: UpdateNoteInput): Promise<NoteDto> {
        try {
            const updatedNote = await this.noteService.update(note);
            return updatedNote;
        } catch (error) {
            throw new BadRequestException("Los datos proporcionados son incorrectos");
        }
    }

    @Delete('delete')
    async delete(@Body() params: DeleteNoteInput): Promise<NoteDto> {
        const deletedNote = await this.noteService.delete(params.id);
        return deletedNote;
    }

}
