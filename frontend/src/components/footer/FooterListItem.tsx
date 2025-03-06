type FooterListItemProps = {
  title: string
  href: string
}

const FooterListItem = (props: FooterListItemProps) => {
  return (
    <li>
      <a
        href={props.href}
        target="_blank"
        rel="noopener noreferrer"
        class="hover:underline"
      >
        {props.title}
      </a>
    </li>
  )
}

export default FooterListItem
