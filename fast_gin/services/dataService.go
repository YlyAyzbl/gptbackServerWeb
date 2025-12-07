package services

import (
	"macg/models"
	"sync"
)

// 内存中的用户数据（用于模拟 API 数据）
var (
	users = []models.UserDTO{
		{ID: 1, Name: "Alice Johnson", Email: "alice@example.com", Role: "Admin", Status: "Active"},
		{ID: 2, Name: "Bob Smith", Email: "bob@example.com", Role: "User", Status: "Inactive"},
		{ID: 3, Name: "Charlie Brown", Email: "charlie@example.com", Role: "User", Status: "Active"},
		{ID: 4, Name: "Diana Prince", Email: "diana@example.com", Role: "Editor", Status: "Active"},
		{ID: 5, Name: "Evan Wright", Email: "evan@example.com", Role: "User", Status: "Suspended"},
	}
	userMutex  sync.RWMutex
	nextUserID = 6
)

// 获取仪表板数据
func GetDashboardData() *models.DashboardResponse {
	return &models.DashboardResponse{
		Stats: []models.DashboardStat{
			{
				ID:             "requests",
				Title:          "Total Requests",
				Value:          "2.4M",
				Change:         "12.5%",
				IsPositive:     true,
				Icon:           "trending-up",
				IconColorClass: "text-blue-600 dark:text-blue-400",
				IconBgClass:    "bg-blue-100/50 dark:bg-blue-900/30",
			},
			{
				ID:             "tokens",
				Title:          "Total Tokens",
				Value:          "1.2B",
				Change:         "8.2%",
				IsPositive:     true,
				Icon:           "database",
				IconColorClass: "text-purple-600 dark:text-purple-400",
				IconBgClass:    "bg-purple-100/50 dark:bg-purple-900/30",
			},
			{
				ID:             "error-rate",
				Title:          "Error Rate",
				Value:          "0.01%",
				Change:         "0.02%",
				IsPositive:     true,
				Icon:           "alert-circle",
				IconColorClass: "text-rose-600 dark:text-rose-400",
				IconBgClass:    "bg-rose-100/50 dark:bg-rose-900/30",
			},
			{
				ID:             "active-users",
				Title:          "Active Users",
				Value:          "120",
				Change:         "2.4%",
				IsPositive:     false,
				Icon:           "users",
				IconColorClass: "text-amber-600 dark:text-amber-400",
				IconBgClass:    "bg-amber-100/50 dark:bg-amber-900/30",
			},
		},
		TrendData: []models.TrendData{
			{Date: "12/01", Requests: 4000, Tokens: 240000},
			{Date: "12/02", Requests: 3000, Tokens: 139800},
			{Date: "12/03", Requests: 2000, Tokens: 980000},
			{Date: "12/04", Requests: 2780, Tokens: 390800},
			{Date: "12/05", Requests: 1890, Tokens: 480000},
			{Date: "12/06", Requests: 2390, Tokens: 380000},
			{Date: "12/07", Requests: 3490, Tokens: 430000},
		},
		Models: []models.AIModel{
			{
				ID:          "gpt-4",
				Name:        "GPT-4",
				Provider:    "OpenAI",
				Category:    "flagship",
				Description: "Most capable model, best for complex tasks",
				Icon:        "brain",
				Color:       map[string]string{"light": "#6366f1", "dark": "#818cf8"},
				BackgroundColor: map[string]string{
					"light": "bg-indigo-100/50",
					"dark":  "dark:bg-indigo-900/30",
				},
				TextColor: map[string]string{
					"light": "text-indigo-600",
					"dark":  "dark:text-indigo-400",
				},
				Stats: map[string]string{
					"requests":   "12,450",
					"tokens":     "450K",
					"percentage": "33",
				},
			},
			{
				ID:          "gpt-3.5",
				Name:        "GPT-3.5",
				Provider:    "OpenAI",
				Category:    "standard",
				Description: "Fast and efficient for most tasks",
				Icon:        "zap",
				Color:       map[string]string{"light": "#8b5cf6", "dark": "#a78bfa"},
				BackgroundColor: map[string]string{
					"light": "bg-purple-100/50",
					"dark":  "dark:bg-purple-900/30",
				},
				TextColor: map[string]string{
					"light": "text-purple-600",
					"dark":  "dark:text-purple-400",
				},
				Stats: map[string]string{
					"requests":   "8,200",
					"tokens":     "300K",
					"percentage": "25",
				},
			},
			{
				ID:          "claude-3",
				Name:        "Claude 3",
				Provider:    "Anthropic",
				Category:    "flagship",
				Description: "Advanced reasoning and analysis",
				Icon:        "sparkles",
				Color:       map[string]string{"light": "#ec4899", "dark": "#f472b6"},
				BackgroundColor: map[string]string{
					"light": "bg-pink-100/50",
					"dark":  "dark:bg-pink-900/30",
				},
				TextColor: map[string]string{
					"light": "text-pink-600",
					"dark":  "dark:text-pink-400",
				},
				Stats: map[string]string{
					"requests":   "6,100",
					"tokens":     "280K",
					"percentage": "25",
				},
			},
			{
				ID:          "gemini-pro",
				Name:        "Gemini Pro",
				Provider:    "Google",
				Category:    "standard",
				Description: "Multimodal capabilities",
				Icon:        "star",
				Color:       map[string]string{"light": "#14b8a6", "dark": "#2dd4bf"},
				BackgroundColor: map[string]string{
					"light": "bg-teal-100/50",
					"dark":  "dark:bg-teal-900/30",
				},
				TextColor: map[string]string{
					"light": "text-teal-600",
					"dark":  "dark:text-teal-400",
				},
				Stats: map[string]string{
					"requests":   "4,500",
					"tokens":     "150K",
					"percentage": "17",
				},
			},
		},
		ChartColors: []string{"#6366f1", "#8b5cf6", "#ec4899", "#14b8a6"},
	}
}

