import { t as config } from "./config-B5Cf_tHS.mjs";
import "./types-DNj6Etbg.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { t as utils_default } from "./utils-D1P4OCUO.mjs";
//#region lib/routes/mastodon/tag.ts
const route = {
	path: "/tag/:site/:hashtag/:only_media?",
	categories: ["social-media"],
	view: 1,
	example: "/mastodon/tag/mastodon.social/gochisou/true",
	parameters: {
		site: "instance address, only domain, no `http://` or `https://` protocol header",
		hashtag: "Hashtag you want to subscribe to (without the # symbol)",
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
	name: "Hashtag timeline",
	maintainers: ["yuikisaito"],
	handler
};
async function handler(ctx) {
	const { site, hashtag } = ctx.req.param();
	const only_media = ctx.req.param("only_media") === "true" ? "true" : "false";
	if (!config.feature.allow_user_supply_unsafe_domain && !utils_default.allowSiteList.includes(site)) throw new ConfigNotFoundError(`This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
	const url = `http://${site}/api/v1/timelines/tag/${hashtag}?only_media=${only_media}`;
	const list = (await got_default.get(url, { headers: utils_default.apiHeaders(site) })).data;
	return {
		title: `#${hashtag} ${only_media === "true" ? " Media" : ""} Timeline on ${site}`,
		link: `https://${site}`,
		item: utils_default.parseStatuses(list)
	};
}
//#endregion
export { route };
