import { useContext } from 'react'
import { OverlayContext } from '../context/overlay-context'

export function useOverlay() {
  const context = useContext(OverlayContext)

  if (!context) {
    throw new Error('useOverlay must be used within OverlayProvider')
  }

  return context
}
