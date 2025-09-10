import nodemailer from 'nodemailer';
import { env } from '../../env.mjs';

/**
 * 邮件配置接口
 */
export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

/**
 * 发送邮件选项
 */
export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * 创建邮件传输器
 */
function createTransporter() {
  const config: EmailConfig = {
    host: env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(env.SMTP_PORT || '587'),
    secure: env.SMTP_SECURE === 'true',
    auth: {
      user: env.SMTP_USER || '',
      pass: env.SMTP_PASS || '',
    },
  };

  return nodemailer.createTransport(config);
}

/**
 * 发送验证码邮件
 */
export async function sendVerificationEmail(
  email: string,
  code: string,
  type: 'register' | 'login' | 'reset_password' = 'register'
): Promise<boolean> {
  try {
    const transporter = createTransporter();

    const subjects = {
      register: '验证您的邮箱地址',
      login: '登录验证码',
      reset_password: '重置密码验证码',
    };

    const templates = {
      register: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">欢迎注册！</h2>
          <p>您的验证码是：</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; color: #007bff;">${code}</span>
          </div>
          <p>验证码将在10分钟后过期，请及时使用。</p>
          <p>如果您没有请求此验证码，请忽略此邮件。</p>
        </div>
      `,
      login: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">登录验证</h2>
          <p>您的登录验证码是：</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; color: #007bff;">${code}</span>
          </div>
          <p>验证码将在10分钟后过期，请及时使用。</p>
          <p>如果您没有请求此验证码，请立即检查您的账户安全。</p>
        </div>
      `,
      reset_password: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">重置密码</h2>
          <p>您的密码重置验证码是：</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; color: #007bff;">${code}</span>
          </div>
          <p>验证码将在10分钟后过期，请及时使用。</p>
          <p>如果您没有请求重置密码，请忽略此邮件并检查您的账户安全。</p>
        </div>
      `,
    };

    const mailOptions: SendEmailOptions = {
      to: email,
      subject: subjects[type],
      html: templates[type],
      text: `您的验证码是：${code}。验证码将在10分钟后过期。`,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('发送邮件失败:', error);
    return false;
  }
}

/**
 * 发送通用邮件
 */
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  try {
    const transporter = createTransporter();
    await transporter.sendMail(options);
    return true;
  } catch (error) {
    console.error('发送邮件失败:', error);
    return false;
  }
}