import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    console.log('WebSocket Gateway ishga tushdi');
  }

  handleConnection(client: Socket) {
    console.log(`Foydalanuvchi ulandi: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Foydalanuvchi uzildi: ${client.id}`);
  }

  // Umumiy event yuborish uchun yordamchi funksiya
  emitEvent(event: string, payload: any) {
    this.server.emit(event, payload);
  }
}
