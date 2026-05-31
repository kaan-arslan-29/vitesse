param(
    [switch]$Release,
    [switch]$Install,
    [switch]$SkipWeb
)

$ErrorActionPreference = "Stop"

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
    & $adb install -r $apk.FullName
    if ($LASTEXITCODE -ne 0) { Fail "adb install failed" }
    Ok "Installed on device"
}

Set-Location $projectRoot
