package models

import (
	"errors"
	"time"

	"macg/database"

	"github.com/google/uuid"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// ============================================================================
// RBAC 核心模型
// ============================================================================

// Role 角色模型
type Role struct {
	ID          uuid.UUID      `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Name        string         `gorm:"uniqueIndex;size:50;not null" json:"name"` // super_admin, admin, user, guest
	DisplayName string         `gorm:"size:100" json:"display_name"`             // 超级管理员, 管理员, 普通用户, 访客
	Description string         `gorm:"size:500" json:"description"`
	IsSystem    bool           `gorm:"default:false" json:"is_system"` // 系统内置角色不可删除
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	// 关联
	Permissions []Permission `gorm:"many2many:role_permissions;" json:"permissions,omitempty"`
	Users       []User       `gorm:"many2many:user_roles;" json:"-"`
}

func (Role) TableName() string {
	return "roles"
}

func (r *Role) BeforeCreate(tx *gorm.DB) error {
	if r.ID == uuid.Nil {
		r.ID = uuid.New()
	}
	return nil
}

// Permission 权限模型
type Permission struct {
	ID          uuid.UUID      `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Name        string         `gorm:"uniqueIndex;size:100;not null" json:"name"` // 格式: resource:action, 如 user:read, service:manage
	DisplayName string         `gorm:"size:100" json:"display_name"`              // 读取用户, 管理服务
	Description string         `gorm:"size:500" json:"description"`
	Resource    string         `gorm:"size:50;index" json:"resource"` // user, service, ticket, announcement
	Action      string         `gorm:"size:50;index" json:"action"`   // read, write, delete, manage
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	// 关联
	Roles []Role `gorm:"many2many:role_permissions;" json:"-"`
}

func (Permission) TableName() string {
	return "permissions"
}

func (p *Permission) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return nil
}

// UserRole 用户角色关联表（多对多中间表）
type UserRole struct {
	UserID    uuid.UUID `gorm:"type:uuid;primaryKey" json:"user_id"`
	RoleID    uuid.UUID `gorm:"type:uuid;primaryKey" json:"role_id"`
	CreatedAt time.Time `json:"created_at"`
}

func (UserRole) TableName() string {
	return "user_roles"
}

// RolePermission 角色权限关联表（多对多中间表）
type RolePermission struct {
	RoleID       uuid.UUID `gorm:"type:uuid;primaryKey" json:"role_id"`
	PermissionID uuid.UUID `gorm:"type:uuid;primaryKey" json:"permission_id"`
	CreatedAt    time.Time `json:"created_at"`
}

func (RolePermission) TableName() string {
	return "role_permissions"
}

// ============================================================================
// RBAC CRUD 操作
// ============================================================================

// CreateRole 创建角色
func CreateRole(name, displayName, description string, isSystem bool) (*Role, error) {
	db := database.GetDB()

	var existingRole Role
	if err := db.Where("name = ?", name).First(&existingRole).Error; err == nil {
		return nil, errors.New("角色名已存在")
	}

	role := Role{
		Name:        name,
		DisplayName: displayName,
		Description: description,
		IsSystem:    isSystem,
	}

	if err := db.Create(&role).Error; err != nil {
		return nil, errors.New("创建角色失败：" + err.Error())
	}

	return &role, nil
}

// GetAllRoles 获取所有角色
func GetAllRoles() ([]Role, error) {
	db := database.GetDB()
	var roles []Role
	if err := db.Preload("Permissions").Find(&roles).Error; err != nil {
		return nil, errors.New("获取角色列表失败：" + err.Error())
	}
	return roles, nil
}

// GetRoleByID 根据ID获取角色
func GetRoleByID(id uuid.UUID) (*Role, error) {
	db := database.GetDB()
	var role Role
	if err := db.Preload("Permissions").First(&role, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("角色不存在")
		}
		return nil, err
	}
	return &role, nil
}

// GetRoleByName 根据名称获取角色
func GetRoleByName(name string) (*Role, error) {
	db := database.GetDB()
	var role Role
	if err := db.Preload("Permissions").Where("name = ?", name).First(&role).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("角色不存在")
		}
		return nil, err
	}
	return &role, nil
}

