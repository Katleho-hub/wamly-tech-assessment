import { Link, NavLink, useLocation, useNavigate } from 'react-router'

import { useCartQuery } from '../api/fakestore/cart'
import { useCartId } from '../context/cart-id-context'
import { countItems } from '../utils/cart'
import { CartIcon } from './icons/cart-icon'
import { ChevronLeftIcon } from './icons/chevron-left-icon'
import { WamlyLogo, WamlyStoreLogo } from './wamly-store-logo'

export function TopNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { cartId } = useCartId()
  const { cart, loading } = useCartQuery(cartId)

  const isHome = location.pathname === '/'
  // 'default' marks the page the app was opened on, so there's no in-app
  // page to go back to and going back would leave the site
  const canGoBack = location.key !== 'default'

  function goBack() {
    if (canGoBack) {
      void navigate(-1)
    } else {
      void navigate('/')
    }
  }

  return (
    <header className="w-full">
      <nav aria-label="Main" className="flex h-16 items-center gap-2">
        {!isHome && (
          <button
            type="button"
            aria-label="Back"
            className="flex size-10 items-center justify-center rounded-xl text-body hover:bg-card-media"
            onClick={goBack}
          >
            <ChevronLeftIcon className="size-5" />
          </button>
        )}

        <Link to="/" aria-label="wamlystore home" className="p-1">
          <span className="flex size-10 items-center justify-center rounded-xl bg-white sm:hidden">
            <WamlyLogo className="size-7" />
          </span>
          <WamlyStoreLogo className="hidden h-7 w-auto sm:block" />
        </Link>

        <NavLink
          to="/cart"
          className="ml-auto flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-2 text-sm font-semibold text-body aria-[current=page]:border-navy aria-[current=page]:text-navy"
        >
          <CartIcon className="size-4" />
          Cart
          {/* Pulse until the saved cart loads, rather than show (0) */}
          {loading ? (
            <span
              aria-hidden="true"
              className="h-3 w-5 animate-pulse rounded bg-card-media motion-reduce:animate-none"
            />
          ) : (
            ` (${countItems(cart)})`
          )}
        </NavLink>
      </nav>
    </header>
  )
}
