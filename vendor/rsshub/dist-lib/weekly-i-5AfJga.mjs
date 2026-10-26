import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/bandcamp/weekly.tsx
const route = {
	path: "/weekly",
	categories: ["multimedia"],
	example: "/bandcamp/weekly",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["bandcamp.com/"] }],
	name: "Weekly",
	maintainers: ["nczitzk"],
	handler,
	url: "bandcamp.com/"
};
async function handler() {
	const rootUrl = "https://bandcamp.com";
	return {
		title: "Bandcamp Weekly",
		link: rootUrl,
		item: (await got_default({
			method: "get",
			url: `${rootUrl}/api/bcweekly/3/list`
		})).data.results.slice(0, 50).map((item) => ({
			title: item.title,
			link: `${rootUrl}/?show=${item.id}`,
			pubDate: parseDate(item.published_date),
			description: renderToString(/* @__PURE__ */ jsx(BandcampWeekly, {
				v2ImageId: item.v2_image_id,
				desc: item.desc
			}))
		}))
	};
}
const BandcampWeekly = ({ v2ImageId, desc }) => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: `https://f4.bcbits.com/img/00${v2ImageId}_0` }), /* @__PURE__ */ jsx("p", { children: desc })] });
//#endregion
export { route };
