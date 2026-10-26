import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/ixigua/user-video.tsx
const host = "https://www.ixigua.com";
const route = {
	path: "/user/video/:uid/:disableEmbed?",
	categories: ["multimedia"],
	example: "/ixigua/user/video/4234740937",
	parameters: {
		uid: "用户 id, 可在用户主页中找到",
		disableEmbed: "默认为开启内嵌视频, 任意值为关闭"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["ixigua.com/home/:uid"],
		target: "/user/video/:uid"
	}],
	name: "用户视频投稿",
	maintainers: [
		"FlashWingShadow",
		"Fatpandac",
		"pseudoyu"
	],
	handler
};
async function handler(ctx) {
	const uid = ctx.req.param("uid");
	const disableEmbed = ctx.req.param("disableEmbed");
	const url = `${host}/home/${uid}/?wid_try=1`;
	const { data } = await got_default(url);
	const jsData = load(data)("#SSR_HYDRATED_DATA").html();
	if (!jsData) throw new Error("Failed to find SSR_HYDRATED_DATA");
	const { AuthorVideoList: { videoList: videoInfos }, AuthorDetailInfo: userInfo } = JSON.parse(jsData.match(/var\s+data\s*=\s*(\{.*?\});/s)?.[1].replaceAll("undefined", "null") || "{}");
	if (!videoInfos || !userInfo) throw new Error("Failed to extract required data from JSON");
	return {
		title: `${userInfo.name} 的西瓜视频`,
		link: url,
		description: userInfo.introduce,
		item: videoInfos.map((i) => ({
			title: i.title,
			description: renderToString(/* @__PURE__ */ jsx(IxiguaVideoDescription, {
				i,
				disableEmbed
			})),
			link: `${host}/${i.groupId}`,
			pubDate: parseDate(i.publishTime * 1e3),
			author: userInfo.name
		}))
	};
}
const IxiguaVideoDescription = ({ i, disableEmbed }) => /* @__PURE__ */ jsxs(Fragment, { children: [
	disableEmbed ? null : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("iframe", {
		width: "720",
		height: "405",
		frameborder: "0",
		allowfullscreen: true,
		src: `https://www.ixigua.com/iframe/${i.groupId}?autoplay=0`,
		referrerpolicy: "unsafe-url",
		allowfullscreen: true
	}), /* @__PURE__ */ jsx("br", {})] }),
	/* @__PURE__ */ jsx("img", { src: i.coverUrl }),
	/* @__PURE__ */ jsx("p", { children: i.abstract })
] });
//#endregion
export { route };
