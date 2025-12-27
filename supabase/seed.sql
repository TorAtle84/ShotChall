-- Seed data for ShotChall

insert into challenge_categories (id, name, slug)
values
  (gen_random_uuid(), 'Street Style', 'street-style'),
  (gen_random_uuid(), 'Daily Life', 'daily-life'),
  (gen_random_uuid(), 'Nature', 'nature'),
  (gen_random_uuid(), 'Food', 'food'),
  (gen_random_uuid(), 'Light and Shadow', 'light-shadow'),
  (gen_random_uuid(), 'Architecture', 'architecture');


insert into challenge_templates (category_id, text)
select id, 'Capture a bold color pop against a neutral background.' from challenge_categories where slug = 'street-style';

insert into challenge_templates (category_id, text)
select id, 'Show a morning routine moment without showing faces.' from challenge_categories where slug = 'daily-life';

insert into challenge_templates (category_id, text)
select id, 'Find a repeating pattern in your neighborhood.' from challenge_categories where slug = 'architecture';

insert into challenge_templates (category_id, text)
select id, 'Photograph a cozy food scene with natural light.' from challenge_categories where slug = 'food';

insert into challenge_templates (category_id, text)
select id, 'Catch a shadow that looks like something else.' from challenge_categories where slug = 'light-shadow';

insert into challenge_templates (category_id, text)
select id, 'Frame a street reflection in glass or water.' from challenge_categories where slug = 'street-style';

insert into challenge_templates (category_id, text)
select id, 'Show a calm nature detail close up.' from challenge_categories where slug = 'nature';

insert into challenge_templates (category_id, text)
select id, 'Tell a tiny story with three objects.' from challenge_categories where slug = 'daily-life';


