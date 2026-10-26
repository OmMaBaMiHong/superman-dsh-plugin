import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as header, r as processImage, t as getSignedHeader } from "./utils-BpoeGnFo.mjs";
//#region lib/routes/zhihu/question.ts
const route = {
	path: "/question/:questionId/:sortBy?",
	categories: ["social-media"],
	example: "/zhihu/question/59895982",
	parameters: {
		questionId: "问题 id",
		sortBy: "排序方式：`default`, `created`, `updated`。默认为 `default`"
	},
	features: {
		requireConfig: [{
			name: "ZHIHU_COOKIES",
			description: "",
			optional: true
		}],
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.zhihu.com/question/:questionId"],
		target: "/question/:questionId"
	}],
	name: "问题",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const { questionId, sortBy = "default" } = ctx.req.param();
	const rootUrl = "https://www.zhihu.com";
	const apiPath = `/api/v4/questions/${questionId}/answers?${new URLSearchParams({
		include: "data[*].is_normal,admin_closed_comment,reward_info,is_collapsed,annotation_action,annotation_detail,collapse_reason,is_sticky,collapsed_by,suggest_edit,comment_count,can_comment,content,editable_content,attachment,voteup_count,reshipment_settings,comment_permission,created_time,updated_time,review_info,relevant_info,question,excerpt,is_labeled,paid_info,paid_info_content,relationship.is_authorized,is_author,voting,is_thanked,is_nothelp,is_recognized;data[*].mark_infos[*].url;data[*].author.follower_count,badge[*].topics;data[*].settings.table_of_content.enabled&offset=0",
		limit: "20",
		sort_by: sortBy,
		platform: "desktop"
	})}`;
	const signedHeader = await getSignedHeader(`https://www.zhihu.com/question/${questionId}`, apiPath);
	const listRes = (await got_default({
		method: "get",
		url: rootUrl + apiPath,
		headers: {
			...header,
			...signedHeader,
			Referer: `https://www.zhihu.com/question/${questionId}`
		}
	})).data.data;
	return {
		title: `知乎-${listRes[0].question.title}`,
		link: `https://www.zhihu.com/question/${questionId}`,
		item: listRes.map((item) => {
			return {
				title: `${item.author.name}的回答：${item.excerpt}`,
				description: `${item.author.name}的回答<br/><br/>${processImage(item.content)}`,
				author: item.author.name,
				pubDate: parseDate(item.updated_time * 1e3),
				guid: item.id.toString(),
				link: `https://www.zhihu.com/question/${questionId}/answer/${item.id}`
			};
		})
	};
}
//#endregion
export { route };
