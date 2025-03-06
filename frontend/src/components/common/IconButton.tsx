import { type JSX, Show } from 'solid-js'
import { Spinner } from './Spinner'
import { Icon } from '@iconify-icon/solid'
import cslx from 'clsx'

type IconButtonProps = {
  icon: string
  label?: string
  loading?: boolean
  onClick?: JSX.EventHandler<HTMLButtonElement, MouseEvent>
  type?: 'button' | 'submit' | 'reset'
  iconClass?: JSX.HTMLAttributes<HTMLElement>['class']
  disabled?: boolean
}

/**
 * Button that is used for navigation, to confirm form entries or perform
 * individual actions.
 */
export function IconButton(props: IconButtonProps) {
  const ButtonContent = () => {
    return (
      <div class="flex items-center justify-center">
        <Icon class={cslx('text-3xl ', props.iconClass, props.disabled ? ' opacity-30' : '')} icon={props.icon} />
        {props.label && <span>{props.label}</span>}
      </div>
    )
  }

  return (
    <button
      class={props.disabled ? "relative ml-3 px-1.5 py-1.5" : "relative ml-3 flex items-center justify-center px-1.5 py-1.5 font-medium md:text-md lg:rounded-lg lg:text-lg hover:ring-2 focus-visible:ring-blue-500 focus-visible:ring-opacity-75"}
      {...props}
    >
      <Show when={props.loading} fallback={ButtonContent()}>
        <Spinner label={`${props.label} is loading`} />
      </Show>
    </button>
  )
}
