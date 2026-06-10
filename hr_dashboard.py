import streamlit as st
import pandas as pd
import altair as alt
import os
import json
from dotenv import load_dotenv
from google import genai as _genai
from google.genai import types as _gtypes

load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))
_GEMINI_KEY = st.secrets.get("GEMINI_API_KEY", "") or os.getenv("GEMINI_API_KEY", "")
_gemini_client = _genai.Client(api_key=_GEMINI_KEY) if _GEMINI_KEY else None

st.set_page_config(page_title="인사 관리 대시보드", layout="wide", page_icon="🏢")
st.title("🏢 인사 관리 대시보드")

# ── 데이터 로드 ──────────────────────────────────────────────
@st.cache_data
def load_loan():
    df = pd.read_csv("임직원_대출금관리.csv", encoding="utf-8-sig")
    for col in ["대출금액(원)", "월상환액(원)", "상환완료액(원)", "상환잔액(원)"]:
        df[col] = df[col].str.replace(",", "").astype(int)
    df["대출승인일"] = pd.to_datetime(df["대출승인일"])
    df["만기일"] = pd.to_datetime(df["만기일"])
    return df

@st.cache_data
def load_uniform():
    df = pd.read_csv("근무복_안전화_지급관리.csv", encoding="utf-8-sig")
    for col in ["단가(원)", "금액(원)"]:
        df[col] = df[col].str.replace(",", "").astype(int)
    df["구매일"] = pd.to_datetime(df["구매일"])
    df["지급일"] = pd.to_datetime(df["지급일"], errors="coerce")
    return df

df_loan = load_loan()
df_unif = load_uniform()

tab1, tab2 = st.tabs(["💰 임직원 대출금 관리", "👕 근무복 · 안전화 지급 관리"])


# ════════════════════════════════════════════════════════════
# TAB 1 : 대출금 관리
# ════════════════════════════════════════════════════════════
with tab1:

    # 사이드바 필터
    with st.sidebar:
        st.header("🔍 대출금 필터")
        sel_dept_l = st.multiselect("부서", sorted(df_loan["부서"].unique()), key="l_dept")
        sel_type   = st.multiselect("대출종류", sorted(df_loan["대출종류"].unique()), key="l_type")
        sel_status = st.multiselect("상환상태", sorted(df_loan["상환상태"].unique()), key="l_status")

    dl = df_loan.copy()
    if sel_dept_l:  dl = dl[dl["부서"].isin(sel_dept_l)]
    if sel_type:    dl = dl[dl["대출종류"].isin(sel_type)]
    if sel_status:  dl = dl[dl["상환상태"].isin(sel_status)]

    # ── KPI 카드 ─────────────────────────────────────────────
    k1, k2, k3, k4 = st.columns(4)
    k1.metric("총 대출 건수",       f"{len(dl):,} 건")
    k2.metric("총 대출금액",        f"{dl['대출금액(원)'].sum() / 1e8:.1f} 억원")
    k3.metric("총 상환잔액",        f"{dl['상환잔액(원)'].sum() / 1e8:.1f} 억원")
    k4.metric("연체 건수",          f"{(dl['상환상태'] == '연체').sum():,} 건")

    st.divider()

    # ── 차트 행 1 ─────────────────────────────────────────────
    c1, c2 = st.columns(2)

    with c1:
        st.subheader("📊 상환상태별 분포")
        pie_data = dl["상환상태"].value_counts().reset_index()
        pie_data.columns = ["상환상태", "건수"]
        chart = alt.Chart(pie_data).mark_arc(innerRadius=50).encode(
            theta="건수:Q",
            color=alt.Color("상환상태:N", scale=alt.Scale(
                domain=["정상", "연체", "완납"],
                range=["#4C9BE8", "#E84C4C", "#4CE880"]
            )),
            tooltip=["상환상태", "건수"]
        ).properties(height=280)
        st.altair_chart(chart, use_container_width=True)

    with c2:
        st.subheader("📊 대출종류별 총 잔액")
        bar_data = dl.groupby("대출종류")["상환잔액(원)"].sum().reset_index()
        bar_data.columns = ["대출종류", "상환잔액"]
        bar_data["상환잔액(만원)"] = (bar_data["상환잔액"] / 10000).round(0)
        chart2 = alt.Chart(bar_data).mark_bar(color="#4C9BE8").encode(
            x=alt.X("대출종류:N", sort="-y"),
            y=alt.Y("상환잔액(만원):Q", title="잔액(만원)"),
            tooltip=["대출종류", "상환잔액(만원)"]
        ).properties(height=280)
        st.altair_chart(chart2, use_container_width=True)

    # ── 차트 행 2 ─────────────────────────────────────────────
    c3, c4 = st.columns(2)

    with c3:
        st.subheader("📊 부서별 대출 잔액 TOP 10")
        dept_data = dl.groupby("부서")["상환잔액(원)"].sum().reset_index()
        dept_data.columns = ["부서", "잔액"]
        dept_data["잔액(만원)"] = (dept_data["잔액"] / 10000).round(0)
        dept_data = dept_data.sort_values("잔액(만원)", ascending=False).head(10)
        chart3 = alt.Chart(dept_data).mark_bar(color="#9B4CE8").encode(
            x=alt.X("잔액(만원):Q"),
            y=alt.Y("부서:N", sort="-x"),
            tooltip=["부서", "잔액(만원)"]
        ).properties(height=280)
        st.altair_chart(chart3, use_container_width=True)

    with c4:
        st.subheader("📊 연체일수 분포")
        overdue = dl[dl["상환상태"] == "연체"][["연체일수"]].copy()
        if not overdue.empty:
            bins = [0, 10, 30, 60, 90, overdue["연체일수"].max() + 1]
            labels = ["1~10일", "11~30일", "31~60일", "61~90일", "90일+"]
            overdue["구간"] = pd.cut(overdue["연체일수"], bins=bins, labels=labels, right=False)
            od_count = overdue["구간"].value_counts().reset_index()
            od_count.columns = ["구간", "건수"]
            chart4 = alt.Chart(od_count).mark_bar(color="#E8844C").encode(
                x=alt.X("구간:N", sort=labels),
                y="건수:Q",
                tooltip=["구간", "건수"]
            ).properties(height=280)
            st.altair_chart(chart4, use_container_width=True)
        else:
            st.info("연체 건수가 없습니다.")

    # ── 데이터 테이블 ─────────────────────────────────────────
    st.subheader("📋 대출 상세 내역")
    st.dataframe(
        dl.sort_values("상환잔액(원)", ascending=False).reset_index(drop=True),
        use_container_width=True,
        height=350
    )
    st.caption(f"총 {len(dl):,}건 표시 중")


