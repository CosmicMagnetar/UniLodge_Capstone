-- User Profiles RLS Policies
create policy "Users can view their own profile"
  on public.user_profiles
  for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.user_profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.user_profiles
  for select
  using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and role = 'ADMIN'
    )
  );
