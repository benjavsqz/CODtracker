-- Meta de armas Warzone Season 3 2026 (BO7)
-- max_level: nivel máximo real por arma (verificado en codmunity.gg / game8.co)
-- meta_build: 5 attachments con niveles distribuidos proporcionalmente al max_level real
-- ON CONFLICT preserva change_type/changed_at para mantener historial buff/nerf entre deploys

INSERT INTO weapon_meta (weapon_name, tier, category, pick_rate, image_url, max_level, meta_build) VALUES

-- ══════════════════════ S TIER ══════════════════════

('Voyak KT-3', 'S', 'Assault Rifle', 22.1,
 'https://static.wikia.nocookie.net/callofduty/images/b/b1/VoyakKT3_Loadout_Icon_BO7.png/revision/latest?cb=20260327232930',
 42,
 '{"Underbarrel":{"name":"Force Stabilizer Handstop","level":9},"Stock":{"name":"Bowen Tread Pad","level":15},"Barrel":{"name":"20\" Danko Barrel","level":23},"Optic":{"name":"FANG HoverPoint ELO","level":32},"Muzzle":{"name":"SWF Tishina-11","level":40}}'),

('VST', 'S', 'SMG', 19.4,
 'https://static.wikia.nocookie.net/callofduty/images/a/a0/VST_Loadout_Icon_BO7.png/revision/latest?cb=20260411232246',
 39,
 '{"Underbarrel":{"name":"VAS Convergence Foregrip","level":8},"Stock":{"name":"VAS Blench Pad","level":14},"Magazine":{"name":"Amplify Extended Mag I","level":22},"Barrel":{"name":"14\" LTI Expedition Barrel","level":30},"Muzzle":{"name":"Redwell Shade-X Suppressor","level":37}}'),

('DS20 Mirage', 'S', 'Assault Rifle', 17.8,
 'https://static.wikia.nocookie.net/callofduty/images/4/48/DS20Mirage_Loadout_Icon_BO7.png/revision/latest?cb=20251124142559',
 43,
 '{"Underbarrel":{"name":"Ironhold Angled Grip","level":8},"Stock":{"name":"Redwell Carrion Stock","level":19},"Barrel":{"name":"20\" Rupture Barrel","level":25},"Optic":{"name":"FANG HoverPoint ELO","level":34},"Muzzle":{"name":"VAS 5.56 Suppressor","level":41}}'),

('Strider 300', 'S', 'Sniper Rifle', 15.3,
 'https://static.wikia.nocookie.net/callofduty/images/a/a6/Strider300_Loadout_Icon_BO7.png/revision/latest?cb=20260411232212',
 37,
 '{"Laser":{"name":"1mW Instinct Laser Array","level":8},"Rear Grip":{"name":"Hatch Quick Grip","level":13},"Stock":{"name":"Bowen Industrial Stock","level":20},"Barrel":{"name":"19\" Trigon Heavy Barrel","level":28},"Muzzle":{"name":"Greaves A-762","level":35}}'),

('Kogot-7', 'S', 'SMG', 14.6,
 'https://static.wikia.nocookie.net/callofduty/images/e/e4/Kogot7_Loadout_Icon_BO7.png/revision/latest?cb=20251207023006',
 39,
 '{"Underbarrel":{"name":"VAS Convergence Foregrip","level":8},"Stock":{"name":"EMT3 Radix Stock","level":14},"Magazine":{"name":"Fortune Extended Mag","level":22},"Barrel":{"name":"13.5\" Canis-05 Barrel","level":30},"Muzzle":{"name":"Redwell Shade-X Suppressor","level":37}}'),

('MK.78', 'S', 'LMG', 12.9,
 'https://static.wikia.nocookie.net/callofduty/images/8/87/MK78_Loadout_Icon_BO7.png/revision/latest?cb=20251124142610',
 50,
 '{"Underbarrel":{"name":"Quickstep Foregrip","level":10},"Stock":{"name":"Bowen Light Stock","level":18},"Optic":{"name":"Lethal Tools ELO","level":28},"Barrel":{"name":"15\" Skylance Barrel","level":38},"Muzzle":{"name":"Redwell Shade-X Suppressor","level":48}}'),

