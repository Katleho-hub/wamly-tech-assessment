import { Icon, type IconProps } from './icon'

export function SpinnerIcon(props: IconProps) {
  return (
    <Icon strokeWidth="2.5" {...props}>
      <path d="M12 3a9 9 0 1 0 9 9" />
    </Icon>
  )
}
