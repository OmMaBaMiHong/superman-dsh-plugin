import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { n as queryToBoolean } from "./readable-social-DP5kGwF5.mjs";
import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
import { t as renderUserEmbed } from "./user-C1ehbvl0.mjs";
import { load } from "cheerio";
//#region lib/routes/tiktok/user.ts
const baseUrl = "https://www.tiktok.com";
const route = {
	path: "/user/:user/:iframe?",
	categories: ["social-media"],
	example: "/tiktok/user/@linustech/true",
	parameters: {
		user: "User ID, including @",
		iframe: "Use the official iframe to embed the video, which allows you to view the video if the default option does not work. Default to `false`"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: true,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.tiktok.com/:user"],
		target: "/user/:user"
	}],
	name: "User",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const { user, iframe } = ctx.req.param();
	const useIframe = queryToBoolean(iframe);
	const { itemList, userDetail } = await cache_default.tryGet(`tiktok:user:${user}`, async () => {
		const context = await outPlaywright();
		const page = await context.newPage();
		let itemList = { itemList: [] };
		await page.route("**/*", (route) => {
			const request = route.request();
			[
				"document",
				"script",
				"xhr",
				"fetch"
			].includes(request.resourceType()) ? route.continue() : route.abort();
		});
		page.on("response", async (response) => {
			if (response.request().url().startsWith("https://www.tiktok.com/api/post/item_list/")) itemList = await response.json();
		});
		await page.goto(`${baseUrl}/${user}`, { waitUntil: "networkidle" });
		const pageHtml = await page.content();
		await context.close();
		const $ = load(pageHtml);
		const userDetail = JSON.parse($("script#__UNIVERSAL_DATA_FOR_REHYDRATION__").text()).__DEFAULT_SCOPE__["webapp.user-detail"];
		return {
			itemList,
			userDetail
		};
	}, config.cache.routeExpire, false);
	const items = itemList.itemList.map((item) => ({
		title: item.desc,
		description: renderUserEmbed({
			poster: item.video.cover,
			source: item.video.playAddr,
			useIframe,
			id: item.id
		}),
		author: item.author.nickname,
		pubDate: parseDate(item.createTime, "X"),
		link: `${baseUrl}/@${item.author.uniqueId}/video/${item.id}`
	}));
	return {
		title: userDetail.shareMeta.title,
		description: userDetail.shareMeta.desc,
		image: userDetail.userInfo.user.avatarLarger,
		link: `${baseUrl}/${user}`,
		item: items
	};
}
//#endregion
export { route };
