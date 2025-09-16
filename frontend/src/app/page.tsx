import { Sidebar } from '@/components/layout/sidebar'
import { POSInterface } from '@/components/pos/pos-interface'

export default function HomePage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <POSInterface />
      </main>
    </div>
  )
}
