'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Beef, Plus, Trash2, PackageCheck, RotateCcw, Pencil } from 'lucide-react'
import {
  createRawMaterial, updateRawMaterial, deleteRawMaterial,
  createRawBatch, deleteRawBatch, setBatchStatus,
} from '@/lib/actions/inventory.actions'
import type { RawMaterial, RawBatch } from '@/types/inventory'

type MaterialWithBatches = RawMaterial & { raw_batches: RawBatch[] }

type Props = { materials: MaterialWithBatches[] }

const card   = 'bg-[#1f100a] border border-white/5 rounded-xl'
const input  = 'w-full bg-[#2a1610] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#C0392B] focus:border-[#C0392B]'
const label  = 'block text-xs font-medium mb-1 text-zinc-400'
const btnPri = 'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-[#C0392B] text-white hover:bg-[#a93226] transition-colors disabled:opacity-50'
const btnGho = 'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10 text-zinc-300 hover:bg-white/5 transition-colors disabled:opacity-50'

export default function RawMaterialsManager({ materials }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [showNewMaterial, setShowNewMaterial] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [batchFormFor, setBatchFormFor] = useState<string | null>(null)

  function run(fn: () => Promise<{ success: boolean; error?: string }>, after?: () => void) {
    setError('')
    startTransition(async () => {
      const res = await fn()
      if (!res.success) { setError(res.error ?? 'Error'); return }
      after?.()
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <button className={btnPri} onClick={() => setShowNewMaterial((v) => !v)}>
          <Plus className="size-4" /> Nueva materia prima
        </button>
      </div>

      {showNewMaterial && (
        <div className={`${card} p-5`}>
          <MaterialForm
            pending={pending}
            onCancel={() => setShowNewMaterial(false)}
            onSubmit={(values) => run(() => createRawMaterial(values), () => setShowNewMaterial(false))}
          />
        </div>
      )}

      {materials.length === 0 && !showNewMaterial && (
        <div className={`${card} p-12 text-center text-zinc-500`}>
          <Beef className="size-8 mx-auto mb-3 text-zinc-600" />
          <p>No hay materias primas todavía.</p>
        </div>
      )}

      {materials.map((m) => {
        const activeBatches = m.raw_batches.filter((b) => b.status === 'active')
        const totalPurchased = m.raw_batches.reduce((s, b) => s + Number(b.purchase_weight_kg), 0)
        const totalSellable  = activeBatches.reduce((s, b) => s + Number(b.sellable_weight_kg), 0)

        return (
          <div key={m.id} className={`${card} p-5 space-y-4`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Beef className="size-4 text-[#E57368]" />
                  <h3 className="font-semibold text-zinc-100">{m.name}</h3>
                </div>
                {m.notes && <p className="text-xs text-zinc-500 mt-1">{m.notes}</p>}
                <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-xs">
                  <span className="text-zinc-400">Coste medio: <b className="text-emerald-400">{Number(m.avg_cost_per_kg).toFixed(2)} €/kg</b></span>
                  <span className="text-zinc-400">Lotes activos: <b className="text-zinc-200">{activeBatches.length}</b></span>
                  <span className="text-zinc-400">Kg vendibles activos: <b className="text-zinc-200">{totalSellable.toFixed(1)}</b></span>
                  <span className="text-zinc-400">Kg comprados (total): <b className="text-zinc-200">{totalPurchased.toFixed(1)}</b></span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button className={btnGho} onClick={() => setEditId(editId === m.id ? null : m.id)}>
                  <Pencil className="size-3.5" /> Editar
                </button>
                <button
                  className={`${btnGho} border-rose-500/30 text-rose-400 hover:bg-rose-500/10`}
                  onClick={() => {
                    if (confirm(`¿Eliminar "${m.name}" y todos sus lotes?`)) run(() => deleteRawMaterial(m.id))
                  }}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>

            {editId === m.id && (
              <div className="border-t border-white/5 pt-4">
                <MaterialForm
                  pending={pending}
                  initial={{ name: m.name, notes: m.notes ?? '' }}
                  onCancel={() => setEditId(null)}
                  onSubmit={(values) => run(() => updateRawMaterial(m.id, values), () => setEditId(null))}
                />
              </div>
            )}

            {/* Lotes */}
            <div className="border-t border-white/5 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-zinc-300">Lotes</h4>
                <button className={btnGho} onClick={() => setBatchFormFor(batchFormFor === m.id ? null : m.id)}>
                  <Plus className="size-3.5" /> Recibir lote
                </button>
              </div>

              {batchFormFor === m.id && (
                <div className="mb-4 rounded-lg bg-[#2a1610] border border-white/10 p-4">
                  <BatchForm
                    pending={pending}
                    onCancel={() => setBatchFormFor(null)}
                    onSubmit={(values) => run(
                      () => createRawBatch({ ...values, raw_material_id: m.id }),
                      () => setBatchFormFor(null),
                    )}
                  />
                </div>
              )}

              {m.raw_batches.length === 0 ? (
                <p className="text-xs text-zinc-500">Sin lotes registrados.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-zinc-500 border-b border-white/5">
                        <th className="py-2 pr-3 font-medium">Lote</th>
                        <th className="py-2 pr-3 font-medium">Comprado</th>
                        <th className="py-2 pr-3 font-medium">Vendible</th>
                        <th className="py-2 pr-3 font-medium">Coste</th>
                        <th className="py-2 pr-3 font-medium">€/kg vend.</th>
                        <th className="py-2 pr-3 font-medium">Estado</th>
                        <th className="py-2 font-medium text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {m.raw_batches.map((b) => {
                        const perKg = Number(b.sellable_weight_kg) > 0
                          ? Number(b.purchase_cost) / Number(b.sellable_weight_kg) : 0
                        const isActive = b.status === 'active'
                        return (
                          <tr key={b.id} className={isActive ? '' : 'opacity-50'}>
                            <td className="py-2 pr-3 text-zinc-200">
                              {b.label || new Date(b.received_at).toLocaleDateString('es-ES')}
                              {b.supplier && <span className="block text-xs text-zinc-500">{b.supplier}</span>}
                            </td>
                            <td className="py-2 pr-3 text-zinc-400">{Number(b.purchase_weight_kg).toFixed(1)} kg</td>
                            <td className="py-2 pr-3 text-zinc-400">{Number(b.sellable_weight_kg).toFixed(1)} kg</td>
                            <td className="py-2 pr-3 text-zinc-400">{Number(b.purchase_cost).toFixed(2)} €</td>
                            <td className="py-2 pr-3 text-zinc-200 font-medium">{perKg.toFixed(2)} €</td>
                            <td className="py-2 pr-3">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                isActive ? 'bg-emerald-400/10 text-emerald-400' : 'bg-white/5 text-zinc-500'
                              }`}>
                                {isActive ? 'Activo' : 'Agotado'}
                              </span>
                            </td>
                            <td className="py-2">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  className={btnGho}
                                  title={isActive ? 'Marcar agotado' : 'Reactivar'}
                                  onClick={() => run(() => setBatchStatus(b.id, isActive ? 'depleted' : 'active'))}
                                >
                                  {isActive ? <PackageCheck className="size-3.5" /> : <RotateCcw className="size-3.5" />}
                                </button>
                                <button
                                  className={`${btnGho} border-rose-500/30 text-rose-400 hover:bg-rose-500/10`}
                                  onClick={() => { if (confirm('¿Eliminar lote?')) run(() => deleteRawBatch(b.id)) }}
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ----- Formularios ----------------------------------------------------
function MaterialForm({
  initial, pending, onSubmit, onCancel,
}: {
  initial?: { name: string; notes: string }
  pending: boolean
  onSubmit: (v: { name: string; notes: string | null }) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className={label}>Nombre *</label>
          <input className={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ternera, Cerdo..." />
        </div>
        <div>
          <label className={label}>Notas</label>
          <input className={input} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Opcional" />
        </div>
      </div>
      <div className="flex gap-2">
        <button className={btnPri} disabled={pending} onClick={() => onSubmit({ name, notes: notes || null })}>
          {pending ? 'Guardando...' : 'Guardar'}
        </button>
        <button className={btnGho} onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  )
}

function BatchForm({
  pending, onSubmit, onCancel,
}: {
  pending: boolean
  onSubmit: (v: {
    label: string | null; supplier: string | null
    purchase_weight_kg: number; sellable_weight_kg: number; purchase_cost: number
    received_at: string; notes: string | null
  }) => void
  onCancel: () => void
}) {
  const today = new Date().toISOString().slice(0, 10)
  const [label, setLabel] = useState('')
  const [supplier, setSupplier] = useState('')
  const [purchaseWeight, setPurchaseWeight] = useState('')
  const [sellableWeight, setSellableWeight] = useState('')
  const [cost, setCost] = useState('')
  const [receivedAt, setReceivedAt] = useState(today)
  const [notes, setNotes] = useState('')

  const perKg = Number(sellableWeight) > 0 ? Number(cost) / Number(sellableWeight) : 0

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div>
          <label className={label}>Etiqueta</label>
          <input className={input} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Falda 02/07" />
        </div>
        <div>
          <label className={label}>Proveedor</label>
          <input className={input} value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="Opcional" />
        </div>
        <div>
          <label className={label}>Fecha recepción</label>
          <input type="date" className={input} value={receivedAt} onChange={(e) => setReceivedAt(e.target.value)} />
        </div>
        <div>
          <label className={label}>Peso comprado (kg) *</label>
          <input type="number" step="0.001" min="0" className={input} value={purchaseWeight} onChange={(e) => setPurchaseWeight(e.target.value)} placeholder="20" />
        </div>
        <div>
          <label className={label}>Peso vendible (kg) *</label>
          <input type="number" step="0.001" min="0" className={input} value={sellableWeight} onChange={(e) => setSellableWeight(e.target.value)} placeholder="17" />
        </div>
        <div>
          <label className={label}>Coste total (€) *</label>
          <input type="number" step="0.01" min="0" className={input} value={cost} onChange={(e) => setCost(e.target.value)} placeholder="180" />
        </div>
      </div>

      <div>
        <label className={label}>Notas</label>
        <input className={input} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Opcional" />
      </div>

      {perKg > 0 && (
        <p className="text-xs text-zinc-400">
          Coste por kg vendible: <b className="text-emerald-400">{perKg.toFixed(2)} €/kg</b>
        </p>
      )}

      <div className="flex gap-2">
        <button
          className={btnPri}
          disabled={pending}
          onClick={() => onSubmit({
            label: label || null,
            supplier: supplier || null,
            purchase_weight_kg: Number(purchaseWeight),
            sellable_weight_kg: Number(sellableWeight),
            purchase_cost: Number(cost),
            received_at: receivedAt ? new Date(receivedAt).toISOString() : new Date().toISOString(),
            notes: notes || null,
          })}
        >
          {pending ? 'Guardando...' : 'Registrar lote'}
        </button>
        <button className={btnGho} onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  )
}
