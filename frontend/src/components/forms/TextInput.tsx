import clsx from 'clsx'
import { createMemo, type JSX, splitProps, createEffect, on } from 'solid-js'
import { InputError } from './InputError'
import { InputLabel } from './InputLabel'

interface BaseInputProps {
  name: string
  ref?: (element: HTMLInputElement | HTMLTextAreaElement) => void
  onInput?: JSX.EventHandler<HTMLInputElement | HTMLTextAreaElement, InputEvent>
  onChange?: JSX.EventHandler<HTMLInputElement | HTMLTextAreaElement, Event>
  onBlur?: JSX.EventHandler<HTMLInputElement | HTMLTextAreaElement, FocusEvent>
  placeholder?: string
  required?: boolean
  class?: string
  label?: string
  error?: string
  padding?: 'none'
  autofocus?: boolean
}

interface InputProps extends BaseInputProps {
  value: string | number | undefined
  type?: 'text' | 'email' | 'tel' | 'password' | 'url' | 'number' | 'date'
}

interface TextAreaProps extends BaseInputProps {
  type: 'textarea'
  value?: string
  rows?: number
}

export type TextInputProps = InputProps | TextAreaProps

/**
 * Text input field that users can type into. Various decorations can be
 * displayed in or around the field to communicate the entry requirements.
 */
export function TextInput(props: TextInputProps) {
  // Split input element props
  const [, inputProps] = splitProps(props, ['class', 'value', 'label', 'error', 'padding'])
  let ref: HTMLTextAreaElement | undefined

  // Create memoized value
  const getValue = createMemo<string | number | undefined>(
    (prevValue) =>
      props.value === undefined ? '' : !Number.isNaN(props.value) ? props.value : prevValue,
    '',
  )

  const cls = clsx(
    'h-14 w-full rounded-2xl border-2 bg-white px-5 outline-none placeholder:text-slate-500 md:h-16 md:text-lg lg:h-[70px] lg:px-6 lg:text-xl dark:bg-gray-900',
    props.error
      ? 'border-red-600/50 dark:border-red-400/50'
      : 'border-slate-200 hover:border-slate-300 focus:border-sky-600/50 dark:border-slate-800 dark:hover:border-slate-700 dark:focus:border-sky-400/50',
  )

  const resize = (target: HTMLTextAreaElement) => {
    target.style.height = `${Math.max(target.scrollHeight)}px`
  }

  createEffect(
    on(
      [() => ref, () => props.value, () => props.type],
      ([ref]) => ref && props.type === 'textarea' && resize(ref),
    ),
  )

  return (
    <div class={props.class}>
      <InputLabel name={props.name} label={props.label} required={props.required} />
      {props.type === 'textarea' ? (
        <textarea
          {...inputProps}
          autofocus={props.autofocus}
          class={cls}
          id={props.name}
          value={getValue()}
          aria-invalid={!!props.error}
          aria-errormessage={`${props.name}-error`}
          ref={(el) => (ref = el)}
          rows={props.rows ?? 4}
          // for auto growing textarea
          style={{
            'overflow-y': 'hidden',
            height: 'auto',
          }}
        />
      ) : (
        <input
          type="text"
          {...inputProps}
          class={cls}
          id={props.name}
          value={getValue()}
          aria-invalid={!!props.error}
          aria-errormessage={`${props.name}-error`}
        />
      )}
      <InputError name={props.name} error={props.error} />
    </div>
  )
}
