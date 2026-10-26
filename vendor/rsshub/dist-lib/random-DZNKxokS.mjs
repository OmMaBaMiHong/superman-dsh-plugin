import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/urbandictionary/random.tsx
const route = {
	path: "/random",
	categories: ["other"],
	example: "/urbandictionary/random",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["urbandictionary.com/random.php", "urbandictionary.com/"] }],
	name: "Random words",
	maintainers: ["TonyRL"],
	handler,
	url: "urbandictionary.com/random.php"
};
async function handler() {
	const baseUrl = "https://www.urbandictionary.com";
	const { data } = await got_default("https://api.urbandictionary.com/v0/random");
	const items = data.list.map((item) => ({
		title: item.word,
		description: renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
			item.definition ? /* @__PURE__ */ jsxs(Fragment, { children: [item.definition, /* @__PURE__ */ jsx("br", {})] }) : null,
			item.example ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("i", { children: item.example }), /* @__PURE__ */ jsx("br", {})] }) : null,
			item.author ? /* @__PURE__ */ jsxs(Fragment, { children: ["by ", /* @__PURE__ */ jsx("a", {
				href: `https://www.urbandictionary.com/author.php?author=${item.author}`,
				children: item.author
			})] }) : null
		] })),
		link: `${baseUrl}/define.php?term=${item.word}`,
		guid: item.permalink,
		pubDate: parseDate(item.written_on),
		author: item.author
	}));
	return {
		title: "Urban Dictionary: Random words",
		link: `${baseUrl}/random.php`,
		item: items
	};
}
//#endregion
export { route };
