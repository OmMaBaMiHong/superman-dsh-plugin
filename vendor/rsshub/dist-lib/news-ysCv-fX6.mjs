import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/diershoubing/news.tsx
const renderDesc = (data) => renderToString(/* @__PURE__ */ jsx(DiershoubingDescription, { ...data }));
const route = {
	path: "/news",
	categories: ["game"],
	example: "/diershoubing/news",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["diershoubing.com/"] }],
	name: "新闻",
	maintainers: ["wushijishan"],
	handler,
	url: "diershoubing.com/"
};
async function handler(ctx) {
	const { data } = await got_default(`https://api.diershoubing.com:5001/feed/tag/?pn=0&rn=${ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 20}&tag_type=0&src=ios`);
	return {
		title: "二柄APP",
		link: "https://www.diershoubing.com",
		description: "二柄APP新闻",
		item: data.feeds.map((item) => {
			let acontent;
			let type;
			if (item.video_img && item.video_type === "bilibili") {
				acontent = {
					img: item.video_img,
					bvid: item.video_url.replace("https://www.bilibili.com/video/", "").replace("/", "")
				};
				type = "bilibili";
			} else if (item.acontent.startsWith("{")) {
				const contentData = JSON.parse(item.acontent);
				if (contentData.imgs) {
					acontent = contentData.imgs.split(",");
					type = "imgs";
				} else {
					acontent = {
						img: contentData.video.split("|", 1)[0],
						bvid: contentData.video.split("|", 2)[1].replace("https://www.bilibili.com/video/", "")
					};
					type = "bilibili";
				}
			} else {
				acontent = item.acontent.split(",");
				type = "imgs";
			}
			return {
				title: item.title,
				link: item.share.url,
				description: renderDesc({
					description: item.content.replaceAll("\r\n", "<br>"),
					type,
					acontent
				}),
				category: item.feed_type,
				author: item.create_nick_name,
				pubDate: parseDate(item.create_time)
			};
		})
	};
}
const DiershoubingDescription = ({ description, type, acontent }) => /* @__PURE__ */ jsxs(Fragment, { children: [raw(description), type === "imgs" ? /* @__PURE__ */ jsx(Fragment, { children: acontent.map((img) => /* @__PURE__ */ jsx("img", { src: img })) }) : type === "bilibili" ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: acontent.img }), /* @__PURE__ */ jsx("iframe", {
	src: `https://player.bilibili.com/player.html?bvid=${acontent.bvid}&high_quality=1`,
	width: "650",
	height: "477",
	scrolling: "no",
	border: "0",
	frameborder: "no",
	framespacing: "0",
	allowfullscreen: "true"
})] }) : null] });
//#endregion
export { route };
