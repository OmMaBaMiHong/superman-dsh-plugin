import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { n as rootUrl, t as getSearchParams } from "./utils-BTIOSr4q.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/cls/telegraph.tsx
const categories = {
	watch: "看盘",
	announcement: "公司",
	red: "加红",
	remind: "提醒",
	fund: "基金",
	hk: "港股",
	hk_us: "港美股"
};
const renderTelegraphDescription = (item) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [item.content ? /* @__PURE__ */ jsx(Fragment, { children: item.content }) : null, item.images?.length ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("br", {}), item.images.map((image) => /* @__PURE__ */ jsx("img", { src: image }, image))] }) : null] }));
const route = {
	path: "/telegraph/:category?",
	categories: ["finance"],
	example: "/cls/telegraph",
	parameters: { category: "分类，见下表，默认为全部" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["cls.cn/telegraph", "cls.cn/"],
		target: "/telegraph"
	}],
	name: "电报",
	maintainers: ["nczitzk"],
	handler,
	url: "cls.cn/telegraph",
	description: `| 看盘  | 公司         | 加红 | 提醒   | 基金 | 港美股 |
| ----- | ------------ | ---- | ------ | ---- | ------ |
| watch | announcement | red  | remind | fund | hk\\_us |`
};
async function handler(ctx) {
	const category = ctx.req.param("category");
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 50;
	let apiUrl = `${rootUrl}/api/cache`;
	if (category) apiUrl = `${rootUrl}/v1/roll/get_roll_list`;
	const currentUrl = `${rootUrl}/telegraph`;
	const items = (await rofetch(apiUrl, { query: getSearchParams({
		category,
		name: category ? void 0 : "telegraph"
	}) })).data.roll_data.slice(0, limit).map((item) => ({
		title: item.title || item.content,
		link: item.shareurl,
		description: renderTelegraphDescription(item),
		pubDate: parseDate(item.ctime, "X"),
		category: item.subjects?.map((s) => s.subject_name)
	}));
	return {
		title: `财联社 - 电报${category ? ` - ${categories[category]}` : ""}`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
