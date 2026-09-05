import { useNavigate } from "react-router-dom";
import { EmptyState } from "@within-reach/design-system";

/** Honest stub for capabilities that arrive with the live data release (Phase 5). */
export function PreviewStub({ title, phase }: { title: string; phase: string }) {
  const navigate = useNavigate();
  return (
    <div className="page-sheet">
      <div className="page-sheet-head">
        <button className="back-button" type="button" onClick={() => navigate("/")}>← Back</button>
        <span className="panel-step">Preview</span>
      </div>
      <h1>{title}</h1>
      <EmptyState
        message={`${phase}. Nothing is shown here yet because no validated data release is active — we never invent results.`}
        action={
          <button className="primary" type="button" onClick={() => navigate("/reach")}>
            Try My Reach instead
          </button>
        }
      />
    </div>
  );
}
