import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/163/open/vip.tsx
const route = {
	path: "/open/vip",
	categories: ["study"],
	example: "/163/open/vip",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["vip.open.163.com/"] }],
	name: "精品课程",
	maintainers: ["hoilc"],
	handler,
	url: "vip.open.163.com/"
};
const renderDescription = (data, description) => {
	const chapterList = data.movieChapterList.length ? data.movieChapterList : data.audioChapterList;
	return renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [chapterList?.length ? /* @__PURE__ */ jsx("div", {
		class: "toc",
		children: chapterList.map((chapter, chapterIndex) => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("h3", { children: [
			"第",
			chapterIndex + 1,
			"章 ",
			chapter.title
		] }), chapter.contentList.map((content, contentIndex) => /* @__PURE__ */ jsxs("h4", { children: [
			contentIndex + 1,
			" ",
			content.title
		] }))] }))
	}) : null, description ? /* @__PURE__ */ jsx(Fragment, { children: raw(description) }) : null] }));
};
async function handler() {
	const url = "https://vip.open.163.com";
	const $ = load((await got_default(url)).data);
	const initialState = JSON.parse($("script").text().match(/window\.__INITIAL_STATE__=(.*);\(function\(\)\{var/)[1]);
	const list = Object.values(initialState.courseindex.myModules).flatMap((mod) => mod.contents.map((item) => ({
		title: `${item.title} - ${item.subtitle}`,
		author: item.authorName,
		pubDate: parseDate(item.publishTime, "x"),
		link: `${url}/courses/${item.courseUid}/`,
		courseUid: item.courseUid,
		category: mod.name
	})));
	return {
		title: "网易公开课 - 精品课程",
		link: url,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const { data: { data } } = await got_default.post(`${url}/open/trade/pc/course/getCourseInfo.do`, { form: {
				courseUid: item.courseUid,
				version: 1
			} });
			const $ = load(data.courseInfo.description, null, false);
			$("img").each((_, img) => {
				img.attribs.src = img.attribs.src.split("?", 1)[0];
				delete img.attribs.width;
			});
			item.category = [
				item.category,
				data.courseInfo.firstClassifyName,
				data.courseInfo.secondClassifyName
			];
			item.description = renderDescription(data, $.html());
			return item;
		})))
	};
}
//#endregion
export { route };
