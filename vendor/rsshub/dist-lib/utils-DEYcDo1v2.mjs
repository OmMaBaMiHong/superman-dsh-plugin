import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/sina/utils.tsx
const getRollNewsList = (pageid, lid, limit) => got_default("https://feed.mix.sina.com.cn/api/roll/get", {
	headers: { referer: "https://news.sina.com.cn/" },
	searchParams: {
		pageid,
		lid,
		k: "",
		num: limit,
		page: 1,
		r: Math.random(),
		_: Date.now()
	}
});
const parseRollNewsList = (data) => data.map((item) => ({
	title: item.title,
	description: item.intro,
	link: item.url.replace("http://", "https://"),
	author: item.media_name,
	pubDate: parseDate(item.intime, "X"),
	updated: parseDate(item.mtime, "X")
}));
const parseArticle = (item) => cache_default.tryGet(item.link, async () => {
	const $ = load((await got_default(item.link)).data);
	$("#left_hzh_ad, .appendQr_wrap, .app-kaihu-qr, .tech-quotation").remove();
	const metaPublishTime = $("meta[property=\"article:published_time\"]");
	const htmlPubDate = $("#pub_date, .date");
	const htmlDate = htmlPubDate.length ? timezone(parseDate(htmlPubDate.text(), ["YYYY年MM月DD日 HH:mm", "YYYY年MM月DD日HH:mm"]), 8) : null;
	const metaDate = metaPublishTime.length ? parseDate(metaPublishTime.attr("content")) : htmlDate;
	item.pubDate ??= metaDate;
	item.author = $("meta[property=\"article:author\"]").attr("content");
	if (item.link.startsWith("https://slide.sports.sina.com.cn/") || item.link.startsWith("https://slide.tech.sina.com.cn/")) item.description = renderToString(/* @__PURE__ */ jsx(Fragment, { children: JSON.parse($("script").text().match(/var slide_data = (\{.*?\})\s/)[1]).images.map((img) => /* @__PURE__ */ jsx("img", {
		src: img.download_img,
		alt: img.intro
	})) }));
	else if (item.link.startsWith("https://video.sina.com.cn/")) {
		const videoId = $("script").text().match(/video_id:'?(.*?)'?,/)[1];
		const { data: videoResponse } = await got_default("https://api.ivideo.sina.com.cn/public/video/play", { searchParams: {
			video_id: videoId,
			appver: "V11220.210521.03",
			appname: "sinaplayer_pc",
			applt: "web",
			tags: "sinaplayer_pc",
			jsonp: "",
			plid: 2021012801,
			prid: "",
			uid: "",
			tid: "",
			pid: 1,
			ran: Math.random(),
			r: item.link,
			ssid: `gusr_pc_${Date.now()}`,
			preload: 0,
			uu: "",
			isAuto: 1
		} });
		const videoData = videoResponse.data;
		const poster = videoData.image;
		const videoUrl = videoData.videos.find((v) => v.type === "mp4").dispatch_result.url;
		item.description = renderToString(/* @__PURE__ */ jsx(Fragment, { children: videoUrl ? /* @__PURE__ */ jsx("video", {
			controls: true,
			poster: poster ?? "",
			preload: "metadata",
			children: /* @__PURE__ */ jsx("source", { src: videoUrl })
		}) : null }));
		item.pubDate = parseDate(videoData.create_time, "X");
	} else if (item.link.startsWith("https://news.sina.com.cn/") || item.link.startsWith("https://mil.news.sina.com.cn/")) {
		item.description = $("#article").html();
		item.category = $("meta[name=\"keywords\"]").attr("content").split(",");
	} else {
		item.description = $("#artibody").html();
		item.category = $("#keywords").data("wbkey")?.split(",");
	}
	return item;
});
//#endregion
export { parseArticle as n, parseRollNewsList as r, getRollNewsList as t };
