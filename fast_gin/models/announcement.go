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
// 公告模型
// ============================================================================

// Announcement 公告模型
type Announcement struct {
	ID          uuid.UUID      `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Title       string         `gorm:"size:500;not null" json:"title"`
	Content     string         `gorm:"type:text" json:"content"`                     // 公告内容（支持Markdown）
	Excerpt     string         `gorm:"size:1000" json:"excerpt"`                     // 摘要
	Tag         string         `gorm:"size:50" json:"tag"`                           // 标签：New Feature, Maintenance, Pricing, Update
	Color       string         `gorm:"size:50;default:'bg-purple-500'" json:"color"` // 标签颜色
	Status      string         `gorm:"size:20;default:'draft'" json:"status"`        // draft, published, archived
	AuthorID    uuid.UUID      `gorm:"type:uuid;index" json:"author_id"`
	PublishedAt *time.Time     `json:"published_at"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	// 关联
	Author User `gorm:"foreignKey:AuthorID" json:"author,omitempty"`
}

func (Announcement) TableName() string {
	return "announcements"
}

func (a *Announcement) BeforeCreate(tx *gorm.DB) error {
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}
	return nil
}

// ============================================================================
// 公告 CRUD 操作
// ============================================================================

// CreateAnnouncement 创建公告
func CreateAnnouncement(authorID uuid.UUID, title, content, excerpt, tag, color, status string) (*Announcement, error) {
	db := database.GetDB()

	if status == "" {
		status = "draft"
	}
	if color == "" {
		color = "bg-purple-500"
	}

	announcement := Announcement{
		Title:    title,
		Content:  content,
		Excerpt:  excerpt,
		Tag:      tag,
		Color:    color,
		Status:   status,
		AuthorID: authorID,
	}

	// 如果是发布状态，设置发布时间
	if status == "published" {
		now := time.Now()
		announcement.PublishedAt = &now
	}

	if err := db.Create(&announcement).Error; err != nil {
		return nil, errors.New("创建公告失败：" + err.Error())
	}

	return &announcement, nil
}

// GetAllAnnouncements 获取所有公告
func GetAllAnnouncements(page, pageSize int, status string) ([]Announcement, int64, error) {
	db := database.GetDB()
	var announcements []Announcement
	var total int64

	query := db.Model(&Announcement{})
	if status != "" && status != "all" {
		query = query.Where("status = ?", status)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, errors.New("获取公告总数失败：" + err.Error())
	}

	offset := (page - 1) * pageSize
	if err := query.Preload("Author").
		Offset(offset).Limit(pageSize).
		Order("created_at DESC").
		Find(&announcements).Error; err != nil {
		return nil, 0, errors.New("查询公告列表失败：" + err.Error())
	}

	return announcements, total, nil
}

// GetPublishedAnnouncements 获取已发布的公告（用于前台展示）
func GetPublishedAnnouncements(page, pageSize int) ([]Announcement, int64, error) {
	return GetAllAnnouncements(page, pageSize, "published")
}

// GetAnnouncementByID 获取公告详情
func GetAnnouncementByID(id uuid.UUID) (*Announcement, error) {
	db := database.GetDB()
	var announcement Announcement
	if err := db.Preload("Author").First(&announcement, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("公告不存在")
		}
		return nil, err
	}
	return &announcement, nil
}

// UpdateAnnouncement 更新公告
func UpdateAnnouncement(id uuid.UUID, updates map[string]interface{}) (*Announcement, error) {
	db := database.GetDB()

	var announcement Announcement
	if err := db.First(&announcement, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("公告不存在")
		}
		return nil, err
	}

	// 如果状态变为published且之前没有发布时间
	if status, ok := updates["status"]; ok && status == "published" && announcement.PublishedAt == nil {
		now := time.Now()
		updates["published_at"] = &now
	}

	if err := db.Model(&announcement).Updates(updates).Error; err != nil {
		return nil, errors.New("更新公告失败：" + err.Error())
	}

	return &announcement, nil
}

// DeleteAnnouncement 删除公告（软删除）
func DeleteAnnouncement(id uuid.UUID) error {
	db := database.GetDB()

	result := db.Delete(&Announcement{}, id)
	if result.Error != nil {
		return errors.New("删除公告失败：" + result.Error.Error())
	}
	if result.RowsAffected == 0 {
		return errors.New("公告不存在")
	}

	return nil
}

// ============================================================================
// 初始化默认公告数据
// ============================================================================

// InitDefaultAnnouncements 初始化默认公告
func InitDefaultAnnouncements() {
	db := database.GetDB()

	var count int64
	db.Model(&Announcement{}).Count(&count)
	if count > 0 {
		zap.L().Info("公告数据已存在，跳过初始化", zap.Int64("count", count))
		return
	}

	// 获取管理员用户
	var admin User
	if err := db.Where("username = ?", "admin").First(&admin).Error; err != nil {
		zap.L().Warn("没有管理员用户，跳过公告初始化")
		return
	}

	defaultAnnouncements := []struct {
		title   string
		content string
		excerpt string
		tag     string
		color   string
		status  string
	}{
		{
			"Introducing Gemini Pro 1.5 Support",
			"We are excited to announce full support for Google's latest Gemini Pro 1.5 model.\n\n## Key Features\n- Massive 1M token context window\n- Improved reasoning capabilities\n- Better code generation\n\nStart using it today!",
			"We are excited to announce full support for Google's latest Gemini Pro 1.5 model, featuring a massive context window.",
			"New Feature",
			"bg-purple-500",
			"published",
		},
		{
			"Scheduled Maintenance: API Gateway",
			"We will be performing routine maintenance on our API gateway this Sunday.\n\n## Schedule\n- Start: Sunday 2:00 AM UTC\n- Duration: ~5 minutes\n\nPlease plan accordingly.",
			"We will be performing routine maintenance on our API gateway this Sunday. Expected downtime is less than 5 minutes.",
			"Maintenance",
			"bg-amber-500",
			"published",
		},
		{
			"Pricing Update for 2026",
			"Great news! Starting next month, we are lowering the prices for all GPT-3.5 input tokens by 50%.\n\n## New Pricing\n- Input: $0.50 / 1M tokens\n- Output: $1.50 / 1M tokens",
			"Starting next month, we are lowering the prices for all GPT-3.5 input tokens by 50%.",
			"Pricing",
			"bg-emerald-500",
			"published",
		},
	}

	zap.L().Info("📢 初始化默认公告数据")

	for _, a := range defaultAnnouncements {
		announcement, err := CreateAnnouncement(admin.ID, a.title, a.content, a.excerpt, a.tag, a.color, a.status)
		if err != nil {
			zap.L().Error("创建公告失败", zap.String("title", a.title), zap.Error(err))
		} else {
			zap.L().Info("✅ 创建公告成功", zap.String("title", announcement.Title))
		}
	}
}
