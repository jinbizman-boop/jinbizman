@echo off
where python >nul 2>&1
if %errorlevel%==0 (
  python serve.py
) else (
  py serve.py
)
