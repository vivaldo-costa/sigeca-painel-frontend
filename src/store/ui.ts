import { create } from 'zustand'

interface UiState {
  sidebarAberta: boolean
  abrirSidebar: () => void
  fecharSidebar: () => void
  alternarSidebar: () => void
}

/** Só é relevante em ecrãs pequenos (< lg) — em desktop o sidebar fica sempre visível. */
export const useUiStore = create<UiState>((set) => ({
  sidebarAberta: false,
  abrirSidebar: () => set({ sidebarAberta: true }),
  fecharSidebar: () => set({ sidebarAberta: false }),
  alternarSidebar: () => set((s) => ({ sidebarAberta: !s.sidebarAberta })),
}))
