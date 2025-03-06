import type { TodoList } from '../../state/todoListState'
import userState from '../../state/userState'
import { ActionButton } from '../common/ActionButton'

type TodoListDeleteConfirmationDialogProps = {
  modalId: string
  todoList: TodoList
  onClose: () => void
  onDelete: (id: number) => void
}


const TodoListDeleteConfirmationDialog = (
  props: TodoListDeleteConfirmationDialogProps,
) => {
  const [user, _setUser] = userState

  return (
    <dialog id={props.modalId} class="modal">
      <div class="max-w-2xl flex flex-col py-4 px-8 space-y-4 bg-slate-400 rounded-lg shadow-lg">
        <h1 class="text-3xl font-bold text-gray-800">
          Deleting todo list "{props.todoList.name}"
        </h1>
        <p class="ml-4 mt-2 text-xl font-semibold text-gray-700">
          {props.todoList.todos?.length ? <>This todo list is not empty.<br/></> : null}
          {props.todoList.author.id !== user.userId || props.todoList.members?.length ? <>This todo list is shared with other users.<br/></> : null}
          <br/>
          Are you sure you want to delete this todo list?
        </p>
        <div class="mt-4 flex flex-row justify-between space-x-4">
          <ActionButton
            label="Cancel"
            variant="primary"
            onClick={() => props.onClose()}
          />
          <ActionButton
            label="Delete"
            variant="danger"
            onClick={() => {
              props.onDelete(props.todoList.id)
              props.onClose()
            }}
          />
        </div>
      </div>
    </dialog>
  )
}

export default TodoListDeleteConfirmationDialog
