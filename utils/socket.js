global.onlineUsers = new Map();
module.exports.socketConnection = (io) => {
  io.on("connection", (socket) => {
    global.chatSocket = socket;
    socket.on("add-user", (userId) => {
      console.log(userId, "🔥 connected");
      onlineUsers.set(userId, socket.id);
      console.log(onlineUsers);
    });

    socket.on("send-msg", (data) => {
      const sendUserSocket = onlineUsers.get(data.to);
      if (sendUserSocket) {
        // console.log("sending", data.msg, "to", sendUserSocket);
        socket.to(sendUserSocket).emit("msg-recieve", data);
      }
    });
  });
};
