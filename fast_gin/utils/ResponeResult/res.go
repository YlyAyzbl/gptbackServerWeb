package ResponeResult

// 定义响应结果结构体
type ResponseResult struct {
	Code    int         `json:"code"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
}

// 定义应用HTTP状态码枚举
var AppHttpCodeEnum = map[string]ResponseResult{
	"SUCCESS":           {Code: 200, Message: "操作成功"},
	"NEED_LOGIN":        {Code: 401, Message: "需要登录后操作"},
	"NO_OPERATOR_AUTH":  {Code: 403, Message: "无权限操作"},
	"PARAM_ERROR":       {Code: 403, Message: "传递参数错误"},
	"SYSTEM_ERROR":      {Code: 500, Message: "出现错误"},
	"USERNAME_EXIST":    {Code: 501, Message: "用户名已存在"},
	"XLH_NOT_EXIST":     {Code: 501, Message: "序列号不存在"},
	"EMAIL_EXIST":       {Code: 501, Message: "邮箱已存在"},
	"EMAIL_NOT_EXIST":   {Code: 501, Message: "邮箱不存在"},
	"LOGIN_ERROR":       {Code: 503, Message: "用户名或密码错误"},
	"USERNAME_NOT_NULL": {Code: 502, Message: "用户名不能为空"},
	"PASSWORD_NOT_NULL": {Code: 502, Message: "密码不能为空"},
	"PASSWORD_ERROR":    {Code: 502, Message: "密码错误"},
	"EMAIL_NOT_NULL":    {Code: 502, Message: "邮箱不能为空"},
}

func OkResult(data interface{}) ResponseResult {
	switch v := data.(type) {
	case string:
		return ResponseResult{
			Code:    AppHttpCodeEnum["SUCCESS"].Code,
			Message: v,
			Data:    nil,
		}
	case ResponseResult:
		if v.Code == AppHttpCodeEnum["SUCCESS"].Code {
			return v
		}
		return ResponseResult{
			Code:    AppHttpCodeEnum["SUCCESS"].Code,
			Message: AppHttpCodeEnum["SUCCESS"].Message,
			Data:    v.Data,
		}
	default:
		return ResponseResult{
			Code:    AppHttpCodeEnum["SUCCESS"].Code,
			Message: AppHttpCodeEnum["SUCCESS"].Message,
			Data:    data,
		}
	}
}

func ErrorResult(data interface{}) ResponseResult {
	switch v := data.(type) {
	case string:
		if code, ok := AppHttpCodeEnum[v]; ok {
			return ResponseResult{
				Code:    code.Code,
				Message: code.Message,
			}
		}
		return ResponseResult{
			Code:    AppHttpCodeEnum["SYSTEM_ERROR"].Code,
			Message: v,
		}
	case error:
		return ResponseResult{
			Code:    AppHttpCodeEnum["SYSTEM_ERROR"].Code,
			Message: v.Error(),
		}
	case ResponseResult:
		if v.Code != AppHttpCodeEnum["SUCCESS"].Code {
			return v
		}
		return ResponseResult{
			Code:    AppHttpCodeEnum["SYSTEM_ERROR"].Code,
			Message: AppHttpCodeEnum["SYSTEM_ERROR"].Message,
			Data:    v.Data,
		}
	default:
		return ResponseResult{
			Code:    AppHttpCodeEnum["SYSTEM_ERROR"].Code,
			Message: AppHttpCodeEnum["SYSTEM_ERROR"].Message,
		}
	}
}
