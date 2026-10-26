import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/infzm/index.ts
const route = {
	path: "/:id",
	parameters: { id: "南方周末频道 id, 可在该频道的 URL 中找到（即 https://www.infzm.com/contents?term_id=:id)" },
	categories: ["traditional-media"],
	example: "/infzm/1",
	radar: [{
		source: ["infzm.com/contents"],
		target: (_, url) => url ? `/infzm/${url.match(/contents\?term_id=(\d*)/)?.[1]}` : ""
	}],
	name: "频道",
	maintainers: [
		"KarasuShin",
		"ranpox",
		"xyqfer"
	],
	handler,
	description: `下面给出部分参考：

| 推荐 | 新闻 | 观点 | 文化 | 人物 | 影像 | 专题 | 生活 | 视频 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 1    | 2    | 3    | 4    | 7    | 8    | 6    | 5    | 131  |`
};
const baseUrl = "https://www.infzm.com/contents";
async function handler(ctx) {
	const id = ctx.req.param("id");
	const link = `${baseUrl}?term_id=${id}`;
	const { data } = await got_default({
		method: "get",
		url: `${baseUrl}?term_id=${id}&page=1&format=json`,
		headers: { Referer: link }
	});
	const resultItem = await fetchArticles(data.data.contents);
	return {
		title: `南方周末-${data.data.current_term.title}`,
		link,
		image: "https://www.infzm.com/favicon.ico",
		item: resultItem
	};
}
//#endregion
//#region lib/routes/infzm/utils.ts
async function fetchArticles(data) {
	return await Promise.all(data.map(({ id, subject, author, publish_time }) => {
		const link = `${baseUrl}/${id}`;
		return cache_default.tryGet(link, async () => {
			const cookie = config.infzm.cookie;
			return {
				title: subject,
				description: load((await got_default.get({
					method: "get",
					url: link,
					headers: {
						Referer: link,
						Cookie: cookie || `passport_session=${Math.floor(Math.random() * 100)};`
					}
				})).data)("div.nfzm-content__content").html() ?? "",
				pubDate: timezone(publish_time, 8).toUTCString(),
				link,
				author
			};
		});
	}));
}
//#endregion
export { baseUrl as n, route as r, fetchArticles as t };
