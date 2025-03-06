import {
  For,
  createEffect,
  createSignal,
  on,
  onMount,
  onCleanup,
} from 'solid-js'

import userState from '../../state/userState'
import todoItemState from '../../state/todoItemState'
import activeState from '../../state/activeState'
import todoActions from '../../http-actions/todoActions'
import { IconButton } from '../common/IconButton'
import CreateTodoItemForm from '../forms/CreateTodoItemForm'
import { type TodoItem as TodoItemType } from '../../state/todoItemState'
import TodoItem from './TodoItem'
import { editTodoListWs } from '../../web-sockets/todoWs'
import { Icon } from '@iconify-icon/solid'

type TodoListProps = {
  todoListId?: number // For restful version (TODO)
}

export default function TodoList(props: TodoListProps) {
  const [active, setActive] = activeState // not needed in restful version (TODO remove when/if done)
  const [todoItems, setTodoItems] = todoItemState
  const [user, _setUser] = userState
  const [showCreateTodoItemForm, setShowCreateTodoItemForm] =
    createSignal(false)
  const todoListId = props.todoListId ?? active.todoList?.id
  const [ws, setWs] = createSignal<WebSocket | undefined>(undefined)
  const [todoItemEditState, setTodoItemEditState] = createSignal<{
    [index: number]: { description: string } | undefined
  }>(Object.fromEntries(todoItems.map((_, index) => [index, undefined])))

  console.log('tiEditState', todoItemEditState())

  createEffect(
    on(
      () => ws(),
      (ws) => {
        console.log('active.todoList', active.todoList)

        if (!ws) {
          return
        }

        ws.onmessage = (event: MessageEvent<any>) => {
          const data = event.data
          const message = JSON.parse(data)
          console.log('received message:', message)

          if (message.action === 'init') {
            const activeMembers = message.data.users

            Object.keys(activeMembers).forEach((userId: string) => {
              console.log('userId', userId)
              setActive(
                'todoList',
                'members',
                (member) => member.user.id === parseInt(userId),
                'active',
                true,
              )
            })
          }

          if (message.action === 'connect') {
            if (message.user.id === user.userId) {
              return
            }

            setActive(
              'todoList',
              'members',
              (member) => member.user.id === message.user.id,
              'active',
              true,
            )
          }

          if (message.action === 'disconnect') {
            setActive(
              'todoList',
              'members',
              (member) => member.user.id === message.user.id,
              'active',
              false,
            )
          }

          if (message.action === 'todo_item_create') {
            const createdTodoItemId = message.todo_item_id
            todoActions
              .fetchTodoItem(todoListId!, createdTodoItemId)
              .then((todoItem) => {
                todoItem && setTodoItems([...todoItems, todoItem])
              })
          }

          if (message.action === 'todo_item_delete') {
            const deletedTodoItemId = message.todo_item_id
            setTodoItems(
              todoItems.filter((todoItem) => todoItem.id !== deletedTodoItemId),
            )
          }

          if (message.action === 'todo_item_open_for_editing') {
            const index = todoItems.findIndex(
              (todoItem) => todoItem.id === message.todo_item_id,
            )
            setTodoItemEditState({
              ...todoItemEditState(),
              [index]: { description: todoItems[index].description },
            })
          }

          if (message.action === 'todo_item_edit_description') {
            console.log('todo_item_edit_description', message)
            const index = todoItems.findIndex(
              (todoItem) => todoItem.id === message.todo_item_id,
            )
            setTodoItemEditState({
              ...todoItemEditState(),
              [index]: { description: message.description },
            })
          }

          if (message.action === 'todo_item_close_editing') {
            const index = todoItems.findIndex(
              (todoItem) => todoItem.id === message.todo_item_id,
            )
            setTodoItemEditState({
              ...todoItemEditState(),
              [index]: undefined,
            })
          }

          if (message.action === 'todo_item_update') {
            const index = todoItems.findIndex(
              (todoItem) => todoItem.id === message.todo_item_id,
            )
            setTodoItemEditState({
              ...todoItemEditState(),
              [index]: undefined,
            })
            todoActions
              .fetchTodoItem(todoListId!, message.todo_item_id)
              .then((updatedTodoItem) => {
                setTodoItems(index, updatedTodoItem)
              })
          }
        }
      },
    ),
  )

  const wsSendEditDescription = (todoItemId: number, description: string) => {
    ws() && console.log('sending edit description:', description)
    ws()?.send(
      JSON.stringify({
        action: 'todo_item_edit_description',
        todo_item_id: todoItemId,
        description: description,
      }),
    )
  }

  const wsSendCloseEditDescription = (todoItemId: number) => {
    ws()?.send(
      JSON.stringify({
        action: 'todo_item_close_editing',
        todo_item_id: todoItemId,
      }),
    )
  }

  const toggleTodoItemComplete = (index: number) => {
    const todoItem = todoItems[index]
    todoActions
      .updateTodoItem(todoListId!, todoItem.id, {
        completed: !todoItem.completed,
      })
      .then(() => {
        setTodoItems(index, { ...todoItem, completed: !todoItem.completed })
        ws()?.send(
          JSON.stringify({
            action: 'todo_item_update',
            todo_item_id: todoItem.id,
          }),
        )
      })
  }

  const deleteTodoItem = (index: number) => {
    console.log('deleteTodoItem', index)
    console.log('todoItems', todoItems)
    todoActions.deleteTodoItem(todoListId!, todoItems[index].id).then(() => {
      setTodoItems(todoItems.filter((_, i) => i !== index))
      ws()?.send(
        JSON.stringify({
          action: 'todo_item_delete',
          todo_item_id: todoItems[index].id,
        }),
      )
    })
  }

  const updateTodoItem = (index: number, todoItem: TodoItemType) => {
    setTodoItemEditState({
      ...todoItemEditState(),
      [index]: undefined,
    })
    setTodoItems(index, todoItem)
    ws()?.send(
      JSON.stringify({
        action: 'todo_item_update',
        todo_item_id: todoItem.id,
      }),
    )
  }

  const cloneTodoItem = (index: number) => {
    const todoItem = todoItems[index]
    todoActions
      .cloneTodoItem(todoListId!, todoItem.id)
      .then((clonedTodoItem) => {
        ws()?.send(
          JSON.stringify({
            action: 'todo_item_create',
            todo_item_id: clonedTodoItem.id,
          }),
        )
        setTodoItems(todoItems.length, clonedTodoItem)
      })
  }

  createEffect(
    on(
      () => user,
      (user) => user && !user.username && location.assign('/login'),
    ),
  )

  onMount(async () => {
    if (todoListId) {
      // fetch todo list and update active state
      const todoList = await todoActions.fetchTodoList(todoListId)
      const todoListMembers = await todoActions.fetchTodoListMembers(todoListId)
      todoListMembers.push({
        user: todoList.author,
        role: { id: 0, name: 'owner' },
        active: false,
      })

      setActive('todoList', { ...todoList, members: todoListMembers })

      // set ws connection if the todo list is shared
      const members = active.todoList?.members
      const isShared = members
        ? members!.length > 1 ||
          members![0]?.user.id !== active.todoList?.author.id
        : false
      todoActions.fetchTodoItems(todoListId).then(setTodoItems)

      if (isShared) {
        setWs(editTodoListWs(user, todoListId))
      }
    } else {
      location.assign('/todo-lists')
    }
  })

  onCleanup(() => {
    console.log('cleaning up todo list view')
    setActive('todoList', null)
    setTodoItems([])
    ws()?.close()
  })

  return (
    user.username && (
      <div class="flex w-full max-w-3xl grow flex-col">
        {active.todoList?.name && (
          <>
            <div class="container prose mb-8 w-full max-w-full pb-2 ">
              <h1>
                {active.todoList?.name}
                {ws() && user.userId !== active.todoList.author.id && (
                  <>
                    <span>{' ('}</span>
                    <Icon
                      class="mr-1 align-bottom"
                      icon="fluent:person-circle-20-regular"
                    />
                    <span>{active.todoList?.author.username})</span>
                  </>
                )}
              </h1>
              <p class="whitespace-pre-wrap">{active.todoList?.description}</p>
              {(active.todoList?.members?.length ?? 0) > 1 && (
                <div>
                  <h3>Members</h3>
                  <ul>
                    <li>
                      {`${user.username} (you) - `}
                      {
                        active.todoList?.members?.find(
                          (member) => member.user.id === user.userId,
                        )?.role.name
                      }
                    </li>
                    {active.todoList?.members
                      ?.filter((member) => member.user.id !== user.userId)
                      .map((member) => (
                        <li>
                          {member.user.username} - {member.role.name}{' '}
                          {member.active ? ' (present)' : ''}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
            <div class="flex w-full max-w-full flex-col">
              {showCreateTodoItemForm() ? (
                <CreateTodoItemForm
                  todoListId={active.todoList?.id!}
                  onSuccess={(createdTodoItem) => {
                    setShowCreateTodoItemForm(false)
                    ws()?.send(
                      JSON.stringify({
                        action: 'todo_item_create',
                        todo_item_id: createdTodoItem.id,
                      }),
                    )
                  }}
                  onClose={() => setShowCreateTodoItemForm(false)}
                />
              ) : (
                <IconButton
                  icon="system-uicons:create"
                  iconClass="text-yellow-500"
                  label="New task"
                  onClick={() => {
                    console.log('showCreateTodoItemForm')
                    showCreateTodoItemForm()
                    return setShowCreateTodoItemForm(true)
                  }}
                />
              )}
            </div>
            <div class="over container mt-16 w-full max-w-full">
              <For each={todoItems}>
                {(todoItem, index) => (
                  <TodoItem
                    todoItem={todoItem}
                    index={index()}
                    editState={todoItemEditState()[index()]}
                    updateEditState={(index, newEditState) => {
                      setTodoItemEditState({
                        ...todoItemEditState(),
                        [index]: newEditState,
                      })
                      newEditState
                        ? wsSendEditDescription(
                            todoItem.id,
                            newEditState.description,
                          )
                        : wsSendCloseEditDescription(todoItem.id)
                    }}
                    ws={ws()}
                    toggleComplete={toggleTodoItemComplete}
                    update={updateTodoItem}
                    delete={deleteTodoItem}
                    clone={cloneTodoItem}
                  />
                )}
              </For>
            </div>
          </>
        )}
      </div>
    )
  )
}
