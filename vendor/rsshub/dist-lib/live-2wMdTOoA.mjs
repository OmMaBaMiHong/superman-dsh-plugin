import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/gelonghui/live.tsx
const baseUrl = "https://www.gelonghui.com";
const route = {
	path: "/live",
	categories: ["finance"],
	view: 0,
	example: "/gelonghui/live",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["gelonghui.com/live", "gelonghui.com/"] }],
	name: "实时快讯",
	maintainers: [],
	handler,
	url: "gelonghui.com/live"
};
async function handler() {
	const { data: { result } } = await got_default(`${baseUrl}/api/live-channels/all/lives/v4`);
	const items = result.map((i) => ({
		title: i.title || i.content,
		description: renderToString(/* @__PURE__ */ jsx(GelonghuiLiveDescription, { i })),
		link: i.route,
		category: i.source,
		pubDate: parseDate(i.createTimestamp, "X")
	}));
	return {
		title: "格隆汇快讯-7x24小时市场快讯-财经市场热点",
		description: "格隆汇快讯栏目提供外汇投资实时行情,外汇投资交易,外汇投资炒股,证券等内容,实时更新,格隆汇未来将陆续开通台湾、日本、印度、欧洲等市场.",
		image: "https://cdn.gelonghui.com/static/web/www.ico.la.ico",
		link: `${baseUrl}/live`,
		item: items
	};
}
const GelonghuiLiveDescription = ({ i }) => /* @__PURE__ */ jsxs(Fragment, { children: [i.content, i.pictures?.length ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("br", {}), i.pictures.map((p) => /* @__PURE__ */ jsx("img", { src: p }))] }) : null] });
//#endregion
export { route };
