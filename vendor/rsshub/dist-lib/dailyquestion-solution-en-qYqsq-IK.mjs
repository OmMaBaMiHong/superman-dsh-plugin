import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import path from "node:path";
import markdownit from "markdown-it";
//#region lib/routes/leetcode/dailyquestion-solution-en.ts
const md = markdownit({
	html: true,
	breaks: true
});
const route = {
	path: "/dailyquestion/solution/en",
	radar: [{ source: ["leetcode.com/"] }],
	name: "Unknown",
	maintainers: [],
	handler,
	url: "leetcode.com/"
};
async function handler() {
	const baseurl = "https://leetcode.com";
	const url = `${baseurl}/graphql/`;
	const headers = { "content-type": "application/json" };
	const emoji = {
		Medium: "🟡",
		Easy: "🟢",
		Hard: "🔴"
	};
	const data = (await got_default({
		method: "post",
		url,
		json: {
			operationName: "questionOfToday",
			query: `
                    query questionOfToday {
                        activeDailyCodingChallengeQuestion {
                            date
                            link
                            question {
                                frontendQuestionId: questionFrontendId
                                titleSlug
                            }
                        }
                    }
                `,
			variables: {}
		},
		headers
	})).data.data;
	const questionTitle = data.activeDailyCodingChallengeQuestion.question.titleSlug;
	const questionUrl = `${baseurl}/problems/${questionTitle}/`;
	const question = (await got_default({
		method: "post",
		url,
		json: {
			operationName: "questionData",
			query: `
                    query questionData($titleSlug: String!) {
                        question(titleSlug: $titleSlug) {
                            questionId
                            questionFrontendId
                            categoryTitle
                            boundTopicId
                            title
                            titleSlug
                            content
                            translatedTitle
                            translatedContent
                            isPaidOnly
                            difficulty
                            likes
                        }
                    }
                `,
			variables: { titleSlug: questionTitle }
		},
		headers
	})).data.data.question;
	const diffEmoji = emoji[question.difficulty] || "";
	const article = (await got_default({
		method: "post",
		url,
		json: {
			operationName: "QuestionNote",
			query: `
                    query QuestionNote($titleSlug: String!) {
                        question(titleSlug: $titleSlug) {
                            questionId
                            article
                            solution {
                                id
                                content
                                contentTypeId
                                canSeeDetail
                                paidOnly
                                hasVideoSolution
                                paidOnlyVideo
                                rating {
                                    id
                                    count
                                    average
                                    userRating {
                                        score
                                    }
                                }
                            }
                        }
                    }
                `,
			variables: { titleSlug: questionTitle }
		},
		headers
	})).data.data.question.solution;
	if (article.content === null) article.content = "Sorry, the solution of this question may be locked.";
	const parsePngSlide = async (s) => {
		const pattern = /!\?!(.+)!\?!/;
		if (!pattern.test(s)) return s;
		const matched = s.match(new RegExp(pattern, "g"));
		const fn = async (m) => {
			const relaurl = m.match(pattern)[1].split(":", 1)[0];
			return (await got_default({
				url: path.resolve("/" + questionUrl + "solution/", relaurl).slice(1),
				method: "get",
				headers
			})).data.timeline.map((v) => `![pic](${path.resolve(`/problems/${questionTitle}/solution/`, v.image)})`).join("\n");
		};
		const strs = await Promise.all(matched.map((v) => fn(v)));
		for (let i = 0; i < matched.length; i++) s = s.replace(matched[i], () => strs[i]);
		return s;
	};
	const parseIframe = async (s) => {
		const pattern = /<iframe.*? src=".*?playground\/(.*?)\/shared".*<\/iframe>/;
		if (!pattern.test(s)) return s;
		const matched = s.match(new RegExp(pattern, "g"));
		const fn = async (m) => {
			const uuid = m.match(pattern)[1];
			return (await got_default({
				method: "post",
				url,
				json: {
					operationName: "fetchPlayground",
					query: `query fetchPlayground {
                            playground(uuid: "${uuid}") {
                              testcaseInput
                              name
                              isUserOwner
                              isLive
                              showRunCode
                              showOpenInPlayground
                              selectedLangSlug
                              isShared
                              __typename
                            }
                            allPlaygroundCodes(uuid: "${uuid}") {
                              code
                              langSlug
                              __typename
                            }
                          }`,
					variables: {}
				},
				headers
			})).data.data.allPlaygroundCodes.map((c) => `###${c.langSlug}\n\r \`\`\`${c.langSlug}\n ${c.code}\n\`\`\``).join("\n\r");
		};
		const strs = await Promise.all(matched.map((v) => fn(v)));
		for (let i = 0; i < matched.length; i++) s = s.replace(matched[i], () => strs[i]);
		return s;
	};
	const handleText = async (s) => {
		s = await parseIframe(s);
		s = await parsePngSlide(s);
		return s;
	};
	article.content = await handleText(article.content);
	return {
		title: "LeetCode DailyQuestion Solution",
		description: "LeetCode DailyQuestion Solution",
		link: questionUrl,
		item: [{
			title: `DailyQuestion-${question.title}${diffEmoji}`,
			link: questionUrl,
			description: question.content,
			pubDate: timezone(parseDate(data.activeDailyCodingChallengeQuestion.date), 8)
		}, {
			title: `Solution-${question.title}`,
			link: `${questionUrl}solution/`,
			description: md.render(article.content),
			pubDate: timezone(parseDate(data.activeDailyCodingChallengeQuestion.date), 8),
			author: "leetcode"
		}]
	};
}
//#endregion
export { route };
