-- Meta de armas Warzone Season 3 2026 (BO7)
-- meta_build format: {"Slot": {"name": "...", "level": N}}
-- Fuente builds: warzoneloadout.games / wzhub.gg / gamerant.com
TRUNCATE weapon_meta RESTART IDENTITY;

INSERT INTO weapon_meta (weapon_name, tier, category, pick_rate, image_url, meta_build) VALUES

-- ══════════════════════ S TIER ══════════════════════

('Voyak KT-3', 'S', 'Assault Rifle', 22.1,
 'https://static.wikia.nocookie.net/callofduty/images/b/b1/VoyakKT3_Loadout_Icon_BO7.png/revision/latest?cb=20260327232930',
 '{"Underbarrel":{"name":"Force Stabilizer Handstop","level":12},"Stock":{"name":"Bowen Tread Pad","level":18},"Barrel":{"name":"20\" Danko Barrel","level":28},"Rear Grip":{"name":"Pleated Grip","level":35},"Optic":{"name":"FANG HoverPoint ELO","level":38},"Magazine":{"name":"Lineguard Casket Mag","level":44},"Muzzle":{"name":"SWF Tishina-11","level":48},"Fire Mods":{"name":"Buffer Spring","level":55}}'),

('VST', 'S', 'SMG', 19.4,
 'https://static.wikia.nocookie.net/callofduty/images/a/a0/VST_Loadout_Icon_BO7.png/revision/latest?cb=20260411232246',
 '{"Underbarrel":{"name":"VAS Convergence Foregrip","level":10},"Laser":{"name":"EMT3 Agile Laser","level":15},"Stock":{"name":"VAS Blench Pad","level":22},"Magazine":{"name":"Amplify Extended Mag I","level":36},"Barrel":{"name":"14\" LTI Expedition Barrel","level":40},"Optic":{"name":"FANG HoverPoint ELO","level":44},"Muzzle":{"name":"Redwell Shade-X Suppressor","level":49},"Fire Mods":{"name":"Buffer Springs","level":56}}'),

('DS20 Mirage', 'S', 'Assault Rifle', 17.8,
 'https://static.wikia.nocookie.net/callofduty/images/4/48/DS20Mirage_Loadout_Icon_BO7.png/revision/latest?cb=20251124142559',
 '{"Underbarrel":{"name":"Ironhold Angled Grip","level":10},"Laser":{"name":"3mW Motion Strike Laser","level":16},"Rear Grip":{"name":"Viceroy Grip","level":24},"Stock":{"name":"Redwell Carrion Stock","level":30},"Barrel":{"name":"20\" Rupture Barrel","level":36},"Optic":{"name":"FANG HoverPoint ELO","level":42},"Magazine":{"name":"Andean Extended Mag","level":46},"Muzzle":{"name":"VAS 5.56 Suppressor","level":52}}'),

('Strider 300', 'S', 'Sniper Rifle', 15.3,
 'https://static.wikia.nocookie.net/callofduty/images/a/a6/Strider300_Loadout_Icon_BO7.png/revision/latest?cb=20260411232212',
 '{"Underbarrel":{"name":"Cornerstone-642 Guard","level":10},"Laser":{"name":"1mW Instinct Laser Array","level":16},"Magazine":{"name":"Carnation Fast Mag","level":24},"Rear Grip":{"name":"Hatch Quick Grip","level":30},"Stock":{"name":"Bowen Industrial Stock","level":36},"Barrel":{"name":"19\" Trigon Heavy Barrel","level":44},"Muzzle":{"name":"Greaves A-762","level":50},"Fire Mods":{"name":"Quick Bolt","level":58}}'),

