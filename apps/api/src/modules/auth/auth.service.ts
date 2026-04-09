import { Injectable, UnauthorizedException } from "@nestjs/common";
import {PrismaService} from "../../prisma.service";
import { auth } from "./better-auth.config";
import {Request} from 'express';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async getSession(req: Request) {
    const session = await auth.api.getSession({
      headers: req.headers as unknown as Headers,
    });
    return session;
  }

  async getUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        createdAt: true,
      },
    });
  }

  async validateSession(req: Request) {
    const session = await this.getSession(req);
    if (!session) throw new UnauthorizedException("Invalid or expired session");
    return session;
  }
}