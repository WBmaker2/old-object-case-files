import { evidenceLabels } from "../content/caseBank";
import type { EvidenceStatus } from "../content/types";

export function EvidenceLabel({ status }: { status: EvidenceStatus }) {
  return <span className={`evidence-label evidence-${status}`}>{evidenceLabels[status]}</span>;
}
