import streamlit as st
import pandas as pd
import altair as alt

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
