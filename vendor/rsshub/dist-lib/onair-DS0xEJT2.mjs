import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/bgmlist/onair.tsx
const route = {
	path: "/onair/:lang?",
	categories: ["anime"],
	example: "/bgmlist/onair/zh-Hans",
	parameters: { lang: "语言" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "开播提醒",
	maintainers: ["x2cf"],
	handler
};
async function handler(ctx) {
	const lang = ctx.req.param("lang");
	const { data: sites } = await got_default("https://bgmlist.com/api/v1/bangumi/site");
	const { data } = await got_default("https://bgmlist.com/api/v1/bangumi/onair");
	return {
		title: "番组放送 开播提醒",
		link: "https://bgmlist.com/",
		item: data.items.map((item) => {
			item.sites.push({
				site: "dmhy",
				id: item.titleTranslate["zh-Hans"]?.[0] ?? item.title
			});
			const mappedSites = item.sites.map((site) => ({
				title: sites[site.site].title,
				url: sites[site.site].urlTemplate.replaceAll("{{id}}", () => site.id),
				begin: site.begin
			}));
			return {
				title: item.titleTranslate[lang]?.[0] ?? item.title,
				link: item.officialSite,
				description: renderToString(/* @__PURE__ */ jsx(Fragment, { children: mappedSites.map((site) => /* @__PURE__ */ jsxs(Fragment, { children: [
					/* @__PURE__ */ jsx("a", {
						href: site.url,
						children: site.title
					}),
					site.begin ? /* @__PURE__ */ jsxs(Fragment, { children: [
						"（开播时间：",
						site.begin,
						"）"
					] }) : null,
					/* @__PURE__ */ jsx("br", {})
				] })) })),
				pubDate: parseDate(item.begin),
				guid: item.id
			};
		})
	};
}
//#endregion
export { route };
