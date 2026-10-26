import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { i as queryToInteger, t as fallback } from "./readable-social-DP5kGwF5.mjs";
import { t as utils_default } from "./utils-sP4d4gR6.mjs";
//#region lib/routes/tumblr/posts.ts
const route = {
	path: "/posts/:blog",
	categories: ["blog"],
	example: "/tumblr/posts/biketouring-nearby",
	parameters: { blog: "Blog identifier (see `https://www.tumblr.com/docs/en/api/v2#blog-identifiers`)" },
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
	name: "Posts",
	maintainers: ["Rakambda", "PolarisStarnor"],
	description: `::: tip
Tumblr provides official RSS feeds for non "dashboard only" blogs, for instance [https://biketouring-nearby.tumblr.com](https://biketouring-nearby.tumblr.com/rss).
:::`,
	handler
};
async function handler(ctx) {
	if (!config.tumblr || !config.tumblr.clientId) throw new ConfigNotFoundError("Tumblr RSS is disabled due to the lack of <a href=\"https://docs.rsshub.app/deploy/config#route-specific-configurations\">relevant config</a>");
	const blogIdentifier = ctx.req.param("blog");
	const limit = fallback(void 0, queryToInteger(ctx.req.query("limit")), 20);
	const response = await got_default.get(`https://api.tumblr.com/v2/blog/${blogIdentifier}/posts`, {
		searchParams: {
			api_key: utils_default.generateAuthParams(),
			limit
		},
		headers: await utils_default.generateAuthHeaders()
	});
	const blog = response.data.response.blog;
	const posts = response.data.response.posts.map((post) => utils_default.processPost(post));
	return {
		title: `Tumblr - ${blogIdentifier} - Posts`,
		author: blog?.name,
		link: blog?.url ?? `https://${blogIdentifier}/`,
		item: posts,
		allowEmpty: true,
		image: blog?.avatar?.slice(-1)?.url,
		description: blog?.description
	};
}
//#endregion
export { route };
