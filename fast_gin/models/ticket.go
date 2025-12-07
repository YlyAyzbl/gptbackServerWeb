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
// 工单相关模型
// ============================================================================

// SupportTicket 工单模型
type SupportTicket struct {
	ID          uuid.UUID      `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	TicketNo    string         `gorm:"uniqueIndex;size:20;not null" json:"ticket_no"` // 工单编号，如 T-1024
	Subject     string         `gorm:"size:500;not null" json:"subject"`              // 主题
	Description string         `gorm:"type:text" json:"description"`                  // 详细描述
	Status      string         `gorm:"size:30;default:'open';index" json:"status"`    // open, in_progress, resolved, closed
	Priority    string         `gorm:"size:20;default:'medium'" json:"priority"`      // low, medium, high, urgent
	Category    string         `gorm:"size:50" json:"category"`                       // billing, technical, account, other
	UserID      uuid.UUID      `gorm:"type:uuid;index" json:"user_id"`                // 提交者
	AssigneeID  *uuid.UUID     `gorm:"type:uuid;index" json:"assignee_id"`            // 处理人
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	ResolvedAt  *time.Time     `json:"resolved_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	// 关联
	User     User          `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Assignee *User         `gorm:"foreignKey:AssigneeID" json:"assignee,omitempty"`
	Replies  []TicketReply `gorm:"foreignKey:TicketID" json:"replies,omitempty"`
}

func (SupportTicket) TableName() string {
	return "support_tickets"
}

func (t *SupportTicket) BeforeCreate(tx *gorm.DB) error {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}
	// 生成工单编号
	if t.TicketNo == "" {
		var count int64
		tx.Model(&SupportTicket{}).Count(&count)
		t.TicketNo = "T-" + generateTicketNo(int(count)+1)
	}
	return nil
}

// 生成工单编号
func generateTicketNo(seq int) string {
	return padLeft(seq, 4)
}

func padLeft(num int, length int) string {
	result := ""
	for i := 0; i < length; i++ {
		result = "0" + result
	}
	numStr := ""
	for num > 0 {
		numStr = string(rune('0'+num%10)) + numStr
		num /= 10
	}
	if len(numStr) >= length {
		return numStr
	}
	return result[:length-len(numStr)] + numStr
}

// TicketReply 工单回复模型
type TicketReply struct {
	ID        uuid.UUID      `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	TicketID  uuid.UUID      `gorm:"type:uuid;index;not null" json:"ticket_id"`
	UserID    uuid.UUID      `gorm:"type:uuid;index;not null" json:"user_id"`
	Content   string         `gorm:"type:text;not null" json:"content"`
	IsStaff   bool           `gorm:"default:false" json:"is_staff"` // 是否是客服回复
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// 关联
	User User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

func (TicketReply) TableName() string {
	return "ticket_replies"
}

func (r *TicketReply) BeforeCreate(tx *gorm.DB) error {
	if r.ID == uuid.Nil {
		r.ID = uuid.New()
	}
	return nil
}

// ============================================================================
// 工单 CRUD 操作
// ============================================================================

// CreateTicket 创建工单
func CreateTicket(userID uuid.UUID, subject, description, priority, category string) (*SupportTicket, error) {
	db := database.GetDB()

	if priority == "" {
		priority = "medium"
	}
	if category == "" {
		category = "other"
	}

	ticket := SupportTicket{
		Subject:     subject,
		Description: description,
		Status:      "open",
		Priority:    priority,
		Category:    category,
		UserID:      userID,
	}

	if err := db.Create(&ticket).Error; err != nil {
		return nil, errors.New("创建工单失败：" + err.Error())
	}

	return &ticket, nil
}

// GetAllTickets 获取所有工单
func GetAllTickets(page, pageSize int, status string) ([]SupportTicket, int64, error) {
	db := database.GetDB()
	var tickets []SupportTicket
	var total int64

	query := db.Model(&SupportTicket{})
	if status != "" && status != "all" {
		query = query.Where("status = ?", status)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, errors.New("获取工单总数失败：" + err.Error())
	}

	offset := (page - 1) * pageSize
	if err := query.Preload("User").Preload("Assignee").
		Offset(offset).Limit(pageSize).
		Order("created_at DESC").
		Find(&tickets).Error; err != nil {
		return nil, 0, errors.New("查询工单列表失败：" + err.Error())
	}

	return tickets, total, nil
}

// GetUserTickets 获取用户的工单
func GetUserTickets(userID uuid.UUID, page, pageSize int) ([]SupportTicket, int64, error) {
	db := database.GetDB()
	var tickets []SupportTicket
	var total int64

	query := db.Model(&SupportTicket{}).Where("user_id = ?", userID)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, errors.New("获取工单总数失败：" + err.Error())
	}

	offset := (page - 1) * pageSize
	if err := query.Preload("Replies.User").
		Offset(offset).Limit(pageSize).
		Order("created_at DESC").
		Find(&tickets).Error; err != nil {
		return nil, 0, errors.New("查询工单列表失败：" + err.Error())
	}

	return tickets, total, nil
}

