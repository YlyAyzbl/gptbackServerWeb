package core

import (
	"fmt"
	"os"
	"time"

	"go.uber.org/zap"
	"go.uber.org/zap/buffer"
	"go.uber.org/zap/zapcore"
)

const (
	BuleColor   = "\033[34m"
	YellowColor = "\033[33m"
	RedColor    = "\033[31m"
	GreenColor  = "\033[32m"
	ResetColor  = "\033[0m"
)

// LogMode 定义日志模式
type LogMode int

const (
	Development LogMode = iota // 开发模式
	Production                 // 生产模式
)

// 全局变量控制模式
var CurrentMode LogMode = Development

// logEncoder 时间分片和level分片同时做
type logEncoder struct {
	zapcore.Encoder
	errFile     *os.File
	file        *os.File
	currentDate string
	mode        LogMode
}

func myEncodeLevel(level zapcore.Level, enc zapcore.PrimitiveArrayEncoder) {
	switch level {
	case zapcore.DebugLevel:
		enc.AppendString(GreenColor + "DEBUG" + ResetColor)
	case zapcore.InfoLevel:
		enc.AppendString(BuleColor + "INFO" + ResetColor)
	case zapcore.WarnLevel:
		enc.AppendString(YellowColor + "WARN" + ResetColor)
	case zapcore.ErrorLevel, zapcore.DPanicLevel, zapcore.PanicLevel, zapcore.FatalLevel:
		enc.AppendString(RedColor + "ERROR" + ResetColor)
	default:
		enc.AppendString(level.String())
	}
}

func (e *logEncoder) EncodeEntry(entry zapcore.Entry, fields []zapcore.Field) (*buffer.Buffer, error) {
	// 先调用原始的 EncodeEntry 方法生成日志行
	buff, err := e.Encoder.EncodeEntry(entry, fields)
	if err != nil {
		return nil, err
	}
	data := buff.String()
	buff.Reset()
	buff.AppendString("[myApp] " + data)
	data = buff.String()

	// 时间分片
	now := time.Now().Format("2006-01-02")
	if e.currentDate != now {
		os.MkdirAll(fmt.Sprintf("logs/%s", now), 0666)
		// 时间不同，先创建目录
		name := fmt.Sprintf("logs/%s/out.log", now)
		file, _ := os.OpenFile(name, os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0666)
		if e.file != nil {
			e.file.Close()
		}
		e.file = file
		e.currentDate = now
	}

	// 处理错误日志
	switch entry.Level {
	case zapcore.ErrorLevel, zapcore.DPanicLevel, zapcore.PanicLevel, zapcore.FatalLevel:
		if e.errFile == nil {
			name := fmt.Sprintf("logs/%s/err.log", now)
			file, _ := os.OpenFile(name, os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0666)
			e.errFile = file
		}
		if e.errFile != nil {
			e.errFile.WriteString(data)
		}
	}

	// 写入通用日志文件
	if e.currentDate == now && e.file != nil {
		e.file.WriteString(data)
	}

	return buff, nil
}

// SetLogMode 设置日志模式
func SetLogMode(mode LogMode) {
	CurrentMode = mode
}

// InitLog 初始化日志
func InitLog() *zap.Logger {
	return InitLogWithMode(CurrentMode)
}

// InitLogWithMode 根据指定模式初始化日志
func InitLogWithMode(mode LogMode) *zap.Logger {
	return InitLogWithModeAndLevel(mode, getDefaultLevelForMode(mode))
}

// getDefaultLevelForMode 根据模式获取默认日志级别
func getDefaultLevelForMode(mode LogMode) zapcore.Level {
	switch mode {
	case Development:
		return zapcore.DebugLevel
	case Production:
		return zapcore.InfoLevel
	default:
		return zapcore.DebugLevel
	}
}

// InitLogWithModeAndLevel 根据指定模式和级别初始化日志
func InitLogWithModeAndLevel(mode LogMode, level zapcore.Level) *zap.Logger {
	var cfg zap.Config
	var logLevel zapcore.Level = level

	switch mode {
	case Development:
		cfg = zap.NewDevelopmentConfig()
		if logLevel == 0 {
			logLevel = zapcore.DebugLevel
		}
	case Production:
		cfg = zap.NewProductionConfig()
		if logLevel == 0 {
			logLevel = zapcore.InfoLevel
		}
	default:
		cfg = zap.NewDevelopmentConfig()
		if logLevel == 0 {
			logLevel = zapcore.DebugLevel
		}
	}

	cfg.EncoderConfig.EncodeTime = zapcore.TimeEncoderOfLayout("2006-01-02 15:04:05")

	// 生产模式使用简洁的level编码，开发模式使用彩色编码
	if mode == Development {
		cfg.EncoderConfig.EncodeLevel = myEncodeLevel
	} else {
		cfg.EncoderConfig.EncodeLevel = zapcore.CapitalLevelEncoder
	}

	// 创建自定义的 Encoder
	var encoder zapcore.Encoder
	if mode == Development {
		encoder = zapcore.NewConsoleEncoder(cfg.EncoderConfig)
	} else {
		encoder = zapcore.NewJSONEncoder(cfg.EncoderConfig)
	}

	customEncoder := &logEncoder{
		Encoder: encoder,
		mode:    mode,
	}

	// 创建 Core
	core := zapcore.NewCore(
		customEncoder,              // 使用自定义的 Encoder
		zapcore.AddSync(os.Stdout), // 输出到控制台
		logLevel,                   // 根据模式设置日志级别
	)

	// 创建 Logger
	var logger *zap.Logger
	if mode == Development {
		logger = zap.New(core, zap.AddCaller(), zap.AddStacktrace(zapcore.ErrorLevel))
	} else {
		logger = zap.New(core, zap.AddCaller())
	}

	zap.ReplaceGlobals(logger)
	return logger
}

// 便捷方法
func InitDevLog() *zap.Logger {
	return InitLogWithMode(Development)
}

func InitProdLog() *zap.Logger {
	return InitLogWithMode(Production)
}

// 便捷方法：以指定日志级别初始化日志
func InitLogWithLevel(level zapcore.Level) *zap.Logger {
	return InitLogWithModeAndLevel(Development, level)
}

// 便捷方法：开发模式指定日志级别
func InitDevLogWithLevel(level zapcore.Level) *zap.Logger {
	return InitLogWithModeAndLevel(Development, level)
}

// 便捷方法：生产模式指定日志级别
func InitProdLogWithLevel(level zapcore.Level) *zap.Logger {
	return InitLogWithModeAndLevel(Production, level)
}

/*
// 使用示例：
// 方式1：通过全局变量控制
core.SetLogMode(core.Production) // 设置为生产模式
logger := core.InitLog()

// 方式2：直接指定模式
devLogger := core.InitDevLog()    // 开发模式 (DebugLevel)
prodLogger := core.InitProdLog()  // 生产模式 (InfoLevel)

// 方式3：显式指定模式和级别
logger := core.InitLogWithModeAndLevel(core.Development, zapcore.InfoLevel)

// 方式4：仅指定级别 (使用默认Development模式)
logger := core.InitLogWithLevel(zapcore.WarnLevel)

// 方式5：开发模式指定级别
devLogger := core.InitDevLogWithLevel(zapcore.InfoLevel)

// 日志级别从低到高: DebugLevel -> InfoLevel -> WarnLevel -> ErrorLevel -> DPanicLevel -> PanicLevel -> FatalLevel
*/
