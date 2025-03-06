import type { User } from '../state/userState'

const WS_URL = 'ws://localhost:4322/ws/'

export const editTodoListWs = (user: User, todoListId: number) => {
  const ws = new WebSocket(`${WS_URL}todo-list/${todoListId}?access_token=${user.accessToken}`)
  ws.onopen = () => {
    console.log(`editTodoListWs: connected to ${WS_URL}todo-list/${todoListId}`)
  }
  ws.onerror = (error) => {
    console.error('editTodoListWs: error:', error)
  }
  ws.onclose = () => {
    console.log('editTodoListWs: closed')
  }
  
  return ws
}
