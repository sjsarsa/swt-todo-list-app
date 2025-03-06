import clsx from 'clsx'
import { Show, type JSX } from 'solid-js'
import { Spinner } from './Spinner'

type ActionButtonProps = {
  variant: 'primary' | 'secondary' | 'danger'
  label: string
  loading?: boolean
  href?: string
  onClick?: JSX.EventHandler<HTMLButtonElement, MouseEvent>
  type?: 'button' | 'submit' | 'reset'
}

/**
 * Button that is used for navigation, to confirm form entries or perform
 * individual actions.
 */
export function ActionButton(props: ActionButtonProps) {
  return (
    <button
      class={clsx(
        'items-center rounded-lg px-3 py-1.5 font-medium md:text-md lg:rounded-lg lg:px-4 lg:py-2 lg:text-lg',
        props.variant === 'primary' &&
          'bg-sky-600 text-white hover:bg-sky-600/80 dark:bg-sky-400 dark:text-gray-900 dark:hover:bg-sky-400/80',
        props.variant === 'secondary' &&
          'bg-sky-600/10 text-sky-600 hover:bg-sky-600/20 dark:bg-sky-400/10 dark:text-sky-400 dark:hover:bg-sky-400/20',
        props.variant === 'danger' &&
          'bg-red-600 text-white hover:bg-red-600/80 dark:bg-red-400 dark:text-gray-900 dark:hover:bg-red-400/80',
      )}
      {...props}
    >
      <Show when={props.loading} fallback={props.label}>
        <Spinner label={`${props.label} is loading`} />
      </Show>
    </button>
  )
}
