import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/steam/curator.tsx
const route = {
	path: "/curator/:id/:routeParams?",
	categories: ["game"],
	example: "/steam/curator/34646096-80-Days",
	parameters: {
		id: "Steam curator id. It usually consists of a series of numbers and the curator's name.",
		routeParams: { description: `Extra parameters to filter the reviews. The following parameters are supported:
| Key             | Description                                                                                   | Accepts                                    | Defaults to |
| --------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------ | ----------- |
| \`curations\`   | Review type to filter by. \`0\`: Recommended, \`1\`: Not Recommended, \`2\`: Informational    | \`0\`/\`1\`/\`2\`/\`0,1\`/\`0,2\`/\`1,2\`  |             |
| \`tagids\`      | Tag to filter by. Details are provided below.                                                 | use comma to separate multiple tagid       |             |

Note: There is a [‘Popular Tags’](https://store.steampowered.com/tag/browse) page where you can find many but not all of the tags. The tag’s ID is in the \`data-tagid\` attribute of the element.Steam does not currently provide a page that comprehensively lists all tags, and you may need to explore alternative ways to find them.

Examples:
* \`/steam/curator/34646096-80-Days/curations=&tagids=\`
* \`/steam/curator/34646096-80-Days/curations=0&tagids=19\`
* \`/steam/curator/34646096-80-Days/curations=0,2&tagids=19,21\`
` }
	},
	radar: [{
		title: "Latest Curator Reviews",
		source: ["store.steampowered.com/curator/:id"],
		target: "/curator/:id"
	}],
	description: "The Latest reviews from a Steam Curator.",
	name: "Latest Curator Reviews",
	maintainers: ["naremloa", "fenxer"],
	handler: async (ctx) => {
		const { id, routeParams } = ctx.req.param();
		const params = new URLSearchParams(routeParams);
		const url = new URL(`https://store.steampowered.com/curator/${id}/ajaxgetfilteredrecommendations/?query&start=0&count=10&dynamic_data=&sort=recent&app_types=&reset=false&curations=&tagids=`);
		for (const [key, value] of params) if (["curations", "tagids"].includes(key)) url.searchParams.set(key, value || "");
		const $ = load((await rofetch(url.href)).results_html ?? "");
		const items = $(".recommendation").toArray().map((item) => {
			const el = $(item);
			const appImageEl = el.find("a.store_capsule img");
			const appTitle = appImageEl.attr("alt");
			const appImage = appImageEl.attr("src") ?? "";
			const appLink = el.find(".recommendation_link").first().attr("href");
			const reviewContent = el.find(".recommendation_desc").text().trim();
			const reviewDateText = el.find(".curator_review_date").text().trim();
			const reviewPubDate = /,\s\d{4}$/.test(reviewDateText) ? parseDate(reviewDateText) : parseDate(`${reviewDateText}, ${(/* @__PURE__ */ new Date()).getFullYear()}`);
			return {
				title: appTitle,
				link: appLink,
				description: renderToString(/* @__PURE__ */ jsx(SteamCuratorDescription, {
					image: appImage,
					description: reviewContent
				})),
				pubDate: reviewPubDate,
				media: { content: {
					url: appImage,
					medium: "image"
				} }
			};
		});
		return {
			title: `Steam Curator ${id} Reviews`,
			link: url.href,
			item: items
		};
	}
};
const SteamCuratorDescription = ({ image, description }) => /* @__PURE__ */ jsxs(Fragment, { children: [image ? /* @__PURE__ */ jsx("img", { src: image }) : null, /* @__PURE__ */ jsx("p", { children: description })] });
//#endregion
export { route };
