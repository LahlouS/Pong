import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common"
import { UsersService } from "src/users/users.service";
import { Response } from "express";
import { Res } from '@nestjs/common';

import { AuthService } from "./auth.service";
import { User } from "@prisma/client";

type IntraUserInfo = {
	signedIn: boolean,
	intraLogin: string,
	user: User | null,
	token?: string,
}

@Injectable()
export class Intra42AuthGuard implements CanActivate {
	constructor (private readonly authService : AuthService, 
					private readonly usersService : UsersService) {}

	async isSignedIn (intraLogin: string) {
	}

	async getIntraUserInfo (accessToken: string) : Promise<IntraUserInfo> {


		const requestOptions = {
			method: 'GET',
			headers: {
				'Authorization' : `Bearer ${accessToken}`
			}
		}

		const response = await fetch('https://api.intra.42.fr/v2/me', requestOptions)
		.then(response => response.json())

		const intraLogin = response['login']


		const user = await this.usersService.findOneIntraUser(intraLogin)

		const signedIn = (user === null ? false : true)	


		return {
			signedIn: signedIn,
			intraLogin: intraLogin,
			user: user,
		}
	}

	async canActivate (context: ExecutionContext) : Promise<boolean>{

		const code = context.getArgByIndex(0).query.code

		const request = context.switchToHttp().getRequest()

		const intraResponse = await this.authService.get42ApiToken(code)

		if (intraResponse.statusCode != 200)
			return false

		const intraUserInfo = await this.getIntraUserInfo(intraResponse['body']['access_token'])

		request.intraUserInfo = intraUserInfo

		return true
	}


}
