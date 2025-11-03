import { useEffect, useRef, useState } from "react";
export function useWebSocketChat(peerId: string){
  const [messages, setMessages] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket|null>(null);
  useEffect(()=>{
    const uid = localStorage.getItem("userId");
    if (!uid || !peerId) return;
    const base = (import.meta.env.VITE_API_BASE || "http://localhost:8000").replace("http","ws");
    const url = new URL(base + "/chat/ws");
    url.searchParams.set("peer_id", peerId);
    url.searchParams.set("x_user_id", uid);
    const ws = new WebSocket(url.toString());
    wsRef.current = ws;
    ws.onopen = ()=> setConnected(true);
    ws.onmessage = (ev)=>{ try { setMessages(prev => [...prev, JSON.parse(ev.data)]) } catch {} };
    ws.onclose = ()=> setConnected(false);
    return ()=> ws.close();
  }, [peerId]);
  const send = (content: string)=> wsRef.current?.send(JSON.stringify({ content }));
  return { messages, connected, send };
}
