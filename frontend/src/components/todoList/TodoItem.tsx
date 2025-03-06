import { IconButton } from '../common/IconButton'
import type { TodoItem as TodoItemType } from '../../state/todoItemState'
import EditTodoItemForm, { type TodoItemEditState } from '../forms/EditTodoItemForm'


type TodoItemProps = {
  todoItem: TodoItemType
  index: number
  editState: TodoItemEditState | undefined
  ws: WebSocket | undefined
  toggleComplete: (id: number) => void
  updateEditState: (index: number, newEditState: TodoItemEditState | undefined) => void
  update: (id: number, todoItem: TodoItemType) => void
  delete: (id: number) => void
  clone: (id: number) => void
}

const TodoItem = (props: TodoItemProps) => {
  const { todoItem, index } = props

  console.log('editState', props.editState)

  return (
    <div
      class="mt-2 flex max-w-full items-center justify-between border-t-2 border-gray-200 pb-4 pt-4"
      style={{
        'text-decoration': todoItem.completed ? 'line-through' : 'none',
      }}
    >
      {props.editState ? (
        <EditTodoItemForm
          todoItemIndex={index}
          todoItem={todoItem}
          editState={props.editState}
          onSuccess={(updatedTodoItem) => {
            props.update(index, updatedTodoItem)
          }}
          onInput={(value) => props.updateEditState(index, {description: value})}
          onClose={() => props.updateEditState(index, undefined)}
        />
      ) : (
        <>
          <span
            class="scroll-ms-4 overflow-x-auto whitespace-pre-wrap text-xl"
            onClick={() => props.toggleComplete(index)}
          >
            {todoItem.description}
          </span>
          <div class="flex">
            <IconButton
              icon="fluent:copy-20-regular"
              iconClass="text-sky-700"
              onClick={() => props.clone(index)}
            />
            <IconButton
              icon="fluent:edit-20-regular"
              iconClass="text-yellow-600"
              onClick={() => props.updateEditState(index, {description: todoItem.description})}
            />
            <IconButton
              icon="fluent:delete-20-regular"
              iconClass="text-orange-800"
              onClick={() => props.delete(index)}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default TodoItem
