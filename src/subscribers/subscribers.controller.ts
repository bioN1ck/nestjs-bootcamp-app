import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Inject,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import JwtAuthGuard from '../auth/guards/jwt-auth.guard';
import CreateSubscriberDto from './dto/create-subscriber.dto';

@Controller('subscribers')
@UseInterceptors(ClassSerializerInterceptor)
export class SubscribersController {
  constructor(
    @Inject('SUBSCRIBERS_SERVICE')
    private readonly subscribersService: ClientProxy,
  ) {}

  @Get('message')
  @UseGuards(JwtAuthGuard)
  async getMessageBasedSubscribers() {
    return this.subscribersService.send(
      {
        cmd: 'get-message-based-subscribers',
      },
      '',
    );
  }

  @Post('message')
  @UseGuards(JwtAuthGuard)
  async createMessageBasedPost(@Body() subscriberDto: CreateSubscriberDto) {
    return this.subscribersService.send(
      {
        cmd: 'add-message-based-subscriber',
      },
      subscriberDto,
    );
  }

  @Get('event')
  @UseGuards(JwtAuthGuard)
  async getEventBasedSubscribers() {
    return this.subscribersService.send(
      {
        cmd: 'get-event-based-subscribers',
      },
      '',
    );
  }

  @Post('event')
  @UseGuards(JwtAuthGuard)
  async createEventBasedPost(@Body() subscriberDto: CreateSubscriberDto) {
    return this.subscribersService.emit(
      {
        cmd: 'add-event-based-subscriber',
      },
      subscriberDto,
    );
  }
}
