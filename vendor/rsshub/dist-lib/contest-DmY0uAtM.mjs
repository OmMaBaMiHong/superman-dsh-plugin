import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { n as getNextBuildId, t as baseUrl } from "./utils-CzDMMvsQ.mjs";
//#region lib/routes/makerworld/contest.ts
const route = {
	path: "/contests",
	categories: ["design"],
	example: "/makerworld/contests",
	name: "Contests",
	maintainers: ["TonyRL"],
	handler,
	radar: [{ source: ["makerworld.com/:lang/contests"] }]
};
async function handler() {
	const { listConst, previewList } = (await rofetch(`${baseUrl}/_next/data/${await getNextBuildId()}/en/contests.json`, { headers: { "User-Agent": config.trueUA } })).pageProps;
	const items = [...listConst.map((c) => ({
		title: c.contestName,
		link: `${baseUrl}/en/contests/${c.id}?name=${c.contestName}`,
		description: c.themeDesc,
		pubDate: parseDate(c.startTime)
	})), ...previewList.map((p) => ({
		title: p.contestTheme,
		description: p.themeDesc,
		pubDate: parseDate(p.contestTime)
	}))];
	return {
		title: "Contest - MakerWorld",
		description: "Join the contest to showcase your creativity and win substantial rewards",
		link: `${baseUrl}/en/contests`,
		image: `${baseUrl}/favicon_new.png`,
		item: items
	};
}
//#endregion
export { route };
