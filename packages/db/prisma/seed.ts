import { config } from 'dotenv'
import { resolve } from 'path'
import { Kysely, PostgresDialect } from 'kysely'
import { Pool } from 'pg'
import { randomUUID } from 'crypto'
import type { DB } from './types'

// 加载环境变量
config({ path: resolve(__dirname, '../.env') })

// 创建专用的数据库连接
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false,
    checkServerIdentity: () => undefined
  },
});

const db = new Kysely<DB>({
  dialect: new PostgresDialect({ pool }),
})

async function main() {
  console.log('🌱 Seeding database...')

  try {
    // Create categories
    const categories = [
      { 
        name: { en: 'Action', zh: '动作' }, 
        description: { en: 'Fast-paced games requiring quick reflexes', zh: '需要快速反应的快节奏游戏' },
        slug: 'action', 
        sortOrder: 1 
      },
      { 
        name: { en: 'Puzzle', zh: '益智' }, 
        description: { en: 'Brain-teasing games that challenge your logic', zh: '挑战逻辑思维的益智游戏' },
        slug: 'puzzle', 
        sortOrder: 2 
      },
      { 
        name: { en: 'Adventure', zh: '冒险' }, 
        description: { en: 'Explore new worlds and embark on exciting journeys', zh: '探索新世界，踏上激动人心的旅程' },
        slug: 'adventure', 
        sortOrder: 3 
      },
      { 
        name: { en: 'Strategy', zh: '策略' }, 
        description: { en: 'Think ahead and plan your moves carefully', zh: '深思熟虑，仔细规划你的行动' },
        slug: 'strategy', 
        sortOrder: 4 
      },
    ]

    const insertedCategories = []
    for (const category of categories) {
      const existing = await db
        .selectFrom('categories')
        .selectAll()
        .where('slug', '=', category.slug)
        .executeTakeFirst()

      if (!existing) {
        const inserted = await db
          .insertInto('categories')
          .values({
            id: randomUUID(),
            name: JSON.stringify(category.name),
            description: JSON.stringify(category.description),
            slug: category.slug,
            sortOrder: category.sortOrder,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning(['id', 'name', 'slug'])
          .executeTakeFirstOrThrow()
        insertedCategories.push(inserted)
      } else {
        insertedCategories.push(existing)
      }
    }

    // Create sample games
    const games = [
      {
        title: { en: 'Tetris Classic', zh: '俄罗斯方块经典版' },
        description: { en: 'The classic puzzle game where you arrange falling blocks to create complete lines.', zh: '经典益智游戏，通过排列下落的方块来创建完整的线条。' },
        iframeUrl: 'https://tetris.com/play-tetris',
        slug: 'tetris-classic',
        coverImage: '/images/games/tetris-classic.jpg',
        screenshots: ['/images/games/tetris-1.jpg', '/images/games/tetris-2.jpg'],
        playCount: 1250,
        difficultyLevel: 3,
        estimatedDuration: 15,
      },
      {
        title: { en: 'Space Invaders', zh: '太空侵略者' },
        description: { en: 'Defend Earth from waves of alien invaders in this classic arcade shooter.', zh: '在这个经典街机射击游戏中保卫地球免受外星入侵者的攻击。' },
        iframeUrl: 'https://spaceinvaders.com/play',
        slug: 'space-invaders',
        coverImage: '/images/games/space-invaders.jpg',
        screenshots: ['/images/games/space-invaders-1.jpg'],
        playCount: 980,
        difficultyLevel: 4,
        estimatedDuration: 20,
      },
      {
        title: { en: 'Pac-Man', zh: '吃豆人' },
        description: { en: 'Navigate through mazes, eat dots, and avoid ghosts in this timeless arcade game.', zh: '在这个永恒的街机游戏中穿越迷宫，吃豆子，避开幽灵。' },
        iframeUrl: 'https://pacman.com/play',
        slug: 'pac-man',
        coverImage: '/images/games/pac-man.jpg',
        screenshots: ['/images/games/pac-man-1.jpg', '/images/games/pac-man-2.jpg'],
        playCount: 2100,
        difficultyLevel: 3,
        estimatedDuration: 25,
      },
      {
        title: { en: 'Chess Master', zh: '国际象棋大师' },
        description: { en: 'Play chess against AI or friends in this strategic board game.', zh: '在这个策略棋盘游戏中与AI或朋友下棋。' },
        iframeUrl: 'https://chess.com/play',
        slug: 'chess-master',
        coverImage: '/images/games/chess-master.jpg',
        screenshots: ['/images/games/chess-1.jpg'],
        playCount: 750,
        difficultyLevel: 5,
        estimatedDuration: 30,
      },
    ]

    const insertedGames = []
    for (const game of games) {
      const existing = await db
        .selectFrom('games')
        .selectAll()
        .where('slug', '=', game.slug)
        .executeTakeFirst()

      if (!existing) {
        const inserted = await db
          .insertInto('games')
          .values({
            id: randomUUID(),
            title: JSON.stringify(game.title),
            description: JSON.stringify(game.description),
            iframeUrl: game.iframeUrl,
            slug: game.slug,
            coverImage: game.coverImage,
            screenshots: game.screenshots,
            playCount: game.playCount,
            difficultyLevel: game.difficultyLevel,
            estimatedDuration: game.estimatedDuration,
            isActive: true,
            isFeatured: false,
            shareCount: 0,
            avgRating: 0,
            ratingCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning(['id', 'title', 'slug'])
          .executeTakeFirstOrThrow()
        insertedGames.push(inserted)
      } else {
        insertedGames.push(existing)
      }
    }

    // Create game tags
    const tags = [
      {
        name: { en: 'Classic', zh: '经典' },
        slug: 'classic',
        description: { en: 'Timeless games that never go out of style', zh: '永不过时的经典游戏' },
        color: '#FF6B6B',
        sortOrder: 1
      },
      {
        name: { en: 'Arcade', zh: '街机' },
        slug: 'arcade',
        description: { en: 'Traditional arcade-style games', zh: '传统街机风格游戏' },
        color: '#4ECDC4',
        sortOrder: 2
      },
      {
        name: { en: 'Single Player', zh: '单人游戏' },
        slug: 'single-player',
        description: { en: 'Games designed for solo play', zh: '专为单人游戏设计' },
        color: '#45B7D1',
        sortOrder: 3
      },
      {
        name: { en: 'Retro', zh: '复古' },
        slug: 'retro',
        description: { en: 'Games with a nostalgic retro feel', zh: '具有怀旧复古感的游戏' },
        color: '#F7DC6F',
        sortOrder: 4
      }
    ]

    const insertedTags = []
    for (const tag of tags) {
      const existing = await db
        .selectFrom('game_tags')
        .selectAll()
        .where('slug', '=', tag.slug)
        .executeTakeFirst()

      if (!existing) {
        const inserted = await db
          .insertInto('game_tags')
          .values({
            id: randomUUID(),
            name: JSON.stringify(tag.name),
            description: JSON.stringify(tag.description),
            slug: tag.slug,
            color: tag.color,
            sortOrder: tag.sortOrder,
            isActive: true,
            usageCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning(['id', 'name', 'slug'])
          .executeTakeFirstOrThrow()
        insertedTags.push(inserted)
      } else {
        insertedTags.push(existing)
      }
    }

    // Create game-category relationships
    const gameCategories = [
      { gameSlug: 'tetris-classic', categorySlug: 'puzzle' },
      { gameSlug: 'space-invaders', categorySlug: 'action' },
      { gameSlug: 'pac-man', categorySlug: 'action' },
      { gameSlug: 'pac-man', categorySlug: 'adventure' },
      { gameSlug: 'chess-master', categorySlug: 'strategy' },
    ]

    for (const relation of gameCategories) {
      const game = insertedGames.find(g => g.slug === relation.gameSlug)
      const category = insertedCategories.find(c => c.slug === relation.categorySlug)
      
      if (game && category) {
        const existing = await db
          .selectFrom('game_categories')
          .selectAll()
          .where('gameId', '=', game.id)
          .where('categoryId', '=', category.id)
          .executeTakeFirst()

        if (!existing) {
          await db
            .insertInto('game_categories')
            .values({
              id: randomUUID(),
              gameId: game.id,
              categoryId: category.id,
              createdAt: new Date(),
            })
            .execute()
        }
      }
    }

    // Create game-tag relationships
    const gameTagRelations = [
      { gameSlug: 'tetris-classic', tagSlug: 'classic' },
      { gameSlug: 'tetris-classic', tagSlug: 'arcade' },
      { gameSlug: 'tetris-classic', tagSlug: 'single-player' },
      { gameSlug: 'space-invaders', tagSlug: 'classic' },
      { gameSlug: 'space-invaders', tagSlug: 'arcade' },
      { gameSlug: 'space-invaders', tagSlug: 'retro' },
      { gameSlug: 'pac-man', tagSlug: 'classic' },
      { gameSlug: 'pac-man', tagSlug: 'arcade' },
      { gameSlug: 'pac-man', tagSlug: 'retro' },
      { gameSlug: 'chess-master', tagSlug: 'classic' },
      { gameSlug: 'chess-master', tagSlug: 'single-player' },
    ]

    for (const relation of gameTagRelations) {
      const game = insertedGames.find(g => g.slug === relation.gameSlug)
      const tag = insertedTags.find(t => t.slug === relation.tagSlug)

      if (game && tag) {
        const existing = await db
          .selectFrom('game_tag_relations')
          .selectAll()
          .where('gameId', '=', game.id)
          .where('tagId', '=', tag.id)
          .executeTakeFirst()

        if (!existing) {
          await db
            .insertInto('game_tag_relations')
            .values({
              id: randomUUID(),
              gameId: game.id,
              tagId: tag.id,
              createdAt: new Date(),
            })
            .execute()
        }
      }
    }

    console.log('✅ Database seeded successfully!')
    console.log(`Created categories: ${insertedCategories.length}`)
    console.log(`Created games: ${insertedGames.length}`)
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.destroy()
  })