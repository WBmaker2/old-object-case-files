import { describe, expect, it } from "vitest";
import { caseBank } from "../content/caseBank";
import {
  createVersion,
  deriveSessionSummary,
  getRevealedClues,
  saveRevision,
  validateCaseBank,
} from "./domain";

const handaxe = caseBank[0];

describe("사건파일 도메인 규칙", () => {
  it("정확히 세 사건과 필요한 콘텐츠 계약을 검증한다", () => {
    expect(caseBank).toHaveLength(3);
    expect(validateCaseBank(caseBank)).toEqual([]);
  });

  it("공개한 단계의 단서만 돌려준다", () => {
    expect(getRevealedClues(handaxe, 1).every((clue) => clue.stage === 1)).toBe(
      true,
    );
    expect(getRevealedClues(handaxe, 2).some((clue) => clue.stage === 3)).toBe(
      false,
    );
  });

  it("사진 관찰 두 개 없이는 첫 가설을 만들지 않는다", () => {
    expect(() =>
      createVersion(handaxe, 1, "tool", ["handaxe-shape"], "keep"),
    ).toThrow(/관찰/);
  });

  it("유지는 같은 가설, 바꾸기는 다른 가설이어야 한다", () => {
    const first = createVersion(
      handaxe,
      1,
      "tool",
      ["handaxe-shape", "handaxe-surface"],
      "keep",
    );
    expect(() => saveRevision(handaxe, first, 2, "replace", "tool", ["handaxe-catalog"])).toThrow(
      /바꾸기/,
    );
    expect(() => saveRevision(handaxe, first, 2, "keep", "throw", ["handaxe-catalog"])).toThrow(
      /유지/,
    );
  });

  it("판단 보류 행동과 판단 보류 가설은 서로 함께 선택해야 한다", () => {
    const first = createVersion(
      handaxe,
      1,
      "tool",
      ["handaxe-shape", "handaxe-surface"],
      "keep",
    );
    expect(() => saveRevision(handaxe, first, 2, "defer", "tool", ["handaxe-catalog"])).toThrow(
      /판단 보류/,
    );
    expect(() => saveRevision(handaxe, first, 2, "keep", "defer", ["handaxe-catalog"])).toThrow(
      /판단 보류/,
    );
  });

  it("판단 보류도 정상적인 불변 가설 버전으로 저장한다", () => {
    const first = createVersion(
      handaxe,
      1,
      "defer",
      ["handaxe-shape", "handaxe-surface"],
      "defer",
    );
    const second = saveRevision(
      handaxe,
      first,
      2,
      "defer",
      "defer",
      ["handaxe-catalog"],
    );
    expect(second.hypothesisId).toBe("defer");
    expect(first.version).toBe(1);
    expect(second.revealedClueIds).not.toBe(first.revealedClueIds);
  });

  it("다듬기는 같은 가설에 범위 제한을 붙인 새 학생용 문장으로 남긴다", () => {
    const first = createVersion(
      handaxe,
      1,
      "tool",
      ["handaxe-shape", "handaxe-surface"],
      "keep",
    );
    const refined = saveRevision(
      handaxe,
      first,
      2,
      "refine",
      "tool",
      ["handaxe-catalog"],
    );
    expect(refined.statement).toContain("손에 쥐고 자르거나 다듬는 여러 작업에 쓴 도구였을 것이다.");
    expect(refined.statement).toContain("정확히 한 가지 용도였다고 단정할 수는 없어요.");
  });

  it("세 사건의 저장 기록으로 점수 없는 세션 요약을 만든다", () => {
    const completed = caseBank.map((caseFile) => {
      const observations = caseFile.observations.slice(0, 2).map(({ id }) => id);
      const first = createVersion(caseFile, 1, caseFile.hypotheses[0].id, observations, "keep");
      const second = saveRevision(caseFile, first, 2, "keep", first.hypothesisId, [caseFile.clues[1].id]);
      const third = saveRevision(caseFile, second, 3, "refine", second.hypothesisId, [caseFile.clues[2].id]);
      return [first, second, third];
    });
    expect(deriveSessionSummary(completed)).toEqual(
      expect.objectContaining({ completedCases: 3, hasScore: false }),
    );
  });
});
