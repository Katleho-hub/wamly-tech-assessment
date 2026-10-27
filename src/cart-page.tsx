import { type ReactNode, useId } from 'react'
import { Link } from 'react-router'

import { type CartItem } from './api/fakestore/cart'
import { type Product, useProducts } from './api/fakestore/products'
import { CartIcon } from './components/icons/cart-icon'
import { MinusIcon } from './components/icons/minus-icon'
import { PlusIcon } from './components/icons/plus-icon'
import { TrashIcon } from './components/icons/trash-icon'
import { ProductImage } from './components/product-image'
import { useCartFlow } from './use-cart-flow'
import { countItems } from './utils/cart'
import { formatPrice } from './utils/format-price'

const panel = 'rounded-2xl border border-line bg-white text-body'

function itemsLabel(count: number) {
  return `${count} ${count === 1 ? 'item' : 'items'}`
}

export function CartPage() {
  const headingId = useId()
  const { data: products } = useProducts()
  const { cart, busy, error, changeQuantity, removeProduct } = useCartFlow()

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

          <ul className="divide-y divide-line">
            {cart.products.map((item) => (
              <CartLine
                key={item.productId}
                item={item}
                product={productsById.get(item.productId)}
                disabled={busy}
                onDecrease={() => changeQuantity(item.productId, -1)}
                onIncrease={() => changeQuantity(item.productId, 1)}
                onRemove={() => removeProduct(item.productId)}
              />
            ))}
          </ul>
        </div>

        <OrderSummary itemCount={itemCount} subtotal={subtotal} />
      </div>
    </section>
  )
}

type CartLineProps = {
  item: CartItem
  // Missing only until the products load
  product: Product | undefined
  disabled: boolean
  onDecrease: () => void
  onIncrease: () => void
  onRemove: () => void
}

function CartLine({
  item,
  product,
  disabled,
  onDecrease,
  onIncrease,
  onRemove,
}: CartLineProps) {
  const title = product?.title ?? `Product ${item.productId}`

  return (
    <li className="flex gap-3 p-4">
      <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-card-media p-1.5">
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
        <div className="flex justify-between gap-3">
          <h3 className="line-clamp-2 text-sm font-semibold text-navy">
            {title}
          </h3>
          {product && (
            <p className="shrink-0 text-sm font-semibold">
              {formatPrice(product.price * item.quantity)}
            </p>
          )}
        </div>

        {product && (
          <p className="text-xs text-muted">
            {formatPrice(product.price)} each
          </p>
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
