import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
//#region lib/routes/github/notifications.ts
const apiUrl = "https://api.github.com";
const route = {
	path: "/notifications",
	categories: ["programming"],
	example: "/github/notifications",
	features: { requireConfig: [{
		name: "GITHUB_ACCESS_TOKEN",
		description: ""
	}] },
	radar: [{ source: ["github.com/notifications"] }],
	name: "Notifications",
	maintainers: ["zhzy0077"],
	handler,
	url: "github.com/notifications"
};
async function handler(ctx) {
	if (!config.github || !config.github.access_token) throw new ConfigNotFoundError("GitHub notification RSS is disabled due to the lack of <a href=\"https://docs.rsshub.app/deploy/config#route-specific-configurations\">relevant config</a>");
	const headers = {
		Accept: "application/vnd.github.v3+json",
		Authorization: `Bearer ${config.github.access_token}`,
		"X-GitHub-Api-Version": "2022-11-28"
	};
	const response = await rofetch.raw(`${apiUrl}/notifications`, { headers });
	const notifications = response._data;
	const items = notifications.map((item) => {
		let originUrl = item.subject.url ? item.subject.url.replace("https://api.github.com/repos/", "https://github.com/") : "https://github.com/notifications";
		if (originUrl.includes("/releases/")) originUrl = originUrl.replace(/\/releases\/\d+$/, "/releases");
		else if (originUrl.includes("/pulls/")) originUrl = originUrl.replace(/\/pulls\/(\d+)$/, "/pull/$1");
		return {
			title: item.subject.title,
			description: item.subject.title,
			pubDate: parseDate(item.updated_at),
			guid: item.id,
			link: originUrl
		};
	});
	ctx.set("json", {
		title: "Github Notifications",
		item: notifications,
		rateLimit: {
			limit: Number.parseInt(response.headers["x-ratelimit-limit"]),
			remaining: Number.parseInt(response.headers["x-ratelimit-remaining"]),
			reset: parseDate(Number.parseInt(response.headers["x-ratelimit-reset"]), "X"),
			resoure: response.headers["x-ratelimit-resource"],
			used: Number.parseInt(response.headers["x-ratelimit-used"])
		}
	});
	return {
		title: "Github Notifications",
		link: "https://github.com/notifications",
		item: items,
		allowEmpty: true
	};
}
//#endregion
export { route };
