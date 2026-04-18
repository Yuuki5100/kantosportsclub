INSERT INTO mail_templates (locale, template_name, subject, body) VALUES ('ja', 'password_reissue_first', 'アカウント発行のご案内', '<p>初回ログインありがとうございます。</p>
<p>初回ログイン時はパスワードの設定が必要です。以下のURLから設定をお願いいたします。</p> 
<p>【パスワード設定（初回ログイン）】<br /><a href="{{passwordChangeUrl}}">{{passwordChangeUrl}}</a></p>
<p>【2回目以降のログインはこちら】<br /><a href="{{loginUrl}}">{{loginUrl}}</a>></p>
<p>※URLの有効期限は{{expirationDate}}時間です。</p>
<p>よろしくお願いいたします。</p>');
INSERT INTO mail_templates (locale, template_name, subject, body) VALUES ('ja', 'password_reissue_forgot', 'パスワード再発行のご案内', '<p>パスワード再発行のご依頼ありがとうございます。</p> 
<p>新しいパスワードの設定は、以下のURLから設定をお願いいたします。</p> 
<p>【パスワード再設定】<br/><a href="{{passwordChangeUrl}}">{{passwordChangeUrl}}</a></p> 
<p>※URLの有効期限は{{expirationDate}}時間です。</p> 
<p>よろしくお願いします。</p>');