('Kogot-7', 'S', 'SMG', 14.6,
 'https://static.wikia.nocookie.net/callofduty/images/e/e4/Kogot7_Loadout_Icon_BO7.png/revision/latest?cb=20251207023006',
 '{"Underbarrel":{"name":"VAS Convergence Foregrip","level":8},"Laser":{"name":"3mW Motion Strike Laser","level":14},"Rear Grip":{"name":"Remedy Light Grip","level":22},"Stock":{"name":"EMT3 Radix Stock","level":28},"Magazine":{"name":"Fortune Extended Mag","level":36},"Barrel":{"name":"13.5\" Canis-05 Barrel","level":42},"Muzzle":{"name":"Redwell Shade-X Suppressor","level":48},"Fire Mods":{"name":"9x21mm Overpressured","level":56}}'),

('MK.78', 'S', 'LMG', 12.9,
 'https://static.wikia.nocookie.net/callofduty/images/8/87/MK78_Loadout_Icon_BO7.png/revision/latest?cb=20251124142610',
 '{"Laser":{"name":"1mW Instinct Laser Array","level":12},"Underbarrel":{"name":"Quickstep Foregrip","level":18},"Rear Grip":{"name":"Trailblaze Grip","level":25},"Stock":{"name":"Bowen Light Stock","level":32},"Optic":{"name":"Lethal Tools ELO","level":38},"Barrel":{"name":"15\" Skylance Barrel","level":44},"Muzzle":{"name":"Redwell Shade-X Suppressor","level":50},"Fire Mods":{"name":"Accelerated Recoil System","level":58}}'),

-- ══════════════════════ A TIER ══════════════════════

('Carbon 57', 'A', 'SMG', 11.4,
 'https://static.wikia.nocookie.net/callofduty/images/a/a6/Carbon57_Loadout_Icon_BO7.png/revision/latest?cb=20251124142555',
 '{"Underbarrel":{"name":"Vitalize Handstop","level":8},"Laser":{"name":"EMT3 Agile Laser","level":14},"Rear Grip":{"name":"Bombus Quick Grip","level":22},"Stock":{"name":"Hammer Platoon Pad","level":28},"Magazine":{"name":"MFS Renown Plus Mag","level":36},"Barrel":{"name":"14\" Rockleigh Barrel","level":42},"Muzzle":{"name":"Redwell Shade-X Suppressor","level":48},"Fire Mods":{"name":"5.7x28mm Overpressured","level":56}}'),

('Dravec 45', 'A', 'SMG', 10.2,
 'https://static.wikia.nocookie.net/callofduty/images/3/35/Dravec45_Loadout_Icon_BO7.png/revision/latest?cb=20251124142557',
 '{"Optic":{"name":"FANG HoverPoint ELO","level":18},"Magazine":{"name":"Lockjaw Extended Mag","level":32},"Barrel":{"name":"19\" EAM Horizon Barrel","level":40},"Muzzle":{"name":"Monolithic Suppressor","level":50},"Fire Mods":{"name":"Accelerated Recoil System","level":58}}'),

('EGRT-17', 'A', 'Assault Rifle', 9.6,
 'https://static.wikia.nocookie.net/callofduty/images/0/0d/EGRT17_Loadout_Icon_BO7.png/revision/latest?cb=20260213000703',
 '{"Underbarrel":{"name":"Quickstep Foregrip","level":10},"Laser":{"name":"1mW Instinct Laser Array","level":16},"Rear Grip":{"name":"LTI Diode Grip","level":24},"Stock":{"name":"EAM Tatter Stock","level":30},"Magazine":{"name":"EAM Acute Mag","level":38},"Barrel":{"name":"14.6\" LTI Verdin Barrel","level":44},"Muzzle":{"name":"Redwell Shade-X Suppressor","level":50},"Fire Mods":{"name":"Buffer Springs","level":57}}'),

