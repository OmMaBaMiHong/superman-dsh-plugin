import { t as config } from "./config-B5Cf_tHS.mjs";
import "./types-DNj6Etbg.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { t as utils_default } from "./utils-D1P4OCUO.mjs";
//#region lib/routes/mastodon/account-id.ts
const route = {
	path: "/account_id/:site/:account_id/statuses/:only_media?",
	categories: ["social-media"],
	view: 1,
	example: "/mastodon/account_id/mas.to/109300507275095341/statuses/false",
	parameters: {
		site: "instance address, only domain, no `http://` or `https://` protocol header",
		account_id: "account ID, you can get it from `https://INSTANCE/api/v1/accounts/lookup?acct=USERNAME` api",
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
	name: "User timeline (by account ID)",
	maintainers: ["notofoe", "pseudoyu"],
	handler
};
async function handler(ctx) {
	const site = ctx.req.param("site");
	const account_id = ctx.req.param("account_id");
	const only_media = ctx.req.param("only_media") === "true" ? "true" : "false";
	if (!config.feature.allow_user_supply_unsafe_domain && !utils_default.allowSiteList.includes(site)) throw new ConfigNotFoundError(`This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
	const { account_data, data } = await utils_default.getAccountStatuses(site, account_id, only_media);
	return {
		title: `${account_data.display_name} (@${account_data.acct})`,
		link: account_data.url,
		description: account_data.note,
		item: utils_default.parseStatuses(data),
		allowEmpty: true
	};
}
//#endregion
export { route };
