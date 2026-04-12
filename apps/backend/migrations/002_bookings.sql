-- Create bookings table
create table if not exists public.bookings (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  check_in_date date not null,
  check_out_date date not null,
  status booking_status default 'Pending',
  payment_status payment_status default 'pending',
  total_price decimal(10, 2),
  notes text,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  constraint valid_dates check (check_out_date > check_in_date)
);

-- Create booking_requests table
create table if not exists public.booking_requests (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  check_in_date date not null,
  check_out_date date not null,
  message text,
  status varchar(20) default 'pending',
  warden_id uuid references auth.users(id) on delete set null,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Enable RLS
alter table public.bookings enable row level security;
alter table public.booking_requests enable row level security;

-- Create indexes
create index idx_bookings_user on public.bookings(user_id);
create index idx_bookings_room on public.bookings(room_id);
create index idx_bookings_dates on public.bookings(check_in_date, check_out_date);
create index idx_booking_requests_user on public.booking_requests(user_id);
create index idx_booking_requests_room on public.booking_requests(room_id);
