package flags

import (
	"flag"
	"fmt"
	"os"
	"path/filepath"
)

var (
	// ConfigFile 配置文件路径
	ConfigFile string
	// ShowVersion 是否显示版本信息
	ShowVersion bool
	// ShowHelp 是否显示帮助信息
	ShowHelp bool
)

const (
	// Version 程序版本号
	Version = "v0.1.0"
)

// Parse 解析命令行参数
func Parse() {
	flag.StringVar(&ConfigFile, "c", "", "config file path")
	flag.BoolVar(&ShowVersion, "v", false, "version")
	flag.BoolVar(&ShowHelp, "h", false, "help")

	flag.Parse()

	if ShowHelp {
		fmt.Println("Usage of program:")
		flag.PrintDefaults()
		os.Exit(0)
	}

	if ShowVersion {
		fmt.Printf("Version: %s\n", Version)
		os.Exit(0)
	}

	// 如果未指定配置文件，使用当前目录下的config.yaml
	if ConfigFile == "" {
		ConfigFile = filepath.Join(".", "config.yaml")
	}
}
