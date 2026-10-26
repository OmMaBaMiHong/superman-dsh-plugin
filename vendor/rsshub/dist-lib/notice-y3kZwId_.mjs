import { n as getArticle, r as getSingleRecord, t as baseUrl } from "./common-oYK5amW-.mjs";
//#region lib/routes/pku/ss/notice.ts
const host = `${baseUrl}/newscenter/notice/`;
const route = {
	path: "/ss/notice",
	radar: [{ source: ["ss.pku.edu.cn/index.php/newscenter/notice", "ss.pku.edu.cn/"] }],
	name: "Unknown",
	maintainers: ["legr4ndk"],
	handler,
	url: "ss.pku.edu.cn/index.php/newscenter/notice"
};
async function handler() {
	const items = await getSingleRecord(host);
	const out = await Promise.all(items.map((item) => getArticle(item)));
	return {
		title: "北大软微-通知公告",
		description: "北京大学软件与微电子学院 - 通知公告",
		link: host,
		item: out
	};
}
//#endregion
export { route };
