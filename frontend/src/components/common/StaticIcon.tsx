import clsx from 'clsx'

const icons = {
  'flat-color-icons:todo-list': (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={28}
      height={28}
      viewBox="0 0 48 48"
    >
      <path
        fill="#3f51b5"
        d="m17.8 18.1l-7.4 7.3l-4.2-4.1L4 23.5l6.4 6.4l9.6-9.6zm0-13l-7.4 7.3l-4.2-4.1L4 10.5l6.4 6.4L20 7.3zm0 26l-7.4 7.3l-4.2-4.1L4 36.5l6.4 6.4l9.6-9.6z"
      ></path>
      <path
        fill="#90caf9"
        d="M24 22h20v4H24zm0-13h20v4H24zm0 26h20v4H24z"
      ></path>
    </svg>
  ),
}

type StaticIconProps = {
  class: string
  icon: keyof typeof icons
}

const StaticIcon = (props: StaticIconProps) => {
  return (
    <div class={clsx('iconify', props.class)} data-icon={props.icon}>
      {icons[props.icon]}
    </div>
  )
}

export default StaticIcon
