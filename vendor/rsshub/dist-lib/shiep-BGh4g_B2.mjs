import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import dayjs from "dayjs";
import { Fragment, jsx } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/shiep/config.ts
const config = {
	bwc: {
		title: "武装部保卫处",
		id: "tzgg"
	},
	career: {
		title: "本科就业信息网",
		id: "tzgg",
		listSelector: "ul.newsList",
		pubDateSelector: "li.span2.y",
		descriptionSelector: ".aContent"
	},
	cyb: {
		title: "资产经营公司/产业办",
		id: "367"
	},
	dangban: {
		title: "党委办公室",
		id: "4013"
	},
	djfwzxdcs: {
		title: "党建服务中心/党建督查室",
		id: "tzgg",
		listSelector: "li.news",
		pubDateSelector: "span.news_meta"
	},
	dqxy: {
		title: "电气工程学院",
		id: "2462"
	},
	dwllc: {
		title: "对外联络处",
		id: "2649"
	},
	dxxy: {
		title: "电子与信息工程学院",
		id: "tzgg",
		pubDateSelector: "div.article-publishdate"
	},
	energy: {
		title: "能源与机械工程学院",
		id: "892"
	},
	fao: {
		title: "国际交流与合作处（港澳台办公室）",
		id: "tzgg"
	},
	fzghc: {
		title: "发展规划处",
		id: "291"
	},
	gec: {
		title: "上海新能源人才技术教育交流中心",
		id: "1959"
	},
	gonghui: {
		title: "工会（妇工委）",
		id: "1806",
		listSelector: "table.wp_article_list_table tr",
		pubDateSelector: "td[align=\"right\"]"
	},
	"green-energy": {
		title: "上海绿色能源并网技术研究中心",
		id: "118"
	},
	hhxy: {
		title: "环境与化学工程学院",
		id: "5559",
		listSelector: "li.list-item",
		pubDateSelector: "div.item-publishdate"
	},
	hqglc: {
		title: "后勤管理处（后勤服务中心）",
		id: "1616"
	},
	hsfdyjy: {
		title: "海上风电研究院",
		id: "5748"
	},
	ieetc: {
		title: "创新创业工程训练中心",
		id: "cxcy",
		pubDateSelector: "div.article-publishdate"
	},
	jgdw: {
		title: "机关党委",
		id: "3205"
	},
	jgxy: {
		title: "经济与管理学院",
		id: "3633"
	},
	jijian: {
		title: "纪委（监察专员办公室）",
		id: "59"
	},
	jjc: {
		title: "基建处",
		id: "327"
	},
	jjxy: {
		title: "继续教育学院（国际教育学院）",
		id: "2582"
	},
	jsjxy: {
		title: "计算机科学与技术学院",
		id: "xygg",
		listSelector: "div.xylist",
		pubDateSelector: "span:nth-child(2)"
	},
	jszyzx: {
		title: "技术转移中心",
		id: "4247"
	},
	jwc: {
		title: "教务处",
		id: "227",
		listSelector: "div.text-list li",
		pubDateSelector: "span.time"
	},
	kczx: {
		title: "能源电力科创中心",
		id: "3946"
	},
	kyc: {
		title: "科研处/融合办",
		id: "834"
	},
	lgxq: {
		title: "临港新校区建设综合办公室",
		id: "377"
	},
	library: {
		title: "图书馆",
		id: "4866"
	},
	metc: {
		title: "现代教育技术中心/信息办",
		id: "tzgg",
		pubDateSelector: "div.article-publishdate"
	},
	news: {
		title: "新闻网",
		id: "notice"
	},
	nydlzk: {
		title: "能源电力智库",
		id: "tzgg"
	},
	office: {
		title: "校长办公室（档案馆）",
		id: "389"
	},
	rsc: {
		title: "党委教师工作部/人事处",
		id: "1695"
	},
	rwysxy: {
		title: "人文艺术学院",
		id: "3089",
		listSelector: "li.list-item",
		pubDateSelector: "div.item-publishdate"
	},
	sjc: {
		title: "审计处",
		id: "199"
	},
	skb: {
		title: "马克思主义学院",
		id: "1736"
	},
	slxy: {
		title: "数理学院",
		id: "2063"
	},
	spgc: {
		title: "智能发电实验教学中心",
		id: "4449"
	},
	sysyzcglc: {
		title: "实验室与资产管理处",
		id: "312"
	},
	tgb: {
		title: "离退休党委/退管办",
		id: "notice",
		pubDateSelector: "div.article-publishdate"
	},
	tw: {
		title: "团委",
		id: "2092"
	},
	tyb: {
		title: "体育学院",
		id: "2891",
		pubDateSelector: "div.article-publishdate"
	},
	tzb: {
		title: "统战部",
		id: "3858"
	},
	wenming: {
		title: "文明办",
		id: "2202"
	},
	wgyxy: {
		title: "外国语学院",
		id: "tzgg"
	},
	xcb: {
		title: "宣传部（文明办、融媒体中心）",
		id: "2925"
	},
	xsc: {
		title: "学生处",
		id: "3482"
	},
	xunchaban: {
		title: "巡查办",
		id: "5044"
	},
	xxgk: {
		title: "信息公开网",
		id: "zxgkxx"
	},
	xxjy: {
		title: "“学条例 守党纪”专题网",
		id: "5973",
		listSelector: "li.list-item",
		pubDateSelector: "div.item-publishdate"
	},
	yjsc: {
		title: "研究生院/研工部",
		id: "1161"
	},
	zdhxy: {
		title: "自动化工程学院",
		id: "2002"
	},
	zs: {
		title: "本科招生网",
		id: "zxxx"
	},
	ztjy: {
		title: "学习路上",
		id: "5575"
	},
	zzb: {
		title: "组织部（老干部处、党校）",
		id: "1534"
	}
};
//#endregion
//#region lib/routes/shiep/index.tsx
const route = {
	path: "/:type/:id?",
	categories: ["university"],
	example: "/shiep/news/notice",
	parameters: {
		type: "类型名称，见下表",
		id: "页面 ID，默认为通知公告或学院公告所对应的 ID"
	},
	radar: [
		{
			title: "武装部保卫处",
			source: ["bwc.shiep.edu.cn/:id/list.htm"],
			target: "/bwc/:id"
		},
		{
			title: "本科就业信息网",
			source: ["career.shiep.edu.cn/news/index/tag/:id"],
			target: "/career/:id"
		},
		{
			title: "资产经营公司/产业办",
			source: ["cyb.shiep.edu.cn/:id/list.htm"],
			target: "/cyb/:id"
		},
		{
			title: "党委办公室",
			source: ["dangban.shiep.edu.cn/:id/list.htm"],
			target: "/dangban/:id"
		},
		{
			title: "党建服务中心/党建督查室",
			source: ["djfwzxdcs.shiep.edu.cn/:id/list.htm"],
			target: "/djfwzxdcs/:id"
		},
		{
			title: "电气工程学院",
			source: ["dqxy.shiep.edu.cn/:id/list.htm"],
			target: "/dqxy/:id"
		},
		{
			title: "对外联络处",
			source: ["dwllc.shiep.edu.cn/:id/list.htm"],
			target: "/dwllc/:id"
		},
		{
			title: "电子与信息工程学院",
			source: ["dxxy.shiep.edu.cn/:id/list.htm"],
			target: "/dxxy/:id"
		},
		{
			title: "能源与机械工程学院",
			source: ["energy.shiep.edu.cn/:id/list.htm"],
			target: "/energy/:id"
		},
		{
			title: "上海热交换系统节能工程技术研究中心",
			source: ["energy-saving.shiep.edu.cn/:id/list.htm"],
			target: "/energy-saving/:id"
		},
		{
			title: "Shanghai University of Electric Power",
			source: ["english.shiep.edu.cn/:id/list.htm"],
			target: "/english/:id"
		},
		{
			title: "国际交流与合作处（港澳台办公室）",
			source: ["fao.shiep.edu.cn/:id/list.htm"],
			target: "/fao/:id"
		},
		{
			title: "妇工委",
			source: ["fgw.shiep.edu.cn/:id/list.htm"],
			target: "/fgw/:id"
		},
		{
			title: "发展规划处",
			source: ["fzghc.shiep.edu.cn/:id/list.htm"],
			target: "/fzghc/:id"
		},
		{
			title: "上海新能源人才技术教育交流中心",
			source: ["gec.shiep.edu.cn/:id/list.htm"],
			target: "/gec/:id"
		},
		{
			title: "工会",
			source: ["gonghui.shiep.edu.cn/:id/list.htm"],
			target: "/gonghui/:id"
		},
		{
			title: "上海绿色能源并网技术研究中心",
			source: ["green-energy.shiep.edu.cn/:id/list.htm"],
			target: "/green-energy/:id"
		},
		{
			title: "能源化学实验教学中心",
			source: ["hhsyzx.shiep.edu.cn/:id/list.htm"],
			target: "/hhsyzx/:id"
		},
		{
			title: "环境与化学工程学院",
			source: ["hhxy.shiep.edu.cn/:id/list.htm"],
			target: "/hhxy/:id"
		},
		{
			title: "后勤管理处（后勤服务中心）",
			source: ["hqglc.shiep.edu.cn/:id/list.htm"],
			target: "/hqglc/:id"
		},
		{
			title: "创新创业工程训练中心",
			source: ["ieetc.shiep.edu.cn/:id/list.htm"],
			target: "/ieetc/:id"
		},
		{
			title: "机关党委",
			source: ["jgdw.shiep.edu.cn/:id/list.htm"],
			target: "/jgdw/:id"
		},
		{
			title: "经济与管理学院",
			source: ["jgxy.shiep.edu.cn/:id/list.htm"],
			target: "/jgxy/:id"
		},
		{
			title: "纪委（监察专员办公室）",
			source: ["jijian.shiep.edu.cn/:id/list.htm"],
			target: "/jijian/:id"
		},
		{
			title: "基建处",
			source: ["jjc.shiep.edu.cn/:id/list.htm"],
			target: "/jjc/:id"
		},
		{
			title: "继续教育学院（国际教育学院）",
			source: ["jjxy.shiep.edu.cn/:id/list.htm"],
			target: "/jjxy/:id"
		},
		{
			title: "教师教学发展中心",
			source: ["jsjxfzzx.shiep.edu.cn/:id/list.htm"],
			target: "/jsjxfzzx/:id"
		},
		{
			title: "计算机科学与技术学院",
			source: ["jsjxy.shiep.edu.cn/:id/list.htm"],
			target: "/jsjxy/:id"
		},
		{
			title: "技术转移中心",
			source: ["jszyzx.shiep.edu.cn/:id/list.htm"],
			target: "/jszyzx/:id"
		},
		{
			title: "教务处",
			source: ["jwc.shiep.edu.cn/:id/list.htm"],
			target: "/jwc/:id"
		},
		{
			title: "电力装备设计与制造虚拟仿真中心",
			source: ["jxfz.shiep.edu.cn/:id/list.htm"],
			target: "/jxfz/:id"
		},
		{
			title: "能源电力科创中心",
			source: ["kczx.shiep.edu.cn/:id/list.htm"],
			target: "/kczx/:id"
		},
		{
			title: "科研处/融合办",
			source: ["kyc.shiep.edu.cn/:id/list.htm"],
			target: "/kyc/:id"
		},
		{
			title: "临港新校区建设综合办公室",
			source: ["lgxq.shiep.edu.cn/:id/list.htm"],
			target: "/lgxq/:id"
		},
		{
			title: "图书馆",
			source: ["library.shiep.edu.cn/:id/list.htm"],
			target: "/library/:id"
		},
		{
			title: "现代教育技术中心/信息办",
			source: ["metc.shiep.edu.cn/:id/list.htm"],
			target: "/metc/:id"
		},
		{
			title: "上海市电力材料防护与新材料重点实验室",
			source: ["mpep.shiep.edu.cn/:id/list.htm"],
			target: "/mpep/:id"
		},
		{
			title: "新闻网",
			source: ["news.shiep.edu.cn/:id/list.htm"],
			target: "/news/:id"
		},
		{
			title: "能源电力智库",
			source: ["nydlzk.shiep.edu.cn/:id/list.htm"],
			target: "/nydlzk/:id"
		},
		{
			title: "校长办公室（档案馆）",
			source: ["office.shiep.edu.cn/:id/list.htm"],
			target: "/office/:id"
		},
		{
			title: "国家新能源电力系统实验教学示范中心",
			source: ["rpstec.shiep.edu.cn/:id/list.htm"],
			target: "/rpstec/:id"
		},
		{
			title: "党委教师工作部/人事处",
			source: ["rsc.shiep.edu.cn/:id/list.htm"],
			target: "/rsc/:id"
		},
		{
			title: "人文艺术学院",
			source: ["rwysxy.shiep.edu.cn/:id/list.htm"],
			target: "/rwysxy/:id"
		},
		{
			title: "审计处",
			source: ["sjc.shiep.edu.cn/:id/list.htm"],
			target: "/sjc/:id"
		},
		{
			title: "马克思主义学院",
			source: ["skb.shiep.edu.cn/:id/list.htm"],
			target: "/skb/:id"
		},
		{
			title: "数理学院",
			source: ["slxy.shiep.edu.cn/:id/list.htm"],
			target: "/slxy/:id"
		},
		{
			title: "智能发电实验教学中心",
			source: ["spgc.shiep.edu.cn/:id/list.htm"],
			target: "/spgc/:id"
		},
		{
			title: "实验室与资产管理处",
			source: ["sysyzcglc.shiep.edu.cn/:id/list.htm"],
			target: "/sysyzcglc/:id"
		},
		{
			title: "离退休党委/退管办",
			source: ["tgb.shiep.edu.cn/:id/list.htm"],
			target: "/tgb/:id"
		},
		{
			title: "团委",
			source: ["tw.shiep.edu.cn/:id/list.htm"],
			target: "/tw/:id"
		},
		{
			title: "体育学院",
			source: ["tyb.shiep.edu.cn/:id/list.htm"],
			target: "/tyb/:id"
		},
		{
			title: "统战部",
			source: ["tzb.shiep.edu.cn/:id/list.htm"],
			target: "/tzb/:id"
		},
		{
			title: "文明办",
			source: ["wenming.shiep.edu.cn/:id/list.htm"],
			target: "/wenming/:id"
		},
		{
			title: "外国语学院",
			source: ["wgyxy.shiep.edu.cn/:id/list.htm"],
			target: "/wgyxy/:id"
		},
		{
			title: "宣传部（文明办、融媒体中心）",
			source: ["xcb.shiep.edu.cn/:id/list.htm"],
			target: "/xcb/:id"
		},
		{
			title: "学生处",
			source: ["xsc.shiep.edu.cn/:id/list.htm"],
			target: "/xsc/:id"
		},
		{
			title: "巡查办",
			source: ["xunchaban.shiep.edu.cn/:id/list.htm"],
			target: "/xunchaban/:id"
		},
		{
			title: "信息公开网",
			source: ["xxgk.shiep.edu.cn/:id/list.htm"],
			target: "/xxgk/:id"
		},
		{
			title: "研究生院/研工部",
			source: ["yjsc.shiep.edu.cn/:id/list.htm"],
			target: "/yjsc/:id"
		},
		{
			title: "自动化工程学院",
			source: ["zdhxy.shiep.edu.cn/:id/list.htm"],
			target: "/zdhxy/:id"
		},
		{
			title: "本科招生网",
			source: ["zs.shiep.edu.cn/:id/list.htm"],
			target: "/zs/:id"
		},
		{
			title: "学习路上",
			source: ["ztjy.shiep.edu.cn/:id/list.htm"],
			target: "/ztjy/:id"
		},
		{
			title: "组织部（老干部处、党校）",
			source: ["zzb.shiep.edu.cn/:id/list.htm"],
			target: "/zzb/:id"
		}
	],
	name: "新闻网与学院通知",
	maintainers: ["gumibea", "TeamSUEP"],
	handler,
	description: `类型名称与默认 ID：

学院一览：

| 能源与机械工程学院 | 环境与化学工程学院 | 电气工程学院 | 自动化工程学院 | 计算机科学与技术学院 | 电子与信息工程学院 | 经济与管理学院 | 数理学院 | 外国语学院 | 体育学院 | 马克思主义学院 | 人文艺术学院 | 继续教育学院（国际教育学院） | 海上风电研究院 |
| ------------------ | ------------------ | ------------ | -------------- | -------------------- | ------------------ | -------------- | -------- | ---------- | -------- | -------------- | ------------ | ---------------------------- | -------------- |
| energy             | hhxy               | dqxy         | zdhxy          | jsjxy                | dxxy               | jgxy           | slxy     | wgyxy      | tyb      | skb            | rwysxy       | jjxy                         | hsfdyjy        |
| 892                | 5559               | 2462         | 2002           | xygg                 | tzgg               | 3633           | 2063     | tzgg       | 2891     | 1736           | 3089         | 2582                         | 5748           |

党群部门：

| 党委办公室 | 组织部（老干部处、党校） | 党建服务中心 / 党建督查室 | 宣传部（文明办、融媒体中心） | 统战部 | 机关党委 | 纪委（监察专员办公室） | 巡查办    | 武装部 | 学生工作部 | 团委 | 工会（妇工委） | 教师工作部 | 离退休党委 | 研究生工作部 |
| ---------- | ------------------------ | ------------------------- | ---------------------------- | ------ | -------- | ---------------------- | --------- | ------ | ---------- | ---- | -------------- | ---------- | ---------- | ------------ |
| dangban    | zzb                      | djfwzxdcs                 | xcb                          | tzb    | jgdw     | jijian                 | xunchaban | bwc    | xsc        | tw   | gonghui        | rsc        | tgb        | yjsc         |
| 4013       | 1534                     | tzgg                      | 2925                         | 3858   | 3205     | 59                     | 5044      | tzgg   | 3482       | 2092 | 1806           | 1695       | notice     | 1161         |

行政部门：

| 校长办公室（档案馆） | 对外联络处 | 发展规划处 | 审计处 | 保卫处 | 学生处 | 人事处 | 退管办 | 国际交流与合作处（港澳台办公室） | 科研处 / 融合办 | 教务处 | 研究生院 | 后勤管理处（后勤服务中心） | 实验室与资产管理处 | 基建处 | 临港新校区建设综合办公室 | 图书馆  | 现代教育技术中心 / 信息办 | 创新创业工程训练中心 | 资产经营公司 / 产业办 | 能源电力科创中心 | 技术转移中心 |
| -------------------- | ---------- | ---------- | ------ | ------ | ------ | ------ | ------ | -------------------------------- | --------------- | ------ | -------- | -------------------------- | ------------------ | ------ | ------------------------ | ------- | ------------------------- | -------------------- | --------------------- | ---------------- | ------------ |
| office               | dwllc      | fzghc      | sjc    | bwc    | xsc    | rsc    | tgb    | fao                              | kyc             | jwc    | yjsc     | hqglc                      | sysyzcglc          | jjc    | lgxq                     | library | metc                      | ieetc                | cyb                   | kczx             | jszyzx       |
| 389                  | 2649       | 291        | 199    | tzgg   | 3482   | 1695   | notice | tzgg                             | 834             | 227    | 1161     | 1616                       | 312                | 327    | 377                      | 4866    | tzgg                      | cxcy                 | 367                   | 3946             | 4247         |

其它：

| 新闻网 | 信息公开网 | 本科招生网 | 本科就业信息网 | 文明办  | 学习路上 | “学条例 守党纪” 专题网 | 上海新能源人才技术教育交流中心 | 上海绿色能源并网技术研究中心 | 能源电力智库 | 智能发电实验教学中心 |
| ------ | ---------- | ---------- | -------------- | ------- | -------- | ---------------------- | ------------------------------ | ---------------------------- | ------------ | -------------------- |
| news   | xxgk       | zs         | career         | wenming | ztjy     | xxjy                   | gec                            | green-energy                 | nydlzk       | spgc                 |
| notice | zxgkxx     | zxxx       | tzgg           | 2202    | 5575     | 5973                   | 1959                           | 118                          | tzgg         | 4449                 |

参数与来源页面对应规则为：\`https://\${type}.shiep.edu.cn/\${id}/list.htm\``
};
async function handler(ctx) {
	const type = ctx.req.param("type");
	if (!Object.keys(config).includes(type)) throw new InvalidParameterError(`Invalid type: ${type}`);
	const { listSelector = ".list_item", pubDateSelector = ".Article_PublishDate", descriptionSelector = ".wp_articlecontent", title } = config[type];
	if (!title) throw new InvalidParameterError(`Invalid type: ${type}`);
	const host = `https://${type}.shiep.edu.cn`;
	const id = ctx.req.param("id") || config[type].id;
	const link = type === "career" ? `${host}/news/index/tag/${id}` : `${host}/${id}/list.htm`;
	const $ = load((await got_default(link)).data);
	const list = $(listSelector).toArray().map((item) => {
		item = $(item);
		const match = item.find(pubDateSelector).text().trim().match(/\b(\d{4}-\d{2}-\d{2})\b/);
		return {
			title: item.find("a").attr("title") || item.find("h3").text() || item.find("a").text(),
			link: new URL(item.find("a").attr("href"), host).href,
			pubDate: match ? parseDate(match[0], "YYYY-MM-DD") : null
		};
	}).filter((item) => {
		return dayjs(item.pubDate).isValid();
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		try {
			const $ = load((await got_default(item.link)).data);
			item.description = $(descriptionSelector).length > 0 ? renderToString(/* @__PURE__ */ jsx(Fragment, { children: $(descriptionSelector).html() ? raw($(descriptionSelector).html()) : null })) : "请进行统一身份认证后查看内容";
		} catch {
			item.description = "请在校内或通过校园VPN查看内容";
		}
		return item;
	})));
	return {
		title: `上海电力大学-${title}`,
		link,
		item: items
	};
}
//#endregion
export { route };
