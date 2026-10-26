import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration.js";
import { Fragment, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import localizedFormat from "dayjs/plugin/localizedFormat.js";
import "dayjs/locale/zh-cn.js";
import relativeTime from "dayjs/plugin/relativeTime.js";
//#region lib/routes/codeforces/contests.tsx
dayjs.extend(localizedFormat);
dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.locale("zh-cn");
const sec2str = (sec) => dayjs.duration(Number.parseInt(sec), "seconds").humanize();
const contestAPI = "https://codeforces.com/api/contest.list";
const route = {
	path: "/contests",
	categories: ["programming"],
	example: "/codeforces/contests",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.codeforces.com/contests"] }],
	name: "Latest contests",
	maintainers: ["Fatpandac"],
	handler,
	url: "www.codeforces.com/contests"
};
async function handler() {
	return {
		title: "Codeforces - Contests",
		link: "https://codeforces.com/contests",
		item: (await rofetch(contestAPI)).result.filter((contests) => contests.phase === "BEFORE").map((contest) => {
			const title = String(contest.name);
			const date = dayjs.unix(Number.parseInt(contest.startTimeSeconds));
			return {
				title,
				description: renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
					/* @__PURE__ */ jsxs("p", { children: ["比赛：", title] }),
					/* @__PURE__ */ jsxs("p", { children: ["开始时间：", date.format("LL LT")] }),
					/* @__PURE__ */ jsxs("p", { children: ["持续时间：", sec2str(contest.durationSeconds)] }),
					/* @__PURE__ */ jsxs("p", { children: ["比赛类型：", contest.type] })
				] })),
				link: "https://codeforces.com/contests/" + contest.id
			};
		})
	};
}
//#endregion
export { route };
