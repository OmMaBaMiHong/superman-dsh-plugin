import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
import { n as setCookies } from "./playwright-utils-S-7KcaVy.mjs";
import { load } from "cheerio";
//#region lib/routes/xsijishe/utils.ts
const playwrightGet = async (url, context, waitForSelector = ".t_f", options = {}) => {
	const page = await context.newPage();
	const expectResourceTypes = /* @__PURE__ */ new Set(["document", "script"]);
	try {
		if (options.userAgent) await page.setExtraHTTPHeaders({ "User-Agent": options.userAgent });
		if (options.cookie) await setCookies(page, options.cookie, "xsijishe.com");
		await page.route("**/*", (route) => {
			const request = route.request();
			expectResourceTypes.has(request.resourceType()) ? route.continue() : route.abort();
		});
		await page.goto(url, { waitUntil: "domcontentloaded" });
		let html = await page.evaluate(() => document.documentElement.innerHTML);
		if (html.includes("抱歉，您尚未登录，没有权限访问该版块")) return html;
		try {
			await page.waitForSelector(waitForSelector, { timeout: options.timeout ?? 1e4 });
		} catch {}
		html = await page.evaluate(() => document.documentElement.innerHTML);
		return html;
	} finally {
		await page.close();
	}
};
//#endregion
//#region lib/routes/xsijishe/rank.ts
const baseUrl = "https://xsijishe.com";
const route = {
	path: "/rank/:type",
	categories: ["bbs"],
	example: "/xsijishe/rank/weekly",
	parameters: { type: {
		description: "排行榜类型",
		options: [{
			value: "weekly",
			label: "周榜"
		}, {
			value: "monthly",
			label: "月榜"
		}]
	} },
	features: {
		requireConfig: [{
			name: "XSIJISHE_COOKIE",
			description: ""
		}, {
			name: "XSIJISHE_USER_AGENT",
			description: ""
		}],
		requirePuppeteer: true,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	name: "排行榜",
	maintainers: ["akynazh", "AiraNadih"],
	handler
};
async function handler(ctx) {
	const rankType = ctx.req.param("type");
	let title;
	let index;
	if (rankType === "weekly") {
		title = "司机社综合周排行榜";
		index = 0;
	} else if (rankType === "monthly") {
		title = "司机社综合月排行榜";
		index = 1;
	} else throw new InvalidParameterError("Invalid rank type");
	const context = await outPlaywright();
	const url = `${baseUrl}/portal.php`;
	try {
		const $ = load(await playwrightGet(url, context, ".nex_recon_lists", {
			cookie: config.xsijishe.cookie,
			userAgent: config.xsijishe.userAgent
		}));
		const items = $(".nex_recon_lists ul li").eq(index).find(".nex_recons_demens dl dd").toArray().map((item) => {
			item = $(item);
			const title = item.find("h5").text().trim();
			const link = item.find("a").attr("href");
			const description = item.find("img").prop("outerHTML") ?? "";
			if (!title || !link) return;
			return {
				title,
				link: new URL(link, `${baseUrl}/`).href,
				description
			};
		}).filter((item) => item !== void 0);
		return {
			title,
			link: url,
			description: title,
			item: items
		};
	} finally {
		await context.close();
	}
}
//#endregion
export { route };
