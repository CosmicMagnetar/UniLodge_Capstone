-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgvector";

-- Create schemas
create schema if not exists public;

-- Create roles enum
create type user_role as enum ('GUEST', 'WARDEN', 'ADMIN');
create type booking_status as enum ('Confirmed', 'Pending', 'Cancelled');
create type payment_status as enum ('paid', 'pending', 'failed');
create type room_type as enum ('Single', 'Double', 'Suite');

-- Create user_profiles table (extends auth.users)
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name varchar(255),
  role user_role default 'GUEST',
  avatar_url varchar(500),
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Create rooms table
create table if not exists public.rooms (
  id uuid primary key default uuid_generate_v4(),
  room_number varchar(50) unique not null,
  type room_type not null,
  base_price decimal(10, 2) not null,
  amenities text[] default '{}',
  rating float default 0,
  image_url varchar(500),
  is_available boolean default true,
  university varchar(255),
  description text,
  capacity int default 1,
  available_from date,
  available_to date,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Enable RLS
alter table public.user_profiles enable row level security;
alter table public.rooms enable row level security;

-- Create indexes
create index idx_rooms_university on public.rooms(university);
create index idx_rooms_type on public.rooms(type);
create index idx_rooms_available on public.rooms(is_available);
create index idx_user_profiles_role on public.user_profiles(role);

comment on table public.user_profiles is 'User profile information extending Supabase auth.users';
comment on table public.rooms is 'Available rooms for booking';
