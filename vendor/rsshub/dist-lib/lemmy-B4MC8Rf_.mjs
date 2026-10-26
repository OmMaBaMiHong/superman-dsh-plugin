import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import markdownit from "markdown-it";
//#region lib/routes/lemmy/index.ts
const md = markdownit({ html: true });
const route = {
	path: "/:community/:sort?",
	categories: ["social-media"],
	example: "/lemmy/technology@lemmy.world/Hot",
	parameters: {
		community: "Lemmmy community, for example technology@lemmy.world",
		sort: {
			description: "Sort by",
			options: [
				{
					value: "Active",
					label: "Active"
				},
				{
					value: "Hot",
					label: "Hot"
				},
				{
					value: "New",
					label: "New"
				},
				{
					value: "Old",
					label: "Old"
				},
				{
					value: "TopDay",
					label: "TopDay"
				},
				{
					value: "TopWeek",
					label: "TopWeek"
				},
				{
					value: "TopMonth",
					label: "TopMonth"
				},
				{
					value: "TopYear",
					label: "TopYear"
				},
				{
					value: "TopAll",
					label: "TopAll"
				},
				{
					value: "MostComments",
					label: "MostComments"
				},
				{
					value: "NewComments",
					label: "NewComments"
				},
				{
					value: "TopHour",
					label: "TopHour"
				},
				{
					value: "TopSixHour",
					label: "TopSixHour"
				},
				{
					value: "TopTwelveHour",
					label: "TopTwelveHour"
				},
				{
					value: "TopThreeMonths",
					label: "TopThreeMonths"
				},
				{
					value: "TopSixMonths",
					label: "TopSixMonths"
				},
				{
					value: "TopNineMonths",
					label: "TopNineMonths"
				},
				{
					value: "Controversial",
					label: "Controversial"
				},
				{
					value: "Scaled",
					label: "Scaled"
				}
			],
			default: "Active"
		}
	},
	features: {
		requireConfig: [{
			name: "ALLOW_USER_SUPPLY_UNSAFE_DOMAIN",
			description: ""
		}],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Community",
	maintainers: ["wb14123", "pseudoyu"],
	handler
};
async function handler(ctx) {
	const sort = ctx.req.param("sort") ?? "Active";
	const community = ctx.req.param("community");
	if (community.split("@").length !== 2) throw new InvalidParameterError(`Invalid community: ${community}`);
	const instance = community.split("@", 2)[1];
	if (!config.feature.allow_user_supply_unsafe_domain && ![
		"lemmy.world",
		"lemm.ee",
		"lemmy.ml",
		"sh.itjust.works",
		"feddit.de",
		"hexbear.net",
		"beehaw.org",
		"lemmynsfw.com",
		"lemmy.ca",
		"programming.dev"
	].includes(new URL(`http://${instance}/`).hostname)) throw new ConfigNotFoundError(`This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
	const communityUrl = `https://${instance}/api/v3/community?name=${community}`;
	const communityData = await cache_default.tryGet(communityUrl, async () => {
		return (await got_default({
			method: "get",
			url: communityUrl,
			headers: { "Content-Type": "application/json" }
		})).data.community_view.community;
	});
	const postUrl = `https://${instance}/api/v3/post/list?type_=All&sort=${sort}&community_name=${community}&limit=50`;
	const items = (await cache_default.tryGet(postUrl, async () => {
		return (await got_default({
			method: "get",
			url: postUrl,
			headers: { "Content-Type": "application/json" }
		})).data;
	}, config.cache.routeExpire, false)).posts.map((e) => {
		const post = e.post;
		const creator = e.creator;
		const counts = e.counts;
		const item = {
			title: post.name,
			author: creator.name,
			pubDate: parseDate(post.published),
			link: post.ap_id,
			description: "",
			comments: 0,
			upvotes: 0,
			downvotes: 0
		};
		const url = post.url;
		item.description = (url ? `<p><a href="${url}">${url}</a></p>` : "") + (post.body ? md.render(post.body) : "");
		item.comments = counts.comments;
		item.upvotes = counts.upvotes;
		item.downvotes = counts.downvotes;
		return item;
	});
	return {
		title: `${community} - ${sort} posts`,
		description: communityData.description,
		link: communityData.actor_id,
		item: items
	};
}
//#endregion
export { route };
