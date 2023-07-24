
function findNowRoom(socket) {

    return Object.keys(socket.rooms).find(item => {
        console.log(item);
        return item !== socket.id;
    });
}

module.exports = function(io) {
    io.on('connection', socket => {
        console.log(`socket 用戶連接 ${socket.id}`);
      
        socket.on('joinRoom', room => {

            console.log('room: ', room);
            // const nowRoom = findNowRoom(socket);
            // console.log(socket);
            // if (nowRoom) {
            //     socket.leave(nowRoom);
            // }
            socket.emit('joinSuccess', 'join success');
            io.sockets.emit('joinSuccess', '已有新人加入聊天室！');
            socket.join(room, () => {
                io.sockets.in(room).emit('roomBroadcast', '已有新人加入聊天室！');
            });
            console.log(Object.keys(socket))
        });
      
        socket.on('peerconnectSignaling', message => {
            // console.log('接收資料：', message);
            console.log('接收資料', message);

            const nowRoom = findNowRoom(socket);

            socket.broadcast.emit('peerconnectSignaling', message)
        });
      
        socket.on('disconnect', () => {
            console.log(`socket 用戶離開 ${socket.id}`);
        });
    });
}