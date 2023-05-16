import { Controller, Get, Param, UseGuards} from "@nestjs/common"
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { UsersService } from "src/users/users.service";
import { MessageService } from "./messages.service";
import { Request } from "@nestjs/common";

@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessageController {
	constructor (private readonly messageService: MessageService, 
		private readonly userService: UsersService) {}

	@Get('room/:id')
	getRoomMessages(
		@Param('id') roomId: number
	) {
		return this.messageService.getRoomMessages(roomId)
	}

	@Get('direct')
	getDirectMessages(
		@Request() req: any 
	) {
		return this.messageService.getUserDirectMessages(req.user.sub)
	}
}