import { CartFlow } from './cart-flow'
import { ProductList } from './product-list'

export function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-y-10 py-2">
      <ProductList />
      <CartFlow />
    </div>
  )
}
