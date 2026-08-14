"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import { Listing } from "@/lib/marketplace"

export interface CartItem {
  id: string // listingId
  title: string
  price: number
  image?: string | null
  type: string
  sellerId: string
  sellerName: string
  quantity: number
}

interface PendingConflict {
  listing: Listing
  ownerName: string
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  sellerId: string | null
  sellerName: string | null
  itemCount: number
  subtotal: number
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
  addItem: (listing: Listing, ownerName: string, quantity?: number) => { success: boolean; conflict?: boolean }
  removeItem: (listingId: string) => void
  updateQuantity: (listingId: string, quantity: number) => void
  clearCart: () => void
  pendingConflict: PendingConflict | null
  resolveConflict: (replace: boolean) => void
  isItemInCart: (listingId: string) => boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = "jaliz_marketplace_cart"

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [pendingConflict, setPendingConflict] = useState<PendingConflict | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setItems(parsed)
        }
      }
    } catch (err) {
      console.error("Failed to load cart from storage", err)
    } finally {
      setIsInitialized(true)
    }
  }, [])

  // Save cart to localStorage on changes
  useEffect(() => {
    if (!isInitialized) return
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    } catch (err) {
      console.error("Failed to save cart to storage", err)
    }
  }, [items, isInitialized])

  const sellerId = items.length > 0 ? items[0].sellerId : null
  const sellerName = items.length > 0 ? items[0].sellerName : null

  const itemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0)
  }, [items])

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [items])

  const isItemInCart = (listingId: string) => {
    return items.some((i) => i.id === listingId)
  }

  const addItem = (
    listing: Listing,
    ownerName: string,
    quantity = 1,
  ): { success: boolean; conflict?: boolean } => {
    if (listing.mode !== "sell" || typeof listing.price !== "number" || listing.price <= 0) {
      return { success: false }
    }

    const currentSellerId = items.length > 0 ? items[0].sellerId : null

    // Check single-seller constraint
    if (currentSellerId && currentSellerId !== listing.ownerId) {
      setPendingConflict({
        listing,
        ownerName,
        quantity,
      })
      return { success: false, conflict: true }
    }

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === listing.id)
      if (existingIndex > -1) {
        const updated = [...prev]
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        }
        return updated
      } else {
        return [
          ...prev,
          {
            id: listing.id,
            title: listing.title,
            price: listing.price!,
            image: listing.image,
            type: listing.type,
            sellerId: listing.ownerId,
            sellerName: ownerName || "فروشگاه",
            quantity,
          },
        ]
      }
    })

    return { success: true }
  }

  const removeItem = (listingId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== listingId))
  }

  const updateQuantity = (listingId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(listingId)
      return
    }
    setItems((prev) =>
      prev.map((item) => (item.id === listingId ? { ...item, quantity } : item)),
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const resolveConflict = (replace: boolean) => {
    if (replace && pendingConflict) {
      const { listing, ownerName, quantity } = pendingConflict
      setItems([
        {
          id: listing.id,
          title: listing.title,
          price: listing.price!,
          image: listing.image,
          type: listing.type,
          sellerId: listing.ownerId,
          sellerName: ownerName || "فروشگاه",
          quantity,
        },
      ])
    }
    setPendingConflict(null)
  }

  return (
    <CartContext.Provider
      value={{
        items,
        sellerId,
        sellerName,
        itemCount,
        subtotal,
        isCartOpen,
        setIsCartOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        pendingConflict,
        resolveConflict,
        isItemInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
