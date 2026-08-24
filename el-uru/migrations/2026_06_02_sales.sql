-- =====================================================================
-- Ventas: añade canal (TIENDA / ONLINE) a `orders` y CASCADE en items.
-- Ejecutar en el SQL editor de Supabase.
-- =====================================================================

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS sale_channel text NOT NULL DEFAULT 'ONLINE'
  CHECK (sale_channel IN ('TIENDA', 'ONLINE'));

CREATE INDEX IF NOT EXISTS orders_sale_channel_idx ON public.orders(sale_channel);
CREATE INDEX IF NOT EXISTS orders_order_status_idx ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx   ON public.orders(created_at DESC);

-- order_items se borran junto con el order
ALTER TABLE public.order_items
  DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;

ALTER TABLE public.order_items
  ADD CONSTRAINT order_items_order_id_fkey
  FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;
