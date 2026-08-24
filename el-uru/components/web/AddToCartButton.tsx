'use client'
import { useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import AddToCartModal from './AddToCartModal'

type Props = {
  productId:   string
  productName: string
  price:       number
  productType: 'UNIT' | 'WEIGHT'
  imageUrl?:   string | null
}

export default function AddToCartButton({ productId, productName, price, productType, imageUrl = null }: Props) {
  const [open, setOpen] = useState(false)

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setOpen(true)
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="w-10 h-10 rounded-full text-white
          flex items-center justify-center hover:bg-gray-800
          transition-colors"
        style={{ background: '#1a1a1a' }}
        aria-label={`Añadir ${productName} al carrito`}
      >
        <ShoppingCart className="w-4 h-4" />
      </button>

      <AddToCartModal
        open={open}
        onClose={() => setOpen(false)}
        productId={productId}
        productName={productName}
        productType={productType}
        price={price}
        imageUrl={imageUrl}
      />
    </>
  )
}
