import { type ReactNode, useId } from 'react'
import { Link } from 'react-router'

import { type CartItem } from './api/fakestore/cart'
import { type Product, useProductsQuery } from './api/fakestore/products'
import { CartIcon } from './components/icons/cart-icon'
import { MinusIcon } from './components/icons/minus-icon'
import { PlusIcon } from './components/icons/plus-icon'
import { TrashIcon } from './components/icons/trash-icon'
import { ProductImage } from './components/product-image'
import { useCart } from './hooks/use-cart'
import { countItems } from './utils/cart'
import { formatPrice } from './utils/format-price'

const panel = 'rounded-2xl border border-line bg-white text-body'
// A bar that stands in for a line of text until it loads
const placeholder =
  'animate-pulse rounded bg-card-media motion-reduce:animate-none'

function itemsLabel(count: number) {
  return `${count} ${count === 1 ? 'item' : 'items'}`
}

export default function CartPage() {
  const headingId = useId()
  const productsQuery = useProductsQuery()
  const products = productsQuery.data
  const { cart, loading, busy, error, changeQuantity, removeProduct } =
    useCart()

  if (loading) {
    return null
  }

  if (!cart || cart.products.length === 0) {
    return <EmptyCart />
  }

  const productsById = new Map(products?.map((p) => [p.id, p]))
  const itemCount = countItems(cart)
  const subtotal = cart.products.reduce(
    (sum, item) =>
      sum + (productsById.get(item.productId)?.price ?? 0) * item.quantity,
    0,
  )

  return (
    <section aria-labelledby={headingId} className="w-full">
      <h2 id={headingId} className="mt-3 mb-4 text-2xl font-bold text-navy">
        Your cart{' '}
        <span className="text-base font-normal text-muted">
          ({itemsLabel(itemCount)})
        </span>
      </h2>

      {error && (
        <p role="alert" className="mb-3 text-sm text-body">
          Couldn't update your cart. Check your connection.
        </p>
      )}

      <div className="grid items-start gap-3 md:grid-cols-[1fr_17rem]">
        <div className={panel}>
          <div
            aria-hidden="true"
            className="flex justify-between border-b border-line px-4 py-2.5 text-[11px] font-semibold tracking-wide text-muted uppercase"
          >
            <span>Product</span>
            <span>Total</span>
          </div>

          <ul
            aria-busy={productsQuery.isPending}
            className="divide-y divide-line"
          >
            {cart.products.map((item) => (
              <CartLine
                key={item.productId}
                item={item}
                product={productsById.get(item.productId)}
                loading={productsQuery.isPending}
                disabled={busy}
                onDecrease={() => changeQuantity(item.productId, -1)}
                onIncrease={() => changeQuantity(item.productId, 1)}
                onRemove={() => removeProduct(item.productId)}
              />
            ))}
          </ul>
        </div>

        {products ? (
          <OrderSummary itemCount={itemCount} subtotal={subtotal} />
        ) : productsQuery.isError ? (
          <PricesError onRetry={() => void productsQuery.refetch()} />
        ) : (
          <OrderSummarySkeleton />
        )}
      </div>
    </section>
  )
}

type CartLineProps = {
  item: CartItem
  // Missing while the products load, if they fail to, or if the product is no
  // longer in the catalogue
  product: Product | undefined
  // The products are still loading, so the details are placeholders for now.
  // The quantity controls only need the cart, so they work meanwhile
  loading: boolean
  disabled: boolean
  onDecrease: () => void
  onIncrease: () => void
  onRemove: () => void
}

