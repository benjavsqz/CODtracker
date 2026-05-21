CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  username   VARCHAR(50)  UNIQUE NOT NULL,
  email      VARCHAR(100) UNIQUE NOT NULL,
  password   TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS loadouts (
  id             SERIAL PRIMARY KEY,
  user_id        INT REFERENCES users(id) ON DELETE CASCADE,
  name           VARCHAR(100) NOT NULL,
  weapon_name    VARCHAR(100),
  category       VARCHAR(50),
  attachments    JSONB DEFAULT '{}',
  cod_share_code VARCHAR(200),
  notes          TEXT,
  is_public      BOOLEAN DEFAULT false,
  share_slug     VARCHAR(20) UNIQUE,
  created_at     TIMESTAMP DEFAULT NOW(),
  updated_at     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS weapon_meta (
  id          SERIAL PRIMARY KEY,
  updated_at  TIMESTAMP DEFAULT NOW(),
  weapon_name VARCHAR(100),
  tier        VARCHAR(5),
  category    VARCHAR(50),
  pick_rate   DECIMAL(5,2),
  meta_build  JSONB DEFAULT '{}'
);
ALTER TABLE weapon_meta ADD COLUMN IF NOT EXISTS meta_build JSONB DEFAULT '{}';
ALTER TABLE weapon_meta ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE weapon_meta ADD COLUMN IF NOT EXISTS change_type VARCHAR(10);
ALTER TABLE weapon_meta ADD COLUMN IF NOT EXISTS changed_at TIMESTAMP;
ALTER TABLE weapon_meta ADD COLUMN IF NOT EXISTS max_level INTEGER DEFAULT 50;

CREATE TABLE IF NOT EXISTS perk_meta (
  id          SERIAL PRIMARY KEY,
  perk_name   VARCHAR(100) NOT NULL,
  category    VARCHAR(50)  NOT NULL,
  tier        VARCHAR(5)   NOT NULL,
  description TEXT,
  image_url   TEXT,
  updated_at  TIMESTAMP DEFAULT NOW()
);
ALTER TABLE perk_meta ADD COLUMN IF NOT EXISTS image_url TEXT;
