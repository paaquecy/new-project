@echo off
echo ========================================
echo ANPR Backend Installation Script
echo ========================================

echo.
echo Step 1: Creating virtual environment...
python -m venv venv
if %errorlevel% neq 0 (
    echo Error: Failed to create virtual environment
    pause
    exit /b 1
)

echo.
echo Step 2: Activating virtual environment...
call venv\Scripts\activate
if %errorlevel% neq 0 (
    echo Error: Failed to activate virtual environment
    pause
    exit /b 1
)

echo.
echo Step 3: Upgrading pip and setuptools...
python -m pip install --upgrade pip setuptools wheel
if %errorlevel% neq 0 (
    echo Error: Failed to upgrade pip
    pause
    exit /b 1
)

echo.
echo Step 4: Installing dependencies...
python install_dependencies.py
if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ========================================
echo Installation completed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Set up your Supabase database
echo 2. Copy env_example.txt to .env and fill in credentials
echo 3. Run: python start.py
echo.
pause 