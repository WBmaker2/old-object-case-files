# 오래된 물건 사건파일

초등 5~6학년이 실제 박물관 소장품 사진을 관찰하고, 새 단서에 따라 역사 가설을 유지·다듬기·바꾸기·판단 보류하며 기록하는 정적 교육 웹앱입니다.

## 학습 흐름

1. `사진에서 보여요`, `박물관 기록이에요`, `근거로 이렇게 추론해요`, `아직 알 수 없어요`를 구분합니다.
2. 주먹도끼, 토우장식 뚜껑, 작은 정육면체 사건에서 사진 관찰 두 개와 가설 1을 기록합니다.
3. 목록·맥락·비교 단서 뒤에 가설 2와 가설 3을 기록합니다.
4. 세 사건의 선택 근거와 아직 모르는 점을 가설 변화 기록표에서 다시 봅니다.

처음 가설을 바꾸어도 실패나 감점이 아니며, 결과를 숫자로 평가하지 않습니다.

## 자료와 권리

- 사진은 국립중앙박물관·국립경주박물관의 공식 제공 JPEG를 로컬 정적 자산으로 포함합니다.
- 앱에는 원격 이미지 요청, 로그인, API, 저장소, 업로드, 자유 입력, AI 기능이 없습니다.
- 출처, 공공누리 제1유형, 원본/앱 사용본 SHA-256, 처리 내역은 [이미지 권리 원장](docs/image-rights-ledger.md)에 있습니다.
- 학생용 역사 표현과 범위 제한은 [유물·주장 검토 기록](docs/artifact-review-record.md)에 있습니다.

## 개발

필수 환경: Node.js `>=22.13.0`

```bash
npm install
npm run dev
```

개발 서버는 vinext/Cloudflare 호환 로컬 환경으로 실행됩니다. 활동 기록은 React 메모리에서만 유지되며, 새로고침하면 처음으로 돌아갑니다.

## 검증 명령

```bash
npm run test:unit  # Vitest 도메인·콘텐츠·컴포넌트 테스트
npm test           # 단위 테스트, 빌드, 서버 렌더, 콘텐츠·파일 크기 감사
npm run lint       # ESLint
npm run build      # vinext/Cloudflare 호환 빌드
```

테스트·접근성·수동 확인 범위는 [QA 체크리스트](docs/qa-checklist.md)를 참고하세요.

## GitHub Pages

이 프로젝트는 로컬 정적 자산과 브라우저 메모리만 사용하는 정적 앱으로
GitHub Pages에서도 사용할 수 있습니다.

- `npm run build:pages`: GitHub Pages용 정적 사이트 빌드
- 공개 주소: https://wbmaker2.github.io/old-object-case-files/
- 배포 방식: `.github/workflows/deploy-pages.yml`
- 정적 진입점: `pages/index.html`
