import type { JSX } from 'solid-js/jsx-runtime'

type DialogProps = {
  show: boolean
  title: string
  message: string
  children: JSX.Element
  ref: (el: HTMLDialogElement) => void
  onClose: () => void
}

const Dialog = (props: DialogProps) => {
  return (
    <dialog id="my_modal_1" class="modal" ref={props.ref}>
      <div class="modal-box">
        <h3 class="text-lg font-bold">Hello!</h3>
        <p class="py-4">Press ESC key or click the button below to close</p>
        <div class="modal-action">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            {props.children}
            <button class="btn">Close</button>
          </form>
        </div>
      </div>
    </dialog>
  )
}

export default Dialog
