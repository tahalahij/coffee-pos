import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const isDesktopMode = process.env.DESKTOP_MODE === 'true';
        const uri = configService.get('MONGODB_URI') || 'mongodb://localhost:27017/cafe_pos';
        
        return {
          uri,
          serverSelectionTimeoutMS: 5000,
          connectTimeoutMS: 10000,
          socketTimeoutMS: 45000,
          // Desktop mode specific settings
          ...(isDesktopMode && {
            retryWrites: true,
            retryReads: true,
          }),
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
