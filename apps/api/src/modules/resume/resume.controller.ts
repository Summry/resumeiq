import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Request } from 'express';
import { ResumeService } from './resume.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('resume')
@UseGuards(AuthGuard)
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', { storage: memoryStorage() }),
  )
  async uploadResume(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5 megabyte
          new FileTypeValidator({ fileType: 'application/pdf' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Req() req: Request & { user: any },
  ) {
    return this.resumeService.uploadResume(req.user.id, file);
  }

  @Get(':id')
  async getResume(
    @Param('id') id: string,
    @Req() req: Request & { user: any },
  ) {
    return this.resumeService.getResumeById(id, req.user.id);
  }

  @Delete(':id')
  async deleteResume(
    @Param('id') id: string,
    @Req() req: Request & { user: any },
  ) {
    return this.resumeService.deleteResume(id, req.user.id);
  }
}