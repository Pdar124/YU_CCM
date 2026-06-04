<div align="center">
  
# Campus Cat Mate (CCM)
> **캠퍼스 길고양이와 인간의 건강한 공존을 위한 지능형 위치 예측 및 돌봄 네트워크**

<img width="300" height="300" alt="Logo_Image" src="https://github.com/user-attachments/assets/d16ac81e-b9c0-491a-a371-f0545958a865" />

</div>

**Campus Cat Mate**는 파편화된 캠퍼스 고양이 정보를 통합하여 실시간 위치 예측, 예상 동선 분석, 그리고 체계적인 건강 관리를 제공하는 **생태 기반 지능형 시스템**입니다.

---

## 서비스 접속

- 서비스 URL: https://yu-ccm.vercel.app

---

## 로컬 실행 방법

### 1. 프로젝트 폴더로 이동

```bash
cd CCM_Implementation
```

### 2. 패키지 설치

```bash
npm install
```

### 3. 환경변수 설정

`CCM_Implementation/.env` 파일을 생성하고 아래 값을 설정합니다.

```env
OPENWEATHER_API_KEY=OpenWeather API Key
```

Kakao Map JavaScript Key는 현재 `DashboardPage.jsx`의 Kakao Map SDK script URL에서 로드됩니다.

### 4. 개발 서버 실행

```bash
npm run dev
```

기본 로컬 접속 주소는 다음과 같습니다.

```text
http://localhost:5174
```

### 5. 프로덕션 빌드 확인

```bash
npm run build
npm run preview
```
## Commit Message Convention

본 프로젝트는 일관된 커밋 기록을 위해 **Conventional Commits** 스타일을 따릅니다.

| Type     | Description                                      |
|----------|--------------------------------------------------|
| feat     | 새로운 기능 추가                                 |
| fix      | 버그 수정                                        |
| docs     | 문서 수정 (README 등)                            |
| style    | 코드 스타일 변경 (공백, 세미콜론 등, 로직 변화 없음) |
| refactor | 코드 리팩토링 (기능 변화 없음)                   |
| test     | 테스트 코드 추가/수정                            |
| chore    | 빌드, 설정, 패키지 관련 작업                    |
| sync     | 로컬/원격 구조 동기화                           |
| init     | 초기 설정                                       |

---


## Author

* **Name:** 박다래 (Darae Park)
* **Student ID:** 22411841
* **Email:** ret7258@naver.com
* **GitHub:** [@Pdar124](https://github.com/Pdar124)