function CartLine({
  item,
  product,
  loading,
  disabled,
  onDecrease,
  onIncrease,
  onRemove,
}: CartLineProps) {
  const title = product?.title ?? `Product ${item.productId}`

  return (
    <li className="flex gap-3 p-4">
      <div
        className={`flex size-16 shrink-0 items-center justify-center rounded-xl bg-card-media p-1.5 ${loading ? 'animate-pulse motion-reduce:animate-none' : ''}`}
      >
        {product && (
          <ProductImage
            src={product.image}
            srcWidth={64}
            srcSetWidths={[64, 128, 192]}
            sizes="64px"
            alt=""
            loading="lazy"
            decoding="async"
            width="64"
            height="64"
            className="size-full object-contain mix-blend-multiply"
          />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {/* Placeholders are one line tall, so nothing shifts as text arrives */}
        <div className="flex justify-between gap-3">
          {loading ? (
            <div aria-hidden="true" className="flex h-5 flex-1 items-center">
              <div className={`h-3 w-3/4 ${placeholder}`} />
            </div>
          ) : (
            <h3 className="line-clamp-2 text-sm font-semibold text-navy">
              {title}
            </h3>
          )}
          {product ? (
            <p className="shrink-0 text-sm font-semibold">
              {formatPrice(product.price * item.quantity)}
            </p>
          ) : (
            loading && (
              <div aria-hidden="true" className="flex h-5 items-center">
                <div className={`h-3 w-14 ${placeholder}`} />
              </div>
            )
          )}
        </div>

        {product ? (
          <p className="text-xs text-muted">
            {formatPrice(product.price)} each
          </p>
        ) : (
          loading && (
            <div aria-hidden="true" className="flex h-4 items-center">
              <div className={`h-2.5 w-20 ${placeholder}`} />
            </div>
          )
        )}

        <div className="mt-1 flex items-center gap-3">
          <div className="flex items-center rounded-xl border border-line">
            <StepperButton
              label={`Decrease quantity, ${title}`}
              disabled={disabled}
              onClick={onDecrease}
            >
              <MinusIcon className="size-3.5" />
            </StepperButton>
            <span className="w-7 text-center text-sm">
              <span className="sr-only">Quantity </span>
              {item.quantity}
            </span>
            <StepperButton
              label={`Increase quantity, ${title}`}
              disabled={disabled}
              onClick={onIncrease}
            >
              <PlusIcon className="size-3.5" />
            </StepperButton>
          </div>

          <button
            type="button"
            className="flex items-center gap-1 text-xs text-muted underline hover:text-body disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled}
            onClick={onRemove}
          >
            <TrashIcon className="size-3.5" />
            Remove<span className="sr-only">, {title}</span>
          </button>
        </div>
      </div>
    </li>
  )
}

type StepperButtonProps = {
  label: string
  disabled: boolean
  onClick: () => void
  children: ReactNode
}

function StepperButton({
  label,
  disabled,
  onClick,
  children,
}: StepperButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex size-8 items-center justify-center disabled:cursor-not-allowed disabled:opacity-50"
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function OrderSummary({
  itemCount,
  subtotal,
}: {
  itemCount: number
  subtotal: number
}) {
  const headingId = useId()

  return (
    <aside aria-labelledby={headingId} className={`${panel} p-5 text-sm`}>
      <h3 id={headingId} className="mb-3 font-bold text-navy">
        Order summary
      </h3>

      <dl className="flex flex-col gap-2">
        <div className="flex justify-between gap-3">
          <dt>Subtotal ({itemsLabel(itemCount)})</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>Delivery</dt>
          <dd className="text-muted">Calculated at checkout</dd>
        </div>
        <div className="mt-2 flex justify-between gap-3 border-t border-line pt-3 text-base font-bold">
          <dt>Total</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
      </dl>
    </aside>
  )
}

// Stands in for the OrderSummary until the prices load
function OrderSummarySkeleton() {
  const headingId = useId()

  return (
    // The headings stay as text; only the parts that wait on prices pulse
    <aside
      aria-labelledby={headingId}
      aria-busy="true"
      className={`${panel} p-5 text-sm`}
    >
      <h3 id={headingId} className="mb-3 font-bold text-navy">
        Order summary
      </h3>

      <div
        aria-hidden="true"
        className="flex animate-pulse flex-col gap-2 motion-reduce:animate-none"
      >
        {/* Rows one text-sm line tall: subtotal, then delivery */}
        <div className="flex h-5 items-center justify-between gap-3">
          <div className="h-3 w-28 rounded bg-card-media" />
          <div className="h-3 w-14 rounded bg-card-media" />
        </div>
        <div className="flex h-5 items-center justify-between gap-3">
          <div className="h-3 w-16 rounded bg-card-media" />
          <div className="h-3 w-32 rounded bg-card-media" />
        </div>
      </div>

      <div
        aria-hidden="true"
        className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3 text-base font-bold"
      >
        <p>Total</p>
        <div className={`h-4 w-16 ${placeholder}`} />
      </div>
    </aside>
  )
}

// Takes the OrderSummary's place when the prices fail to load, since a
// subtotal without them would be wrong
function PricesError({ onRetry }: { onRetry: () => void }) {
  const headingId = useId()

  return (
    <aside aria-labelledby={headingId} className={`${panel} p-5 text-sm`}>
      <h3 id={headingId} className="mb-3 font-bold text-navy">
        Order summary
      </h3>

      <p role="alert" className="mb-4">
        Couldn't load prices. Check your connection.
      </p>
      <button
        type="button"
        className="rounded-xl bg-brand-strong px-6 py-3 text-sm font-semibold text-white"
        onClick={onRetry}
      >
        Try again
      </button>
    </aside>
  )
}

function EmptyCart() {
  const headingId = useId()

  return (
    <section
      aria-labelledby={headingId}
      className={`${panel} my-6 flex w-full max-w-md flex-col items-center gap-3 px-6 py-10 text-center`}
    >
      <div className="flex size-16 items-center justify-center rounded-xl bg-amber/15 text-amber">
        <CartIcon className="size-8" strokeWidth="1.8" />
      </div>

      <h2 id={headingId} className="mt-2 text-xl font-bold text-navy">
        Your cart is empty
      </h2>
      <p className="max-w-xs text-xs text-muted">
        Looks like you haven't added anything yet. Browse the shop and items you
        add will show up here.
      </p>
      <Link
        to="/"
        className="mt-1 rounded-xl bg-brand-strong px-6 py-3 text-sm font-semibold text-white"
      >
        Continue shopping
      </Link>
    </section>
  )
}
