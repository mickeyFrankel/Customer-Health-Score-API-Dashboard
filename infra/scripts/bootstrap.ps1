param(
  [switch]$Rebuild
)

$root = (Split-Path $PSScriptRoot -Parent)
Set-Location (Join-Path $root '..')

Write-Host 'Installing workspace dependencies...'
npm install

Write-Host 'Generating Prisma client...'
npm run prisma:generate -w api

$composeArgs = @('-f', 'infra/docker-compose.yml', 'up', '--detach')
if ($Rebuild) {
  $composeArgs += '--build'
}

Write-Host 'Starting infrastructure stack...'
docker compose @composeArgs

Write-Host 'API available at http://localhost:3000 and Postgres at localhost:5432'
