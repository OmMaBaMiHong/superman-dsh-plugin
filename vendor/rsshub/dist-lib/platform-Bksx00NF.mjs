import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/bilibili/platform.ts
const route = {
	path: "/platform/:area?/:p_type?/:uid?",
	categories: ["social-media"],
	example: "/bilibili/platform/-1",
	parameters: {
		area: "省市-国标码,默认为-1即全国",
		p_type: "类型：见下表，默认为全部类型",
		uid: "用户id，可以不填，不过不填不设置cookie，搜索结果与登入账号后搜索结果不一样。可以在url中找到，需要配置cookie值，只需要SESSDATA的值即可"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["show.bilibili.com/platform"] }],
	name: "会员购票务",
	maintainers: ["nightmare-mio"],
	handler,
	url: "show.bilibili.com/platform",
	description: `| 类型     |
| -------- |
| 演出     |
| 展览     |
| 本地生活 |`
};
async function handler(ctx) {
	const { area = -1, type = "全部类型", uid } = ctx.req.param();
	const cookie = config.bilibili.cookies[uid];
	const link = "https://show.bilibili.com/api/ticket/project/listV2";
	const headers = {
		Referer: "https://space.bilibili.com",
		Cookie: cookie ? `SESSDATA=${cookie}` : void 0
	};
	const { data: response } = await got_default({
		method: "get",
		url: `${link}?version=134&page=1&pagesize=16&area=${area}&filter=&platform=web&p_type=${type}`,
		headers
	});
	const items = response.data.result.map((item) => {
		const bodyHtml = `<img src="${item.cover}"></img>`;
		const coordinate = `<div>活动地点: ${item.city} ${item.venue_name}</div>`;
		const liveTime = `<div>活动时间: ${item.tlabel}</div>`;
		const staff = `<div>参展览嘉宾: ${item.staff}</div>`;
		const countdown = `<div>结束日期: ${item.countdown}</div>`;
		const price = `<div>最低价: ${item.price_low / 100} ; 最高价: ${item.price_high / 100}</div>`;
		return {
			title: item.project_name,
			link: item.url,
			description: bodyHtml + coordinate + liveTime + staff + countdown + price,
			pubDate: parseDate(item.sale_start_time * 1e3)
		};
	});
	return {
		title: `bilibili会员购票务-${area}`,
		link,
		item: items
	};
}
//#endregion
export { route };
