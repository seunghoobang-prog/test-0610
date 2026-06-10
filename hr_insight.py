import streamlit as st
import pandas as pd
import altair as alt
from datetime import timedelta
import os
from dotenv import load_dotenv
from google import genai as _genai

load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))
_GEMINI_KEY = os.getenv("GEMINI_API_KEY", "")
_gemini_client = _genai.Client(api_key=_GEMINI_KEY) if _GEMINI_KEY else None

st.set_page_config(
    page_title="HR 인사이트 분석",
    layout="wide",
    page_icon="📊"
)

st.markdown("""
<style>
div[data-testid="metric-container"] {
    background-color: #f8f9fb;
    border-left: 4px solid #3498db;
    border-radius: 6px;
    padding: 12px;
}
.section-header {
    font-size: 1.15rem;
    font-weight: 700;
    padding: 6px 12px;
    border-radius: 4px;
    margin-bottom: 8px;
}
</style>
""", unsafe_allow_html=True)

TODAY = pd.Timestamp("2026-06-10")

# ── 데이터 로드 ──────────────────────────────────────────────
@st.cache_data
def load_data():
    loan = pd.read_csv("임직원_대출금관리.csv", encoding="utf-8-sig")
    for col in ["대출금액(원)", "월상환액(원)", "상환완료액(원)", "상환잔액(원)"]:
        loan[col] = loan[col].str.replace(",", "").astype(int)
    loan["대출승인일"] = pd.to_datetime(loan["대출승인일"])
    loan["만기일"]    = pd.to_datetime(loan["만기일"])

    unif = pd.read_csv("근무복_안전화_지급관리.csv", encoding="utf-8-sig")
    for col in ["단가(원)", "금액(원)"]:
        unif[col] = unif[col].str.replace(",", "").astype(int)
    unif["구매일"] = pd.to_datetime(unif["구매일"])
    unif["지급일"] = pd.to_datetime(unif["지급일"], errors="coerce")
    return loan, unif

loan_raw, unif_raw = load_data()

# ── 사이드바 필터 ────────────────────────────────────────────
with st.sidebar:
    st.header("🔍 필터 설정")

    all_depts = sorted(set(loan_raw["부서"].unique()) | set(unif_raw["부서"].unique()))
    sel_dept = st.multiselect("부서", all_depts, placeholder="전체 부서")

    st.markdown("---")
    st.subheader("대출금")
    sel_loan_year = st.multiselect(
        "승인 연도", sorted(loan_raw["대출승인일"].dt.year.unique()), placeholder="전체")
    sel_loan_type = st.multiselect(
        "대출종류", sorted(loan_raw["대출종류"].unique()), placeholder="전체")

    st.markdown("---")
    st.subheader("지급품목")
    sel_unif_year = st.multiselect(
        "지급 연도", sorted(unif_raw["지급연도"].unique()), placeholder="전체")

# 필터 적용
loan = loan_raw.copy()
unif = unif_raw.copy()

if sel_dept:       loan = loan[loan["부서"].isin(sel_dept)];   unif = unif[unif["부서"].isin(sel_dept)]
if sel_loan_year:  loan = loan[loan["대출승인일"].dt.year.isin(sel_loan_year)]
if sel_loan_type:  loan = loan[loan["대출종류"].isin(sel_loan_type)]
if sel_unif_year:  unif = unif[unif["지급연도"].isin(sel_unif_year)]

# ────────────────────────────────────────────────────────────
# 공통 지표 계산
# ────────────────────────────────────────────────────────────
overdue        = loan[loan["상환상태"] == "연체"]
overdue_rate   = len(overdue) / len(loan) * 100 if len(loan) else 0
due_soon       = loan[(loan["만기일"] >= TODAY) &
                      (loan["만기일"] <= TODAY + timedelta(days=90)) &
                      (loan["상환상태"] != "완납")]
pending_unif   = unif[unif["지급여부"] == "미지급"]
replace_cost   = unif[unif["지급사유"].isin(["파손교체", "분실교체"])]["금액(원)"].sum()

# ══════════════════════════════════════════════════════════
# 타이틀
# ══════════════════════════════════════════════════════════
st.title("📊 HR 인사이트 분석 대시보드")
st.caption(
    f"기준일: {TODAY.strftime('%Y년 %m월 %d일')}  |  "
    f"대출 {len(loan):,}건  ·  지급품목 {len(unif):,}건"
)
st.divider()

