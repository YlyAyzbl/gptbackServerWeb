package models

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"time"

	"macg/database"

	"github.com/google/uuid"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// ============================================================================
// Token使用和API Key模型
// ============================================================================

// TokenUsageRecord Token使用记录模型
type TokenUsageRecord struct {
	ID           uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	UserID       uuid.UUID `gorm:"type:uuid;index;not null" json:"user_id"`
	APIKeyID     uuid.UUID `gorm:"type:uuid;index" json:"api_key_id"`
	ModelName    string    `gorm:"size:100;index;not null" json:"model_name"` // gpt-4, claude-3, etc.
	InputTokens  int       `gorm:"default:0" json:"input_tokens"`
	OutputTokens int       `gorm:"default:0" json:"output_tokens"`
	TotalTokens  int       `gorm:"default:0" json:"total_tokens"`
	Cost         float64   `gorm:"type:decimal(10,6);default:0" json:"cost"` // 花费（美元）
	RequestID    string    `gorm:"size:100;index" json:"request_id"`         // 请求ID
	CreatedAt    time.Time `gorm:"index" json:"created_at"`

	// 关联
	User   User    `gorm:"foreignKey:UserID" json:"-"`
	APIKey *APIKey `gorm:"foreignKey:APIKeyID" json:"-"`
}

func (TokenUsageRecord) TableName() string {
	return "token_usage_records"
}

func (t *TokenUsageRecord) BeforeCreate(tx *gorm.DB) error {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}
	t.TotalTokens = t.InputTokens + t.OutputTokens
	return nil
}

// APIKey API密钥模型
type APIKey struct {
	ID          uuid.UUID      `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	UserID      uuid.UUID      `gorm:"type:uuid;index;not null" json:"user_id"`
	Name        string         `gorm:"size:100;not null" json:"name"`           // 密钥名称
	KeyPrefix   string         `gorm:"size:10;not null" json:"key_prefix"`      // 密钥前缀，用于显示
	KeyHash     string         `gorm:"size:100;not null" json:"-"`              // 密钥哈希
	Status      string         `gorm:"size:20;default:'active'" json:"status"`  // active, revoked
	Permissions string         `gorm:"size:500;default:'*'" json:"permissions"` // 权限范围，逗号分隔
	LastUsedAt  *time.Time     `json:"last_used_at"`
	ExpiresAt   *time.Time     `json:"expires_at"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	// 关联
	User User `gorm:"foreignKey:UserID" json:"-"`
}

func (APIKey) TableName() string {
	return "api_keys"
}

func (a *APIKey) BeforeCreate(tx *gorm.DB) error {
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}
	return nil
}

// ============================================================================
// Token 使用统计
// ============================================================================

// TokenUsageSummary Token使用汇总
type TokenUsageSummary struct {
	ModelName   string `json:"name"`
	TotalTokens int    `json:"value"`
}

// GetTokenUsageSummary 获取Token使用汇总（按模型分组）
func GetTokenUsageSummary(userID *uuid.UUID, startTime, endTime *time.Time) ([]TokenUsageSummary, error) {
	db := database.GetDB()

	query := db.Model(&TokenUsageRecord{}).
		Select("model_name, SUM(total_tokens) as total_tokens").
		Group("model_name").
		Order("total_tokens DESC")

	if userID != nil {
		query = query.Where("user_id = ?", userID)
	}

	if startTime != nil {
		query = query.Where("created_at >= ?", startTime)
	}

	if endTime != nil {
		query = query.Where("created_at <= ?", endTime)
	}

	var results []struct {
		ModelName   string `json:"model_name"`
		TotalTokens int    `json:"total_tokens"`
	}

	if err := query.Scan(&results).Error; err != nil {
		return nil, errors.New("查询Token使用失败：" + err.Error())
	}

	summary := make([]TokenUsageSummary, len(results))
	for i, r := range results {
		summary[i] = TokenUsageSummary{
			ModelName:   r.ModelName,
			TotalTokens: r.TotalTokens,
		}
	}

	return summary, nil
}

// GetUserTokenUsage 获取用户Token使用详情
func GetUserTokenUsage(userID uuid.UUID, page, pageSize int) ([]TokenUsageRecord, int64, error) {
	db := database.GetDB()
	var records []TokenUsageRecord
	var total int64

	query := db.Model(&TokenUsageRecord{}).Where("user_id = ?", userID)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, errors.New("获取记录数失败：" + err.Error())
	}

	offset := (page - 1) * pageSize
	if err := query.Offset(offset).Limit(pageSize).
		Order("created_at DESC").
		Find(&records).Error; err != nil {
		return nil, 0, errors.New("查询记录失败：" + err.Error())
	}

	return records, total, nil
}

