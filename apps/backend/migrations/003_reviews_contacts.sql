-- Create reviews table
create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating int not null constraint valid_rating check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  unique(room_id, user_id)
);

-- Create contacts table
create table if not exists public.contacts (
  id uuid primary key default uuid_generate_v4(),
  name varchar(255) not null,
  email varchar(255) not null,
  subject varchar(255),
  message text not null,
  status varchar(20) default 'new',
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Create notifications table
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title varchar(255) not null,
  message text not null,
  type varchar(50),
  read boolean default false,
  created_at timestamp default now()
);

-- Enable RLS
alter table public.reviews enable row level security;
alter table public.contacts enable row level security;
alter table public.notifications enable row level security;

-- Create indexes
create index idx_reviews_room on public.reviews(room_id);
create index idx_reviews_user on public.reviews(user_id);
create index idx_notifications_user on public.notifications(user_id);
create index idx_notifications_read on public.notifications(read);
