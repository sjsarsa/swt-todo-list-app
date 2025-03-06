import { Show } from 'solid-js'

type FormErrorProps = {
  formName: string
  error?: string
}

/**
 * Input error that tells the user what to do to fix the problem.
 */
export function FormError(props: FormErrorProps) {
  return (
    <Show when={props.error}>
      <div
        class="py-4 text-sm text-red-500 md:text-base lg:pt-5 lg:text-lg dark:text-red-400"
        id={`${props.formName}-form-error`}
      >
        {props.error}
      </div>
    </Show>
  )
}
