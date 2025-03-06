import { createForm, minLength, required, type SubmitHandler } from '@modular-forms/solid'
import { TextInput } from './TextInput'
import userState from '../../state/userState'
import { ActionButton } from '../common/ActionButton'
import userActions from '../../http-actions/userActions'
import { FormError } from './FormError'
import { createEffect, createSignal, on } from 'solid-js'

type RegisterForm = {
  username: string
  password: string
}

export default function RegisterForm() {
  const [registerForm, { Form, Field }] = createForm<RegisterForm>()
  const [user, setUser] = userState
  const [registerError, setRegisterError] = createSignal<string | undefined>()

  const handleSubmit: SubmitHandler<RegisterForm> = (values, event) => {
    event.preventDefault()
    console.log('submitting register form with values:', values)
    userActions
      .createUser(values)
      .then((userAuthData) => {
        setUser(userAuthData)
        location.assign('/todo-lists')
      })
      .catch((error) => {
        console.log('error:', error)
        setRegisterError(error.message)
      })
  }

  createEffect(
    on(
      () => user,
      (user) => user && user.username && location.assign('/todos'),
    ),
  )

  return (
    <div class="flex max-w-xl flex-col justify-center">
      <div class="container prose mb-8">
        <h1>Register an account</h1>
        <p>An account is needed to use the Todo Manager.</p>
        <p>
          In case you already have an account, please login through <a href="/login">here</a> or
          through the button below on the left.
        </p>
      </div>
      <FormError error={registerError()} formName="login" />
      <Form onSubmit={handleSubmit}>
        <Field name="username" validate={[required('Please enter your username.')]}>
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
          validate={[
            required('Please enter your password.'),
            minLength(8, 'You password must have 8 characters or more.'),
          ]}
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
            loading={registerForm.submitting}
            label="To Login"
            variant="secondary"
            onClick={() => location.assign('/login')}
          />
          <ActionButton loading={registerForm.submitting} label="Register" variant="primary" />
        </div>
      </Form>
    </div>
  )
}
