# Frontend

`use_ollama` 백엔드와 연결되는 React + Vite 프론트엔드입니다.

주요 역할:
- 대화형 챗 UI
- 실시간 trace 표시
- 세션 목록 조회 / 재열기 / 삭제

## Run

```bash
npm install
npm run dev
```

기본 개발 서버: `http://localhost:5173`

## Build

```bash
npm run build
```

## Env

필요하면 `.env`에 API 주소를 지정할 수 있습니다.

```env
VITE_API_URL=http://localhost:8000
```
