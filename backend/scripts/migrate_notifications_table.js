require('dotenv').config();
const pool = require('../src/config/database');

async function migrateNotificationsTable() {
  console.log("Checking and updating 'notifications' table schema...");
  try {
    // 1. Create table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        title VARCHAR(150) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        reference_id INTEGER NULL,
        reference_type VARCHAR(50) NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        read_at TIMESTAMP WITHOUT TIME ZONE NULL
      );
    `);

    // 2. Add columns if they don't exist
    await pool.query(`
      ALTER TABLE public.notifications 
      ADD COLUMN IF NOT EXISTS reference_id INTEGER NULL,
      ADD COLUMN IF NOT EXISTS reference_type VARCHAR(50) NULL,
      ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITHOUT TIME ZONE NULL;
    `);

    // 3. Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);
      CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
    `);

    console.log("✅ 'notifications' table schema updated successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration error:", err);
    process.exit(1);
  }
}

migrateNotificationsTable();
