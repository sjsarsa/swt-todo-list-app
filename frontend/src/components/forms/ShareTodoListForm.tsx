import { createForm, required, type SubmitHandler } from '@modular-forms/solid'
import { ActionButton } from '../common/ActionButton'
import userState from '../../state/userState'
import todoActions, {
  type TodoListMemberDto,
  type TodoListRoleDto as TodoListRoleDto,
} from '../../http-actions/todoActions'
import userActions, { type UserDto } from '../../http-actions/userActions'
import { FormError } from './FormError'
import { createSignal, onMount } from 'solid-js'
import { SelectInput } from './SelectInput'
import '@thisbeyond/solid-select/style.css'
import type { TodoList } from '../../state/todoListState'
import { Icon } from '@iconify-icon/solid'

type shareTodoListForm = {
  users: UserDto[]
  role: TodoListRoleDto
}

type shareTodoListFormProps = {
  dialogId: string
  todoList: TodoList
  onClose: () => void
  onSuccess: (members: TodoListMemberDto[]) => void
}

export default function ShareTodoListForm(props: shareTodoListFormProps) {
  const [currentUser, _setCurrentUser] = userState
  const [todoListMembers, setTodoListMembers] = createSignal<
    TodoListMemberDto[]
  >([])
  const [shareTodoListForm, { Form, Field }] = createForm<shareTodoListForm>()
  const [submitError, setSubmitError] = createSignal<string | undefined>()
  const [userOptions, setUserOptions] = createSignal<UserDto[]>([])
  const [todoListRoles, setTodoListRoles] = createSignal<TodoListRoleDto[]>([])
  const [shareSuccess, setShareSuccess] = createSignal(false)

  onMount(() => {
    todoActions.fetchTodoListRoles().then((roles) => {
      setTodoListRoles(roles)
    })
    todoActions.fetchTodoListMembers(props.todoList.id).then((members) => {
      members.push({
        user: props.todoList.author,
        role: { id: 0, name: 'owner' },
        active: false,
      })
      setTodoListMembers(members)
    })
  })

  const handleSubmit: SubmitHandler<shareTodoListForm> = (values) => {
    console.log('submitting share todo list form with values:', values)

    todoActions
      .shareTodoList(props.todoList.id, {
        user_ids: values.users.map((user) => user.id),
        role_id: values.role.id,
      })
      .then(() => {
        console.log('todo list shared')
        setSubmitError(undefined)
        const newMembers = [
          ...todoListMembers(),
          ...values.users.map((user) => ({
            user,
            role: values.role,
            active: false,
          })),
        ]
        setTodoListMembers(newMembers)

        setShareSuccess(true)
        setTimeout(() => {
          setShareSuccess(false)
        }, 7000)

        props.onSuccess(newMembers)
      })
      .catch((error) => {
        console.log('error:', error)
        setSubmitError(error.message)
        setShareSuccess(false)
      })
  }

  const onUserSelectInput = async (input: string) => {
    input &&
      userActions.findUsers(input).then((users: UserDto[]) => {
        console.log('found users:', users)
        setUserOptions(
          users
            .filter(
              (user) =>
                todoListMembers().find(
                  (member) => member.user.username === user.username,
                ) === undefined,
            )
            .filter((user) => user.username !== currentUser.username),
        )
      })
  }

  return (
    <dialog id={props.dialogId} class="modal">
      <div class="flex w-full max-w-2xl flex-col justify-center self-center rounded-md bg-current px-10 py-6">
        {todoListMembers().length > 0 && (
          <div>
            <div class="container prose mx-auto mb-8 w-full max-w-4xl">
              <h1>Share todo list</h1>
            </div>
            <div class="prose mb-8 w-full px-8">
              <div class="w-full tooltip" data-tip="Edit permissions">
                <button 
                  class="flex w-full justify-between rounded-lg p-2 text-lg font-semibold hover:bg-gray-600"
                  onClick={() => console.log('edit permissions')}
                >
                  Shared with
                  <div>
                    <Icon
                      class="ml-3 align-bottom text-2xl"
                      // icon="fluent:task-list-20-regular"
                      icon="fluent:person-20-regular"
                    />
                    <Icon
                      class="-ml-1 mr-1 align-bottom"
                      // icon="fluent:task-list-20-regular"
                      icon="fluent:edit-12-regular"
                    />
                  </div>
                </button>
              </div>
              <ul>
                {todoListMembers()
                  .filter((member) => member.user.id !== currentUser.userId)
                  .map((member) => (
                    <li>
                      {member.user.username} - {member.role.name}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        )}
        <FormError error={submitError()} formName="shareTodoList" />
        <Form onSubmit={handleSubmit}>
          <Field 
            // @ts-ignore
            name="users"
            validate={[required('Please select at least one user.')]}
          >
            {(field, props) => (
              <SelectInput
                {...props}
                label="Add users"
                onInput={onUserSelectInput}
                onChange={(value: number[]) => {
                  console.log(value)
                  // @ts-ignore
                  shareTodoListForm.internal.fields.users?.value.set(value)
                }}
                format={(user: UserDto, _type) => user.username}
                options={userOptions()}
                multiple
                required
                placeholder="Type to search for users"
                error={field.error}
              />
            )}
          </Field>
          {/* @ts-ignore */}
          <Field name="role">
            {(field, props) => (
              <SelectInput
                {...props}
                label="Role"
                onInput={undefined} // override incompatible modular-forms onInput
                onChange={(value: string) => {
                  // @ts-ignore
                  shareTodoListForm.internal.fields.role?.value.set(value)
                }}
                format={(role: TodoListRoleDto, _type) => role.name}
                value={todoListRoles()[1]}
                options={todoListRoles()}
                error={field.error}
              />
            )}
          </Field>
          <div class="flex justify-center semi-bold text-green-500">
            {shareSuccess() && 'Todo list shared successfully'}
          </div>

          <div class="mt-4 flex justify-between">
            <ActionButton
              type="button"
              loading={shareTodoListForm.submitting}
              label="Close"
              variant="secondary"
              onClick={() => props.onClose?.()}
            />
            <ActionButton
              loading={shareTodoListForm.submitting}
              label="share"
              variant="primary"
            />
          </div>
        </Form>
      </div>
    </dialog>
  )
}
