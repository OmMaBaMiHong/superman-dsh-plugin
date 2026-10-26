import { Fragment, jsx } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/lkong/query.ts
const viewForum = (id) => ({
	operationName: "ViewForum",
	query: `
        query ViewForum($fid: Int!, $page: Int, $action: String) {
            forum(fid: $fid) {
                name
            }
            forumCount(fid: $fid) {
                info
            }
            hots: threadsFragment(fid: $fid, type: "hot") {
                tid
                title
            }
            threads(fid: $fid, action: $action, page: $page) {
                ...threadComponent
            }
        }
        fragment threadComponent on Thread {
            tid
            title
        }
    `,
	variables: { fid: Number.parseInt(id) }
});
const viewThread = (id, page) => ({
	operationName: "ViewThread",
	query: `
        query ViewThread($tid: Int!, $page: Int, $pid: String, $authorid: Int) {
            thread(tid: $tid, authorid: $authorid, pid: $pid) {
                ...threadComponent
            }
            ...repliesComponent
        }
        fragment threadComponent on Thread {
            tid
            title
            dateline
            author {
                name
            }
            replies
            tags {
                name
            }
        }
        fragment repliesComponent on Query {
            posts(tid: $tid, page: $page, pid: $pid, authorid: $authorid) {
                lou
                pid
                content
                quote {
                    author {
                        name
                    }
                    pid
                    content
                }
                dateline
                user {
                    name
                }
            }
        }
    `,
	variables: {
		tid: Number.parseInt(id),
		page
	}
});
const countReplies = (id) => ({
	operationName: "ViewThread",
	query: `
        query ViewThread($tid: Int!) {
            thread(tid: $tid) {
                ...threadComponent
            }
        }
        fragment threadComponent on Thread {
            replies
        }
    `,
	variables: { tid: Number.parseInt(id) }
});
//#endregion
//#region lib/routes/lkong/templates/content.tsx
const LkongContent = ({ content }) => /* @__PURE__ */ jsx(Fragment, { children: content?.map((paragraph) => paragraph.type === "paragraph" ? /* @__PURE__ */ jsx("p", { children: paragraph.children?.map((child) => {
	if (child.text) return /* @__PURE__ */ jsx("span", {
		style: child.color ? `color: ${child.color}` : void 0,
		children: child.bold ? /* @__PURE__ */ jsx("strong", { children: child.text }) : child.text
	});
	if (child.type === "emotion") return /* @__PURE__ */ jsx("img", { src: `https://image.lkong.com/bq/em${child.id}.gif` });
	return null;
}) }) : null) });
const renderContent = (content) => renderToString(/* @__PURE__ */ jsx(LkongContent, { content }));
//#endregion
export { viewThread as i, countReplies as n, viewForum as r, renderContent as t };
