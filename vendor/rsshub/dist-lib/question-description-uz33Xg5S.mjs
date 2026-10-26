import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/leetcode/templates/question-description.tsx
const QuestionDescription = ({ question }) => /* @__PURE__ */ jsxs("div", { children: [
	question.difficulty,
	" ",
	question.date,
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsx("br", {}),
	question.tags,
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsx("br", {})
] });
const renderQuestionDescription = (props) => renderToString(/* @__PURE__ */ jsx(QuestionDescription, { ...props }));
//#endregion
export { renderQuestionDescription as t };
