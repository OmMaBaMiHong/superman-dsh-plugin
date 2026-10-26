import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/hebtv/nong-bo-shi-zai-xing-dong.tsx
const baseUrl = "https://web.cmc.hebtv.com/cms/rmt0336/19/19js/st/ds/nmpd/nbszxd/index.shtml";
const renderDescription = (image, video) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [image?.src ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
	src: image.src,
	alt: image.alt
}) }) : null, video?.src ? /* @__PURE__ */ jsxs("video", {
	poster: video.poster,
	controls: true,
	children: [/* @__PURE__ */ jsx("source", {
		src: video.src,
		type: video.type
	}), /* @__PURE__ */ jsx("object", {
		data: video.src,
		children: /* @__PURE__ */ jsx("embed", { src: video.src })
	})]
}) : null] }));
const route = {
	path: "/nbszxd",
	categories: ["traditional-media"],
	example: "/hebtv/nbszxd",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: true,
		supportPodcast: true,
		supportScihub: false
	},
	radar: [{ source: ["web.cmc.hebtv.com/cms/rmt0336/19/19js/st/ds/nmpd/nbszxd/index.shtml"] }],
	name: "农博士在行动",
	maintainers: ["iamqiz", "nczitzk"],
	handler,
	url: "web.cmc.hebtv.com/cms/rmt0336/19/19js/st/ds/nmpd/nbszxd/index.shtml"
};
async function handler(ctx) {
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 40;
	const apiUrl = new URL("cmsback/api/article/getMyArticleDetail", "http://api.cmc.hebtv.com").href;
	const $ = load((await got_default(baseUrl)).data);
	const list = $(".video_box .tv_items").first().children().toArray().map((item) => {
		item = $(item);
		const a = item.find("a").first();
		const timeMatch = a.text().match(/\d+/);
		const timestr = timeMatch ? timeMatch[0] : "";
		return {
			title: a.text(),
			link: `${baseUrl}/../${a.attr("href")}`,
			pubDate: timestr ? timezone(parseDate(timestr, "YYYYMMDD"), 8) : null,
			author: "时间|" + timestr
		};
	});
	const items = await Promise.all(list.slice(0, limit).map((item) => cache_default.tryGet(item.link, async () => {
		const { data: detailResponse } = await got_default(item.link);
		const tenantId = detailResponse.match(/tenantid = '(\w+)';/)[1];
		const articleId = item.link.match(/\/nbszxd\/(\d+)/)[1];
		const { data: apiResponse } = await got_default(apiUrl, { searchParams: {
			tenantId,
			articleId
		} });
		const data = apiResponse.data;
		let videoData;
		if (data.articleContentDto?.videoDtoList?.length > 0) videoData = data.articleContentDto?.videoDtoList[0];
		item.title = data.title;
		item.author = data.source;
		item.guid = `hebtv-nbszxd-${articleId}`;
		item.pubDate = timezone(parseDate(data.publishDate), 8);
		item.updated = timezone(parseDate(data.modifyTime), 8);
		if (videoData) {
			item.itunes_item_image = videoData.poster;
			item.itunes_duration = data.articleContentDto?.videoEditDtoList[0]?.sourceMediaInfo?.duration;
			item.enclosure_url = videoData.formats[0]?.url;
			item.enclosure_length = data.articleContentDto?.videoEditDtoList[0].sourceMediaInfo?.fileSize;
			item.enclosure_type = item.enclosure_url ? `video/${item.enclosure_url?.split(/\./)?.pop()}` : void 0;
		}
		item.description = renderDescription(void 0, videoData ? {
			src: item.enclosure_url,
			type: item.enclosure_type,
			poster: item.itunes_item_image
		} : void 0);
		return item;
	})));
	const description = $("meta[name=\"description\"]").prop("content");
	const author = description.split(/,/, 1)[0];
	const icon = $("link[rel=\"shortcut icon\"]").prop("href");
	return {
		item: items,
		title: $("title").text(),
		link: baseUrl,
		description,
		language: $("html").prop("lang"),
		image: $("div.logo a img").prop("src"),
		icon,
		logo: icon,
		subtitle: $("meta[name=\"keywords\"]").prop("content"),
		author,
		itunes_author: author,
		itunes_category: "News",
		allowEmpty: true
	};
}
//#endregion
export { route };
