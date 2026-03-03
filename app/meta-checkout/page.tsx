'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

/**
 * Meta Shop Checkout URL Handler
 * 
 * Meta sends customers here with query params like:
 *   /meta-checkout?products=variant_ID1:2,variant_ID2:1
 * 
 * This page:
 * 1. Parses the product IDs and quantities from Meta's URL format
 * 2. Creates a Medusa cart
 * 3. Adds each item to the cart
 * 4. Redirects to our checkout page
 */

const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'https://urchin-app-u62qc.ondigitalocean.app'
const MEDUSA_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''
const REGION_ID = 'reg_01KJ4BB2Z46YY1HWG0Q2N4KBVX'

interface MetaProduct {
  variantId: string
  quantity: number
}

function parseMetaProducts(productsParam: string): MetaProduct[] {
  const items: MetaProduct[] = []
  if (!productsParam) return items
  
  const productPairs = productsParam.split(',')
  
  for (const pair of productPairs) {
    const lastColonIndex = pair.lastIndexOf(':')
    if (lastColonIndex === -1) continue
    
    const variantId = decodeURIComponent(pair.substring(0, lastColonIndex).trim())
    const quantity = parseInt(pair.substring(lastColonIndex + 1).trim(), 10)
    
    if (variantId && !isNaN(quantity) && quantity > 0) {
      items.push({ variantId, quantity })
    }
  }
  
  return items
}

async function medusaFetch(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(MEDUSA_PUBLISHABLE_KEY && { 'x-publishable-api-key': MEDUSA_PUBLISHABLE_KEY }),
    ...(options.headers as Record<string, string> || {}),
  }
  
  const res = await fetch(`${MEDUSA_BACKEND_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })
  
  if (!res.ok) {
    const errBody = await res.text()
    throw new Error(`Medusa API error ${res.status}: ${errBody}`)
  }
  
  return res.json()
}

function MetaCheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState('Procesando tu pedido...')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function processMetaCheckout() {
      try {
        const productsParam = searchParams.get('products') || ''
        const couponParam = searchParams.get('coupon') || ''
        
        if (!productsParam) {
          setError('No se recibieron productos. Por favor intenta de nuevo desde Instagram o Facebook.')
          return
        }
        
        const items = parseMetaProducts(productsParam)
        
        if (items.length === 0) {
          setError('No se pudieron procesar los productos. Por favor intenta de nuevo.')
          return
        }
        
        setStatus(`Agregando ${items.length} producto(s) a tu carrito...`)
        
        // 1. Create a new cart
        const cartRes = await medusaFetch('/store/carts', {
          method: 'POST',
          body: JSON.stringify({ region_id: REGION_ID }),
        })
        
        const cartId = cartRes.cart?.id
        if (!cartId) throw new Error('No se pudo crear el carrito')
        
        // Store cart ID in localStorage for the checkout flow
        if (typeof window !== 'undefined') {
          localStorage.setItem('_medusa_cart_id', cartId)
        }
        
        // 2. Add each item to cart
        for (const item of items) {
          setStatus(`Agregando producto al carrito...`)
          await medusaFetch(`/store/carts/${cartId}/line-items`, {
            method: 'POST',
            body: JSON.stringify({
              variant_id: item.variantId,
              quantity: item.quantity,
            }),
          })
        }
        
        // 3. If coupon provided, apply it
        if (couponParam) {
          try {
            await medusaFetch(`/store/carts/${cartId}`, {
              method: 'POST',
              body: JSON.stringify({
                discounts: [{ code: couponParam }],
              }),
            })
          } catch (e) {
            console.warn('Could not apply coupon:', e)
          }
        }
        
        setStatus('Redirigiendo al checkout...')
        
        // 4. Redirect to checkout
        router.push('/checkout')
        
      } catch (err: unknown) {
        console.error('Meta checkout error:', err)
        setError(
          'Hubo un problema procesando tu pedido. Por favor visita nuestra tienda directamente.'
        )
      }
    }
    
    processMetaCheckout()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
      <div className="text-center max-w-md mx-auto p-8">
        {error ? (
          <>
            <div className="text-red-600 text-xl mb-4">⚠️</div>
            <h1 className="text-xl font-semibold text-[#2d2419] mb-3">
              Error en el pedido
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <a
              href="/shop"
              className="inline-block px-6 py-3 bg-[#C5A065] text-white rounded-lg hover:bg-[#b08e55] transition-colors"
            >
              Ir a la tienda
            </a>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C5A065] mx-auto mb-6"></div>
            <h1 className="text-xl font-semibold text-[#2d2419] mb-3">
              {status}
            </h1>
            <p className="text-gray-500 text-sm">
              Estamos preparando tu carrito desde Instagram/Facebook
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default function MetaCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C5A065] mx-auto mb-6"></div>
            <p className="text-[#2d2419]">Cargando...</p>
          </div>
        </div>
      }
    >
      <MetaCheckoutContent />
    </Suspense>
  )
}
