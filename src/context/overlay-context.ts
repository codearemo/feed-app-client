import { createContext } from 'react'
import type { ReactNode } from 'react'

export type OverlaySize = 'sm' | 'md' | 'lg' | 'xl'
export type DrawerSide = 'left' | 'right'

export type ModalOptions = {
  id?: string
  title?: string
  children: ReactNode
  size?: OverlaySize
  onClose?: () => void
}

export type DrawerOptions = {
  id?: string
  title?: string
  children: ReactNode
  side?: DrawerSide
  onClose?: () => void
}

export type ActiveOverlay =
  | ({ type: 'modal'; id: string } & ModalOptions)
  | ({ type: 'drawer'; id: string } & DrawerOptions)

export type OverlayContextValue = {
  activeOverlay: ActiveOverlay | null
  openModal: (options: ModalOptions) => string
  openDrawer: (options: DrawerOptions) => string
  closeOverlay: (id?: string) => void
  closeAll: () => void
  isOpen: (id: string) => boolean
}

export const OverlayContext = createContext<OverlayContextValue | null>(null)

export function createOverlayId() {
  return crypto.randomUUID()
}
