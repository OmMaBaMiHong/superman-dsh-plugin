import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import dayjs from "dayjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/stdaily/digitalpaper.tsx
const SITE_ID = "811c18b08cf04e79be3b67d6902ee1a7";
const CODE = "KJRB";
const API_HOST = "https://epaper.stdaily.com/stdailynewspaperapi";
const route = {
	path: "/digitalpaper",
	categories: ["traditional-media"],
	example: "/stdaily/digitalpaper",
	name: "科技日报",
	maintainers: ["lyqluis", "KarasuShin"],
	handler,
	features: { supportRadar: true },
	radar: [{
		source: ["epaper.stdaily.com/statics/technology-site/index.html"],
		target: "/digitalpaper"
	}]
};
async function handler() {
	const lastDate = (await rofetch(`${API_HOST}/uv/article/period/date`, {
		method: "POST",
		body: {
			code: CODE,
			date: dayjs(/* @__PURE__ */ new Date(), "YYYY-MM-01")
		},
		headers: { "X-Requested-With": "XMLHttpRequest" }
	})).obj.dateList.toSorted((a, b) => a.localeCompare(b)).at(-1);
	const sectionListResponse = await rofetch(`${API_HOST}/uv/article/period/periodTime`, {
		method: "POST",
		body: {
			code: CODE,
			periodTime: lastDate,
			siteId: SITE_ID
		},
		headers: { "X-Requested-With": "XMLHttpRequest" }
	});
	return {
		title: "中国科技网 - 科技日报",
		link: "https://epaper.stdaily.com",
		item: (await Promise.all(sectionListResponse.obj.editionList.map((section) => cache_default.tryGet(`stdaily:epaper:${section.id}`, async () => {
			const { list } = await rofetch(`${API_HOST}/uv/article/article/editionId`, {
				method: "POST",
				body: {
					id: section.id,
					siteId: SITE_ID
				},
				headers: { "X-Requested-With": "XMLHttpRequest" }
			});
			return await Promise.all(list.map(async (article) => await cache_default.tryGet(`stddaily:epaper:article:${article.id}`, async () => {
				const { obj: { articleVo } } = await rofetch(`${API_HOST}/uv/article/article/articleId`, {
					method: "POST",
					body: {
						code: CODE,
						id: article.id,
						siteId: SITE_ID
					},
					headers: { "X-Requested-With": "XMLHttpRequest" }
				});
				return {
					title: `${articleVo.editionName.match(/：(.*)/)?.[1]} - ${load(articleVo.title).text()}`,
					description: renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
						articleVo.subtitle ? /* @__PURE__ */ jsx("h3", { children: articleVo.subtitle }) : null,
						articleVo.picList?.length ? articleVo.picList.map((pic) => /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("img", { src: pic.url }), pic.picText ? /* @__PURE__ */ jsx("p", { children: pic.picText }) : null] })) : null,
						articleVo.content ? raw(articleVo.content) : null
					] })),
					pubDate: timezone(parseDate(articleVo.periodTime), 8),
					author: articleVo.author,
					link: `https://epaper.stdaily.com/statics/technology-site/index.html#/home?isDetail=1&currentNewsId=${article.id}&currentVersionName=${articleVo.editionName}&currentVersion=${Number(section.editionCode)}&timeValue=${articleVo.periodTime}`
				};
			})));
		})))).flat(),
		image: "https://www.stdaily.com/favicon.ico"
	};
}
//#endregion
export { route };
