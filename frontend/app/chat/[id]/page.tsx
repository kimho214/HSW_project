"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { io, Socket } from "socket.io-client";

// 메시지 데이터의 타입을 정의합니다.
interface Message {
  room_id?: string; // DB에서 오는 키 (선택적)
  message: string;
  sender: string;
  created_at?: string; // 메시지 생성 시간 (선택적)
  // isMe는 클라이언트에서 동적으로 결정되므로 API 응답에는 포함되지 않을 수 있습니다.
  isMe: boolean;
}

// 페이지 props의 타입을 정의합니다. URL 파라미터로 채팅방 ID(id)를 받습니다.
export default function ChatPage() {
  const params = useParams();
  const roomId = Array.isArray(params.id) ? params.id[0] : params.id;
  const searchParams = useSearchParams();
  const opponentName = searchParams.get("name");
  const router = useRouter();

  // 상태(State) 변수들을 정의합니다.
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // 메시지 목록의 맨 아래를 참조하기 위한 Ref입니다. 새 메시지가 오면 이 위치로 스크롤합니다.
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 컴포넌트가 처음 렌더링될 때 한 번만 실행됩니다.
  useEffect(() => {
    // 1. 쿠키에서 로그인 토큰을 가져옵니다.
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    // 토큰이 없으면 로그인이 필요하므로 로그인 페이지로 보냅니다.
    if (!token) {
      alert("채팅을 하려면 로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    // 2. 토큰을 디코딩하여 현재 사용자의 ID(이메일)를 상태에 저장합니다.
    try {
      // JWT payload는 Base64-URL 형식이므로, atob로 디코딩하기 전에 표준 Base64 형식으로 변환해야 합니다.
      const base64Url = token.split(".")[1];
      // 1. URL-safe 문자를 Base64 표준 문자로 변경합니다.
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      // 2. 패딩을 추가하고, UTF-8 문자를 올바르게 디코딩합니다.
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));

      const payload = JSON.parse(jsonPayload);
      const currentUserId = payload.email;
      setMyUserId(currentUserId);
    } catch (error) {
      alert("사용자 정보를 확인하는 데 실패했습니다. 다시 로그인해주세요.");
      router.push("/login");
      return;
    }

    // 3. 웹소켓 서버에 연결합니다.
    // Flask-SocketIO는 같은 서버(API URL)에서 동작합니다
    const socketUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    // 4. 컴포넌트가 사라질 때(unmount) 소켓 연결을 정리합니다.
    return () => {
      newSocket.disconnect();
    };
  }, [router]); // 이 useEffect는 사용자 정보 설정과 소켓 초기 연결만 담당합니다.

  // roomId와 myUserId가 확정된 후에 대화 기록을 불러옵니다.
  useEffect(() => {
    if (!roomId || !myUserId) {
      return;
    }

    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const response = await fetch(`${apiUrl}/messages/${roomId}`);
        const data = await response.json();

        if (response.ok) {
          const historyWithIsMe: Message[] = data.messages.map((msg: { room_id: string; sender: string; message: string; created_at: string; }) => ({
            room_id: msg.room_id,
            sender: msg.sender,
            message: msg.message,
            created_at: msg.created_at,
            isMe: msg.sender === myUserId
          }));
          setMessages(historyWithIsMe);
        }
      } catch (error) {
        // 오류 발생 시 조용히 처리
      } finally {
        setIsLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [roomId, myUserId]); // roomId나 myUserId가 변경될 때마다 이 효과가 실행됩니다.

  // socket 또는 myUserId 상태가 변경될 때 실행됩니다.
  useEffect(() => {
    // 소켓이 연결되고, 사용자 ID가 확인되었을 때만 아래 로직을 실행합니다.
    if (socket && myUserId) {
      // 1. 서버에 'join_room' 이벤트를 보내 현재 채팅방에 참여함을 알립니다.
      socket.emit("join_room", roomId);
      
      // 2. 'receive_message' 이벤트를 수신할 핸들러 함수를 정의합니다.
      const handleReceiveMessage = (data: {
        message: string;
        sender: string;
      }) => {
        // 받은 메시지가 내가 보낸 것이면 아무것도 하지 않습니다. (이미 화면에 추가했으므로)
        if (data.sender === myUserId) {
          return;
        }

        // 다른 사람이 보낸 메시지인 경우에만 화면에 추가합니다.
        const isMyMessage = data.sender === myUserId;
        // 메시지 목록 상태를 업데이트합니다.
        setMessages((prev) => [...prev, { ...data, isMe: isMyMessage }]);
      };

      // 3. 이벤트 리스너를 등록합니다.
      socket.on("receive_message", handleReceiveMessage);

      // 4. 컴포넌트가 사라지거나, 의존성 배열의 값이 바뀔 때 기존 이벤트 리스너를 정리합니다.
      //    (메모리 누수 및 중복 실행 방지)
      return () => {
        socket.off("receive_message", handleReceiveMessage);
      };
    }
  }, [socket, roomId, myUserId]); // socket, roomId, myUserId가 준비되면 이 효과를 실행합니다.

  // messages 배열이 업데이트될 때마다 실행됩니다.
  useEffect(() => {
    // 새 메시지가 추가되면 채팅창 스크롤을 맨 아래로 부드럽게 이동시킵니다.
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // '전송' 버튼을 누르거나 Enter 키를 쳤을 때 실행되는 함수입니다.
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault(); // form의 기본 동작(페이지 새로고침)을 막습니다.

    // 메시지가 비어있거나, 소켓이 연결되지 않았거나, 사용자 ID가 없으면 아무것도 하지 않습니다.
    if (!currentMessage.trim() || !socket || !myUserId) return;

    // 서버로 보낼 메시지 데이터를 구성합니다.
    const messageData = {
      room_id: roomId,
      message: currentMessage,
      sender: myUserId,
      created_at: new Date().toISOString(), // 현재 시간을 ISO 문자열 형식으로 추가
    };

    // 1. 'send_message' 이벤트를 서버로 전송합니다.
    socket.emit("send_message", messageData);

    // 2. 내가 보낸 메시지를 즉시 내 화면에도 추가합니다. (서버를 거치지 않고 바로)
    setMessages((prev) => [...prev, { ...messageData, isMe: true }]);

    // 3. 입력창을 비웁니다.
    setCurrentMessage("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-w-3xl mx-auto bg-white rounded-lg shadow-md">
      {/* 채팅방 헤더 */}
      <header className="p-4 border-b bg-gray-50 rounded-t-lg">
        <h1 className="text-xl font-bold text-gray-800">채팅</h1>
        <p className="text-sm text-gray-500">대화 중인 상대: {opponentName || "알 수 없음"}</p>
      </header>

      {/* 메시지 목록 */}
      <main className="flex-1 p-4 overflow-y-auto bg-gray-100">
        {isLoadingHistory && <div className="text-center text-gray-500">대화 기록을 불러오는 중...</div>}
        <div className="space-y-4">
          {messages.map((msg, index) => {
            // 시간 포맷팅 함수
            const formatTime = (timeString?: string) => {
              if (!timeString) return "";
              const date = new Date(timeString);
              return date.toLocaleTimeString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              });
            };

            return (
              <div
                key={index}
                className={`flex items-end gap-2 ${
                  msg.isMe ? "justify-end" : "justify-start"
                }`}
              >
                {msg.isMe && <span className="text-xs text-gray-500 self-end pb-1">{formatTime(msg.created_at)}</span>}
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm ${
                  msg.isMe
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white text-gray-800 rounded-bl-none"
                }`}
              >
                <p className="text-sm">{msg.message}</p>
              </div>
              {!msg.isMe && <span className="text-xs text-gray-500 self-end pb-1">{formatTime(msg.created_at)}</span>}
            </div>
            );
          })}
          {/* 스크롤 위치를 위한 빈 div */}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* 메시지 입력 폼 */}
      <footer className="p-4 border-t bg-white rounded-b-lg">
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1 w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!currentMessage.trim()}
            className="px-6 py-2 border border-transparent rounded-md shadow-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            전송
          </button>
        </form>
      </footer>
    </div>
  );
}
