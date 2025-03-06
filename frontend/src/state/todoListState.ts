import { createStore } from 'solid-js/store'
import type { TodoItem } from './todoItemState'
import type { UserDto } from '../http-actions/userActions'
import type { TodoListMemberDto } from '../http-actions/todoActions'

export type TodoList = {
  id: number
  name: string
  author: UserDto
  role: string
  description: string
  members?: TodoListMemberDto[]
  todos?: TodoItem[]
}

export default createStore<TodoList[]>([])
