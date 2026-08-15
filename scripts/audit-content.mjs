import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const content = await readFile(new URL("../app/content/caseBank.ts", import.meta.url), "utf8");
const appFiles = [];

async function collectAppSource(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await collectAppSource(path);
    else if (/\.(ts|tsx)$/.test(entry.name) && !/\.test\.(ts|tsx)$/.test(entry.name)) appFiles.push(path);
  }
}

await collectAppSource("app");
const appSource = (await Promise.all(appFiles.map((path) => readFile(path, "utf8")))).join("\n");
const count = (expression) => (content.match(expression) ?? []).length;

assert.equal(count(/localPath:/g), 3, "자산 로컬 경로 3개가 필요합니다.");
assert.equal(count(/imageSource:/g), 3, "학습용 이미지 출처 유형이 누락되었습니다.");
assert.equal(count(/recordUrl:/g) >= 3, true, "공식 기록 URL이 필요합니다.");
assert.equal(count(/originalSha256:/g), 3, "원본 SHA-256이 누락되었습니다.");
assert.equal(count(/derivativeSha256:/g), 3, "파생본 SHA-256이 누락되었습니다.");
assert.equal(count(/derivativeOperations:/g), 3, "파생 작업 기록이 누락되었습니다.");
assert.doesNotMatch(content, /localPath:\s*["']https?:\/\//, "원격 이미지를 런타임 경로로 쓰면 안 됩니다.");
assert.doesNotMatch(content, /licenseType:\s*["']KOGL-[0234]/, "공공누리 제0·1유형 외 자산은 쓸 수 없습니다.");
assert.doesNotMatch(appSource, /(?:src|poster)\s*=\s*["']https?:\/\//i, "원격 이미지를 런타임 src로 쓰면 안 됩니다.");
assert.doesNotMatch(appSource, /\bfetch\s*\(|XMLHttpRequest|axios\b/i, "원격 요청 기능을 넣을 수 없습니다.");
assert.doesNotMatch(appSource, /localStorage|sessionStorage|indexedDB|cookieStore/i, "영구 저장 기능을 넣을 수 없습니다.");
assert.doesNotMatch(appSource, /type\s*=\s*["']file["']|FormData|\bupload\b/i, "업로드 기능을 넣을 수 없습니다.");
assert.doesNotMatch(appSource, /정답률|랭킹|순위|배지|타이머|점수/, "점수화·경쟁 언어를 넣을 수 없습니다.");
console.log(`content audit: ${appFiles.length} app source files, 3 local generated learning assets with reference records, no runtime request/persistence/upload/competition violations`);
