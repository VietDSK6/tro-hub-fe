# Frontend Trọ Hub — Ứng dụng khách (Vite + React)

## Tổng quan
Đây là mã nguồn frontend cho Trọ Hub, xây dựng bằng React + Vite. 

## Bắt đầu nhanh
```bash
cd roommate-frontend-fe
cp .env.example .env   # chỉnh biến môi trường nếu cần (VITE_API_BASE)
npm install
npm run dev
```

## Scripts quan trọng
- `npm run dev` — chạy môi trường phát triển (Vite)
- `npm run build` — build production (TypeScript build + Vite build)
- `npm run preview` — xem trước ứng dụng đã build

## Biến môi trường
- `VITE_API_BASE` — URL backend (ví dụ: `https://api.example.com`)
- Sao chép từ `./.env.example` và chỉnh lại cho môi trường của bạn.

## Đường dẫn chính (Routing)
- Public: `/`, `/auth`, `/listings/:id`
- Yêu cầu đăng nhập (Guarded): `/listings/new`, `/favorites`, `/profile`, `/matching`, `/messages/:peerId`

## Tích hợp backend
- Backend FastAPI mặc định chạy tại `http://localhost:8000` (sửa `VITE_API_BASE` nếu khác).
- Tất cả requests dùng axios client ở `src/app/client.ts` — header `X-User-Id` được tự động thêm khi có `userId` trong `localStorage`.

## Triển khai (deployment)
- Build production bằng `npm run build`. Thư mục xuất bản: `dist/`.
- Phù hợp để deploy lên Vercel, Netlify, Cloudflare Pages hoặc Railway.
- Khi deploy, thiết lập biến môi trường `VITE_API_BASE` trỏ về API production.

## Quy trình thêm tính năng mới
1. Thêm schema Pydantic / API endpoint phía backend (nếu cần).
2. Thêm client API trong `src/api/` (một file cho mỗi tính năng).
3. Sử dụng TanStack Query trong component/hook để fetch/mutate.
4. Dùng React Hook Form + Zod cho các form đầu vào.

## Phát triển & Debug
- Xem log network để kiểm tra header `X-User-Id` và endpoint.
- Backend auto-docs: `http://localhost:8000/docs` (FastAPI).

## Đóng góp
- Fork repo → tạo branch feature → PR kèm mô tả rõ ràng.
---
File chính liên quan: `src/` (components, pages, api, app)
