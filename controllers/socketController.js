

module.exports = function(io) {
    var master_room = {};
    var room_master = {};
    io.on('connection', socket => {
        console.log(`socket 用戶連接 ${socket.id}`);
      
        socket.on('joinRoom', room => {

            console.log('room: ', room);
            // const nowRoom = findNowRoom(socket);
            // console.log(socket);
            // if (nowRoom) {
            //     socket.leave(nowRoom);
            // }
            // socket.emit('user-joined', 'join success');// 傳給所有人包含自己
            
            if(!(room.roomId in room_master)){
                room_master[room.roomId] = room.userId;
                master_room[room.userId] = room.roomId;
                masterId = room.userId;
            }
            else{
                masterId = room_master[room.roomId];
            }
            console.log(room_master);
            console.log(master_room);
            socket.join(room.roomId);
            socket.emit('set-master', masterId);// 傳給自己是為了設定房主
            socket.broadcast.to(room.roomId).emit('user-joined',  socket.id);
            // socket.emit('set-master', masterId);// 傳給自己是為了設定房主
            // socket.broadcast.emit('user-joined',  socket.id); //傳給不包含自己的人
            // socket.join(room, () => {
            //     io.sockets.in(room).emit('roomBroadcast', '已有新人加入聊天室！'); // 傳給在特定房間的人
            // });
            console.log('user-joined', socket.id);
        });
        socket.on('broadcast', message=>{
            // console.log(socket.rooms);
            // console.log(socket);
            socket.broadcast.to(master_room[message.masterId]).emit('broadcast',  message);
            // socket.broadcast.emit('broadcast', message);
        });
      
        socket.on('disconnect', () => {
            console.log(`socket 用戶離開 ${socket.id}`);
            if(socket.id in master_room){
                delete room_master[master_room[socket.id]];
                delete master_room[socket.id];
            }
            io.sockets.emit('user-leaved', socket.id);
        });
    });
}