-- ══════════════════════ A TIER ══════════════════════

('Carbon 57', 'A', 'SMG', 11.4,
 'https://static.wikia.nocookie.net/callofduty/images/a/a6/Carbon57_Loadout_Icon_BO7.png/revision/latest?cb=20251124142555',
 41,
 '{"Underbarrel":{"name":"Vitalize Handstop","level":8},"Stock":{"name":"Hammer Platoon Pad","level":14},"Magazine":{"name":"MFS Renown Plus Mag","level":23},"Barrel":{"name":"14\" Rockleigh Barrel","level":31},"Muzzle":{"name":"Redwell Shade-X Suppressor","level":39}}'),

('Dravec 45', 'A', 'SMG', 10.2,
 'https://static.wikia.nocookie.net/callofduty/images/3/35/Dravec45_Loadout_Icon_BO7.png/revision/latest?cb=20251124142557',
 36,
 '{"Optic":{"name":"FANG HoverPoint ELO","level":7},"Magazine":{"name":"Lockjaw Extended Mag","level":13},"Barrel":{"name":"19\" EAM Horizon Barrel","level":20},"Muzzle":{"name":"Monolithic Suppressor","level":27},"Fire Mods":{"name":"Accelerated Recoil System","level":34}}'),

('EGRT-17', 'A', 'Assault Rifle', 9.6,
 'https://static.wikia.nocookie.net/callofduty/images/0/0d/EGRT17_Loadout_Icon_BO7.png/revision/latest?cb=20260213000703',
 43,
 '{"Underbarrel":{"name":"Quickstep Foregrip","level":8},"Rear Grip":{"name":"LTI Diode Grip","level":14},"Stock":{"name":"EAM Tatter Stock","level":23},"Barrel":{"name":"14.6\" LTI Verdin Barrel","level":31},"Muzzle":{"name":"Redwell Shade-X Suppressor","level":41}}'),

('MK35 ISR', 'A', 'Assault Rifle', 8.8,
 'https://static.wikia.nocookie.net/callofduty/images/e/e7/MK35ISR_Loadout_Icon_BO7.png/revision/latest?cb=20260411232112',
 43,
 '{"Underbarrel":{"name":"Strider Handstop","level":9},"Stock":{"name":"Bowen ST-Move Stock ADS","level":15},"Optic":{"name":"Lethal Tools ELO","level":24},"Barrel":{"name":"19\" MFS Nightfall Suppressed Barrel","level":32},"Fire Mods":{"name":"Buffer Springs","level":41}}'),

('Hawker HX', 'A', 'Sniper Rifle', 8.1,
 'https://static.wikia.nocookie.net/callofduty/images/1/15/HawkerHX_Loadout_Icon_BO7.png/revision/latest?cb=20260112160200',
 38,
 '{"Rear Grip":{"name":"Auroral Light Grip","level":8},"Stock":{"name":"Hawker Steadfast Stock","level":13},"Barrel":{"name":"MFS 25\" Voltve Barrel","level":21},"Muzzle":{"name":"SWF Tishina-11","level":29},"Fire Mods":{"name":"Light Bolt","level":36}}'),

('VS Recon', 'A', 'Sniper Rifle', 7.5,
 'https://static.wikia.nocookie.net/callofduty/images/2/2e/VSRecon_Loadout_Icon_BO7.png/revision/latest?cb=20251124142623',
 45,
 '{"Rear Grip":{"name":"R-1 Shelf Grip","level":9},"Stock":{"name":"Stabil Heavy Pad","level":16},"Barrel":{"name":"17\" RistRauch Nimbus Barrel","level":25},"Muzzle":{"name":"Greaves A-762","level":34},"Fire Mods":{"name":"Light Bolt","level":43}}'),

