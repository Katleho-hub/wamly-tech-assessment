import { Icon, type IconProps } from './icon'

export function CheckIcon(props: IconProps) {
  return (
    <Icon strokeWidth="2.2" {...props}>
      <path d="M5 12l5 5 9-10" />
    </Icon>
  )
}