('MK35 ISR', 'A', 'Assault Rifle', 8.8,
 'https://static.wikia.nocookie.net/callofduty/images/e/e7/MK35ISR_Loadout_Icon_BO7.png/revision/latest?cb=20260411232112',
 '{"Underbarrel":{"name":"Strider Handstop","level":10},"Laser":{"name":"1mW Instinct Laser Array","level":16},"Rear Grip":{"name":"Verdugo Brigand Grip","level":24},"Stock":{"name":"Bowen ST-Move Stock ADS","level":30},"Optic":{"name":"Lethal Tools ELO","level":36},"Magazine":{"name":"Gen-X04 Extended Mag","level":42},"Barrel":{"name":"19\" MFS Nightfall Suppressed Barrel","level":50},"Fire Mods":{"name":"Buffer Springs","level":58}}'),

('Hawker HX', 'A', 'Sniper Rifle', 8.1,
 'https://static.wikia.nocookie.net/callofduty/images/1/15/HawkerHX_Loadout_Icon_BO7.png/revision/latest?cb=20260112160200',
 '{"Laser":{"name":"1mW Instinct Laser Array","level":12},"Underbarrel":{"name":"KnitTline Focus Grip","level":18},"Rear Grip":{"name":"Auroral Light Grip","level":26},"Stock":{"name":"Hawker Steadfast Stock","level":34},"Magazine":{"name":"Amrita Fast Mag","level":40},"Barrel":{"name":"MFS 25\" Voltve Barrel","level":46},"Muzzle":{"name":"SWF Tishina-11","level":52},"Fire Mods":{"name":"Light Bolt","level":60}}'),

('VS Recon', 'A', 'Sniper Rifle', 7.5,
 'https://static.wikia.nocookie.net/callofduty/images/2/2e/VSRecon_Loadout_Icon_BO7.png/revision/latest?cb=20251124142623',
 '{"Laser":{"name":"1mW Instinct Laser Array","level":12},"Underbarrel":{"name":"MFS R-Stop Handguard","level":18},"Rear Grip":{"name":"R-1 Shelf Grip","level":26},"Magazine":{"name":"DashLine Speed Mag","level":32},"Stock":{"name":"Stabil Heavy Pad","level":38},"Barrel":{"name":"17\" RistRauch Nimbus Barrel","level":44},"Muzzle":{"name":"Greaves A-762","level":52},"Fire Mods":{"name":"Light Bolt","level":60}}'),

('Razor 9mm', 'A', 'SMG', 7.1,
 'https://static.wikia.nocookie.net/callofduty/images/4/4a/Razor9mm_Loadout_Icon_BO7.png/revision/latest?cb=20251124142616',
 '{"Underbarrel":{"name":"VAS Convergence Foregrip","level":8},"Laser":{"name":"EMT3 Agile Laser","level":14},"Rear Grip":{"name":"Microdot Recovery Grip","level":22},"Stock":{"name":"RWL Stability Pad","level":28},"Optic":{"name":"FANG HoverPoint ELO","level":34},"Magazine":{"name":"Strikeface Extended Mag I","level":40},"Barrel":{"name":"12\" MFS Sidewinder Barrel","level":46},"Muzzle":{"name":"Redwell Shade-X Suppressor","level":52}}'),

('MXR-17', 'A', 'Assault Rifle', 6.4,
 'https://static.wikia.nocookie.net/callofduty/images/f/f9/MXR17_Loadout_Icon_BO7.png/revision/latest?cb=20251124142613',
 '{"Optic":{"name":"FANG HoverPoint ELO","level":20},"Stock":{"name":"Winch Stock","level":30},"Magazine":{"name":"Rhodes Drum Mag","level":40},"Barrel":{"name":"17\" Greaves Scourge Barrel","level":48},"Muzzle":{"name":"Monolithic Suppressor","level":55}}'),

('AK-27', 'A', 'Assault Rifle', 6.0,
 'https://static.wikia.nocookie.net/callofduty/images/f/f2/AK27_Loadout_Icon_BO7.png/revision/latest?cb=20251124142551',
 '{"Underbarrel":{"name":"VAS Convergence Foregrip","level":10},"Laser":{"name":"3mW Motion Strike Laser","level":16},"Rear Grip":{"name":"Garin Advanced Grip","level":24},"Optic":{"name":"FANG HoverPoint ELO","level":30},"Magazine":{"name":"Epitaph Extended Mag","level":38},"Barrel":{"name":"18.2\" Vostok Extended Barrel","level":44},"Muzzle":{"name":"Redwell Shade-X Suppressor","level":50},"Fire Mods":{"name":"Buffer Spring","level":56}}'),

