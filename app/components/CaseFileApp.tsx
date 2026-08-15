"use client";

import { useState } from "react";
import { assetManifest, caseBank } from "../content/caseBank";
import type { HypothesisVersion } from "../content/types";
import { deriveSessionSummary } from "../lib/domain";
import { AppDialog } from "./AppDialog";
import { ActivityProgress } from "./ActivityProgress";
import { CasePanel } from "./CasePanel";
import { CollapsibleSection } from "./CollapsibleSection";
import { EvidenceLabel } from "./EvidenceLabel";
import { EvidenceSummary } from "./HypothesisHistory";

type Phase = "start" | "primer" | "case-intro" | "case" | "compare" | "result";

const studentFocus = [
  "사진에서 보이는 것과 알 수 없는 것을 나누어 보기",
  "그림에서 바로 보이는 것과 자료로 알게 되는 것을 나누어 보기",
  "사진과 자료를 함께 보고 말할 수 있는 범위 정하기",
];

export function CaseFileApp() {
  const [phase, setPhase] = useState<Phase>("start");
  const [caseIndex, setCaseIndex] = useState(0);
  const [records, setRecords] = useState<HypothesisVersion[][]>([]);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [photoAnswer, setPhotoAnswer] = useState("");
  const [contextAnswer, setContextAnswer] = useState("");
  const activeCase = caseBank[caseIndex];

  function completeCase(versions: HypothesisVersion[]) {
    setRecords((current) => [...current, versions]);
    if (caseIndex === caseBank.length - 1) setPhase("compare");
    else {
      setCaseIndex((current) => current + 1);
      setPhase("case-intro");
    }
  }

  function reset() {
    setCaseIndex(0);
    setRecords([]);
    setPhotoAnswer("");
    setContextAnswer("");
    setPhase("start");
  }

  function handleWordmarkClick() {
    if (phase === "start") {
      reset();
      return;
    }
    setResetOpen(true);
  }

  function confirmReset() {
    reset();
    setResetOpen(false);
  }

  return (
    <main className="app-shell" data-app-root>
      <header className="app-header">
        <button className="wordmark" onClick={handleWordmarkClick} type="button">오래된 물건 사건파일</button>
        <nav aria-label="도움말">
          <button className="text-button" onClick={() => setSourceOpen(true)} type="button">자료와 이미지 출처</button>
          <button className="text-button" onClick={() => setUpdateOpen(true)} type="button">업데이트 내역</button>
        </nav>
      </header>
      <ActivityProgress caseIndex={caseIndex} phase={phase} />

      {phase === "start" && <section className="welcome-panel" aria-labelledby="welcome-title">
        <p className="archive-mark">기록 보관함 · 공식 기록을 참고한 학습 자료</p>
        <h1 id="welcome-title">사진과 새 단서로<br />생각을 고쳐 보는 시간</h1>
        <p>유물 이름을 맞히는 퀴즈가 아니에요. 사진에서 보이는 것, 박물관이 적어 둔 내용, 아직 모르는 것을 나누어 살펴봐요. 가설은 단서를 보고 세운 지금의 생각이에요.</p>
        <p className="time-note">약 10~15분 · 사건 3개</p>
        <ul className="welcome-rules">
          <li>결과를 숫자로 매기지 않아요.</li>
          <li>처음 생각을 바꾸어도 실패가 아니에요.</li>
          <li>이름이나 개인정보를 적지 않아요.</li>
        </ul>
        <button className="button" onClick={() => setPhase("primer")} type="button">탐구 방법 먼저 보기</button>
      </section>}

      {phase === "primer" && <section className="primer-panel" aria-labelledby="primer-title">
        <p className="section-kicker">정보를 나누어 보기</p>
        <h1 id="primer-title">사진, 박물관 기록, 생각,<br />아직 모르는 것을 나누어 봐요</h1>
        <div className="primer-grid">
          <article><EvidenceLabel status="observed" /><p>사진에서 직접 확인한 모양과 흔적이에요.</p></article>
          <article><EvidenceLabel status="documented" /><p>박물관이 적어 둔 시대·재질·크기 같은 내용이에요.</p></article>
          <article><EvidenceLabel status="inferred" /><p>여러 자료를 이어서 조심스럽게 생각한 말이에요.</p></article>
          <article><EvidenceLabel status="unknown" /><p>지금 자료만으로는 아직 정할 수 없는 점이에요.</p></article>
        </div>
        <p className="gentle-note">자료를 차례로 보는 이유는, 무엇이 내 생각을 바꾸었는지 살피기 위해서예요.</p>
        <button className="button" onClick={() => setPhase("case-intro")} type="button">첫 사건 열기</button>
      </section>}

      {phase === "case-intro" && <section className="case-intro" aria-labelledby="intro-title">
        <p className="case-count">사건 {caseIndex + 1} / {caseBank.length}</p>
        <h1 id="intro-title">{activeCase.caseTitle}</h1>
        <p>{activeCase.question}</p>
        <dl>
          <div><dt>자료 기관</dt><dd>{activeCase.artifact.institution}</dd></div>
          <div><dt>이번에 해 볼 일</dt><dd>{studentFocus[caseIndex]}</dd></div>
        </dl>
        <details className="teacher-note"><summary>선생님 참고</summary><p>교육과정 코드: {activeCase.curriculumCode}</p></details>
        <button className="button" onClick={() => setPhase("case")} type="button">사진 관찰 시작하기</button>
      </section>}

      {phase === "case" && <CasePanel caseFile={activeCase} key={activeCase.id} onComplete={completeCase} />}

      {phase === "compare" && <section className="compare-panel" aria-labelledby="compare-title">
        <p className="section-kicker">세 사건을 돌아보기</p>
        <h1 id="compare-title">생각을 바꾼 단서는 무엇이었나요?</h1>
        <p className="case-action">세 사건을 떠올리며, 어떤 자료가 내 생각을 바꾸었는지 골라 보세요.</p>
        <fieldset>
          <legend>사진만 보고 생각하기 가장 어려웠던 사건 하나를 고르세요.</legend>
          {caseBank.map((caseFile) => <label key={caseFile.id}><input checked={photoAnswer === caseFile.id} name="photo-compare" onChange={() => setPhotoAnswer(caseFile.id)} type="radio" value={caseFile.id} /> {caseFile.caseTitle}</label>)}
        </fieldset>
        <fieldset>
          <legend>생각을 다시 살피게 한 자료 하나를 고르세요.</legend>
          <label><input checked={contextAnswer === "catalog"} name="context-compare" onChange={() => setContextAnswer("catalog")} type="radio" value="catalog" /> 박물관에 적힌 재질·크기·발견 장소</label>
          <label><input checked={contextAnswer === "context"} name="context-compare" onChange={() => setContextAnswer("context")} type="radio" value="context" /> 함께 찾은 물건이나 다른 곳의 비슷한 자료</label>
          <label><input checked={contextAnswer === "unknown"} name="context-compare" onChange={() => setContextAnswer("unknown")} type="radio" value="unknown" /> 아직 알 수 없다는 정보</label>
        </fieldset>
        <button className="button" disabled={!photoAnswer || !contextAnswer} onClick={() => setPhase("result")} type="button">내 생각 변화 보기</button>
      </section>}

      {phase === "result" && <SessionResult contextAnswer={contextAnswer} photoAnswer={photoAnswer} records={records} onReset={reset} />}

      <footer className="app-footer">정적 자료만 사용하며, 새로고침하면 이 활동 기록은 처음으로 돌아갑니다.</footer>

      <AppDialog isOpen={sourceOpen} onClose={() => setSourceOpen(false)} title="자료와 이미지 출처">
        <p>화면의 이미지는 모두 이미지 생성 모델로 만든 학습용 재구성 이미지예요. 실제 소장품 사진으로 오해하지 않도록, 각 유물의 공식 기록을 참고 자료로 함께 표시합니다.</p>
        <ul className="source-list">
          {assetManifest.map((asset) => <li key={asset.id}>
            <strong>{asset.artifactTitle} · {asset.collectionNumber}</strong><br />
            {asset.requiredCredit}<br />
            <a href={asset.recordUrl} rel="noreferrer" target="_blank">공식 소장품 기록(참고)</a>
          </li>)}
        </ul>
      </AppDialog>
      <AppDialog isOpen={updateOpen} onClose={() => setUpdateOpen(false)} title="업데이트 내역">
        <ul className="update-list">
          <li><strong>2026-08-15 / 1.3.0 / 학습용 이미지 생성·교체</strong><br />세 유물 이미지를 이미지 생성 모델로 만든 재구성 이미지로 교체하고, 실제 소장품 사진이 아니라는 안내와 참고 기록을 덧붙였습니다.</li>
          <li><strong>2026-07-18 / 1.2.0 / 학생말과 기록 보기 방식을 개선</strong><br />어려운 말을 쉽게 풀고, 현재 할 일을 더 또렷하게 보여 주며, 긴 기록은 접어 볼 수 있게 했습니다.</li>
          <li><strong>2026-07-17 / 1.1.0 / 진행 안내와 선택 도움을 개선</strong><br />전체·사건 진행 표시, 선택 전 기록 안내, 실수 방지 초기화 확인, 모바일 조작 영역을 보완했습니다.</li>
          <li>2026-07-17 / 1.0.0 / 최초 구현</li>
        </ul>
      </AppDialog>
      <AppDialog isOpen={resetOpen} onClose={() => setResetOpen(false)} title="활동 기록을 지울까요?">
        <p>지금까지 고른 관찰, 가설, 비교 기록이 모두 처음으로 돌아갑니다. 계속 탐구하려면 취소해도 괜찮아요.</p>
        <div className="dialog-actions">
          <button className="button button-secondary" onClick={() => setResetOpen(false)} type="button">계속 탐구하기</button>
          <button className="button" onClick={confirmReset} type="button">기록을 지우고 처음으로</button>
        </div>
      </AppDialog>
    </main>
  );
}

