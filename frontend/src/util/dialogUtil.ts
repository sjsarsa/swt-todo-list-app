const open = (dialogId: string) => {
  const dialog = document.getElementById(dialogId) as HTMLDialogElement
  dialog.showModal()
}

const close = (dialogId: string) => {
  const dialog = document.getElementById(dialogId) as HTMLDialogElement
  dialog.close()
}

export default { open, close }