// 获取用户列表
func GetUsers() []models.UserDTO {
	userMutex.RLock()
	defer userMutex.RUnlock()

	result := make([]models.UserDTO, len(users))
	copy(result, users)
	return result
}

// 获取单个用户
func GetUserByID(id int) *models.UserDTO {
	userMutex.RLock()
	defer userMutex.RUnlock()

	for i := range users {
		if users[i].ID == id {
			return &users[i]
		}
	}
	return nil
}

// 创建用户 DTO
func CreateUserDTO(req *models.UserRequest) *models.UserDTO {
	userMutex.Lock()
	defer userMutex.Unlock()

	newUser := models.UserDTO{
		ID:     nextUserID,
		Name:   req.Name,
		Email:  req.Email,
		Role:   req.Role,
		Status: req.Status,
	}

	users = append(users, newUser)
	nextUserID++

	return &newUser
}

// 更新用户 DTO
func UpdateUserDTO(id int, req *models.UserRequest) *models.UserDTO {
	userMutex.Lock()
	defer userMutex.Unlock()

	for i := range users {
		if users[i].ID == id {
			users[i].Name = req.Name
			users[i].Email = req.Email
			users[i].Role = req.Role
			users[i].Status = req.Status
			return &users[i]
		}
	}
	return nil
}

// 删除用户
func DeleteUser(id int) bool {
	userMutex.Lock()
	defer userMutex.Unlock()

	for i := range users {
		if users[i].ID == id {
			users = append(users[:i], users[i+1:]...)
			return true
		}
	}
	return false
}

// 获取服务列表
func GetServices() []models.Service {
	return []models.Service{
		{
			ID:          1,
			Name:        "OpenAI GPT-4 Turbo",
			Description: "Latest high-intelligence model with larger context window.",
			Status:      "Active",
			Uptime:      "99.99%",
			Icon:        "cpu",
			Bg:          "bg-purple-500/10",
		},
		{
			ID:          2,
			Name:        "Claude 3 Opus",
			Description: "Most powerful model for complex reasoning and coding.",
			Status:      "Active",
			Uptime:      "99.95%",
			Icon:        "zap",
			Bg:          "bg-orange-500/10",
		},
		{
			ID:          3,
			Name:        "Gemini Pro 1.5",
			Description: "Balanced performance and cost for general tasks.",
			Status:      "Maintenance",
			Uptime:      "98.50%",
			Icon:        "globe",
			Bg:          "bg-blue-500/10",
		},
		{
			ID:          4,
			Name:        "Mistral Large",
			Description: "Top-tier open weights model served via API.",
			Status:      "Active",
			Uptime:      "99.90%",
			Icon:        "server",
			Bg:          "bg-emerald-500/10",
		},
	}
}

// 获取支持工单列表
func GetSupportTickets() []models.SupportTicket {
	return []models.SupportTicket{
		{
			ID:       "T-1024",
			Subject:  "API Latency Issues with GPT-4",
			Status:   "Open",
			Priority: "High",
			Created:  "2 hours ago",
			Category: "Performance",
		},
		{
			ID:       "T-1023",
			Subject:  "Billing Inquiry for March",
			Status:   "Resolved",
			Priority: "Medium",
			Created:  "1 day ago",
			Category: "Billing",
		},
		{
			ID:       "T-1022",
			Subject:  "Request for higher rate limits",
			Status:   "In Progress",
			Priority: "Low",
			Created:  "2 days ago",
			Category: "Account",
		},
	}
}

// 获取Token使用数据
func GetTokenUsage() []models.TokenUsage {
	return []models.TokenUsage{
		{Name: "GPT-4", Value: 400},
		{Name: "GPT-3.5", Value: 300},
		{Name: "Claude 3", Value: 300},
		{Name: "Gemini Pro", Value: 200},
	}
}
