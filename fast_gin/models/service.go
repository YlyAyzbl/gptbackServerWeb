package models

import (
	"errors"
	"time"

	"macg/database"

	"github.com/google/uuid"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// Service AI服务模型
type ServiceModel struct {
	ID          uuid.UUID      `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Name        string         `gorm:"size:200;not null" json:"name"`
	Description string         `gorm:"size:1000" json:"description"`
	Status      string         `gorm:"size:50;default:'active'" json:"status"` // active, maintenance, inactive
	Uptime      string         `gorm:"size:20;default:'99.99%'" json:"uptime"`
	Icon        string         `gorm:"size:50;default:'server'" json:"icon"`
	Bg          string         `gorm:"size:100;default:'bg-purple-500/10'" json:"bg"`
	ModelID     string         `gorm:"size:100" json:"model_id"`                  // 关联的AI模型ID
	MaxTokens   int            `gorm:"default:4096" json:"max_tokens"`            // 最大Token数
	RateLimit   int            `gorm:"default:100" json:"rate_limit"`             // 请求频率限制
	Price       float64        `gorm:"type:decimal(10,4);default:0" json:"price"` // 每1000 Token价格
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName 指定表名
func (ServiceModel) TableName() string {
	return "services"
}

// BeforeCreate GORM 钩子 - 创建前生成 UUID
func (s *ServiceModel) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}

// CreateService 创建服务
func CreateService(name, description, status, icon, bg, modelID string, maxTokens, rateLimit int, price float64) (*ServiceModel, error) {
	db := database.GetDB()

	if status == "" {
		status = "active"
	}
	if icon == "" {
		icon = "server"
	}
	if bg == "" {
		bg = "bg-purple-500/10"
	}

	service := ServiceModel{
		Name:        name,
		Description: description,
		Status:      status,
		Uptime:      "99.99%",
		Icon:        icon,
		Bg:          bg,
		ModelID:     modelID,
		MaxTokens:   maxTokens,
		RateLimit:   rateLimit,
		Price:       price,
	}

	if err := db.Create(&service).Error; err != nil {
		return nil, errors.New("创建服务失败：" + err.Error())
	}

	return &service, nil
}

// GetAllServices 获取所有服务
func GetAllServices(page, pageSize int) ([]ServiceModel, int64, error) {
	db := database.GetDB()
	var services []ServiceModel
	var total int64

	if err := db.Model(&ServiceModel{}).Count(&total).Error; err != nil {
		return nil, 0, errors.New("获取服务总数失败：" + err.Error())
	}

	offset := (page - 1) * pageSize
	if err := db.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&services).Error; err != nil {
		return nil, 0, errors.New("查询服务列表失败：" + err.Error())
	}

	return services, total, nil
}

// GetServiceByID 根据ID获取服务
func GetServiceByID(id uuid.UUID) (*ServiceModel, error) {
	db := database.GetDB()
	var service ServiceModel
	if err := db.First(&service, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("服务不存在")
		}
		return nil, err
	}
	return &service, nil
}

// UpdateService 更新服务
func UpdateService(id uuid.UUID, updates map[string]interface{}) (*ServiceModel, error) {
	db := database.GetDB()

	var service ServiceModel
	if err := db.First(&service, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("服务不存在")
		}
		return nil, err
	}

	if err := db.Model(&service).Updates(updates).Error; err != nil {
		return nil, errors.New("更新服务失败：" + err.Error())
	}

	return &service, nil
}

// DeleteService 删除服务（软删除）
func DeleteService(id uuid.UUID) error {
	db := database.GetDB()

	result := db.Delete(&ServiceModel{}, id)
	if result.Error != nil {
		return errors.New("删除服务失败：" + result.Error.Error())
	}
	if result.RowsAffected == 0 {
		return errors.New("服务不存在")
	}

	return nil
}

// InitDefaultServices 初始化默认服务
func InitDefaultServices() {
	db := database.GetDB()

	var count int64
	if err := db.Model(&ServiceModel{}).Count(&count).Error; err != nil {
		zap.L().Error("检查服务数失败", zap.Error(err))
		return
	}

	if count > 0 {
		zap.L().Info("数据库中已有服务，跳过初始化", zap.Int64("count", count))
		return
	}

	defaultServices := []struct {
		name        string
		description string
		status      string
		icon        string
		bg          string
		modelID     string
		maxTokens   int
		rateLimit   int
		price       float64
	}{
		{"OpenAI GPT-4 Turbo", "Latest high-intelligence model with larger context window.", "Active", "cpu", "bg-purple-500/10", "gpt-4-turbo", 128000, 100, 0.01},
		{"Claude 3 Opus", "Most powerful model for complex reasoning and coding.", "Active", "zap", "bg-orange-500/10", "claude-3-opus", 200000, 80, 0.015},
		{"Gemini Pro 1.5", "Balanced performance and cost for general tasks.", "Maintenance", "globe", "bg-blue-500/10", "gemini-pro-1.5", 1000000, 120, 0.005},
		{"Mistral Large", "Top-tier open weights model served via API.", "Active", "server", "bg-emerald-500/10", "mistral-large", 32000, 150, 0.008},
	}

	zap.L().Info("🔧 初始化默认服务")

	for _, s := range defaultServices {
		service, err := CreateService(s.name, s.description, s.status, s.icon, s.bg, s.modelID, s.maxTokens, s.rateLimit, s.price)
		if err != nil {
			zap.L().Error("创建服务失败", zap.String("name", s.name), zap.Error(err))
		} else {
			zap.L().Info("✅ 创建服务成功", zap.String("name", service.Name), zap.String("id", service.ID.String()))
		}
	}
}
