package database

import (
	"fmt"
	"time"

	"macg/global"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"go.uber.org/zap"
)

var DB *gorm.DB

// Config 数据库配置
type Config struct {
	Host     string
	Port     int
	User     string
	Password string
	DBName   string
	SSLMode  string
	TimeZone string
}

// InitDB 初始化数据库连接
func InitDB() error {
	// 从全局配置读取数据库配置
	cfg := Config{
		Host:     global.AppConfig.Database.Host,
		Port:     global.AppConfig.Database.Port,
		User:     global.AppConfig.Database.User,
		Password: global.AppConfig.Database.Password,
		DBName:   global.AppConfig.Database.DBName,
		SSLMode:  global.AppConfig.Database.SSLMode,
		TimeZone: global.AppConfig.Database.TimeZone,
	}

	// 构建 PostgreSQL DSN
	dsn := fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=%s TimeZone=%s",
		cfg.Host, cfg.Port, cfg.User, cfg.Password, cfg.DBName, cfg.SSLMode, cfg.TimeZone,
	)

	// 配置 GORM 日志 - 使用 zap 记录慢查询
	newLogger := logger.New(
		&zapWriter{},
		logger.Config{
			SlowThreshold:             time.Second, // 慢 SQL 阈值
			LogLevel:                  logger.Info, // 日志级别
			IgnoreRecordNotFoundError: true,        // 忽略 ErrRecordNotFound 错误
			ParameterizedQueries:      false,       // 不隐藏参数
			Colorful:                  true,        // 彩色输出
		},
	)

	// 连接数据库
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: newLogger,
	})
	if err != nil {
		zap.L().Error("PostgreSQL 连接失败", zap.Error(err))
		return fmt.Errorf("failed to connect to PostgreSQL: %w", err)
	}

	// 获取底层 sql.DB 以配置连接池
	sqlDB, err := db.DB()
	if err != nil {
		zap.L().Error("获取 sql.DB 失败", zap.Error(err))
		return fmt.Errorf("failed to get underlying sql.DB: %w", err)
	}

	// 设置连接池参数
	sqlDB.SetMaxIdleConns(10)           // 最大空闲连接数
	sqlDB.SetMaxOpenConns(100)          // 最大打开连接数
	sqlDB.SetConnMaxLifetime(time.Hour) // 连接最大生命周期

	DB = db

	zap.L().Info("═══════════════════════════════════════════════════")
	zap.L().Info("✅ PostgreSQL 数据库连接成功",
		zap.String("host", cfg.Host),
		zap.Int("port", cfg.Port),
		zap.String("database", cfg.DBName),
	)
	zap.L().Info("═══════════════════════════════════════════════════")

	return nil
}

// zapWriter 实现 io.Writer 接口，将 GORM 日志输出到 zap
type zapWriter struct{}

func (w *zapWriter) Printf(format string, args ...interface{}) {
	zap.L().Info(fmt.Sprintf(format, args...))
}

func (w *zapWriter) Write(p []byte) (n int, err error) {
	zap.L().Info(string(p))
	return len(p), nil
}

// AutoMigrate 自动迁移数据库表结构
func AutoMigrate(models ...interface{}) error {
	if DB == nil {
		return fmt.Errorf("database not initialized")
	}
	return DB.AutoMigrate(models...)
}

// GetDB 获取数据库实例
func GetDB() *gorm.DB {
	return DB
}

// Close 关闭数据库连接
func Close() error {
	if DB != nil {
		sqlDB, err := DB.DB()
		if err != nil {
			return err
		}
		zap.L().Info("数据库连接已关闭")
		return sqlDB.Close()
	}
	return nil
}
