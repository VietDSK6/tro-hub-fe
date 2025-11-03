import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { chatHistory } from "@/api/chat";
import { useWebSocketChat } from "@/hooks/useWebSocket";

export default function Messages(){
  const { peerId="peer" } = useParams();
  useEffect(()=>{ localStorage.setItem("lastPeer", peerId); }, [peerId]);
  const { data } = useQuery({ queryKey:["chat", peerId], queryFn: ()=> chatHistory(peerId,1,50) });
  const { messages, connected, send } = useWebSocketChat(peerId);
  const [text,setText] = useState("");

  return (
    <div className="container-app p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="h1">Chat với: {peerId}</div>
        <span className={"badge " + (connected? "bg-green-100 text-green-700":"")}>
          {connected? "Đã kết nối":"Mất kết nối"}
        </span>
      </div>

      <div className="card p-3 h-80 overflow-auto">
        {(data?.items||[]).map((m:any)=>(<div key={m._id} className="text-sm text-gray-500">{m.from} ➜ {m.to}: {m.content}</div>))}
        {messages.map((m:any, idx)=>(<div key={"rt"+idx} className="text-sm">{m.from} ➜ {m.to}: {m.content}</div>))}
      </div>

      <div className="flex gap-2">
        <input className="input" placeholder="Nhập tin nhắn..." value={text} onChange={e=>setText(e.target.value)}/>
        <button className="btn btn-primary" onClick={()=>{ if(text.trim()) { send(text); setText(""); } }}>Gửi</button>
      </div>
    </div>
  );
}
