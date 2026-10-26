import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/shmtu/portal.tsx
const bootstrapHost = "https://weixin.shmtu.edu.cn/dynamic/shmtuHttps";
const host = "https://portal.shmtu.edu.cn/api";
const loadDetail = async (link) => {
	const response = await got_default.post(bootstrapHost, { form: { interfaceUrl: link } });
	return JSON.parse(response.data);
};
const renderDescription = (body, images, files) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	body ? /* @__PURE__ */ jsx(Fragment, { children: raw(body) }) : null,
	images?.length ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("span", {
		style: "font-size:19px",
		children: "图片："
	}), images.map((image) => /* @__PURE__ */ jsxs("figure", { children: [/* @__PURE__ */ jsx("img", {
		src: `https://weixin.shmtu.org/dynamic/getFile?fid=${image.fid}`,
		alt: image.filename,
		style: "margin: 0 auto"
	}), /* @__PURE__ */ jsx("figcaption", {
		style: "text-align:center;font-size:19px",
		children: image.alt
	})] }))] }) : null,
	files?.length ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("span", {
		style: "font-size:19px",
		children: "附件："
	}), files.map((file) => /* @__PURE__ */ jsx("p", {
		style: "text-indent:32px",
		children: /* @__PURE__ */ jsx("span", {
			style: "font-size:19px",
			children: /* @__PURE__ */ jsx("a", {
				href: `https://weixin.shmtu.org/dynamic/getFile?fid=${file.fid}`,
				target: "_blank",
				children: file.filename
			})
		})
	}))] }) : null
] }));
const processFeed = (list, caches) => Promise.all(list.map((item) => caches.tryGet(item.link, async () => {
	const detail = await loadDetail(item.link);
	const files = detail.field_file;
	const images = detail.field_image;
	item.description = renderDescription(detail.body.und[0].safe_value, images.length !== 0 && Object.keys(images).length !== 0 ? images.und : null, files.length !== 0 && Object.keys(files).length !== 0 ? files.und : null);
	item.link = detail.path;
	return item;
})));
const route = {
	path: "/portal/:type",
	categories: ["university"],
	example: "/shmtu/portal/bmtzgg",
	parameters: { type: "类型名称" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["portal.shmtu.edu.cn/:type"] }],
	name: "数字平台",
	maintainers: ["imbytecat"],
	handler,
	description: `| 部门通知公告 | 学术与大型活动公告 | 部门动态 |
| ------------ | ------------------ | -------- |
| bmtzgg       | xsydxhdgg          | bmdt     |`
};
async function handler(ctx) {
	const type = ctx.req.param("type");
	let info;
	switch (type) {
		case "bmtzgg":
			info = "部门通知公告";
			break;
		case "xsydxhdgg":
			info = "学术与大型活动公告";
			break;
		case "bmdt":
			info = "部门动态";
			break;
		default:
			info = "未知";
			break;
	}
	const response = await got_default.post(bootstrapHost, { form: { interfaceUrl: `${host}/${type}.json?page=0` } });
	const list = JSON.parse(response.data).map((item) => ({
		title: load(item.title).text(),
		link: `${host}/node/${item.nid}.json`,
		pubDate: timezone(parseDate(item.created), 8),
		category: item.field_department[0],
		author: item.field_department[0]
	}));
	const result = await processFeed(list, cache_default);
	return {
		title: `上海海事大学 ${info}`,
		link: "https://portal.shmtu.edu.cn/bumentongzhigonggao",
		description: "上海海事大学 数字平台",
		item: result
	};
}
//#endregion
export { route };
