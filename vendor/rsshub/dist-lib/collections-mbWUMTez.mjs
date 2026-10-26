import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/bangumi.tv/user/collections.tsx
const getTypeNames = (subjectType) => {
	const commonTypeNames = {
		1: "想看",
		2: "看过",
		3: "在看",
		4: "搁置",
		5: "抛弃"
	};
	switch (subjectType) {
		case "1": return {
			1: "想读",
			2: "读过",
			3: "在读",
			4: "搁置",
			5: "抛弃"
		};
		case "2":
		case "6": return commonTypeNames;
		case "3": return {
			1: "想听",
			2: "听过",
			3: "在听",
			4: "搁置",
			5: "抛弃"
		};
		case "4": return {
			1: "想玩",
			2: "玩过",
			3: "在玩",
			4: "搁置",
			5: "抛弃"
		};
		default: return commonTypeNames;
	}
};
const renderSubjectDescription = (data) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	data.routeSubjectType === "all" && /* @__PURE__ */ jsxs(Fragment, { children: [
		"类型：",
		data.subjectTypeName,
		" ",
		/* @__PURE__ */ jsx("br", {})
	] }),
	data.subjectType === 2 && /* @__PURE__ */ jsxs(Fragment, { children: [
		"看到：",
		data.epStatus,
		" / ",
		data.subjectEps || "???",
		/* @__PURE__ */ jsx("br", {})
	] }),
	data.subjectType === 1 && /* @__PURE__ */ jsxs(Fragment, { children: [
		"读到：",
		data.epStatus,
		" / ",
		data.subjectEps || "???",
		/* @__PURE__ */ jsx("br", {})
	] }),
	"评分：",
	data.score,
	/* @__PURE__ */ jsx("br", {}),
	"放送时间：",
	data.date || "未知",
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsx("img", { src: data.picUrl })
] }));
const route = {
	path: "/user/collections/:id/:subjectType/:type",
	categories: ["anime"],
	example: "/bangumi.tv/user/collections/sai/1/1",
	parameters: {
		id: "用户 id, 在用户页面地址栏查看",
		subjectType: {
			description: "全部类别: `空`、book: `1`、anime: `2`、music: `3`、game: `4`、real: `6`",
			options: [
				{
					value: "ALL",
					label: "all"
				},
				{
					value: "book",
					label: "1"
				},
				{
					value: "anime",
					label: "2"
				},
				{
					value: "music",
					label: "3"
				},
				{
					value: "game",
					label: "4"
				},
				{
					value: "real",
					label: "6"
				}
			]
		},
		type: {
			description: "全部类别: `空`、想看: `1`、看过: `2`、在看: `3`、搁置: `4`、抛弃: `5`",
			options: [
				{
					value: "ALL",
					label: "all"
				},
				{
					value: "想看",
					label: "1"
				},
				{
					value: "看过",
					label: "2"
				},
				{
					value: "在看",
					label: "3"
				},
				{
					value: "搁置",
					label: "4"
				},
				{
					value: "抛弃",
					label: "5"
				}
			]
		}
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [
		{
			source: ["bgm.tv/anime/list/:id"],
			target: "/bangumi.tv/user/collections/:id/all/all"
		},
		{
			source: ["bangumi.tv/anime/list/:id"],
			target: "/bangumi.tv/user/collections/:id/all/all"
		},
		{
			source: ["bgm.tv/anime/list/:id/wish"],
			target: "/bangumi.tv/user/collections/:id/2/1"
		},
		{
			source: ["bangumi.tv/anime/list/:id/wish"],
			target: "/bangumi.tv/user/collections/:id/2/1"
		}
	],
	name: "Bangumi 用户收藏列表",
	maintainers: ["youyou-sudo", "honue"],
	handler
};
async function handler(ctx) {
	const userId = ctx.req.param("id");
	const subjectType = ctx.req.param("subjectType") || "";
	const type = ctx.req.param("type") || "";
	const subjectTypeNames = {
		1: "书籍",
		2: "动画",
		3: "音乐",
		4: "游戏",
		6: "三次元"
	};
	const typeName = getTypeNames(subjectType)[type] || "";
	const subjectTypeName = subjectTypeNames[subjectType] || "";
	let descriptionFields;
	if (typeName && subjectTypeName) descriptionFields = `${typeName}的${subjectTypeName}列表`;
	else if (typeName) descriptionFields = `${typeName}的列表`;
	else if (subjectTypeName) descriptionFields = `收藏的${subjectTypeName}列表`;
	else descriptionFields = "的Bangumi收藏列表";
	const userData = await rofetch(`https://api.bgm.tv/v0/users/${userId}`, { headers: { "User-Agent": config.trueUA } });
	const collectionData = await rofetch(`https://api.bgm.tv/v0/users/${userId}/collections?${subjectType && subjectType !== "all" ? `subject_type=${subjectType}` : ""}${type && type !== "all" ? `&type=${type}` : ""}`, { headers: { "User-Agent": config.trueUA } });
	const userNickname = userData.nickname;
	const items = collectionData.data.map((item) => {
		const titles = item.subject.name_cn || item.subject.name;
		const updateTime = item.updated_at;
		const subjectId = item.subject_id;
		return {
			title: `${type === "all" ? `${getTypeNames(item.subject_type)[item.type]}：` : ""}${titles}`,
			description: renderSubjectDescription({
				routeSubjectType: subjectType,
				subjectTypeName: subjectTypeNames[item.subject_type],
				subjectType: item.subject_type,
				subjectEps: item.subject.eps,
				epStatus: item.ep_status,
				score: item.subject.score,
				date: item.subject.date,
				picUrl: item.subject.images.large
			}),
			link: `https://bgm.tv/subject/${subjectId}`,
			pubDate: timezone(parseDate(updateTime), 0)
		};
	});
	return {
		title: `${userNickname}${descriptionFields}`,
		link: `https://bgm.tv/user/${userId}/collections`,
		item: items,
		description: `${userNickname}${descriptionFields}`
	};
}
//#endregion
export { route };
