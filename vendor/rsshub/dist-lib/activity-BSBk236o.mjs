import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/sjtu/tongqu/activity.tsx
const urlRoot = "https://tongqu.sjtu.edu.cn";
const route = {
	path: "/tongqu/:type?",
	categories: ["university"],
	example: "/sjtu/tongqu/lecture",
	parameters: { type: "类型，默认为全部" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "同去网最新活动",
	maintainers: ["SeanChao"],
	handler,
	description: `| 全部 | 最新   | 招新        | 讲座    | 户外      | 招聘 | 游学       | 比赛         | 公益           | 主题党日 | 学生事务       | 广告 | 其他   |
| ---- | ------ | ----------- | ------- | --------- | ---- | ---------- | ------------ | -------------- | -------- | -------------- | ---- | ------ |
| all  | newest | recruitment | lecture | outdoords | jobs | studyTours | competitions | publicWarefare | partyDay | studentAffairs | ads  | others |`
};
async function handler(ctx) {
	const type = ctx.req.param("type") || "all";
	const link = `${urlRoot}/api/act/type?type=${{
		all: 0,
		newest: -1,
		recruitment: 9,
		lecture: 2,
		outdoors: 10,
		jobs: 4,
		studyTours: 5,
		competitions: 7,
		publicWarefare: 11,
		partyDay: 13,
		studentAffairs: 14,
		ads: 12,
		others: 8
	}[type]}&status=0&offset=0&offset=0&number=10&order=act.create_time&desc=true`;
	return {
		title: "同去网活动",
		link,
		item: (await got_default(link)).data.result.acts.map((e) => ({
			title: e.name,
			link: new URL(`/act/${e.actid}`, urlRoot).href,
			category: e.typename,
			description: renderDescription(e)
		}))
	};
}
const renderDescription = (e) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	e.name,
	/* @__PURE__ */ jsx("br", {}),
	"开始时间: ",
	e.sign_start_time,
	/* @__PURE__ */ jsx("br", {}),
	"结束时间: ",
	e.sign_end_time,
	/* @__PURE__ */ jsx("br", {}),
	"地点: ",
	e.location,
	/* @__PURE__ */ jsx("br", {}),
	"报名人数: ",
	e.member_count,
	"/",
	e.max_member,
	/* @__PURE__ */ jsx("br", {}),
	"来自",
	e.source
] }));
//#endregion
export { route };
