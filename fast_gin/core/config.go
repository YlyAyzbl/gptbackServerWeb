package core

import (
	"log"
	"os"

	"gopkg.in/yaml.v3"
)

// 定义配置结构体
type Config struct {
	Server struct {
		Port string `yaml:"port"`
		Host string `yaml:"host"`
	} `yaml:"server"`
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