# ══════════════════════════════════════════════════════════
# SECTION 1 | 전체 현황 요약
# ══════════════════════════════════════════════════════════
st.markdown("### 📈 전체 현황 요약")

c1, c2, c3, c4, c5, c6 = st.columns(6)
c1.metric("대출 총 건수",      f"{len(loan):,} 건")
c2.metric("대출 잔액 합계",    f"{loan['상환잔액(원)'].sum() / 1e8:.1f} 억원")
c3.metric("연체율",            f"{overdue_rate:.1f}%",
          delta=f"연체 {len(overdue):,}건", delta_color="inverse")
c4.metric("만기 임박 (90일)", f"{len(due_soon):,} 건")
c5.metric("지급품목 총 비용",  f"{unif['금액(원)'].sum() / 1e6:.1f} 백만원")
c6.metric("교체 손실 비용",    f"{replace_cost / 1e4:.0f} 만원",
          delta="파손·분실 교체", delta_color="inverse")

st.divider()

# ══════════════════════════════════════════════════════════
# SECTION 2 | 리스크 관리
# ══════════════════════════════════════════════════════════
st.markdown("### ⚠️ 리스크 관리")

# ── 차트 행 1 ─────────────────────────────────────────────
rc1, rc2 = st.columns(2)

with rc1:
    st.markdown("**부서별 연체율**")
    dept_total   = loan.groupby("부서").size().rename("전체")
    dept_overdue_cnt = (loan[loan["상환상태"] == "연체"]
                        .groupby("부서").size().rename("연체"))
    dept_risk = pd.concat([dept_total, dept_overdue_cnt], axis=1).fillna(0).reset_index()
    dept_risk["연체율(%)"] = (dept_risk["연체"] / dept_risk["전체"] * 100).round(1)
    dept_risk = dept_risk.sort_values("연체율(%)", ascending=False)

    chart_r1 = (
        alt.Chart(dept_risk)
        .mark_bar()
        .encode(
            x=alt.X("연체율(%):Q", title="연체율 (%)"),
            y=alt.Y("부서:N", sort="-x"),
            color=alt.Color("연체율(%):Q",
                            scale=alt.Scale(scheme="reds"), legend=None),
            tooltip=["부서", "전체", "연체", "연체율(%)"]
        )
        .properties(height=300)
    )
    st.altair_chart(chart_r1, use_container_width=True)

with rc2:
    st.markdown("**대출종류별 상환 현황 (비율)**")
    type_status = (loan.groupby(["대출종류", "상환상태"])
                   .size().reset_index(name="건수"))
    color_map = alt.Scale(
        domain=["정상", "연체", "완납"],
        range=["#3498DB", "#E74C3C", "#2ECC71"]
    )
    chart_r2 = (
        alt.Chart(type_status)
        .mark_bar()
        .encode(
            x=alt.X("건수:Q", stack="normalize", title="비율"),
            y=alt.Y("대출종류:N"),
            color=alt.Color("상환상태:N", scale=color_map),
            tooltip=["대출종류", "상환상태", "건수"]
        )
        .properties(height=300)
    )
    st.altair_chart(chart_r2, use_container_width=True)

# ── 차트 행 2 ─────────────────────────────────────────────
rc3, rc4 = st.columns(2)

with rc3:
    st.markdown(f"**⏰ 만기 임박 대출 (90일 이내, {len(due_soon)}건)**")
    if not due_soon.empty:
        tbl = due_soon[["사원번호","성명","부서","직급","대출종류",
                        "상환잔액(원)","만기일"]].copy()
        tbl["잔액(만원)"] = (tbl["상환잔액(원)"] / 10000).astype(int)
        tbl["D-Day"]     = (tbl["만기일"] - TODAY).dt.days
        tbl = (tbl[["사원번호","성명","부서","대출종류","잔액(만원)","만기일","D-Day"]]
               .sort_values("D-Day"))
        st.dataframe(tbl.reset_index(drop=True), use_container_width=True, height=250)
    else:
        st.info("90일 이내 만기 도래 건이 없습니다.")

with rc4:
    st.markdown("**🚨 고위험 임직원 TOP 10** (연체 상태, 잔액 상위)")
    if not overdue.empty:
        tbl2 = overdue.sort_values("상환잔액(원)", ascending=False).head(10).copy()
        tbl2["잔액(만원)"] = (tbl2["상환잔액(원)"] / 10000).astype(int)
        tbl2 = tbl2[["사원번호","성명","부서","직급","대출종류","잔액(만원)","연체일수"]]
        st.dataframe(tbl2.reset_index(drop=True), use_container_width=True, height=250)
    else:
        st.success("현재 연체 임직원이 없습니다.")

