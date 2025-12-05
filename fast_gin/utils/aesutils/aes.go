package aesutils

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"io"
)

// Encrypt 使用AES-256加密字符串，随机生成密钥，返回加密后的数据、初始化向量和密钥
// 参数:
//   - plaintext: 待加密的字符串
//
// 返回:
//   - data: Base64编码的加密数据
//   - iv: Base64编码的初始化向量
//   - key: Base64编码的32字节密钥
//   - err: 错误信息
func Encrypt(plaintext string) (data string, iv string, key string, err error) {
	// 生成随机的32字节密钥(AES-256)
	keyBytes := make([]byte, 32)
	if _, err := io.ReadFull(rand.Reader, keyBytes); err != nil {
		return "", "", "", err
	}

	// 创建AES-256密码块
	block, err := aes.NewCipher(keyBytes)
	if err != nil {
		return "", "", "", err
	}

	// 明文转为字节数组
	plaintextBytes := []byte(plaintext)

	// 创建初始化向量
	ivBytes := make([]byte, aes.BlockSize)
	if _, err := io.ReadFull(rand.Reader, ivBytes); err != nil {
		return "", "", "", err
	}

	// 使用CBC模式加密
	mode := cipher.NewCBCEncrypter(block, ivBytes)

	// 对明文进行带混淆的填充
	plaintextBytes = obfuscatedPadding(plaintextBytes, aes.BlockSize)

	// 加密
	ciphertext := make([]byte, len(plaintextBytes))
	mode.CryptBlocks(ciphertext, plaintextBytes)

	// 将密文、IV和密钥编码为Base64
	data = base64.StdEncoding.EncodeToString(ciphertext)
	iv = base64.StdEncoding.EncodeToString(ivBytes)
	key = base64.StdEncoding.EncodeToString(keyBytes)

	return data, iv, key, nil
}

// Decrypt 使用AES-256解密字符串
// 参数:
//   - encryptedData: Base64编码的加密数据
//   - iv: Base64编码的初始化向量
//   - key: Base64编码的32字节密钥
//
// 返回:
//   - 解密后的字符串
//   - 错误信息
func Decrypt(encryptedData string, iv string, key string) (string, error) {
	// 解码Base64
	ciphertext, err := base64.StdEncoding.DecodeString(encryptedData)
	if err != nil {
		return "", err
	}

	ivBytes, err := base64.StdEncoding.DecodeString(iv)
	if err != nil {
		return "", err
	}

	keyBytes, err := base64.StdEncoding.DecodeString(key)
	if err != nil {
		return "", err
	}

	// 检查密钥长度是否为32字节(AES-256)
	if len(keyBytes) != 32 {
		return "", errors.New("密钥长度必须为32字节(AES-256)")
	}

	// 创建AES-256密码块
	block, err := aes.NewCipher(keyBytes)
	if err != nil {
		return "", err
	}

	// 检查IV长度
	if len(ivBytes) != aes.BlockSize {
		return "", errors.New("初始化向量长度不正确")
	}

	// 检查密文长度
	if len(ciphertext)%aes.BlockSize != 0 {
		return "", errors.New("密文长度不是块大小的倍数")
	}

	// 使用CBC模式解密
	mode := cipher.NewCBCDecrypter(block, ivBytes)

	// 解密
	plaintext := make([]byte, len(ciphertext))
	mode.CryptBlocks(plaintext, ciphertext)

	// 移除带混淆的填充
	plaintext, err = obfuscatedUnpadding(plaintext)
	if err != nil {
		return "", err
	}

	return string(plaintext), nil
}

// obfuscatedPadding 对数据进行带混淆的填充
// 这种填充方式会在填充的每个字节中加入随机数据，而不是固定的填充值
func obfuscatedPadding(data []byte, blockSize int) []byte {
	padding := blockSize - len(data)%blockSize
	if padding == 0 {
		padding = blockSize
	}

	padText := make([]byte, padding)

	// 最后一个字节存储填充长度
	padText[padding-1] = byte(padding)

	// 其他填充字节使用随机数据填充
	if padding > 1 {
		if _, err := io.ReadFull(rand.Reader, padText[:padding-1]); err != nil {
			// 如果随机数生成失败，则使用普通填充
			for i := 0; i < padding-1; i++ {
				padText[i] = byte(padding)
			}
		}
	}

	return append(data, padText...)
}

// obfuscatedUnpadding 移除带混淆的填充
func obfuscatedUnpadding(data []byte) ([]byte, error) {
	length := len(data)
	if length == 0 {
		return nil, errors.New("数据长度为0")
	}

	// 填充长度保存在最后一个字节
	padding := int(data[length-1])

	// 检查填充是否有效
	if padding == 0 || padding > length {
		return nil, errors.New("无效的填充")
	}

	// 不需要验证其他填充字节的值，因为它们是随机的

	return data[:length-padding], nil
}
