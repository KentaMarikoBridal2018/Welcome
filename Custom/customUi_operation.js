//モーダルオプション
$('.modal').modal({
    dismissible: false, // Modal can be dismissed by clicking outside of the modal
    opacity: .2, // Opacity of modal background
    inDuration: 300, // Transition in duration
    outDuration: 200, // Transition out duration
    startingTop: '4%', // Starting top style attribute
    endingTop: '20%', // Ending top style attribute
    ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
        $('body').css('overflow','auto');
        $('#konnect-container').css('z-index','1');
        console.log(modal, trigger);
    },
    complete: function() {  } // Callback for Modal close
});

initializeMobiVariable();

function initializeMobiVariable(){
    $.getJSON(mobi_server_url + "/api/globalPublicFiles/mst/" + mobi_domain_id + "/callcenterClientOption.json", function(json){
        if(chat_title == "") chat_title = json.i18n_cc_header2_text;
        if(message_info == "") message_info = json.i18n_cc_header3_text;
        if(call_operator_message == "") call_operator_message = json.i18n_cc_error_initialTimeout_1;
        if(room_timeout_message == "") room_timeout_message = i18n_cc_error_cannotUse;
        if(error_login_message == "") error_login_message = json.i18n_cc_error_asOperator;
        if(end_message == "") end_message = json.i18n_cc_label_operation_closed;
        if(reload_message == "") reload_message = json.i18n_cc_link_restartChatService;
        setTimeout(initializeVariable, 300);
    });
}

function initializeVariable(){
    //現在のセッションの会話内容を保持するための変数
    current_messages = "";
    //受信したメッセージをトーク画面に出力するかのフラグ
    isAppendGuestMessage = false;
    //送信ボタンを非活性
    $('.btn_send_message').prop("disabled", true);
    //チャット画面起動時のアバターを設定
    $('#character_img').attr('src', default_avatar);
    //チャットタイトルの設定
    $('#title').html(chat_title);
    //インフォメーションの設定
    $('#msg_info').html(message_info);
}

  var startChat = function() {
    
    if(mobi_domain_id == ""){
      mobi_domain_id = $('#domain-id').val();
    }
    localStorage.setItem('mobi_domain_id', mobi_domain_id);
    MobiAgentClient.init(
      mobi_server_url,
      mobi_domain_id,
      {
        useMarkDownSyntax: isParseToMarkDownSyntax,
        allowFileUpload: true,
        skipDomainStatusCheck: true,
        listenVisiblityChange: false,
        showAvatar: true,
        i18n: {
           cc_system_message_session_started: '問い合わせ'　// ★☆★☆★☆★☆
         }
      });

	$('#title').html(chat_title);

    //30秒間mobiから応答がなかった場合、メッセージを出力
    setTimeout(function(){
        if($('#layer').html() != "" && $('#layer .preloader-wrapper').html() != ""){
            showDialogMessage(room_timeout_avatar, room_timeout_message);
        }
    },30000);
  };

    $(function(){
      $('#domain-id').val(localStorage.getItem('domain-id'));
      MobiAgentClient.on('sdkReady', function(data){
        MobiAgentClient.on('roomReady', function(data){
          MobiAgentClient.toggle();
          //ローディングのサークルをなくす
          $("#layer").empty();
          loadAvatar(default_avatar);
          //送信ボタン活性化
          $('.btn_send_message').prop("disabled", false);
          //チャット画面スクロール
          $(function(){$('#messages').animate({scrollTop:$('#messages')[0].scrollHeight},'fast');});
        });
        if (!data.hasRoom){
          isAppendGuestMessage = false;
          MobiAgentClient.sendMessage('問い合わせ');
        }
      });
      MobiAgentClient.on('closeChatView', function(data){
        location.reload(true);
      });
    });

//メッセージ受信時の処理
MobiAgentClient.on('messageReceived', function(data){
    doReceiveMessage(data);
});

function doReceiveMessage(data){
    date_time = new Date(jQuery.now()) . toLocaleString();

    if(data.sender == "operator"){
        createOperatorMessage(data);
    }
    if(data.sender == "guest") {
        //過去の選択肢を非活性化
        clearSelectionOnclick();
        if(isAppendGuestMessage) {
            addUserMessage(data);
            isAppendGuestMessage = false;
        }

    }
    //チャット画面スクロール
    $(function(){$('#messages').animate({scrollTop:$('#messages')[0].scrollHeight},'fast');});
}

