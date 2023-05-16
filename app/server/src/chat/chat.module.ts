import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { RoomsController } from "./rooms/rooms.controller";
import { RoomsService } from "./rooms/rooms.service";
import { UsersService } from "src/users/users.service";
import { GameService } from "src/game/game.service";
import { ChatGateway } from "./chat.gateway";
import { MessageService } from "./messages/messages.service";
import { MessageController } from "./messages/messages.controller";
import { FriendsController } from "./friends/friends.controller";
import { FriendsService } from "./friends/friends.service";
import { AdminController } from "src/admin/admin.controller";
import { BlockService } from "src/admin/block.service";
import { MuteService } from "./rooms/mute.service";
import { ScheduleModule } from '@nestjs/schedule';

@Module({
	imports: [PrismaModule, ScheduleModule.forRoot()],
	controllers: [RoomsController, MessageController, FriendsController, AdminController],
	providers: [MuteService, UsersService, RoomsService, GameService, MessageService, FriendsService, BlockService]
})
export class ChatModule {}

