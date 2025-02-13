import { PropsWithChildren } from "react";
import { isTauri } from "../utils/commands";
import styled from "styled-components";

const LinkStyled = styled.a`
  color: ${({ theme }) => theme.elements.link.color};
  text-decoration: underline;
  cursor: pointer;
  &:hover {
    color: ${({ theme }) => theme.elements.link.hover.color};
  }
`;

function openUrl(url: string) {
  import("@tauri-apps/api").then(({ shell }) => {
    shell.open(url);
  });
}

/*
 * Wrapper for <a>
 * When it runs in Tauri it will use `shell.open` instead of the default behavior
 */
export default function Link(props: PropsWithChildren<any>) {
  if (isTauri) {
    const href = props.href;
    props = { ...props, href: null };
    return <LinkStyled onClick={() => openUrl(href)} {...props} />;
  }
  return <LinkStyled {...props} />;
}
