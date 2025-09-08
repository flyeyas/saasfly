import bcrypt from 'bcryptjs';

/**
 * 密码强度要求
 */
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
} as const;

/**
 * 密码强度检测结果
 */
export interface PasswordStrengthResult {
  isValid: boolean;
  score: number; // 0-100
  errors: string[];
  suggestions: string[];
}

/**
 * 加密密码
 * @param password 明文密码
 * @returns 加密后的密码哈希
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * 验证密码
 * @param password 明文密码
 * @param hashedPassword 加密后的密码哈希
 * @returns 是否匹配
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * 检测密码强度
 * @param password 待检测的密码
 * @returns 密码强度检测结果
 */
export function checkPasswordStrength(password: string): PasswordStrengthResult {
  const errors: string[] = [];
  const suggestions: string[] = [];
  let score = 0;

  // 长度检查
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`密码长度至少需要${PASSWORD_REQUIREMENTS.minLength}个字符`);
    suggestions.push('增加密码长度');
  } else if (password.length >= PASSWORD_REQUIREMENTS.minLength) {
    score += 20;
  }

  if (password.length > PASSWORD_REQUIREMENTS.maxLength) {
    errors.push(`密码长度不能超过${PASSWORD_REQUIREMENTS.maxLength}个字符`);
  }

  // 大写字母检查
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('密码必须包含至少一个大写字母');
    suggestions.push('添加大写字母');
  } else if (/[A-Z]/.test(password)) {
    score += 15;
  }

  // 小写字母检查
  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('密码必须包含至少一个小写字母');
    suggestions.push('添加小写字母');
  } else if (/[a-z]/.test(password)) {
    score += 15;
  }

  // 数字检查
  if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
    errors.push('密码必须包含至少一个数字');
    suggestions.push('添加数字');
  } else if (/\d/.test(password)) {
    score += 15;
  }

  // 特殊字符检查
  if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('密码必须包含至少一个特殊字符');
    suggestions.push('添加特殊字符 (!@#$%^&*等)');
  } else if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 15;
  }

  // 复杂度加分
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;
  
  // 常见密码模式检查
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /abc123/i,
    /(.)\1{2,}/, // 连续重复字符
  ];

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      score -= 20;
      suggestions.push('避免使用常见密码模式');
      break;
    }
  }

  // 确保分数在0-100范围内
  score = Math.max(0, Math.min(100, score));

  return {
    isValid: errors.length === 0,
    score,
    errors,
    suggestions,
  };
}

/**
 * 生成随机密码
 * @param length 密码长度
 * @returns 随机密码
 */
export function generateRandomPassword(length: number = 12): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = uppercase + lowercase + numbers + symbols;
  
  let password = '';
  
  // 确保至少包含每种类型的字符
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // 填充剩余长度
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // 打乱字符顺序
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * 检查密码是否已被泄露（可选功能，需要集成HaveIBeenPwned API）
 * @param password 待检查的密码
 * @returns 是否已被泄露
 */
export async function checkPasswordBreach(password: string): Promise<boolean> {
  try {
    const crypto = await import('crypto');
    const sha1Hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
    const prefix = sha1Hash.substring(0, 5);
    const suffix = sha1Hash.substring(5);
    
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    if (!response.ok) return false;
    
    const data = await response.text();
    return data.includes(suffix);
  } catch {
    // 如果检查失败，返回false（不阻止用户使用）
    return false;
  }
}