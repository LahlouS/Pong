import { Controller, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { User } from '@prisma/client';
import { Server, Socket } from 'socket.io';
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { UsersService } from 'src/users/users.service';
import { RoomsService } from './rooms/rooms.service';
import { AddFriendData, BanMemberData, BlockUserData, CreateRoomData, DowngradeMemberData, FriendRequestData, JoinRoomData, KickMemberData, MessageData, MuteMemberData, UpgradeMemberData } from './Chat.types';
import { WsGuard } from './ws.guard';
import { MessageService } from './messages/messages.service';
import { ChatService } from './chat.service';
import { LeaveRoomData } from './Chat.types';
import { MuteService } from './rooms/mute.service';

@WebSocketGateway({ namespace: 'chat' })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  constructor(private readonly roomService: RoomsService,
    private readonly userService: UsersService,
    private readonly messageService: MessageService,
    private readonly chatService: ChatService) { }

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('directMessage')
  async handleDirectMessage(client: any, payload: MessageData)/* : MessageData */ {
    return await this.chatService.manageDirectMessage(this.server, client, payload)
  }

  @SubscribeMessage('roomMessage')
  async handleRoomMessage(client: any, payload: MessageData)/* : MessageData */ {
    return await this.chatService.manageRoomMessage(this.server, client, payload)
  }

  @SubscribeMessage('createRoom')
  handleCreateRoom(client: any, payload: CreateRoomData) {
    return this.chatService.createRoom(this.server, client, payload)
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(client: any, payload: LeaveRoomData) {
    return await this.chatService.leaveRoom(this.server, client, payload)
  }

  @SubscribeMessage('join')
  async handleJoin(client: Socket, id: number) {
    return this.chatService.join(client, id)
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(client: Socket, payload: JoinRoomData) {
    return this.chatService.joinRoom(this.server, client, payload)
  }

  @SubscribeMessage('acceptFriend') // TODO changer par accept request
  async handleAddFriend(client: Socket, friendRequestId: number) {
    return this.chatService.acceptFriendRequest(this.server, client, friendRequestId)
  }

  @SubscribeMessage('declineFriend')
  async handleDeclineFriend(client: Socket, payload: { senderId: number, friendRequestId: number }) {
    return this.chatService.declineFriendRequest(this.server, client, payload)
  }

  @SubscribeMessage('removeFriend')
  async handleRemoveFriend(client: Socket, paylaod: {sender_id: number, user_id: number}) {
    return this.chatService.removeFriend(this.server, paylaod) 
  }

  @SubscribeMessage('friendRequest')
  async handleFriendRequest(client: Socket, payload: FriendRequestData) {
    return this.chatService.sendFriendRequest(this.server, client, payload);
  }

  @SubscribeMessage('banMember')
  async handleBanMembers(client: Socket, payload: BanMemberData) {
    return this.chatService.banMember(this.server, client, payload)
  }

  @SubscribeMessage('unbanMember')
  async handleUnbanMembers(client: Socket, payload: BanMemberData) {
    return this.chatService.unbanUser(this.server, client, payload)
  }

  @SubscribeMessage('upgradeMember')
  async handleUpgradeMember(client: Socket, payload: UpgradeMemberData) {
    return this.chatService.upgradeMember(this.server, payload)
  }

  @SubscribeMessage('downgradeMember')
  async handleDowngradeMember(client: Socket, payload: DowngradeMemberData) {
    return this.chatService.downgradeMember(this.server, payload)
  }

  @SubscribeMessage('kickMember') 
  async handleKickMember(client: Socket, payload: KickMemberData) {
    return this.chatService.kickMember(this.server, payload)
  }

  @SubscribeMessage('muteMember')
  async handleMuteMember(client: Socket, payload: MuteMemberData) {
    return this.chatService.muteMember(this.server, payload)
  }

  @SubscribeMessage('blockUser')
  async handleBlockUser(client: Socket, payload: BlockUserData) {
    return this.chatService.blockUser(this.server, payload)
  }

  @SubscribeMessage('unblockUser')
  async handleUnblockUser(client: Socket, payload: BlockUserData) {
    return this.chatService.unblockUser(this.server, payload)
  }

  afterInit(server: Server): any {
    // console.log('Initialized')
  }

  handleConnection(client: Socket, ...args: any[]): any {
    // console.log('args: ', args)
    // console.log(`Client connected: ${client.id}`);
    this.server.to(client.id).emit('connected')
  }

  handleDisconnect(client: Socket): any {
    // console.log(`Client disconnected: ${client.id}`);
  }
}