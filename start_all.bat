@echo off
echo Starting Datn_TVTS Services...

echo Starting Backend Server (Node.js)...
start cmd /k "cd server && node server.js"

echo Starting Python AI Service (FastAPI)...
start cmd /k "cd ser-py && .\venv\Scripts\activate && py rag_service.py"

echo Starting Frontend Client (React)...
start cmd /k "cd client && npm run dev"

echo All services have been initiated in separate windows.
pause
