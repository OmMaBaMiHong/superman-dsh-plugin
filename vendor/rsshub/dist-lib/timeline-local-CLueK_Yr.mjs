import { t as config } from "./config-B5Cf_tHS.mjs";
import "./types-DNj6Etbg.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { t as utils_default } from "./utils-D1P4OCUO.mjs";
//#region lib/routes/mastodon/timeline-local.ts
const route = {
	path: "/timeline/:site/:only_media?",
	categories: ["social-media"],
	view: 1,
	example: "/mastodon/timeline/pawoo.net/true",
	parameters: {
		site: "instance address, only domain, no `http://` or `https://` protocol header",
		only_media: {
			description: "whether only display media content, default to false, any value to true",
			options: [{
				value: "true",
				label: "true"
			}, {
				value: "false",
				label: "false"
			}],
			default: "false"
		}
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Instance timeline (local)",
	maintainers: ["hoilc"],
	handler,
	description: "If the instance address is not `mastodon.social` or `pawoo.net`, then the route requires `ALLOW_USER_SUPPLY_UNSAFE_DOMAIN` to be `true`."
};
async function handler(ctx) {
	const site = ctx.req.param("site");
	const only_media = ctx.req.param("only_media") === "true" ? "true" : "false";
	if (!config.feature.allow_user_supply_unsafe_domain && !utils_default.allowSiteList.includes(site)) throw new ConfigNotFoundError(`This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
	const url = `http://${site}/api/v1/timelines/public?local=true&only_media=${only_media}`;
	const list = (await got_default.get(url, { headers: utils_default.apiHeaders(site) })).data;
	return {
		title: `Local Public${ctx.req.param("only_media") === "true" ? " Media" : ""} Timeline on ${site}`,
		link: `https://${site}`,
		item: utils_default.parseStatuses(list)
	};
}
//#endregion
export { route };
