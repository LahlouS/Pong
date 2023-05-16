export class CreateUserParams {
	login: string;
	password: string;
	avatar?: string;
	intraLogin?: string;
}

export class UpdateUserParams {
	login?: string;
	password?: string;
	avatar?: string;
	intraLogin?: string;
	twoFA?: string;
	isTwoFA?: boolean;
}

export class UpdateUserPass {
	password: string;
}

export class profile {
	login: string;
	avatar: string;
	win: number;
	loose: number;
	nbGames: number;
	status: string;
}

