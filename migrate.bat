@echo off
if "%~1"=="" (
  echo Error: Please provide a migration name.
  echo Usage: migrate.bat ^<migration_name^>
  exit /b 1
)

cd packages\pawwiz-backend
infisical run -- cmd /c "set DATABASE_URL=%%DIRECT_URL%% && npx prisma migrate dev --name %~1"
cd ..\..
