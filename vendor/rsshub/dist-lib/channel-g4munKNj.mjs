import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
//#region lib/routes/qingting/channel.ts
const route = {
	path: "/channel/:id",
	categories: ["multimedia"],
	example: "/qingting/channel/293411",
	parameters: { id: "专辑id, 可在专辑页 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "专辑",
	maintainers: ["nczitzk", "pseudoyu"],
	handler
};
async function handler(ctx) {
	let response = await rofetch(`https://i.qingting.fm/capi/v3/channel/${ctx.req.param("id")}`);
	const title = response.data.title;
	response = await rofetch(`https://i.qingting.fm/capi/channel/${ctx.req.param("id")}/programs/${response.data.v}?curpage=1&order=asc`);
	const items = response.data.programs.map((item) => ({
		title: item.title,
		link: `https://www.qingting.fm/channels/${ctx.req.param("id")}/programs/${item.id}/`,
		pubDate: timezone(parseDate(item.update_time), 8)
	}));
	return {
		title: `${title} - 蜻蜓FM`,
		link: `https://www.qingting.fm/channels/${ctx.req.param("id")}`,
		item: await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
			response = await rofetch(item.link);
			item.description = JSON.parse(response.match(/\},"program":(.*?),"plist":/)[1]).richtext;
			return item;
		})))
	};
}
//#endregion
export { route };
