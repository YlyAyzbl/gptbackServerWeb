package utils

import (
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/google/uuid"
)

const (
	JwtTTL = 24 * 7 * 60 * 60 * time.Second         // 有效期为7day
	JwtKey = "1eb6acbe-7fb3-49b6-ad7f-d12e3ec4140a" // 设置秘钥明文
)

func GetUUID() string {
	return uuid.New().String()
}

func CreateJWT(subject string) string {
	token, _ := createJWT(subject, JwtTTL, GetUUID())
	return token
}

func CreateJWTWithTTL(subject string, ttl time.Duration) (string, error) {
	return createJWT(subject, ttl, GetUUID())
}

func createJWT(subject string, ttl time.Duration, uuid string) (string, error) {
	nowTime := time.Now()
	expireTime := nowTime.Add(ttl)

	claims := jwt.MapClaims{
		"jti": uuid,
		"sub": subject,
		"iss": "xm",
		"iat": nowTime.Unix(),
		"exp": expireTime.Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(JwtKey))
}

func CreateJWTWithID(id, subject string, ttl time.Duration) (string, error) {
	return createJWT(subject, ttl, id)
}

func ParseJWT(tokenString string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(JwtKey), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, jwt.ErrSignatureInvalid
}

// 需要getSub的方法
// GetSub 方法，传入 token 返回原始的 sub 字符串
func GetSub(tokenString string) (string, error) {

	claims, err := ParseJWT(tokenString)
	if err != nil {
		return "", err
	}

	if sub, ok := claims["sub"].(string); ok {

		return sub, nil
	}

	return "", jwt.ErrSignatureInvalid
}

// 使用示例

/* func main() {
	token := "eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJjYWM2ZDVhZi1mNjVlLTQ0MDAtYjcxMi0zYWEwOGIyOTIwYjQiLCJzdWIiOiJzZyIsImlzcyI6InNnIiwiaWF0IjoxNjM4MTA2NzEyLCJleHAiOjE2MzgxMTAzMTJ9.JVsSbkP94wuczb4QryQbAke3ysBDIL5ou8fWsbt_ebg"
	claims, err := ParseJWT(token)
	if err != nil {
		panic(err)
	}
	jsonBytes, _ := json.Marshal(claims)
	fmt.Println(string(jsonBytes))
}
*/