// RecordTokenUsage 记录Token使用
func RecordTokenUsage(userID uuid.UUID, apiKeyID *uuid.UUID, modelName string, inputTokens, outputTokens int, cost float64, requestID string) (*TokenUsageRecord, error) {
	db := database.GetDB()

	record := TokenUsageRecord{
		UserID:       userID,
		ModelName:    modelName,
		InputTokens:  inputTokens,
		OutputTokens: outputTokens,
		Cost:         cost,
		RequestID:    requestID,
	}

	if apiKeyID != nil {
		record.APIKeyID = *apiKeyID
	}

	if err := db.Create(&record).Error; err != nil {
		return nil, errors.New("记录Token使用失败：" + err.Error())
	}

	return &record, nil
}

// ============================================================================
// API Key 操作
// ============================================================================

// GenerateAPIKey 生成新的API密钥
func GenerateAPIKey(userID uuid.UUID, name string, permissions string, expiresAt *time.Time) (*APIKey, string, error) {
	db := database.GetDB()

	// 生成随机密钥
	keyBytes := make([]byte, 32)
	if _, err := rand.Read(keyBytes); err != nil {
		return nil, "", errors.New("生成密钥失败")
	}
	fullKey := "sk-" + hex.EncodeToString(keyBytes)
	keyPrefix := fullKey[:10] + "..."

	// 密钥哈希存储（简化处理，实际应使用更安全的哈希）
	keyHash := hex.EncodeToString(keyBytes)

	if permissions == "" {
		permissions = "*"
	}

	apiKey := APIKey{
		UserID:      userID,
		Name:        name,
		KeyPrefix:   keyPrefix,
		KeyHash:     keyHash,
		Status:      "active",
		Permissions: permissions,
		ExpiresAt:   expiresAt,
	}

	if err := db.Create(&apiKey).Error; err != nil {
		return nil, "", errors.New("创建API密钥失败：" + err.Error())
	}

	// 返回完整密钥（只在创建时返回一次）
	return &apiKey, fullKey, nil
}

// GetUserAPIKeys 获取用户的API密钥列表
func GetUserAPIKeys(userID uuid.UUID) ([]APIKey, error) {
	db := database.GetDB()
	var keys []APIKey

	if err := db.Where("user_id = ?", userID).Order("created_at DESC").Find(&keys).Error; err != nil {
		return nil, errors.New("查询API密钥失败：" + err.Error())
	}

	return keys, nil
}

// RevokeAPIKey 撤销API密钥
func RevokeAPIKey(id, userID uuid.UUID) error {
	db := database.GetDB()

	result := db.Model(&APIKey{}).
		Where("id = ? AND user_id = ?", id, userID).
		Update("status", "revoked")

	if result.Error != nil {
		return errors.New("撤销密钥失败：" + result.Error.Error())
	}
	if result.RowsAffected == 0 {
		return errors.New("密钥不存在")
	}

	return nil
}

// DeleteAPIKey 删除API密钥
func DeleteAPIKey(id, userID uuid.UUID) error {
	db := database.GetDB()

	result := db.Where("user_id = ?", userID).Delete(&APIKey{}, id)
	if result.Error != nil {
		return errors.New("删除密钥失败：" + result.Error.Error())
	}
	if result.RowsAffected == 0 {
		return errors.New("密钥不存在")
	}

	return nil
}

// ============================================================================
// 初始化示例数据
// ============================================================================

// InitDefaultTokenUsage 初始化示例Token使用数据
func InitDefaultTokenUsage() {
	db := database.GetDB()

	var count int64
	db.Model(&TokenUsageRecord{}).Count(&count)
	if count > 0 {
		zap.L().Info("Token使用数据已存在，跳过初始化", zap.Int64("count", count))
		return
	}

	// 获取第一个用户
	var user User
	if err := db.First(&user).Error; err != nil {
		zap.L().Warn("没有用户，跳过Token使用初始化")
		return
	}

	models := []struct {
		name         string
		inputTokens  int
		outputTokens int
		cost         float64
	}{
		{"GPT-4", 150000, 50000, 6.00},
		{"GPT-4", 120000, 40000, 4.80},
		{"GPT-3.5", 200000, 80000, 0.84},
		{"GPT-3.5", 180000, 70000, 0.75},
		{"Claude-3", 100000, 50000, 2.25},
		{"Claude-3", 80000, 40000, 1.80},
		{"Gemini-Pro", 90000, 30000, 0.36},
		{"Gemini-Pro", 70000, 25000, 0.29},
	}

	zap.L().Info("📊 初始化示例Token使用数据")

	for i, m := range models {
		_, err := RecordTokenUsage(user.ID, nil, m.name, m.inputTokens, m.outputTokens, m.cost, "req-"+uuid.New().String()[:8])
		if err != nil {
			zap.L().Error("创建Token记录失败", zap.Error(err))
		} else {
			zap.L().Debug("创建Token记录", zap.Int("index", i), zap.String("model", m.name))
		}
	}

	zap.L().Info("✅ Token使用数据初始化完成")
}