# ════════════════════════════════════════════════════════════
# TAB 2 : 근무복·안전화 지급
# ════════════════════════════════════════════════════════════
with tab2:

    with st.sidebar:
        st.header("🔍 지급 필터")
        years = sorted(df_unif["지급연도"].unique(), reverse=True)
        sel_year   = st.multiselect("지급연도", years, default=years, key="u_year")
        sel_dept_u = st.multiselect("부서", sorted(df_unif["부서"].unique()), key="u_dept")
        sel_item   = st.multiselect("품목", sorted(df_unif["품목"].unique()), key="u_item")
        sel_issued = st.multiselect("지급여부", ["지급완료", "미지급"], key="u_issued")

    du = df_unif.copy()
    if sel_year:    du = du[du["지급연도"].isin(sel_year)]
    if sel_dept_u:  du = du[du["부서"].isin(sel_dept_u)]
    if sel_item:    du = du[du["품목"].isin(sel_item)]
    if sel_issued:  du = du[du["지급여부"].isin(sel_issued)]

    # ── KPI 카드 ─────────────────────────────────────────────
    k1, k2, k3, k4 = st.columns(4)
    k1.metric("총 지급 건수",    f"{len(du):,} 건")
    k2.metric("총 구매금액",     f"{du['금액(원)'].sum() / 1e6:.1f} 백만원")
    k3.metric("지급 완료",       f"{(du['지급여부'] == '지급완료').sum():,} 건")
    k4.metric("미지급",          f"{(du['지급여부'] == '미지급').sum():,} 건")

    st.divider()

    # ── 차트 행 1 ─────────────────────────────────────────────
    c1, c2 = st.columns(2)

    with c1:
        st.subheader("📊 품목별 지급 현황")
        item_data = du.groupby("품목")["수량"].sum().reset_index()
        chart5 = alt.Chart(item_data).mark_bar(color="#4C9BE8").encode(
            x=alt.X("품목:N", sort="-y"),
            y=alt.Y("수량:Q"),
            tooltip=["품목", "수량"]
        ).properties(height=280)
        st.altair_chart(chart5, use_container_width=True)

    with c2:
        st.subheader("📊 지급사유별 비율")
        reason_data = du["지급사유"].value_counts().reset_index()
        reason_data.columns = ["지급사유", "건수"]
        chart6 = alt.Chart(reason_data).mark_arc(innerRadius=50).encode(
            theta="건수:Q",
            color=alt.Color("지급사유:N"),
            tooltip=["지급사유", "건수"]
        ).properties(height=280)
        st.altair_chart(chart6, use_container_width=True)

    # ── 차트 행 2 ─────────────────────────────────────────────
    c3, c4 = st.columns(2)

    with c3:
        st.subheader("📊 부서별 구매금액")
        dept_u = du.groupby("부서")["금액(원)"].sum().reset_index()
        dept_u["금액(만원)"] = (dept_u["금액(원)"] / 10000).round(0)
        dept_u = dept_u.sort_values("금액(만원)", ascending=False)
        chart7 = alt.Chart(dept_u).mark_bar(color="#4CE8B4").encode(
            x=alt.X("금액(만원):Q"),
            y=alt.Y("부서:N", sort="-x"),
            tooltip=["부서", "금액(만원)"]
        ).properties(height=280)
        st.altair_chart(chart7, use_container_width=True)

    with c4:
        st.subheader("📊 연도별 구매금액 추이")
        yr_data = du.groupby("지급연도")["금액(원)"].sum().reset_index()
        yr_data["금액(만원)"] = (yr_data["금액(원)"] / 10000).round(0)
        chart8 = alt.Chart(yr_data).mark_line(point=True, color="#E8C44C", strokeWidth=2).encode(
            x=alt.X("지급연도:O", title="연도"),
            y=alt.Y("금액(만원):Q"),
            tooltip=["지급연도", "금액(만원)"]
        ).properties(height=280)
        st.altair_chart(chart8, use_container_width=True)

    # ── 미지급 현황 강조 ──────────────────────────────────────
    pending = du[du["지급여부"] == "미지급"]
    if not pending.empty:
        with st.expander(f"⚠️ 미지급 현황 ({len(pending):,}건)", expanded=True):
            st.dataframe(
                pending[["사원번호","성명","부서","직급","품목","사이즈","수량","금액(원)","구매일","지급사유"]].reset_index(drop=True),
                use_container_width=True,
                height=250
            )

    # ── 데이터 테이블 ─────────────────────────────────────────
    st.subheader("📋 지급 상세 내역")
    st.dataframe(
        du.sort_values("구매일", ascending=False).reset_index(drop=True),
        use_container_width=True,
        height=350
    )
    st.caption(f"총 {len(du):,}건 표시 중")


