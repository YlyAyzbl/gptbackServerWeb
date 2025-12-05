package sqlite

import (
	"fmt"
	"strings"
)

// Config 结构体定义
type Config struct {
	ID     int    `gorm:"primaryKey;autoIncrement"`
	UID    int    `gorm:"not null"`
	Allows string `gorm:"type:text;not null"`
}

func GetConfigByID(id int) ([]string, error) {
	var config Config
	result := DB.Where("uid = ?", id).First(&config)
	if result.Error != nil {
		return nil, fmt.Errorf("查询配置失败: %w", result.Error)
	}
	result1 := strings.ReplaceAll(config.Allows, "[", "")
	result1 = strings.ReplaceAll(result1, "]", "")
	arr := strings.Split(result1, ",")

	// Iterate through the array and trim spaces from each element
	for i := range arr {
		arr[i] = strings.TrimSpace(arr[i])
	}
	return arr, nil

}

func UpdateConfigByID(id int, allows string) error {
	result := DB.Model(&Config{}).Where("id = ?", id).Update("allows", allows)
	if result.Error != nil {
		return fmt.Errorf("更新配置失败: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("未找到ID为%d的配置", id)
	}
	return nil
}

func GetAllConfigs(page, pageSize int) ([]Config, int64, error) {
	var configs []Config
	var total int64

	// 计算偏移量
	offset := (page - 1) * pageSize

	// 查询总记录数
	if err := DB.Model(&Config{}).Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("获取总记录数失败: %w", err)
	}

	// 分页查询
	result := DB.Offset(offset).Limit(pageSize).Find(&configs)
	if result.Error != nil {
		return nil, 0, fmt.Errorf("分页查询配置失败: %w", result.Error)
	}

	return configs, total, nil
}
