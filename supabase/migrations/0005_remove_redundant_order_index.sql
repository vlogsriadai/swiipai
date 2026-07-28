-- order_number already has a unique constraint from the core schema.
drop index if exists public.orders_order_number_unique;

