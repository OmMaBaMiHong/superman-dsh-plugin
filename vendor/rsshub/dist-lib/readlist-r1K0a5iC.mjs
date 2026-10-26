import "./types-DNj6Etbg.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/bilibili/readlist.ts
const route = {
	path: "/readlist/:listid",
	categories: ["social-media"],
	view: 0,
	example: "/bilibili/readlist/25611",
	parameters: { listid: "文集 id, 可在专栏文集 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "专栏文集",
	maintainers: ["hoilc"],
	handler
};
async function handler(ctx) {
	const listid = ctx.req.param("listid");
	const listurl = `https://www.bilibili.com/read/readlist/rl${listid}`;
	const data = (await got_default({
		method: "get",
		url: `https://api.bilibili.com/x/article/list/web/articles?id=${listid}&jsonp=jsonp`,
		headers: { Referer: listurl }
	})).data.data;
	return {
		title: `bilibili 专栏文集 - ${data.list.name}`,
		link: listurl,
		image: data.list.image_url,
		description: data.list.summary ?? "作者很懒，还木有写简介.....((/- -)/",
		item: data.articles && data.articles.map((item) => ({
			title: item.title,
			author: data.author.name,
			description: `${item.summary}…<br><img src="${item.image_urls[0]}">`,
			pubDate: (/* @__PURE__ */ new Date(item.publish_time * 1e3)).toUTCString(),
			link: `https://www.bilibili.com/read/cv${item.id}/?from=readlist`
		}))
	};
}
//#endregion
export { route };
