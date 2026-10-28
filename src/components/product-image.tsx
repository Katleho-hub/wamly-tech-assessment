import { type ComponentProps, useState } from 'react'

import { resizedImageSrcSet, resizedImageUrl } from '../utils/resized-image'

type ProductImageProps = Omit<
  ComponentProps<'img'>,
  'src' | 'srcSet' | 'onError'
> & {
  src: string
  srcWidth: number
  srcSetWidths: number[]
}

export function ProductImage({
  src,
  srcWidth,
  srcSetWidths,
  ...props
}: ProductImageProps) {
  const [proxyFailed, setProxyFailed] = useState(false)

  return (
    <img
      {...props}
      src={proxyFailed ? src : resizedImageUrl(src, srcWidth)}
      srcSet={proxyFailed ? undefined : resizedImageSrcSet(src, srcSetWidths)}
      onError={() => setProxyFailed(true)}
    />
  )
}
