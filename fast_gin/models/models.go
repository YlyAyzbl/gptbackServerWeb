package models

// 仪表板统计
type DashboardStat struct {
	ID             string `json:"id"`
	Title          string `json:"title"`
	Value          string `json:"value"`
	Change         string `json:"change"`
	IsPositive     bool   `json:"isPositive"`
	Icon           string `json:"icon"`
	IconColorClass string `json:"iconColorClass"`
	IconBgClass    string `json:"iconBgClass"`
}

// 趋势数据
type TrendData struct {
	Date     string `json:"date"`
	Requests int    `json:"requests"`
	Tokens   int    `json:"tokens"`
}

// 仪表板响应
type DashboardResponse struct {
	Stats       []DashboardStat `json:"stats"`
	TrendData   []TrendData     `json:"trendData"`
	Models      []AIModel       `json:"models"`
	ChartColors []string        `json:"chartColors"`
}

// AI模型
type AIModel struct {
	ID              string            `json:"id"`
	Name            string            `json:"name"`
	Provider        string            `json:"provider"`
	Category        string            `json:"category"`
	Description     string            `json:"description"`
	Icon            string            `json:"icon"`
	Color           map[string]string `json:"color"`
	BackgroundColor map[string]string `json:"backgroundColor"`
	TextColor       map[string]string `json:"textColor"`
	Stats           map[string]string `json:"stats"`
}

// 用户 DTO (用于 API 响应)
type UserDTO struct {
	ID     int    `json:"id"`
	Name   string `json:"name"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	Status string `json:"status"`
}

// 用户列表响应
type UsersResponse struct {
	Users []UserDTO `json:"users"`
	Total int       `json:"total"`
}

// 用户创建/更新请求
type UserRequest struct {
	Name   string `json:"name" binding:"required"`
	Email  string `json:"email" binding:"required,email"`
	Role   string `json:"role" binding:"required"`
	Status string `json:"status" binding:"required"`
}

// 服务
type Service struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Status      string `json:"status"`
	Uptime      string `json:"uptime"`
	Icon        string `json:"icon"`
	Bg          string `json:"bg"`
}

// 服务列表响应
type ServicesResponse struct {
	Services []Service `json:"services"`
	Total    int       `json:"total"`
}

// 支持工单
type SupportTicket struct {
	ID       string `json:"id"`
	Subject  string `json:"subject"`
	Status   string `json:"status"`
	Priority string `json:"priority"`
	Created  string `json:"created"`
	Category string `json:"category"`
}

// 工单列表响应
type TicketsResponse struct {
	Tickets []SupportTicket `json:"tickets"`
	Total   int             `json:"total"`
}

// Token使用
type TokenUsage struct {
	Name  string `json:"name"`
	Value int    `json:"value"`
}

// Token使用响应
type TokenUsageResponse struct {
	Data []TokenUsage `json:"data"`
}

// 通用响应
type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
}