# ════════════════════════════════════════════════════════════
# AI 데이터 분석 채팅
# ════════════════════════════════════════════════════════════
st.markdown("---")
st.markdown("### 🤖 AI 데이터 분석 채팅")
st.caption("현재 데이터를 기반으로 자유롭게 질문하세요.  예) *연체 중인 직원 중 잔액이 가장 많은 사람은?* / *미지급 현황 요약해줘*")

if not _GEMINI_KEY:
    st.warning("`.env` 파일 또는 Streamlit Secrets에 GEMINI_API_KEY 가 없습니다.")
else:
    def _build_ctx(loan_df: pd.DataFrame, unif_df: pd.DataFrame) -> str:
        return (
            "당신은 인사팀 HR 데이터 분석 전문가입니다.\n"
            "아래 두 데이터셋을 근거로 사용자 질문에 한국어로 정확하게 답하세요.\n"
            "- 이름·금액·부서 등 구체적인 수치를 포함해 답하세요.\n"
            "- 데이터에 없는 정보는 '데이터에 해당 정보가 없습니다'라고 하세요.\n"
            f"- 기준일: {pd.Timestamp('today').strftime('%Y-%m-%d')}\n\n"
            "===== [임직원 대출금 관리] =====\n"
            f"{loan_df.to_csv(index=False)}\n\n"
            "===== [근무복·안전화 지급 관리] =====\n"
            f"{unif_df.to_csv(index=False)}\n"
        )

    _JSON_SCHEMA = (
        "반드시 아래 JSON 형식으로만 응답하세요:\n"
        "{\n"
        '  "answer": "텍스트 답변 (마크다운 가능)",\n'
        '  "table": [{{"컬럼명": 값}}, ...] 또는 null,\n'
        '  "chart_type": "bar" | "line" | "pie" | null,\n'
        '  "chart_x": "x축 컬럼명" 또는 null,\n'
        '  "chart_y": "y축 컬럼명" 또는 null,\n'
        '  "chart_title": "차트 제목" 또는 null\n'
        "}\n"
        "순위·비교·통계 답변이면 table에 포함(최대 20행), 시각화 가능하면 chart_type 지정.\n\n"
    )

    if "dash_ai_messages" not in st.session_state:
        st.session_state.dash_ai_messages = []

    chat_box = st.container()
    with chat_box:
        for msg in st.session_state.dash_ai_messages:
            with st.chat_message(msg["role"], avatar="🧑" if msg["role"] == "user" else "🤖"):
                st.markdown(msg["content"])

    user_q = st.chat_input("대시보드 데이터에 대해 질문하세요...")

    if user_q:
        st.session_state.dash_ai_messages.append({"role": "user", "content": user_q})
        with chat_box:
            with st.chat_message("user", avatar="🧑"):
                st.markdown(user_q)

        with chat_box:
            with st.chat_message("assistant", avatar="🤖"):
                with st.spinner("Gemini가 분석 중입니다..."):
                    table_data, chart_type, chart_x, chart_y, chart_title = None, None, None, None, ""
                    try:
                        history_text = ""
                        for m in st.session_state.dash_ai_messages[:-1]:
                            role_label = "사용자" if m["role"] == "user" else "AI"
                            history_text += f"{role_label}: {m['content']}\n"

                        full_prompt = (
                            f"{_build_ctx(df_loan, df_unif)}\n\n"
                            f"{_JSON_SCHEMA}"
                            f"[이전 대화]\n{history_text}\n"
                            f"사용자: {user_q}\nAI:"
                        )
                        response = _gemini_client.models.generate_content(
                            model="gemini-2.0-flash",
                            contents=full_prompt,
                            config=_gtypes.GenerateContentConfig(
                                response_mime_type="application/json"
                            ),
                        )
                        parsed     = json.loads(response.text)
                        answer     = parsed.get("answer", "")
                        table_data = parsed.get("table")
                        chart_type = parsed.get("chart_type")
                        chart_x    = parsed.get("chart_x")
                        chart_y    = parsed.get("chart_y")
                        chart_title = parsed.get("chart_title", "")
                    except Exception as e:
                        err = str(e)
                        if "429" in err or "RESOURCE_EXHAUSTED" in err:
                            answer = (
                                "⚠️ **API 할당량 초과**\n\n"
                                "[Google AI Studio](https://aistudio.google.com/app/apikey)에서 "
                                "새 API 키를 발급받아 교체하세요."
                            )
                        elif "401" in err or "API_KEY_INVALID" in err:
                            answer = "⚠️ **API 키 오류**: `GEMINI_API_KEY`를 확인하세요."
                        else:
                            answer = f"⚠️ 오류: {err}"

                st.markdown(answer)

                if table_data:
                    df_result = pd.DataFrame(table_data)
                    st.dataframe(df_result, use_container_width=True)

                    if chart_type and chart_x and chart_y and chart_x in df_result.columns and chart_y in df_result.columns:
                        x_type = "Q" if pd.api.types.is_numeric_dtype(df_result[chart_x]) else "N"
                        enc_x  = alt.X(f"{chart_x}:{x_type}", sort="-y" if chart_type == "bar" else None)
                        enc_y  = alt.Y(f"{chart_y}:Q")
                        tips   = list(df_result.columns)

                        if chart_type == "bar":
                            ai_chart = alt.Chart(df_result).mark_bar(color="#4C9BE8").encode(
                                x=enc_x, y=enc_y, tooltip=tips
                            ).properties(title=chart_title, height=260)
                        elif chart_type == "line":
                            ai_chart = alt.Chart(df_result).mark_line(point=True, color="#4C9BE8", strokeWidth=2).encode(
                                x=alt.X(f"{chart_x}:O"), y=enc_y, tooltip=tips
                            ).properties(title=chart_title, height=260)
                        elif chart_type == "pie":
                            ai_chart = alt.Chart(df_result).mark_arc(innerRadius=40).encode(
                                theta=alt.Theta(f"{chart_y}:Q"),
                                color=alt.Color(f"{chart_x}:N"),
                                tooltip=tips
                            ).properties(title=chart_title, height=260)
                        else:
                            ai_chart = None

                        if ai_chart:
                            st.altair_chart(ai_chart, use_container_width=True)

                st.session_state.dash_ai_messages.append({"role": "assistant", "content": answer})
        st.rerun()

    if st.session_state.dash_ai_messages:
        if st.button("🗑️ 대화 초기화", key="dash_clear"):
            st.session_state.dash_ai_messages = []
            st.rerun()
