-- =====================================================================
-- Inventario por materia prima y lotes de compra.
--
-- Modelo:
--   raw_materials  -> tipo de materia prima (Ternera, Cerdo...) con coste
--                     medio por kg VENDIBLE, calculado desde los lotes activos.
--   raw_batches    -> cada compra real de una pieza (peso comprado, peso
--                     vendible aprox tras despiece y coste). La merma se
--                     captura con sellable_weight_kg.
--   products       -> cada corte referencia su materia prima; is_available
--                     controla la disponibilidad en web; unit_cost cubre el
--                     coste de elaborados por unidad (hamburguesas, chorizo...).
--
-- El coste medio se recalcula por trigger, no por request.
-- Ejecutar en el SQL editor de Supabase.
-- =====================================================================

-- ----- Materia prima --------------------------------------------------
CREATE TABLE IF NOT EXISTS public.raw_materials (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    notes           TEXT,
    avg_cost_per_kg NUMERIC(10, 3) NOT NULL DEFAULT 0.000,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----- Lotes de compra ------------------------------------------------
CREATE TABLE IF NOT EXISTS public.raw_batches (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    raw_material_id    UUID NOT NULL REFERENCES public.raw_materials(id) ON DELETE CASCADE,
    label              TEXT,
    supplier           TEXT,
    purchase_weight_kg NUMERIC(10, 3) NOT NULL CHECK (purchase_weight_kg > 0),
    sellable_weight_kg NUMERIC(10, 3) NOT NULL CHECK (sellable_weight_kg > 0),
    purchase_cost      NUMERIC(10, 2) NOT NULL CHECK (purchase_cost >= 0),
    status             TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'depleted')),
    received_at        TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes              TEXT,
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS raw_batches_material_idx ON public.raw_batches(raw_material_id);
CREATE INDEX IF NOT EXISTS raw_batches_status_idx   ON public.raw_batches(status);

-- ----- Cambios en products -------------------------------------------
ALTER TABLE public.products
    ADD COLUMN IF NOT EXISTS raw_material_id UUID REFERENCES public.raw_materials(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS is_available    BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS unit_cost       NUMERIC(10, 2);

CREATE INDEX IF NOT EXISTS products_raw_material_idx ON public.products(raw_material_id);

-- ----- Recálculo del coste medio por kg vendible ----------------------
-- Media ponderada de los lotes activos: SUM(coste) / SUM(kg vendibles).
CREATE OR REPLACE FUNCTION public.recalc_raw_material_cost(p_material_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.raw_materials m
    SET avg_cost_per_kg = COALESCE((
            SELECT SUM(b.purchase_cost) / NULLIF(SUM(b.sellable_weight_kg), 0)
            FROM public.raw_batches b
            WHERE b.raw_material_id = p_material_id
              AND b.status = 'active'
        ), 0),
        updated_at = CURRENT_TIMESTAMP
    WHERE m.id = p_material_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_recalc_raw_material_cost()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        PERFORM public.recalc_raw_material_cost(OLD.raw_material_id);
        RETURN OLD;
    END IF;

    PERFORM public.recalc_raw_material_cost(NEW.raw_material_id);

    IF (TG_OP = 'UPDATE' AND NEW.raw_material_id <> OLD.raw_material_id) THEN
        PERFORM public.recalc_raw_material_cost(OLD.raw_material_id);
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS raw_batches_recalc_cost ON public.raw_batches;
CREATE TRIGGER raw_batches_recalc_cost
    AFTER INSERT OR UPDATE OR DELETE ON public.raw_batches
    FOR EACH ROW EXECUTE FUNCTION public.trg_recalc_raw_material_cost();