('Peacekeeper Mk1', 'A', 'Assault Rifle', 5.7,
 'https://static.wikia.nocookie.net/callofduty/images/6/64/PeacekeeperMk1_Loadout_Icon_BO7.png/revision/latest?cb=20251124142614',
 '{"Underbarrel":{"name":"VAS Convergence Foregrip","level":10},"Laser":{"name":"EMT3 Agile Laser","level":16},"Rear Grip":{"name":"DiveEdge-7 Grip","level":24},"Stock":{"name":"Vagrant-93 Stock","level":30},"Magazine":{"name":"Vulcan Reach Extension","level":38},"Barrel":{"name":"23.5\" Longbow Barrel","level":44},"Muzzle":{"name":"Redwell Shade-X Suppressor","level":50},"Fire Mods":{"name":"Buffer Spring","level":57}}'),

-- ══════════════════════ B TIER ══════════════════════

('Sturmwolf 45', 'B', 'SMG', 4.8,
 'https://static.wikia.nocookie.net/callofduty/images/4/43/Sturmwolf45_Loadout_Icon_BO7.png/revision/latest?cb=20260112160201',
 '{"Optic":{"name":"FANG HoverPoint ELO","level":20},"Magazine":{"name":"B-45 Roar Drum","level":35},"Barrel":{"name":"15\" Regnant Barrel","level":42},"Muzzle":{"name":"Bowen .45 Suppressor","level":50},"Fire Mods":{"name":"Recoil Spring Assembly","level":56}}'),

('Ryden 45K', 'B', 'SMG', 4.2,
 'https://static.wikia.nocookie.net/callofduty/images/9/9a/Ryden45K_Loadout_Icon_BO7.png/revision/latest?cb=20251124142618',
 '{"Optic":{"name":"FANG HoverPoint ELO","level":20},"Stock":{"name":"VAS Interlock Stock","level":28},"Magazine":{"name":"Forward Breach Mag","level":36},"Barrel":{"name":"12\" Vienna Barrel","level":42},"Muzzle":{"name":"Monolithic Suppressor","level":50}}'),

('MPC-25', 'B', 'SMG', 3.9,
 'https://static.wikia.nocookie.net/callofduty/images/f/f7/MPC25_Loadout_Icon_BO7.png/revision/latest?cb=20251124142611',
 '{"Underbarrel":{"name":"Zero Shift Handstop","level":10},"Magazine":{"name":"MPC Overload Drum","level":32},"Barrel":{"name":"14.5\" VAS Ashe Barrel","level":40},"Muzzle":{"name":"K&S Compensator","level":48},"Fire Mods":{"name":"Recoil Sync Unit","level":56}}'),

('Sokol 545', 'B', 'LMG', 3.5,
 'https://static.wikia.nocookie.net/callofduty/images/c/ce/Sokol545_Loadout_Icon_BO7.png/revision/latest?cb=20251223155650',
 '{"Underbarrel":{"name":"Strider Handstop","level":10},"Laser":{"name":"1mW Instinct Laser Array","level":16},"Rear Grip":{"name":"Pythian-VI Grip","level":24},"Stock":{"name":"Echidna Aim Stock","level":30},"Optic":{"name":"Lethal Tools ELO","level":36},"Barrel":{"name":"15.6\" Stolos Short Barrel","level":42},"Magazine":{"name":"Samarskiy Overdrive Belt","level":48},"Muzzle":{"name":"Redwell Shade-X Suppressor","level":54}}'),

