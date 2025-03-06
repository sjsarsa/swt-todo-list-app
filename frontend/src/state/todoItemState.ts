import { createStore } from 'solid-js/store'

export type TodoItem = {
  id: number
  todo_list_id: number
  author_id: number
  description: string
  completed: boolean
  created: string
  updated: string
}

export default createStore<TodoItem[]>([])
