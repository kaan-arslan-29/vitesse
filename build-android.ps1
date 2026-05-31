param(
    [switch]$Release,
    [switch]$Install,
    [switch]$SkipWeb
)

$ErrorActionPreference = "Stop"

# Ensure JAVA_HOME is set (Android Studio JBR)
if (-not $env:JAVA_HOME) {
    $env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
}
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

# Ensure ANDROID_HOME is set
if (-not $env:ANDROID_HOME) {
    $env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
}

$projectRoot = $PSScriptRoot
$androidDir  = Join-Path $projectRoot "android"

function Step($msg) { Write-Host "`n>> $msg" -ForegroundColor Cyan }
function Ok($msg)   { Write-Host "   $msg" -ForegroundColor Green }
function Fail($msg) { Write-Host "   ERROR: $msg" -ForegroundColor Red; exit 1 }

# ── 1. Web build ──────────────────────────────────────────────────────────────
if (-not $SkipWeb) {
    Step "Vite build"
    Set-Location $projectRoot
    npm run build
    if ($LASTEXITCODE -ne 0) { Fail "vite build failed" }
    Ok "Web assets built -> dist/"
}

# ── 2. Capacitor sync ─────────────────────────────────────────────────────────
Step "Capacitor sync"
Set-Location $projectRoot
npx cap sync android
if ($LASTEXITCODE -ne 0) { Fail "cap sync failed" }
Ok "Assets synced to android/"

# ── 3. Ensure local.properties ────────────────────────────────────────────────
$localProps = Join-Path $androidDir "local.properties"
if (-not (Test-Path $localProps)) {
    $sdkPath = $env:ANDROID_HOME -replace "\\", "\\\\"
    "sdk.dir=$sdkPath" | Out-File -FilePath $localProps -Encoding utf8
    Ok "local.properties created"
}

# ── 4. Gradle build ───────────────────────────────────────────────────────────
$buildType  = if ($Release) { "Release" } else { "Debug" }
$gradleTask = "assemble$buildType"
Step "Gradle $gradleTask"

Set-Location $androidDir

if ($Release) {
    $keystoreProps = Join-Path $androidDir "keystore.properties"
    if (-not (Test-Path $keystoreProps)) {
        Fail "Release build requires android/keystore.properties`n   Run: .\setup-keystore.ps1"
    }
}

& ".\gradlew.bat" $gradleTask
if ($LASTEXITCODE -ne 0) { Fail "Gradle $gradleTask failed" }

# ── 5. Result ─────────────────────────────────────────────────────────────────
$apkDir = Join-Path $androidDir "app\build\outputs\apk\$($buildType.ToLower())"
$apk    = Get-ChildItem $apkDir -Filter "*.apk" -ErrorAction SilentlyContinue | Select-Object -First 1

if ($apk) {
    $size = [math]::Round($apk.Length / 1MB, 1)
    Ok "APK ready ($size MB): $($apk.FullName)"
} else {
    Fail "APK not found in $apkDir"
}

# ── 6. Install on connected device ────────────────────────────────────────────
if ($Install) {
    Step "ADB install"
    $adb = Join-Path $env:ANDROID_HOME "platform-tools\adb.exe"
    & $adb -s emulator-5554 install -r $apk.FullName
    if ($LASTEXITCODE -ne 0) { Fail "adb install failed" }
    Ok "Installed on device"

    Step "Launch app (first pass to warm up WebView)"
    & $adb -s emulator-5554 shell am start -n com.aria.vitesse/.MainActivity
    Start-Sleep -Seconds 3

    Step "Clear Service Worker cache"
    $appPid2 = (& $adb -s emulator-5554 shell pidof com.aria.vitesse).Trim()
    if ($appPid2) {
        & $adb -s emulator-5554 forward tcp:9222 localabstract:webview_devtools_remote_$appPid2 | Out-Null
        Start-Sleep -Milliseconds 500
        $clearScript = Join-Path $projectRoot "__clear_sw_tmp.js"
        @"
const http=require('http');
http.get('http://localhost:9222/json',(res)=>{let d='';res.on('data',c=>d+=c);res.on('end',()=>{try{const pages=JSON.parse(d);const page=pages.find(p=>p.type==='page');if(!page){console.log('no page found');process.exit(0);return;}const WebSocket=require('ws');const ws=new WebSocket(page.webSocketDebuggerUrl);ws.on('open',()=>{ws.send(JSON.stringify({id:1,method:'Runtime.evaluate',params:{expression:'(async()=>{const r=await navigator.serviceWorker.getRegistrations();for(const s of r)await s.unregister();const k=await caches.keys();for(const c of k)await caches.delete(c);return r.length+" SW + "+k.length+" caches cleared";})()',returnByValue:true,awaitPromise:true}}));});ws.on('message',(data)=>{console.log(JSON.parse(data.toString()).result?.result?.value||'done');ws.close();process.exit(0);});ws.on('error',()=>process.exit(0));setTimeout(()=>process.exit(0),5000);}catch(e){process.exit(0);}});});
"@ | Out-File -FilePath $clearScript -Encoding utf8
        Set-Location $projectRoot
        $swOut = node $clearScript 2>$null
        Remove-Item $clearScript -ErrorAction SilentlyContinue
        Ok "SW cache: $swOut"
    }

    Step "Restart app with fresh cache"
    & $adb -s emulator-5554 shell am force-stop com.aria.vitesse
    Start-Sleep -Milliseconds 800
    & $adb -s emulator-5554 shell am start -n com.aria.vitesse/.MainActivity
    Ok "App launched"
}

Set-Location $projectRoot
