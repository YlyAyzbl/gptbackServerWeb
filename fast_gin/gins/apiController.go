package gins

import (
	"net/http"
	"strconv"

	"macg/models"
	"macg/services"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// 获取仪表板数据
func GetDashboardData(c *gin.Context) {
	zap.L().Debug("获取仪表板数据", zap.String("endpoint", "/api/dashboard"))
	data := services.GetDashboardData()
	c.JSON(http.StatusOK, models.Response{
		Code:    200,
		Message: "success",
		Data:    data,
	})
}

// 获取用户列表
func GetUsers(c *gin.Context) {
	zap.L().Debug("获取用户列表", zap.String("endpoint", "/api/users"))
	userList := services.GetUsers()
	response := models.UsersResponse{
		Users: userList,
		Total: len(userList),
	}
	c.JSON(http.StatusOK, models.Response{
		Code:    200,
		Message: "success",
		Data:    response,
	})
}

// 获取单个用户
func GetUser(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		zap.L().Warn("无效的用户ID", zap.String("id", idStr), zap.Error(err))
		c.JSON(http.StatusBadRequest, models.Response{
			Code:    400,
			Message: "invalid user id",
		})
		return
	}

	zap.L().Debug("获取单个用户", zap.String("endpoint", "/api/users/:id"), zap.Int("id", id))
	user := services.GetUserByID(id)
	if user == nil {
		zap.L().Warn("用户未找到", zap.Int("id", id))
		c.JSON(http.StatusNotFound, models.Response{
			Code:    404,
			Message: "user not found",
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Code:    200,
		Message: "success",
		Data:    user,
	})
}

// 创建用户
func CreateUser(c *gin.Context) {
	var req models.UserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		zap.L().Warn("用户请求绑定错误", zap.Error(err))
		c.JSON(http.StatusBadRequest, models.Response{
			Code:    400,
			Message: "invalid request body",
		})
		return
	}

	zap.L().Info("创建用户", zap.String("name", req.Name), zap.String("email", req.Email))
	user := services.CreateUser(&req)
	c.JSON(http.StatusCreated, models.Response{
		Code:    201,
		Message: "user created successfully",
		Data:    user,
	})
}

// 更新用户
func UpdateUser(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		zap.L().Warn("无效的用户ID", zap.String("id", idStr), zap.Error(err))
		c.JSON(http.StatusBadRequest, models.Response{
			Code:    400,
			Message: "invalid user id",
		})
		return
	}

	var req models.UserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		zap.L().Warn("用户请求绑定错误", zap.Error(err))
		c.JSON(http.StatusBadRequest, models.Response{
			Code:    400,
			Message: "invalid request body",
		})
		return
	}

	zap.L().Info("更新用户", zap.Int("id", id), zap.String("name", req.Name))
	user := services.UpdateUser(id, &req)
	if user == nil {
		zap.L().Warn("用户未找到", zap.Int("id", id))
		c.JSON(http.StatusNotFound, models.Response{
			Code:    404,
			Message: "user not found",
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Code:    200,
		Message: "user updated successfully",
		Data:    user,
	})
}

// 删除用户
func DeleteUser(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		zap.L().Warn("无效的用户ID", zap.String("id", idStr), zap.Error(err))
		c.JSON(http.StatusBadRequest, models.Response{
			Code:    400,
			Message: "invalid user id",
		})
		return
	}

	zap.L().Info("删除用户", zap.Int("id", id))
	if !services.DeleteUser(id) {
		zap.L().Warn("用户未找到", zap.Int("id", id))
		c.JSON(http.StatusNotFound, models.Response{
			Code:    404,
			Message: "user not found",
		})
		return
	}

	c.JSON(http.StatusOK, models.Response{
		Code:    200,
		Message: "user deleted successfully",
	})
}

// 获取服务列表
func GetServices(c *gin.Context) {
	zap.L().Debug("获取服务列表", zap.String("endpoint", "/api/services"))
	serviceList := services.GetServices()
	response := models.ServicesResponse{
		Services: serviceList,
		Total:    len(serviceList),
	}
	c.JSON(http.StatusOK, models.Response{
		Code:    200,
		Message: "success",
		Data:    response,
	})
}

// 获取支持工单列表
func GetSupportTickets(c *gin.Context) {
	zap.L().Debug("获取支持工单列表", zap.String("endpoint", "/api/tickets"))
	tickets := services.GetSupportTickets()
	response := models.TicketsResponse{
		Tickets: tickets,
		Total:   len(tickets),
	}
	c.JSON(http.StatusOK, models.Response{
		Code:    200,
		Message: "success",
		Data:    response,
	})
}

// 获取Token使用数据
func GetTokenUsage(c *gin.Context) {
	zap.L().Debug("获取Token使用数据", zap.String("endpoint", "/api/token-usage"))
	data := services.GetTokenUsage()
	response := models.TokenUsageResponse{
		Data: data,
	}
	c.JSON(http.StatusOK, models.Response{
		Code:    200,
		Message: "success",
		Data:    response,
	})
}
