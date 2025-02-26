@echo off
echo Installing dependencies...
pnpm install

echo Building Electron application...
pnpm run build:electron

echo Build completed! Check the dist folder.
pause
