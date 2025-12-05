@echo off
REM 快速启动脚本 for Mock服务器 (Windows)
REM 使用方法: run.bat [dev|prod|quiet]
REM 示例:
REM   run.bat dev       REM 开发模式（详细日志）
REM   run.bat prod      REM 生产模式
REM   run.bat quiet     REM 安静模式（仅错误）

setlocal enabledelayedexpansion

REM 默认模式
set MODE=%1
if "%MODE%"=="" set MODE=dev

REM 检查mock-server.exe二进制文件是否存在
if not exist ".\mock-server.exe" (
    echo 构建mock-server...
    go build -o mock-server.exe main.go
    if errorlevel 1 (
        echo 构建失败!
        exit /b 1
    )
)

echo 启动Mock服务器...
echo 模式: %MODE%

if "%MODE%"=="dev" (
    goto development
) else if "%MODE%"=="development" (
    goto development
) else if "%MODE%"=="prod" (
    goto production
) else if "%MODE%"=="production" (
    goto production
) else if "%MODE%"=="quiet" (
    goto quiet
) else (
    echo 未知模式: %MODE%
    echo 用法: run.bat [dev^|prod^|quiet]
    exit /b 1
)

:development
echo 日志级别: DEBUG
echo 访问地址: http://localhost:8080
echo 按 Ctrl+C 停止服务器
set APP_MODE=development
set LOG_LEVEL=debug
goto start

:production
echo 日志级别: INFO
echo 访问地址: http://localhost:8080
echo 按 Ctrl+C 停止服务器
set APP_MODE=production
set LOG_LEVEL=info
goto start

:quiet
echo 日志级别: ERROR
echo 访问地址: http://localhost:8080
echo 按 Ctrl+C 停止服务器
set LOG_LEVEL=error
goto start

:start
.\mock-server.exe
