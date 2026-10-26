import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/ecnu/contest.tsx
const route = {
	path: "/acm/contest/:category?",
	categories: ["university"],
	example: "/ecnu/acm/contest/public",
	parameters: { category: "category is optional, default is all, use `public` for public only contests" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["acm.ecnu.edu.cn/contest/", "acm.ecnu.edu.cn/"],
		target: "/acm/contest/"
	}],
	name: "ACM Online-Judge contests list",
	maintainers: ["a180285"],
	handler,
	url: "acm.ecnu.edu.cn/contest/"
};
async function handler(ctx) {
	const publicOnly = (ctx.req.param("category") ?? "") === "public";
	const rootUrl = "https://acm.ecnu.edu.cn";
	const currentUrl = `${rootUrl}/contest/`;
	const $ = load((await got_default(currentUrl)).data);
	const items = $("div > div > table > tbody > tr").filter((_, el) => !publicOnly || $(el).find("i").attr("class").includes("green")).toArray().map((el) => {
		const $tdList = $(el).find("td");
		const title = $tdList.eq(0).text();
		const startTime = $tdList.eq(1).text();
		const duration = $tdList.eq(2).text();
		const link = rootUrl + $tdList.find("a").eq(0).attr("href");
		return {
			title,
			description: renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsx("p", { children: `Title: ${title}` }),
				/* @__PURE__ */ jsx("p", { children: `Time: ${startTime} (China time)` }),
				/* @__PURE__ */ jsx("p", { children: `Duration: ${duration}` })
			] })),
			link
		};
	});
	return {
		title: `ECNU ACM ${publicOnly ? "公开" : ""}比赛`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
