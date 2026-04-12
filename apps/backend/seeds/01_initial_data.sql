-- This file will be used to seed initial test data
-- Add sample rooms, users, etc. for development

-- Sample rooms (public data doesn't need user association)
insert into public.rooms (room_number, type, base_price, amenities, university, capacity, is_available)
values
  ('101', 'Single', 150, '{"WiFi", "AC", "Desk"}', 'MIT', 1, true),
  ('102', 'Double', 250, '{"WiFi", "AC", "Desk", "Kitchenette"}', 'MIT', 2, true),
  ('201', 'Suite', 400, '{"WiFi", "AC", "Kitchen", "Lounge", "Bathroom"}', 'MIT', 4, true)
on conflict do nothing;
