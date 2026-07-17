import type { CaseFile, HypothesisVersion, RevisionAction } from "../content/types";

export class ContentValidationError extends Error {}

export function validateCaseBank(caseBank: readonly CaseFile[]) {
  const issues: string[] = [];
  if (caseBank.length !== 3) issues.push("사건은 정확히 3개여야 합니다.");
  if (new Set(caseBank.map((item) => item.id)).size !== 3) issues.push("사건 ID가 겹칩니다.");
  for (const caseFile of caseBank) {
    if (!caseFile.artifact.collectionNumber || !caseFile.artifact.recordUrl) issues.push(`${caseFile.id}: 소장품 기록이 없습니다.`);
    if (caseFile.observations.length < 2) issues.push(`${caseFile.id}: 사진 관찰이 부족합니다.`);
    if (!caseFile.hypotheses.some((item) => item.id === "defer")) issues.push(`${caseFile.id}: 판단 보류가 없습니다.`);
    if (!caseFile.clues.some((item) => item.status === "unknown")) issues.push(`${caseFile.id}: 미확인 단서가 없습니다.`);
    if (!caseFile.clues.some((item) => item.stage === 2) || !caseFile.clues.some((item) => item.stage === 3)) issues.push(`${caseFile.id}: 단계별 단서가 부족합니다.`);
  }
  return issues;
}

export function getRevealedClues(caseFile: CaseFile, stage: 1 | 2 | 3) {
  return caseFile.clues.filter((clue) => clue.stage <= stage);
}

function getHypothesis(caseFile: CaseFile, hypothesisId: string) {
  const hypothesis = caseFile.hypotheses.find((item) => item.id === hypothesisId);
  if (!hypothesis) throw new ContentValidationError("등록되지 않은 가설입니다.");
  return hypothesis;
}

function buildStudentStatement(caseFile: CaseFile, hypothesisId: string, action: RevisionAction) {
  const hypothesis = getHypothesis(caseFile, hypothesisId);
  return action === "refine" ? `${hypothesis.text} ${hypothesis.scopeLimit}` : hypothesis.text;
}

function assertEvidence(caseFile: CaseFile, stage: 1 | 2 | 3, evidenceIds: readonly string[]) {
  const revealed = new Set(getRevealedClues(caseFile, stage).map((clue) => clue.id));
  if (evidenceIds.length === 0) throw new ContentValidationError("영향을 준 단서를 하나 골라 주세요.");
  if (evidenceIds.some((id) => !revealed.has(id))) {
    throw new ContentValidationError("아직 공개되지 않은 단서는 근거로 쓸 수 없습니다.");
  }
}

export function createVersion(
  caseFile: CaseFile,
  version: 1,
  hypothesisId: string,
  observationIds: readonly string[],
  action: RevisionAction,
): HypothesisVersion {
  if (observationIds.length !== 2 || new Set(observationIds).size !== 2) throw new ContentValidationError("사진 관찰 특징을 정확히 2개 골라 주세요.");
  const allowed = new Set(caseFile.observations.map((item) => item.id));
  if (observationIds.some((id) => !allowed.has(id))) throw new ContentValidationError("사진에서 고른 특징이 아닙니다.");
  const statement = buildStudentStatement(caseFile, hypothesisId, action);
  if ((action === "defer") !== (hypothesisId === "defer")) {
    throw new ContentValidationError("판단 보류 행동과 판단 보류 가설은 함께 선택해야 합니다.");
  }
  return Object.freeze({
    caseId: caseFile.id,
    version,
    hypothesisId,
    statement,
    action,
    evidenceIds: Object.freeze([...observationIds]),
    revealedClueIds: Object.freeze(getRevealedClues(caseFile, 1).map((clue) => clue.id)),
  });
}

function assertRevisionAction(action: RevisionAction, previousId: string, nextId: string) {
  if ((action === "defer") !== (nextId === "defer")) {
    throw new ContentValidationError("판단 보류 행동과 판단 보류 가설은 함께 선택해야 합니다.");
  }
  if (action === "keep" && previousId !== nextId) throw new ContentValidationError("유지는 이전 가설과 같은 가설을 선택해야 합니다.");
  if (action === "replace" && previousId === nextId) throw new ContentValidationError("바꾸기는 이전과 다른 가설을 선택해야 합니다.");
  if (action === "refine" && previousId !== nextId) throw new ContentValidationError("다듬기는 같은 가설의 범위를 더 조심스럽게 정하는 행동입니다.");
}

export function saveRevision(
  caseFile: CaseFile,
  previous: HypothesisVersion,
  stage: 2 | 3,
  action: RevisionAction,
  hypothesisId: string,
  evidenceIds: readonly string[],
): HypothesisVersion {
  if (previous.caseId !== caseFile.id || stage !== previous.version + 1) throw new ContentValidationError("가설 버전 순서가 맞지 않습니다.");
  const statement = buildStudentStatement(caseFile, hypothesisId, action);
  assertRevisionAction(action, previous.hypothesisId, hypothesisId);
  assertEvidence(caseFile, stage, evidenceIds);
  return Object.freeze({
    caseId: caseFile.id,
    version: stage,
    hypothesisId,
    statement,
    action,
    evidenceIds: Object.freeze([...evidenceIds]),
    revealedClueIds: Object.freeze(getRevealedClues(caseFile, stage).map((clue) => clue.id)),
  });
}

export function deriveSessionSummary(completed: readonly HypothesisVersion[][]) {
  return {
    completedCases: completed.length,
    hasScore: false,
    changedCases: completed.filter((versions) => versions[0]?.hypothesisId !== versions.at(-1)?.hypothesisId).length,
    deferredCases: completed.filter((versions) => versions.at(-1)?.hypothesisId === "defer").length,
  };
}
