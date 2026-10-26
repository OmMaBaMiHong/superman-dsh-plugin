import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/douban/other/weekly-best.tsx
const route = {
	path: "/movie/weekly/:type?",
	categories: ["social-media"],
	example: "/douban/movie/weekly",
	parameters: { type: "分类，可在榜单页 URL 中找到，默认为一周口碑电影榜" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "一周口碑榜",
	maintainers: ["numm233", "nczitzk"],
	handler,
	description: `| 一周口碑电影榜      | 华语口碑剧集榜            |
| ------------------- | ------------------------- |
| movie\\_weekly\\_best | tv\\_chinese\\_best\\_weekly |`
};
async function handler(ctx) {
	const type = ctx.req.param("type") || "movie_weekly_best";
	const link = "https://m.douban.com/movie";
	const apiUrl = `https://m.douban.com/rexxar/api/v2/subject_collection/${type}`;
	const itemResponse = await got_default({
		method: "get",
		url: `${apiUrl}/items?start=0&count=10`,
		headers: { Referer: link }
	});
	const infoResponse = await got_default({
		method: "get",
		url: apiUrl,
		headers: { Referer: link }
	});
	const data = itemResponse.data.subject_collection_items;
	return {
		title: infoResponse.data.title,
		link: `https://m.douban.com/subject_collection/${type}`,
		description: infoResponse.data.description,
		item: data.map(({ title, cover, cover_url, url, rating, null_rating_reason, description, card_subtitle, photos }) => {
			const rate = rating ? `${rating.value.toFixed(1)}分` : null_rating_reason;
			if (cover && cover.url) cover_url = cover.url;
			return {
				title,
				description: renderDescription({
					title,
					card_subtitle,
					description,
					rate,
					cover_url,
					photos
				}),
				link: url
			};
		})
	};
}
const renderDescription = ({ title, rate, card_subtitle, description, cover_url, photos }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	/* @__PURE__ */ jsxs("p", { children: ["标题：", title] }),
	/* @__PURE__ */ jsxs("p", { children: ["评分：", rate] }),
	/* @__PURE__ */ jsxs("p", { children: ["标签：", card_subtitle] }),
	/* @__PURE__ */ jsxs("p", { children: ["影片信息：", description] }),
	/* @__PURE__ */ jsxs("p", { children: [cover_url ? /* @__PURE__ */ jsx("img", { src: cover_url }) : null, photos?.map((photo, index) => /* @__PURE__ */ jsx("img", { src: photo }, `${photo}-${index}`))] })
] }));
//#endregion
export { route };
