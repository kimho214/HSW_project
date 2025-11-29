"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ChatRoom {
  room_id: string;
  opponent_email: string;
  opponent_name: string;
  last_message: string;
  last_sender: string;
  last_message_time: string;
  unread: boolean;
}

export default function ChatsPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [myEmail, setMyEmail] = useState("");
  const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null);

  useEffect(() => {
    fetchChatRooms();
  }, []);

  const fetchChatRooms = async () => {
    setLoading(true);
    setError("");

    // 토큰 가져오기
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      alert("로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    // 내 이메일 추출
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      setMyEmail(payload.email);
    } catch (err) {
      console.error("토큰 파싱 실패:", err);
      router.push("/login");
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/messages/rooms/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "채팅 목록을 불러오지 못했습니다.");
      }

      setRooms(data.rooms || []);
    } catch (err: any) {
      console.error("채팅 목록 불러오기 실패:", err);
      setError(err.message || "채팅 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "방금 전";
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;

    return date.toLocaleDateString("ko-KR", {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDeleteRoom = async (roomId: string, opponentName: string, e: React.MouseEvent) => {
    e.preventDefault(); // Link 클릭 방지
    e.stopPropagation();

    if (!confirm(`${opponentName}님과의 채팅방을 삭제하시겠습니까?\n모든 메시지가 삭제됩니다.`)) {
      return;
    }

    setDeletingRoomId(roomId);

    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      alert("로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/messages/rooms/${encodeURIComponent(roomId)}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "채팅방 삭제에 실패했습니다.");
      }

      // 목록에서 제거
      setRooms(prev => prev.filter(room => room.room_id !== roomId));
      alert("채팅방이 삭제되었습니다.");
    } catch (err: any) {
      console.error("채팅방 삭제 실패:", err);
      alert(err.message || "채팅방 삭제에 실패했습니다.");
    } finally {
      setDeletingRoomId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-600">채팅 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 헤더 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">채팅</h1>
        <p className="text-gray-600">
          총 {rooms.length}개의 대화
        </p>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* 채팅 목록 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {rooms.length === 0 ? (
          <div className="p-12 text-center">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-gray-600 mb-4">아직 대화 내역이 없습니다.</p>
            <Link
              href="/talents"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              인재 찾아보기
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {rooms.map((room) => (
              <div key={room.room_id} className="relative group">
                <Link
                  href={`/chat/${room.room_id}?name=${encodeURIComponent(room.opponent_name)}`}
                  className="block p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex items-start gap-4">
                    {/* 아바타 */}
                    <div className="flex-shrink-0">
                      <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                        <span className="text-lg font-medium text-blue-600">
                          {room.opponent_name.charAt(0)}
                        </span>
                      </div>
                    </div>

                    {/* 채팅 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {room.opponent_name}
                        </h3>
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {formatTime(room.last_message_time)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {room.last_sender === myEmail && (
                          <span className="text-sm text-gray-500">나:</span>
                        )}
                        <p className={`text-sm truncate ${room.unread ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                          {room.last_message}
                        </p>
                      </div>
                    </div>

                    {/* 미읽음 표시 */}
                    {room.unread && (
                      <div className="flex-shrink-0">
                        <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </Link>

                {/* 삭제 버튼 */}
                <button
                  onClick={(e) => handleDeleteRoom(room.room_id, room.opponent_name, e)}
                  disabled={deletingRoomId === room.room_id}
                  className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-red-500 hover:bg-red-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                  title="채팅방 삭제"
                >
                  {deletingRoomId === room.room_id ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
