import { CartFlow } from './cart-flow'
import { ProductList } from './product-list'

export function App() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-355 flex-col items-center gap-y-10 px-4 py-2">
      <ProductList />
      <CartFlow />
    </div>
  )
}
