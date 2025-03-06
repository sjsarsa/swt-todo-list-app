import { createForm, required, type SubmitHandler } from '@modular-forms/solid'
import { TextInput } from './TextInput'
import { ActionButton } from '../common/ActionButton'
import todoActions from '../../http-actions/todoActions'
import todoItemState from '../../state/todoItemState'
import { FormError } from './FormError'
import { createSignal } from 'solid-js'

type CreateTodoItemForm = {
  name: string
  description: string
}

type CreateTodoItemFormProps = {
  todoListId: number
  onSuccess?: (newTodoItem: any) => void
  onClose?: () => void
}

export default function CreateTodoItemForm(props: CreateTodoItemFormProps) {
  const [createTodoItemForm, { Form, Field }] = createForm<CreateTodoItemForm>()
  const [todos, setTodos] = todoItemState
  const [submitError, setSubmitError] = createSignal<string | undefined>()

  const handleSubmit: SubmitHandler<CreateTodoItemForm> = (values) => {
    console.log('submitting create todo item form with values:', values)
    createTodoItemForm.internal.fields.description?.value.set('')

    todoActions
      .createTodoItem(props.todoListId, values)
      .then((newTodoItem) => {
        console.log('todo item created:', newTodoItem)
        setTodos(todos.length, newTodoItem)
        createTodoItemForm.internal.fields.description?.value.set('')
        setSubmitError(undefined)
        props.onSuccess?.(newTodoItem)
      })
      .catch((error) => {
        console.log('error:', error)
        setSubmitError(error.message)
      })
  }

  return (
    <div class="flex max-w-2xl flex-col justify-center self-center ">
      <div class="container prose mb-2">
        <h1>New todo task</h1>
      </div>
      <FormError error={submitError()} formName="createTodoItem" />
      <Form onSubmit={handleSubmit}>
        <Field
          name="description"
          validate={[required('Description cannot be empty')]}
        >
          {(field, props) => (
            <TextInput
              {...props}
              label="Description"
              type="textarea"
              value={field.value}
              error={field.error}
              required
            />
          )}
        </Field>
        <div class="mt-2 flex justify-between">
          <ActionButton
            type="button"
            loading={createTodoItemForm.submitting}
            label="Close"
            variant="secondary"
            onClick={() => props.onClose?.()}
          />
          <ActionButton
            loading={createTodoItemForm.submitting}
            label="Create"
            variant="primary"
          />
        </div>
      </Form>
    </div>
  )
}
