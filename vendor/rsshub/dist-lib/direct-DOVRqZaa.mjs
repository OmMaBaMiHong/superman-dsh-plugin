import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/nintendo/templates/direct.tsx
const renderDirectDescription = (publicId, content) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [publicId ? /* @__PURE__ */ jsx("img", { src: `https://assets.nintendo.com/image/upload/${publicId}` }) : null, content?.length ? content.map((node, index) => node.nodeType === "paragraph" ? /* @__PURE__ */ jsx("p", { children: (node.content ?? []).map((part) => part.value).join("") }, `${node.nodeType}-${index}`) : null) : null] }));
//#endregion
//#region lib/routes/nintendo/direct.ts
const route = {
	path: "/direct",
	categories: ["game"],
	example: "/nintendo/direct",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["nintendo.com/nintendo-direct/archive", "nintendo.com/"] }],
	name: "Nintendo Direct",
	maintainers: ["HFO4"],
	handler,
	url: "nintendo.com/nintendo-direct/archive"
};
async function handler() {
	const data = (await got_default("https://www.nintendo.com/nintendo-direct/archive/")).data;
	const $ = load(data);
	const nextData = JSON.parse($("script#__NEXT_DATA__").text());
	delete nextData.props.pageProps.initialApolloState.ROOT_QUERY;
	return {
		title: "Nintendo Direct（任天堂直面会）",
		link: "https://www.nintendo.com/nintendo-direct/archive/",
		description: "最新的任天堂直面会日程信息",
		item: Object.values(nextData.props.pageProps.initialApolloState).map((item) => ({
			title: item.name,
			pubDate: parseDate(item.startDate),
			link: `https://www.nintendo.com/nintendo-direct/${item.slug}/`,
			description: renderDirectDescription(item.thumbnail.publicId, item.description.json.content)
		}))
	};
}
//#endregion
export { route };
