package gins

import (
	"net/http"
	"strconv"
	"time"

	"macg/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

// ============================================================================
// 工单 API
// ============================================================================

// GetTicketList 获取工单列表
func GetTicketList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	status := c.DefaultQuery("status", "")

	zap.L().Debug("获取工单列表", zap.Int("page", page), zap.Int("pageSize", pageSize), zap.String("status", status))

	tickets, total, err := models.GetAllTickets(page, pageSize, status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Response{
			Code:    500,
			Message: err.Error(),
		})
		return
	}

	// 转换为 DTO
	ticketDTOs := make([]models.SupportTicketDTO, len(tickets))
	for i, t := range tickets {
		ticketDTOs[i] = models.SupportTicketDTO{
			ID:       t.TicketNo,
			Subject:  t.Subject,
			Status:   t.Status,
			Priority: t.Priority,
			Created:  formatTimeAgo(t.CreatedAt),
			Category: t.Category,
		}
	}

	c.JSON(http.StatusOK, models.Response{
		Code:    200,
		Message: "success",
		Data: models.TicketsResponse{
			Tickets: ticketDTOs,
			Total:   int(total),
		},
	})
}

// GetTicketDetail 获取工单详情
func GetTicketDetail(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Code:    400,
			Message: "invalid ticket id",
		})
		return
	}

	ticket, err := models.GetTicketByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, models.Response{
			Code:    404,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Code:    200,
		Message: "success",
		Data:    ticket,
	})
}

// CreateTicketRequest 创建工单请求
type CreateTicketRequest struct {
	Subject     string `json:"subject" binding:"required"`
	Description string `json:"description"`
	Priority    string `json:"priority"`
	Category    string `json:"category"`
}

// CreateNewTicket 创建新工单
func CreateNewTicket(c *gin.Context) {
	var req CreateTicketRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Code:    400,
			Message: "invalid request: " + err.Error(),
		})
		return
	}

	// 从JWT获取用户ID（这里简化处理，实际需要从token中解析）
	userIDStr := c.GetHeader("X-User-ID")
	var userID uuid.UUID
	if userIDStr != "" {
		var err error
		userID, err = uuid.Parse(userIDStr)
		if err != nil {
			userID = uuid.New() // 临时处理
		}
	} else {
		// 获取第一个用户（仅用于演示）
		users, _, _ := models.GetAllUsers(1, 1)
		if len(users) > 0 {
			userID = users[0].ID
		}
	}

	ticket, err := models.CreateTicket(userID, req.Subject, req.Description, req.Priority, req.Category)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Response{
			Code:    500,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, models.Response{
		Code:    201,
		Message: "ticket created successfully",
		Data:    ticket,
	})
}

// UpdateTicketStatusRequest 更新工单状态请求
type UpdateTicketStatusRequest struct {
	Status     string `json:"status" binding:"required"`
	AssigneeID string `json:"assignee_id"`
}

// UpdateTicketStatusAPI 更新工单状态
func UpdateTicketStatusAPI(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Code:    400,
			Message: "invalid ticket id",
		})
		return
	}

	var req UpdateTicketStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Code:    400,
			Message: "invalid request: " + err.Error(),
		})
		return
	}

	var assigneeID *uuid.UUID
	if req.AssigneeID != "" {
		parsed, err := uuid.Parse(req.AssigneeID)
		if err == nil {
			assigneeID = &parsed
		}
	}

	if err := models.UpdateTicketStatus(id, req.Status, assigneeID); err != nil {
		c.JSON(http.StatusInternalServerError, models.Response{
			Code:    500,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Code:    200,
		Message: "ticket updated successfully",
	})
}

// AddTicketReplyRequest 添加回复请求
type AddTicketReplyRequest struct {
	Content string `json:"content" binding:"required"`
	IsStaff bool   `json:"is_staff"`
}

