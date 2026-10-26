import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as renderDescription } from "./description-CFoQ464m.mjs";
//#region lib/routes/mihoyo/bbs/utils.ts
const post2item = (e) => {
	const author = e.user.nickname;
	const title = e.post.subject;
	const link = `https://www.miyoushe.com/ys/article/${e.post.post_id}`;
	let describe = e.post.content || "";
	try {
		describe = JSON.parse(e.post.content).describe;
	} catch (error) {
		if (!(error instanceof SyntaxError)) throw error;
	}
	return {
		author,
		title,
		link,
		description: renderDescription(describe || "", [.../* @__PURE__ */ new Set([e.post.cover, ...e.post.images])].filter(Boolean)),
		pubDate: parseDate(e.post.created_at * 1e3),
		upvotes: e.stat.like_num,
		comments: e.stat.reply_num
	};
};
//#endregion
export { post2item as t };
