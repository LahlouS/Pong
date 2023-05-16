import { INestApplicationContext } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { Server } from "socket.io";

export class SocketIOAdapter extends IoAdapter {

	constructor(
		private app: INestApplicationContext,
	  ) {
		super(app);
	  }

	createIOServer(port: number, options?: any) {

		const server : Server = super.createIOServer(port, options)
		server.use((socket, next) => {
			next()
		})

		return server
	}
}
