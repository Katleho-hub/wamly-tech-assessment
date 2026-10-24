import { type ReactNode, useId, useState } from 'react'

import { type Product } from '../api/fakestore/products'
import { type CartActionCallbacks } from '../use-cart-flow'
import { formatPrice } from '../utils/format-price'
import { resizedImageSrcSet, resizedImageUrl } from '../utils/resized-image'
import { AlertIcon } from './icons/alert-icon'
import { CheckIcon } from './icons/check-icon'
import { SpinnerIcon } from './icons/spinner-icon'

type ButtonState = 'idle' | 'adding' | 'added' | 'error'

const buttonStyles: Record<ButtonState, string> = {
  idle: 'border-brand bg-brand text-white',
  adding: 'border-transparent bg-brand/70 text-white',
  added: 'border-line bg-white text-body',
  error: 'border-brand bg-brand text-white',
}

const buttonLabels: Record<ButtonState, (quantity: number) => ReactNode> = {
  idle: () => 'Add to cart',
  adding: () => 'Adding...',
  added: (quantity) => (
    <>
      <span className="whitespace-nowrap">Added ({quantity}) ·</span>{' '}
      <span className="whitespace-nowrap">Add another</span>
    </>
  ),
  error: () => 'Try again',
}

type ProductCardProps = {
  product: Product
  quantity: number
  disabled: boolean
  // Above-the-fold cards load their image eagerly at high priority, since one
  // of them is likely the Largest Contentful Paint element
  priority?: boolean
  onAddToCart: (callbacks: CartActionCallbacks) => void
}

export function ProductCard({
  product,
  quantity,
  disabled,
  priority = false,
  onAddToCart,
}: ProductCardProps) {
  const titleId = useId()
  // This card's own request; other cards' requests only disable the button
  const [status, setStatus] = useState<'idle' | 'adding' | 'error'>('idle')

  const state: ButtonState =
    status !== 'idle' ? status : quantity > 0 ? 'added' : 'idle'

  function handleAddToCart() {
    setStatus('adding')
    onAddToCart({
      onSuccess: () => setStatus('idle'),
      onError: () => setStatus('error'),
    })
  }

  return (
    <article
      aria-labelledby={titleId}
      className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white text-body"
    >
      <figure className="pulse flex aspect-square max-h-44 items-center justify-center border-b border-line bg-card-media p-4 md:aspect-4/3 md:max-h-40">
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

      <header className="flex flex-1 flex-col gap-0.5 px-3 pt-3">
        <p className="mb-1 self-start rounded-full border border-line bg-tag px-2 py-0.5 text-[11px] leading-4 font-medium text-muted capitalize">
          {product.category}
        </p>
        <h3
          id={titleId}
          className="text-sm font-semibold text-navy"
          title={product.title}
        >
          {product.title}
        </h3>
        <p className="mt-auto text-sm">
          <data value={product.price}>{formatPrice(product.price)}</data>
        </p>
      </header>

      <footer className="p-3">
        <button
          type="button"
          className={`flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border px-1.5 text-center text-[13px] leading-tight font-semibold disabled:cursor-not-allowed ${buttonStyles[state]}`}
          disabled={disabled || status === 'adding'}
          onClick={handleAddToCart}
        >
          {state === 'adding' && (
            <SpinnerIcon className="size-3.5 shrink-0 animate-spin motion-reduce:animate-none" />
          )}
          {state === 'added' && <CheckIcon className="size-3.5 shrink-0" />}
          <span>{buttonLabels[state](quantity)}</span>
          <span className="sr-only">, {product.title}</span>
        </button>

        {status === 'error' && (
          <p role="alert" className="mt-2 flex gap-1.5 text-xs">
            <AlertIcon className="mt-px size-3.5 shrink-0" />
            Couldn't add to cart. Check your connection.
          </p>
        )}
      </footer>
    </article>
  )
}

// Placeholder matching ProductCard's layout, shown while products load
export function ProductCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex h-full animate-pulse flex-col overflow-hidden rounded-2xl border border-line bg-white motion-reduce:animate-none"
    >
      <div className="aspect-square max-h-44 border-b border-line bg-card-media md:aspect-4/3 md:max-h-40" />

      <div className="flex flex-1 flex-col gap-0.5 px-3 pt-3">
        {/* The category tag, then rows one text-sm line tall, like the title
            and price */}
        <div className="mb-1 h-5.5 w-20 rounded-full bg-card-media" />
        <div className="flex h-5 items-center">
          <div className="h-3 w-3/4 rounded bg-card-media" />
        </div>
        <div className="flex h-5 items-center">
          <div className="h-3 w-1/3 rounded bg-card-media" />
        </div>
      </div>

      <div className="p-3">
        <div className="h-11 rounded-xl bg-card-media" />
      </div>
    </div>
  )
}
