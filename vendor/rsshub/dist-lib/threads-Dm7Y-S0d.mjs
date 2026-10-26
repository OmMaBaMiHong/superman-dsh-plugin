import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as NotFoundError } from "./not-found-BvVU2U31.mjs";
import dayjs from "dayjs";
import { load } from "cheerio";
import { JSDOM } from "jsdom";
import { JSONPath } from "jsonpath-plus";
//#region lib/routes/threads/utils.ts
const profileUrl = (user) => `https://www.threads.com/@${user}`;
const threadUrl = (code) => `https://www.threads.com/t/${code}`;
const USER_AGENT = "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1";
const extractTokens = async (user) => {
	const lsd = load(await rofetch(profileUrl(user), { headers: {
		"User-Agent": USER_AGENT,
		Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
		"Accept-Encoding": "gzip, br",
		"Accept-Language": "zh-CN,zh;q=0.9",
		"Cache-Control": "no-cache",
		Pragma: "no-cache",
		"Sec-Fetch-Dest": "document",
		"Sec-Fetch-Mode": "navigate",
		"Sec-Fetch-Site": "none",
		"Sec-Fetch-User": "?1",
		"Upgrade-Insecure-Requests": "1"
	} }))("script:contains(\"LSD\"):first").text().match(/"LSD",\[\],\{"token":"([\w@-]+)"\},/)?.[1];
	if (!lsd) throw new NotFoundError("LSD token not found");
	return { lsd };
};
const getUserId = async (user) => {
	const result = await cache_default.tryGet(`threads:userId:${user}`, async () => {
		const { document } = new JSDOM(await rofetch(profileUrl(user), { headers: {
			"User-Agent": USER_AGENT,
			Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
			"Accept-Encoding": "gzip, br",
			"Accept-Language": "zh-CN,zh;q=0.9",
			"Cache-Control": "no-cache",
			Pragma: "no-cache",
			"Sec-Fetch-Dest": "document",
			"Sec-Fetch-Mode": "navigate",
			"Sec-Fetch-Site": "none",
			"Sec-Fetch-User": "?1",
			"Upgrade-Insecure-Requests": "1"
		} })).window;
		for (const el of document.querySelectorAll("script[data-sjs]")) try {
			const data = JSONPath({
				path: "$..user_id",
				json: JSON.parse(el.textContent || "")
			});
			if (data?.[0]) return data[0];
		} catch {}
		throw new NotFoundError("User ID not found");
	});
	if (result) {
		if (typeof result === "string") return result;
		if (typeof result === "number") return result.toString();
	}
	throw new TypeError("Invalid user ID type");
};
const hasMedia = (post) => post.image_versions2 || post.carousel_media || post.video_versions;
const buildMedia = (post) => {
	let html = "";
	if (post.carousel_media) for (const media of post.carousel_media) {
		const firstImage = media.image_versions2?.candidates[0];
		const firstVideo = media.video_versions?.[0];
		html += firstVideo ? `<video controls autoplay loop poster="${firstImage.url}"><source src="${firstVideo.url}"/></video>` : `<img src="${firstImage.url}"/>`;
	}
	else {
		const mainImage = post.image_versions2?.candidates?.[0];
		const mainVideo = post.video_versions?.[0];
		if (mainImage) html += mainVideo ? `<video controls autoplay loop poster="${mainImage.url}"><source src="${mainVideo.url}"/></video>` : `<img src="${mainImage.url}"/>`;
	}
	return html;
};
const buildContent = (item, options) => {
	let title = "";
	let description = "";
	const quotedPost = item.post.text_post_app_info?.share_info?.quoted_post;
	const repostedPost = item.post.text_post_app_info?.share_info?.reposted_post;
	const isReply = item.post.text_post_app_info?.reply_to_author;
	const embededPost = quotedPost ?? repostedPost;
	if (options.showAuthorInTitle) title += `@${item.post.user?.username}: `;
	if (options.showAuthorInDesc) {
		description += "<p>";
		if (options.showAuthorAvatarInDesc) description += `<img src="${item.post.user?.profile_pic_url}" width="48px" height="48px"> `;
		description += `<strong>@${item.post.user?.username}</strong>`;
		if (embededPost) description += options.showEmojiForQuotesAndReply ? " 🔁" : " quoted";
		else if (isReply) description += options.showEmojiForQuotesAndReply ? " ↩️" : " replied";
		description += ":</p>";
	}
	if (item.post.caption?.text) {
		title += item.post.caption?.text;
		description += `<p>${item.post.caption?.text}</p>`;
	}
	if (hasMedia(item.post)) description += `<p>${buildMedia(item.post)}</p>`;
	if (embededPost) {
		if (options.showQuotedInTitle) {
			title += options.showEmojiForQuotesAndReply ? " 🔁 " : " QT: ";
			title += `@${embededPost.user?.username}: `;
			title += `"${embededPost.caption?.text}"`;
		}
		description += "<blockquote>";
		description += `<p>${embededPost.caption?.text}</p>`;
		if (hasMedia(embededPost)) description += `<p>${buildMedia(embededPost)}</p>`;
		description += "— ";
		if (options.showQuotedAuthorAvatarInDesc) description += `<img src="${embededPost.user?.profile_pic_url}" width="24px" height="24px"> `;
		description += `@${embededPost.user?.username} — `;
		description += `<a href="${threadUrl(embededPost.code)}">${dayjs(embededPost.taken_at, "X").toString()}</a>`;
		description += "</blockquote>";
	}
	return {
		title,
		description
	};
};
//#endregion
//#region lib/routes/threads/index.ts
const route = {
	path: "/:user/:routeParams?",
	categories: ["social-media"],
	view: 1,
	example: "/threads/zuck",
	parameters: {
		user: "Username",
		routeParams: { description: `Extra parameters, see the table below
Specify options (in the format of query string) in parameter \`routeParams\` to control some extra features for threads

| Key                            | Description                                                                                                                  | Accepts                | Defaults to |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ----------- |
| \`showAuthorInTitle\`            | Show author name in title                                                                                                    | \`0\`/\`1\`/\`true\`/\`false\` | \`true\`      |
| \`showAuthorInDesc\`             | Show author name in description (RSS body)                                                                                   | \`0\`/\`1\`/\`true\`/\`false\` | \`true\`      |
| \`showQuotedAuthorAvatarInDesc\` | Show avatar of quoted author in description (RSS body) (Not recommended if your RSS reader extracts images from description) | \`0\`/\`1\`/\`true\`/\`false\` | \`false\`     |
| \`showAuthorAvatarInDesc\`       | Show avatar of author in description (RSS body) (Not recommended if your RSS reader extracts images from description)        | \`0\`/\`1\`/\`true\`/\`false\` | \`falseP\`    |
| \`showEmojiForQuotesAndReply\`   | Use "🔁" instead of "QT", "↩️" instead of "Re"                                                                               | \`0\`/\`1\`/\`true\`/\`false\` | \`true\`      |
| \`showQuotedInTitle\`            | Show quoted tweet in title                                                                                                   | \`0\`/\`1\`/\`true\`/\`false\` | \`true\`      |
| \`replies\`                      | Show replies                                                                                                                 | \`0\`/\`1\`/\`true\`/\`false\` | \`true\`      |` }
	},
	name: "User timeline",
	maintainers: ["ninboy", "pseudoyu"],
	handler
};
async function handler(ctx) {
	const { user, routeParams } = ctx.req.param();
	const { lsd } = await extractTokens(user);
	const userId = await getUserId(user);
	const params = new URLSearchParams(routeParams);
	const debugJson = {
		params: routeParams,
		lsd
	};
	const options = {
		showAuthorInTitle: params.get("showAuthorInTitle") ?? true,
		showAuthorInDesc: params.get("showAuthorInDesc") ?? true,
		showAuthorAvatarInDesc: params.get("showAuthorAvatarInDesc") ?? false,
		showQuotedInTitle: params.get("showQuotedInTitle") ?? true,
		showQuotedAuthorAvatarInDesc: params.get("showQuotedAuthorAvatarInDesc") ?? false,
		showEmojiForQuotesAndReply: params.get("showEmojiForQuotesAndReply") ?? true,
		replies: params.get("replies") ?? false
	};
	const { document } = new JSDOM(await rofetch(profileUrl(user), { headers: {
		"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
		Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
		"Accept-Encoding": "gzip, br",
		"Accept-Language": "zh-CN,zh;q=0.9",
		"Cache-Control": "no-cache",
		Pragma: "no-cache",
		"Sec-Fetch-Dest": "document",
		"Sec-Fetch-Mode": "navigate",
		"Sec-Fetch-Site": "none",
		"Sec-Fetch-User": "?1",
		"Upgrade-Insecure-Requests": "1"
	} })).window;
	let threadsData = null;
	for (const el of document.querySelectorAll("script[data-sjs]")) try {
		const data = JSONPath({
			path: "$..thread_items[0]",
			json: JSON.parse(el.textContent || "")
		});
		if (data?.length > 0) {
			threadsData = data;
			break;
		}
	} catch {}
	if (!threadsData) throw new Error("Failed to fetch thread data");
	debugJson.profileId = userId;
	debugJson.response = { response: threadsData };
	const userData = threadsData[0]?.post?.user || {
		username: user,
		profile_pic_url: ""
	};
	const items = threadsData.filter((item) => user === item.post.user?.username).map((item) => ({
		author: user,
		title: buildContent(item, options).title,
		description: buildContent(item, options).description,
		pubDate: parseDate(item.post.taken_at, "X"),
		link: threadUrl(item.post.code)
	}));
	debugJson.items = items;
	ctx.set("json", debugJson);
	return {
		title: `${user} (@${user}) on Threads`,
		link: profileUrl(user),
		image: userData?.profile_pic_url,
		item: items
	};
}
//#endregion
export { route };
