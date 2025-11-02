# Start RealityNet - All Services

Write-Host "🚀 Starting RealityNet..." -ForegroundColor Cyan

# Start backend in background
Write-Host "`n📡 Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\stake\backend; npm run dev" -WindowStyle Minimized

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start frontend
Write-Host "`n🌐 Starting Frontend..." -ForegroundColor Yellow
cd D:\stake
npm run dev

Write-Host "`n✅ All services starting!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:4000" -ForegroundColor Cyan