// AddReplyToTicket 添加工单回复
func AddReplyToTicket(c *gin.Context) {
	idStr := c.Param("id")
	ticketID, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Code:    400,
			Message: "invalid ticket id",
		})
		return
	}

	var req AddTicketReplyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Code:    400,
			Message: "invalid request: " + err.Error(),
		})
		return
	}

	// 获取用户ID
	users, _, _ := models.GetAllUsers(1, 1)
	var userID uuid.UUID
	if len(users) > 0 {
		userID = users[0].ID
	}

	reply, err := models.AddTicketReply(ticketID, userID, req.Content, req.IsStaff)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Response{
			Code:    500,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, models.Response{
		Code:    201,
		Message: "reply added successfully",
		Data:    reply,
	})
}

// DeleteTicketAPI 删除工单
func DeleteTicketAPI(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Code:    400,
			Message: "invalid ticket id",
		})
		return
	}

	if err := models.DeleteTicket(id); err != nil {
		c.JSON(http.StatusInternalServerError, models.Response{
			Code:    500,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Code:    200,
		Message: "ticket deleted successfully",
	})
}

// ============================================================================
// 公告 API
// ============================================================================

// GetAnnouncementList 获取公告列表
func GetAnnouncementList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	status := c.DefaultQuery("status", "published")

	announcements, total, err := models.GetAllAnnouncements(page, pageSize, status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Response{
			Code:    500,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Code:    200,
		Message: "success",
		Data: gin.H{
			"announcements": announcements,
			"total":         total,
		},
	})
}

// GetAnnouncementDetail 获取公告详情
func GetAnnouncementDetail(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Code:    400,
			Message: "invalid announcement id",
		})
		return
	}

	announcement, err := models.GetAnnouncementByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, models.Response{
			Code:    404,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Code:    200,
		Message: "success",
		Data:    announcement,
	})
}

// CreateAnnouncementRequest 创建公告请求
type CreateAnnouncementRequest struct {
	Title   string `json:"title" binding:"required"`
	Content string `json:"content"`
	Excerpt string `json:"excerpt"`
	Tag     string `json:"tag"`
	Color   string `json:"color"`
	Status  string `json:"status"`
}

// CreateNewAnnouncement 创建公告
func CreateNewAnnouncement(c *gin.Context) {
	var req CreateAnnouncementRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Code:    400,
			Message: "invalid request: " + err.Error(),
		})
		return
	}

	// 获取管理员用户ID
	users, _, _ := models.GetAllUsers(1, 1)
	var authorID uuid.UUID
	if len(users) > 0 {
		authorID = users[0].ID
	}

	announcement, err := models.CreateAnnouncement(authorID, req.Title, req.Content, req.Excerpt, req.Tag, req.Color, req.Status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Response{
			Code:    500,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, models.Response{
		Code:    201,
		Message: "announcement created successfully",
		Data:    announcement,
	})
}

// UpdateAnnouncementAPI 更新公告
func UpdateAnnouncementAPI(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Code:    400,
			Message: "invalid announcement id",
		})
		return
	}

	var updates map[string]interface{}
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Code:    400,
			Message: "invalid request: " + err.Error(),
		})
		return
	}

	announcement, err := models.UpdateAnnouncement(id, updates)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Response{
			Code:    500,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Code:    200,
		Message: "announcement updated successfully",
		Data:    announcement,
	})
}

// DeleteAnnouncementAPI 删除公告
func DeleteAnnouncementAPI(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Code:    400,
			Message: "invalid announcement id",
		})
		return
	}

	if err := models.DeleteAnnouncement(id); err != nil {
		c.JSON(http.StatusInternalServerError, models.Response{
			Code:    500,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Code:    200,
		Message: "announcement deleted successfully",
	})
}

// ============================================================================
// 服务 API
// ============================================================================

// GetServiceList 获取服务列表（从数据库）
func GetServiceList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	services, total, err := models.GetAllServices(page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Response{
			Code:    500,
			Message: err.Error(),
		})
		return
	}

	// 转换为 DTO
	serviceDTOs := make([]models.ServiceDTO, len(services))
	for i, s := range services {
		serviceDTOs[i] = models.ServiceDTO{
			ID:          i + 1, // 使用索引作为简单ID
			Name:        s.Name,
			Description: s.Description,
			Status:      s.Status,
			Uptime:      s.Uptime,
			Icon:        s.Icon,
			Bg:          s.Bg,
			ModelID:     s.ModelID,
			MaxTokens:   s.MaxTokens,
			RateLimit:   s.RateLimit,
			Price:       s.Price,
		}
	}

	c.JSON(http.StatusOK, models.Response{
		Code:    200,
		Message: "success",
		Data: models.ServicesResponse{
			Services: serviceDTOs,
			Total:    int(total),
		},
	})
}

