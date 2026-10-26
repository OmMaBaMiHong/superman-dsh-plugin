import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import * as cheerio from "cheerio";
//#region lib/routes/thepaper/user.ts
const route = {
	path: "/user/:pphId",
	categories: ["new-media"],
	example: "/thepaper/user/4221423",
	parameters: { pphId: "澎湃号 id，可在澎湃号页 URL 中找到" },
	name: "澎湃号",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const { pphId } = ctx.req.param();
	const mobileBuildId = await cache_default.tryGet("thepaper:m:buildId", async () => {
		const response = await rofetch("https://m.thepaper.cn");
		const $ = cheerio.load(response);
		return JSON.parse($("script#__NEXT_DATA__").text()).buildId;
	});
	const userInfo = await cache_default.tryGet(`thepaper:user:${pphId}`, async () => {
		return (await rofetch(`https://api.thepaper.cn/userservice/user/homePage/${pphId}`, { headers: {
			"Client-Type": "2",
			Origin: "https://m.thepaper.cn",
			Referer: "https://m.thepaper.cn/"
		} })).userInfo;
	});
	const list = (await rofetch("https://api.thepaper.cn/contentapi/cont/pph/user", {
		method: "POST",
		body: {
			pageSize: 10,
			pageNum: 1,
			contType: 0,
			excludeContIds: [],
			pphId,
			startTime: 0
		}
	})).data.list.map((item) => ({
		title: item.name,
		link: `https://www.thepaper.cn/newsDetail_forward_${item.contId}`,
		pubDate: parseDate(item.pubTimeLong),
		author: item.authorInfo.sname,
		contId: item.contId,
		image: item.pic
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const response = await rofetch(`https://m.thepaper.cn/_next/data/${mobileBuildId}/detail/${item.contId}.json`, { query: { id: item.contId } });
		item.description = response.pageProps.detailData.contentDetail.content;
		item.updated = parseDate(response.pageProps.detailData.contentDetail.updateTime);
		return item;
	})));
	return {
		title: userInfo.sname,
		description: userInfo.perDesc,
		link: `https://www.thepaper.cn/user_${pphId}`,
		item: items,
		itunes_author: userInfo.sname,
		image: userInfo.pic
	};
}
//#endregion
export { route };
