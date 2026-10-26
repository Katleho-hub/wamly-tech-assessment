import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { type ComponentProps } from 'react'

import type { CartActionCallbacks } from '../hooks/use-cart'
import { products } from '../test/fake-store'
import { ProductCard } from './product-card'

const product = products[0]

function setup(props: Partial<ComponentProps<typeof ProductCard>> = {}) {
  const onAddToCart = jest.fn<void, [CartActionCallbacks]>()
  render(
    <ProductCard
      product={product}
      quantity={0}
      disabled={false}
      onAddToCart={onAddToCart}
      {...props}
    />,
  )

  return {
    user: userEvent.setup(),
    onAddToCart,
    // The callbacks the card passed with its most recent add request
    callbacks: () => onAddToCart.mock.lastCall![0],
  }
}

const button = () => screen.getByRole('button')
const image = () => document.querySelector('img')

describe('ProductCard', () => {
  it('shows the category, title and formatted price', () => {
    setup()

    expect(screen.getByText(product.category)).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: product.title }),
    ).toBeInTheDocument()
    expect(screen.getByText(/109[.,]95/)).toBeInTheDocument()
  })

  it('offers "Add to cart" when the product is not in the cart', () => {
    setup()

    expect(button()).toHaveAccessibleName(
      new RegExp(`^Add to cart\\s*, ${product.title}$`),
    )
  })

  it('shows the quantity when the product is already in the cart', () => {
    setup({ quantity: 2 })

    expect(button()).toHaveTextContent('Added (2) · Add another')
  })

  it('is disabled while another request is running', () => {
    setup({ disabled: true })

    expect(button()).toBeDisabled()
  })

  it('shows "Adding..." and disables itself until the request settles', async () => {
    const { user, onAddToCart } = setup()

    await user.click(button())

    expect(onAddToCart).toHaveBeenCalledTimes(1)
    expect(button()).toHaveTextContent('Adding...')
    expect(button()).toBeDisabled()
  })

  it('returns to idle when the request succeeds', async () => {
    const { user, callbacks } = setup()
    await user.click(button())

    act(() => callbacks().onSuccess?.())

    expect(button()).toHaveTextContent('Add to cart')
    expect(button()).toBeEnabled()
  })

  it('shows an error and "Try again" when the request fails', async () => {
    const { user, callbacks } = setup()
    await user.click(button())

    act(() => callbacks().onError?.())

    expect(screen.getByRole('alert')).toHaveTextContent("Couldn't add to cart")
    expect(button()).toHaveTextContent('Try again')
    expect(button()).toBeEnabled()
  })

  it('loads the image eagerly when it has priority', () => {
    setup({ priority: true })

    expect(image()).toHaveAttribute('loading', 'eager')
  })

  it('loads the image lazily by default', () => {
    setup()

    expect(image()).toHaveAttribute('loading', 'lazy')
  })
})
