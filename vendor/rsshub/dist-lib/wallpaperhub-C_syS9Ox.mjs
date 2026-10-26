import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/wallpaperhub/index.tsx
const route = {
	path: "/",
	radar: [{
		source: ["wallpaperhub.app/wallpaperhub", "wallpaperhub.app/"],
		target: ""
	}],
	name: "Unknown",
	maintainers: ["nczitzk"],
	handler,
	url: "wallpaperhub.app/wallpaperhub"
};
async function handler() {
	return {
		title: "WallpaperHub",
		link: "https://wallpaperhub.app/wallpapers",
		item: (await got_default({
			method: "get",
			url: "https://wallpaperhub.app/api/v1/wallpapers/?limit=20&page=&query=&width=&height=&tags="
		})).data.entities.map((item) => ({
			title: item.entity.title,
			description: renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("p", { children: item.entity.description }), /* @__PURE__ */ jsx("img", { src: item.entity.variations[0].resolutions[0].url || item.entity.thumbnail })] })),
			pubDate: parseDate(item.entity.created),
			link: `https://wallpaperhub.app/wallpapers/${item.entity.id}`
		}))
	};
}
//#endregion
export { route };
