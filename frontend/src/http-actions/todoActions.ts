import http from '../util/httpUtil'
import type { UserDto } from './userActions'

const BASE_URL = '/api/todo-lists'

/* TodoList DTOs */

export type TodoListRoleDto = {
  id: number
  name: 'owner' | 'editor' | 'viewer'
}

export type TodoListMemberDto = {
  user: UserDto
  role: TodoListRoleDto
  active?: boolean
}

export type TodoListDto = {
  id: number
  name: string
  author: UserDto
  role: string
  description: string
}

export type TodoItemDto = {
  id: number
  author_id: number
  todo_list_id: number
  description: string
  completed: boolean
  created: string
  updated: string
}

/* TodoList Actions */

const fetchTodoLists = async (): Promise<TodoListDto[]> => {
  return http.get(`${BASE_URL}`)
}

const fetchTodoList = async (id: number): Promise<TodoListDto> => {
  return http.get(`${BASE_URL}/${id}`)
}

const createTodoList = async (data: Record<string, any>) => {
  return http.post(`${BASE_URL}`, data)
}

const updateTodoList = async (id: number, data: Record<string, any>) => {
  return http.put(`${BASE_URL}/${id}`, data)
}

const deleteTodoList = async (id: number) => {
  return http.del(`${BASE_URL}/${id}`)
}

const cloneTodoList = async (id: number, newName: string) => {
  return http.post(`${BASE_URL}/${id}/clone`, { name: newName })
}

/* TodoItem actions */

const fetchTodoItems = async (todoListId: number): Promise<TodoItemDto[]> => {
  return http.get(`${BASE_URL}/${todoListId}/todos`)
}

const fetchTodoItem = async (todoListId: number, id: number) => {
  return http.get(`${BASE_URL}/${todoListId}/todos/${id}`)
}

const createTodoItem = async (
  todoListId: number,
  data: Record<string, any>,
): Promise<TodoItemDto> => {
  return http.post(`${BASE_URL}/${todoListId}/todos`, data)
}

const updateTodoItem = async (
  todoListId: number,
  id: number,
  data: Record<string, any>,
): Promise<TodoItemDto> => {
  return http.put(`${BASE_URL}/${todoListId}/todos/${id}`, data)
}

const deleteTodoItem = async (todoListId: number, id: number): Promise<boolean> => {
  return http.del(`${BASE_URL}/${todoListId}/todos/${id}`)
} 

const cloneTodoItem = async (todoListId: number, id: number): Promise<TodoItemDto> => {
  return http.post(`${BASE_URL}/${todoListId}/todos/${id}/clone`)
}

const shareTodoList = async (todoListId: number, data: Record<string, any>): Promise<boolean> => {
  return http.post(`${BASE_URL}/${todoListId}/share`, data)
}

const fetchTodoListMembers = async (todoListId: number) => {
  return (await http.get(
    `${BASE_URL}/${todoListId}/members`,
  )) as TodoListMemberDto[]
}

const fetchTodoListRoles = async () => {
  return (await http.get(`${BASE_URL}/roles`)) as TodoListRoleDto[]
}

export default {
  fetchTodoLists,
  fetchTodoList,
  createTodoList,
  updateTodoList,
  deleteTodoList,
  cloneTodoList,
  shareTodoList,
  fetchTodoItem,
  fetchTodoItems,
  createTodoItem,
  updateTodoItem,
  deleteTodoItem,
  cloneTodoItem,
  fetchTodoListRoles,
  fetchTodoListMembers,
}