function createOperatorMessage(data){
    var message_text = "";
    var extra_data = "";
    var textMarkdown = data.text;
    if(isParseToMarkDownSyntax){
        //置き換え処理
        textMarkdown = parseToMarkdownSyntax(data.text);
    }
    if(data.msgObject.extra != null){
        extra_data = JSON.parse(data.msgObject.extra);
        //キャラクターアイコンの更新処理
        loadAvatar(extra_data["_avatar"]);
        //選択一覧表示の処理
        if(extra_data["t"] == "template" && extra_data["columns"] != null){
            message_text = addOnChatLink(extra_data["columns"]);
        } else if(extra_data["t"] == "image" && extra_data["url"] != null && extra_data["previewUrl"] != null) {
            message_text = createImageHtml(extra_data["url"], extra_data["previewUrl"]);
        } else {
            /*メッセージ追加処理*/
            message_text = "<div class='message operator_message'><div class='balloon operator_balloon'><pre>" + textMarkdown + "</pre></div></div>";
        }
    } else if(data.text.includes("画像を送信しました") && data.msgObject.data != null) {
            var data_list = data.msgObject.data.split(/\r*\n/);
            message_text = createImageHtml(mobi_server_url + "/api/globalFiles/mst/" + data_list[0], mobi_server_url + "/api/globalFiles/mst/" + data_list[1]);
    } else {
        /*メッセージ追加処理*/
        message_text = "<div class='message operator_message'><div class='balloon operator_balloon'><pre>"+textMarkdown+"</pre></div></div>";
    }

    var date_time=new Date(jQuery.now()) . toLocaleString();
    var operator_time = "<div class='time operator_time'><pre>"+date_time+"</pre></div>";
    addMessage(message_text);
    addMessage(operator_time);
}

function loadAvatar(data){
    //キャラクターアイコンの更新処理
    var current_avatar = $('#character_img').attr('src');
    if((data != null) && (data != "") && (data != current_avatar)){
        $('#character_img').attr('src', data);
    }
}

function showDialogMessage(avatarUrl, message){
    loadAvatar(avatarUrl);
    $("#layer").empty();
    $('#layer').append("<div class='active'><div class='wait_message card blue-grey darken-1'><div class='card-content white-text'><pre>"+ message +"</pre><div onClick='reloadScript()' class='reload-btn_timeout'><i class='material-icons left' style='margin-left:20px; margin-right:0px;'>refresh</i>" + reload_message + "</div></div></div></div></div>");
}

function createImageHtml(url, prevUrl){
    return "<div class='message operator_message'><div class='balloon operator_balloon'><a href='"+ url + "' target='_blank'><img style='width:200px; border-radius:10px;' src='" + prevUrl + "'></a></div></div>";
}

function addMessage(chat_message){
    $("#messages").append(chat_message);
    window.sessionStorage.setItem(['session_messages'], [$('#messages').html()]);
}

function addOnChatLink(columns){
    var links = "";
    for(var i = 0; i < columns[0].buttons.length; i++){
        links += '<br/><div class="select-btn waves-effect waves-light" onClick="sendSelection(\'' + columns[0].buttons[i].text + '\', \'' + columns[0].buttons[i].data + '\')"><pre>' + columns[0].buttons[i].text + '</pre></div>';
    }

    return '<div class="message operator_message"><div class="balloon operator_balloon"><pre>' + columns[0].text + '</pre>' + links + '</div></div>';
}

function sendSelection(str1,str2){
    var extra="{\"t\":\"misc_postback\",\"data\":{\"postback\":{\"payload\":\"\\\"" + str2 + "\\\"\"}}}";
    isAppendGuestMessage = true;
    MobiAgentClient.sendMessage(str1, extra);
}

function clearSelectionOnclick(){
    //#messages内の選択肢のonClickを空にする。
    $('#messages div:nth-last-of-type(2) div.select-btn').attr('onClick','');
}

function addUserMessage(data){

    /*htmlタグのエスケープ処理*/
    var textEscapedHtml = data.text.replace(/[&'`"<>]/g, function(match){
        return{
            '&': '&amp;',
            "'": '&#x27;',
            '`': '&#x60;',
            '"': '&quot;',
            '<': '&lt;',
            '>': '&gt;',
        }[match]
    });

    var textMarkdown = textEscapedHtml;
    if(isParseToMarkDownSyntax){
        //置き換え処理
        textMarkdown = parseToMarkdownSyntax(textEscapedHtml);
    }

    /*メッセージ追加処理*/
    var user_message="<div class='message user_message'><div class='balloon user_balloon'><pre>"+textMarkdown+"</pre></div></div>";
    var date_time=new Date(jQuery.now()) . toLocaleString();
    var user_time="<div class='time user_time'><pre>" + date_time + "</pre></div>";
    addMessage(user_message);
    addMessage(user_time);
}

