import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/meta/ai-blog.ts
const route = {
	path: "/ai/blog",
	categories: ["programming"],
	example: "/meta/ai/blog",
	name: "AI Blog",
	maintainers: ["TonyRL"],
	url: "ai.meta.com/blog/",
	radar: [{ source: ["ai.meta.com/blog/", "ai.meta.com"] }],
	handler
};
async function handler(ctx) {
	const limit = Number(ctx.req.query("limit") || 12);
	const link = "https://ai.meta.com/blog/";
	const $ = load(await rofetch(link, { headers: {
		"sec-fetch-dest": "document",
		"sec-fetch-mode": "navigate",
		"sec-fetch-site": "none",
		"sec-fetch-user": "?1"
	} }));
	const script = $("script:contains(\"DTSGInitialData\"):first").text();
	const serverJs = JSON.parse(script.match(/\(new ServerJS\(\)\)\.handle\((\{[\s\S]*?\})\);/)?.[1] || "{}");
	const server = {
		LSD: { token: "" },
		SiteData: {
			haste_session: "",
			hsi: "",
			__spin_r: 0,
			__spin_b: "trunk",
			__spin_t: Date.now()
		}
	};
	for (const obj of serverJs.define) {
		const key = obj[0];
		server[key] = obj[2];
	}
	const spinT = String(server.SiteData.__spin_t || Date.now());
	const items = (await rofetch("https://ai.meta.com/api/graphql/", {
		method: "POST",
		headers: {
			"content-type": "application/x-www-form-urlencoded",
			"sec-fetch-dest": "empty",
			"sec-fetch-mode": "cors",
			"sec-fetch-site": "same-origin",
			"x-asbd-id": "359341",
			"x-fb-friendly-name": "MetaAIBlogRecentPostSearchQuery",
			"x-fb-lsd": server.LSD.token
		},
		body: new URLSearchParams({
			av: "0",
			__user: "0",
			__a: "1",
			__req: "1",
			dpr: "1",
			__ccg: "EXCELLENT",
			__rev: String(server.SiteData.__spin_r || ""),
			lsd: server.LSD.token,
			__spin_r: String(server.SiteData.__spin_r || ""),
			__spin_b: String(server.SiteData.__spin_b || "trunk"),
			__spin_t: spinT,
			fb_api_caller_class: "RelayModern",
			fb_api_req_friendly_name: "MetaAIBlogRecentPostSearchQuery",
			variables: JSON.stringify({ input: {
				query: "",
				from: 0,
				limit,
				tags: [],
				excludeObjectIDs: ["27568536916124137"]
			} }),
			server_timestamps: "true",
			doc_id: "9516719638450392"
		}),
		parseResponse: JSON.parse
	})).data.query.map((item) => ({
		title: item.title,
		description: item.description,
		link: item.href,
		pubDate: parseDate(item.date),
		category: [item.research_area],
		image: item.image
	}));
	return {
		title: $("#pageTitle").text(),
		description: $("meta[name=\"description\"]").attr("content"),
		image: $("link[rel=\"icon\"]").attr("href"),
		link,
		item: items
	};
}
//#endregion
export { route };
