import { z } from "zod";

/**
 * 认证相关验证 Schema
 */

// 邮箱验证
export const emailSchema = z
  .string()
  .min(1, "请输入邮箱")
  .email("请输入有效的邮箱地址");

// 密码验证
export const passwordSchema = z
  .string()
  .min(8, "密码至少需要 8 个字符")
  .max(100, "密码不能超过 100 个字符")
  .regex(/[A-Z]/, "密码必须包含至少一个大写字母")
  .regex(/[a-z]/, "密码必须包含至少一个小写字母")
  .regex(/[0-9]/, "密码必须包含至少一个数字");

// 登录表单验证
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "请输入密码"),  // 登录时不需要严格验证密码格式
});

// 注册表单验证
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次密码输入不一致",
  path: ["confirmPassword"],
});

// 重置密码验证
export const resetPasswordSchema = z.object({
  email: emailSchema,
});

// 更新密码验证
export const updatePasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次密码输入不一致",
  path: ["confirmPassword"],
});

// 类型导出
export type LoginInput = z.infer<typeof loginSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;

