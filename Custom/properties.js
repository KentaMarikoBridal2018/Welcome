/*Mobi設定*/
//MobiAgentサーバーのURL
var mobi_server_url = "https://agent.chordship.global.fujitsu.com";
//MobiのDomainId
var mobi_domain_id = "";
//MobiオプションuseMarkDownSyntax
var isParseToMarkDownSyntax = true;

//チャット画面起動時のアバター
var default_avatar = "images/ShinrouShinpu.png";
//オペレータ呼び出し時のアバター
var call_operator_avatar = "images/ShinrouShinpu.png";
//ルームロード時のタイムアウトアバター
var room_timeout_avatar = "images/ShinrouShinpu.png";

//チャットタイトル
var chat_title = "Kenta Mariko Bridal";
//インフォメーション
var message_info = "※チャットでの受付は、平日9:00~17:30となります。";
//オペレータ呼び出し時のメッセージ
var call_operator_message = "オペレーターを呼び出しています。<br/>恐れいりますが、今しばらくお待ちください。";
//ルームロード時のタイムアウトメッセージ
var room_timeout_message = "通信に失敗しました。<br/>恐れ入りますが時間を置いた後、<br/>再度実行して頂けるようお願いいたします。";
//オペレータログインによるエラーメッセージ
var error_login_message = "オペレーターとしてログインしています。<br/>オペレーターとしてログアウト後、<br/>再度実行して頂けるようお願いいたします。";
//会話終了時のメッセージ
var end_message = "お問い合わせありがとうございました。<br/>これで会話は終了となります。"
//再読み込みリンクのメッセージ
var reload_message = "再読み込みをする"

//trueの場合、セッションに保持している会話情報を更新時に出力
var isPrintOldChat = true;

//true -> Enterキーでメッセージ送信。 false -> shift + Enterで送信。
var isSendMessageByEnter = true;
