import { IsNumberString, IsOptional, IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
	@IsDefined()
	@IsNotEmpty()
	@IsString()
	login: string;

	@IsDefined()
	@IsNotEmpty()
	@IsString()
	password: string;

	@IsDefined()
	@IsNotEmpty()
	@IsString()
	@IsOptional()
	intraLogin?:string;

	@IsString()
	@IsOptional()
	avatar?:string;

}

export class UpdateUserDtoPass {
	@IsDefined()
	@IsNotEmpty()
	@IsString()
	password: string;
}

export class UpdateUserDto {
	login?: string;
	password?: string;
	avatar?: string;
	intraLogin?: string;
	refreshToken?: string
}

export class UserDto {
	id: number;
	createdAt: Date;
	updatedAt: Date;
	login: string;
	password: string;
	avatar?: string;
	intraLogin?: string;
	refreshToken?:string
}

export class numberFormat {
	@IsNumberString()
	id: number;
}