('M15 Mod 0', 'B', 'Assault Rifle', 3.1,
 'https://static.wikia.nocookie.net/callofduty/images/b/b9/M15Mod0_Loadout_Icon_BO7.png/revision/latest?cb=20251124142607',
 '{"Underbarrel":{"name":"VAS Convergence Foregrip","level":10},"Rear Grip":{"name":"Hexcut Grip","level":18},"Optic":{"name":"Lethal Tools ELO","level":26},"Stock":{"name":"Wander-3V Stock","level":32},"Magazine":{"name":"Mayday Extended Mag","level":40},"Barrel":{"name":"15\" Mirage Light Barrel","level":46},"Muzzle":{"name":"Titan-R 5.56 Compensator","level":52},"Fire Mods":{"name":"MFS 5.56 NATO FMJ","level":58}}'),

('X9 Maverick', 'B', 'Assault Rifle', 2.8,
 'https://static.wikia.nocookie.net/callofduty/images/9/9c/X9Maverick_Loadout_Icon_BO7.png/revision/latest?cb=20251124142625',
 '{"Underbarrel":{"name":"Quickstep Foregrip","level":10},"Laser":{"name":"3mW Motion Strike Laser","level":16},"Rear Grip":{"name":"Daedalus Grip","level":24},"Stock":{"name":"Strider Overstep Stock","level":30},"Optic":{"name":"FANG HoverPoint ELO","level":36},"Barrel":{"name":"19.5\" Shroud Barrel","level":42},"Muzzle":{"name":"Defense-H Suppressor","level":50},"Fire Mods":{"name":"Buffer Spring","level":56}}'),

('M8A1', 'B', 'Marksman Rifle', 2.4,
 'https://static.wikia.nocookie.net/callofduty/images/0/09/M8A1_Loadout_Icon_BO7.png/revision/latest?cb=20251124142605',
 '{"Underbarrel":{"name":"VAS Convergence Foregrip","level":10},"Laser":{"name":"3mW Motion Strike Laser","level":16},"Rear Grip":{"name":"K&S Raze Grip","level":24},"Stock":{"name":"K&S Impact Stock","level":30},"Optic":{"name":"FANG HoverPoint ELO","level":36},"Magazine":{"name":"Sentinel Extended Mag","level":42},"Barrel":{"name":"15\" Ascend-KS Barrel","level":48},"Muzzle":{"name":"Redwell Shade-X Suppressor","level":54}}'),

('REV-46', 'B', 'SMG', 2.1,
 'https://static.wikia.nocookie.net/callofduty/images/f/ff/REV46_Loadout_Icon_BO7.png/revision/latest?cb=20260213000707',
 '{"Underbarrel":{"name":"VAS Convergence Foregrip","level":10},"Laser":{"name":"EMT3 Agile Laser","level":16},"Stock":{"name":"MFS Reforge Flip Stock","level":24},"Optic":{"name":"FANG HoverPoint ELO","level":32},"Magazine":{"name":"Cawdor Extended Mag","level":40},"Barrel":{"name":"14.9\" Caudal Target Barrel","level":46},"Muzzle":{"name":"Redwell Shade-X Suppressor","level":52},"Fire Mods":{"name":"Recoil Sync Unit","level":58}}'),

('XR-3 Ion', 'B', 'Sniper Rifle', 1.8,
 'https://static.wikia.nocookie.net/callofduty/images/f/fc/XR3Ion_Loadout_Icon_BO7.png/revision/latest?cb=20251124142628',
 '{"Underbarrel":{"name":"Zero-S Handguard","level":10},"Laser":{"name":"1mW Instinct Laser Array","level":16},"Rear Grip":{"name":"L.T. Sling Grip","level":24},"Stock":{"name":"Lethal Absorb Stock","level":30},"Optic":{"name":"EAM Dyad xL","level":36},"Barrel":{"name":"15\" Fringe Barrel","level":42},"Muzzle":{"name":"Redwell Shade-X Suppressor","level":50},"Fire Mods":{"name":"Quick Charge","level":58}}'),

-- ══════════════════════ C TIER ══════════════════════

