import {
  All,
  Controller,
  Get,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import {Request, Response} from "express";
import { auth } from "./better-auth.config";
import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @All('*splat')
  async handleAuth(@Req() req: Request, @Res() res: Response) {
    const url = new URL(req.url, `http://${req.headers.host}`);

    const response = await auth.handler(
      new Request(url.toString(), {
        method: req.method,
        headers: req.headers as Record<string, string>,
        body: 
          req.method !== 'GET' && req.method !== 'HEAD'
            ? JSON.stringify(req.body)
            : undefined,
      }),
    );

    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    res.status(response.status).send(await response.text());
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getMe(@Req() req: Request & { user: any }) {
    return this.authService.getUserById(req.user.id);
  }
}