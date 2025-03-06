import { createForm, required, type SubmitHandler } from '@modular-forms/solid'
import { TextInput } from './TextInput'
import todoListState from '../../state/todoListState'
import { ActionButton } from '../common/ActionButton'
import todoActions from '../../http-actions/todoActions'
import { FormError } from './FormError'
import { createSignal } from 'solid-js'

type CreateTodoListForm = {
  name: string
  description: string
}

type CreateTodoListFormProps = {
  onClose: () => void
  onSuccess: () => void
}

export default function CreateTodoListForm(props: CreateTodoListFormProps) {
  const [createTodoListForm, { Form, Field }] = createForm<CreateTodoListForm>()
  const [todoLists, setTodoLists] = todoListState
  const [submitError, setSubmitError] = createSignal<string | undefined>()

  const handleSubmit: SubmitHandler<CreateTodoListForm> = (values) => {
    console.log('submitting create todo list form with values:', values)
    todoActions
      .createTodoList(values)
      .then((newTodoList) => {
        console.log('todo list created:', newTodoList)
        setTodoLists(todoLists.length, newTodoList)
        Object.values(createTodoListForm.internal.fields).forEach((field) => {
          field.value.set('')
        })
        setSubmitError(undefined)
        props.onSuccess()
      })
      .catch((error) => {
        console.log('error:', error)
        setSubmitError(error.message)
      })
  }

  return (
    <div class="flex self-center max-w-md w-full flex-col justify-center">
      <div class="container prose mb-8">
        <h1>Create a new todo list</h1>
      </div>
      <FormError error={submitError()} formName="login" />
      <Form onSubmit={handleSubmit}>
        <Field
          name="name"
          validate={[required('The todo list needs to have a name.')]}
        >
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
        <div class="mt-4 flex justify-between">
          <ActionButton
            type="button"
            loading={createTodoListForm.submitting}
            label="Close"
            variant="secondary"
            onClick={() => props.onClose()}
          />
          <ActionButton
            loading={createTodoListForm.submitting}
            label="Create"
            variant="primary"
          />
        </div>
      </Form>
    </div>
  )
}
