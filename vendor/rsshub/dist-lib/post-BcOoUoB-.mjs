import { t as config } from "./config-B5Cf_tHS.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import queryString from "query-string";
//#region lib/routes/gelbooru/utils.tsx
function renderDesc(post, link, quality) {
	const { id, source, owner, file_url: fileUrl, tags, score } = post;
	const isHttp = /^https?:\/\//.test(source);
	const sourceHost = isHttp ? new URL(source).host : source || "unknown";
	const imgQualityMap = {
		sample: "sample_url",
		orig: "file_url"
	};
	const videoExtList = ["mp4", "webm"];
	const fileExt = fileUrl.slice(fileUrl.lastIndexOf(".") + 1);
	const isVideo = videoExtList.includes(fileExt);
	let contentURL = post[imgQualityMap[quality]] || fileUrl;
	if (isVideo) contentURL = fileUrl;
	return renderDescription({
		id,
		source,
		owner,
		tags,
		link,
		isHttp,
		sourceHost,
		contentURL,
		isVideo,
		score: score || 0
	});
}
const renderDescription = ({ id, source, owner, tags, link, isHttp, sourceHost, contentURL, isVideo, score }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	/* @__PURE__ */ jsx("div", { children: isVideo ? /* @__PURE__ */ jsx("video", {
		controls: true,
		preload: "metadata",
		src: contentURL
	}) : /* @__PURE__ */ jsx("img", { src: contentURL }) }),
	/* @__PURE__ */ jsxs("h2", { children: [
		"Info of ",
		/* @__PURE__ */ jsxs("a", {
			href: link,
			children: ["#", id]
		}),
		":",
		" "
	] }),
	/* @__PURE__ */ jsxs("p", { children: [
		isHttp ? /* @__PURE__ */ jsx("a", {
			href: source,
			children: "Source"
		}) : /* @__PURE__ */ jsxs("span", { children: ["Source: ", source] }),
		" (",
		sourceHost,
		")"
	] }),
	/* @__PURE__ */ jsxs("p", { children: ["Upload by: ", /* @__PURE__ */ jsx("a", {
		href: `https://gelbooru.com/index.php?page=post&s=list&tags=user:${owner}`,
		children: owner
	})] }),
	/* @__PURE__ */ jsxs("p", { children: ["Score: ", score] }),
	/* @__PURE__ */ jsxs("p", { children: ["Tags: ", /* @__PURE__ */ jsx("p", { children: tags })] })
] }));
function getAPIKeys() {
	return {
		apiKey: config.gelbooru.apiKey || "",
		userId: config.gelbooru.userId || ""
	};
}
//#endregion
//#region lib/routes/gelbooru/post.ts
const route = {
	path: "/post/:tags?/:quality?",
	categories: ["picture"],
	view: 2,
	example: "/gelbooru/post/1girl rating:general",
	parameters: {
		tags: "要搜索的标签，多个标签用 ` `（空格）隔开",
		quality: {
			description: "图片质量，可选值为 `sample`（压缩后的图片，推荐值） 或 `orig`（原图），默认为 `sample`",
			default: "sample"
		}
	},
	features: {
		requireConfig: [{
			name: "GELBOORU_API_KEY",
			description: "Gelbooru 偶尔会开启 API 认证，需配合 `GELBOORU_USER_ID`，从 `https://gelbooru.com/index.php?page=account&s=options` 获取",
			optional: true
		}, {
			name: "GELBOORU_USER_ID",
			description: "参见 `GELBOORU_API_KEY`",
			optional: true
		}],
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	radar: [{ source: ["gelbooru.com/index.php"] }],
	name: "标签查询",
	maintainers: ["magicFeirl"],
	description: `- 默认查询: \`/gelbooru/post\` 功能等同查询 Gelbooru 网站最新的投稿
- 单标签查询: \`/gelbooru/post/1girl\` 查询 \`1girl\` 的最新投稿
- 多标签查询: \`/gelbooru/post/1girl school_uniform rating:general\`
- 指定为原图: \`/gelbooru/post/1girl school_uniform rating:general/orig\`
- 更多例子：请参考 Gelbooru 官方 wiki <https://gelbooru.com/index.php?page=wiki&s=&s=view&id=25921>

**可选的 URL 参数**

- limit 页面返回数据量，默认 40，可选 1 \\~ 100

e.g.: \`/gelbooru/post?limit=20&\``,
	handler
};
async function handler(ctx) {
	const { tags: _tags = "", quality = "sample" } = ctx.req.param();
	const tags = decodeURIComponent(_tags).trim();
	const { limit = 40 } = ctx.req.query();
	const { apiKey, userId } = getAPIKeys();
	const posts = (await got_default({
		url: "https://gelbooru.com/index.php",
		searchParams: queryString.stringify({
			page: "dapi",
			s: "post",
			q: "index",
			tags,
			api_key: apiKey,
			user_id: userId,
			limit: limit <= 0 || limit > 100 ? 40 : limit,
			json: 1
		})
	})).data.post;
	return {
		title: tags ? `${tags} - gelbooru.com` : "gelbooru.com post list",
		link: `https://gelbooru.com/index.php?page=post&s=list&tags=${tags}`,
		icon: "https://gelbooru.com/favicon.png",
		logo: "https://gelbooru.com/favicon.png",
		description: "Gelbooru post list",
		item: posts.map((post) => ({
			title: post.id,
			id: post.id,
			link: `https://gelbooru.com/index.php?page=post&s=view&id=${post.id}`,
			author: post.owner,
			pubDate: parseDate(post.created_at),
			description: renderDesc(post, `https://gelbooru.com/index.php?page=post&s=view&id=${post.id}`, quality),
			upvotes: post.score,
			updated: parseDate(post.change),
			media: {
				content: { url: post.file_url },
				thumbnail: { url: post.preview_url }
			},
			category: post.tags.split(/\s+/g)
		}))
	};
}
//#endregion
export { route };
