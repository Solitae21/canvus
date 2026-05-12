
'use client'

import { Provider } from 'react-redux'
import { store } from '../store'
import { ModalRoot } from '@/lib/modal'

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      {children}
      <ModalRoot />
    </Provider>
  )
}
