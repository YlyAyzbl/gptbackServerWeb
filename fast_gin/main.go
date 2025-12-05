package main

import (
	"os"

	"macg/core"
	"macg/flags"
	"macg/gins"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

func init() {
	flags.Parse()
	// 读取yaml配置文件
	core.ReadConfig(flags.ConfigFile)
	// 日志初始化 - 支持环境变量配置
	initLogger()
}

// initLogger 初始化日志，支持环境变量配置
func initLogger() {
	// 获取日志模式（开发/生产），默认开发
	mode := core.Development
	if os.Getenv("APP_MODE") == "production" {
		mode = core.Production
	}

	// 获取日志级别
	logLevelStr := os.Getenv("LOG_LEVEL")
	var logLevel zapcore.Level

	switch logLevelStr {
	case "debug":
		logLevel = zapcore.DebugLevel
	case "info":
		logLevel = zapcore.InfoLevel
	case "warn":
		logLevel = zapcore.WarnLevel
	case "error":
		logLevel = zapcore.ErrorLevel
	default:
		// 使用模式的默认级别
		logLevel = 0
	}

	if logLevel == 0 {
		core.InitLogWithMode(mode)
	} else {
		core.InitLogWithModeAndLevel(mode, logLevel)
	}

	zap.L().Info("应用启动",
		zap.String("mode", getModeString(mode)),
		zap.String("log_level", logLevelStr),
		zap.String("server_host", core.Cfg.Server.Host),
		zap.String("server_port", core.Cfg.Server.Port),
	)
}

// getModeString 获取模式字符串
func getModeString(mode core.LogMode) string {
	if mode == core.Production {
		return "production"
	}
	return "development"
}

func main() {
	r := gin.Default()
	gins.RouterInit(r)
	serAddr := core.Cfg.Server.Host + ":" + core.Cfg.Server.Port

	zap.L().Info("服务器启动", zap.String("address", serAddr))
	if err := r.Run(serAddr); err != nil {
		zap.L().Fatal("服务器启动失败", zap.Error(err))
	}
}
