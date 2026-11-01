# CLAUDE.md

투자 도우미 서비스 프론트엔드 (React + Vite + TypeScript).

## Git 작업 규칙 (공통 — collector / kwak-service-be / kwak-service-fe 동일)

모든 작업은 **GitHub 이슈 등록 → 브랜치 → PR** 흐름으로 진행한다. 사용자가 명시적으로 생략하라고 한 경우만 예외.

1. **최신화** — 작업 전 `main`에서 `git pull --ff-only`. 로컬 미커밋 변경이 있으면 내용을 확인하고 stash 후 pull, 다시 복원한다.
2. **이슈 등록** — 코드 수정 전에 `gh issue create`로 일감을 먼저 만든다.
   - 제목: `feat: …` / `fix: …` / `refactor: …` / `docs: …` (한국어 요약)
   - 본문: 배경(왜 필요한지), 할 일, 완료 조건
   - 라벨: `enhancement`(기능) · `bug`(버그) · `documentation`(문서)
3. **브랜치** — `main`에서 `<type>/<이슈번호>-<짧은-설명>` (예: `feat/23-rule-based-trade`). `main`에 직접 커밋·push 하지 않는다.
4. **커밋** — Conventional 접두어(`feat` `fix` `refactor` `docs` `test` `chore`) + 한국어 요약.
5. **PR 생성** — 브랜치 push 후 `gh pr create --base main`.
   - 본문은 `.github/pull_request_template.md` 양식을 따른다 (왜 → 변경 내용 → 테스트 방법 → Claude 자체 점검 결과).
   - 본문에 `Closes #<이슈번호>`를 넣어 이슈와 연결한다.
6. **머지** — CI가 전부 통과하면 사용자에게 묻지 않고 바로 머지한다 (`gh pr merge --merge --delete-branch`). CI가 실패하면 원인을 고쳐 다시 push하고, 고칠 수 없으면 사용자에게 보고한다. 머지 후 로컬 `main`을 최신화한다.
7. **여러 저장소에 걸친 작업** (예: BE+FE) — 저장소마다 이슈·PR을 따로 만들고, 서로 링크한다 (`Kyunglock/kwak-service-fe#12` 형식).
