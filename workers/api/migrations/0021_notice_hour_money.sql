-- 本番 DB には存在するが migrations 側に無かった notices のカラムを追加する。
-- 0008_notice_update.sql は全行コメントアウトされており、これらのカラムを
-- 作成する DDL がどのマイグレーションにも含まれていなかった。
--
-- 本番の列順は closed_at の直後（dateandtime の前）だが、ALTER で追加するため
-- 末尾に付く。アプリはカラム名で参照しているため動作上の差異は無い。

ALTER TABLE notices ADD COLUMN start_hour TEXT;
ALTER TABLE notices ADD COLUMN end_hour TEXT;
ALTER TABLE notices ADD COLUMN money INTEGER;
