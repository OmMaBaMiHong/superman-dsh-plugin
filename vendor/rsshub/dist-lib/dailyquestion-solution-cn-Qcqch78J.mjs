import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import markdownit from "markdown-it";
//#region lib/routes/leetcode/dailyquestion-solution-cn.ts
const md = markdownit({
	html: true,
	breaks: true
});
const route = {
	path: "/dailyquestion/solution/cn",
	radar: [{ source: ["leetcode.cn/"] }],
	name: "Unknown",
	maintainers: [],
	handler,
	url: "leetcode.cn/"
};
async function handler() {
	const baseurl = "https://leetcode.cn";
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
                        todayRecord {
                            date
                            userStatus
                            question {
                                questionId
                                frontendQuestionId: questionFrontendId
                                difficulty
                                title
                                titleCn: translatedTitle
                                titleSlug
                            }
                        }
                    }
                `,
			variables: {}
		},
		headers
	})).data.data;
	const questionTitle = data.todayRecord[0].question.titleSlug;
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
	const articles = (await got_default({
		method: "post",
		url,
		json: {
			operationName: "questionSolutionArticles",
			query: `
                    query questionSolutionArticles($questionSlug: String!, $skip: Int, $first: Int, $orderBy: SolutionArticleOrderBy, $userInput: String, $tagSlugs: [String!]) {
                        questionSolutionArticles(questionSlug: $questionSlug, skip: $skip, first: $first, orderBy: $orderBy, userInput: $userInput, tagSlugs: $tagSlugs) {
                            totalNum
                            edges {
                                node {
                                    ...solutionArticle
                                    __typename
                                }
                                __typename
                            }
                            __typename
                        }
                    }
                    fragment solutionArticle on SolutionArticleNode {
                        uuid
                        title
                        slug
                        createdAt
                        thumbnail
                        author {
                            username
                        }
                        summary
                    }
                `,
			variables: {
				questionSlug: questionTitle,
				first: 3,
				skip: 0,
				orderBy: "MOST_UPVOTE"
			}
		},
		headers
	})).data.data.questionSolutionArticles.edges;
	const articleContent = (await Promise.all(articles.map((art) => got_default({
		method: "post",
		url,
		json: {
			operationName: "solutionDetailArticle",
			query: `
                            query solutionDetailArticle($slug: String!, $orderBy: SolutionArticleOrderBy!) {
                                solutionArticle(slug: $slug, orderBy: $orderBy) {
                                    ...solutionArticle
                                    content
                                    question {
                                        questionTitleSlug
                                        __typename
                                    }
                                }
                            }
                            fragment solutionArticle on SolutionArticleNode {
                                uuid
                                title
                                slug
                                createdAt
                                thumbnail
                                author {
                                    username
                                }
                                summary
                            }
                        `,
			variables: {
				slug: art.node.slug,
				orderBy: "DEFAULT"
			}
		},
		headers
	})))).map((v) => v.data.data.solutionArticle);
	const handleText = (s) => {
		s = s.replaceAll(/(```)([\d#+A-Z-]+)\s*?(\[.*?\])?\n/gi, "\r\n###$2\r\n$1$2\r\n");
		return s;
	};
	return {
		title: "LeetCode 每日一题题解",
		description: "LeetCode 每日一题题解",
		link: questionUrl,
		item: [{
			title: `每日一题-${question.translatedTitle}${diffEmoji}`,
			link: questionUrl,
			description: question.translatedContent,
			pubDate: timezone(parseDate(data.todayRecord[0].date), 8)
		}, ...articleContent.map((art, i) => ({
			title: art.title,
			link: `${questionUrl}/solution/${art.slug}`,
			description: md.render(handleText(art.content)),
			pubDate: timezone(parseDate(articles[i].node.createdAt), 8),
			author: art.author.username
		}))]
	};
}
//#endregion
export { route };
