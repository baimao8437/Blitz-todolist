import { Suspense } from "react"
import { Image, Link, BlitzPage, useMutation, Routes, useQuery, useRouter } from "blitz"
import Layout from "app/core/layouts/Layout"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import logout from "app/auth/mutations/logout"
import logo from "public/logo.png"
import getTodos from "app/todos/queries/getTodos"
import { Form, FormProps } from "app/core/components/Form"
import { Field } from "react-final-form"
import updateTodo from "app/todos/mutations/updateTodo"
import createTodo from "app/todos/mutations/createTodo"
import { FORM_ERROR } from "app/todos/components/TodoForm"

const Todos = (userId) => {
  const currentUser = useCurrentUser()
  const [{ todos }, { refetch }] = useQuery(getTodos, {
    where: { userId: currentUser?.id },
  })

  const [updateTodoMutation] = useMutation(updateTodo)
  const [createTodoMutation] = useMutation(createTodo)

  if (!currentUser) return null
  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-2xl my-1 font-bold">My Todo List</h1>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <Form
              initialValues={todo}
              onSubmit={async (values) => {
                try {
                  await updateTodoMutation({
                    id: values.id,
                    name: values.name,
                    completed: values.completed,
                  })
                  refetch()
                } catch (error: any) {
                  console.error(error)
                  return {
                    [FORM_ERROR]: error.toString(),
                  }
                }
              }}
            >
              <Field
                name="name"
                render={({ input, meta }) => {
                  return (
                    <div className="my-1">
                      <input
                        className="border-2 px-2 mx-1 rounded-md border-l-violet-100"
                        {...input}
                        placeholder="Name"
                      />
                      {meta.dirty && (
                        <button
                          className=" bg-violet-500 hover:bg-violet-700 rounded-md px-1"
                          type="submit"
                        >
                          Save
                        </button>
                      )}
                    </div>
                  )
                }}
              />
            </Form>
          </li>
        ))}
      </ul>
      <div>
        <Form
          onSubmit={async (values) => {
            try {
              await createTodoMutation({ userId: currentUser?.id, ...values })
              refetch()
            } catch (error: any) {
              console.error(error)
              return {
                [FORM_ERROR]: error.toString(),
              }
            }
          }}
        >
          <Field
            name="name"
            render={({ input, meta }) => {
              return (
                <div>
                  <input
                    className="border-2 px-2 mx-1 rounded-md border-l-violet-100"
                    {...input}
                    placeholder="New Todo"
                  />
                  {meta.dirty && (
                    <button
                      className=" bg-violet-500 hover:bg-violet-700 rounded-md px-1"
                      type="submit"
                    >
                      Add Todo
                    </button>
                  )}
                </div>
              )
            }}
          />
        </Form>
      </div>
    </div>
  )
}

const UserInfo = () => {
  const currentUser = useCurrentUser()
  const [logoutMutation] = useMutation(logout)

  if (currentUser) {
    return (
      <div className="flex items-center justify-between">
        <div>
          User name: <code>{currentUser.name}</code>
        </div>
        <button
          className="button small"
          onClick={async () => {
            await logoutMutation()
          }}
        >
          Logout
        </button>
      </div>
    )
  } else {
    return (
      <>
        <Link href={Routes.SignupPage()}>
          <a className="button small">
            <strong>Sign Up</strong>
          </a>
        </Link>
        <Link href={Routes.LoginPage()}>
          <a className="button small">
            <strong>Login</strong>
          </a>
        </Link>
      </>
    )
  }
}

const Home: BlitzPage = () => {
  return (
    <div className="container min-h-screen bg-gray py-6 flex flex-col justify-center relative overflow-hidden">
      <main className="rounded-lg max-w-md mx-auto relative px-6 pt-10 pb-8 bg-white shadow-xl ring-1 ring-gray-900/5">
        <div className="logo px-10">
          <Image src={logo} alt="blitzjs" />
        </div>
        <div className="divide-y divide-violet-600 my-2">
          <div>
            <Suspense fallback="Loading...">
              <Todos />
            </Suspense>
          </div>
          <div className="my-4 py-2">
            <Suspense fallback="Loading...">
              <UserInfo />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  )
}

Home.suppressFirstRenderFlicker = true
Home.getLayout = (page) => <Layout title="Home">{page}</Layout>

export default Home
