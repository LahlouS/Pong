import { Controller, UseGuards } from "@nestjs/common";
import { RoomsService } from "./rooms.service";
import { Get, Param, Post, Body, Patch } from "@nestjs/common"
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { UpdateUserDto } from "src/users/User.dto";

@UseGuards(JwtAuthGuard)
@Controller('rooms')
export class RoomsController {
	constructor(private readonly roomService: RoomsService) {}

	@Get()
	getAllRooms() {
		return this.roomService.findAll()
	}

	@Get('owner/:id')
	getRoomOwner(
		@Param('id') roomId : number
	) {
		return this.roomService.getRoomOwner(roomId)
	}

	@Get('/:name')
	getRoomsByName(
		@Param('name') name : string
	) {
		return this.roomService.findManyRooms(name)
	}

	@Get('/search/:name')
	getMatchingRoomsByName(
		@Param('name') name: string)
	{
		return this.roomService.findMatchingRooms(name)
	}
	@Get('/:id/members')
	getRoomMembers(
		@Param('id') id: number
	){
		return this.roomService.getRoomMembers(id)
	}

	@Get('/:id/bans')
	getRoomBans(
		@Param('id') id: number
	){
		return this.roomService.getRoomBans(id)
	}

	@Get('/:id/admins')
	getRoomAdmins(
		@Param('id') id: number
	){
		return this.roomService.getRoomAdmins(id)
	}

	@Get('/:id/muted')
	getRoomMuteds(
		@Param('id') id: number
	) {
		return this.roomService.getRoomMuteds(id)
	}


	@Patch('/:id/addPassword/:password')
	addRoomPassword(
		@Param('id') id: number, @Param('password') password: string
	) {
		return this.roomService.addPassword(id, password)
	}

	@Patch('/:id/goPublic')
	roomGoPublic(
		@Param('id') id: number
	) {
		return this.roomService.goPublic(id)
	}

	@Patch('/:id/changePassword/:currentPassword/:newPassword')
	changeRoomPassword(
		@Param('id') id: number, @Param('currentPassword') currentPassword: string, @Param('newPassword') newPassword: string
	) {
		return this.roomService.changeRoomPassword(id, currentPassword, newPassword)
	}

}