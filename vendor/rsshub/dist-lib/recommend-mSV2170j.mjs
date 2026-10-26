import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as md5 } from "./md5-CpIHIxCO.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/51cto/utils.ts
const getToken = () => cache_default.tryGet("51cto:token", async () => {
	return (await rofetch("https://api-media.51cto.com/api/token-get")).data.data.token;
}, 3600, false);
const sign = (requestPath, payload = {}, timestamp, token) => {
	payload.timestamp = timestamp;
	payload.token = token;
	const sortedParams = Object.keys(payload).toSorted((a, b) => a.localeCompare(b));
	return md5(md5(requestPath) + md5(sortedParams + md5(token) + timestamp));
};
//#endregion
//#region lib/routes/51cto/recommend.ts
const route = {
	path: "/index/recommend",
	categories: ["programming"],
	example: "/51cto/index/recommend",
	radar: [{ source: ["51cto.com/"] }],
	name: "推荐",
	maintainers: ["cnkmmk", "ovo-tim"],
	handler,
	url: "51cto.com/"
};
const pattern = /'(WTKkN|bOYDu|wyeCN)':\s*(\d+)/g;
async function getFullcontent(item, cookie = "") {
	const articleResponse = await rofetch(item.url, { headers: { cookie } });
	const $ = load(articleResponse);
	const fullContent = new URL(item.url).host === "ost.51cto.com" ? $(".posts-content").html() : $("article").html();
	if (!fullContent && cookie === "") try {
		const [v1, v2, v3] = articleResponse.match(pattern).slice(0, 3).map((str) => Number(str.split(":", 2)[1]));
		return await getFullcontent(item, "__tst_status=" + (v1 + v2 + v3) + "#;");
	} catch (error) {
		logger.error(error);
	}
	return {
		title: item.title,
		link: item.url,
		pubDate: parseDate(item.pubdate, 8),
		description: fullContent || item.abstract
	};
}
async function handler(ctx) {
	const url = "https://api-media.51cto.com";
	const requestPath = "index/index/recommend";
	const token = await getToken();
	const timestamp = Date.now();
	const params = {
		page: 1,
		page_size: ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 50,
		limit_time: 0,
		name_en: ""
	};
	const list = (await got_default(`${url}/${requestPath}`, { searchParams: {
		...params,
		timestamp,
		token,
		sign: sign(requestPath, params, timestamp, token)
	} })).data.data.data.list;
	return {
		title: "51CTO",
		link: "https://www.51cto.com/",
		description: "51cto - 推荐",
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.url, async () => await getFullcontent(item))))
	};
}
//#endregion
export { route };
