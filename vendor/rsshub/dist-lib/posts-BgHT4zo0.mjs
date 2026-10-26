import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { a as resolveHandle, i as getProfile, o as renderPost, t as getAuthorFeed } from "./utils-CB-_tSbG.mjs";
import querystring from "node:querystring";
//#region lib/routes/bsky/posts.ts
const route = {
	path: "/profile/:handle/:routeParams?",
	categories: ["social-media"],
	view: 1,
	example: "/bsky/profile/bsky.app",
	parameters: {
		handle: "User handle, can be found in URL",
		routeParams: "Filter parameter, Use filter to customize content types"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["bsky.app/profile/:handle"] }],
	name: "Post",
	maintainers: ["TonyRL"],
	handler,
	description: `| Filter Value                | Description                                          |
| --------------------------- | ---------------------------------------------------- |
| posts\\_with\\_replies        | Includes Posts, Replies, and Reposts                 |
| posts\\_no\\_replies          | Includes Posts and Reposts, without Replies          |
| posts\\_with\\_media          | Shows only Posts containing media                    |
| posts\\_and\\_author\\_threads | Shows Posts and Threads, without Replies and Reposts |

Default value for filter is \`posts_and_author_threads\` if not specified.

Example:

- \`/bsky/profile/bsky.app/filter=posts_with_replies\``
};
async function handler(ctx) {
	const handle = ctx.req.param("handle");
	const filter = querystring.parse(ctx.req.param("routeParams")).filter || "posts_and_author_threads";
	const DID = await resolveHandle(handle);
	const profile = await getProfile(DID);
	const authorFeed = await getAuthorFeed(DID, filter);
	const items = authorFeed.feed.map(({ post }) => ({
		title: post.record.text.split("\n", 1)[0],
		description: renderPost({
			text: post.record.text.replaceAll("\n", "<br>"),
			embed: post.embed
		}),
		author: post.author.displayName,
		pubDate: parseDate(post.record.createdAt),
		link: `https://bsky.app/profile/${post.author.handle}/post/${post.uri.split("app.bsky.feed.post/", 2)[1]}`,
		upvotes: post.likeCount,
		comments: post.replyCount
	}));
	ctx.set("json", {
		DID,
		profile,
		authorFeed
	});
	return {
		title: `${profile.displayName} (@${profile.handle}) — Bluesky`,
		description: profile.description?.replaceAll("\n", " "),
		link: `https://bsky.app/profile/${profile.handle}`,
		image: profile.avatar,
		icon: profile.avatar,
		logo: profile.avatar,
		item: items,
		allowEmpty: true
	};
}
//#endregion
export { route };
