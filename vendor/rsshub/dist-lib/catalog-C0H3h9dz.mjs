import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as queryToBoolean } from "./readable-social-DP5kGwF5.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import sanitizeHtml from "sanitize-html";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/4chan/utils.tsx
const parseParams = (routeParams) => {
	const parsed = new URLSearchParams(routeParams ?? "");
	const minRepliesRaw = parsed.get("minReplies");
	const maxRepliesRaw = parsed.get("maxReplies");
	const minReplies = minRepliesRaw === null ? void 0 : Number(minRepliesRaw);
	const maxReplies = maxRepliesRaw === null ? void 0 : Number(maxRepliesRaw);
	return {
		excludeSticky: !!queryToBoolean(parsed.get("excludeSticky")),
		includeLastReplies: !!queryToBoolean(parsed.get("showLastReplies")),
		includeReplyCount: !!queryToBoolean(parsed.get("showReplyCount")),
		maxReplies: Number.isFinite(maxReplies) ? maxReplies : void 0,
		minReplies: Number.isFinite(minReplies) ? minReplies : void 0,
		revealSpoilers: !!queryToBoolean(parsed.get("revealSpoilers"))
	};
};
const processCatalog = ({ data, board, viewOptions }) => {
	return data.flatMap((page) => page.threads).filter((thread) => {
		if (viewOptions.excludeSticky && thread.sticky) return false;
		const replies = thread.replies ?? 0;
		if (viewOptions.minReplies !== void 0 && replies < viewOptions.minReplies) return false;
		return viewOptions.maxReplies === void 0 || replies <= viewOptions.maxReplies;
	}).map((thread) => ({
		author: `${thread.name} ${thread.trip ?? thread.no}`,
		description: renderToString(renderPost({
			post: thread,
			board,
			viewOptions
		})),
		link: `https://boards.4chan.org/${board}/thread/${thread.no}`,
		pubDate: parseDate(thread.time * 1e3),
		title: thread.sub ?? sanitizeHtml(thread.com?.split("<br>", 1)[0] ?? "", { allowedTags: [] })
	}));
};
const renderPost = ({ post, board, viewOptions }) => {
	let media = /* @__PURE__ */ jsx(Fragment, {});
	switch (post.ext) {
		case ".jpg":
		case ".png":
		case ".gif":
			media = /* @__PURE__ */ jsx("img", {
				width: post.w,
				height: post.h,
				style: "",
				src: `https://i.4cdn.org/${board}/${post.tim}${post.ext}`
			});
			break;
		case ".pdf":
			media = /* @__PURE__ */ jsx("embed", {
				src: `https://i.4cdn.org/${board}/${post.tim}${post.ext}`,
				width: "100%",
				height: "500px"
			});
			break;
		case ".swf":
			media = /* @__PURE__ */ jsx("embed", {
				src: `https://i.4cdn.org/${board}/${post.tim}${post.ext}`,
				type: "application/x-shockwave-flash",
				width: post.w,
				height: post.h
			});
			break;
		case ".webm":
			media = /* @__PURE__ */ jsx("video", {
				src: `https://i.4cdn.org/${board}/${post.tim}${post.ext}`,
				loop: true,
				controls: true,
				class: "full-image"
			});
			break;
		default: break;
	}
	if (post.spoiler) media = /* @__PURE__ */ jsxs("details", {
		open: viewOptions.revealSpoilers,
		children: [/* @__PURE__ */ jsx("summary", { children: "Spoiler" }), media]
	});
	media = /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("br", {}),
		" ",
		media,
		" ",
		/* @__PURE__ */ jsx("br", {})
	] });
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		post.last_replies && viewOptions.includeReplyCount && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("small", { children: [post.replies, " 💬"] }), /* @__PURE__ */ jsx("br", {})] }),
		raw(post.com ?? ""),
		media,
		viewOptions.includeLastReplies && post.last_replies?.map((n) => /* @__PURE__ */ jsx("div", {
			className: "post reply",
			children: renderPost({
				post: n,
				board,
				viewOptions
			})
		}))
	] });
};
//#endregion
//#region lib/routes/4chan/catalog.tsx
const handler = async (ctx) => {
	const { board } = ctx.req.param();
	const viewOptions = parseParams(ctx.req.param("routeParams"));
	const { data } = await got_default(`https://a.4cdn.org/${board}/catalog.json`);
	return {
		title: `4chan's /${board}/`,
		link: `https://boards.4chan.org/${board}/catalog`,
		item: processCatalog({
			data,
			board,
			viewOptions
		})
	};
};
const route = {
	path: "/:board/catalog/:routeParams?",
	categories: ["bbs"],
	example: "/4chan/g/catalog",
	parameters: {
		board: "4chan board",
		routeParams: "extra parameters, see the table above"
	},
	features: {
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Board's catalog",
	maintainers: ["heisenshark"],
	radar: [{
		source: ["boards.4chan.org/:board/"],
		target: "/:board/catalog"
	}],
	description: `Specify options (in the format of query string) in parameter \`routeParams\` to control extra features for threads

| Key               | Description                                      | Accepts                | Defaults to |
| ----------------- | ------------------------------------------------ | ---------------------- | ----------- |
| \`showReplyCount\`  | Show number of replies of each thread in catalog | \`0\`/\`1\`/\`true\`/\`false\` | \`false\`     |
| \`showLastReplies\` | Show last 5 replies of each thread               | \`0\`/\`1\`/\`true\`/\`false\` | \`false\`     |
| \`revealSpoilers\`  | Don't wrap images tagged as spoilers             | \`0\`/\`1\`/\`true\`/\`false\` | \`false\`     |
| \`excludeSticky\`   | Filter out sticky threads                        | \`0\`/\`1\`/\`true\`/\`false\` | \`false\`     |
| \`minReplies\`      | Minimum replies per thread                       | Integer                | None        |
| \`maxReplies\`      | Maximum replies per thread                       | Integer                | None        |`,
	handler
};
//#endregion
export { route };
