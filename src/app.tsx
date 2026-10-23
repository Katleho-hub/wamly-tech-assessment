import { type Product, useProduct, useProducts } from './api/fakestore/products'

export function App() {
  const { data: products, ...rest } = useProducts()

  const { data: product1, ...restProduct } = useProduct(999)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-y-10 py-2">
      <div>
        <div className="my-4 text-3xl font-bold underline">Products</div>
        {rest.isError && (
          <div className="text-red-500">
            Error fetching products: {rest.error?.message}
          </div>
        )}
        {rest.isPending && <div>Loading products...</div>}
        {!!products && (
          <ul>
            {products.map((product: Product) => (
              <li key={product.id}>
                {product.title} - ${product.price}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <div className="my-4 text-3xl font-bold underline">
          Product 1 Details
        </div>
        {restProduct.isError && (
          <div className="text-red-500">
            Error fetching product 1: {restProduct.error?.message}
          </div>
        )}
        {restProduct.isPending && <div>Loading product 1...</div>}
        {!!product1 && (
          <div>
            <h2 className="text-2xl font-bold">{product1.title}</h2>
            <p className="text-lg">${product1.price}</p>
          </div>
        )}
      </div>
    </div>
  )
}
