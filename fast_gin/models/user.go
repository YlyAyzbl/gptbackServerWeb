package models

import (
	"errors"
	"time"

	"macg/database"
	"macg/utils"

	"github.com/google/uuid"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// User 用户模型 - 使用 UUID 作为主键
type User struct {
	ID        uuid.UUID      `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Username  string         `gorm:"uniqueIndex;size:100;not null" json:"username"`
	Email     string         `gorm:"uniqueIndex;size:255" json:"email"`
	Password  string         `gorm:"size:255;not null" json:"-"` // json:"-" 不返回密码
	Name      string         `gorm:"size:100" json:"name"`
	Avatar    string         `gorm:"size:500" json:"avatar"`
	Status    string         `gorm:"size:20;default:'active'" json:"status"` // active, inactive, banned
	LastLogin *time.Time     `json:"last_login"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// RBAC 关联
	Roles []Role `gorm:"many2many:user_roles;" json:"roles,omitempty"`
}

// TableName 指定表名
func (User) TableName() string {
	return "users"
}

// BeforeCreate GORM 钩子 - 创建前生成 UUID
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}

// CreateUser 创建用户
func CreateUser(username, email, password, name, role string) (*User, error) {
	db := database.GetDB()

	// 检查用户名是否已存在
	var existingUser User
	if err := db.Where("username = ?", username).First(&existingUser).Error; err == nil {
		return nil, errors.New("用户名已存在")
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, errors.New("检查用户名时出现数据库错误")
	}

	// 检查邮箱是否已存在
	if email != "" {
		if err := db.Where("email = ?", email).First(&existingUser).Error; err == nil {
			return nil, errors.New("邮箱已被注册")
		}
	}

	// 密码加密
	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		return nil, errors.New("密码加密失败")
	}

	// 设置默认角色
	if role == "" {
		role = "user"
	}

	// 创建用户
	user := User{
		Username: username,
		Email:    email,
		Password: hashedPassword,
		Name:     name,
		Status:   "active",
	}

	if err := db.Create(&user).Error; err != nil {
		return nil, errors.New("创建用户失败：" + err.Error())
	}

	// 分配角色（通过 RBAC 系统）
	if role != "" {
		var roleModel Role
		if err := db.Where("name = ?", role).First(&roleModel).Error; err == nil {
			db.Model(&user).Association("Roles").Append(&roleModel)
		}
	}

	return &user, nil
}

// CheckUserCredentials 验证用户凭据
func CheckUserCredentials(username, password string) (*User, error) {
	db := database.GetDB()

	var user User
	result := db.Where("username = ?", username).First(&user)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, errors.New("用户名或密码错误")
		}
		return nil, errors.New("查询用户时发生错误：" + result.Error.Error())
	}

	if user.Status != "active" {
		return nil, errors.New("账号已被禁用")
	}

	if !utils.ComparePassword(user.Password, password) {
		return nil, errors.New("用户名或密码错误")
	}

	// 更新最后登录时间
	now := time.Now()
	db.Model(&user).Update("last_login", now)

	return &user, nil
}

// GetUserByID 根据 ID 获取用户
func GetUserByID(id uuid.UUID) (*User, error) {
	db := database.GetDB()
	var user User
	if err := db.First(&user, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("用户不存在")
		}
		return nil, err
	}
	return &user, nil
}

// GetUserByUsername 根据用户名获取用户
func GetUserByUsername(username string) (*User, error) {
	db := database.GetDB()
	var user User
	if err := db.Where("username = ?", username).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("用户不存在")
		}
		return nil, err
	}
	return &user, nil
}

// GetAllUsers 分页获取所有用户
func GetAllUsers(page, pageSize int) ([]User, int64, error) {
	db := database.GetDB()
	var users []User
	var total int64

	// 计算总用户数
	if err := db.Model(&User{}).Count(&total).Error; err != nil {
		return nil, 0, errors.New("获取用户总数失败：" + err.Error())
	}

	// 计算偏移量
	offset := (page - 1) * pageSize

	// 查询用户列表
	if err := db.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&users).Error; err != nil {
		return nil, 0, errors.New("查询用户列表失败：" + err.Error())
	}

	return users, total, nil
}

// UpdateUser 更新用户信息
func UpdateUser(id uuid.UUID, updates map[string]interface{}) (*User, error) {
	db := database.GetDB()

	var user User
	if err := db.First(&user, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("用户不存在")
		}
		return nil, err
	}

	// 如果更新密码，需要加密
	if password, ok := updates["password"]; ok {
		hashedPassword, err := utils.HashPassword(password.(string))
		if err != nil {
			return nil, errors.New("密码加密失败")
		}
		updates["password"] = hashedPassword
	}

	if err := db.Model(&user).Updates(updates).Error; err != nil {
		return nil, errors.New("更新用户失败：" + err.Error())
	}

	return &user, nil
}

// DeleteUser 删除用户（软删除）
func DeleteUser(id uuid.UUID) error {
	db := database.GetDB()

	result := db.Delete(&User{}, id)
	if result.Error != nil {
		return errors.New("删除用户失败：" + result.Error.Error())
	}
	if result.RowsAffected == 0 {
		return errors.New("用户不存在")
	}

	return nil
}

// InitDefaultUsers 初始化默认测试账号
func InitDefaultUsers() {
	db := database.GetDB()

	var count int64
	if err := db.Model(&User{}).Count(&count).Error; err != nil {
		zap.L().Error("检查用户数失败", zap.Error(err))
		return
	}

	if count > 0 {
		zap.L().Info("数据库中已有用户，跳过初始化", zap.Int64("count", count))
		return
	}

	testUsers := []struct {
		username string
		email    string
		password string
		name     string
		role     string
	}{
		{"test_user", "test@example.com", "123456", "测试用户", "user"},
		{"admin", "admin@example.com", "admin123", "管理员", "admin"},
		{"demo", "demo@example.com", "demo123", "演示用户", "user"},
	}

	zap.L().Info("═══════════════════════════════════════════════════")
	zap.L().Info("🔑 初始化默认测试账号")
	zap.L().Info("═══════════════════════════════════════════════════")

	for _, u := range testUsers {
		user, err := CreateUser(u.username, u.email, u.password, u.name, u.role)
		if err != nil {
			zap.L().Error("创建账号失败",
				zap.String("username", u.username),
				zap.Error(err),
			)
		} else {
			// 获取用户角色名
			roleName := u.role
			zap.L().Info("✅ 创建账号成功",
				zap.String("username", user.Username),
				zap.String("id", user.ID.String()),
				zap.String("role", roleName),
			)
		}
	}

	zap.L().Info("═══════════════════════════════════════════════════")
}
