import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/douban/movie/coming.tsx
const route = {
	path: "/movie/coming",
	categories: ["social-media"],
	example: "/douban/movie/coming",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "电影即将上映",
	maintainers: ["reonokiy"],
	radar: [{
		title: "豆瓣电影-即将上映",
		source: ["movie.douban.com/coming"],
		target: "/movie/coming"
	}],
	handler
};
const renderDescription = (info) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	info.cover_url && info.title ? /* @__PURE__ */ jsx("img", {
		src: info.cover_url,
		alt: info.title,
		referrerpolicy: "no-referrer"
	}) : null,
	/* @__PURE__ */ jsx("h2", { children: "电影信息" }),
	/* @__PURE__ */ jsxs("ul", { children: [
		info.directors?.length ? /* @__PURE__ */ jsxs("li", { children: ["导演：", info.directors.join(", ")] }) : null,
		info.actors?.length ? /* @__PURE__ */ jsxs("li", { children: ["演员：", info.actors.join(", ")] }) : null,
		info.genres?.length ? /* @__PURE__ */ jsxs("li", { children: ["类型：", info.genres.join(" / ")] }) : null,
		info.pubdate?.length ? /* @__PURE__ */ jsxs("li", { children: ["上映日期：", info.pubdate.join(" / ")] }) : null,
		info.wish_count ? /* @__PURE__ */ jsxs("li", { children: ["想看：", info.wish_count] }) : null
	] }),
	info.intro ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("h2", { children: "剧情简介" }), /* @__PURE__ */ jsx("p", { children: info.intro })] }) : null
] }));
async function handler(ctx) {
	const response = await got_default({
		method: "get",
		url: "https://m.douban.com/rexxar/api/v2/movie/coming_soon",
		headers: { Referer: "https://m.douban.com/movie/" }
	});
	ctx.set("json", { response });
	return {
		title: "豆瓣电影-即将上映",
		link: "https://movie.douban.com/coming",
		item: response.data?.subjects?.map((item) => ({
			title: item?.title,
			link: item?.url,
			guid: item?.url,
			description: renderDescription({
				title: item?.title,
				intro: item?.intro,
				pubdate: item?.pubdate,
				cover_url: item?.cover_url,
				directors: item?.directors?.map((d) => d?.name),
				actors: item?.actors?.map((a) => a?.name),
				genres: item?.genres,
				wish_count: item?.wish_count
			}),
			category: item?.genres,
			itunes_item_image: item?.cover_url,
			upvotes: item?.wish_count
		}))
	};
}
//#endregion
export { route };
