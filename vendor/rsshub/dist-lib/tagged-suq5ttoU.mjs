import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { i as queryToInteger, t as fallback } from "./readable-social-DP5kGwF5.mjs";
import { t as utils_default } from "./utils-sP4d4gR6.mjs";
//#region lib/routes/tumblr/tagged.ts
const route = {
	path: "/tagged/:tag",
	categories: ["social-media"],
	example: "/tumblr/tagged/nature",
	parameters: { tag: "Tag name (see `https://www.tumblr.com/docs/en/api/v2#tagged--get-posts-with-tag`)" },
	radar: [],
	features: {
		requireConfig: [
			{
				name: "TUMBLR_CLIENT_ID",
				description: "Please see above for details."
			},
			{
				name: "TUMBLR_CLIENT_SECRET",
				description: "Please see above for details."
			},
			{
				name: "TUMBLR_REFRESH_TOKEN",
				description: "Please see above for details."
			}
		],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Tagged Posts",
	maintainers: ["PolarisStarnor"],
	handler
};
async function handler(ctx) {
	if (!config.tumblr || !config.tumblr.clientId) throw new ConfigNotFoundError("Tumblr RSS is disabled due to the lack of <a href=\"https://docs.rsshub.app/deploy/config#route-specific-configurations\">relevant config</a>");
	const tag = ctx.req.param("tag");
	const limit = fallback(void 0, queryToInteger(ctx.req.query("limit")), 20);
	const posts = (await got_default.get("https://api.tumblr.com/v2/tagged", {
		searchParams: {
			tag,
			api_key: utils_default.generateAuthParams(),
			limit
		},
		headers: await utils_default.generateAuthHeaders()
	})).data.response.map((post) => utils_default.processPost(post));
	return {
		title: `Tumblr - ${tag}`,
		description: `Tumblr posts tagged #${tag}`,
		link: `https://tumblr.com/tagged/${tag}`,
		item: posts,
		allowEmpty: true
	};
}
//#endregion
export { route };
