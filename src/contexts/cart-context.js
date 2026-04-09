import { createContext } from 'react'

export const CartContext = createContext({
  addToCart: () => {},
  cartCount: 0,
  cartItems: [],
  clearCart: () => {},
  decreaseQuantity: () => {},
  increaseQuantity: () => {},
  removeFromCart: () => {},
  totalItems: 0,
  totalPrice: 0,
  updateQuantity: () => {},
})