('Swordfish A1', 'C', 'Marksman Rifle', 1.4,
 'https://static.wikia.nocookie.net/callofduty/images/0/02/SwordfishA1_Loadout_Icon_BO7.png/revision/latest?cb=20260327232853',
 '{"Underbarrel":{"name":"Fixus Underbarrel","level":10},"Laser":{"name":"1mW Instinct Laser Array","level":16},"Rear Grip":{"name":"Hawker VIC-R Grip","level":24},"Stock":{"name":"Q-Stubb Stock","level":30},"Optic":{"name":"Lethal Tools ELO","level":36},"Barrel":{"name":"13\" EAM Volare Barrel","level":42},"Muzzle":{"name":"Redwell Shade-X Suppressor","level":50},"Fire Mods":{"name":"MFS Penta Burst Mod","level":58}}'),

('Maddox RFB', 'C', 'Assault Rifle', 1.1,
 'https://static.wikia.nocookie.net/callofduty/images/c/c8/MaddoxRFB_Loadout_Icon_BO7.png/revision/latest?cb=20251207023007',
 '{"Underbarrel":{"name":"H-Lock Foregrip","level":10},"Laser":{"name":"3mW Motion Strike Laser","level":16},"Rear Grip":{"name":"Hallux Mix Grip","level":24},"Stock":{"name":"Rout Stride Stock","level":30},"Optic":{"name":"Lethal Tools ELO","level":36},"Barrel":{"name":"24\" Assemblage Barrel","level":42},"Muzzle":{"name":"VAS 5.56 Suppressor","level":50},"Fire Mods":{"name":"Buffer Spring","level":56}}'),

('Warden 308', 'C', 'Marksman Rifle', 0.9,
 'https://static.wikia.nocookie.net/callofduty/images/5/57/Warden308_Loadout_Icon_BO7.png/revision/latest?cb=20251124142624',
 '{"Laser":{"name":"1mW Instinct Laser Array","level":12},"Rear Grip":{"name":"LTI Tyrannis Grip","level":20},"Stock":{"name":"FTAC Hybrid Stock","level":28},"Optic":{"name":"Greaves AccuSpot 3x","level":36},"Barrel":{"name":"16.2\" Artemis-01 Barrel","level":44},"Muzzle":{"name":"LTI-LM Brake","level":52},"Fire Mods":{"name":"Buffer Spring","level":58}}'),

('XM325', 'C', 'LMG', 0.7,
 'https://static.wikia.nocookie.net/callofduty/images/b/b4/XM325_Loadout_Icon_BO7.png/revision/latest?cb=20251124142627',
 '{"Laser":{"name":"MFS Motion Strike Laser","level":10},"Rear Grip":{"name":"Elysian Quick Grip","level":18},"Stock":{"name":"RX-7 Shock Stock","level":26},"Optic":{"name":"FANG HoverPoint ELO","level":34},"Barrel":{"name":"18\" RistRauch S-100 Barrel","level":42},"Magazine":{"name":"Leyden Spark Belt Fed","level":48},"Muzzle":{"name":"Redwell Shade-X Suppressor","level":54},"Fire Mods":{"name":"Accelerated Recoil System","level":60}}'),

('RK-9', 'C', 'SMG', 0.5,
 'https://static.wikia.nocookie.net/callofduty/images/f/f0/RK9_Loadout_Icon_BO7.png/revision/latest?cb=20251124142617',
 '{"Underbarrel":{"name":"MFS Ironlung Handstop","level":8},"Laser":{"name":"EMT3 Agile Laser","level":14},"Rear Grip":{"name":"Raft Ready Grip","level":22},"Stock":{"name":"VAS Conduit Stock","level":28},"Optic":{"name":"FANG HoverPoint ELO","level":34},"Magazine":{"name":"Alliance Extended Mag","level":40},"Barrel":{"name":"13.6\" Mercurial Barrel","level":46},"Muzzle":{"name":"Redwell Shade-X Suppressor","level":52}}');
