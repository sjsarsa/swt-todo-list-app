import { makePersisted } from '@solid-primitives/storage'
import { createStore } from 'solid-js/store'
import { type TodoList } from './todoListState'

// Because we don't have a restful api
export type ActiveState = {
  todoList: TodoList | null
}

export default makePersisted(
  createStore<ActiveState>({
    todoList: null,
  }),
  { name: 'activeData' },
)
