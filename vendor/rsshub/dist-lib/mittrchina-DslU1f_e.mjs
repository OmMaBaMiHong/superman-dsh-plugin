import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { jsx } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/mittrchina/index.tsx
const route = {
	path: "/:type?",
	categories: ["new-media"],
	example: "/mittrchina/index",
	parameters: { type: "类型，见下表，默认为首页资讯" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "首页",
	maintainers: ["EsuRt", "queensferryme"],
	handler,
	description: `| 快讯     | 本周热文 | 首页资讯 | 视频  |
| -------- | -------- | -------- | ----- |
| breaking | hot      | index    | video |`
};
async function handler(ctx) {
	const typeMap = {
		breaking: {
			title: "快讯",
			apiPath: "/flash"
		},
		hot: {
			title: "本周热榜",
			apiPath: "/information/hot"
		},
		index: {
			title: "首页资讯",
			apiPath: "/information/index"
		},
		video: {
			title: "视频",
			apiPath: "/movie/index"
		}
	};
	const { type = "index" } = ctx.req.param();
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 10;
	const link = `https://apii.web.mittrchina.com${typeMap[type].apiPath}`;
	const { data: response } = type === "breaking" ? await got_default.post(link, { form: {
		page: 1,
		size: limit
	} }) : await got_default(link, { searchParams: { limit } });
	const list = (type === "hot" ? response.data : response.data.items).map((article) => ({
		title: article.name || article.title,
		author: (article.authors || article.author || []).map((author) => author.username).join(", "),
		category: article.typeName,
		description: type === "video" ? renderToString(/* @__PURE__ */ jsx(VideoDescription, {
			poster: article.img,
			video: {
				address: article.address,
				type: article.address.split(".").pop()
			}
		})) : type === "breaking" ? article.content : article.summary,
		pubDate: article.start_time ? parseDate(article.start_time, "X") : article.push_time ? parseDate(article.push_time, "X") : void 0,
		id: article.id,
		link: `https://www.mittrchina.com/news/detail/${article.id}`
	}));
	let items = list;
	if (type !== "video" && type !== "breaking") items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: { data: details } } = await got_default(`https://apii.web.mittrchina.com/information/details?id=${item.id}`);
		item.description = details.content;
		if (!item.author) item.author = details.authors.map((a) => a.username).join(", ");
		if (!item.pubDate) item.pubDate = parseDate(details.start_time, "X");
		if (details.cover) {
			item.enclosure_url = details.cover;
			item.enclosure_type = `image/${details.cover.split(".").pop()}`;
		}
		return item;
	})));
	return {
		title: `MIT 科技评论 - ${typeMap[type].title}`,
		link: `https://www.mittrchina.com/${type}`,
		item: items
	};
}
const VideoDescription = ({ poster, video }) => video ? /* @__PURE__ */ jsx("video", {
	poster,
	controls: true,
	children: /* @__PURE__ */ jsx("source", {
		src: video.address,
		type: video.type
	})
}) : null;
//#endregion
export { route };
