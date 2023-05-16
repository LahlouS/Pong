import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from "@nestjs/common";
import { jwtConstants} from "./constants";
import { validateHeaderName } from "http";
import { JwtPayload } from './auth.types'
import { Request } from 'express'
import { Req } from '@nestjs/common'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor() {
		super ({
			usernameField: 'login',
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: jwtConstants.jwt_secret,
		});
	}

	async validate(payload: JwtPayload) {
		
		return payload;
	}
}
