-- Rooms RLS Policies
create policy "Anyone can view available rooms"
  on public.rooms
  for select
  using (is_available = true);

create policy "Admins can manage all rooms"
  on public.rooms
  for all
  using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and role = 'ADMIN'
    )
  );

create policy "Wardens can view rooms in their university"
  on public.rooms
  for select
  using (
    exists (
      select 1 from public.user_profiles up
      where up.id = auth.uid() and up.role = 'WARDEN'
    )
  );
