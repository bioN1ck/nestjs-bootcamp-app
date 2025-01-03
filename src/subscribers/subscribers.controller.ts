import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

import JwtAuthGuard from '../auth/guards/jwt-auth.guard';
import CreateSubscriberDto from './dto/create-subscriber.dto';
import SubscribersService from './interfaces/subscribers-service.interface';

@Controller('subscribers')
@UseInterceptors(ClassSerializerInterceptor)
export class SubscribersController implements OnModuleInit {
  private subscribersService: SubscribersService;

  constructor(
    @Inject('SUBSCRIBERS_PACKAGE')
    private readonly client: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.subscribersService =
      this.client.getService<SubscribersService>('SubscribersService');
  }

  @Get()
  async getSubscribers() {
    console.log('Received request for getSubscribers');
    const response = await this.subscribersService.getAllSubscribers({});
    console.log('Response from gRPC service:', response);
    return response;
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createPost(@Body() subscriberDto: CreateSubscriberDto) {
    return this.subscribersService.addSubscriber(subscriberDto);
  }
}