// GetServiceDetail 获取服务详情
func GetServiceDetail(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Code:    400,
			Message: "invalid service id",
		})
		return
	}

	service, err := models.GetServiceByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, models.Response{
			Code:    404,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Code:    200,
		Message: "success",
		Data:    service,
	})
}

// CreateServiceRequest 创建服务请求
type CreateServiceRequest struct {
	Name        string  `json:"name" binding:"required"`
	Description string  `json:"description"`
	Status      string  `json:"status"`
	Icon        string  `json:"icon"`
	Bg          string  `json:"bg"`
	ModelID     string  `json:"model_id"`
	MaxTokens   int     `json:"max_tokens"`
	RateLimit   int     `json:"rate_limit"`
	Price       float64 `json:"price"`
}

// CreateNewService 创建服务
func CreateNewService(c *gin.Context) {
	var req CreateServiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Code:    400,
			Message: "invalid request: " + err.Error(),
		})
		return
	}

	service, err := models.CreateService(req.Name, req.Description, req.Status, req.Icon, req.Bg, req.ModelID, req.MaxTokens, req.RateLimit, req.Price)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Response{
			Code:    500,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, models.Response{
		Code:    201,
		Message: "service created successfully",
		Data:    service,
	})
}

// UpdateServiceAPI 更新服务
func UpdateServiceAPI(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Code:    400,
			Message: "invalid service id",
		})
		return
	}

	var updates map[string]interface{}
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Code:    400,
			Message: "invalid request: " + err.Error(),
		})
		return
	}

	service, err := models.UpdateService(id, updates)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Response{
			Code:    500,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Code:    200,
		Message: "service updated successfully",
		Data:    service,
	})
}

// DeleteServiceAPI 删除服务
func DeleteServiceAPI(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.Response{
			Code:    400,
			Message: "invalid service id",
		})
		return
	}

	if err := models.DeleteService(id); err != nil {
		c.JSON(http.StatusInternalServerError, models.Response{
			Code:    500,
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Code:    200,
		Message: "service deleted successfully",
	})
}

// ============================================================================
// Token 使用 API
// ============================================================================

// GetTokenUsageStats 获取Token使用统计
func GetTokenUsageStats(c *gin.Context) {
	summary, err := models.GetTokenUsageSummary(nil, nil, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.Response{
			Code:    500,
			Message: err.Error(),
		})
		return
	}

	// 转换为DTO格式
	data := make([]models.TokenUsageDTO, len(summary))
	for i, s := range summary {
		data[i] = models.TokenUsageDTO{
			Name:  s.ModelName,
			Value: s.TotalTokens,
		}
	}

	c.JSON(http.StatusOK, models.Response{
		Code:    200,
		Message: "success",
		Data: models.TokenUsageResponse{
			Data: data,
		},
	})
}

// ============================================================================
// 辅助函数
// ============================================================================

// formatTimeAgo 格式化时间为相对时间
func formatTimeAgo(t time.Time) string {
	now := time.Now()
	diff := now.Sub(t)

	if diff < time.Minute {
		return "just now"
	} else if diff < time.Hour {
		mins := int(diff.Minutes())
		if mins == 1 {
			return "1 minute ago"
		}
		return strconv.Itoa(mins) + " minutes ago"
	} else if diff < 24*time.Hour {
		hours := int(diff.Hours())
		if hours == 1 {
			return "1 hour ago"
		}
		return strconv.Itoa(hours) + " hours ago"
	} else if diff < 7*24*time.Hour {
		days := int(diff.Hours() / 24)
		if days == 1 {
			return "1 day ago"
		}
		return strconv.Itoa(days) + " days ago"
	}

	return t.Format("Jan 02, 2006")
}
