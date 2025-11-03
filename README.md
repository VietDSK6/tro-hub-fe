# Roommate Frontend (TanStack Query + Guard + RHF + Zod + Leaflet)

## Quick start
```bash
cd roommate-frontend-tq
cp .env.example .env           # chỉnh VITE_API_BASE nếu cần
npm i
npm run dev
```

## Có gì trong bản này?
- **TanStack Query** thay RTK Query, cấu hình `QueryClient` sẵn.
- **Auth Guard**: chặn trang nhạy cảm nếu chưa có `userId` → chuyển `/auth`.
- **React Hook Form + Zod**: form validate ở `/auth`, `/listings/new`, `/profile`.
- **Leaflet MapPicker**: click để lấy tọa độ (lng, lat) cho tạo tin & hồ sơ.
- **UI Tailwind**: card/btn/input đẹp và đồng bộ.

## Routing
- Public: `/`, `/auth`, `/listings/:id`
- Guarded: `/listings/new`, `/favorites`, `/profile`, `/matching`, `/messages/:peerId`

## WebSocket
Hook `useWebSocketChat(peerId)` truyền `x_user_id` qua query param theo backend hiện tại.
