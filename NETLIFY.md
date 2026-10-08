# Netlify 로 올리기

## 폴더 구조 (이대로 저장소에 올려요)
```
index.html
netlify.toml
package.json
netlify/functions/data.mjs
```

## 순서
1. 위 파일들을 GitHub 저장소에 올려요. (기존 `data.json` 이 있으면 같이 두세요. 처음 화면의 시작 내용이 돼요.)
2. Netlify → **Add new site → Import an existing project** → 그 저장소를 고르면 `netlify.toml` 설정으로 자동 배포돼요.
3. Netlify 사이트 → **Site configuration → Environment variables** → `ADMIN_PASSWORD` 를 추가해요. (관리자 비밀번호. 길고 어렵게!)
4. **Deploys → Trigger deploy** 로 한 번 더 배포해요. (환경 변수는 새 배포부터 적용돼요)
5. 사이트 주소를 열고 **관리자 로그인** → 비밀번호 입력 → **편집 모드**.

## 알아둘 점
- 저장하면 Netlify Blobs 에 바로 저장되고 방문자 화면에도 곧바로 보여요.
- 저장 데이터는 약 5MB 까지예요. 사진이 많으면 줄이거나 일부를 지워 주세요.
- 폴더를 끌어다 놓는 수동 배포(Drag & drop)는 저장 함수가 빠질 수 있어요. 저장소 연결이나 Netlify CLI(`netlify deploy --prod`) 배포를 권장해요.
- `/api/data` 가 없으면(GitHub Pages 등) 예전처럼 GitHub 토큰 방식으로 자동 전환돼요.
