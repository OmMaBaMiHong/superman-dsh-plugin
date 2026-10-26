import { t as config } from "./config-B5Cf_tHS.mjs";
import "./types-DNj6Etbg.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { t as utils_default } from "./utils-BvF-NCI9.mjs";
//#region lib/routes/misskey/featured-notes.ts
const route = {
	path: "/notes/featured/:site",
	categories: ["social-media"],
	view: 1,
	example: "/misskey/notes/featured/misskey.io",
	parameters: { site: "instance address, domain only, without `http://` or `https://` protocol header" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Featured Notes",
	maintainers: ["Misaka13514"],
	handler
};
async function handler(ctx) {
	const site = ctx.req.param("site");
	if (!config.feature.allow_user_supply_unsafe_domain && !utils_default.allowSiteList.includes(site)) throw new ConfigNotFoundError(`This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
	const list = (await got_default({
		method: "post",
		url: `https://${site}/api/notes/featured`,
		json: {
			limit: 10,
			offset: 0
		}
	})).data;
	return {
		title: `Featured Notes on ${site}`,
		link: `https://${site}/explore`,
		item: utils_default.parseNotes(list, site)
	};
}
//#endregion
export { route };
