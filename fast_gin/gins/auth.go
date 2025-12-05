package gins

import (
	"fmt"
	"macg/global"
	"macg/utils"
	"macg/utils/ResponeResult"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// 用户代理验证中间件
func userAgentMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 获取请求头中的 User-Agent
		userAgent := c.GetHeader("User-Agent")

		// 验证 User-Agent 是否符合要求
		if userAgent != global.UserAgent {
			fmt.Println(userAgent)
			// 如果不符合要求，返回一个新的 UUID
			uuid := uuid.New().String()
			c.String(200, uuid)
			// 中止请求处理
			c.Abort()
			return
		}

		// 继续处理请求
		c.Next()
	}
}

func authMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 从查询参数获取token
		token := c.Query("token")
		if token == "" {
			c.JSON(200, ResponeResult.OkResult(gin.H{"error": "登录已过期"}))
			c.Abort()
			return
		}

		// 验证JWT的有效性
		username, err := utils.GetSub(token)
		if err != nil || username == "" {
			c.JSON(200, ResponeResult.OkResult(gin.H{"error": "登录已过期"}))
			c.Abort()
			return
		}

		// 将用户名存储在上下文中，供后续处理使用
		c.Set("username", username)

		c.Next()
	}
}

func loginMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 从查询参数获取token
		token := c.Query("token")
		if token == "" {
			c.JSON(200, ResponeResult.OkResult(gin.H{"error": "登录已过期"}))
			c.Abort()
			return
		}

		// 验证JWT的有效性
		username, err := utils.GetSub(token)
		if err != nil || username == "" {
			c.JSON(200, ResponeResult.OkResult(gin.H{"error": "登录已过期"}))
			c.Abort()
			return
		}

		// 将用户名存储在上下文中，供后续处理使用
		c.Set("username", username)

		c.Next()
	}
}
