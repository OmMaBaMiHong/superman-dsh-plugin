import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/google/fonts.tsx
const titleMap = {
	date: "Newest",
	popularity: "Most Popular",
	trending: "Trending",
	alpha: "Name",
	style: "Number of styles"
};
const route = {
	path: "/fonts/:sort?",
	categories: ["design"],
	example: "/google/fonts/date",
	parameters: { sort: "Sorting type, see below, default to `date`" },
	features: {
		requireConfig: [{
			name: "GOOGLE_FONTS_API_KEY",
			description: ""
		}],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Google Fonts",
	maintainers: ["Fatpandac"],
	handler,
	description: `| Newest | Trending | Most popular |  Name | Number of styles |
| :----: | :------: | :----------: | :---: | :--------------: |
|  date  | trending |  popularity  | alpha |       style      |

::: warning
This route requires API key, therefore it's only available when self-hosting, refer to the [Deploy Guide](https://docs.rsshub.app/deploy/config#route-specific-configurations) for route-specific configurations.
:::`
};
async function handler(ctx) {
	const sort = ctx.req.param("sort") ?? "date";
	const limit = ctx.req.param("limit") ?? 25;
	const API_KEY = config.google.fontsApiKey;
	if (!API_KEY) throw new ConfigNotFoundError("Google Fonts API key is required.");
	const googleFontsAPI = `https://www.googleapis.com/webfonts/v1/webfonts?sort=${sort}&key=${API_KEY}`;
	const data = (await got_default.get(googleFontsAPI)).data.items.slice(0, limit);
	return {
		title: `Google Fonts - ${titleMap[sort]}`,
		link: "https://fonts.google.com",
		item: data && data.map((item) => ({
			title: item.family,
			description: renderDescription(item),
			link: `https://fonts.google.com/specimen/${item.family.replaceAll(/\s/g, "+")}`,
			pubDate: parseDate(item.lastModified, "YYYY-MM-DD")
		}))
	};
}
const renderDescription = (item) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	/* @__PURE__ */ jsxs("text", { children: ["Family: ", item.family] }),
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsxs("text", { children: ["Category: ", item.category] }),
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsxs("text", { children: ["Subsets: ", item.subsets?.join(",")] }),
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsxs("text", { children: ["Version: ", item.version] }),
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsxs("text", { children: ["Last modified: ", item.lastModified] }),
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsx(Strong, { children: "File:" }),
	/* @__PURE__ */ jsx("br", {}),
	Object.entries(item.files ?? {}).map(([key, value]) => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("a", {
		href: value,
		children: key
	}), "\xA0\xA0"] }))
] }));
//#endregion
export { route };
