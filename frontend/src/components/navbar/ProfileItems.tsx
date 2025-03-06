import NavItem from './NavItem'
import userState from '../../state/userState'
import { Show } from 'solid-js'
import { Icon } from '@iconify-icon/solid'

const ProfileItems = () => {
  const [user, setUser] = userState
  console.log('user:', user)
  console.log('username:', user.username)

  const handleLogout = () => {
    location.assign('/login')
    setUser({
      userId: undefined,
      username: undefined,
      accessToken: undefined,
      refreshToken: undefined,
    })
  }

  return (
    <Show when={user.username}>
      <div>
        <NavItem
          label={
            <>
              <Icon
                class="mr-1 align-bottom text-2xl"
                icon="fluent:person-circle-20-regular"
              />
              {user.username}{' '}
            </>
          }
        />
        <NavItem label="Logout" onClick={handleLogout} />
      </div>
    </Show>
  )
}

export default ProfileItems
