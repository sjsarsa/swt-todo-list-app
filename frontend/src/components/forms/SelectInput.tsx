import clsx from 'clsx'
import { type JSX, Show, splitProps } from 'solid-js'
import { InputError } from './InputError'
import { InputLabel } from './InputLabel'
import { Icon } from '@iconify-icon/solid'
import { Select, type CreateSelectValue } from '@thisbeyond/solid-select'

type SelectProps = {
  ref: (element: HTMLSelectElement) => void
  name: string
  value?: CreateSelectValue
  onInput?: (value: string) => void
  onChange: (value: any) => void
  onBlur: JSX.EventHandler<HTMLSelectElement, FocusEvent>
  options: CreateSelectValue[]
  format?: (data: CreateSelectValue, type: 'option' | 'value') => JSX.Element
  emptyPlaceholder?: string
  multiple?: boolean
  size?: string | number
  placeholder?: string
  required?: boolean
  class?: string
  label?: string
  error?: string
}

/**
 * Select field that allows users to select predefined values. Various
 * decorations can be displayed in or around the field to communicate the
 * entry requirements.
 */
export function SelectInput(props: SelectProps) {
  // Split select element props
  const [, selectProps] = splitProps(props, ['ref', 'onInput', 'class', 'value', 'label', 'error'])

  return (
    <div class={clsx('px-8 lg:px-10', props.class)}>
      <InputLabel name={props.name} label={props.label} required={props.required} />
      <div class="w-full relative flex items-center">
        <Select
          {...selectProps}
          class={clsx(
            'w-full appearance-none space-y-2 rounded-2xl border-2 bg-transparent outline-none md:text-lg lg:space-y-3 lg:text-xl',
            props.error
              ? 'border-red-600/50 dark:border-red-400/50'
              : 'border-slate-200 hover:border-slate-300 focus:border-sky-600/50 dark:border-slate-800 dark:hover:border-slate-700 dark:focus:border-sky-400/50',
            props.placeholder && !props.value?.length && 'text-slate-500',
          )}
          onInput={props.onInput}
          initialValue={props.value}
          emptyPlaceholder={props.emptyPlaceholder}
          id={props.name}
          name={props.name}
          aria-invalid={!!props.error}
          aria-errormessage={`${props.name}-error`}
        >
        </Select>
        <Show when={!props.multiple}>
          <Icon icon="pepicons-pencil:angle-down" class="pointer-events-none absolute right-6 h-5 lg:right-8 lg:h-6" />
        </Show>
      </div>
      <InputError name={props.name} error={props.error} />
    </div>
  )
}
