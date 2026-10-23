import { useId } from 'react'

import { type Product } from './api/fakestore/products'
import { formatPrice } from './lib/format-price'

type ProductCardProps = {
  product: Product
  inCart: boolean
  disabled: boolean
  onAddToCart: () => void
}

export function ProductCard({
  product,
  inCart,
  disabled,
  onAddToCart,
}: ProductCardProps) {
  const titleId = useId()

  return (
    <article
      aria-labelledby={titleId}
      className="flex h-full flex-col overflow-hidden rounded-[10px] border border-card-border bg-white text-ink"
    >
      <figure className="pulse flex aspect-square max-h-44 items-center justify-center border-b border-card-border bg-card-media p-4 md:aspect-4/3 md:max-h-40">
        <img
          src={product.image}
          alt=""
          height="176"
          width="256"
          className="size-full object-contain mix-blend-multiply"
        />
      </figure>

      <header className="flex flex-1 flex-col gap-0.5 px-2.5 pt-2.5">
        <h3
          id={titleId}
          className="text-sm font-semibold"
          title={product.title}
        >
          {product.title}
        </h3>
        <p className="text-sm">
          <data value={product.price}>{formatPrice(product.price)}</data>
        </p>
      </header>

      <footer className="p-2.5">
        <button
          type="button"
          className="flex h-11 w-full items-center justify-center gap-1 rounded-lg border border-ink bg-white px-1.5 text-[13px] font-semibold disabled:opacity-50"
          disabled={disabled}
          onClick={onAddToCart}
        >
          {inCart && (
            <svg
              aria-hidden="true"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12l5 5 9-10" />
            </svg>
          )}
          {inCart ? 'Added' : 'Add to cart'}
          <span className="sr-only">
            {inCart ? `, add another ${product.title}` : `, ${product.title}`}
          </span>
        </button>
      </footer>
    </article>
  )
}

// Placeholder matching ProductCard's layout, shown while products load
export function ProductCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex h-full animate-pulse flex-col overflow-hidden rounded-[10px] border border-card-border bg-white motion-reduce:animate-none"
    >
      <div className="aspect-square max-h-44 border-b border-card-border bg-card-media md:aspect-4/3 md:max-h-40" />

      <div className="flex flex-1 flex-col gap-0.5 px-2.5 pt-2.5">
        {/* Each row is one text-sm line tall, like the title and price */}
        <div className="flex h-5 items-center">
          <div className="h-3 w-3/4 rounded bg-card-media" />
        </div>
        <div className="flex h-5 items-center">
          <div className="h-3 w-1/3 rounded bg-card-media" />
        </div>
      </div>

      <div className="p-2.5">
        <div className="h-11 rounded-lg bg-card-media" />
      </div>
    </div>
  )
}
