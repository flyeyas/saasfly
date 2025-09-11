import { config } from 'dotenv'
import { resolve } from 'path'
import { createId } from '@paralleldrive/cuid2'
import { hashPassword } from '../packages/auth/src/lib/password'
import { Kysely, PostgresDialect } from 'kysely'
import { Pool } from 'pg'
import type { DB } from '../packages/db/prisma/types'

// 加载环境变量
config({ path: resolve(process.cwd(), '.env.local') })
config() // 也加载默认的.env文件

// 创建独立的数据库连接
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

const db = new Kysely<DB>({
  dialect: new PostgresDialect({ pool }),
})

async function createAdminUser() {
  console.log('🚀 Starting admin user creation...')
  console.log('Database URL:', process.env.POSTGRES_URL ? 'Found' : 'Not found')
  
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL environment variable is not set')
  }

  try {
    const adminEmail = 'admin@saasfly.io'
    const adminPassword = 'admin123'
    const adminName = '系统管理员'

    // 检查管理员用户是否已存在
    const existingAdmin = await db
      .selectFrom('users')
      .selectAll()
      .where('email', '=', adminEmail)
      .executeTakeFirst()

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists:', adminEmail)
      console.log('User ID:', existingAdmin.id)
      console.log('Created at:', existingAdmin.createdAt)
      return
    }

    // 加密密码
    console.log('🔐 Hashing password...')
    const hashedPassword = await hashPassword(adminPassword)

    // 创建管理员用户
    const userId = createId()
    const now = new Date()

    const result = await db
      .insertInto('users')
      .values({
        id: userId,
        email: adminEmail,
        name: adminName,
        password: hashedPassword,
        emailVerified: now, // 管理员账户默认已验证
        loginAttempts: 0,
        lockedUntil: null,
        updatedAt: now,
      })
      .returning('id')
      .executeTakeFirstOrThrow()

    console.log('✅ Admin user created successfully!')
    console.log('📧 Email:', adminEmail)
    console.log('🔑 Password:', adminPassword)
    console.log('👤 Name:', adminName)
    console.log('🆔 User ID:', result.id)
    console.log('')
    console.log('⚠️  Please change the default password after first login!')
    console.log('🌐 You can now login at: http://localhost:3002/admin/login')

  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    throw error
  }
}

async function main() {
  try {
    await createAdminUser()
  } catch (error) {
    console.error('❌ Script failed:', error)
    process.exit(1)
  } finally {
    await db.destroy()
  }
}

main()