import http from '../util/httpUtil'

const BASE_URL = '/api/users'

export type UserDto = {
  id: number
  username: string
}

const fetchUserById = async (id: string) => {
  return http.get(`${BASE_URL}/${id}`)
}

const fetchUsers = async () => {
  return http.get(BASE_URL)
}

const findUsers = async (queryString: string) => {
  return (await http.get(
    `${BASE_URL}?` + new URLSearchParams({ queryString }),
  )) as UserDto[]
}

const createUser = async (data: Record<string, any>) => {
  return http.post(BASE_URL, data)
}

const updateUser = async (id: string, data: Record<string, any>) => {
  return http.put(`${BASE_URL}/${id}`, data)
}

const deleteUser = async (id: string) => {
  return http.del(`${BASE_URL}/${id}`)
}

const login = async (data: Record<string, any>) => {
  return http.post(`${BASE_URL}/login`, data)
}

export default {
  fetchUserById,
  fetchUsers,
  findUsers,
  createUser,
  updateUser,
  deleteUser,
  login,
}