st.divider()

# ══════════════════════════════════════════════════════════
# SECTION 3 | 예산·비용 분석
# ══════════════════════════════════════════════════════════
st.markdown("### 💰 예산·비용 분석")

# ── 차트 행 1 ─────────────────────────────────────────────
bc1, bc2 = st.columns(2)

with bc1:
    st.markdown("**연도별 구매비용 추이**")
    yr = (unif.groupby("지급연도")
          .agg(금액=("금액(원)", "sum"), 건수=("금액(원)", "count"))
          .reset_index())
    yr["금액(만원)"] = (yr["금액"] / 10000).round(0)

    bar  = alt.Chart(yr).mark_bar(opacity=0.35, color="#3498DB").encode(
        x=alt.X("지급연도:O", title="연도"),
        y=alt.Y("금액(만원):Q", title="금액 (만원)"),
        tooltip=["지급연도", "금액(만원)", "건수"]
    )
    line = alt.Chart(yr).mark_line(point=True, color="#1A5276", strokeWidth=2).encode(
        x="지급연도:O",
        y="금액(만원):Q",
        tooltip=["지급연도", "금액(만원)"]
    )
    st.altair_chart((bar + line).properties(height=280), use_container_width=True)

with bc2:
    st.markdown("**품목별 비용 구성**")
    item_c = (unif.groupby("품목")
              .agg(금액=("금액(원)", "sum"), 건수=("금액(원)", "count"))
              .reset_index())
    item_c["금액(만원)"] = (item_c["금액"] / 10000).round(0)
    item_c = item_c.sort_values("금액(만원)", ascending=False)

    chart_b2 = (
        alt.Chart(item_c)
        .mark_bar(color="#9B59B6")
        .encode(
            x=alt.X("품목:N", sort="-y"),
            y=alt.Y("금액(만원):Q"),
            tooltip=["품목", "금액(만원)", "건수"]
        )
        .properties(height=280)
    )
    st.altair_chart(chart_b2, use_container_width=True)

# ── 차트 행 2 ─────────────────────────────────────────────
bc3, bc4 = st.columns(2)

with bc3:
    st.markdown("**부서별 지출 및 지급완료율**")
    dept_sum  = (unif.groupby("부서")
                 .agg(금액합계=("금액(원)", "sum"), 건수=("금액(원)", "count"))
                 .reset_index())
    dept_done = (unif[unif["지급여부"] == "지급완료"]
                 .groupby("부서").size().rename("완료건수"))
    dept_cost = dept_sum.merge(dept_done, on="부서", how="left").fillna(0)
    dept_cost["지급완료율(%)"] = (dept_cost["완료건수"] / dept_cost["건수"] * 100).round(1)
    dept_cost["금액(만원)"]    = (dept_cost["금액합계"] / 10000).round(0)
    dept_cost = dept_cost.sort_values("금액(만원)", ascending=False)

    chart_b3 = (
        alt.Chart(dept_cost)
        .mark_bar()
        .encode(
            x=alt.X("금액(만원):Q"),
            y=alt.Y("부서:N", sort="-x"),
            color=alt.Color("지급완료율(%):Q",
                            scale=alt.Scale(scheme="greens"),
                            title="지급완료율(%)"),
            tooltip=["부서", "금액(만원)", "지급완료율(%)"]
        )
        .properties(height=300)
    )
    st.altair_chart(chart_b3, use_container_width=True)

with bc4:
    st.markdown("**지급사유별 비용 — 교체 손실 분석**")
    reason_c = (unif.groupby("지급사유")
                .agg(금액=("금액(원)", "sum"), 건수=("금액(원)", "count"))
                .reset_index())
    reason_c["금액(만원)"] = (reason_c["금액"] / 10000).round(0)
    reason_c["유형"] = reason_c["지급사유"].apply(
        lambda x: "🔴 교체(손실)" if x in ["파손교체", "분실교체"] else "🔵 일반지급"
    )
    reason_c = reason_c.sort_values("금액(만원)", ascending=False)

    chart_b4 = (
        alt.Chart(reason_c)
        .mark_bar()
        .encode(
            x=alt.X("금액(만원):Q"),
            y=alt.Y("지급사유:N", sort="-x"),
            color=alt.Color("유형:N", scale=alt.Scale(
                domain=["🔴 교체(손실)", "🔵 일반지급"],
                range=["#E74C3C", "#3498DB"]
            )),
            tooltip=["지급사유", "금액(만원)", "건수", "유형"]
        )
        .properties(height=300)
    )
    st.altair_chart(chart_b4, use_container_width=True)

