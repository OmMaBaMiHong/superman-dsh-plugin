import { t as md5 } from "./md5-CpIHIxCO.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { jsx } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/lfsyd/utils.tsx
const rootUrl = "https://www.iyingdi.com";
const infoUrL = "https://api.iyingdi.com/web/post/info";
const ProcessFeed = async (cache, articleList) => {
	return await Promise.all(articleList.map((item) => cache.tryGet(item.link, async () => {
		const infoForm = {
			post_id: item.postId,
			timestamp: ""
		};
		const { body } = await got_default({
			method: "post",
			url: infoUrL,
			headers: {
				Host: "api.iyingdi.com",
				"Login-Token": "nologin",
				Origin: rootUrl,
				Platform: "pc",
				Referer: `${rootUrl}/`
			},
			form: ProcessForm(infoForm)
		});
		item.description = cleanHtml(JSON.parse(body).post.content);
		return item;
	})));
};
const ProcessForm = (form, type) => {
	form.key = type ? "8a11ed3712b699e749185674f1dc20b4" : "b8d5b38577b8bb382b0c783b474b95f9";
	form.timestamp = Math.floor(Date.now() / 1e3);
	form.sign = md5(new URLSearchParams(form).toString());
	delete form.key;
	return form;
};
const cleanHtml = (htmlString) => {
	const $ = load(htmlString.replace(/(<p>|<div>)(.*?)<strong>(标准|狂野)日报投稿.*?<\/strong>(.*?)(<\/p>|<\/div>)(.|\n)*$/, ""));
	$(".yingdi-car,.bbspost,.deck-set").each((i, e) => {
		const className = $(e).attr("class");
		const dataId = $(e).attr("data-id");
		const decksUrl = `${rootUrl}/web/tools/hearthstone/decks/setdetail?setid=${dataId}`;
		const url = className === "yingdi-card bbspost" ? `${rootUrl}/tz/post/${dataId}` : decksUrl;
		const time = $(e).find(".card-status .time").text();
		$(e).find(".card-info .title").text((i, c) => `${c} ${time}`);
		$(e).find(".card-status").remove();
		$(e).find(".card-info").wrap(renderToString(/* @__PURE__ */ jsx("a", { href: url })));
	});
	$(".yingdi-image.gif").each((i, e) => {
		const imgsrc = $(e).attr("data-original");
		$(e).attr("src", imgsrc);
	});
	$(".yingdi-audio").each((i, e) => {
		$(e).find(".audio-cover").remove();
		$(e).find(".audio-area.hidden").attr("class", "audio-area");
	});
	$(".yingdi-video iframe").each((i, e) => {
		const bvid = $(e).attr("src").match(/bvid=(.*?)&/)[1];
		if (bvid) {
			const url = `https://www.bilibili.com/video/${bvid}`;
			$(e).after(renderToString(/* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("a", {
				href: url,
				children: url
			}) })));
		}
	});
	$(".yingdi-card.user").each((i, e) => {
		$(e).prev("p").remove();
		$(e).remove();
	});
	$(".action-button").remove();
	$(".yingdi-ballot").remove();
	$("hr").remove();
	return $.html();
};
//#endregion
export { ProcessForm as n, ProcessFeed as t };