('Razor 9mm', 'A', 'SMG', 7.1,
 'https://static.wikia.nocookie.net/callofduty/images/4/4a/Razor9mm_Loadout_Icon_BO7.png/revision/latest?cb=20251124142616',
 42,
 '{"Underbarrel":{"name":"VAS Convergence Foregrip","level":9},"Stock":{"name":"RWL Stability Pad","level":15},"Magazine":{"name":"Strikeface Extended Mag I","level":23},"Barrel":{"name":"12\" MFS Sidewinder Barrel","level":32},"Muzzle":{"name":"Redwell Shade-X Suppressor","level":40}}'),

('MXR-17', 'A', 'Assault Rifle', 6.4,
 'https://static.wikia.nocookie.net/callofduty/images/f/f9/MXR17_Loadout_Icon_BO7.png/revision/latest?cb=20251124142613',
 47,
 '{"Optic":{"name":"FANG HoverPoint ELO","level":9},"Stock":{"name":"Winch Stock","level":16},"Magazine":{"name":"Rhodes Drum Mag","level":25},"Barrel":{"name":"17\" Greaves Scourge Barrel","level":35},"Muzzle":{"name":"Monolithic Suppressor","level":45}}'),

('AK-27', 'A', 'Assault Rifle', 6.0,
 'https://static.wikia.nocookie.net/callofduty/images/f/f2/AK27_Loadout_Icon_BO7.png/revision/latest?cb=20251124142551',
 47,
 '{"Underbarrel":{"name":"VAS Convergence Foregrip","level":9},"Optic":{"name":"FANG HoverPoint ELO","level":16},"Magazine":{"name":"Epitaph Extended Mag","level":26},"Barrel":{"name":"18.2\" Vostok Extended Barrel","level":35},"Muzzle":{"name":"Redwell Shade-X Suppressor","level":45}}'),

('Peacekeeper Mk1', 'A', 'Assault Rifle', 5.7,
 'https://static.wikia.nocookie.net/callofduty/images/6/64/PeacekeeperMk1_Loadout_Icon_BO7.png/revision/latest?cb=20251124142614',
 46,
 '{"Underbarrel":{"name":"VAS Convergence Foregrip","level":9},"Stock":{"name":"Vagrant-93 Stock","level":16},"Magazine":{"name":"Vulcan Reach Extension","level":25},"Barrel":{"name":"23.5\" Longbow Barrel","level":35},"Muzzle":{"name":"Redwell Shade-X Suppressor","level":44}}'),

-- ══════════════════════ B TIER ══════════════════════

('Sturmwolf 45', 'B', 'SMG', 4.8,
 'https://static.wikia.nocookie.net/callofduty/images/4/43/Sturmwolf45_Loadout_Icon_BO7.png/revision/latest?cb=20260112160201',
 38,
 '{"Optic":{"name":"FANG HoverPoint ELO","level":8},"Magazine":{"name":"B-45 Roar Drum","level":13},"Barrel":{"name":"15\" Regnant Barrel","level":21},"Muzzle":{"name":"Bowen .45 Suppressor","level":29},"Fire Mods":{"name":"Recoil Spring Assembly","level":36}}'),

('Ryden 45K', 'B', 'SMG', 4.2,
 'https://static.wikia.nocookie.net/callofduty/images/9/9a/Ryden45K_Loadout_Icon_BO7.png/revision/latest?cb=20251124142618',
 42,
 '{"Optic":{"name":"FANG HoverPoint ELO","level":9},"Stock":{"name":"VAS Interlock Stock","level":15},"Magazine":{"name":"Forward Breach Mag","level":23},"Barrel":{"name":"12\" Vienna Barrel","level":32},"Muzzle":{"name":"Monolithic Suppressor","level":40}}'),

