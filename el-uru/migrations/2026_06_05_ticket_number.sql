-- =====================================================================
-- Ticket Number: añade ticket_number a orders para identificación fácil
-- Ejecutar en el SQL editor de Supabase.
-- =====================================================================

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS ticket_number integer;

-- Crear índice para búsquedas rápidas por ticket
CREATE INDEX IF NOT EXISTS orders_ticket_number_idx ON public.orders(ticket_number);

-- Crear secuencia para generar números de ticket secuenciales
CREATE SEQUENCE IF NOT EXISTS ticket_number_seq START 1;

-- Inicializar ticket_number para pedidos existentes (opcional)
-- UPDATE public.orders SET ticket_number = nextval('ticket_number_seq') WHERE ticket_number IS NULL;
