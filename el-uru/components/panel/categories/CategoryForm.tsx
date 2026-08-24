'use client'
import { useState }    from 'react'
import { useRouter }   from 'next/navigation'
import { useForm }     from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z }           from 'zod'
import { createCategory, updateCategory } from '@/lib/actions/categories.actions'

const CategorySchema = z.object({
  name_es:    z.string().min(2, 'Mínimo 2 caracteres'),
  name_ca:    z.string().min(2, 'Mínimo 2 caracteres'),
  slug:       z.string().min(2).regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  sort_order: z.number().int().min(0),
})

type FormInput = z.infer<typeof CategorySchema>

type Category = {
  id:         string
  name_es:    string
  name_ca:    string
  slug:       string
  sort_order: number
}

type Props = {
  category?: Category
  locale:    string
  nextOrder: number
}

export default function CategoryForm({ category, locale, nextOrder }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  const { register, handleSubmit, setValue, formState: { errors } } =
    useForm<FormInput>({
      resolver: zodResolver(CategorySchema),
      defaultValues: category ? {
        name_es:    category.name_es,
        name_ca:    category.name_ca,
        slug:       category.slug,
        sort_order: category.sort_order,
      } : {
        sort_order: nextOrder,
      },
    })

  function handleNameChange(value: string) {
    if (!category) {
      const slug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      setValue('slug', slug)
    }
  }

  async function onSubmit(data: FormInput) {
    setSaving(true)
    setError('')

    const result = category
      ? await updateCategory(category.id, data)
      : await createCategory(data)

    if (!result.success) {
      setError(result.error ?? 'Error al guardar')
      setSaving(false)
      return
    }

    router.push(`/${locale}/panel/categorias`)
    router.refresh()
  }

  const inputClass = "w-full bg-[#2a1610] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#C0392B] focus:border-[#C0392B]"
  const labelClass = "block text-sm font-medium mb-1.5 text-zinc-300"
  const errorClass = "text-xs mt-1 text-rose-400"

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-[#1f100a] border border-white/5 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-base text-zinc-100">Información</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Nombre (Español) *</label>
            <input
              {...register('name_es')}
              className={inputClass}
              onChange={(e) => {
                register('name_es').onChange(e)
                handleNameChange(e.target.value)
              }}
            />
            {errors.name_es && <p className={errorClass}>{errors.name_es.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Nom (Català) *</label>
            <input {...register('name_ca')} className={inputClass} />
            {errors.name_ca && <p className={errorClass}>{errors.name_ca.message}</p>}
          </div>
        </div>

        <div>
          <label className={labelClass}>Slug (URL) *</label>
          <input {...register('slug')} className={inputClass} />
          {errors.slug && <p className={errorClass}>{errors.slug.message}</p>}
          <p className="text-xs text-zinc-500 mt-1">
            Se genera automáticamente. Ej: ternera
          </p>
        </div>

        <div className="w-32">
          <label className={labelClass}>Orden en menú</label>
          <input
            {...register('sort_order', { valueAsNumber: true })}
            type="number"
            min="0"
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3 rounded-lg bg-[#C0392B] hover:bg-[#a93226] text-white font-semibold
            transition-colors disabled:opacity-50"
        >
          {saving ? 'Guardando...' : category ? 'Guardar cambios' : 'Crear categoría'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-8 py-3 rounded-lg border border-white/10 font-medium text-zinc-300
            hover:bg-white/5 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