// GetTicketByID 获取工单详情
func GetTicketByID(id uuid.UUID) (*SupportTicket, error) {
	db := database.GetDB()
	var ticket SupportTicket
	if err := db.Preload("User").Preload("Assignee").Preload("Replies.User").
		First(&ticket, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("工单不存在")
		}
		return nil, err
	}
	return &ticket, nil
}

// UpdateTicketStatus 更新工单状态
func UpdateTicketStatus(id uuid.UUID, status string, assigneeID *uuid.UUID) error {
	db := database.GetDB()

	updates := map[string]interface{}{
		"status": status,
	}

	if assigneeID != nil {
		updates["assignee_id"] = assigneeID
	}

	if status == "resolved" || status == "closed" {
		now := time.Now()
		updates["resolved_at"] = &now
	}

	result := db.Model(&SupportTicket{}).Where("id = ?", id).Updates(updates)
	if result.Error != nil {
		return errors.New("更新工单失败：" + result.Error.Error())
	}
	if result.RowsAffected == 0 {
		return errors.New("工单不存在")
	}

	return nil
}

// AddTicketReply 添加工单回复
func AddTicketReply(ticketID, userID uuid.UUID, content string, isStaff bool) (*TicketReply, error) {
	db := database.GetDB()

	// 验证工单存在
	var ticket SupportTicket
	if err := db.First(&ticket, ticketID).Error; err != nil {
		return nil, errors.New("工单不存在")
	}

	reply := TicketReply{
		TicketID: ticketID,
		UserID:   userID,
		Content:  content,
		IsStaff:  isStaff,
	}

	if err := db.Create(&reply).Error; err != nil {
		return nil, errors.New("添加回复失败：" + err.Error())
	}

	// 如果是客服回复，更新工单状态为处理中
	if isStaff && ticket.Status == "open" {
		db.Model(&ticket).Update("status", "in_progress")
	}

	return &reply, nil
}

// DeleteTicket 删除工单（软删除）
func DeleteTicket(id uuid.UUID) error {
	db := database.GetDB()

	result := db.Delete(&SupportTicket{}, id)
	if result.Error != nil {
		return errors.New("删除工单失败：" + result.Error.Error())
	}
	if result.RowsAffected == 0 {
		return errors.New("工单不存在")
	}

	return nil
}

// ============================================================================
// 初始化默认工单数据
// ============================================================================

// InitDefaultTickets 初始化默认工单（用于演示）
func InitDefaultTickets() {
	db := database.GetDB()

	var count int64
	db.Model(&SupportTicket{}).Count(&count)
	if count > 0 {
		zap.L().Info("工单数据已存在，跳过初始化", zap.Int64("count", count))
		return
	}

	// 获取第一个用户作为工单提交者
	var user User
	if err := db.First(&user).Error; err != nil {
		zap.L().Warn("没有用户，跳过工单初始化")
		return
	}

	defaultTickets := []struct {
		subject     string
		description string
		status      string
		priority    string
		category    string
	}{
		{"API Latency Issues with GPT-4", "Recently experiencing high latency when calling GPT-4 API endpoints.", "open", "high", "technical"},
		{"Billing Inquiry for March", "Need clarification on the invoice for March.", "resolved", "medium", "billing"},
		{"Request for higher rate limits", "Our application requires higher API rate limits.", "in_progress", "low", "account"},
	}

	zap.L().Info("🎫 初始化默认工单数据")

	for _, t := range defaultTickets {
		ticket, err := CreateTicket(user.ID, t.subject, t.description, t.priority, t.category)
		if err != nil {
			zap.L().Error("创建工单失败", zap.String("subject", t.subject), zap.Error(err))
		} else {
			// 更新状态
			if t.status != "open" {
				db.Model(ticket).Update("status", t.status)
			}
			zap.L().Info("✅ 创建工单成功", zap.String("ticket_no", ticket.TicketNo))
		}
	}
}
