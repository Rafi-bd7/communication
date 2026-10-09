@echo off
title Adda 1-Click Free Deployment Helper (GitHub + Render + Vercel)
color 0B
cls

echo.
echo  ================================================================
echo  ^|         ADDA FREE DEPLOYMENT ASSISTANT (Vercel + Render)       ^|
echo  ================================================================
echo.
echo  Step 1: Create GitHub Repository
echo  ----------------------------------
echo  Your GitHub account is: Rafi-bd7
echo  Remote is already configured to: git@github.com:Rafi-bd7/communication.git
echo.
echo  Now opening https://github.com/new in your browser...
start "" "https://github.com/new"
echo.
echo  Instructions on GitHub webpage:
echo    1. Repository name box-e likhun: communication
echo    2. Public or Private select korun.
echo    3. Sabuj "Create repository" button-e click korun!
echo.
echo  ----------------------------------------------------------------
set /p READY="GitHub repository create kora shesh hole ENTER press korun: "

echo.
echo  Uploading code to GitHub (git push)...
git branch -M main
git push -u origin main

if %errorlevel% neq 0 (
    echo.
    echo  [!] Push failed or repository not created yet.
    echo  Please make sure repo "communication" is created on github.com/new and try again.
    pause
    exit /b
)

echo.
echo  [OK] Code successfully pushed to GitHub!
echo.
echo  ================================================================
echo  Step 2: Deploy Backend on Render.com (Free)
echo  ================================================================
echo  Opening Render Blueprint setup...
start "" "https://dashboard.render.com/blueprints"
echo.
echo  Render-e jeye:
echo    1. "New Blueprint Instance" ba "Connect a repository" click korun.
echo    2. "communication" repository select korun.
echo    3. render.yaml auto-detect hobe (adda-backend & adda-db).
echo    4. "Apply" click korun.
echo    5. Backend live hole backend URL ti copy korun (e.g. https://adda-backend-xxxx.onrender.com).
echo.
echo  ----------------------------------------------------------------
set /p BACKEND_URL="Render theke pawa Backend URL ti eikhane paste korun (optional, or press ENTER): "

echo.
echo  ================================================================
echo  Step 3: Deploy Frontend on Vercel.com (Free)
echo  ================================================================
echo  Opening Vercel New Project setup...
start "" "https://vercel.com/new"
echo.
echo  Vercel-e jeye:
echo    1. "communication" repo Import korun.
echo    2. Root Directory-te Edit click kore "web" select korun!
if not "%BACKEND_URL%"=="" (
echo    3. Environment Variables-e add korun:
echo       Name  : NEXT_PUBLIC_BACKEND_URL
echo       Value : %BACKEND_URL%
) else (
echo    3. Environment Variables-e add korun:
echo       Name  : NEXT_PUBLIC_BACKEND_URL
echo       Value : https://<your-render-backend-url>.onrender.com
)
echo    4. "Deploy" button click korun!
echo.
echo  ================================================================
echo  All deployment steps triggered!
echo  ================================================================
pause