export function SessionResult({ contextAnswer, photoAnswer, records, onReset }: { contextAnswer: string; photoAnswer: string; records: HypothesisVersion[][]; onReset: () => void }) {
  const summary = deriveSessionSummary(records);
  const chosenCase = caseBank.find((caseFile) => caseFile.id === photoAnswer)?.caseTitle;
  const contextLabel = { catalog: "박물관에 적힌 재질·크기·발견 장소", context: "함께 찾은 물건이나 다른 곳의 비슷한 자료", unknown: "아직 알 수 없다는 정보" }[contextAnswer];
  return (
    <section className="result-panel" aria-labelledby="result-title">
      <p className="section-kicker">내 생각 변화 기록</p>
      <h1 id="result-title">가설 변화 기록표</h1>
      <p>생각을 그대로 둔 것도, 새 자료로 고친 것도, 아직 정하지 않은 것도 모두 자료를 살핀 기록이에요.</p>
      <div className="record-table" role="region" aria-label="세 사건의 가설 기록">
        {records.map((versions, index) => <article key={caseBank[index].id}>
          <CollapsibleSection className="record-card" label={`${caseBank[index].caseTitle} 기록`}>
            <h2>{caseBank[index].caseTitle}</h2>
            <ol>{versions.map((version) => <li key={version.version}><strong>가설 {version.version}</strong> {version.statement}<EvidenceSummary caseFile={caseBank[index]} version={version} /></li>)}</ol>
            <p><strong>아직 모르는 점:</strong> {caseBank[index].unknownText}</p>
          </CollapsibleSection>
        </article>)}
      </div>
      <p className="final-reading"><strong>비교 기록:</strong> 사진만 보고 생각하기 어려웠던 사건은 {chosenCase}, 생각을 다시 살피게 한 자료는 {contextLabel}였어요.</p>
      <p className="gentle-note">완료한 사건 {summary.completedCases}개 · 숫자로 평가하지 않음 · 바뀐 생각 {summary.changedCases}개</p>
      <button className="button" onClick={onReset} type="button">처음부터 다시 살펴보기</button>
    </section>
  );
}
