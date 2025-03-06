import { Icon } from '@iconify-icon/solid'
import { IconButton } from '../common/IconButton'
import type { TodoList as TodoListType } from '../../state/todoListState'
import { createSignal } from 'solid-js'
import EditTodoListForm from '../forms/EditTodoListForm'
import TodoListDeleteConfirmationDialog from './TodoListDeleteConfirmationDialog'
import dialogUtil from '../../util/dialogUtil'
import userState from '../../state/userState'

type TodoListProps = {
  todoList: TodoListType
  index: number
  handleSelectTodoList: (todoList: TodoListType) => void
  clone: (id: number, newName: string) => void
  update: (id: number, todoList: TodoListType) => void
  delete: (id: number) => void
}

const TodoList = (props: TodoListProps) => {
  const [user, _setUser] = userState
  const [showEditTodoListForm, setShowEditTodoListForm] = createSignal(false)
  createSignal(false)

  const completionText =
    (props.todoList.todos?.length ?? 0 > 0)
      ? `${props.todoList.todos?.reduce((acc, todo) => {
          if (todo.completed) {
            return acc + 1
          }
          return acc
        }, 0)}/${props.todoList.todos?.length} completed`
      : 'no todos'

  const deleteConfirmationDialogId = `todo-list-delete-confirmation-${props.todoList.id}`

  return (
    <div class="flex max-w-full items-center justify-between border-t-2 border-gray-200 pb-4 pt-4">
      {showEditTodoListForm() ? (
        <EditTodoListForm
          todoListIndex={props.index}
          todoList={props.todoList}
          onSuccess={(updatedTodoList) => {
            props.update(props.todoList.id, updatedTodoList)
            setShowEditTodoListForm(false)
          }}
          onClose={() => setShowEditTodoListForm(false)}
        />
      ) : (
        <div class="flex flex-grow">
          <a
            href="/todos"
            class="flex w-full flex-grow cursor-pointer flex-row rounded-lg p-2 transition-colors hover:bg-gray-700 "
            onClick={() => props.handleSelectTodoList(props.todoList)}
          >
            <span class="h-fit w-2/5 scroll-ms-4 overflow-x-auto whitespace-pre-wrap text-2xl font-medium">
              {props.todoList.name}
            </span>
            <span class="w-3/5 overflow-x-auto whitespace-pre-wrap text-xl">
              {props.todoList.description}
            </span>
            <span class="h-fit w-2/5 overflow-x-auto whitespace-pre-wrap text-xl">
              {completionText}
            </span>
            <Icon class="h-fit text-4xl" icon="fluent:arrow-enter-20-regular" />
          </a>
          <div class="mt-1 flex h-fit flex-shrink">
            <IconButton
              icon="fluent:edit-20-regular"
              iconClass="text-yellow-600"
              disabled={props.todoList.role !== 'owner'}
              onClick={() => setShowEditTodoListForm(true)}
            />
            <IconButton
              icon="fluent:copy-20-regular"
              iconClass="text-sky-700"
              onClick={() =>
                props.clone(
                  props.todoList.id,
                  props.todoList.name + ' (cloned)',
                )
              }
            />
            <IconButton
              icon="fluent:delete-20-regular"
              iconClass="text-orange-700"
              disabled={props.todoList.role !== 'owner'}
              onClick={() => {
                props.todoList.author.id !== user.userId ||
                (props.todoList.members?.length ?? 0) > 0 ||
                (props.todoList.todos?.length ?? 0) > 0
                  ? dialogUtil.open(deleteConfirmationDialogId)
                  : props.delete(props.todoList.id)
              }}
            />
          </div>
          <TodoListDeleteConfirmationDialog
            modalId={deleteConfirmationDialogId}
            todoList={props.todoList}
            onClose={() => dialogUtil.close(deleteConfirmationDialogId)}
            onDelete={(id) => {
              props.delete(id)
            }}
          />
        </div>
      )}
    </div>
  )
}

export default TodoList