// AssignPermissionsToRole 为角色分配权限
func AssignPermissionsToRole(roleID uuid.UUID, permissionIDs []uuid.UUID) error {
	db := database.GetDB()

	var role Role
	if err := db.First(&role, roleID).Error; err != nil {
		return errors.New("角色不存在")
	}

	var permissions []Permission
	if err := db.Where("id IN ?", permissionIDs).Find(&permissions).Error; err != nil {
		return errors.New("获取权限失败：" + err.Error())
	}

	if err := db.Model(&role).Association("Permissions").Replace(permissions); err != nil {
		return errors.New("分配权限失败：" + err.Error())
	}

	return nil
}

// CreatePermission 创建权限
func CreatePermission(name, displayName, description, resource, action string) (*Permission, error) {
	db := database.GetDB()

	var existingPerm Permission
	if err := db.Where("name = ?", name).First(&existingPerm).Error; err == nil {
		return nil, errors.New("权限名已存在")
	}

	permission := Permission{
		Name:        name,
		DisplayName: displayName,
		Description: description,
		Resource:    resource,
		Action:      action,
	}

	if err := db.Create(&permission).Error; err != nil {
		return nil, errors.New("创建权限失败：" + err.Error())
	}

	return &permission, nil
}

// GetAllPermissions 获取所有权限
func GetAllPermissions() ([]Permission, error) {
	db := database.GetDB()
	var permissions []Permission
	if err := db.Find(&permissions).Error; err != nil {
		return nil, errors.New("获取权限列表失败：" + err.Error())
	}
	return permissions, nil
}

// AssignRolesToUser 为用户分配角色
func AssignRolesToUser(userID uuid.UUID, roleIDs []uuid.UUID) error {
	db := database.GetDB()

	var user User
	if err := db.First(&user, userID).Error; err != nil {
		return errors.New("用户不存在")
	}

	var roles []Role
	if err := db.Where("id IN ?", roleIDs).Find(&roles).Error; err != nil {
		return errors.New("获取角色失败：" + err.Error())
	}

	if err := db.Model(&user).Association("Roles").Replace(roles); err != nil {
		return errors.New("分配角色失败：" + err.Error())
	}

	return nil
}

// GetUserPermissions 获取用户的所有权限
func GetUserPermissions(userID uuid.UUID) ([]Permission, error) {
	db := database.GetDB()

	var user User
	if err := db.Preload("Roles.Permissions").First(&user, userID).Error; err != nil {
		return nil, errors.New("用户不存在")
	}

	permMap := make(map[uuid.UUID]Permission)
	for _, role := range user.Roles {
		for _, perm := range role.Permissions {
			permMap[perm.ID] = perm
		}
	}

	permissions := make([]Permission, 0, len(permMap))
	for _, perm := range permMap {
		permissions = append(permissions, perm)
	}

	return permissions, nil
}

// UserHasPermission 检查用户是否拥有指定权限
func UserHasPermission(userID uuid.UUID, permissionName string) (bool, error) {
	permissions, err := GetUserPermissions(userID)
	if err != nil {
		return false, err
	}

	for _, perm := range permissions {
		if perm.Name == permissionName {
			return true, nil
		}
	}

	return false, nil
}

// UserHasRole 检查用户是否拥有指定角色
func UserHasRole(userID uuid.UUID, roleName string) (bool, error) {
	db := database.GetDB()

	var user User
	if err := db.Preload("Roles").First(&user, userID).Error; err != nil {
		return false, errors.New("用户不存在")
	}

	for _, role := range user.Roles {
		if role.Name == roleName {
			return true, nil
		}
	}

	return false, nil
}

// ============================================================================
// 初始化默认 RBAC 数据
// ============================================================================

