import { useEffect, useMemo, useState } from 'react'
import { CartContext } from './cart-context'

const STORAGE_KEY = 'wasabi-cart'

function readInitialCart() {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function clampQuantity(quantity) {
  const nextQuantity = Number(quantity)
  if (Number.isNaN(nextQuantity) || nextQuantity < 1) {
    return 1
  }

  return Math.floor(nextQuantity)
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(readInitialCart)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems))
  }, [cartItems])

  function addToCart(product) {
    setCartItems((current) => {
      const existingItem = current.find((item) => item.id === product.id)

      if (existingItem) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }

      return [
        ...current,
        {
          category: product.category,
          id: product.id,
          name: product.name,
          photoUrl: product.photoUrl,
          price: product.price,
          quantity: 1,
        },
      ]
    })
  }

  function removeFromCart(productId) {
    setCartItems((current) => current.filter((item) => item.id !== productId))
  }

  function updateQuantity(productId, quantity) {
    setCartItems((current) =>
      current.map((item) =>
        item.id === productId ? { ...item, quantity: clampQuantity(quantity) } : item,
      ),
    )
  }

  function increaseQuantity(productId) {
    setCartItems((current) =>
      current.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    )
  }

  function decreaseQuantity(productId) {
    setCartItems((current) =>
      current
        .map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  function clearCart() {
    setCartItems([])
  }

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const cartCount = cartItems.length
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const value = useMemo(
    () => ({
      addToCart,
      cartCount,
      cartItems,
      clearCart,
      decreaseQuantity,
      increaseQuantity,
      removeFromCart,
      totalItems,
      totalPrice,
      updateQuantity,
    }),
    [cartCount, cartItems, totalItems, totalPrice],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
