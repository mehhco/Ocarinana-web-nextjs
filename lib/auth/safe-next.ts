const AUTH_PATHS = new Set([
  '/auth/login',
  '/auth/sign-up',
  '/auth/sign-up-success',
  '/auth/forgot-password',
  '/auth/update-password',
]);

/**
 * 登录/注册成功后的回跳地址必须是我们自己的站内相对路径。
 * 既防开放重定向，也防止把用户绕回登录页形成死循环。
 */
export function sanitizeNextPath(value: string | null | undefined, fallback = '/'): string {
  if (!value || typeof value !== 'string') {
    return fallback;
  }

  if (!value.startsWith('/') || value.startsWith('//')) {
    return fallback;
  }

  if (value.includes('\\') || value.includes('://')) {
    return fallback;
  }

  if (/[\u0000-\u001f]/.test(value)) {
    return fallback;
  }

  const pathname = value.split('?')[0]?.split('#')[0] ?? '';

  if (!pathname || AUTH_PATHS.has(pathname)) {
    return fallback;
  }

  return value;
}
