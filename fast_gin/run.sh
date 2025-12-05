#!/bin/bash

# 快速启动脚本 for Mock服务器
# 使用方法: ./run.sh [dev|prod|quiet]
# 示例:
#   ./run.sh dev       # 开发模式（详细日志）
#   ./run.sh prod      # 生产模式
#   ./run.sh quiet     # 安静模式（仅错误）

set -e

# 默认模式
MODE="${1:-dev}"

# 检查mock-server二进制文件是否存在
if [ ! -f "./mock-server" ]; then
    echo "构建mock-server..."
    go build -o mock-server main.go
fi

echo "启动Mock服务器..."
echo "模式: $MODE"

case "$MODE" in
    dev|development)
        echo "日志级别: DEBUG"
        echo "访问地址: http://localhost:8080"
        echo "按 Ctrl+C 停止服务器"
        export APP_MODE=development
        export LOG_LEVEL=debug
        ;;
    prod|production)
        echo "日志级别: INFO"
        echo "访问地址: http://localhost:8080"
        echo "按 Ctrl+C 停止服务器"
        export APP_MODE=production
        export LOG_LEVEL=info
        ;;
    quiet)
        echo "日志级别: ERROR"
        echo "访问地址: http://localhost:8080"
        echo "按 Ctrl+C 停止服务器"
        export LOG_LEVEL=error
        ;;
    *)
        echo "未知模式: $MODE"
        echo "用法: ./run.sh [dev|prod|quiet]"
        exit 1
        ;;
esac

./mock-server
