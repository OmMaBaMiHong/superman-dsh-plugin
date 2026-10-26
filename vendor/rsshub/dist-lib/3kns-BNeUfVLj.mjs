import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/3kns/index.tsx
const route = {
	path: "/:filters?/:order?",
	categories: ["game"],
	example: "/3kns/category=all&lang=all",
	parameters: {
		filters: "过滤器，可用参数见下表",
		order: "排序，按高分排序:desc;按低分排序:asc"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "3k-Switch游戏库",
	maintainers: ["xzzpig"],
	handler,
	url: "www.3kns.com/",
	description: `游戏类型 (category)

| 不限 | 角色扮演 | 动作冒险 | 策略游戏 | 模拟经营 | 即时战略 | 格斗类 | 射击游戏 | 休闲益智 | 体育运动 | 街机格斗 | 无双类 | 其他游戏 | 赛车竞速 |
| ---- | -------- | -------- | -------- | -------- | -------- | ------ | -------- | -------- | -------- | -------- | ------ | -------- | -------- |
| all  | 1        | 2        | 3        | 4        | 5        | 6      | 7        | 8        | 9        | 10       | 11     | 12       | 13       |

游戏语言 (language)

| 不限 | 中文 | 英语 | 日语 | 其他 | 中文汉化 | 德语 |
| ---- | ---- | ---- | ---- | ---- | -------- | ---- |
| all  | 1    | 2    | 3    | 4    | 5        | 6    |

游戏标签 (tag)

| 不限 | 热门 | 多人聚会 | 僵尸 | 体感 | 大作 | 音乐 | 三国 | RPG | 格斗 | 闯关 | 横版 | 科幻 | 棋牌 | 运输 | 无双 | 卡通动漫 | 日系 | 养成 | 恐怖 | 运动 | 乙女 | 街机 | 飞行模拟 | 解谜 | 海战 | 战争 | 跑酷 | 即时策略 | 射击 | 经营 | 益智 | 沙盒 | 模拟 | 冒险 | 竞速 | 休闲 | 动作 | 生存 | 独立 | 拼图 | 魔改 xci | 卡牌 | 塔防 |
| ---- | ---- | -------- | ---- | ---- | ---- | ---- | ---- | --- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | -------- | ---- | ---- | ---- | ---- | ---- | ---- | -------- | ---- | ---- | ---- | ---- | -------- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | -------- | ---- | ---- |
| all  | 1    | 2        | 3    | 4    | 5    | 6    | 7    | 8   | 9    | 10   | 11   | 12   | 13   | 14   | 15   | 16       | 17   | 18   | 19   | 20   | 21   | 22   | 23       | 24   | 25   | 26   | 27   | 28       | 29   | 30   | 31   | 32   | 33   | 34   | 35   | 36   | 37   | 38   | 39   | 40   | 41       | 42   | 43   |

发售时间 (pubDate)

| 不限 | 2017 年 | 2018 年 | 2019 年 | 2020 年 | 2021 年 | 2022 年 | 2023 年 | 2024 年 |
| ---- | ------- | ------- | ------- | ------- | ------- | ------- | ------- | ------- |
| all  | 1       | 2       | 3       | 4       | 5       | 6       | 7       | 8       |

游戏集合 (collection)

| 不限 | 舞力全开 | 马里奥 | 生化危机 | 炼金工房 | 最终幻想 | 塞尔达 | 宝可梦 | 勇者斗恶龙 | 模拟器 | 秋之回忆 | 第一方 | 体感健身 | 开放世界 | 儿童乐园 |
| ---- | -------- | ------ | -------- | -------- | -------- | ------ | ------ | ---------- | ------ | -------- | ------ | -------- | -------- | -------- |
| all  | 1        | 2      | 3        | 4        | 5        | 6      | 7      | 8          | 9      | 10       | 11     | 12       | 13       | 14       |`
};
async function handler(ctx) {
	const filters = new URLSearchParams(ctx.req.param("filters"));
	const order = ctx.req.param("order");
	const category = filters.get("category") ?? "all";
	const language = filters.get("language") ?? "all";
	const tag = filters.get("tag") ?? "all";
	const pubDate = filters.get("pubDate") ?? "all";
	const collection = filters.get("collection") ?? "all";
	const baseUrl = "https://www.3kns.com/";
	const currentUrl = new URL(`${baseUrl}forum.php?mod=forumdisplay&fid=2&filter=sortid&typeid=0&sortid=1&searchsort=1&orderbystr=0`);
	currentUrl.searchParams.set("dztgeshi", category);
	currentUrl.searchParams.set("dztfenlei", language);
	currentUrl.searchParams.set("nex_sg_tags", tag);
	currentUrl.searchParams.set("deanbgbs", pubDate);
	currentUrl.searchParams.set("nex_sg_stars", collection);
	if (order !== void 0) {
		currentUrl.searchParams.set("ascdescstr", order);
		currentUrl.searchParams.set("orderbystr", "nex_sg_score");
	}
	const $ = load((await got_default(currentUrl)).data);
	const items = $("form .newItem").toArray().map((item) => {
		const $item = $(item);
		const title = $item.find(".showname a").text().trim();
		const category = $item.find(".showtype").text().trim();
		const pubDate = $item.find(".showdate").contents()[0].data.trim();
		return {
			title,
			link: baseUrl + $item.find(".entry-media a").attr("href"),
			pubDate: parseDate(pubDate ?? ""),
			category: [category],
			description: renderToString(/* @__PURE__ */ jsx(ThreeKnsDescription, {
				cover: $item.find(".entry-media img").attr("src")?.trim().replace(".", () => baseUrl),
				title,
				tid: $item.find(".jb-chakan").text().trim(),
				category,
				language: $item.find(".jb-new").text().trim(),
				pubDate,
				system: $item.find(".jb-youxxx").text().trim(),
				score: $item.find(".shownamep").text().trim(),
				version: $item.find(".jb-youxbb").text().trim()
			})) ?? ""
		};
	});
	return {
		title: $("title").text(),
		link: currentUrl.href,
		allowEmpty: true,
		item: items
	};
}
const ThreeKnsDescription = ({ cover, title, tid, category, language, pubDate, system, score, version }) => /* @__PURE__ */ jsxs(Fragment, { children: [
	/* @__PURE__ */ jsx("img", { src: cover }),
	/* @__PURE__ */ jsx("h1", { children: title }),
	/* @__PURE__ */ jsxs("p", { children: ["游戏TID：", tid] }),
	/* @__PURE__ */ jsxs("p", { children: ["类型：", category] }),
	/* @__PURE__ */ jsxs("p", { children: ["语言：", language] }),
	/* @__PURE__ */ jsxs("p", { children: ["更新日期：", pubDate] }),
	/* @__PURE__ */ jsxs("p", { children: ["系统要求：", system] }),
	/* @__PURE__ */ jsx("p", { children: score }),
	/* @__PURE__ */ jsxs("p", { children: ["游戏版本：", version] })
] });
//#endregion
export { route };
