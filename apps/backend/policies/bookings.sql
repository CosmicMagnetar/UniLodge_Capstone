-- Bookings RLS Policies
create policy "Users can view their own bookings"
  on public.bookings
  for select
  using (auth.uid() = user_id);

create policy "Users can create bookings for themselves"
  on public.bookings
  for insert
  with check (auth.uid() = user_id);

create policy "Admins can view all bookings"
  on public.bookings
  for select
  using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and role = 'ADMIN'
    )
  );
