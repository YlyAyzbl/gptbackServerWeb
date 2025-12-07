package gins

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

// CORS中间件
func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

func RouterInit(r *gin.Engine) {
	// 应用CORS中间件
	r.Use(corsMiddleware())

	// 健康检查
	r.GET("/api/test", func(c *gin.Context) {
		zap.L().Debug("健康检查请求")
		c.String(http.StatusOK, "hello world")
	})

	// 认证接口
	r.POST("/api/login", login)
	r.POST("/api/register", register)

	// 仪表板接口
	r.GET("/api/dashboard", GetDashboardData)

	// 用户管理接口
	r.GET("/api/users", GetUsers)
	r.GET("/api/users/:id", GetUser)
	r.POST("/api/users", CreateUser)
	r.PUT("/api/users/:id", UpdateUser)
	r.DELETE("/api/users/:id", DeleteUser)

	// 服务接口
	r.GET("/api/services", GetServices)

	// 工单接口
	r.GET("/api/tickets", GetSupportTickets)

	// Token使用接口
	r.GET("/api/token-usage", GetTokenUsage)

	// 404处理
	r.NoRoute(func(c *gin.Context) {
		zap.L().Warn("404 Not Found", zap.String("path", c.Request.URL.Path), zap.String("method", c.Request.Method))
		uuid := uuid.New().String()
		c.String(http.StatusNotFound, uuid)
	})
}
