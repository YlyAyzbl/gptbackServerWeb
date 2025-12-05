package rsautils

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"encoding/pem"
	"errors"
)

type RsaObj struct {
	PrivateKey    *rsa.PrivateKey
	PublicKey     *rsa.PublicKey
	PrivateKeyPEM string
	PublicKeyPEM  string
}

func NewRsaObj() RsaObj {
	privateKey, err := GenerateRSAKeyPair(2048)
	if err != nil {
		panic(err)
	}
	privateKeyPEM := PrivateKeyToPEM(privateKey)
	publicKey := PublicKeyFromPrivateKey(privateKey)
	publicKeyPEM, err := PublicKeyToPEM(publicKey)
	if err != nil {
		panic(err)
	}
	return RsaObj{
		PrivateKeyPEM: privateKeyPEM,
		PublicKeyPEM:  publicKeyPEM,
		PrivateKey:    privateKey,
		PublicKey:     publicKey,
	}
}

func NewRsaObjFromPEM(privateKeyPEM string) RsaObj {
	privateKey, err := ParsePrivateKeyFromPEM(privateKeyPEM)
	if err != nil {
		panic(err)
	}
	publicKey := PublicKeyFromPrivateKey(privateKey)
	publicKeyPEM, err := PublicKeyToPEM(publicKey)
	if err != nil {
		panic(err)
	}
	return RsaObj{
		PrivateKeyPEM: privateKeyPEM,
		PublicKeyPEM:  publicKeyPEM,
		PrivateKey:    privateKey,
		PublicKey:     publicKey,
	}
}

// GenerateRSAKeyPair 生成指定位数的 RSA 密钥对
func GenerateRSAKeyPair(bits int) (*rsa.PrivateKey, error) {
	privateKey, err := rsa.GenerateKey(rand.Reader, bits)
	if err != nil {
		return nil, err
	}
	return privateKey, nil
}

// PrivateKeyToPEM 将 RSA 私钥转换为 PEM 格式的字符串
func PrivateKeyToPEM(privateKey *rsa.PrivateKey) string {
	// 使用 PKCS#1 格式编码
	privASN1 := x509.MarshalPKCS1PrivateKey(privateKey)
	privPEM := pem.EncodeToMemory(&pem.Block{
		Type:  "RSA PRIVATE KEY",
		Bytes: privASN1,
	})
	return string(privPEM)
}

// PublicKeyToPEM 将 RSA 公钥转换为 PEM 格式的字符串
func PublicKeyToPEM(publicKey *rsa.PublicKey) (string, error) {
	// 将公钥采用 X.509 标准的 PKIX 格式编码
	pubASN1, err := x509.MarshalPKIXPublicKey(publicKey)
	if err != nil {
		return "", err
	}
	pubPEM := pem.EncodeToMemory(&pem.Block{
		Type:  "PUBLIC KEY",
		Bytes: pubASN1,
	})
	return string(pubPEM), nil
}

// PublicKeyFromPrivateKey 从 RSA 私钥中提取 RSA 公钥
func PublicKeyFromPrivateKey(privateKey *rsa.PrivateKey) *rsa.PublicKey {
	return &privateKey.PublicKey
}

// ParsePrivateKeyFromPEM 从 PEM 格式字符串中解析 RSA 私钥
func ParsePrivateKeyFromPEM(privPEM string) (*rsa.PrivateKey, error) {
	block, _ := pem.Decode([]byte(privPEM))
	if block == nil || block.Type != "RSA PRIVATE KEY" {
		return nil, errors.New("failed to decode PEM block containing RSA private key")
	}
	privateKey, err := x509.ParsePKCS1PrivateKey(block.Bytes)
	if err != nil {
		return nil, err
	}
	return privateKey, nil
}

// ParsePublicKeyFromPEM 从 PEM 格式字符串中解析 RSA 公钥
func ParsePublicKeyFromPEM(pubPEM string) (*rsa.PublicKey, error) {
	block, _ := pem.Decode([]byte(pubPEM))
	if block == nil || (block.Type != "PUBLIC KEY" && block.Type != "RSA PUBLIC KEY") {
		return nil, errors.New("failed to decode PEM block containing RSA public key")
	}
	pub, err := x509.ParsePKIXPublicKey(block.Bytes)
	if err != nil {
		return nil, err
	}
	rsaPub, ok := pub.(*rsa.PublicKey)
	if !ok {
		return nil, errors.New("not a valid RSA public key")
	}
	return rsaPub, nil
}

// Encrypt 使用 RsaObj 的公钥加密数据
func (r *RsaObj) Encrypt(data string) (string, error) {
	encryptedData, err := rsa.EncryptOAEP(
		sha256.New(),
		rand.Reader,
		r.PublicKey,
		[]byte(data),
		nil,
	)
	if err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(encryptedData), nil
}

// Decrypt 使用 RsaObj 的私钥解密数据
func (r *RsaObj) Decrypt(encryptedData []byte) ([]byte, error) {
	decryptedData, err := rsa.DecryptOAEP(
		sha256.New(),
		rand.Reader,
		r.PrivateKey,
		encryptedData,
		nil,
	)
	if err != nil {
		return nil, err
	}
	return decryptedData, nil
}

// EncryptWithPublicKey 使用 RSA 公钥加密数据
func EncryptWithPublicKey(publicKey *rsa.PublicKey, data []byte) ([]byte, error) {
	// 使用 OAEP 填充方案进行加密
	// 使用 SHA-256 作为哈希函数
	// 使用空字符串作为标签
	encryptedData, err := rsa.EncryptOAEP(
		sha256.New(),
		rand.Reader,
		publicKey,
		data,
		nil,
	)
	if err != nil {
		return nil, err
	}
	return encryptedData, nil
}

// DecryptWithPrivateKey 使用 RSA 私钥解密数据
func DecryptWithPrivateKey(privateKey *rsa.PrivateKey, encryptedData []byte) ([]byte, error) {
	// 使用 OAEP 填充方案进行解密
	// 使用 SHA-256 作为哈希函数
	// 使用空字符串作为标签
	decryptedData, err := rsa.DecryptOAEP(
		sha256.New(),
		rand.Reader,
		privateKey,
		encryptedData,
		nil,
	)
	if err != nil {
		return nil, err
	}
	return decryptedData, nil
}
