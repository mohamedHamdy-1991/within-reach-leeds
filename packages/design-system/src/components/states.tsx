import type { ReactNode } from "react";

/** Quiet inline block, never a dismissive modal. Planning assistance, not a guarantee. */
export function SafetyNotice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <aside className="wr-safety-notice" role="note">
      <p className="wr-safety-notice__title">{title}</p>
      <div>{children}</div>
    </aside>
  );
}

export function EmptyState({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <div className="wr-empty-state">
      <p>{message}</p>
      {action}
    </div>
  );
}

export function LoadingState({ message = "Loading" }: { message?: string }) {
  return (
    <div className="wr-loading-state" aria-busy="true" role="status">
      <p>{message}</p>
    </div>
  );
}

export type ErrorSummaryProps = {
  title: string;
  errors: string[];
};

/** Announced assertively; every entry is real text, not a colour state. */
export function ErrorSummary({ title, errors }: ErrorSummaryProps) {
  return (
    <div className="wr-error-summary" role="alert">
      <p className="wr-error-summary__title">{title}</p>
      <ul>
        {errors.map((error) => (
          <li key={error}>{error}</li>
        ))}
      </ul>
    </div>
  );
}
