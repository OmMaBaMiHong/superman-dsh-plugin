import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/shcstheatre/programs.tsx
const route = {
	path: "/programs",
	categories: ["shopping"],
	example: "/shcstheatre/programs",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.shcstheatre.com/Program/programList.aspx"] }],
	name: "节目列表",
	maintainers: ["fuzy112"],
	handler,
	url: "www.shcstheatre.com/Program/programList.aspx"
};
async function handler() {
	const url = "https://www.shcstheatre.com/Program/programList.aspx";
	const $ = load((await got_default.get(url)).data);
	const baseUrl = "https://www.shcstheatre.com";
	const splitImages = (value) => value?.split(";").map((item) => item.trim()).filter(Boolean) ?? [];
	const renderDescription = (data) => {
		const { SCS_PC_YMXQ_PIC, SCS_WEBPERCYCLE, SCS_EINLASSNAME, SCS_PERFORMANCE_TYPENAME, SCS_LENGTH, SCS_PERLANGUAGENAME, SCS_PC_LUNBO_YCJS_EDITOR, SCS_PC_LUNBO_YCJS_PIC, SCS_PC_LUNBO_ZCTD_EDITOR, SCS_PC_LUNBO_ZCTD_PIC, SCS_PC_LUNBO_JQGG_EDITOR, SCS_PC_LUNBO_JQGG_PIC, SCS_PC_LUNBO_HJJL_EDITOR, SCS_PC_LUNBO_HJJL_PIC, SCS_PC_LUNBO_MTPL_EDITOR, SCS_PC_LUNBO_MTPL_PIC } = data;
		return renderToString(/* @__PURE__ */ jsxs("div", { children: [
			splitImages(SCS_PC_YMXQ_PIC).map((src) => /* @__PURE__ */ jsx("img", { src: `${baseUrl}${src}` })),
			/* @__PURE__ */ jsxs("ul", { children: [
				/* @__PURE__ */ jsxs("li", { children: ["演出日期：", SCS_WEBPERCYCLE] }),
				/* @__PURE__ */ jsxs("li", { children: ["入场时间：", SCS_EINLASSNAME] }),
				/* @__PURE__ */ jsxs("li", { children: ["演出类型：", SCS_PERFORMANCE_TYPENAME] }),
				/* @__PURE__ */ jsxs("li", { children: [
					"演出时长：",
					SCS_LENGTH,
					"分钟"
				] }),
				/* @__PURE__ */ jsxs("li", { children: ["演出语言：", SCS_PERLANGUAGENAME] })
			] }),
			SCS_PC_LUNBO_YCJS_EDITOR ? /* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsx("h1", { children: "演出介绍" }),
				splitImages(SCS_PC_LUNBO_YCJS_PIC).map((src) => /* @__PURE__ */ jsx("img", { src: `${baseUrl}${src}` })),
				/* @__PURE__ */ jsx("div", { children: raw(SCS_PC_LUNBO_YCJS_EDITOR) })
			] }) : null,
			SCS_PC_LUNBO_ZCTD_EDITOR ? /* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsx("h1", { children: "主创团队" }),
				splitImages(SCS_PC_LUNBO_ZCTD_PIC).map((src) => /* @__PURE__ */ jsx("img", { src: `${baseUrl}${src}` })),
				/* @__PURE__ */ jsx("div", { children: raw(SCS_PC_LUNBO_ZCTD_EDITOR) })
			] }) : null,
			SCS_PC_LUNBO_JQGG_EDITOR ? /* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsx("h1", { children: "剧情梗概" }),
				splitImages(SCS_PC_LUNBO_JQGG_PIC).map((src) => /* @__PURE__ */ jsx("img", { src: `${baseUrl}${src}` })),
				/* @__PURE__ */ jsx("div", { children: raw(SCS_PC_LUNBO_JQGG_EDITOR) })
			] }) : null,
			SCS_PC_LUNBO_HJJL_EDITOR ? /* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsx("h1", { children: "获奖记录" }),
				splitImages(SCS_PC_LUNBO_HJJL_PIC).map((src) => /* @__PURE__ */ jsx("img", { src: `${baseUrl}${src}` })),
				/* @__PURE__ */ jsx("div", { children: raw(SCS_PC_LUNBO_HJJL_EDITOR) })
			] }) : null,
			SCS_PC_LUNBO_MTPL_EDITOR ? /* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsx("h1", { children: "媒体评论" }),
				splitImages(SCS_PC_LUNBO_MTPL_PIC).map((src) => /* @__PURE__ */ jsx("img", { src: `${baseUrl}${src}` })),
				/* @__PURE__ */ jsx("div", { children: raw(SCS_PC_LUNBO_MTPL_EDITOR) })
			] }) : null
		] }));
	};
	const items = await Promise.all($("#datarow .program-name a").map((_, elem) => {
		const link = new URL($(elem).attr("href"), url);
		return cache_default.tryGet(link.href, async () => {
			const id = link.searchParams.get("id");
			const data = (await got_default.post("https://www.shcstheatre.com/webapi.ashx?op=GettblprogramCache", {
				headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
				form: { id }
			})).data.data.tblprogram[0];
			return {
				title: data.SCS_WEB_BRIEFNAME,
				link: link.href,
				description: renderDescription(data),
				pubDate: timezone(parseDate(data.SJ_DATE_PC), 8)
			};
		});
	}));
	return {
		title: "上海文化广场 - 节目列表",
		link: url,
		image: $(".menu-logo img").attr("src"),
		item: items
	};
}
//#endregion
export { route };
