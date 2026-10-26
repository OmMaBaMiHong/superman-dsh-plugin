import { t as config } from "./config-B5Cf_tHS.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as renderDescription } from "./description-CXAcwMlS.mjs";
//#region lib/routes/jin10/index.ts
const route = {
	path: "/:important?",
	categories: ["finance"],
	view: 5,
	example: "/jin10",
	parameters: { important: "只看重要，任意值开启，留空关闭" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["jin10.com/"],
		target: ""
	}],
	name: "市场快讯",
	maintainers: ["laampui"],
	handler,
	url: "jin10.com/"
};
async function handler(ctx) {
	const { important = false } = ctx.req.param();
	const item = (await cache_default.tryGet("jin10:index", async () => {
		const { data: response } = await got_default("https://flash-api.jin10.com/get_flash_list", {
			headers: {
				"x-app-id": "bVBF4FyRTn5NJF5n",
				"x-version": "1.0.0"
			},
			searchParams: {
				channel: "-8200",
				vip: "1"
			}
		});
		return response.data.filter((item) => item.type !== 1);
	}, config.cache.routeExpire, false)).map((item) => {
		const titleMatch = item.data.content.match(/^【(.*?)】/);
		let title;
		let content = item.data.content;
		if (titleMatch) {
			title = titleMatch[1];
			content = content.replace(titleMatch[0], "");
		} else title = item.data.vip_title || item.data.content;
		return {
			title,
			description: renderDescription(content, item.data.pic),
			pubDate: timezone(parseDate(item.time), 8),
			link: item.data.link,
			guid: `jin10:index:${item.id}`,
			important: item.important
		};
	});
	return {
		title: "金十数据",
		link: "https://www.jin10.com/",
		item: important ? item.filter((item) => item.important) : item
	};
}
//#endregion
export { route };
