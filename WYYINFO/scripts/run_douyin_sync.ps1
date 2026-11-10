param(
    [Parameter(Mandatory = $true)][string]$Config,
    [string]$Python = "python.exe",
    [int]$Limit = 20
)
$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$configPath = (Resolve-Path -LiteralPath $Config).Path
$runtimeDirectory = Join-Path $projectRoot "runtime"
New-Item -ItemType Directory -Path $runtimeDirectory -Force | Out-Null
$reportPath = Join-Path $runtimeDirectory "douyin-sync-status.json"
# No credentials or source contents are passed on the command line.
Push-Location -LiteralPath $projectRoot
try {
    & $Python -X utf8 -m yiyi_sync --config $configPath --limit $Limit --report $reportPath sync
    exit $LASTEXITCODE
} finally {
    Pop-Location
}
