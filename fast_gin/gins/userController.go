package gins

import (
	"fmt"
	"net/http"

	"macg/models"
	"macg/utils"
	"macg/utils/ResponeResult"

	"github.com/gin-gonic/gin"
)

func cookieCheck() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 假设Cookie中存储的键为"token"
		token, err := c.Cookie("token")
		if err != nil {
			c.JSON(http.StatusOK, ResponeResult.ErrorResult(gin.H{"error": "unauthorized"}))
			c.Abort()
			return
		}

		// 在这里添加你的验证逻辑，例如验证Token是否有效
		username, err := utils.GetSub(token) // 假设GetSub是一个验证Token的函数
		if err != nil || username == "" {
			c.JSON(http.StatusOK, ResponeResult.ErrorResult(gin.H{"error": "unauthorized"}))
			c.Abort()
			return
		}

		// 将用户名存储在上下文中，供后续处理使用
		c.Set("username", username)

		c.Next()
	}
}

// 登录功能
func login(c *gin.Context) {
	// 定义一个结构体来接收JSON数据
	var loginData struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	// 解析JSON数据
	if err := c.ShouldBindJSON(&loginData); err != nil {
		c.JSON(http.StatusBadRequest, ResponeResult.ErrorResult("无效的JSON数据"))
		return
	}

	fmt.Println("登录请求:", loginData.Username)

	// 使用新的 models 包验证用户
	user, err := models.CheckUserCredentials(loginData.Username, loginData.Password)
	if err != nil {
		fmt.Println("登录失败:", err)
		c.JSON(http.StatusOK, ResponeResult.OkResult(gin.H{"error": err.Error()}))
		return
	}

	token := utils.CreateJWT(loginData.Username)
	c.JSON(http.StatusOK, ResponeResult.OkResult(gin.H{
		"token": token,
		"code":  200,
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
			"name":     user.Name,
			"role":     user.Role,
		},
	}))
}

// 注册
func register(c *gin.Context) {
	var registerData struct {
		Username string `json:"username" binding:"required"`
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=6"`
		Name     string `json:"name"`
	}

	if err := c.ShouldBindJSON(&registerData); err != nil {
		c.JSON(http.StatusBadRequest, ResponeResult.ErrorResult("无效的请求数据: "+err.Error()))
		return
	}

	// 使用新的 models 包创建用户
	user, err := models.CreateUser(
		registerData.Username,
		registerData.Email,
		registerData.Password,
		registerData.Name,
		"user", // 默认角色
	)
	if err != nil {
		c.JSON(http.StatusBadRequest, ResponeResult.ErrorResult(err.Error()))
		return
	}

	// 注册成功，返回用户信息和Token
	token := utils.CreateJWT(user.Username)
	c.JSON(http.StatusCreated, ResponeResult.OkResult(gin.H{
		"message": "用户注册成功",
		"token":   token,
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
			"name":     user.Name,
			"role":     user.Role,
		},
	}))
}
