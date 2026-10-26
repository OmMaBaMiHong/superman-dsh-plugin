import "./types-DNj6Etbg.mjs";
import { t as utils_default } from "./utils-D1P4OCUO.mjs";
//#region lib/routes/mastodon/acct.ts
const route = {
	path: "/acct/:acct/statuses/:only_media?",
	categories: ["social-media"],
	view: 1,
	example: "/mastodon/acct/Mastodon@mastodon.social/statuses",
	parameters: {
		acct: "Webfinger account URI, like `user@host`",
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
	name: "User timeline",
	maintainers: ["notofoe"],
	handler,
	description: `Started from Mastodon v4.0.0, the use of the \`search\` API in the route no longer requires a user token.
If the domain of your Webfinger account URI is the same as the API host of the instance (i.e., no delegation called in some other protocols), then no configuration is required and the route is available out of the box.
However, you can still specify these route-specific configurations if you need to override them.`
};
async function handler(ctx) {
	const acct = ctx.req.param("acct");
	const only_media = ctx.req.param("only_media") === "true" ? "true" : "false";
	const { site, account_id } = await utils_default.getAccountIdByAcct(acct);
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
