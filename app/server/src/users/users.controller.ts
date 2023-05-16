import { Controller,
	Get,
	Post,
	Body,
	Request,
	Put,
	Delete,
	Patch,
	Param,
	Res,
	HttpCode,
	UseInterceptors,
	NestInterceptor,
	UploadedFile,
	Query,
	HttpException,
	StreamableFile,
	BadGatewayException,
	BadRequestException,
	Inject,
	Injectable,
	UseGuards,
	ConsoleLogger,
	UsePipes,
	ValidationPipe
} from '@nestjs/common';
import { IsNumberString } from 'class-validator';
import { diskStorage } from  'multer';
import { join } from  'path';
import { createReadStream } from 'fs';
import { FileInterceptor } from '@nestjs/platform-express'
import { CreateUserDto, UpdateUserDto, UpdateUserDtoPass } from './User.dto'
import { UsersService } from './users.service'
import { Response } from "express";
import { Request as ExpressRequest } from 'express'
import { JwtPayload } from 'src/auth/auth.types'
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../auth/auth.service'
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RefreshJwtAuthGuard } from 'src/auth/refresh-jwt-auth.guard'
import { Intra42AuthGuard } from 'src/auth/intra42.guard';
import { numberFormat } from './User.dto'
import { RoomsService } from 'src/chat/rooms/rooms.service';
import { User } from '@prisma/client';
import * as fs from 'fs';
import { FriendsService } from 'src/chat/friends/friends.service';
import {
	PasswordValidationPipe,
	LoginValidationPipe,
	LoginPasswordValidationPipe
} from './users.pipes'


@Controller('users')
export class UsersController {

	constructor(private userService: UsersService,
		private roomService : RoomsService,
		private readonly friendService: FriendsService) {}

	@UseGuards(LocalAuthGuard)
	@Get('login')
	async handleLogin(@Query() query: {login: string, password: string}) {
		return await this.userService.findOneUser(query.login)
	}

	@Get('intra')
	async getIntraUser(@Query() query: {intraLogin : string}) {
		return await this.userService.findOneIntraUser(query.intraLogin)
	}

	@UseGuards(JwtAuthGuard)
	@Get('search/:login')
	async handleSearchLogin(@Param('login') login: string) {
		return await this.userService.searchManyUsers(login)
	}

//	====================== POST AND GET AVATAR ===================

//	====================== ^^^^^^^^^^^^^^^^^^^^^^^^^^^ ===================

//	======================= Profile  ================================

//  On sait jamais....
	@UseGuards(JwtAuthGuard)
	@HttpCode(200)
	@Get('profile/pong')
	async pong() {
		return;
	}
// =========================

	@UseGuards(JwtAuthGuard)
	@Post('profile/avatar/upload')
	@UseInterceptors(FileInterceptor('file', {
		storage: diskStorage({
			destination: './src/avatar',
		})
	}))
	async checkAvatar(@Request() req: any, @UploadedFile() file: Express.Multer.File){
		return this.userService.updateAvatar(req.user.login , file.filename);
	}

	@UseGuards(JwtAuthGuard)
	@Post('profile/avatar/delete')
	async deletePicture(@Request() req: any,) {
		const user = await this.userService.findOneUser(req.user.login);
		if (!user || !user.avatar) {
			throw new BadRequestException;
		}

		await this.userService.updateUser(user.login, {avatar: ''});

		// ===== to not delete our image in our repo ====
		if ( user.avatar === 'alorain.jpg'
			|| user.avatar === 'amahla.JPG'
			|| user.avatar === 'slahlou.JPG')
			return ;
		//=====================

		await fs.unlink(`./src/avatar/${user.avatar}`, (err) => {
			if (err) {
				console.error(err);
				return err;
			}
		});
	}



	@UseGuards(JwtAuthGuard)
	@Get('profile/avatar')
	async getFile(
		@Res({ passthrough: true }) res: Response,
		@Request() req: any,

	): Promise<StreamableFile | undefined> {
		try {
			const user = await this.userService.findOneUser(req.user.login);
			if (!user) {
				throw new BadRequestException;
			}
			if (!user.avatar) {
				res.status(204)
				return
			}
			const file = createReadStream(join('./src/avatar/', user.avatar));
			return new StreamableFile(file);
		} catch (error){
			throw new BadRequestException;
		}
	}

	@UseGuards(JwtAuthGuard)
	@Get('profile/avatar/download/:avatar')
	async getFileOther(
		@Res({ passthrough: true }) res: Response,
		@Param('avatar') avatar: string,
	) {
		const file = createReadStream(join('./src/avatar/', avatar));
		return new StreamableFile(file);
	}

	@UseGuards(JwtAuthGuard)
	@Post('profile/pass')
	async changePassword(
		@Request() req: any,
		@Body(PasswordValidationPipe) updateUserPass: UpdateUserDtoPass
	) {
		return this.userService.updatePass(req.user.login, updateUserPass);
	}

	@UseGuards(JwtAuthGuard)
	@Get('profile/auth')
	async getProfileAuth(@Request() req: any) {
		return this.userService.getProfileAuth(parseInt(req.user.sub))
	}

	@UseGuards(JwtAuthGuard)
	@Get('profile/info')
	async getProfileInfo(@Request() req: any) {

		return this.userService.getProfileInfo(parseInt(req.user.sub))
	}

	@UseGuards(JwtAuthGuard)
	@Get('profile/info/:id')
	async getProfileOtherInfo(@Param('id') id: string) {
		return await this.userService.getProfileInfo(+id);
	}

//	=========================^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^===============

//	=========================================OAuth2=======================


	@UseGuards(JwtAuthGuard)
	@Put(':login')
	async updateUserById(
		@Param('login') login: string,
		@Body(LoginValidationPipe) updateUserDto: UpdateUserDto
	) {
		await this.userService.updateUser(login, updateUserDto);
	}


	@UseGuards(JwtAuthGuard)
	@Patch(':login')
	async updatePatchUserById(
		@Param('login') login: string,
		@Body(LoginValidationPipe) updateUserDto: UpdateUserDto
	) {
		await this.userService.updateUser(login, updateUserDto);
	}

/*	@UseGuards(JwtAuthGuard)
	@Delete(':login')
	async deleteByID(
		@Param('login') login: string
	) {
		await this.userService.deleteUser(login);
	}*/

	//================== ROOMS =================

	@UseGuards(JwtAuthGuard)
	@Get('rooms')
	async getRooms(
		@Request() req: any,
	)
	{
		return this.userService.findAllUserRooms(req.user.sub)
	}

	@UseGuards(JwtAuthGuard)
	@Get('blocked')
	async getBlockedUsers(
		@Request() req: any,
	) {
		return this.userService.getBlockedUsers(req.user.sub)
	}

	@UseGuards(JwtAuthGuard)
	@Get('status')
	async getStatus(
		@Request() req: any,
	) {
		return this.userService.getStatus(req.user.sub)
	}

	@UseGuards(JwtAuthGuard)
	@Get('avatarName/:id')
	async getAvatarName(
		@Param('id') id: number
	) {
		return this.userService.getAvatarName(id)
	}
}
