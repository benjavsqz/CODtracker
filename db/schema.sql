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
-- Change meta_build from jsonb to json so \uXXXX escapes are preserved verbatim,
-- preventing double-encoding on servers with non-UTF8 default client_encoding.
-- Conditional: only run if still jsonb (idempotent across deploys).
DO $$ BEGIN
  IF (SELECT data_type FROM information_schema.columns
      WHERE table_name='weapon_meta' AND column_name='meta_build') = 'jsonb' THEN
    ALTER TABLE weapon_meta ALTER COLUMN meta_build TYPE json USING meta_build::text::json;
  END IF;
END $$;
ALTER TABLE weapon_meta ADD COLUMN IF NOT EXISTS change_type VARCHAR(10);
ALTER TABLE weapon_meta ADD COLUMN IF NOT EXISTS changed_at TIMESTAMP;
ALTER TABLE weapon_meta ADD COLUMN IF NOT EXISTS max_level INTEGER DEFAULT 50;
CREATE UNIQUE INDEX IF NOT EXISTS weapon_meta_name_unique ON weapon_meta (weapon_name);
ALTER TABLE weapon_meta ADD COLUMN IF NOT EXISTS sources_count  INTEGER DEFAULT 1;
ALTER TABLE weapon_meta ADD COLUMN IF NOT EXISTS tier_score     DECIMAL(4,2) DEFAULT 0;
ALTER TABLE weapon_meta ADD COLUMN IF NOT EXISTS ranking       INTEGER;
ALTER TABLE weapon_meta ADD COLUMN IF NOT EXISTS game_modes    TEXT[]   DEFAULT '{}';
ALTER TABLE weapon_meta ADD COLUMN IF NOT EXISTS tactical_cat  VARCHAR(100);

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
CREATE UNIQUE INDEX IF NOT EXISTS perk_meta_name_unique ON perk_meta (perk_name);

CREATE TABLE IF NOT EXISTS equipment_meta (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  category    VARCHAR(20)  NOT NULL,
  tier        VARCHAR(5)   NOT NULL DEFAULT 'B',
  description TEXT,
  image_url   TEXT,
  updated_at  TIMESTAMP DEFAULT NOW()
);

ALTER TABLE loadouts ADD COLUMN IF NOT EXISTS secondary_weapon      VARCHAR(100);
ALTER TABLE loadouts ADD COLUMN IF NOT EXISTS secondary_category    VARCHAR(50);
ALTER TABLE loadouts ADD COLUMN IF NOT EXISTS secondary_attachments JSONB DEFAULT '{}';
ALTER TABLE loadouts ADD COLUMN IF NOT EXISTS tactical              VARCHAR(100);
ALTER TABLE loadouts ADD COLUMN IF NOT EXISTS lethal                VARCHAR(100);
ALTER TABLE loadouts ADD COLUMN IF NOT EXISTS perk1                 VARCHAR(100);
ALTER TABLE loadouts ADD COLUMN IF NOT EXISTS perk2                 VARCHAR(100);
ALTER TABLE loadouts ADD COLUMN IF NOT EXISTS perk3                 VARCHAR(100);
ALTER TABLE loadouts ADD COLUMN IF NOT EXISTS melee                 VARCHAR(100);

CREATE TABLE IF NOT EXISTS meta_noticias (
  id          SERIAL PRIMARY KEY,
  slug        VARCHAR(300) UNIQUE NOT NULL,
  titulo      VARCHAR(400),
  resumen     TEXT,
  imagen_url  TEXT,
  categoria   VARCHAR(50),
  fecha       TIMESTAMP,
  contenido   TEXT,
  destacada   BOOLEAN DEFAULT false,
  updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meta_clases (
  id                     SERIAL PRIMARY KEY,
  nombre                 VARCHAR(100) NOT NULL,
  estilo                 VARCHAR(100),
  descripcion            TEXT,
  dificultad             VARCHAR(50),
  modos                  TEXT[]  DEFAULT '{}',
  color                  VARCHAR(20),
  primaria_arma          VARCHAR(100),
  primaria_attachments   JSONB   DEFAULT '{}',
  secundaria_arma        VARCHAR(100),
  secundaria_attachments JSONB   DEFAULT '{}',
  stats                  JSONB   DEFAULT '{}',
  updated_at             TIMESTAMP DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS meta_clases_nombre_unique ON meta_clases (nombre);
ALTER TABLE meta_clases ADD COLUMN IF NOT EXISTS perk1    VARCHAR(100);
ALTER TABLE meta_clases ADD COLUMN IF NOT EXISTS perk2    VARCHAR(100);
ALTER TABLE meta_clases ADD COLUMN IF NOT EXISTS perk3    VARCHAR(100);
ALTER TABLE meta_clases ADD COLUMN IF NOT EXISTS tactical VARCHAR(100);
ALTER TABLE meta_clases ADD COLUMN IF NOT EXISTS lethal   VARCHAR(100);
