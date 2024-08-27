import CreateSubscriberDto from '../dto/create-subscriber.dto';
import Subscriber from './subscriber.interface';

interface SubscribersService {
  addSubscriber(subscriber: CreateSubscriberDto): Promise<Subscriber>;
  getAllSubscribers(params: Record<any, any>): Promise<{ data: Subscriber[] }>;
}

export default SubscribersService;
