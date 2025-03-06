import NavItem from './NavItem'
import activeState from '../../state/activeState'
import userState from '../../state/userState'
import { Icon } from '@iconify-icon/solid'
import ShareTodoListForm from '../forms/ShareTodoListForm'
import { createEffect, createSignal } from 'solid-js'
import type { TodoList } from '../../state/todoListState'
import dialogUtil from '../../util/dialogUtil'
import StaticIcon from '../common/StaticIcon'

const TodoListItems = () => {
  const [user, _setUser] = userState
  const [active, setActive] = activeState // not needed in restful version (TODO remove when/if done)
  const [todoList, setTodoList] = createSignal<TodoList | null>(null)

  createEffect(() => {
    console.log('active.todoList', active.todoList)
    if (active.todoList) {
      setTodoList(active.todoList)
    } else {
      setTodoList(null)
    }
  })

  const shareModalId = 'share-modal'

  return (
    <div>
      {user.username ? (
        <NavItem
          label={
            <>
              <Icon
                  class="mr-1 align-bottom text-2xl"
                  icon="fluent:home-20-filled"
              />
              My todo lists
            </>
          }
          href="/todo-lists"
          // onClick={() => location.assign('/todo-lists')}
        />
      ) : (
        <NavItem
          label={
            <>
              <Icon
                class="mr-1 align-bottom text-2xl"
                icon="fluent:person-accounts-20-filled"
              />
              Login or sign up to get started
            </>
          }
        />
      )}
      {todoList() && (
        <>
          <NavItem
            label={
              <>
                <Icon
                  class="align-bottom text-2xl"
                  icon="fluent:task-list-20-regular"
                />
                <Icon
                  class="-ml-1 mr-1 align-bottom"
                  icon="fluent:edit-20-regular"
                />
                {todoList()?.name ?? 'Could not fetch todo list info'}
              </>
            }
          />
          <NavItem
            label={
              <>
                <Icon
                  class="align-bottom text-2xl"
                  // icon="fluent:task-list-20-regular"
                  icon="fluent:share-20-regular"
                />
                <Icon
                  class="-ml-1 mr-1 align-bottom"
                  // icon="fluent:task-list-20-regular"
                  icon="fluent:person-12-regular"
                />
                Share
              </>
            }
            onClick={() => dialogUtil.open(shareModalId)}
          />
          <ShareTodoListForm
            todoList={todoList()!}
            dialogId={shareModalId}
            onClose={() => dialogUtil.close(shareModalId)}
            onSuccess={(newMembers) => {
              setActive('todoList', {
                ...todoList()!,
                members: newMembers,
              })
            }}
          />
        </>
      )}
    </div>
  )
}

export default TodoListItems
