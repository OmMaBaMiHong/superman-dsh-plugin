import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/cngal/entry.tsx
const route = {
	path: "/entry/:id",
	categories: ["anime"],
	example: "/cngal/entry/2693",
	parameters: { id: "词条ID，游戏或制作者页面URL的最后一串数字" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.cngal.org/entries/index/:id"] }],
	name: "制作者 / 游戏新闻",
	maintainers: ["kmod-midori"],
	handler
};
async function handler(ctx) {
	const entryId = ctx.req.param("id");
	const response = await got_default(`https://api.cngal.org/api/entries/GetEntryView/${entryId}`);
	const data = response.data;
	ctx.set("json", response.data);
	return {
		title: `CnGal - ${data.name} 的动态`,
		link: `https://www.cngal.org/entries/index/${entryId}`,
		item: data.newsOfEntry.map((item) => ({
			title: item.title,
			description: renderDescription(item),
			pubDate: timezone(parseDate(item.happenedTime), 8),
			link: item.link
		}))
	};
}
const renderDescription = (item) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("p", { children: item.briefIntroduction }), item.image ? /* @__PURE__ */ jsx("img", { src: item.image }) : null] }));
//#endregion
export { route };
