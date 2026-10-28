import { fireEvent, render } from '@testing-library/react'

import { products } from '../test/fake-store'
import { resizedImageSrcSet, resizedImageUrl } from '../utils/resized-image'
import { ProductImage } from './product-image'

const original = products[0].image

function setup() {
  render(
    <ProductImage
      src={original}
      srcWidth={216}
      srcSetWidths={[144, 216]}
      alt=""
    />,
  )
}

const image = () => document.querySelector('img')!

describe('ProductImage', () => {
  it('loads the resized image through the proxy', () => {
    setup()

    expect(image()).toHaveAttribute('src', resizedImageUrl(original, 216))
    expect(image()).toHaveAttribute(
      'srcset',
      resizedImageSrcSet(original, [144, 216]),
    )
  })

  it('falls back to the original image when the proxy fails', () => {
    setup()

    fireEvent.error(image())

    expect(image()).toHaveAttribute('src', original)
    expect(image()).not.toHaveAttribute('srcset')
  })

  it('keeps the original image if it fails too', () => {
    setup()

    fireEvent.error(image())
    fireEvent.error(image())

    expect(image()).toHaveAttribute('src', original)
  })
})
