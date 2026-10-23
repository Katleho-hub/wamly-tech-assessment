import { useId } from 'react'

import { type Product } from './api/fakestore/products'
import { formatPrice } from './lib/format-price'
import { resizedImageSrcSet, resizedImageUrl } from './lib/image-url'

type ProductCardProps = {
  product: Product
  inCart: boolean
  disabled: boolean
  // Above-the-fold cards load their image eagerly at high priority, since one
  // of them is likely the Largest Contentful Paint element
  priority?: boolean
  onAddToCart: () => void
}

export function ProductCard({
  product,
  inCart,
  disabled,
  priority = false,
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
          src={resizedImageUrl(product.image, 216)}
          // 1x/2x/3x of the 144px mobile max and 1x/2x of the 216px desktop max
          srcSet={resizedImageSrcSet(product.image, [144, 216, 288, 432])}
          // Rendered width: at most 143px on mobile, a third of the viewport
          // from sm, and a quarter of max-w-5xl from lg, minus padding and gaps
          sizes="(min-width: 1024px) 216px, (min-width: 640px) calc(33vw - 50px), min(143px, calc(50vw - 50px))"
          alt=""
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
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
