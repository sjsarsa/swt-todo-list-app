import { createForm, required, type SubmitHandler } from '@modular-forms/solid'
import { TextInput } from './TextInput'
import userState from '../../state/userState'
import { ActionButton } from '../common/ActionButton'
import userActions from '../../http-actions/userActions'
import { createEffect, createSignal, on } from 'solid-js'
import { FormError } from './FormError'

type LoginForm = {
  username: string
  password: string
}

export default function LoginForm() {
  const [loginForm, { Form, Field }] = createForm<LoginForm>()
  const [user, setUser] = userState
  const [loginError, setLoginError] = createSignal<string | undefined>()

  const handleSubmit: SubmitHandler<LoginForm> = (values, event) => {
    event.preventDefault()
    console.log('submitting login form with values:', values)
    userActions
      .login(values)
      .then((userAuthData) => {
        setUser(userAuthData)
        location.assign('/todo-lists')
      })
      .catch((error) => {
        console.log('error:', error)
        setLoginError(error.message)
      })
  }

  createEffect(
    on(
      () => user,
      (user) => user && user.username && location.assign('/todos'),
    ),
  )

  return (
    !user.username && (
      <div class="flex w-9/12 max-w-xl flex-col justify-center">
        <div class="container prose mb-8">
          <h1>Welcome to Todo Manager</h1>
          <p>Please login to use the application.</p>
          <p>
            In case you do not have an account, you can register through{' '}
            <a href="/register">here</a> or through the button below on the
            left.
          </p>
        </div>
        <FormError error={loginError()} formName="login" />
        <Form onSubmit={handleSubmit}>
          <Field
            name="username"
            validate={[required('Please enter your username.')]}
          >
            {(field, props) => (
              <>
                <TextInput
                  {...props}
                  label="Username"
                  type="text"
                  value={field.value}
                  error={field.error}
                  required
                />
              </>
            )}
          </Field>
          <Field
            name="password"
            validate={[required('Please enter your password.')]}
          >
            {(field, props) => (
              <>
                <TextInput
                  {...props}
                  label="Password"
                  type="password"
                  value={field.value}
                  error={field.error}
                  required
                />
              </>
            )}
          </Field>
          <div class="mt-4 flex justify-between">
            <ActionButton
              type="button"
              loading={loginForm.submitting}
              label="To Registration"
              variant="secondary"
              onClick={() => location.assign('/register')}
            />
            <ActionButton
              loading={loginForm.submitting}
              label="Login"
              variant="primary"
            />
          </div>
        </Form>
      </div>
    )
  )
}
