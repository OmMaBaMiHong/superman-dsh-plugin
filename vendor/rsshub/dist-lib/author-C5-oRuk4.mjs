import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { jsx } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/tencent/news/author.tsx
const route = {
	path: "/news/author/:mid",
	categories: ["new-media"],
	example: "/tencent/news/author/5933889",
	parameters: { mid: "企鹅号 ID" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		title: "当前作者文章",
		source: ["news.qq.com/omn/author/:mid"]
	}],
	name: "作者",
	maintainers: ["LogicJake", "miles170"],
	handler
};
async function handler(ctx) {
	const mid = ctx.req.param("mid");
	const homePageInfoUrl = `https://i.news.qq.com/i/getUserHomepageInfo?${/^\d+$/.test(mid) ? "chlid" : "guestSuid"}=${mid}`;
	const userInfo = await cache_default.tryGet(homePageInfoUrl, async () => (await got_default(homePageInfoUrl)).data.userinfo);
	const title = userInfo.nick;
	const description = userInfo.user_desc;
	const newsListUrl = `https://i.news.qq.com/getSubNewsMixedList?guestSuid=${encodeURIComponent(userInfo.suid)}&tabId=om_index`;
	const news = await cache_default.tryGet(newsListUrl, async () => (await got_default(newsListUrl)).data.newslist, config.cache.routeExpire, false);
	const items = await Promise.all(news.map((item) => {
		const title = item.title;
		const pubDate = parseDate(item.timestamp, "X");
		const itemUrl = item.url;
		const author = item.source;
		const abstract = item.abstract;
		if (item.articletype === "4" || item.articletype === "118") return {
			title,
			description: `<a href=${item.url}><img src="${item.articletype === "4" ? item.miniProShareImage : item.miniVideoPic}" style="width: 100%"></a>`,
			link: itemUrl,
			author,
			pubDate
		};
		return cache_default.tryGet(itemUrl, async () => {
			const $ = load((await got_default(itemUrl)).data);
			const data = JSON.parse($("script:contains(\"window.DATA\")").text().match(/window\.DATA = (\{.+\});/)[1]);
			const $data = load(data.originContent?.text || "", null, false);
			if ($data) $data("*").contents().filter((_, elem) => elem.type === "comment").replaceWith((_, elem) => {
				const attribute = elem.data.trim();
				const imageData = attribute?.startsWith("IMG") ? data.originAttribute[attribute] : void 0;
				return renderToString(imageData ? /* @__PURE__ */ jsx("img", {
					src: imageData.imgurl0,
					style: imageData.style
				}) : null);
			});
			return {
				title,
				description: $data.html() || abstract,
				link: itemUrl,
				author,
				pubDate
			};
		});
	}));
	return {
		title,
		description,
		link: `https://new.qq.com/omn/author/${mid}`,
		item: items,
		image: userInfo?.shareImg
	};
}
//#endregion
export { route };
