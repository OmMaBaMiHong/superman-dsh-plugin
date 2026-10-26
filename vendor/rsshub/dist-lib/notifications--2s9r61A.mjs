import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as getConfig } from "./utils-BYk8-Fk-.mjs";
//#region lib/routes/discourse/notifications.ts
const route = {
	path: "/:configId/notifications/:fulltext?",
	categories: ["bbs"],
	example: "/discourse/0/notifications",
	parameters: {
		configId: "Environment variable configuration id, see above",
		fulltext: "Fetch the content if the notification points to a post. This is disabled by default, set it to `1` to enable it."
	},
	features: {
		requireConfig: [{
			name: "DISCOURSE_CONFIG_*",
			description: ""
		}],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Notifications",
	maintainers: [],
	handler,
	description: `::: warning
If you opt to enable \`fulltext\` feature, consider adding \`limit\` parameter to your query to avoid sending too many request.
:::`
};
async function handler(ctx) {
	const { link, key } = getConfig(ctx);
	let items = (await rofetch(`${link}/notifications.json`, { headers: { "User-Api-Key": key } })).notifications.slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 10).map((e) => ({
		title: e.fancy_title ?? e.data.badge_name,
		link: `${link}/${Object.hasOwn(e.data, "badge_id") ? `badges/${e.data.badge_id}/${e.data.badge_slug}?username=${e.data.username}` : `t/topic/${e.topic_id}/${e.post_number}`}`,
		pubDate: new Date(e.created_at),
		author: e.data.display_username ?? e.data.username,
		category: [
			`notification_type:${e.notification_type}`,
			`read:${e.read}`,
			`high_priority:${e.high_priority}`
		],
		original_post_id: e.data.original_post_id
	}));
	if (ctx.req.param("fulltext") === "1") items = await Promise.all(items.map((e) => {
		if (e.original_post_id) {
			const post_link = `${link}/posts/${e.original_post_id}.json`;
			return cache_default.tryGet(post_link, async () => {
				const { cooked } = await rofetch(post_link, { headers: { "User-Api-Key": key } });
				return {
					...e,
					description: cooked
				};
			});
		}
		return e;
	}));
	const { about } = await cache_default.tryGet(link, async () => await rofetch(`${link}/about.json`, { headers: { "User-Api-Key": key } }), config.cache.routeExpire, false);
	return {
		title: `${about.title} - Notifications`,
		description: about.description,
		item: items,
		allowEmpty: true
	};
}
//#endregion
export { route };
