import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, query, body } = req;
    const now = new Date().toISOString();
    // Log method, url, query params, and body
    console.log(`[${now}] ${method} ${originalUrl} | params:`, query, '| body:', body);
    next();
  }
}

