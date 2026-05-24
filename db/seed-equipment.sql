-- Warzone BO7 Season 3 Equipment Seed
-- Fuente: COD Wiki + Warzone S3 patch notes (verificado mayo 2026)
TRUNCATE equipment_meta RESTART IDENTITY;

INSERT INTO equipment_meta (name, category, tier, description, image_url) VALUES

-- ══ TACTICAL ══════════════════════════════════════════════════════════════════
('Stim Shot',
 'tactical', 'S',
 'Regenera salud al instante y elimina efectos de estado. Overclocks: limpieza de debuffs y sprint táctico.',
 'https://static.wikia.nocookie.net/callofduty/images/f/f3/StimShot_Tactical_HUD_Icon_BO7.png/revision/latest?cb=20251121003004'),

('Smoke Grenade',
 'tactical', 'A',
 'Despliega una cortina de humo que bloquea líneas de visión y sistemas de targeting automático.',
 'https://static.wikia.nocookie.net/callofduty/images/a/a8/SmokeGrenade_Tactical_HUD_Icon_BO7_WZ2.png/revision/latest?cb=20260216003423'),

('Flashbang',
 'tactical', 'A',
 'Ciega y ensordece temporalmente a los enemigos en el área. También desactiva equipamiento colocado.',
 'https://static.wikia.nocookie.net/callofduty/images/5/53/Flashbang_Tactical_HUD_Icon_BO7.png/revision/latest?cb=20251003142952'),

('Pinpoint Grenade',
 'tactical', 'B',
 'Emite un pulso sonar que revela posiciones enemigas a través de paredes durante unos segundos.',
 'https://static.wikia.nocookie.net/callofduty/images/6/6a/PinpointGrenade_Tactical_HUD_Icon_BO7.png/revision/latest?cb=20251003142953'),

('Decoy Grenade',
 'tactical', 'B',
 'Se adhiere a superficies y simula disparos y pasos enemigos para confundir al oponente.',
 'https://static.wikia.nocookie.net/callofduty/images/a/af/Decoy_Tactical_HUD_Icon_BO7.png/revision/latest?cb=20251121003001'),

('EMP Grenade',
 'tactical', 'B',
 'Desactiva y destruye equipamiento electrónico, field upgrades y killstreaks en el área de impacto.',
 'https://static.wikia.nocookie.net/callofduty/images/e/e3/EMPGrenade_Tactical_HUD_Icon_BO7.png/revision/latest?cb=20251003142951'),

('Stun Grenade',
 'tactical', 'C',
 'Ralentiza el movimiento del objetivo y dificulta el puntería durante varios segundos.',
 'https://static.wikia.nocookie.net/callofduty/images/5/55/StunGrenade_Tactical_HUD_Icon_BO7.png/revision/latest?cb=20251003142956'),

-- ══ LETHAL ════════════════════════════════════════════════════════════════════
('Throwing Knife',
 'lethal', 'S',
 'Cuchillo arrojadizo recuperable. Ideal para rematar enemigos derribados sin gastar munición.',
 NULL),

('C4',
 'lethal', 'A',
 'Explosivo adhesivo de detonación remota. Gran radio de daño, letal contra vehículos y grupos.',
 'https://static.wikia.nocookie.net/callofduty/images/5/52/C4_Lethal_HUD_Icon_BO7.png/revision/latest?cb=20251121002522'),

('Semtex',
 'lethal', 'A',
 'Granada adhesiva con temporizador automático. Se pega a cualquier superficie o enemigo.',
 'https://static.wikia.nocookie.net/callofduty/images/b/bc/Semtex_Lethal_HUD_Icon_BO7.png/revision/latest?cb=20251003142113'),

('Molotov',
 'lethal', 'B',
 'Cóctel incendiario que crea una zona de fuego al impactar. Efectivo para bloquear pasillos.',
 'https://static.wikia.nocookie.net/callofduty/images/c/ce/Molotov_Lethal_HUD_Icon_BO7.png/revision/latest?cb=20251121002528'),

('Cluster Grenade',
 'lethal', 'B',
 'Detona al impacto dispersando múltiples sub-granadas. Cubre un área amplia. Añadida en S3 Reloaded.',
 'https://static.wikia.nocookie.net/callofduty/images/3/36/ClusterGrenade_Lethal_HUD_Icon_BO7.png/revision/latest?cb=20251121002524'),

('Frag Grenade',
 'lethal', 'B',
 'Granada de fragmentación cocinable. Puedes mantenerla para reducir el tiempo de detonación al lanzar.',
 'https://static.wikia.nocookie.net/callofduty/images/c/c6/Frag_Lethal_HUD_Icon_BO7.png/revision/latest?cb=20251003142110'),

('Spring Mine',
 'lethal', 'C',
 'Mina antipersona que se activa al paso enemigo. Cubre flancos y rutas de rotación.',
 NULL),

-- ══ MELEE ═════════════════════════════════════════════════════════════════════
('Ballistic Knife',
 'melee', 'S',
 'Lanza cuchillas de proyectil recuperables que eliminan de un golpe. Desbloqueo Season 1.',
 'https://static.wikia.nocookie.net/callofduty/images/4/47/BallisticKnife_HUD_Icon_BO7.png/revision/latest?cb=20251207023244'),

('Katana',
 'melee', 'A',
 'Alto daño con alcance de ~2m. Puede eliminar de un golpe. Desbloqueo Season 3 Reloaded.',
 'https://static.wikia.nocookie.net/callofduty/images/e/e8/Katana_HUD_Icon_BO7.png/revision/latest?cb=20260512002408'),

('Knife',
 'melee', 'A',
 'Cuchillo estándar de combate. Desbloqueado por defecto. Mayor velocidad de movimiento al equipar.',
 'https://static.wikia.nocookie.net/callofduty/images/2/20/Knife_HUD_Icon_BO7.png/revision/latest?cb=20251124141846'),

('H311-SAW',
 'melee', 'B',
 'Arma melee de largo alcance con golpes de amplio radio. Recompensa Season 2 Battle Pass.',
 'https://static.wikia.nocookie.net/callofduty/images/c/cc/H311SAW_HUD_Icon_BO7.png/revision/latest?cb=20260213001900'),

('Flatline MK.II',
 'melee', 'B',
 'Arma melee alternativa. Alto daño por impacto con alcance moderado. Desbloqueo en nivel 49.',
 'https://static.wikia.nocookie.net/callofduty/images/2/2c/FlatlineMkII_HUD_Icon_BO7.png/revision/latest?cb=20251124141834');
