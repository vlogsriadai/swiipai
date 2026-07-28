-- A browser retry must never create multiple payment orders.
create unique index if not exists orders_order_number_unique
  on public.orders(order_number);

