-- BO7 Warzone Equipment Seed
-- Tactical, Lethal, Melee

INSERT INTO equipment_meta (name, category, tier, description) VALUES
-- TACTICAL
('Stim',               'tactical', 'S', 'Regenera salud y restablece el sprint táctico al instante'),
('Flash Grenade',      'tactical', 'A', 'Ciega y ensordece a los enemigos en el área de impacto'),
('Smoke Grenade',      'tactical', 'A', 'Despliega una cortina de humo que bloquea la visión'),
('Snapshot Grenade',   'tactical', 'B', 'Emite un pulso sonar que revela enemigos cercanos brevemente'),
('Concussion Grenade', 'tactical', 'B', 'Desorienta y ralentiza a los objetivos afectados'),
('Shock Stick',        'tactical', 'B', 'Se adhiere a superficies y libera descarga eléctrica al paso'),
('Trophy System',      'tactical', 'B', 'Destruye proyectiles enemigos entrantes automáticamente'),
('Decoy Grenade',      'tactical', 'C', 'Simula firmas de radar y disparos para confundir enemigos'),

-- LETHAL
('Throwing Knife',     'lethal',   'S', 'Cuchillo recuperable. Elimina al instante en la cabeza'),
('Proximity Mine',     'lethal',   'A', 'Se activa con el movimiento enemigo. Ideal para cubrir flancos'),
('C4',                 'lethal',   'A', 'Explosivo de detonación remota con gran radio de daño'),
('Semtex',             'lethal',   'A', 'Granada adhesiva con temporizador automático'),
('Frag Grenade',       'lethal',   'B', 'Granada de fragmentación cocinable para tiempos precisos'),
('Thermite',           'lethal',   'B', 'Se adhiere a superficies y arde intensamente al impactar'),
('Claymore',           'lethal',   'B', 'Mina de proximidad direccional activada por movimiento'),
('Drill Charge',       'lethal',   'C', 'Carga explosiva que perfora coberturas sólidas'),

-- MELEE
('Karambit',           'melee',    'S', 'Sprint y animaciones de ejecución más rápidas que cualquier arma'),
('Combat Knife',       'melee',    'A', 'Cuchillo estándar. Mayor velocidad de movimiento'),
('Sai',                'melee',    'A', 'Ataques de doble punta con alta cadencia melee'),
('Bowie Knife',        'melee',    'A', 'Gran hoja con alto daño por impacto'),
('Kali Sticks',        'melee',    'B', 'Palos de combate rápidos con múltiples golpes por animación'),
('Pickaxe',            'melee',    'B', 'Alto daño por impacto, útil para atravesar armadura'),
('Sledgehammer',       'melee',    'B', 'Martillo pesado de gran impacto. Velocidad de movimiento reducida'),
('Machete',            'melee',    'C', 'Mayor alcance melee pero animación más lenta')
ON CONFLICT DO NOTHING;
