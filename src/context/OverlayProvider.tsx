import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { Drawer } from '../components/overlay/Drawer'
import { Modal } from '../components/overlay/Modal'
import {
  OverlayContext,
  createOverlayId,
  type ActiveOverlay,
  type DrawerOptions,
  type ModalOptions,
  type OverlayContextValue,
} from './overlay-context'

export function OverlayProvider({ children }: { children: ReactNode }) {
  const [activeOverlay, setActiveOverlay] = useState<ActiveOverlay | null>(null)

  const closeOverlay = useCallback((id?: string) => {
    setActiveOverlay((current) => {
      if (!current) {
        return null
      }

      if (id && current.id !== id) {
        return current
      }

      current.onClose?.()
      return null
    })
  }, [])

  const closeAll = useCallback(() => {
    setActiveOverlay((current) => {
      current?.onClose?.()
      return null
    })
  }, [])

  const openModal = useCallback((options: ModalOptions): string => {
    const id = options.id ?? createOverlayId()
    setActiveOverlay({ type: 'modal', ...options, id })
    return id
  }, [])

  const openDrawer = useCallback((options: DrawerOptions): string => {
    const id = options.id ?? createOverlayId()
    setActiveOverlay({ type: 'drawer', ...options, id })
    return id
  }, [])

  const isOpen = useCallback(
    (id: string) => activeOverlay?.id === id,
    [activeOverlay],
  )

  const value = useMemo<OverlayContextValue>(
    () => ({
      activeOverlay,
      openModal,
      openDrawer,
      closeOverlay,
      closeAll,
      isOpen,
    }),
    [activeOverlay, openModal, openDrawer, closeOverlay, closeAll, isOpen],
  )

  const handleClose = useCallback(() => {
    closeOverlay()
  }, [closeOverlay])

  return (
    <OverlayContext.Provider value={value}>
      {children}
      {activeOverlay?.type === 'modal' ? (
        <Modal
          title={activeOverlay.title}
          size={activeOverlay.size}
          onClose={handleClose}
        >
          {activeOverlay.children}
        </Modal>
      ) : null}
      {activeOverlay?.type === 'drawer' ? (
        <Drawer
          title={activeOverlay.title}
          side={activeOverlay.side}
          onClose={handleClose}
        >
          {activeOverlay.children}
        </Drawer>
      ) : null}
    </OverlayContext.Provider>
  )
}
