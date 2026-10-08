// Netlify Function: 사이트 데이터를 Netlify Blobs 에 저장하고 불러와요. (주소: /api/data)
//   GET  /api/data   누구나 읽기 가능 (방문자 화면이 사용)
//   POST /api/data   비밀번호 확인용 (맞으면 {ok:true})
//   PUT  /api/data   데이터 저장 (관리자 비밀번호 필요)
// 관리자 비밀번호는 Netlify 사이트 설정 → Environment variables 의 ADMIN_PASSWORD 에 넣어요.
import { getStore } from "@netlify/blobs";
import { createHash, timingSafeEqual } from "node:crypto";

export const config = { path: "/api/data" };

const KEY = "site-data";
const MAX_BYTES = 5_500_000; // Netlify 함수 요청·응답 한도(약 6MB)보다 조금 작게

const HEADERS = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };
const reply = (body, status = 200, extra = {}) =>
  new Response(typeof body === "string" ? body : JSON.stringify(body), { status, headers: { ...HEADERS, ...extra } });

// 길이가 달라도 안전하게 비교하려고 해시로 바꿔서 비교해요
const digest = (s) => createHash("sha256").update(String(s)).digest();

export default async (req) => {
  // 저장 직후에도 최신 값을 읽도록 strong consistency
  const store = getStore({ name: "site", consistency: "strong" });

  if (req.method === "GET") {
    const text = await store.get(KEY, { type: "text" });
    return text === null ? reply({ empty: true }, 404) : reply(text);
  }

  if (req.method === "POST" || req.method === "PUT") {
    const password = process.env.ADMIN_PASSWORD;
    if (!password) return reply({ error: "no-password" }, 500);

    const given = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
    if (!timingSafeEqual(digest(given), digest(password))) {
      await new Promise((r) => setTimeout(r, 600)); // 비밀번호 대입 공격을 조금 느리게
      return reply({ error: "unauthorized" }, 401);
    }
    if (req.method === "POST") return reply({ ok: true });

    const text = await req.text();
    if (Buffer.byteLength(text) > MAX_BYTES) return reply({ error: "too-large" }, 413);
    let data;
    try { data = JSON.parse(text); } catch { return reply({ error: "bad-json" }, 400); }
    // 최소한의 모양 확인: 프로필 객체와 탭 목록이 있어야 해요
    if (!data || typeof data !== "object" || Array.isArray(data) ||
        !data.profile || typeof data.profile !== "object" || !Array.isArray(data.tabs)) {
      return reply({ error: "bad-shape" }, 400);
    }
    await store.set(KEY, text);
    return reply({ ok: true });
  }

  return reply({ error: "method-not-allowed" }, 405, { Allow: "GET, POST, PUT" });
};