# ── 공급업체 분석 (풀 너비) ───────────────────────────────
st.markdown("**공급업체별 거래 현황**")
sup = (unif.groupby("공급업체")
       .agg(총금액=("금액(원)", "sum"),
            건수=("금액(원)", "count"),
            평균단가=("단가(원)", "mean"))
       .reset_index())
sup["총금액(만원)"]  = (sup["총금액"]  / 10000).round(0)
sup["평균단가(원)"] = sup["평균단가"].round(0).astype(int)
sup = sup.sort_values("총금액(만원)", ascending=False)

chart_sup = (
    alt.Chart(sup)
    .mark_bar(color="#F39C12")
    .encode(
        x=alt.X("공급업체:N", sort="-y"),
        y=alt.Y("총금액(만원):Q"),
        tooltip=["공급업체", "총금액(만원)", "건수", "평균단가(원)"]
    )
    .properties(height=240)
)
st.altair_chart(chart_sup, use_container_width=True)

st.divider()

# ══════════════════════════════════════════════════════════
# SECTION 4 | 통합 인사이트 — 복합 위험 부서
# ══════════════════════════════════════════════════════════
st.markdown("### 🔗 통합 인사이트 — 복합 위험 부서 분석")
st.caption("대출 연체율과 교체 손실 비용이 동시에 높은 부서 → 재정·운영 복합 리스크 신호")

dept_risk_f  = dept_risk[["부서","연체율(%)"]].copy()
dept_replace = (unif[unif["지급사유"].isin(["파손교체","분실교체"])]
                .groupby("부서")["금액(원)"].sum()
                .reset_index()
                .rename(columns={"금액(원)": "교체비용(원)"}))
dept_replace["교체비용(만원)"] = (dept_replace["교체비용(원)"] / 10000).round(0)

combined = dept_risk_f.merge(dept_replace[["부서","교체비용(만원)"]], on="부서", how="inner")

avg_overdue  = combined["연체율(%)"].mean()
avg_replace  = combined["교체비용(만원)"].mean()
combined["위험도"] = combined.apply(
    lambda r: "🔴 복합위험" if (r["연체율(%)"] >= avg_overdue and r["교체비용(만원)"] >= avg_replace)
              else ("🟡 부분위험" if (r["연체율(%)"] >= avg_overdue or r["교체비용(만원)"] >= avg_replace)
                    else "🟢 안전"),
    axis=1
)

scatter = (
    alt.Chart(combined)
    .mark_circle(size=120)
    .encode(
        x=alt.X("연체율(%):Q", title="대출 연체율 (%)"),
        y=alt.Y("교체비용(만원):Q", title="교체 손실 비용 (만원)"),
        color=alt.Color("위험도:N", scale=alt.Scale(
            domain=["🔴 복합위험", "🟡 부분위험", "🟢 안전"],
            range=["#E74C3C", "#F39C12", "#2ECC71"]
        )),
        tooltip=["부서", "연체율(%)", "교체비용(만원)", "위험도"]
    )
    .properties(height=320)
)

# 기준선
h_line = alt.Chart(pd.DataFrame({"y": [avg_overdue]})).mark_rule(
    strokeDash=[4,4], color="gray", opacity=0.6
).encode(y="y:Q")

v_line = alt.Chart(pd.DataFrame({"x": [avg_replace]})).mark_rule(
    strokeDash=[4,4], color="gray", opacity=0.6
).encode(x="x:Q")

text = (
    alt.Chart(combined)
    .mark_text(dy=-12, fontSize=11)
    .encode(
        x="연체율(%):Q",
        y="교체비용(만원):Q",
        text="부서:N"
    )
)

left, right = st.columns([2, 1])
with left:
    st.altair_chart((scatter + h_line + v_line + text).properties(height=320),
                    use_container_width=True)
with right:
    st.markdown("**위험도 분류 기준**")
    st.markdown(f"- 연체율 평균: **{avg_overdue:.1f}%**")
    st.markdown(f"- 교체비용 평균: **{avg_replace:.0f}만원**")
    st.markdown("---")
    danger = combined[combined["위험도"] == "🔴 복합위험"].sort_values("연체율(%)", ascending=False)
    if not danger.empty:
        st.error(f"복합위험 부서 {len(danger)}곳")
        st.dataframe(
            danger[["부서","연체율(%)","교체비용(만원)"]].reset_index(drop=True),
            use_container_width=True, height=180
        )
    else:
        st.success("복합위험 부서 없음")

