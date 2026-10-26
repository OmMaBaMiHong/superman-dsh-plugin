import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
import pMap from "p-map";
//#region lib/routes/dcard/utils.ts
const ProcessFeed = async (items, cookies, context, limit, cache) => {
	let newCookies = [];
	const result = await pMap(items.slice(0, limit), async (i) => {
		const url = `https://www.dcard.tw/service/api/v2/posts/${i.id}`;
		i.description = await cache.tryGet(`dcard:${i.id}`, async () => {
			try {
				const page = await context.newPage();
				await page.route("**/*", (route) => {
					const request = route.request();
					request.resourceType() === "document" || request.resourceType() === "script" || request.resourceType() === "fetch" || request.resourceType() === "xhr" ? route.continue() : route.abort();
				});
				await page.setExtraHTTPHeaders({ referer: `https://www.dcard.tw/f/${i.forumAlias}/p/${i.id}` });
				await page.context().addCookies(cookies);
				await page.goto(url);
				await page.waitForSelector("body > pre");
				const response = await page.evaluate(() => document.querySelector("body > pre").textContent);
				newCookies = await page.context().cookies();
				await page.close();
				let body = JSON.parse(response).content;
				body = body.replaceAll(/(?=https?:\/\/).*?(?<=\.(jpe?g|gif|png))/gi, (m) => `<img src="${m}">`);
				body = body.replaceAll(/(?=https?:\/\/).+(?<!jpe?g"?>?)$/gim, (m) => `<a href="${m}">${m}</a>`);
				body = body.replaceAll("\n", "<br>");
				return body;
			} catch {
				return "";
			}
		});
		return i;
	}, { concurrency: 3 });
	await cache.set("dcard:cookies", newCookies, 3600);
	return [...result, ...items.slice(limit)];
};
var utils_default = { ProcessFeed };
//#endregion
//#region lib/routes/dcard/section.ts
const route = {
	path: "/:section/:type?",
	categories: ["bbs"],
	example: "/dcard/funny/popular",
	parameters: {
		section: "板塊名稱，URL 中獲得",
		type: "排序，popular 熱門；latest 最新，默認為 latest"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: true,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "板塊帖子",
	maintainers: ["HenryQW"],
	handler
};
async function handler(ctx) {
	const { type = "latest", section = "posts" } = ctx.req.param();
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 30;
	const context = await outPlaywright();
	let link = "https://www.dcard.tw/f";
	let api = "https://www.dcard.tw/service/api/v2";
	let title = "Dcard - ";
	if (section !== "posts" && section !== "popular" && section !== "latest") {
		link += `/${section}`;
		api += `/forums/${section}`;
		title += `${section} - `;
	}
	api += "/posts";
	if (type === "popular") {
		link += "?latest=false";
		api += "?popular=true";
		title += "熱門";
	} else {
		link += "?latest=true";
		api += "?popular=false";
		title += "最新";
	}
	const page = await context.newPage();
	await page.route("**/*", (route) => {
		const request = route.request();
		request.resourceType() === "document" || request.resourceType() === "script" ? route.continue() : route.abort();
	});
	await page.setExtraHTTPHeaders({ referer: `https://www.dcard.tw/f/${section}` });
	await page.goto(`${api}&limit=100`);
	await page.waitForSelector("body > pre");
	const response = await page.evaluate(() => document.querySelector("body > pre").textContent);
	const cookies = await cache_default.tryGet("dcard:cookies", () => page.context().cookies(), 3600, false);
	await page.close();
	const items = JSON.parse(response).map((item) => ({
		title: `「${item.forumName}」${item.title}`,
		link: `https://www.dcard.tw/f/${item.forumAlias}/p/${item.id}`,
		description: item.excerpt,
		author: `${item.school || "匿名"}．${item.gender === "M" ? "男" : "女"}`,
		pubDate: parseDate(item.createdAt),
		category: [item.forumName, ...item.topics],
		forumAlias: item.forumAlias,
		id: item.id
	}));
	const result = await utils_default.ProcessFeed(items, cookies, context, limit, cache_default);
	await context.close();
	return {
		title,
		link,
		description: "不想錯過任何有趣的話題嗎？趕快加入我們吧！",
		item: result
	};
}
//#endregion
export { route };
