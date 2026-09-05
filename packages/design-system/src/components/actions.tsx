import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

/** Visually hidden until focused; target must exist on every page (#main-content). */
export function SkipLink(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const { children = "Skip to main content", ...rest } = props;
  return (
    <a className="wr-skip-link" href="#main-content" {...rest}>
      {children}
    </a>
  );
}

type ButtonVariant = "secondary" | "primary" | "selected";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({ variant = "secondary", className, type, ...rest }: ButtonProps) {
  const classes = ["wr-button"];
  classes.push(`wr-button--${variant}`);
  if (className) classes.push(className);
  return <button type={type ?? "button"} className={classes.join(" ")} {...rest} />;
}

export type ActionTileProps = {
  icon?: ReactNode;
  label: string;
  /** One line stating what the action does. No marketing copy. */
  consequence?: string;
  active?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * Verb-led primary action. The whole tile is an explicit button (never a
 * hidden click target), 52 px minimum height, signal-pale when active.
 */
export function ActionTile({ icon, label, consequence, active, className, ...rest }: ActionTileProps) {
  const classes = ["wr-action-tile"];
  if (active) classes.push("is-active");
  if (className) classes.push(className);
  return (
    <button type="button" className={classes.join(" ")} aria-current={active ? "true" : undefined} {...rest}>
      {icon ? (
        <span className="wr-action-tile__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span>
        <span className="wr-action-tile__label">{label}</span>
        {consequence ? <span className="wr-action-tile__consequence">{consequence}</span> : null}
      </span>
    </button>
  );
}
