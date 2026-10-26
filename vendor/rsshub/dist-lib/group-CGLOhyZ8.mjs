import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { n as generateTopicDataItem, t as customFetch } from "./utils-Cee44I49.mjs";
//#region lib/routes/zsxq/group.ts
const route = {
	name: "星球",
	categories: ["social-media"],
	path: "/group/:id/:scope?",
	example: "/zsxq/group/88855458825252",
	parameters: {
		id: "星球id，从网页端url中获取",
		scope: "栏目分类，默认为\"all\"，见下表"
	},
	maintainers: ["KarasuShin"],
	radar: [{ source: ["wx.zsxq.com/dweb2/index/group/:id"] }],
	features: { requireConfig: [{
		name: "ZSXQ_ACCESS_TOKEN",
		description: "知识星球访问令牌,获取方式：\n1. 登录知识星球网页版\n2. 打开浏览器开发者工具，切换到 Application 面板\n3. 点击侧边栏中的Storage -> Cookies -> https://wx.zsxq.com\n4. 复制 Cookie 中的 zsxq_access_token 值"
	}] },
	handler,
	description: `| all  | digests | by\\_owner | questions | tasks |
| ---- | ------- | --------- | --------- | ----- |
| 最新 | 精华    | 只看星主  | 问答      | 作业  |`
};
async function handler(ctx) {
	const groupId = ctx.req.param("id");
	const scope = ctx.req.param("scope") ?? "all";
	if (!config.zsxq.accessToken) throw new ConfigNotFoundError("该 RSS 源由于配置不正确而被禁用：令牌丢失。");
	let count = Number(ctx.req.query("limit")) || 20;
	if (count > 30) count = 30;
	const { group } = await customFetch(`/groups/${groupId}`);
	const { topics } = await customFetch(`/groups/${groupId}/topics?scope=${scope}&count=${count}`);
	return {
		title: `知识星球 - ${group.name}`,
		description: group.description,
		image: group.background_url,
		link: `https://wx.zsxq.com/dweb2/index/group/${groupId}`,
		item: generateTopicDataItem(topics)
	};
}
//#endregion
export { route };
