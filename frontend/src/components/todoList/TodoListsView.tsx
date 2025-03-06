import { For, createEffect, createSignal, on, onMount } from 'solid-js'
import userState from '../../state/userState'
import todoListState, {
  type TodoList as TodoListType,
} from '../../state/todoListState'
import activeState from '../../state/activeState'
import todoActions from '../../http-actions/todoActions'
import { IconButton } from '../common/IconButton'
import CreateTodoListForm from '../forms/CreateTodoListForm'
import TodoList from './TodoList'

export default function TodoLists() {
  const [todoLists, setTodoLists] = todoListState
  const [ownTodoLists, setOwnTodoLists] = createSignal<TodoListType[]>([])
  const [sharedTodoLists, setSharedTodoLists] = createSignal<TodoListType[]>([])

  const [user, _setUser] = userState
  const [_activeState, setActiveState] = activeState
  const [showNewTodoListForm, setShowNewTodoListForm] = createSignal(false)

  const removeTodoList = async (id: number) => {
    // remove all todo items first
    // TODO: refactor to use a single api call
    const todoList = todoLists.find((todoList) => todoList.id === id)
    if (todoList) {
      for (const todoItem of todoList.todos ?? []) {
        await todoActions.deleteTodoItem(todoList.id, todoItem.id)
      }
    }
    // remove the todo list
    todoActions.deleteTodoList(id).then(() => {
      setTodoLists(todoLists.filter((todoList) => todoList.id !== id))
    })
  }

  const updateTodoList = (id: number, updatedTodoList: TodoListType) => {
    const index = todoLists.findIndex((todoList) => todoList.id === id)
    console.log('updating todo list:', updatedTodoList)
    setTodoLists(index, updatedTodoList)
  }

  const cloneTodoList = (id: number, newName: string) => {
    const todoList = todoLists.find((todoList) => todoList.id === id)
    if (todoList) {
      todoActions.cloneTodoList(todoList.id, newName).then(async (clonedTodoList) => {
        const todoItems = await todoActions.fetchTodoItems(clonedTodoList.id)
        clonedTodoList.todos = todoItems
        setTodoLists(todoLists.length, clonedTodoList)
      })
    }
  }

  const handleSelectTodoList = (todoList: TodoListType) => {
    setActiveState('todoList', todoList)
    // location.assign(`/todo-lists/${todoList.id}`)  // for restful version
  }

  createEffect(
    on(
      () => user,
      (user) => user && !user.username && location.assign('/login'),
    ),
  )

  onMount(async () => {
    const todoLists = (await todoActions.fetchTodoLists()) as TodoListType[]
    // TODO: refactor to use a single api call
    for (const todoList of todoLists) {
      const todos = await todoActions.fetchTodoItems(todoList.id)
      todoList.todos = todos
      const members = await todoActions.fetchTodoListMembers(todoList.id)
      todoList.members = members
    }
    setTodoLists(todoLists)
  })

  createEffect(() => {
    setOwnTodoLists(
      todoLists.filter((todoList) => todoList.author.id === user.userId),
    )
    setSharedTodoLists(
      todoLists.filter((todoList) => todoList.author.id !== user.userId),
    )
  })

  return (
    user.username && (
      <div class="flex w-full max-w-4xl grow flex-col">
        <div class="container prose mb-8 w-full max-w-full pb-2">
          <h1>My todo lists</h1>
        </div>
        <div class="flex w-full max-w-full flex-col">
          {showNewTodoListForm() ? (
            <CreateTodoListForm
              onClose={() => setShowNewTodoListForm(false)}
              onSuccess={() => setShowNewTodoListForm(false)}
            />
          ) : (
            <IconButton
              icon="fluent:form-new-20-regular"
              iconClass="mr-2 text-yellow-500"
              label="New todo list"
              onClick={() => {
                return setShowNewTodoListForm(true)
              }}
            />
          )}
        </div>
        <div class="over container mt-16 w-full max-w-full border-b-2 border-gray-200">
          {ownTodoLists().length === 0 ? (
            <div class="flex max-w-full flex-col items-center justify-between border-t-2 border-gray-200 pb-6 pt-6">
              <p class="text-xl">
                Create your first todo list with the button above
              </p>
            </div>
          ) : (
            <For each={ownTodoLists()}>
              {(todoList, index) => (
                <TodoList
                  todoList={todoList}
                  index={index()}
                  handleSelectTodoList={handleSelectTodoList}
                  clone={cloneTodoList}
                  update={updateTodoList}
                  delete={removeTodoList}
                />
              )}
            </For>
          )}
        </div>
        {sharedTodoLists().length > 0 && (
          <>
            <div class="container prose mb-8 mt-16 w-full max-w-full pb-2">
              <h1>Shared with me</h1>
            </div>
            <div class="over container w-full max-w-full border-b-2 border-gray-200">
              <For each={sharedTodoLists()}>
                {(todoList, index) => (
                  <TodoList
                    todoList={todoList}
                    index={index()}
                    handleSelectTodoList={handleSelectTodoList}
                    clone={cloneTodoList}
                    update={updateTodoList}
                    delete={removeTodoList}
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
