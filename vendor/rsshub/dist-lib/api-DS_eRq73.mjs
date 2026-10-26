import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/sdo/ff14risingstones/constant.ts
const REQUIRE_CONFIG = [{
	name: "SDO_FF14RISINGSTONES",
	description: "值为 Cookie 头中 ff14risingstones 值"
}, {
	name: "SDO_UA",
	description: "值为与在网页端获取 Cookie 时相匹配的 User-Agent 值"
}];
const API_URL = "https://apiff14risingstones.web.sdo.com/api";
const ORIGIN = "https://ff14risingstones.web.sdo.com";
const INDEX_URL = `${ORIGIN}/pc/index.html`;
const LOGO_URL = `${ORIGIN}/pc/favicon.ico`;
const PLAY_STYLE = {
	"2": "采矿/园艺",
	"3": "成就收集",
	"4": "大型任务",
	"5": "钓鱼",
	"6": "多玛方城战",
	"7": "房屋",
	"8": "怪物狩猎",
	"9": "集体动作",
	"10": "角色扮演",
	"11": "金碟游乐场",
	"18": "练级",
	"19": "休闲玩家",
	"20": "硬核玩家",
	"21": "主线",
	"22": "赚钱",
	"23": "武具投影",
	"26": "乐器演奏",
	"28": "聊天",
	"29": "玩家自办活动",
	"30": "迷宫挑战",
	"31": "讨伐歼灭战",
	"32": "玩家对战",
	"33": "随机任务",
	"34": "寻宝",
	"35": "特殊迷宫探索",
	"36": "特殊地图探索",
	"37": "青魔法师",
	"38": "开拓无人岛",
	"39": "制作",
	"41": "绝境战",
	"42": "深层迷宫挑战"
};
const JOB = {
	"1": "防护职业",
	"3": "进攻职业",
	"5": "治疗职业",
	"6": "骑士",
	"7": "战士",
	"8": "暗黑骑士",
	"9": "绝枪战士",
	"10": "白魔法师",
	"11": "占星术士",
	"12": "学者",
	"13": "贤者",
	"14": "武僧",
	"15": "龙骑士",
	"16": "忍者",
	"17": "武士",
	"18": "钐镰客",
	"19": "吟游诗人",
	"20": "机工士",
	"21": "舞者",
	"22": "黑魔法师",
	"23": "召唤师",
	"24": "赤魔法师",
	"25": "青魔法师",
	"28": "近战职业",
	"29": "远程物理",
	"30": "远程魔法",
	"32": "任意职业",
	"33": "蝰蛇剑士",
	"34": "绘灵法师"
};
const POST_PART = [
	{
		value: "34",
		label: "冒险者行会"
	},
	{
		value: "52",
		label: "生活杂谈"
	},
	{
		value: "38",
		label: "同人创作"
	},
	{
		value: "36",
		label: "剧情讨论"
	},
	{
		value: "51",
		label: "建议和BUG反馈"
	},
	{
		value: "37",
		label: "游戏记录"
	},
	{
		value: "35",
		label: "举手提问"
	},
	{
		value: "74",
		label: "版务专区"
	},
	{
		value: "75",
		label: "官方讯息"
	}
];
const STRAT_PART = [
	{
		label: "新手指引",
		value: "1"
	},
	{
		label: "副本攻略",
		value: "2"
	},
	{
		label: "战斗职业",
		value: "3"
	},
	{
		label: "PVP",
		value: "4"
	},
	{
		label: "生产采集",
		value: "5"
	},
	{
		label: "投影外观",
		value: "6"
	},
	{
		label: "房屋装修",
		value: "7"
	},
	{
		label: "骑士",
		value: "8"
	},
	{
		label: "武僧",
		value: "9"
	},
	{
		label: "战士",
		value: "10"
	},
	{
		label: "龙骑士",
		value: "11"
	},
	{
		label: "吟游诗人",
		value: "12"
	},
	{
		label: "白魔法师",
		value: "13"
	},
	{
		label: "黑魔法师",
		value: "14"
	},
	{
		label: "召唤师",
		value: "15"
	},
	{
		label: "学者",
		value: "16"
	},
	{
		label: "忍者",
		value: "17"
	},
	{
		label: "机工士",
		value: "18"
	},
	{
		label: "暗黑骑士",
		value: "19"
	},
	{
		label: "占星术士",
		value: "20"
	},
	{
		label: "武士",
		value: "21"
	},
	{
		label: "赤魔法师",
		value: "22"
	},
	{
		label: "青魔法师",
		value: "23"
	},
	{
		label: "绝枪战士",
		value: "24"
	},
	{
		label: "舞者",
		value: "25"
	},
	{
		label: "钐镰客",
		value: "26"
	},
	{
		label: "贤者",
		value: "27"
	},
	{
		label: "猫魅族",
		value: "28"
	},
	{
		label: "拉拉菲尔族",
		value: "29"
	},
	{
		label: "人族",
		value: "30"
	},
	{
		label: "精灵族",
		value: "31"
	},
	{
		label: "维埃拉族",
		value: "32"
	},
	{
		label: "敖龙族",
		value: "59"
	},
	{
		label: "硌狮族",
		value: "60"
	},
	{
		label: "鲁加族",
		value: "61"
	},
	{
		label: "无人岛",
		value: "62"
	},
	{
		label: "特殊场景探索",
		value: "63"
	},
	{
		label: "游戏资讯",
		value: "64"
	},
	{
		label: "内容考据",
		value: "65"
	},
	{
		label: "摄影截图",
		value: "66"
	},
	{
		label: "金碟游乐场",
		value: "67"
	},
	{
		label: "综合",
		value: "68"
	},
	{
		label: "其他",
		value: "69"
	},
	{
		label: "国际服资讯翻译",
		value: "70"
	},
	{
		label: "游戏资讯整理",
		value: "71"
	},
	{
		label: "其他",
		value: "72"
	}
];
const POST_TYPE = {
	top: "置顶",
	refine: "精华",
	hot: "周热门"
};
//#endregion
//#region lib/routes/sdo/ff14risingstones/utils.tsx
const renderNoviceNetworkParty = ({ detail_mask, weekday_time, weekend_time, styles, target }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [detail_mask ? raw(detail_mask) : null, /* @__PURE__ */ jsxs("div", { children: [
	weekday_time && weekend_time ? /* @__PURE__ */ jsxs("p", { children: [
		"活跃时间：工作日\xA0",
		weekday_time,
		"\xA0\xA0\xA0\xA0休息日\xA0",
		weekend_time
	] }) : null,
	/* @__PURE__ */ jsxs("p", { children: ["游戏风格：", styles] }),
	/* @__PURE__ */ jsxs("p", { children: ["招募区服：", target] })
] })] }));
const renderDutiesParty = ({ progress, strategy, fb_time, labelInfo, team_composition, team_position, MT, ST, T, H, H1, H2, D1, D2, D3, D4, need_job, team_detail_mask, recruit_require_mask, strategy_desc_mask }) => renderToString(/* @__PURE__ */ jsxs("div", { children: [
	/* @__PURE__ */ jsxs("p", { children: ["进度：", progress] }),
	/* @__PURE__ */ jsxs("p", { children: ["攻略：", strategy] }),
	/* @__PURE__ */ jsxs("p", { children: ["时间：", fb_time] }),
	/* @__PURE__ */ jsxs("p", { children: ["标签：", labelInfo.map((i) => i.name).join("，")] }),
	team_composition === "团队" ? /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("p", { children: "队伍构成" }),
		/* @__PURE__ */ jsxs("p", { children: ["A队：", team_position.A] }),
		/* @__PURE__ */ jsxs("p", { children: ["B队：", team_position.B] }),
		/* @__PURE__ */ jsxs("p", { children: ["C队：", team_position.C] })
	] }) : null,
	team_composition === "满编小队" ? /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("p", { children: "队伍构成" }),
		/* @__PURE__ */ jsxs("p", { children: ["MT：", MT] }),
		/* @__PURE__ */ jsxs("p", { children: ["ST：", ST] }),
		/* @__PURE__ */ jsxs("p", { children: ["H1：", H1] }),
		/* @__PURE__ */ jsxs("p", { children: ["H2：", H2] }),
		/* @__PURE__ */ jsxs("p", { children: ["D1：", D1] }),
		/* @__PURE__ */ jsxs("p", { children: ["D2：", D2] }),
		/* @__PURE__ */ jsxs("p", { children: ["D3：", D3] }),
		/* @__PURE__ */ jsxs("p", { children: ["D4：", D4] })
	] }) : null,
	team_composition === "轻锐小队" ? /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("p", { children: "队伍构成" }),
		/* @__PURE__ */ jsxs("p", { children: ["T：", T] }),
		/* @__PURE__ */ jsxs("p", { children: ["H：", H] }),
		/* @__PURE__ */ jsxs("p", { children: ["D1：", D1] }),
		/* @__PURE__ */ jsxs("p", { children: ["D2：", D2] })
	] }) : null,
	need_job ? /* @__PURE__ */ jsxs("p", { children: ["需求职业：", need_job] }) : null,
	team_detail_mask ? /* @__PURE__ */ jsxs("p", { children: ["队伍详情：", team_detail_mask] }) : null,
	recruit_require_mask ? /* @__PURE__ */ jsxs("p", { children: ["招募要求：", recruit_require_mask] }) : null,
	strategy_desc_mask ? /* @__PURE__ */ jsxs("p", { children: ["攻略说明：", strategy_desc_mask] }) : null
] }));
const renderFreeCompanyParty = ({ cover_pic, guild_name, guild_tag, area_name, group_name, active_member_num, target_recruit_num, weekday_time, weekend_time, guild_address, create_time, labelInfo, detail_mask, foot_pic }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	cover_pic ? /* @__PURE__ */ jsx("img", { src: cover_pic }) : null,
	/* @__PURE__ */ jsxs("p", { children: [
		"部队名称：",
		guild_name,
		" <",
		guild_tag,
		">"
	] }),
	/* @__PURE__ */ jsxs("p", { children: [
		"区服：",
		area_name,
		" ",
		group_name
	] }),
	/* @__PURE__ */ jsxs("p", { children: ["活跃成员：", active_member_num] }),
	/* @__PURE__ */ jsxs("p", { children: ["招募人数：", target_recruit_num] }),
	/* @__PURE__ */ jsxs("p", { children: [
		"活跃时间：工作日\xA0",
		weekday_time,
		"\xA0\xA0\xA0\xA0休息日\xA0",
		weekend_time
	] }),
	guild_address ? /* @__PURE__ */ jsxs("p", { children: ["部队地址：", guild_address] }) : null,
	create_time ? /* @__PURE__ */ jsxs("p", { children: ["成立时间：", create_time] }) : null,
	/* @__PURE__ */ jsxs("p", { children: ["部队标签：", labelInfo.map((i) => i.name).join("，")] }),
	/* @__PURE__ */ jsx("div", { children: detail_mask ? raw(detail_mask) : null }),
	foot_pic ? foot_pic.split(",").map((url) => /* @__PURE__ */ jsx("img", { src: url })) : null
] }));
const renderRolePlayParty = ({ cover_pic, open_time, rp_type, create_time, area, address, custom_label, profile, detail_mask }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	cover_pic ? /* @__PURE__ */ jsx("img", { src: cover_pic }) : null,
	/* @__PURE__ */ jsxs("p", { children: ["开放时间：", open_time] }),
	/* @__PURE__ */ jsxs("p", { children: ["RP 类型：", rp_type] }),
	/* @__PURE__ */ jsxs("p", { children: ["创立时间：", create_time] }),
	/* @__PURE__ */ jsxs("p", { children: ["区服：", area] }),
	/* @__PURE__ */ jsxs("p", { children: ["地址：", address] }),
	/* @__PURE__ */ jsxs("p", { children: ["标签：", custom_label] }),
	/* @__PURE__ */ jsxs("p", { children: ["简介：", profile] }),
	/* @__PURE__ */ jsx("div", { children: detail_mask ? raw(detail_mask) : null })
] }));
function checkConfig() {
	if (!config.sdo.ff14risingstones || !config.sdo.ua) throw new ConfigNotFoundError("ff14risingstones RSS is disabled due to the lack of relevant config");
}
function request(url, options) {
	return rofetch(url, {
		...options,
		headers: {
			Cookie: `ff14risingstones=${config.sdo.ff14risingstones}`,
			"User-Agent": config.sdo.ua,
			...options?.headers
		}
	});
}
async function requestAPI(url, options) {
	const response = await request(url, options);
	if (response.code !== 1e4) throw new Error(response.msg);
	return response.data;
}
async function generatePostFeeds(posts) {
	return await Promise.all(posts.map(async (post) => {
		const detail = await getPostsDetail(post.posts_id);
		return {
			title: `[${post.part_name}] ${post.title}`,
			link: `${INDEX_URL}#/post/detail/${post.posts_id}`,
			description: detail?.contentInfo.content,
			pubDate: timezone(parseDate(post.created_at), 8),
			updated: detail?.updated_at ? timezone(parseDate(detail.updated_at), 8) : void 0,
			guid: `sdo/ff14risingstones/posts:${post.posts_id}`,
			author: `${post.character_name}@${post.group_name}`
		};
	}));
}
async function generateDynamicFeeds(dynamics) {
	return await Promise.all(dynamics.map(async (dynamic) => {
		let title = `${dynamic.character_name}@${dynamic.group_name} ${dynamic.mask_content}`;
		let link;
		let description;
		let detail;
		switch (dynamic.from) {
			case 2:
			case 3:
				if (!dynamic.from_info) break;
				title += dynamic.from_info.title;
				link = `${INDEX_URL}#/post/detail/${dynamic.from_info.posts_id}`;
				detail = await getPostsDetail(dynamic.from_info.posts_id);
				description = detail?.contentInfo.content;
				break;
			case 5:
				if (!dynamic.from_info) break;
				title += `[找${dynamic.from_info.identity === 1 ? "豆芽" : "导师"}] ${dynamic.from_info.title}`;
				link = `${INDEX_URL}#/recruit/beginner?id=${dynamic.from_info.id}`;
				detail = await getNoviceNetworkRecruitDetail(dynamic.from_info.id);
				description = renderNoviceNetworkParty({
					detail_mask: dynamic.from_info.detail_mask,
					styles: dynamic.from_info.style.map((i) => PLAY_STYLE[i]).join(","),
					target: `${dynamic.from_info.target_area_name} ${dynamic.from_info.target_group_name ?? "全区"}`,
					weekday_time: detail?.weekday_time,
					weekend_time: detail?.weekend_time
				});
				break;
			case 6:
				if (!dynamic.from_info) break;
				title += `[${dynamic.from_info.fb_type}] ${dynamic.from_info.fb_name}`;
				link = `${INDEX_URL}#/recruit/party?id=${dynamic.from_info.id}`;
				detail = await getDutiesRecruitDetail(dynamic.from_info.id);
				description = renderDutiesParty({
					progress: dynamic.from_info.progress,
					strategy: dynamic.from_info.strategy,
					fb_time: dynamic.from_info.fb_time,
					labelInfo: dynamic.from_info.labelInfo,
					team_composition: dynamic.from_info.team_composition,
					team_position: dynamic.from_info.team_position ? {
						A: Object.keys(dynamic.from_info.team_position.A).filter((i) => dynamic.from_info.team_position.A[i] !== "0").map((i) => `${i}: ${JOB[dynamic.from_info.team_position.A[i]]}`).join("，"),
						B: Object.keys(dynamic.from_info.team_position.B).filter((i) => dynamic.from_info.team_position.B[i] !== "0").map((i) => `${i}: ${JOB[dynamic.from_info.team_position.B[i]]}`).join("，"),
						C: Object.keys(dynamic.from_info.team_position.C).filter((i) => dynamic.from_info.team_position.C[i] !== "0").map((i) => `${i}: ${JOB[dynamic.from_info.team_position.C[i]]}`).join("，")
					} : null,
					MT: JOB[dynamic.from_info.MT],
					ST: JOB[dynamic.from_info.ST],
					T: JOB[dynamic.from_info.T],
					H: JOB[dynamic.from_info.H],
					H1: JOB[dynamic.from_info.H1],
					H2: JOB[dynamic.from_info.H2],
					D1: JOB[dynamic.from_info.D1],
					D2: JOB[dynamic.from_info.D2],
					D3: JOB[dynamic.from_info.D3],
					D4: JOB[dynamic.from_info.D4],
					need_job: detail?.need_job.map((i) => JOB[i]).join("，"),
					team_detail_mask: detail?.team_detail_mask,
					recruit_require_mask: detail?.recruit_require_mask,
					strategy_desc_mask: detail?.strategy_desc_mask
				});
				break;
			case 7:
				if (!dynamic.from_info) break;
				title += `[部队招待] ${dynamic.from_info.guild_name} <${dynamic.from_info.guild_tag}>`;
				link = `${INDEX_URL}#/recruit/guild/detail/${dynamic.from_info.id}`;
				detail = await getFreeCompanyRecruitDetail(dynamic.from_info.id);
				description = renderFreeCompanyParty({
					cover_pic: dynamic.from_info.cover_pic,
					guild_name: dynamic.from_info.guild_name,
					guild_tag: dynamic.from_info.guild_tag,
					labelInfo: dynamic.from_info.labelInfo,
					area_name: dynamic.from_info.target_area_name,
					group_name: dynamic.from_info.target_group_name,
					active_member_num: dynamic.from_info.active_member_num,
					target_recruit_num: dynamic.from_info.target_recruit_num,
					weekday_time: dynamic.from_info.weekday_time,
					weekend_time: dynamic.from_info.weekend_time,
					guild_address: detail?.guild_address ?? "",
					create_time: detail?.create_time ?? "",
					foot_pic: detail?.foot_pic ?? "",
					detail_mask: dynamic.from_info.detail_mask
				});
				break;
			case 8:
				if (!dynamic.from_info) break;
				title += dynamic.from_info.rp_name;
				link = `${INDEX_URL}#/recruit/roleplay/detail/${dynamic.from_info.id}`;
				description = renderRolePlayParty({
					cover_pic: dynamic.from_info.cover_pic,
					open_time: dynamic.from_info.open_time,
					rp_type: `${dynamic.from_info.rp_type.map((i) => ({
						"0": "无",
						"1": "轻",
						"2": "中",
						"3": "重"
					})[i]).join("/")}RP 元素`,
					create_time: dynamic.from_info.create_time,
					area: `${dynamic.from_info.rp_area_name} ${dynamic.from_info.rp_group_name}`,
					address: dynamic.from_info.address,
					custom_label: dynamic.from_info.custom_label,
					profile: dynamic.from_info.profile,
					detail_mask: dynamic.from_info.detail_mask
				});
				break;
			case 9:
				if (!dynamic.from_info) break;
				title += `[${dynamic.from_info.category_name}] ${dynamic.from_info.title}`;
				link = `${INDEX_URL}#/recruit/others?id=${dynamic.from_info.id}`;
				description = dynamic.from_info.detail_mask;
				break;
			default:
		}
		return {
			title,
			link,
			pubDate: timezone(parseDate(dynamic.created_at), 8),
			guid: `sdo/ff14risingstones/dynamics:${dynamic.id}`,
			author: `${dynamic.character_name}@${dynamic.group_name}`,
			description
		};
	}));
}
//#endregion
//#region lib/routes/sdo/ff14risingstones/api.ts
const getResently = async (uid) => await requestAPI(`${API_URL}/home/userInfo/getResently?uuid=${uid}`);
const getUserInfo = async (uid) => await requestAPI(`${API_URL}/home/userInfo/getUserInfo?uuid=${uid}`);
const getUserPosts = async (uid, type) => (await requestAPI(`${API_URL}/home/userInfo/getUserPosts?uuid=${uid}&type=${type}`)).rows;
const getUserDynamic = async (uid) => (await requestAPI(`${API_URL}/home/userInfo/getUserDynamic?uuid=${uid}`)).rows;
async function getPostsDetail(postID) {
	try {
		return await cache_default.tryGet(`sdo/ff14risingstones/post-detail:${postID}`, async () => await requestAPI(`${API_URL}/home/posts/postsDetail?id=${postID}`));
	} catch {
		return null;
	}
}
async function getNoviceNetworkRecruitDetail(recruitID) {
	try {
		return await cache_default.tryGet(`sdo/ff14risingstones/novice-network-recruit-detail:${recruitID}`, async () => await requestAPI(`${API_URL}/home/recruit/getNeDetail?id=${recruitID}`));
	} catch {
		return null;
	}
}
async function getDutiesRecruitDetail(recruitID) {
	try {
		return await cache_default.tryGet(`sdo/ff14risingstones/duties-recruit-detail:${recruitID}`, async () => await requestAPI(`${API_URL}/home/recruit/getRecruitFbDetail?id=${recruitID}`));
	} catch {
		return null;
	}
}
async function getFreeCompanyRecruitDetail(recruitID) {
	try {
		return await cache_default.tryGet(`sdo/ff14risingstones/free-company-recruit-detail:${recruitID}`, async () => await requestAPI(`${API_URL}/home/recruit/getRecruitGuildDetail?id=${recruitID}`));
	} catch {
		return null;
	}
}
async function getPosts(params) {
	const searchParams = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) if (value !== void 0) searchParams.set(key, value.toString());
	return (await requestAPI(`${API_URL}/home/posts/postsList?${searchParams.toString()}`)).rows;
}
const getFollowDynamicList = async (limit) => (await requestAPI(`${API_URL}/home/dynamic/getFollowDynamicList?limit=${limit}`)).rows;
//#endregion
export { getUserInfo as a, generateDynamicFeeds as c, LOGO_URL as d, POST_PART as f, STRAT_PART as h, getUserDynamic as i, generatePostFeeds as l, REQUIRE_CONFIG as m, getPosts as n, getUserPosts as o, POST_TYPE as p, getResently as r, checkConfig as s, getFollowDynamicList as t, INDEX_URL as u };
