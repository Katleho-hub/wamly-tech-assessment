import { Icon, type IconProps } from './icon'

export function MissingPageIcon(props: IconProps) {
  return (
    <Icon viewBox="0 0 60 62" strokeWidth="4" {...props}>
      <path d="M29 52H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h19l12 12v13" />
      <path d="M26 4l12 12h-9a3 3 0 0 1-3-3z" fill="currentColor" />
      <circle cx="40" cy="42" r="11" />
      <path d="M35.5 37.5l9 9M44.5 37.5l-9 9M48 50l8 8" />
    </Icon>
  )
}
