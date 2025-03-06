import { makePersisted } from '@solid-primitives/storage'
import { createStore } from 'solid-js/store'

export type User = {
  userId: number | null
  username: string | null
  accessToken: string | null
  refreshToken: string | null
}

export default makePersisted(
  createStore<User>({
    userId: null,
    username: null,
    accessToken: null,
    refreshToken: null,
  }),
  { name: 'userData' },
)
