import { useContext } from 'react'
import { CartContext } from '../contexts/cart-context'

export function useCart() {
  return useContext(CartContext)
}
