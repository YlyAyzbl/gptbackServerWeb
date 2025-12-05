package utils

import (
	"fmt"
	"reflect"
)

// CopyBean 函数用于将 src 对象的属性复制到 dst 对象中
func CopyBean(src, dst interface{}) error {
	// 获取 src 的反射值
	srcVal := reflect.ValueOf(src)
	// 获取 dst 的反射值
	dstVal := reflect.ValueOf(dst)

	// 检查 dst 是否为指针类型
	if dstVal.Kind() != reflect.Ptr {
		return fmt.Errorf("dst must be a pointer")
	}

	// 获取 dst 指针指向的实际值
	dstVal = dstVal.Elem()

	// 检查 src 和 dst 的类型是否相同
	if srcVal.Type() != dstVal.Type() {
		return fmt.Errorf("src and dst must have the same type")
	}

	// 遍历 src 的所有字段
	for i := 0; i < srcVal.NumField(); i++ {
		// 获取 src 的第 i 个字段
		srcField := srcVal.Field(i)
		// 获取 dst 的第 i 个字段
		dstField := dstVal.Field(i)

		// 检查 dst 的第 i 个字段是否可设置
		if dstField.CanSet() {
			// 将 src 的第 i 个字段的值复制到 dst 的第 i 个字段
			dstField.Set(srcField)
		}
	}

	return nil
}

// CopyBeanList 函数用于将 src 切片中的对象属性复制到 dst 切片中
func CopyBeanList(src interface{}, dst interface{}) error {
	// 获取 src 的反射值
	srcVal := reflect.ValueOf(src)
	// 获取 dst 的反射值
	dstVal := reflect.ValueOf(dst)

	// 检查 src 是否为切片类型
	if srcVal.Kind() != reflect.Slice {
		return fmt.Errorf("src must be a slice")
	}

	// 检查 dst 是否为指向切片的指针
	if dstVal.Kind() != reflect.Ptr || dstVal.Elem().Kind() != reflect.Slice {
		return fmt.Errorf("dst must be a pointer to a slice")
	}

	// 获取 dst 指针指向的实际切片
	dstVal = dstVal.Elem()
	// 获取 dst 切片的元素类型
	dstType := dstVal.Type().Elem()

	// 遍历 src 切片的所有元素
	for i := 0; i < srcVal.Len(); i++ {
		// 获取 src 切片的第 i 个元素
		srcElem := srcVal.Index(i)
		// 创建一个与 dst 切片元素类型相同的新对象
		dstElem := reflect.New(dstType).Elem()

		// 将 src 切片的第 i 个元素的属性复制到新创建的对象中
		err := CopyBean(srcElem.Interface(), dstElem.Addr().Interface())
		if err != nil {
			return err
		}

		// 将新创建的对象添加到 dst 切片中
		dstVal.Set(reflect.Append(dstVal, dstElem))
	}

	return nil
}
