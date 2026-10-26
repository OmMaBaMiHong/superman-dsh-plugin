import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/fffdm/manhua/manhua.tsx
const host = `https://manhua.fffdm.com`;
const get_pic = async (url) => {
	const data = (await got_default(url)).data;
	return {
		comicTitle: data.mhinfo.title,
		chapterTitle: data.title,
		pics: data.cont,
		pubDate: parseDate(data.mh.time)
	};
};
const route = {
	path: "/manhua/:id/:cdn?",
	categories: ["anime"],
	example: "/fffdm/manhua/93",
	parameters: {
		id: "漫画ID。默认获取全部，建议使用通用参数limit获取指定数量",
		cdn: "cdn加速器。默认5，当前可选1-5"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.fffdm.com/manhua/:id", "www.fffdm.com/:id"],
		target: "/manhua/:id"
	}],
	name: "在线漫画",
	maintainers: ["zytomorrow"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const count = ctx.req.query("limit") || 99999;
	const cdnNum = ctx.req.param("cdn") || 5;
	const cdn = !Number.isNaN(Number.parseInt(cdnNum)) && 1 <= Number.parseInt(cdnNum) && Number.parseInt(cdnNum) <= 5 ? `https://p${cdnNum}.fzacg.com` : "https://p5.fzacg.com";
	const data = (await got_default(`${host}/api/manhua/${id}`)).data;
	const chapter_detail = await Promise.all(data.mhlist.splice(0, count).map((item) => {
		const url = `${host}/api/manhua/${id}/${item.url}`;
		return cache_default.tryGet(url, async () => {
			const picContent = await get_pic(url);
			return {
				title: picContent.chapterTitle,
				description: renderToString(/* @__PURE__ */ jsx("div", { children: picContent.pics.map((value) => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: `${cdn}/${value}` }), /* @__PURE__ */ jsx("br", {})] })) })),
				link: `${host}/${id}/${item.url}/`,
				comicTitle: picContent.comicTitle,
				pubDate: picContent.pubDate
			};
		});
	}));
	return {
		title: "风之动漫 - " + chapter_detail[0].comicTitle,
		link: `${host}/${id}`,
		description: "风之动漫",
		item: chapter_detail
	};
}
//#endregion
export { route };