st.divider()
st.caption("© HR 인사이트 분석 대시보드  |  인사팀  |  기준일: 2026-06-10")

# ══════════════════════════════════════════════════════════
# SECTION 5 | AI 데이터 분석 채팅
# ══════════════════════════════════════════════════════════
st.markdown("---")
st.markdown("### 🤖 AI 데이터 분석 채팅")
st.caption("현재 데이터를 기반으로 자유롭게 질문하세요.  예) *지난달 가장 많이 상환한 사람은?* / *연체 위험이 높은 부서는?*")

if not _GEMINI_KEY:
    st.warning("`.env` 파일에 GEMINI_API_KEY 가 없습니다. 키를 설정한 뒤 앱을 재실행하세요.")
else:
    # ── 데이터 컨텍스트 빌드 ────────────────────────────────
    def build_context(loan_df: pd.DataFrame, unif_df: pd.DataFrame) -> str:
        loan_csv = loan_df.to_csv(index=False)
        unif_csv = unif_df.to_csv(index=False)
        return (
            "당신은 인사팀 HR 데이터 분석 전문가입니다.\n"
            "아래 두 데이터셋을 근거로 사용자 질문에 한국어로 정확하게 답하세요.\n"
            "- 이름·금액·부서 등 구체적인 수치를 포함해 답하세요.\n"
            "- 데이터에 없는 정보는 '데이터에 해당 정보가 없습니다'라고 하세요.\n"
            f"- 기준일: {TODAY.strftime('%Y-%m-%d')}\n\n"
            "===== [임직원 대출금 관리] =====\n"
            f"{loan_csv}\n\n"
            "===== [근무복·안전화 지급 관리] =====\n"
            f"{unif_csv}\n"
        )

    # ── 세션 초기화 ─────────────────────────────────────────
    if "ai_messages" not in st.session_state:
        st.session_state.ai_messages = []

    # ── 대화 기록 표시 ──────────────────────────────────────
    chat_container = st.container()
    with chat_container:
        for msg in st.session_state.ai_messages:
            with st.chat_message(msg["role"], avatar="🧑" if msg["role"] == "user" else "🤖"):
                st.markdown(msg["content"])

    # ── 입력창 ──────────────────────────────────────────────
    user_input = st.chat_input("데이터에 대해 질문하세요...")

    if user_input:
        st.session_state.ai_messages.append({"role": "user", "content": user_input})
        with chat_container:
            with st.chat_message("user", avatar="🧑"):
                st.markdown(user_input)

        with chat_container:
            with st.chat_message("assistant", avatar="🤖"):
                with st.spinner("Gemini가 분석 중입니다..."):
                    try:
                        system_ctx = build_context(loan, unif)

                        history_text = ""
                        for m in st.session_state.ai_messages[:-1]:
                            role_label = "사용자" if m["role"] == "user" else "AI"
                            history_text += f"{role_label}: {m['content']}\n"

                        full_prompt = (
                            f"{system_ctx}\n\n"
                            f"[이전 대화]\n{history_text}\n"
                            f"사용자: {user_input}\nAI:"
                        )

                        response = _gemini_client.models.generate_content(
                            model="gemini-2.0-flash", contents=full_prompt
                        )
                        answer = response.text
                    except Exception as e:
                        err = str(e)
                        if "429" in err or "RESOURCE_EXHAUSTED" in err:
                            answer = (
                                "⚠️ **API 할당량 초과**\n\n"
                                "현재 Gemini API 키의 무료 할당량이 소진되었습니다.\n"
                                "[Google AI Studio](https://aistudio.google.com/app/apikey)에서 "
                                "새 API 키를 발급받아 `.env` 파일의 `GEMINI_API_KEY`를 교체하세요."
                            )
                        elif "401" in err or "API_KEY_INVALID" in err:
                            answer = "⚠️ **API 키 오류**: `.env` 파일의 `GEMINI_API_KEY`를 확인하세요."
                        else:
                            answer = f"⚠️ 오류: {err}"

                st.markdown(answer)
                st.session_state.ai_messages.append({"role": "assistant", "content": answer})
        st.rerun()

    # ── 초기화 버튼 ─────────────────────────────────────────
    if st.session_state.ai_messages:
        if st.button("🗑️ 대화 초기화"):
            st.session_state.ai_messages = []
            st.rerun()
