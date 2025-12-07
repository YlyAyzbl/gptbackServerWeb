package core

import (
	"log"
	"os"

	"gopkg.in/yaml.v3"
)

// DatabaseConfig 数据库配置
type DatabaseConfig struct {
	Host     string `yaml:"host"`
	Port     int    `yaml:"port"`
	User     string `yaml:"user"`
	Password string `yaml:"password"`
	DBName   string `yaml:"dbname"`
	SSLMode  string `yaml:"sslmode"`
	TimeZone string `yaml:"timezone"`
}

// 定义配置结构体
type Config struct {
	Server struct {
		Port string `yaml:"port"`
		Host string `yaml:"host"`
	} `yaml:"server"`
	Database DatabaseConfig `yaml:"database"`
}

// 全局配置变量
var Cfg Config

func ReadConfig(configPath string) {
	file, err := os.Open(configPath)
	if err != nil {
		log.Fatalf("无法打开配置文件: %v", err)
	}
	defer file.Close()

	decoder := yaml.NewDecoder(file)
	err = decoder.Decode(&Cfg)
	if err != nil {
		log.Fatalf("配置文件解析错误: %v", err)
	}
}
