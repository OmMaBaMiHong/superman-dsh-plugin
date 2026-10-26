import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/gofans/index.tsx
const route = {
	path: "/:kind?",
	categories: ["program-update"],
	example: "/gofans",
	parameters: { kind: "Platform, either `macos` or `ios`, empty means both (default)" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "最新限免 / 促销应用",
	maintainers: ["HenryQW"],
	handler
};
async function handler(ctx) {
	const { kind = "" } = ctx.req.param();
	const baseUrl = "https://gofans.cn";
	const { data: response } = await got_default("https://api.gofans.cn/v1/web/app_records", {
		headers: { origin: baseUrl },
		searchParams: {
			limit: 20,
			kind: kind && (kind === "macos" ? 1 : 2),
			page: 1
		}
	});
	return {
		title: "最新限免 / 促销应用",
		link: baseUrl,
		description: "GoFans：最新限免 / 促销应用",
		item: response.data.map((item) => ({
			title: `「${item.price === "0.00" ? "免费" : "降价"}」-「${item.kind === 1 ? "macOS" : "iOS"}」${item.name}`,
			description: renderToString(/* @__PURE__ */ jsx(GofansDescription, {
				icon: item.icon,
				originalPrice: item.original_price,
				price: item.price,
				kind: item.kind,
				description: item.description.replaceAll("\n", "<br>")
			})),
			pubDate: parseDate(item.updated_at, "X"),
			link: new URL(`/app/${item.uuid}`, baseUrl).href,
			category: item.primary_genre_name
		}))
	};
}
const GofansDescription = ({ icon, originalPrice, price, kind, description }) => /* @__PURE__ */ jsxs(Fragment, { children: [
	/* @__PURE__ */ jsx("img", { src: icon }),
	/* @__PURE__ */ jsx("br", {}),
	"原价：¥",
	originalPrice,
	" ",
	"->",
	" 现价：¥",
	price,
	/* @__PURE__ */ jsx("br", {}),
	"平台：",
	kind === 1 ? "macOS" : "iOS",
	/* @__PURE__ */ jsx("br", {}),
	raw(description)
] });
//#endregion
export { route };
