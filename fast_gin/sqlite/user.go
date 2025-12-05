package sqlite

import (
	"errors"
	"log"
	"macg/utils"

	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Username string `gorm:"uniqueIndex"`
	Password string
}


func CreatUser(username string, password string) error {
	// 检查用户名是否已存在
	var existingUser User
	result := DB.Where("username = ?", username).First(&existingUser)
	if result.Error == nil {
		return errors.New("用户名已存在")
	} else if !errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return errors.New("检查用户名时出现数据库错误")
	}

	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		return errors.New("密码加密失败")
	}

	// 开始事务
	tx := DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			log.Println("事务回滚:", r)
		}
	}()

	// 创建新用户
	user := User{Username: username, Password: hashedPassword}
	if err := tx.Create(&user).Error; err != nil {
		tx.Rollback()
		return errors.New("创建用户失败：" + err.Error())
	}
	// 提交事务
	if err := tx.Commit().Error; err != nil {
		return errors.New("提交事务失败：" + err.Error())
	}

	return nil
}
func CheckUser(username string, password string) error {
	var hashedPassword string
	result := DB.Raw("SELECT password FROM users WHERE username = ?", username).Scan(&hashedPassword)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return errors.New("用户名或密码错误")
		}
		return errors.New("查询用户时发生错误：" + result.Error.Error())
	}

	if !utils.ComparePassword(hashedPassword, password) {
		return errors.New("用户名或密码错误")
	}

	return nil
}

func CheckUserByUsername(username string) error {
	var user User
	result := DB.Where("username = ?", username).First(&user)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return errors.New("用户不存在")
		}
		return errors.New("查询用户时发生错误：" + result.Error.Error())
	}

	return nil
}
func GetUserIDByUsername(username string) (uint, error) {
	var user User
	result := DB.Select("id").Where("username = ?", username).First(&user)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return 0, errors.New("用户不存在")
		}
		return 0, errors.New("查询用户时发生错误：" + result.Error.Error())
	}

	return user.ID, nil
}

// 删除用户
func DelUser(id string) error {
	// 开始事务
	tx := DB.Begin()

	// 删除用户
	if err := tx.Where("id = ?", id).Delete(&User{}).Error; err != nil {
		tx.Rollback()
		return errors.New("删除用户失败：" + err.Error())
	}

	// 删除与用户关联的配置
	if err := tx.Where("uid = ?", id).Delete(&Config{}).Error; err != nil {
		tx.Rollback()
		return errors.New("删除用户配置失败：" + err.Error())
	}

	// 提交事务
	if err := tx.Commit().Error; err != nil {
		return errors.New("提交事务失败：" + err.Error())
	}

	return nil
}

// 获取所有用户信息
func GetAllUsers(page, pageSize int) ([]User, int64, error) {
	var users []User
	var totalCount int64

	// 计算总用户数
	if err := DB.Model(&User{}).Count(&totalCount).Error; err != nil {
		return nil, 0, errors.New("获取用户总数失败：" + err.Error())
	}

	// 计算偏移量
	offset := (page - 1) * pageSize

	// 查询用户列表
	result := DB.Offset(offset).Limit(pageSize).Find(&users)
	if result.Error != nil {
		return nil, 0, errors.New("查询用户列表失败：" + result.Error.Error())
	}

	return users, totalCount, nil
}
