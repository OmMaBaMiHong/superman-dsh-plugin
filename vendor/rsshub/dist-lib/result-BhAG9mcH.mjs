import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { JSDOM } from "jsdom";
//#region lib/routes/dongqiudi/result.ts
const route = {
	path: "/result/:team",
	categories: ["sport"],
	example: "/dongqiudi/result/50001755",
	parameters: { team: "球队 id, 可在[懂球帝数据](https://www.dongqiudi.com/data)中找到" },
	radar: [{
		source: ["www.dongqiudi.com/team/*team"],
		target: (params) => `/dongqiudi/result/${params.team.replace(".html", "")}`
	}],
	name: "足球赛果",
	maintainers: ["HenryQW"],
	handler
};
async function handler(ctx) {
	const link = `https://www.dongqiudi.com/team/${ctx.req.param("team")}.html`;
	const data = new JSDOM((await got_default(link)).data, { runScripts: "dangerously" }).window.__NUXT__.data[0];
	const resultData = data.teamScheduleData.filter((data) => data.fs_A && data.fs_B);
	const teamName = data.teamDetail.base_info.team_name;
	const out = resultData.map((result) => ({
		title: `${result.match_title} ${result.team_A_name} ${result.fs_A}-${result.fs_B} ${result.team_B_name}`,
		guid: result.match_id,
		link: result.scheme.replace("dongqiudi:///game/", "https://www.dongqiudi.com/liveDetail/"),
		pubDate: parseDate(result.start_time)
	}));
	return {
		title: `${teamName} 比赛结果`,
		link,
		item: out.slice(-10)
	};
}
//#endregion
export { route };
