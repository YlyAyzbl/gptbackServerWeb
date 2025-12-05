package sqlite

import (
	"database/sql"
	"fmt"
	"math"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	_ "modernc.org/sqlite"
)

var DB *gorm.DB

func init() {

	// 使用 modernc.org/sqlite 作为底层驱动
	sqlDB, err := sql.Open("sqlite", "file:test.db?cache=shared")
	if err != nil {
		fmt.Println(err)
		panic("failed to connect database")
	}

	// 使用 gorm 的 sqlite 驱动包装 sql.DB
	db, err := gorm.Open(sqlite.Dialector{Conn: sqlDB}, &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	// 自动迁移 schema
	db.AutoMigrate(&User{})

	DB = db

	// 初始化默认测试账号
	InitializeDefaultUsers()

	// 打印测试账号信息
	PrintTestAccounts()
}

func GetDatabaseSizeInMB() (float64, error) {
	var size int64
	err := DB.Raw("SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()").Scan(&size).Error
	if err != nil {
		return 0, fmt.Errorf("failed to get database size: %w", err)
	}

	// 转换为MB并保留两位小数
	sizeInMB := float64(size) / 1024 / 1024
	return math.Round(sizeInMB*100) / 100, nil
}