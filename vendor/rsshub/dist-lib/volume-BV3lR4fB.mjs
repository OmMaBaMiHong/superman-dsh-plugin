import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import markdownit from "markdown-it";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/hellogithub/volume.tsx
const md = markdownit({ html: true });
const renderVolume = (data) => renderToString(/* @__PURE__ */ jsx(Fragment, { children: data?.map((category) => /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h1", { children: category.category_name }), category.items?.map((item) => /* @__PURE__ */ jsxs("div", { children: [
	/* @__PURE__ */ jsx("h2", { children: /* @__PURE__ */ jsx("a", {
		href: item.github_url,
		children: item.name
	}) }),
	/* @__PURE__ */ jsx("table", { children: /* @__PURE__ */ jsxs("tbody", { children: [
		/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "Stars" }), /* @__PURE__ */ jsx("td", { children: item.stars })] }),
		/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "Forks" }), /* @__PURE__ */ jsx("td", { children: item.forks })] }),
		/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "Watch" }), /* @__PURE__ */ jsx("td", { children: item.watch })] })
	] }) }),
	/* @__PURE__ */ jsx("p", { children: item.description ? raw(md.render(item.description)) : null }),
	item.image_url ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", { src: item.image_url }) }) : null
] }))] })) }));
const route = {
	path: "/volume",
	example: "/hellogithub/volume",
	name: "月刊",
	maintainers: [
		"moke8",
		"nczitzk",
		"CaoMeiYouRen"
	],
	handler
};
async function handler(ctx) {
	const limit = Number.parseInt(ctx.req.query("limit")) || 10;
	const rootUrl = "https://hellogithub.com";
	const volumes = (await got_default({
		method: "get",
		url: "https://api.hellogithub.com/v1/periodical/"
	})).data.volumes.slice(0, limit);
	return {
		title: "HelloGithub - 月刊",
		link: "https://hellogithub.com/periodical",
		item: await Promise.all(volumes.map(async (volume) => {
			const current = volume.num;
			const lastmod = volume.lastmod;
			const currentUrl = `${rootUrl}/periodical/volume/${current}`;
			const key = `hellogithub:${currentUrl}`;
			return await cache_default.tryGet(key, async () => {
				const text = load((await got_default({
					method: "get",
					url: currentUrl
				})).data)("#__NEXT_DATA__").text();
				const data = JSON.parse(text).props;
				const id = data.pageProps.volume.current_num;
				return {
					title: `《HelloGitHub》第 ${id} 期`,
					link: `${rootUrl}/periodical/volume/${id}`,
					description: renderVolume(data.pageProps.volume.data),
					pubDate: parseDate(lastmod)
				};
			}, config.cache.routeExpire, false);
		}))
	};
}
//#endregion
export { route };
