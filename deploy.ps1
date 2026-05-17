$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
$adb = "C:\Users\arsla\AppData\Local\Android\Sdk\platform-tools\adb.exe"
$apk = "android\app\build\outputs\apk\debug\app-debug.apk"

Write-Host "Building web..." -ForegroundColor Cyan
npm run sync
if ($LASTEXITCODE -ne 0) { Write-Host "Sync failed" -ForegroundColor Red; exit 1 }

Write-Host "Building APK..." -ForegroundColor Cyan
Set-Location android
.\gradlew assembleDebug
Set-Location ..
if ($LASTEXITCODE -ne 0) { Write-Host "Gradle build failed" -ForegroundColor Red; exit 1 }

Write-Host "Installing on emulator..." -ForegroundColor Cyan
& $adb uninstall com.kaanarslan.yakitdefteri | Out-Null
& $adb install $apk
& $adb shell am start -n "com.kaanarslan.yakitdefteri/.MainActivity"
Write-Host "Done!" -ForegroundColor Green
