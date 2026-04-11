# 🐱 Campus Cat Mate (CCM)
> **캠퍼스 길고양이와 인간의 건강한 공존을 위한 지능형 위치 예측 및 돌봄 네트워크**

![Version](https://img.shields.io/badge/version-1.20-blue)
![Platform](https://img.shields.io/badge/platform-Mobile%20Web-orange)
![License](https://img.shields.io/badge/license-MIT-green)

**Campus Cat Mate**는 파편화된 캠퍼스 고양이 정보를 통합하여 실시간 위치 예측, 예상 동선 분석, 그리고 체계적인 건강 관리를 제공하는 **생태 기반 지능형 시스템**입니다.

---

## ✨ Key Features

### 📍 실시간 지도 및 지능형 동선 예측 (Real-time & Predictive Map)
* **Encounter Check:** GPS 기반 조우 제보 및 **'영역 기반 후보 추천'** 팝업을 통한 간편 제보.
* **Path Analysis:** 시계열 분석을 통해 다음 루틴 지점까지의 **예상 동선(Predicted Path)** 시각화.
* **Recency Weight:** 최근 1시간 이내의 실시간 제보 데이터에 가중치를 부여하여 예측 모델 즉각 보정.

### 🧠 지능형 개체 식별 (Territory-based ID)
* **Ecological Approach:** 고양이의 영역성(Territoriality)을 활용하여 GPS 좌표와 해당 구역 주인 데이터를 대조, 오제보를 원천 차단합니다.

### 🍱 체계적인 돌봄 관리 (Caregiver Log)
* **Diet Check:** 중복 급여 방지를 위한 사료 종류 및 양 기록 관리.
* **Health Monitoring:** 과거 이력 추적 및 롤백이 가능한 건강 상태 로그(Append-only) 관리.

### 📚 집단지성 고양이 위키 (Cat Wiki)
* **Cat Profile:** 이름, 나이, 성격, 주요 활동 영역(Territory) 정보 관리.
* **Optimistic Locking:** 다수 사용자의 동시 편집 시 데이터 무결성을 유지하는 낙관적 락 적용.

---

## 🛠 Technical Solution & NFR

### ⚡ Core Algorithms
* **Territory-based Identification:** GPS 좌표 기반 구역별 개체 자동 판별 알고리즘.
* **Routine-based Prediction:** 시간대별/기상 상황별(OpenWeatherMap API) 고양이 활동 루틴 모델링.
* **Predictive Mapping:** 제보 공백 시간대에도 루틴 데이터를 결합하여 확률 높은 예상 위치 자동 생성.

### 📱 User Experience & Reliability
* **Mobile First UX:** 야외 제보 상황을 고려한 '원터치 위치 전송' 및 직관적인 UI 설계.
* **Offline Buffering:** 네트워크 음영 지역 대비 클라이언트 측 로컬 캐싱 기능.
* **Data Integrity:** 모든 변경 이력을 **Append-only Log**로 보관하여 완벽한 추적성 보장.

---

## 👥 Roles

| Role | Description |
| :--- | :--- |
| **Student (Observer)** | 위치 제보, 예상 동선 확인, 신규 고양이 등록 요청 |
| **Caregiver (Guardian)** | 전문 돌봄 기록(식단/건강), 위키 편집 및 영역(Territory) 설정 |
| **Administrator** | 신규 등록 승인 큐(Approval Queue) 관리, 시스템 통계 모니터링 |

---

## 📅 Revision History

| Version | Date | Description |
| :--- | :--- | :--- |
| **v1.00** | 03/27 | First Draft |
| **v1.12** | 03/28 | Real-time Map 기능 추가 및 문서 고고화 |
| **v1.13** | 03/28 | 프로젝트 공식 로고(CCM_LOGO) 적용 및 시각화 |
| **v1.20** | 03/28 | **위치 예측 및 동선 분석(Path Analysis) 로직 통합 (Current)** |

---
## 📝 Commit Message Convention

본 프로젝트는 일관된 커밋 기록을 위해 **Conventional Commits** 스타일을 따릅니다.

### 📌 Format

```bash
type: message
type(scope): message
```

### ✨ Commit Types

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

#### 💡 examples
- feat: add real-time map feature
- fix: correct file structure issue
- docs: update README with project details
- refactor: rename core folder to CAMPUS_CAT_MATE
- sync: match local file structure with remote repository
---
## 👤 Author

* **Name:** 박다래 (Darae Park)
* **Student ID:** 22411841
* **Email:** ret7258@naver.com
* **GitHub:** [@Pdar124](https://github.com/Pdar124)

> **Campus Cat Mate**는 고양이를 아끼는 마음이 유효한 데이터가 되어 더 나은 환경을 만드는 것을 목표로 합니다.
