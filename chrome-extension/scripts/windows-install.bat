@echo off
setlocal

:: Get directory of this script
set SCRIPT_DIR=%~dp0
cd %SCRIPT_DIR%
cd ..

:: Generate extension ID based on public key
for /f "tokens=*" %%a in ('node scripts\generate-extension-id.js') do set EXTENSION_ID=%%a

:: Update manifest.json with extension ID
node scripts\update-manifest.js %EXTENSION_ID%

:: Update native host manifest
node scripts\update-host-manifest.js %EXTENSION_ID%

:: Install native host
reg add "HKCU\Software\Google\Chrome\NativeMessagingHosts\com.mcphub.agent" /ve /t REG_SZ /d "%SCRIPT_DIR%\native-host\manifest.json" /f

:: Install native host dependencies
cd native-host
npm install

echo Installation complete!
echo Extension ID: %EXTENSION_ID%
echo Please load the extension in Chrome from the chrome-extension directory
