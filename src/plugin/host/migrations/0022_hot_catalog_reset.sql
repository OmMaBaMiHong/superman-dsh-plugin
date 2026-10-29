-- 一次性重置热点平台勾选：目录从 5 个直采渠道扩到几十个（含 newsnow reader 平台）。
-- 历史用户只保存过那 5 个平台的勾选，扩容后会被当成「用户只选了 5 个」而显得像 bug；
-- 删除后回到「未保存 = 默认全选」语义，用户再按需取消勾选。
DELETE FROM user_source_prefs WHERE source_key = 'hot';
