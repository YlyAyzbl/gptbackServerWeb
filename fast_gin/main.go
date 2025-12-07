package main

import (
	"os"

	"macg/core"
	"macg/database"
	"macg/flags"
	"macg/gins"
	"macg/global"
	"macg/models"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

func init() {
	flags.Parse()
	// 读取yaml配置文件
	core.ReadConfig(flags.ConfigFile)
	// 初始化全局配置
	global.InitGlobalConfig()
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
	// 初始化数据库连接
	if err := database.InitDB(); err != nil {
		zap.L().Fatal("数据库初始化失败", zap.Error(err))
	}
	defer database.Close()

	// 自动迁移数据库表结构 - 包含所有模型
	if err := database.AutoMigrate(
		// RBAC 模型
		&models.Role{},
		&models.Permission{},
		&models.User{},
		// 业务模型
		&models.ServiceModel{},
		&models.SupportTicket{},
		&models.TicketReply{},
		&models.Announcement{},
		&models.TokenUsageRecord{},
		&models.APIKey{},
	); err != nil {
		zap.L().Fatal("数据库迁移失败", zap.Error(err))
	}

	// 初始化 RBAC 权限系统（必须在用户之前）
	models.InitDefaultRBAC()

	// 初始化默认测试账号
	models.InitDefaultUsers()

	// 初始化业务数据
	models.InitDefaultServices()
	models.InitDefaultTickets()
	models.InitDefaultAnnouncements()
	models.InitDefaultTokenUsage()

	// 打印测试账号信息
	PrintTestAccounts()

	r := gin.Default()
	gins.RouterInit(r)
	serAddr := core.Cfg.Server.Host + ":" + core.Cfg.Server.Port

	zap.L().Info("服务器启动", zap.String("address", serAddr))
	if err := r.Run(serAddr); err != nil {
		zap.L().Fatal("服务器启动失败", zap.Error(err))
	}
}

// PrintTestAccounts 打印测试账号信息
func PrintTestAccounts() {
	zap.L().Info("")
	zap.L().Info("╔═══════════════════════════════════════════════════╗")
	zap.L().Info("║            📋 测试账号信息                         ║")
	zap.L().Info("╚═══════════════════════════════════════════════════╝")
	zap.L().Info("")
	zap.L().Info("可使用以下账号进行登录测试：")
	zap.L().Info("")
	zap.L().Info("┌─────────────────────────────────────────────────┐")
	zap.L().Info("│ 账号: test_user    密码: 123456                  │")
	zap.L().Info("│ 说明: 基础测试账号，普通用户                    │")
	zap.L().Info("└─────────────────────────────────────────────────┘")
	zap.L().Info("")
	zap.L().Info("┌─────────────────────────────────────────────────┐")
	zap.L().Info("│ 账号: admin        密码: admin123                │")
	zap.L().Info("│ 说明: 管理员账号                                │")
	zap.L().Info("└─────────────────────────────────────────────────┘")
	zap.L().Info("")
	zap.L().Info("┌─────────────────────────────────────────────────┐")
	zap.L().Info("│ 账号: demo         密码: demo123                 │")
	zap.L().Info("│ 说明: 演示账号，普通用户                        │")
	zap.L().Info("└─────────────────────────────────────────────────┘")
	zap.L().Info("")
	zap.L().Info("访问地址: http://localhost:5173/login")
	zap.L().Info("")
}
