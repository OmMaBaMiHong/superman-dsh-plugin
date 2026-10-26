import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/syosetu/templates/description.tsx
const SyosetuDescription = ({ novel, genreText }) => /* @__PURE__ */ jsxs(Fragment, { children: [
	novel.story ? /* @__PURE__ */ jsx("p", { children: raw(novel.story.replaceAll("\n", "<br>")) }) : null,
	/* @__PURE__ */ jsx("h2", { children: "作品情報" }),
	/* @__PURE__ */ jsxs("table", { children: [
		/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: "状態" }), /* @__PURE__ */ jsx("td", { children: novel.novel_type === 2 ? "短編" : /* @__PURE__ */ jsxs(Fragment, { children: [
			novel.end === 0 ? "完結済" : "連載中",
			"（全",
			novel.general_all_no,
			"エピソード）"
		] }) })] }),
		genreText ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: "ジャンル" }), /* @__PURE__ */ jsx("td", { children: genreText })] }) : null,
		/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: "キーワード" }), /* @__PURE__ */ jsx("td", { children: novel.keyword.replaceAll(" ", "、") })] }),
		/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: "最終掲載" }), /* @__PURE__ */ jsx("td", { children: novel.general_lastup })] }),
		/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: "Nコード" }), /* @__PURE__ */ jsx("td", { children: novel.ncode })] }),
		/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: "読了時間" }), /* @__PURE__ */ jsxs("td", { children: [
			"約",
			novel.time,
			"分（",
			novel.length,
			"文字）"
		] })] })
	] }),
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsxs("table", { children: [
		novel.weekly_unique ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: "週別ユニークユーザ" }), /* @__PURE__ */ jsx("td", { children: novel.weekly_unique < 100 ? "100未満" : novel.weekly_unique })] }) : null,
		/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: "総合ポイント" }), /* @__PURE__ */ jsxs("td", { children: [novel.global_point, " pt"] })] }),
		/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: "評価人数" }), /* @__PURE__ */ jsxs("td", { children: [novel.all_hyoka_cnt, " 人"] })] }),
		/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: "評価ポイント" }), /* @__PURE__ */ jsxs("td", { children: [novel.all_point, " pt"] })] }),
		/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: "ブックマーク" }), /* @__PURE__ */ jsxs("td", { children: [novel.fav_novel_cnt, " 件"] })] })
	] }),
	novel.sasie_cnt > 0 ? /* @__PURE__ */ jsxs("p", { children: [
		"挿絵数：",
		novel.sasie_cnt,
		"枚"
	] }) : null
] });
const renderDescription = (data) => renderToString(/* @__PURE__ */ jsx(SyosetuDescription, { ...data }));
//#endregion
export { renderDescription as t };