('MPC-25', 'B', 'SMG', 3.9,
 'https://static.wikia.nocookie.net/callofduty/images/f/f7/MPC25_Loadout_Icon_BO7.png/revision/latest?cb=20251124142611',
 42,
 '{"Underbarrel":{"name":"Zero Shift Handstop","level":9},"Magazine":{"name":"MPC Overload Drum","level":15},"Barrel":{"name":"14.5\" VAS Ashe Barrel","level":23},"Muzzle":{"name":"K&S Compensator","level":32},"Fire Mods":{"name":"Recoil Sync Unit","level":40}}'),

('Sokol 545', 'B', 'LMG', 3.5,
 'https://static.wikia.nocookie.net/callofduty/images/c/ce/Sokol545_Loadout_Icon_BO7.png/revision/latest?cb=20251223155650',
 40,
 '{"Underbarrel":{"name":"Strider Handstop","level":8},"Stock":{"name":"Echidna Aim Stock","level":14},"Barrel":{"name":"15.6\" Stolos Short Barrel","level":22},"Magazine":{"name":"Samarskiy Overdrive Belt","level":30},"Muzzle":{"name":"Redwell Shade-X Suppressor","level":38}}'),

('M15 Mod 0', 'B', 'Assault Rifle', 3.1,
 'https://static.wikia.nocookie.net/callofduty/images/b/b9/M15Mod0_Loadout_Icon_BO7.png/revision/latest?cb=20251124142607',
 47,
 '{"Underbarrel":{"name":"VAS Convergence Foregrip","level":9},"Stock":{"name":"Wander-3V Stock","level":16},"Magazine":{"name":"Mayday Extended Mag","level":26},"Barrel":{"name":"15\" Mirage Light Barrel","level":35},"Muzzle":{"name":"Titan-R 5.56 Compensator","level":45}}'),

('X9 Maverick', 'B', 'Assault Rifle', 2.8,
 'https://static.wikia.nocookie.net/callofduty/images/9/9c/X9Maverick_Loadout_Icon_BO7.png/revision/latest?cb=20251124142625',
 42,
 '{"Underbarrel":{"name":"Quickstep Foregrip","level":9},"Stock":{"name":"Strider Overstep Stock","level":15},"Optic":{"name":"FANG HoverPoint ELO","level":23},"Barrel":{"name":"19.5\" Shroud Barrel","level":32},"Muzzle":{"name":"Defense-H Suppressor","level":40}}'),

('M8A1', 'B', 'Marksman Rifle', 2.4,
 'https://static.wikia.nocookie.net/callofduty/images/0/09/M8A1_Loadout_Icon_BO7.png/revision/latest?cb=20251124142605',
 50,
 '{"Underbarrel":{"name":"VAS Convergence Foregrip","level":10},"Stock":{"name":"K&S Impact Stock","level":18},"Optic":{"name":"FANG HoverPoint ELO","level":28},"Barrel":{"name":"15\" Ascend-KS Barrel","level":38},"Muzzle":{"name":"Redwell Shade-X Suppressor","level":48}}'),

('REV-46', 'B', 'SMG', 2.1,
 'https://static.wikia.nocookie.net/callofduty/images/f/ff/REV46_Loadout_Icon_BO7.png/revision/latest?cb=20260213000707',
 34,
 '{"Stock":{"name":"MFS Reforge Flip Stock","level":7},"Optic":{"name":"FANG HoverPoint ELO","level":12},"Magazine":{"name":"Cawdor Extended Mag","level":19},"Barrel":{"name":"14.9\" Caudal Target Barrel","level":26},"Muzzle":{"name":"Redwell Shade-X Suppressor","level":32}}'),

