import { createForm, required, type SubmitHandler } from '@modular-forms/solid'
import { TextInput } from './TextInput'
import todoActions from '../../http-actions/todoActions'
import todoListState, { type TodoList } from '../../state/todoListState'
import { createSignal } from 'solid-js'
import { IconButton } from '../common/IconButton'

type EditTodoListForm = {
  name: string
  description: string
}

type EditTodoListFormProps = {
  todoListIndex: number
  todoList: TodoList
  onSuccess: (todoList: TodoList) => void
  onClose?: () => void
}

export default function EditTodoListForm(props: EditTodoListFormProps) {
  const { todoList, todoListIndex } = props

  const [editTodoListForm, { Form, Field }] = createForm<EditTodoListForm>({
    initialValues: {
      name: todoList.name,
      description: todoList.description,
    },
  })

  const [_todoLists, setTodoLists] = todoListState
  const [_submitError, setSubmitError] = createSignal<string | undefined>()

  const handleSubmit: SubmitHandler<EditTodoListForm> = (values) => {
    console.log('submitting edit todo item form with values:', values)

    todoActions
      .updateTodoList(todoList.id, values)
      .then((updatedTodoList) => {
        console.log('todo item edited:', updatedTodoList)
        setTodoLists(todoListIndex, updatedTodoList)
        props.onSuccess(updatedTodoList)
        editTodoListForm.internal.fields.description?.value.set('')
        setSubmitError(undefined)
      })
      .catch((error) => {
        console.log('setting error:', error)
        setSubmitError(error.message)
      })
  }

  return (
    <Form
      onSubmit={handleSubmit}
      class="flex flex-grow flex-col justify-center self-center"
    >
      <div class="flex">
        <div class="flex-grow">
          <Field name="name" validate={[required('Name is required.')]}>
            {(field, props) => (
              <>
                <TextInput
                  {...props}
                  label="Name"
                  type="text"
                  value={field.value}
                  error={field.error}
                  required
                />
              </>
            )}
          </Field>
          <Field name="description">
            {(field, props) => (
              <>
                <TextInput
                  {...props}
                  label="Description"
                  type="textarea"
                  value={field.value}
                  error={field.error}
                  required
                />
              </>
            )}
          </Field>
        </div>
        <div class="mt-1 flex h-fit flex-shrink flex-row">
          <IconButton
            loading={editTodoListForm.submitting}
            icon="fluent:save-20-regular"
            iconClass="text-blue-400"
            type="submit"
          />
          <IconButton
            loading={editTodoListForm.submitting}
            icon="fluent:edit-off-20-regular"
            iconClass="text-yellow-600"
            onClick={() => props.onClose?.()}
          />
          <IconButton
            icon="fluent:copy-20-regular"
            iconClass="text-gray-600"
            disabled
          />
          <IconButton
            icon="fluent:delete-20-regular"
            iconClass="text-gray-600"
            disabled
          />
        </div>
      </div>
    </Form>
  )
}
