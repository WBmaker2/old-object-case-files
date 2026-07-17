import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { caseBank } from "../content/caseBank";
import { createVersion, saveRevision } from "../lib/domain";
import { CaseFileApp, SessionResult } from "./CaseFileApp";

afterEach(cleanup);

describe("학생용 화면", () => {
  it("출처 대화상자는 초점을 가두고 Escape 뒤에 열었던 버튼으로 돌려준다", () => {
    render(<CaseFileApp />);
    const sourceButton = screen.getByRole("button", { name: "자료와 이미지 출처" });
    sourceButton.focus();
    fireEvent.click(sourceButton);
    const dialog = screen.getByRole("dialog", { name: "자료와 이미지 출처" });
    const appRoot = document.querySelector("[data-app-root]");
    expect(dialog.closest(".dialog-backdrop")?.parentElement).toBe(document.body);
    expect(appRoot?.getAttribute("aria-hidden")).toBe("true");
    expect(appRoot?.hasAttribute("inert")).toBe(true);
    const focusable = [...dialog.querySelectorAll<HTMLElement>("button, a[href]")];
    expect(document.activeElement).toBe(focusable[0]);
    focusable.at(-1)?.focus();
    fireEvent.keyDown(dialog, { key: "Tab" });
    expect(document.activeElement).toBe(focusable[0]);
    fireEvent.keyDown(dialog, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(focusable.at(-1));
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "자료와 이미지 출처" })).toBeNull();
    expect(appRoot?.hasAttribute("inert")).toBe(false);
    expect(document.activeElement).toBe(sourceButton);

    fireEvent.click(screen.getByRole("button", { name: "업데이트 내역" }));
    expect(screen.getByText("2026-07-17 / 1.1.0 / 진행 안내와 선택 도움을 개선")).toBeTruthy();
    expect(screen.getByText("2026-07-17 / 1.0.0 / 최초 구현")).toBeTruthy();
  });

  it("선택 전 기록을 막고, 진행 중 제목을 눌러도 확인 전에는 활동을 지우지 않는다", () => {
    render(<CaseFileApp />);
    fireEvent.click(screen.getByRole("button", { name: "탐구 방법 먼저 보기" }));
    fireEvent.click(screen.getByRole("button", { name: "첫 사건 열기" }));
    fireEvent.click(screen.getByRole("button", { name: "사진 관찰 시작하기" }));
    const observations = screen.getAllByRole("checkbox");
    fireEvent.click(observations[0]);
    fireEvent.click(observations[1]);
    fireEvent.click(screen.getByRole("button", { name: "사진을 보고 첫 생각 고르기" }));

    const initialSave = screen.getByRole("button", { name: "첫 생각 기록하기" });
    expect(initialSave.hasAttribute("disabled")).toBe(true);
    expect(screen.getByText("생각 하나를 고르면 기록할 수 있어요.")).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "전체 활동 진행" })).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "현재 사건 진행" })).toBeTruthy();
    expect(screen.getByText("현재 단계 2/7 · 첫 생각")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "오래된 물건 사건파일" }));
    expect(screen.getByRole("dialog", { name: "활동 기록을 지울까요?" })).toBeTruthy();
    expect(screen.getByRole("heading", { hidden: true, name: "가설 1 · 지금의 생각" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "계속 탐구하기" }));
    expect(screen.queryByRole("dialog", { name: "활동 기록을 지울까요?" })).toBeNull();

    fireEvent.click(screen.getByLabelText(/던져서 멀리 있는 대상을/));
    expect(initialSave.hasAttribute("disabled")).toBe(false);
    fireEvent.click(initialSave);
    fireEvent.click(screen.getByRole("button", { name: "새 자료로 내 생각 고치기" }));
    const revisionSave = screen.getByRole("button", { name: "생각 2 기록하기" });
    expect(revisionSave.hasAttribute("disabled")).toBe(true);
    expect(screen.getByText("자료를 하나 이상 고르면 기록할 수 있어요.")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "오래된 물건 사건파일" }));
    fireEvent.click(screen.getByRole("button", { name: "기록을 지우고 처음으로" }));
    expect(screen.getByRole("heading", { name: /사진과 새 단서로\s*생각을 고쳐 보는 시간/ })).toBeTruthy();
  });

  it("네 정보 상태를 말로 보여 주고, 가설 기록을 지우지 않는다", () => {
    render(<CaseFileApp />);
    fireEvent.click(screen.getByRole("button", { name: "탐구 방법 먼저 보기" }));
    expect(screen.getByText("사진에서 보여요")).toBeTruthy();
    expect(screen.getByText("박물관 기록이에요")).toBeTruthy();
    expect(screen.getByText("근거로 이렇게 추론해요")).toBeTruthy();
    expect(screen.getByText("아직 알 수 없어요")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "첫 사건 열기" }));
    fireEvent.click(screen.getByRole("button", { name: "사진 관찰 시작하기" }));
    const observations = screen.getAllByRole("checkbox");
    fireEvent.click(observations[0]);
    fireEvent.click(observations[1]);
    fireEvent.click(screen.getByRole("button", { name: "사진을 보고 첫 생각 고르기" }));
    fireEvent.click(screen.getByLabelText(/던져서 멀리 있는 대상을/));
    fireEvent.click(screen.getByRole("button", { name: "첫 생각 기록하기" }));
    fireEvent.click(screen.getByRole("button", { name: "새 자료로 내 생각 고치기" }));
    expect(document.activeElement).toBe(screen.getByRole("heading", { name: "박물관 기록을 보고 생각 고치기" }));
    fireEvent.click(screen.getByLabelText(/바꾸기/));
    fireEvent.click(screen.getByLabelText(/손에 쥐고 자르거나/));
    fireEvent.click(screen.getByLabelText(/박물관 기록/));
    fireEvent.click(screen.getByRole("button", { name: "생각 2 기록하기" }));
    expect(screen.getByText("던져서 멀리 있는 대상을 맞히는 물건이었을 것이다.")).toBeTruthy();
    expect(screen.getByText("손에 쥐고 자르거나 다듬는 여러 작업에 쓴 도구였을 것이다.")).toBeTruthy();
    expect(screen.getAllByText("고른 근거")).toHaveLength(2);
    expect(screen.getByText("박물관 기록이에요")).toBeTruthy();
    expect(screen.getByText(/박물관은 이 유물을 구석기의 화강암 물건으로/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "마지막 생각 고르기" }));
    expect(document.activeElement).toBe(screen.getByRole("heading", { name: "마지막 생각을 고르기" }));
  });

  it("최종 기록표에도 가설별로 고른 근거의 상태와 설명을 남긴다", () => {
    const handaxe = caseBank[0];
    const first = createVersion(handaxe, 1, "throw", ["handaxe-shape", "handaxe-surface"], "keep");
    const second = saveRevision(handaxe, first, 2, "replace", "tool", ["handaxe-catalog"]);
    const third = saveRevision(handaxe, second, 3, "refine", "tool", ["handaxe-context"]);
    render(<SessionResult contextAnswer="context" photoAnswer="handaxe" records={[[first, second, third]]} onReset={() => {}} />);
    const record = within(screen.getByRole("region", { name: "세 사건의 가설 기록" }));
    fireEvent.click(record.getByRole("button", { name: /손에 쥔 돌의 역할 기록 펼치기/ }));
    expect(record.getAllByText("고른 근거")).toHaveLength(3);
    expect(record.getByText("박물관 기록이에요")).toBeTruthy();
    expect(record.getByText("박물관 기록")).toBeTruthy();
    expect(record.getByText(/국립중앙박물관 설명은 뭉툭한 부분을/)).toBeTruthy();
    expect(record.getByText(/정확히 한 가지 용도였다고 단정할 수는 없어요/)).toBeTruthy();
  });

  it("세 사건을 마지막 가설과 비교 기록까지 한 세션에서 완주한다", () => {
    render(<CaseFileApp />);
    fireEvent.click(screen.getByRole("button", { name: "탐구 방법 먼저 보기" }));
    fireEvent.click(screen.getByRole("button", { name: "첫 사건 열기" }));

    for (let index = 0; index < 3; index += 1) {
      fireEvent.click(screen.getByRole("button", { name: "사진 관찰 시작하기" }));
      const observations = screen.getAllByRole("checkbox");
      fireEvent.click(observations[0]);
      fireEvent.click(observations[1]);
      fireEvent.click(screen.getByRole("button", { name: "사진을 보고 첫 생각 고르기" }));
      fireEvent.click(screen.getAllByRole("radio")[0]);
      fireEvent.click(screen.getByRole("button", { name: "첫 생각 기록하기" }));
      fireEvent.click(screen.getByRole("button", { name: "새 자료로 내 생각 고치기" }));
      fireEvent.click(screen.getAllByRole("checkbox")[1]);
      fireEvent.click(screen.getByRole("button", { name: "생각 2 기록하기" }));
      fireEvent.click(screen.getByRole("button", { name: "마지막 생각 고르기" }));
      fireEvent.click(screen.getAllByRole("checkbox")[2]);
      fireEvent.click(screen.getByRole("button", { name: "마지막 생각 기록하기" }));
      if (index < 2) {
        expect(screen.getByText("해당 없음 — 현재 자료에서는 별도의 제한적 가능성을 남기지 않았어요.")).toBeTruthy();
      }
      fireEvent.click(screen.getByRole("button", { name: "이 사건 기록을 닫고 다음으로" }));
    }

    expect(screen.getByRole("heading", { name: "생각을 바꾼 단서는 무엇이었나요?" })).toBeTruthy();
    const comparisonChoices = screen.getAllByRole("radio");
    fireEvent.click(comparisonChoices[0]);
    fireEvent.click(comparisonChoices[3]);
    fireEvent.click(screen.getByRole("button", { name: "내 생각 변화 보기" }));
    expect(screen.getByRole("heading", { name: "가설 변화 기록표" })).toBeTruthy();
    const record = within(screen.getByRole("region", { name: "세 사건의 가설 기록" }));
    record.getAllByRole("button", { name: /기록 펼치기/ }).forEach((button) => fireEvent.click(button));
    expect(record.getAllByRole("heading", { level: 2 })).toHaveLength(3);
    expect(record.getAllByText("고른 근거")).toHaveLength(9);
  });
});