function parseToMarkdownSyntax(text){
    //URLのリンク化
    var markdownLinkedText = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
    var urlLinkedText = markdownLinkedText.replace(/(?<!\<a href=\")((http|https|ftp):\/\/(\w|=|\.|\/|#|\-|~|%|@|\:)+(\?+\S*)*((?![\w\s?&.\/;#~%"=-]*>)))/g, '<a href="$1">$1</a>');
    return urlLinkedText;
}

function addOperatorTime(){
    var date_time = new Date(jQuery.now()) . toLocaleString();
    $("#messages").append("<div class='time operator_time'><pre>" + date_time + "</pre></div>");
}

function addUserTime(){
    var date_time = new Date(jQuery.now()) . toLocaleString();
    $("#messages").append("<div class='time user_time'><pre>" + date_time + "</pre></div>");
}

function sendMessage(){
    text_message = document.getElementsByClassName("message_form")[0];
    if(text_message.value != ""){
        /*メッセージ送信*/
        if((text_message.value).match(/\S/)){
            isAppendGuestMessage = true;
            MobiAgentClient.sendMessage(text_message.value);
        }
        text_message.value = "";
    }
}

MobiAgentClient.on('operatorTimeout', function(data){
    loadAvatar(call_operator_avatar);
    $("#layer").append("<div class='active'><div class='wait_message card blue-grey darken-1'><div class='card-content white-text'><p>" + call_operator_message + "</p></div></div></div>");
});

MobiAgentClient.on('operatorReady', function(data){
    loadAvatar(default_avatar);
    $("#layer").empty();
});

MobiAgentClient.on('roomClosed', function(data){
    /* sendMessage will be disabled */
    $('.btn_send_message').prop("disabled", true);
    //session内のメッセージ情報を削除
    window.sessionStorage.removeItem(['session_messages']);
    current_messages = "";
    //1秒後に再読み込みを表示
    setTimeout(function(){
        var end_text = '<div class="message operator_message"><div class="balloon operator_balloon"><pre>' + end_message + '</pre><div onClick="reloadScript()" class="reload-btn"><i class="material-icons left" style="margin-left:20px; margin-right:0px;">refresh</i>' + reload_message + '</div></div></div>';
        $("#messages").append(end_text);
        addOperatorTime();
        $(function(){$('#messages').animate({scrollTop:$('#messages')[0].scrollHeight},'fast');});
        //session内のメッセージ情報を削除
        window.sessionStorage.removeItem(['session_messages']);
        current_messages = "";
    }, 1000);
});

MobiAgentClient.on('error', function(data){
    if(data.msg == "login as operator"){
        showDialogMessage(room_timeout_avatar, error_login_message);
    } else {
        showDialogMessage(room_timeout_avatar, room_timeout_message);
    }
});

window.onload = function(){
    var start = $('#start-btn');
    if(isDisplayPcUi){//PCの場合、modalを開くよう設定
        if(!start.hasClass('modal-trigger')){
            start.addClass('modal-trigger');
            start.attr('href','#chat_modal');
        }
    } else{//スマホの場合、modalを開かないよう設定
        if(start.hasClass('modal-trigger')){
            start.removeClass('modal-trigger');
            start.attr('href','#');
        }
    }

    //再読み込み時の場合は、スタートボタンをクリックする
    if(window.sessionStorage.getItem(['is_reloading_chat']) == 'true'){
        window.sessionStorage.setItem(['is_reloading_chat'],['false']);
        $('#chat_modal').modal('open');
        return startChat();
    }

    //セッションに保持している会話情報を出力
    if(isPrintOldChat){
        $("#messages").append(window.sessionStorage.getItem(['session_messages']));
    }
};

function reloadScript(){
    window.sessionStorage.setItem(['is_reloading_chat'],['true']);
    location.reload();
}

$('.message_form').keypress(function (e){
    if(isSendMessageByEnter){
        if ( e.which == 13 && !e.shiftKey) {
            sendMessage();
            e.preventDefault();
        }
    } else {
        if ( e.which == 13 && e.shiftKey) {
            sendMessage();
            e.preventDefault();
        }
    }
    
});

//入力中テキストの送信処理
var isSendInputMessage = true;
$('.message_form').keyup(function(){
    if(isSendInputMessage){
        printConsole();
    }
});

function printConsole(){
    isSendInputMessage = false;
    var timeout_id = setTimeout(function(){
        var message_value = $('.message_form').val();
        if(message_value == ""){
            MobiAgentClient.notifyKeyInput(message_value);
        } else {
            MobiAgentClient.notifyKeyInput(message_value + " ...");
        }
        isSendInputMessage = true;
    }, 300);
}
