import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/netflav/index.tsx
const route = {
	path: "/",
	radar: [{
		source: ["netflav.com/"],
		target: ""
	}],
	name: "Unknown",
	maintainers: ["TonyRL"],
	handler,
	url: "netflav.com/",
	features: { nsfw: true }
};
async function handler() {
	const baseUrl = "https://netflav.com";
	const { data } = await got_default(baseUrl);
	const $ = load(data);
	const { head, props: { initialState } } = JSON.parse($("#__NEXT_DATA__").text());
	const items = [
		...initialState.censored.docs,
		...initialState.uncensored.docs,
		...initialState.chinese.docs,
		...initialState.trending.docs
	].map((item) => ({
		title: item.title,
		description: renderDescription([.../* @__PURE__ */ new Set([
			item.preview_hp,
			item.preview,
			item.previewImagesUrl,
			...item.previewImages || []
		])].filter(Boolean), item.description),
		link: `https://netflav.com/video?id=${item.videoId}`,
		pubDate: parseDate(item.sourceDate),
		author: [...new Set(item.actors.map((a) => a.replace(/^(\w{2}:)/, "")))].join(", "),
		category: [...new Set(item.tags?.map((t) => t.replace(/^(\w{2}:)/, "")))]
	}));
	return {
		title: head.find((h) => h[0] === "title")[1].children,
		description: head.find((h) => h[0] === "meta" && h[1].name === "description")[1].content,
		logo: `${baseUrl}${head.find((h) => h[0] === "meta" && h[1].property === "og:image")[1].content}`,
		image: `${baseUrl}${head.find((h) => h[0] === "meta" && h[1].property === "og:image")[1].content}`,
		link: baseUrl,
		item: items,
		allowEmpty: true
	};
}
const renderDescription = (images, description) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [images?.map((img, index) => /* @__PURE__ */ jsx("img", { src: img }, `${img}-${index}`)), description ? /* @__PURE__ */ jsx("p", { children: description }) : null] }));
//#endregion
export { route };