// InitDefaultRBAC 初始化默认的角色和权限
func InitDefaultRBAC() {
	db := database.GetDB()

	// 检查是否已初始化
	var roleCount int64
	db.Model(&Role{}).Count(&roleCount)
	if roleCount > 0 {
		zap.L().Info("RBAC数据已存在，跳过初始化", zap.Int64("roles", roleCount))
		return
	}

	zap.L().Info("═══════════════════════════════════════════════════")
	zap.L().Info("🔐 初始化 RBAC 权限系统")
	zap.L().Info("═══════════════════════════════════════════════════")

	// 1. 创建权限
	permissions := []struct {
		name        string
		displayName string
		description string
		resource    string
		action      string
	}{
		// 用户权限
		{"user:read", "查看用户", "查看用户列表和详情", "user", "read"},
		{"user:write", "编辑用户", "创建和编辑用户", "user", "write"},
		{"user:delete", "删除用户", "删除用户", "user", "delete"},
		{"user:manage", "管理用户", "用户完整管理权限", "user", "manage"},

		// 服务权限
		{"service:read", "查看服务", "查看服务列表", "service", "read"},
		{"service:write", "编辑服务", "创建和编辑服务", "service", "write"},
		{"service:delete", "删除服务", "删除服务", "service", "delete"},
		{"service:manage", "管理服务", "服务完整管理权限", "service", "manage"},

		// 工单权限
		{"ticket:read", "查看工单", "查看工单列表", "ticket", "read"},
		{"ticket:write", "创建工单", "创建和回复工单", "ticket", "write"},
		{"ticket:delete", "删除工单", "删除工单", "ticket", "delete"},
		{"ticket:manage", "管理工单", "工单完整管理权限", "ticket", "manage"},

		// 公告权限
		{"announcement:read", "查看公告", "查看公告列表", "announcement", "read"},
		{"announcement:write", "编辑公告", "创建和编辑公告", "announcement", "write"},
		{"announcement:delete", "删除公告", "删除公告", "announcement", "delete"},
		{"announcement:manage", "管理公告", "公告完整管理权限", "announcement", "manage"},

		// API Key权限
		{"apikey:read", "查看API密钥", "查看API密钥列表", "apikey", "read"},
		{"apikey:write", "创建API密钥", "创建和编辑API密钥", "apikey", "write"},
		{"apikey:delete", "删除API密钥", "删除API密钥", "apikey", "delete"},

		// 系统权限
		{"system:settings", "系统设置", "访问系统设置", "system", "settings"},
		{"system:admin", "系统管理", "系统管理权限", "system", "admin"},
		{"dashboard:view", "查看仪表板", "查看仪表板数据", "dashboard", "view"},
	}

	permMap := make(map[string]*Permission)
	for _, p := range permissions {
		perm, err := CreatePermission(p.name, p.displayName, p.description, p.resource, p.action)
		if err != nil {
			zap.L().Error("创建权限失败", zap.String("name", p.name), zap.Error(err))
		} else {
			permMap[p.name] = perm
			zap.L().Debug("创建权限", zap.String("name", p.name))
		}
	}

	// 2. 创建角色
	roles := []struct {
		name        string
		displayName string
		description string
		isSystem    bool
		permissions []string
	}{
		{
			"super_admin", "超级管理员", "拥有所有权限", true,
			[]string{"user:manage", "service:manage", "ticket:manage", "announcement:manage", "apikey:read", "apikey:write", "apikey:delete", "system:settings", "system:admin", "dashboard:view"},
		},
		{
			"admin", "管理员", "管理用户、服务和内容", true,
			[]string{"user:read", "user:write", "service:manage", "ticket:manage", "announcement:manage", "dashboard:view"},
		},
		{
			"user", "普通用户", "基本使用权限", true,
			[]string{"service:read", "ticket:read", "ticket:write", "announcement:read", "apikey:read", "apikey:write", "dashboard:view"},
		},
		{
			"guest", "访客", "只读权限", true,
			[]string{"announcement:read", "dashboard:view"},
		},
	}

	for _, r := range roles {
		role, err := CreateRole(r.name, r.displayName, r.description, r.isSystem)
		if err != nil {
			zap.L().Error("创建角色失败", zap.String("name", r.name), zap.Error(err))
			continue
		}

		// 分配权限
		var permIDs []uuid.UUID
		for _, permName := range r.permissions {
			if perm, ok := permMap[permName]; ok {
				permIDs = append(permIDs, perm.ID)
			}
		}

		if len(permIDs) > 0 {
			if err := AssignPermissionsToRole(role.ID, permIDs); err != nil {
				zap.L().Error("分配权限失败", zap.String("role", r.name), zap.Error(err))
			}
		}

		zap.L().Info("✅ 创建角色成功",
			zap.String("name", role.Name),
			zap.String("display_name", role.DisplayName),
			zap.Int("permissions", len(permIDs)),
		)
	}

	zap.L().Info("═══════════════════════════════════════════════════")
	zap.L().Info("✅ RBAC 权限系统初始化完成")
	zap.L().Info("═══════════════════════════════════════════════════")
}
