import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { caseBank } from "../content/caseBank";
import { createVersion, saveRevision } from "../lib/domain";
import { CaseFileApp, SessionResult } from "./CaseFileApp";
import { HypothesisHistory } from "./HypothesisHistory";

afterEach(cleanup);

describe("초등학생 실사용 개선", () => {
  it("시작 전에 활동 분량과 쉬운 가설 뜻을 안내한다", () => {
    render(<CaseFileApp />);
    expect(screen.getByText("약 10~15분 · 사건 3개")).toBeTruthy();
    expect(screen.getByText(/단서를 보고 세운 지금의 생각/)).toBeTruthy();
  });

  it("사건 기록과 최종 사건 기록은 기본으로 접혀 있고 키보드로 펼칠 수 있다", async () => {
    const handaxe = caseBank[0];
    const first = createVersion(handaxe, 1, "tool", ["handaxe-shape", "handaxe-surface"], "keep");
    const second = saveRevision(handaxe, first, 2, "refine", "tool", ["handaxe-catalog"]);
    render(<><HypothesisHistory caseFile={handaxe} versions={[first, second]} /><SessionResult contextAnswer="catalog" photoAnswer="handaxe" records={[[first, second]]} onReset={() => {}} /></>);

    const historyButton = screen.getByRole("button", { name: "내 생각 기록 펼치기" });
    const recordButton = screen.getByRole("button", { name: /사건 1.*손에 쥔 돌의 역할 기록 펼치기/ });
    expect(historyButton.getAttribute("aria-expanded")).toBe("false");
    expect(recordButton.getAttribute("aria-expanded")).toBe("false");
    const user = userEvent.setup();
    historyButton.focus();
    await user.keyboard("{Enter}");
    expect(historyButton.getAttribute("aria-expanded")).toBe("true");
    await user.keyboard(" ");
    expect(historyButton.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(recordButton);
    expect(recordButton.getAttribute("aria-expanded")).toBe("true");
  });

  it("현재 할 일과 7단계 진행 막대를 보여 주며 쉬운 행동말로 다음 단계를 연다", () => {
    render(<CaseFileApp />);
    fireEvent.click(screen.getByRole("button", { name: "탐구 방법 먼저 보기" }));
    fireEvent.click(screen.getByRole("button", { name: "첫 사건 열기" }));
    fireEvent.click(screen.getByRole("button", { name: "사진 관찰 시작하기" }));
    expect(screen.getByText("사진을 보고 첫 생각 고르기")).toBeTruthy();
    expect(screen.getByRole("progressbar", { name: "현재 사건 진행 1/7" }).getAttribute("value")).toBe("1");
    const observations = screen.getAllByRole("checkbox");
    fireEvent.click(observations[0]);
    fireEvent.click(observations[1]);
    fireEvent.click(screen.getByRole("button", { name: "사진을 보고 첫 생각 고르기" }));
    expect(screen.getByText(/지금 할 일/)).toBeTruthy();
    expect(screen.getByRole("progressbar", { name: "현재 사건 진행 2/7" }).getAttribute("max")).toBe("7");
  });

  it("두 번째 생각을 기록해도 조사 오류 없이 기존 활동 흐름을 이어 간다", () => {
    render(<CaseFileApp />);
    fireEvent.click(screen.getByRole("button", { name: "탐구 방법 먼저 보기" }));
    fireEvent.click(screen.getByRole("button", { name: "첫 사건 열기" }));
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

    expect(screen.getByText("생각 2를 기록했어요. 앞의 기록은 그대로 남아 있어요.")).toBeTruthy();
    expect(document.body.textContent).not.toContain("가설 2을");
  });
});
