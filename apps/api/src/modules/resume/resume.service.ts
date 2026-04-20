import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { createClient } from '@supabase/supabase-js';
import pdfParse from 'pdf-parse';
import 'multer';

@Injectable()
export class ResumeService {
  private readonly supabase;

  constructor(private readonly prisma: PrismaService) {
    this.supabase = createClient(
      process.env.SUPABASE_URL ?? '',
      process.env.SUPABASE_SECRET_KEY ?? '',
    );
  }

  async uploadResume(
    userId: string,
    file: Express.Multer.File
  ) {
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Only PDF files are allowed');
    }

    // begin parsing pdf text
    const parsed = await pdfParse(file.buffer);
    const parsedText = parsed.text;

    // upload file to supabase storage
    const filename = `${userId}/${Date.now()}-${file.originalname}`;
    const { error } = await this.supabase.storage
      .from('resumes')
      .upload(filename, file.buffer, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (error) throw new BadRequestException(`Storage upload failed: ${error.message}`);

    // get public URL
    const { data: urlData } = this.supabase.storage
      .from('resumes')
      .getPublicUrl(filename);

    // save to database
    const resume = await this.prisma.resume.create({
      data: {
        userId,
        filename: file.originalname,
        storageUrl: urlData.publicUrl,
        parsedText,
      },
    });

    return resume;
  }

  async getResumes(userId: string) {
    return this.prisma.resume.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        filename: true,
        storageUrl: true,
        createdAt: true,
      },
    });
  }

  async getResumeById(id: string, userId: string) {
    const resume = await this.prisma.resume.findFirst({
      where: { id, userId },
    });

    if (!resume) throw new NotFoundException('Resume not found');

    return resume;
  }

  async deleteResume(id: string, userId: string) {
    const resume = await this.getResumeById(id, userId);

    // extract storage path from URL
    const url = new URL(resume.storageUrl);
    const storagePath = url.pathname.split('/resumes/')[1];
    if (!storagePath) throw new BadRequestException('Invalid storage URL from format');

    // delete from supabase storage
    await this.supabase.storage.from('resumes').remove([storagePath]);

    // delete from database
    await this.prisma.resume.delete({where: {id}});

    return { message: 'Resume deleted successfully' };
  }
}