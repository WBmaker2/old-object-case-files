import { describe, expect, it } from "vitest";
import { assetManifest, caseBank, evidenceLabels } from "./caseBank";

describe("검수된 정적 콘텐츠", () => {
  it("이미지는 로컬 생성본이며 참고 기록·해시를 가진다", () => {
    for (const asset of assetManifest) {
      expect(asset.localPath).toMatch(/^\/assets\/artifacts\//);
      expect(asset.localPath).not.toMatch(/^https?:/);
      expect(asset.imageSource).toBe("ai-generated-learning-reconstruction");
      expect(asset.licenseType).toBe("KOGL-1");
      expect(asset.originalSha256).toMatch(/^[a-f0-9]{64}$/);
      expect(asset.derivativeSha256).toMatch(/^[a-f0-9]{64}$/);
      expect(asset.derivativeOperations.length).toBeGreaterThan(0);
      expect(asset.requiredCredit).toContain(asset.institution);
    }
  });

  it("각 사건은 네 정보 상태, 판단 보류, 알 수 없는 점을 제공한다", () => {
    expect(Object.values(evidenceLabels)).toHaveLength(4);
    for (const caseFile of caseBank) {
      expect(caseFile.hypotheses.some((item) => item.id === "defer")).toBe(true);
      expect(caseFile.unknownText).toMatch(/알 수 없/);
      expect(caseFile.clues.map((item) => item.status)).toContain("unknown");
    }
  });

  it("사건 3은 목록 단서가 열리기 전 청자라는 재질을 제목에 노출하지 않는다", () => {
    const dieCase = caseBank.find((caseFile) => caseFile.id === "celadon-die");
    expect(dieCase?.caseTitle).not.toContain("청자");
    expect(dieCase?.question).not.toContain("청자");
  });

  it("사건 2의 동물 관찰 가설은 제작 과정을 확정하지 않는다", () => {
    const lidCase = caseBank.find((caseFile) => caseFile.id === "figurine-lid");
    expect(lidCase?.hypotheses.find((hypothesis) => hypothesis.id === "nature")?.text).toMatch(/가능성/);
  });

  it("주먹도끼 사진 설명과 관찰 선택지는 용도·크기 추정을 미리 말하지 않는다", () => {
    const handaxe = caseBank.find((caseFile) => caseFile.id === "handaxe");
    expect(handaxe?.imageAlt).not.toMatch(/도구|용도|사용|자르|다듬/);
    expect(handaxe?.observations.map((item) => item.text).join(" ")).not.toMatch(/한 손|쥘 수|크기|무게|만큼/);
  });
});
