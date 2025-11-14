"use client";

import { useEffect, useState } from "react";
import axios from "../utils/axios";

export default function Home() {
  const [message, setMessage] = useState("백엔드에서 메시지를 가져오는 중...");
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get("/")
      .then((res) => {
        setMessage(res.data.message || "백엔드 응답은 왔는데 message 필드가 없어요.");
      })
      .catch((err) => {
        console.error(err);
        setError("백엔드와 통신 중 오류가 발생했습니다.");
      });
  }, []);

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>프론트 ↔ 백엔드 연동 테스트</h1>
      <p>백엔드에서 온 메시지:</p>
      <pre style={{ background: "#f5f5f5", padding: "1rem" }}>
        {error ? error : message}
      </pre>
    </main>
  );
}
