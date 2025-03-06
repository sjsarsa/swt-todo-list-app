import { createForm, required, type SubmitHandler } from '@modular-forms/solid'
import { TextInput } from './TextInput'
import todoActions from '../../http-actions/todoActions'
import todoItemState, { type TodoItem } from '../../state/todoItemState'
import { FormError } from './FormError'
import { createEffect, createSignal } from 'solid-js'
import { IconButton } from '../common/IconButton'

export type TodoItemEditState = {
  description: string
}

type EditTodoItemForm = {
  name: string
  description: string
}

type EditTodoItemFormProps = {
  todoItemIndex: number
  todoItem: TodoItem
  editState: TodoItemEditState
  onInput: (input: string) => void
  onSuccess: (todoItem: TodoItem) => void
  onClose?: () => void
}

export default function EditTodoItemForm(props: EditTodoItemFormProps) {
  const [_todoItems, setTodoItems] = todoItemState

  const [editTodoItemForm, { Form, Field }] = createForm<EditTodoItemForm>({
    initialValues: {
      description: props.editState.description,
    },
  })

  createEffect(() => {
    editTodoItemForm.internal.fields.description?.value.set(
      props.editState.description,
    )
  })

  const [submitError, setSubmitError] = createSignal<string | undefined>()

  const handleSubmit: SubmitHandler<EditTodoItemForm> = (values) => {
    console.log('submitting edit todo item form with values:', values)

    todoActions
      .updateTodoItem(props.todoItem.todo_list_id, props.todoItem.id, values)
      .then((updatedTodoItem) => {
        console.log('todo item edited:', updatedTodoItem)
        setTodoItems(props.todoItemIndex, updatedTodoItem)
        editTodoItemForm.internal.fields.description?.value.set('')
        setSubmitError(undefined)
        props.onSuccess(updatedTodoItem)
      })
      .catch((error) => {
        console.log('setting error:', error)
        setSubmitError(error.message)
      })
  }

  return (
    <div class="flex flex-grow flex-col justify-center self-center ">
      <FormError error={submitError()} formName="editTodoItem" />
      <Form onSubmit={handleSubmit}>
        <div class="flex">
          <div class="flex-grow">
            <Field
              name="description"
              validate={[required('Description cannot be empty')]}
            >
              {(field, fieldProps) => (
                <>
                  <TextInput
                    {...fieldProps}
                    type="textarea"
                    value={field.value}
                    error={field.error}
                    onInput={(e) => {
                      fieldProps.onInput(e)
                      props.onInput(e.currentTarget.value)
                    }}
                    required
                    autofocus
                  />
                </>
              )}
            </Field>
          </div>
          <div class="flex h-fit flex-shrink flex-row">
            <IconButton
              loading={editTodoItemForm.submitting}
              icon="fluent:save-20-regular"
              iconClass="text-blue-400"
              type="submit"
            />
            <IconButton
              loading={editTodoItemForm.submitting}
              icon="fluent:edit-off-20-regular"
              iconClass="text-yellow-600"
              onClick={() => props.onClose?.()}
            />
            <IconButton
              icon="fluent:delete-20-regular"
              iconClass="text-gray-600"
              disabled
            />
          </div>
        </div>
      </Form>
    </div>
  )
}
