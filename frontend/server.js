const { Server } = require("socket.io");
const fetch = require('node-fetch'); // node-fetch 임포트

const httpPort = 3000;
const ioPort = 3001;

// Socket.IO 웹소켓 서버만 생성 (3001번 포트)
const io = new Server({
  cors: {
    origin: `http://localhost:${httpPort}`, // 클라이언트 주소(Next.js 개발 서버)는 3000번이므로 그대로 둡니다.
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("a user connected:", socket.id);

  socket.on("join_room", (room_id) => {
    socket.join(room_id);
    console.log(`User ${socket.id} joined room: ${room_id}`);
  });

  socket.on("send_message", async (data) => {
    // 채팅방의 모든 사용자에게 메시지를 보냅니다. (data.room_id 사용)
    io.to(data.room_id).emit("receive_message", data);

    // 백엔드 API로 메시지를 보내 DB에 저장합니다.
    try {
      // 🔴 디버깅 로그 3: 백엔드로 어떤 데이터를 보내는지 확인
      console.log(`[DEBUG-NODE] DB 저장 요청:`, data);

      const apiUrl = process.env.API_URL || "http://localhost:5000";
      await fetch(`${apiUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error("메시지 저장 실패:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected:", socket.id);
  });
});

io.listen(ioPort);
console.log(`> Socket.IO server listening on port ${ioPort}`);
