package gins

import (
	"fmt"
	"net/http"

	"macg/sqlite"
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

	fmt.Println(loginData.Username, loginData.Password)
	err := sqlite.CheckUser(loginData.Username, loginData.Password)
	if err != nil {
		fmt.Println(err)
		c.JSON(http.StatusOK, ResponeResult.OkResult(gin.H{"error": "用户名或密码错误"}))
		return
	}

	token := utils.CreateJWT(loginData.Username)
	c.JSON(http.StatusOK, ResponeResult.OkResult(gin.H{
		"token": token,
		"code":  200,
	}))
}

// 注册
func register(c *gin.Context) {
	// 用户认证
	value, _ := c.Get("username")
	if value != "xingling" {
		c.JSON(200, ResponeResult.ErrorResult(gin.H{"error": "unauthorized"}))
		return
	}
	username := c.PostForm("username")
	password := c.PostForm("password")
	err := sqlite.CreatUser(username, password)
	if err != nil {
		c.JSON(501, ResponeResult.ErrorResult(err.Error()))
		return
	}
	// 注册成功，返回登录Token

	// 如何使用token，请参考登录功能
	c.JSON(200, ResponeResult.OkResult("用户注册成功"))
}
