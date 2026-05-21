-- Meta de ventajas Warzone Season 3 2026
-- Fuente: wzstats.gg/es/warzone-2/loadouts/best-perks-tier-list
-- Perk 1 = Azul | Perk 2 = Rojo | Perk 3 = Amarillo
TRUNCATE perk_meta RESTART IDENTITY;

INSERT INTO perk_meta (perk_name, category, tier, description, image_url) VALUES

  -- ── Perk 1 (Azul) ──────────────────────────────────────────
  ('Scavenger',         'Perk 1', 'S',
   'Recupera munición y placas de armadura de enemigos eliminados.',
   '/perks/scavenger.webp'),

  ('Field Medic',       'Perk 1', 'A',
   'Revive aliados y te autorevives considerablemente más rápido.',
   '/perks/field-medic.webp'),

  ('Surveyor',          'Perk 1', 'A',
   'Detecta automáticamente a los enemigos cercanos al completar contratos.',
   '/perks/surveyor.webp'),

  ('Drill Instructor',  'Perk 1', 'A',
   'Velocidad de ADS y recuperación tras sprint muy mejoradas.',
   '/perks/drill-instructor.webp'),

  ('Mountaineer',       'Perk 1', 'B',
   'Inmunidad al daño por caída. Trepa y escala un 20% más rápido.',
   '/perks/mountaineer.webp'),

  -- ── Perk 2 (Rojo) ──────────────────────────────────────────
  ('Sprinter',          'Perk 2', 'S',
   'La velocidad de movimiento aumenta significativamente durante un breve período tras cada eliminación.',
   '/perks/sprinter.webp'),

  ('Momentum',          'Perk 2', 'S',
   'Mantén el impulso de sprint para moverte más rápido en carrera continua.',
   '/perks/momentum.webp'),

  ('Quick Patch',       'Perk 2', 'A',
   'Aplica parches de salud y coloca placas de armadura más rápido bajo presión.',
   '/perks/quick-patch.webp'),

  ('Berserker',         'Perk 2', 'A',
   'Recibes menos daño y te mueves más rápido con poca salud.',
   '/perks/berserker.webp'),

  ('Reactive Armor',    'Perk 2', 'B',
   'El primer impacto de cada vida activa una placa de armadura de emergencia.',
   '/perks/reactive-armor.webp'),

  -- ── Perk 3 (Amarillo) ──────────────────────────────────────
  ('Ghost',             'Perk 3', 'S',
   'Indetectable por UAVs, radares portátiles y pulsos de campo mientras te mueves.',
   '/perks/ghost.webp'),

  ('Hunter',            'Perk 3', 'S',
   'Detecta enemigos heridos a través de paredes. Tus marcajes duran más tiempo.',
   '/perks/hunter.webp'),

  ('Tempered',          'Perk 3', 'A',
   'Las placas de armadura se restauran completamente con sólo 2 piezas en lugar de 3.',
   '/perks/tempered.webp'),

  ('Survivor',          'Perk 3', 'A',
   'Al ser eliminado, tienes una oportunidad de autorevivarte con muy poca salud.',
   '/perks/survivor.webp'),

  ('Adaptive',          'Perk 3', 'A',
   'Reduce los efectos de estado negativos: flash, aturdimiento, gas y EMP.',
   '/perks/adaptive.webp');
