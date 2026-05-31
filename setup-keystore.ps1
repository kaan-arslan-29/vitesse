param(
    [string]$Alias      = "vitesse",
    [string]$KeystoreFile = "vitesse.jks",
    [int]   $Validity   = 10000
)

$ErrorActionPreference = "Stop"
$androidDir  = Join-Path $PSScriptRoot "android"
$keystorePath = Join-Path $androidDir $KeystoreFile
$propsPath    = Join-Path $androidDir "keystore.properties"

Write-Host "`nVitesse Keystore Setup" -ForegroundColor Cyan
Write-Host "─────────────────────" -ForegroundColor DarkGray

if (Test-Path $keystorePath) {
    Write-Host "Keystore already exists: $keystorePath" -ForegroundColor Yellow
    Write-Host "Delete it first if you want to regenerate."
    exit 0
}

$storePass = Read-Host "Store password (min 6 chars)"
$keyPass   = Read-Host "Key password  (Enter = same as store)"
if ([string]::IsNullOrWhiteSpace($keyPass)) { $keyPass = $storePass }

$dname = "CN=Vitesse, OU=Mobile, O=Aria, L=TR, S=TR, C=TR"

$keytool = "C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe"
if (-not (Test-Path $keytool)) {
    $keytool = (Get-Command keytool -ErrorAction SilentlyContinue)?.Source
    if (-not $keytool) { Write-Host "keytool not found. Set JAVA_HOME." -ForegroundColor Red; exit 1 }
}

Write-Host "`nGenerating keystore..." -ForegroundColor Cyan
& $keytool -genkeypair -v `
    -keystore $keystorePath `
    -alias $Alias `
    -keyalg RSA -keysize 2048 `
    -validity $Validity `
    -storepass $storePass `
    -keypass $keyPass `
    -dname $dname

if ($LASTEXITCODE -ne 0) { Write-Host "keytool failed" -ForegroundColor Red; exit 1 }

# Write keystore.properties
@"
storeFile=$KeystoreFile
storePassword=$storePass
keyAlias=$Alias
keyPassword=$keyPass
"@ | Out-File -FilePath $propsPath -Encoding utf8

Write-Host "`nKeystore created: $keystorePath" -ForegroundColor Green
Write-Host "Properties saved: $propsPath"    -ForegroundColor Green
Write-Host "IMPORTANT: Never commit these files to git!" -ForegroundColor Yellow
