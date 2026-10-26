import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import dayjs from "dayjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/readhub/templates/description.tsx
const renderDescription = ({ description, news, timeline, rootUrl }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	description ? /* @__PURE__ */ jsx("p", { children: description }) : null,
	news ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("h3", { children: "媒体报道" }), /* @__PURE__ */ jsx("table", {
		cellspacing: "8",
		children: /* @__PURE__ */ jsx("tbody", { children: news.map((item, index) => /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("a", {
			href: item.url,
			children: item.title
		}) }), /* @__PURE__ */ jsx("th", {
			align: "left",
			children: /* @__PURE__ */ jsx("small", { children: item.siteNameDisplay })
		})] }, String(item.url ?? item.title ?? index))) })
	})] }) : null,
	timeline ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("h3", { children: "事件追踪" }), /* @__PURE__ */ jsx("table", {
		cellspacing: "10",
		children: /* @__PURE__ */ jsx("tbody", { children: timeline.topics?.map((topic, index) => /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", {
			align: "left",
			children: /* @__PURE__ */ jsx("small", { children: topic.publishDate ? dayjs(topic.publishDate).format("YYYY-MM-DD HH:mm:ss") : "" })
		}), /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("a", {
			href: topic.uid ? new URL(`topic/${topic.uid}`, rootUrl).href : void 0,
			children: topic.title
		}) })] }, String(topic.uid ?? topic.title ?? index))) })
	})] }) : null
] }));
//#endregion
//#region lib/routes/readhub/util.ts
const domain = "readhub.cn";
const rootUrl = `https://${domain}`;
const apiRootUrl = `https://api.${domain}`;
const apiTopicUrl = new URL("topic/list", apiRootUrl).href;
/**
* Process items asynchronously.
*
* @param {Array<Object>} items - The array of items to process.
* @returns {Promise<Array<Object>>} Returns a Promise that resolves to an array of processed items.
*/
const processItems = async (items) => await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
	try {
		if (!item.link.startsWith(rootUrl)) throw new Error(`"${item.link}" is an external URL`);
		const { data: detailResponse } = await got_default(item.link);
		const data = JSON.parse(detailResponse.match(/\{\\"topic\\":(.*?)\}\]\\n"\]\)<\/script>/)[1].replaceAll(String.raw`\"`, "\""));
		item.title = data.title;
		item.link = data.url ?? new URL(`topic/${data.uid}`, rootUrl).href;
		item.description = renderDescription({
			description: data.summary,
			news: data.newsAggList,
			timeline: data.timeline,
			rootUrl
		});
		item.author = data.siteNameDisplay;
		item.category = [...data.entityList.map((c) => c.name) ?? [], ...data.tagList.map((c) => c.name) ?? []];
		item.guid = `readhub-${data.uid}`;
		item.pubDate = parseDate(data.publishDate.replaceAll(/\s/g, ""));
	} catch {
		item.guid = `readhub-${item.guid}`;
	}
	return item;
})));
//#endregion
export { renderDescription as a, rootUrl as i, apiTopicUrl as n, processItems as r, apiRootUrl as t };
