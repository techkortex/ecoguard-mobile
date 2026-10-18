$ErrorActionPreference='Stop'
if(-not $env:ECOGUARD_CONFIG){$desktop=[Environment]::GetFolderPath('Desktop');$env:ECOGUARD_CONFIG=Join-Path $desktop 'TCC FINAL\firmware\ArduinoIDE\EcoGuardTotem\config.h'}
if(-not $env:OPENWEATHER_API_KEY -and -not (Test-Path -LiteralPath $env:ECOGUARD_CONFIG)){throw 'Informe o caminho de config.h por ECOGUARD_CONFIG ou defina OPENWEATHER_API_KEY no servidor.'}
Set-Location -LiteralPath $PSScriptRoot
node ./server.mjs
