package global

import (
	"fmt"
	"macg/core"
	"macg/utils/rsautils"
	"strings"
)

var RsaObj rsautils.RsaObj
var UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
var base65Chars = "g50CuLviWF3HRPcnTVAhxGq7_49wfJZM6N1BdsYK2DSzQEtUk8p/eOaIXyo+mjlrb"
var base65Lookup = make(map[rune]int)

// AppConfig 全局应用配置
var AppConfig *AppConfigType

// AppConfigType 应用配置类型
type AppConfigType struct {
	Database core.DatabaseConfig
}

func init() {
	// base65 编码表
	for i, c := range base65Chars {
		base65Lookup[c] = i
	}
}

// InitGlobalConfig 初始化全局配置
func InitGlobalConfig() {
	AppConfig = &AppConfigType{
		Database: core.Cfg.Database,
	}
}

func Base65Encode(data []byte) string {
	var bits strings.Builder
	for _, b := range data {
		bits.WriteString(fmt.Sprintf("%08b", b))
	}

	padding := (6 - len(bits.String())%6) % 6
	bits.WriteString(strings.Repeat("0", padding))

	var encoded strings.Builder
	bitStr := bits.String()
	for i := 0; i < len(bitStr); i += 6 {
		chunk := bitStr[i : i+6]
		var val int
		fmt.Sscanf(chunk, "%b", &val)
		encoded.WriteByte(base65Chars[val])
	}
	return encoded.String()
}

func Base65Decode(encoded string) ([]byte, error) {
	var bits strings.Builder
	for _, c := range encoded {
		index, ok := base65Lookup[c]
		if !ok {
			return nil, fmt.Errorf("非法字符: %c", c)
		}
		bits.WriteString(fmt.Sprintf("%06b", index))
	}

	bitStr := bits.String()
	length := len(bitStr) / 8
	output := make([]byte, 0, length)
	for i := 0; i < length*8; i += 8 {
		var val byte
		fmt.Sscanf(bitStr[i:i+8], "%b", &val)
		output = append(output, val)
	}
	return output, nil
}
