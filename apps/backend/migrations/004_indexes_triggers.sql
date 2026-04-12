-- Migration: 004_create_indexes_and_triggers.sql
-- Purpose: Add performance indexes and business logic triggers

-- Indexes for common queries
CREATE INDEX idx_bookings_user_status ON public.bookings (user_id, status);

CREATE INDEX idx_bookings_room_dates ON public.bookings (
    room_id,
    check_in_date,
    check_out_date
);

CREATE INDEX idx_bookings_payment_status ON public.bookings (payment_status);

CREATE INDEX idx_booking_requests_status ON public.booking_requests (status);

CREATE INDEX idx_booking_requests_warden ON public.booking_requests (warden_id);

CREATE INDEX idx_notifications_user_read ON public.notifications (user_id, read);

-- Improve query performance for room filters
CREATE INDEX idx_rooms_available_university ON public.rooms (is_available, university);

-- Composite index for common room queries
CREATE INDEX idx_rooms_type_price ON public.rooms(type, base_price);

-- Function to calculate average room rating
CREATE OR REPLACE FUNCTION get_room_average_rating(room_id UUID)
RETURNS FLOAT AS $$
BEGIN
  RETURN COALESCE(
    (SELECT AVG(CAST(rating AS FLOAT))
     FROM public.reviews
     WHERE room_id = $1),
    0
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to check room availability for date range
CREATE OR REPLACE FUNCTION is_room_available(
  room_id UUID,
  check_in_date DATE,
  check_out_date DATE
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1
    FROM public.bookings
    WHERE room_id = $1
      AND status != 'Cancelled'
      AND check_in_date < $3
      AND check_out_date > $2
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to calculate booking price
CREATE OR REPLACE FUNCTION calculate_booking_price(
  room_id UUID,
  check_in_date DATE,
  check_out_date DATE
)
RETURNS DECIMAL(10, 2) AS $$
DECLARE
  days_count INT;
  room_price DECIMAL(10, 2);
BEGIN
  days_count := check_out_date - check_in_date;
  room_price := (SELECT base_price FROM public.rooms WHERE id = $1);
  RETURN room_price * days_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Audit trigger to track booking changes
CREATE TABLE IF NOT EXISTS public.booking_audit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    booking_id UUID NOT NULL REFERENCES public.bookings (id) ON DELETE CASCADE,
    action VARCHAR(20) NOT NULL,
    changed_fields JSONB,
    changed_by UUID REFERENCES auth.users (id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_booking_audit_booking ON public.booking_audit (booking_id);

-- Create trigger function for audit
CREATE OR REPLACE FUNCTION audit_booking_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO public.booking_audit (booking_id, action, changed_fields, changed_by)
    VALUES (
      NEW.id,
      TG_OP,
      jsonb_object_agg(key, NEW.*)
        FILTER (WHERE (OLD.*)::TEXT != (NEW.*)::TEXT),
      auth.uid()
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.booking_audit (booking_id, action, changed_by)
    VALUES (OLD.id, TG_OP, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER booking_audit_trigger
AFTER UPDATE OR DELETE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION audit_booking_changes();

-- Function for soft delete
ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

ALTER TABLE public.contacts
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

CREATE OR REPLACE FUNCTION soft_delete_review(review_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.reviews SET deleted_at = NOW() WHERE id = review_id;
END;
$$ LANGUAGE plpgsql;

-- View for active bookings (not cancelled)
CREATE OR REPLACE VIEW public.active_bookings AS
SELECT *
FROM public.bookings
WHERE
    status != 'Cancelled';

-- View for available rooms
CREATE OR REPLACE VIEW public.available_rooms AS
SELECT r.*
FROM public.rooms r
WHERE
    r.is_available = true;

-- Statistics view for analytics
CREATE OR REPLACE VIEW public.booking_statistics AS
SELECT
    DATE(created_at) as booking_date,
    COUNT(*) as total_bookings,
    COUNT(
        CASE
            WHEN status = 'Confirmed' THEN 1
        END
    ) as confirmed_bookings,
    COUNT(
        CASE
            WHEN status = 'Pending' THEN 1
        END
    ) as pending_bookings,
    COUNT(
        CASE
            WHEN status = 'Cancelled' THEN 1
        END
    ) as cancelled_bookings,
    SUM(
        CASE
            WHEN payment_status = 'paid' THEN total_price
            ELSE 0
        END
    ) as total_revenue
FROM public.bookings
GROUP BY
    DATE(created_at);

-- Indexes on views for better performance
REFRESH MATERIALIZED VIEW IF EXISTS public.booking_statistics;