('XR-3 Ion', 'B', 'Sniper Rifle', 1.8,
 'https://static.wikia.nocookie.net/callofduty/images/f/fc/XR3Ion_Loadout_Icon_BO7.png/revision/latest?cb=20251124142628',
 44,
 '{"Rear Grip":{"name":"L.T. Sling Grip","level":9},"Stock":{"name":"Lethal Absorb Stock","level":15},"Barrel":{"name":"15\" Fringe Barrel","level":24},"Muzzle":{"name":"Redwell Shade-X Suppressor","level":33},"Fire Mods":{"name":"Quick Charge","level":42}}'),

-- ══════════════════════ C TIER ══════════════════════

('Swordfish A1', 'C', 'Marksman Rifle', 1.4,
 'https://static.wikia.nocookie.net/callofduty/images/0/02/SwordfishA1_Loadout_Icon_BO7.png/revision/latest?cb=20260327232853',
 39,
 '{"Underbarrel":{"name":"Fixus Underbarrel","level":8},"Stock":{"name":"Q-Stubb Stock","level":14},"Optic":{"name":"Lethal Tools ELO","level":22},"Barrel":{"name":"13\" EAM Volare Barrel","level":30},"Muzzle":{"name":"Redwell Shade-X Suppressor","level":37}}'),

('Maddox RFB', 'C', 'Assault Rifle', 1.1,
 'https://static.wikia.nocookie.net/callofduty/images/c/c8/MaddoxRFB_Loadout_Icon_BO7.png/revision/latest?cb=20251207023007',
 43,
 '{"Underbarrel":{"name":"H-Lock Foregrip","level":9},"Stock":{"name":"Rout Stride Stock","level":15},"Optic":{"name":"Lethal Tools ELO","level":24},"Barrel":{"name":"24\" Assemblage Barrel","level":32},"Muzzle":{"name":"VAS 5.56 Suppressor","level":41}}'),

('Warden 308', 'C', 'Marksman Rifle', 0.9,
 'https://static.wikia.nocookie.net/callofduty/images/5/57/Warden308_Loadout_Icon_BO7.png/revision/latest?cb=20251124142624',
 43,
 '{"Rear Grip":{"name":"LTI Tyrannis Grip","level":9},"Stock":{"name":"FTAC Hybrid Stock","level":15},"Barrel":{"name":"16.2\" Artemis-01 Barrel","level":24},"Muzzle":{"name":"LTI-LM Brake","level":32},"Fire Mods":{"name":"Buffer Spring","level":41}}'),

('XM325', 'C', 'LMG', 0.7,
 'https://static.wikia.nocookie.net/callofduty/images/b/b4/XM325_Loadout_Icon_BO7.png/revision/latest?cb=20251124142627',
 50,
 '{"Stock":{"name":"RX-7 Shock Stock","level":10},"Optic":{"name":"FANG HoverPoint ELO","level":18},"Barrel":{"name":"18\" RistRauch S-100 Barrel","level":28},"Magazine":{"name":"Leyden Spark Belt Fed","level":38},"Muzzle":{"name":"Redwell Shade-X Suppressor","level":48}}'),

('RK-9', 'C', 'SMG', 0.5,
 'https://static.wikia.nocookie.net/callofduty/images/f/f0/RK9_Loadout_Icon_BO7.png/revision/latest?cb=20251124142617',
 42,
 '{"Underbarrel":{"name":"MFS Ironlung Handstop","level":9},"Stock":{"name":"VAS Conduit Stock","level":15},"Magazine":{"name":"Alliance Extended Mag","level":23},"Barrel":{"name":"13.6\" Mercurial Barrel","level":32},"Muzzle":{"name":"Redwell Shade-X Suppressor","level":40}}')
ON CONFLICT (weapon_name) DO UPDATE SET
  tier       = EXCLUDED.tier,
  category   = EXCLUDED.category,
  pick_rate  = EXCLUDED.pick_rate,
  image_url  = EXCLUDED.image_url,
  max_level  = EXCLUDED.max_level,
  meta_build = EXCLUDED.meta_build,
  updated_at = NOW()
  -- change_type y changed_at NO se tocan: preservan historial buff/nerf entre deploys
;
