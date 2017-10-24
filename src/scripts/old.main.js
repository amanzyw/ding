function sendMessage(test, params) {
    var message = 'WindowTest.' + test;
    if (typeof params != 'undefined') {
        message += ':' + params;
        //window.open(params, 'yituyun','fullscreen');
    }
    // Results in a call to the OnQuery method in window_test.cpp.
    //  ({ 'request': message });
    window.cefQuery&&window.cefQuery({
        request: message,
        persistent: false,
        onSuccess: function(response) {},
        onFailure: function(error_code, error_message) {}
    });
}

function initInfo(nickname, signature, avatarLink, ver) {
    $("#avatar").attr("src", avatarLink);
    $("#nickname").text(nickname);
    $("#ver").text(ver);
}

function maximize() {
    var maxImage = document.getElementById("maxImage");
    if (maxImage.src.indexOf("restore.png") != -1) {
        maxImage.src = "../max.png";
    } else {
        maxImage.src = "../restore.png";
    }
    sendMessage('Maximize');
}

function position() {
    var x = parseInt(document.getElementById('x').value);
    var y = parseInt(document.getElementById('y').value);
    var width = parseInt(document.getElementById('width').value);
    var height = parseInt(document.getElementById('height').value);
    if (isNaN(x) || isNaN(y) || isNaN(width) || isNaN(height)) alert('Please specify a valid numeric value.');
    else sendMessage('Position', x + ',' + y + ',' + width + ',' + height);
}

function goTo(element) {
    sendMessage('GoTo', element.id);
}

function loadComplete($tr) {
    $tr.removeClass("loading");
    // ��ȡ�ļ���
    $progressDiv = $tr.find("div.progress");
    // ��ȡ�ļ���С
    var fileSize = $progressDiv.prev().text();
    var fileName = $progressDiv.prev().prev().text();
    // �����
    $tr.empty();
    // ������1�У��ļ�ͼ��
    var $td = $("<td>", {
        width: 30
    });
    $td.html('<span class="img-cz"><img src="file.png" width="30"></span>');
    $td.appendTo($tr);
    // ������2�У��ļ������ļ���С
    $td = $("<td>", {
        colspan: 3
    });
    $td.html('<h3>' + fileName + '</h3><span class="font-b c-grey">' + fileSize + '</span><span class="c-grey">-�����</span>');
    $td.appendTo($tr);
    // ������3�У����ļ���ť
    $td = $("<td>", {
        width: 20
    });
    $td.html('<a href="javascript:;" class="img-cz" title="��"><img src="paper18.png" width="16px"></a>');
    $td.find("img").click(function() {
        $tr.css("clickover");
        sendMessage('OpenItem', $tr.attr("id") + "," + "file");
    });
    $td.appendTo($tr);
    // ������4�У����ļ��а�ť
    $td = $("<td>", {
        width: 20
    });
    $td.html('<a href="javascript:;" class="img-cz" title="�������ļ���"><img src="folder49.png"></a>');
    $td.find("img").click(function() {
        $tr.css("clickover");
        sendMessage('OpenItem', $tr.attr("id") + "," + "folder");
    });
    $td.appendTo($tr);
    // �ڱ�������ӵ�5�У�ɾ����ť
    $td = $("<td>", {
        width: 20
    }).appendTo($tr);
    $td.html('<a href="javascript:;" class="delete"><img src="../close.png"></a>');
    // ���ҵ�һ�����"a"����classΪ"delete"
    $td.find("> a.delete").click(function() {
        $tr.remove();
        sendMessage('DeleteItem', $tr.attr("id"));
    });
}

function showDownloadDlg() {
    //$("#download").trigger("click");
    var $downloadDlg = $(".downpop");
      $downloadDlg.show();
      $downloadDlg.addClass('animated fadeIn');
      sendMessage('ShowBkgnd');

}

function ShowSoftDlg() {
    $("#app").trigger("click");
}

function updateItemProgress(fid, percent, fileSize) {
    var $tr = $("#" + fid);
    // ��ֹ�Ѿ�����ˣ�����������
    if ($tr.attr("class") != "loading") {
        return;
    };
    // ���ұ�"tr"�ڲ���"div"����classΪ"progress"
    var $porgressDiv = $tr.find("div.progress");
    var $p = $porgressDiv.find("> p");
    $p.width(percent + "%");
    $p.find(".p-text").text(percent + "%");
    $porgressDiv.prev().text(fileSize);
    if (percent >= 100) {
        loadComplete($tr);
    }
}

function addItem(fid, fileName, fileSize) {
    // ��ȡ���ļ��б����
    var $fileList = $("#fileList");
    // ��������
    var $tr = $("<tr>", {
        id: fid
    });
    $tr.addClass("loading");
    var fileNum = $fileList.find("tr").length;
    if (0 == fileNum) { // ���û����������ӵ�ĩβ
        $tr.appendTo($fileList);
    } else { // ��������ݣ�����뵽��һ��
        var $topRow = $fileList.find("tr:first");
        $topRow.before($tr);
    }
    // �ڱ�������ӵ�1�У��ļ�ͼ��
    var $td = $("<td>", {
        width: 30,
    }).appendTo($tr);
    $td.html('<span class="img-cz"><img src="file.png" width="30"></span>')
        // �ڱ�������ӵ�2�У��ļ������ļ���С
    $td = $("<td>", {
        colspan: 3
    }).appendTo($tr);
    $td.html('<span>' + fileName + '</span>' + '<span class="c-grey">' + fileSize + '</span>' + '<div class="progress"><p style="width: 0%"><span class="p-text\">0%</span></p></div>');
    // �ڱ�������ӵ�3�У�ɾ����ť
    $td = $("<td>", {
        width: 20
    }).appendTo($tr);
    $td.html('<a href="javascript:;" class="delete"><img src="../close.png"></a>');
    // ���ҵ�һ�����"a"����classΪ"delete"
    $td.find("> a.delete").click(function() {
        $tr.remove();
        sendMessage('DeleteItem', $tr.attr("id"));
    });
}
$(document).ready(function() {
    $("#fileList").empty();
    // ������������ļ�
    $("#clearFileList").click(function() {
        sendMessage('ClearFileList');
        $("#fileList").children().remove();
    });
    // ����
    $("#back").click(function() {
        sendMessage('GoBack');
    });
    // ǰ��
    $("#forward").click(function() {
        sendMessage('GoForward');
    });
    // ˢ��
    $("#refresh").click(function() {
        sendMessage('Reload');
    });
    // ֹͣ
    $("#stop").click(function() {
        sendMessage('Stop')
    });
    // ��������
    $("#download").click(function() {
        var $downloadDlg = $(".downpop");
        if($downloadDlg.css("display")!="none") {
            $downloadDlg.hide();
            $downloadDlg.removeClass('animated fadeIn');
            sendMessage('CloseDownloadDlg');
        } else {
            $downloadDlg.show();
            $downloadDlg.addClass('animated fadeIn');
            sendMessage('ShowBkgnd');
        }
    });
    // �ر�����
    $("#download-close").click(function() {
        var $downloadDlg = $(".downpop");
        $downloadDlg.hide();
        $downloadDlg.removeClass('animated fadeIn');
        sendMessage('CloseDownloadDlg');
    });
    // ������
    var $titleBar = $("#view_header");
    $titleBar.mousedown(function(event) {
        // ��ʼ�϶�
        sendMessage('BeginDragWindow');
        $(this).bind('mousemove', dragElement);
    });
    // �������α������ڲ�Ԫ�ص�һЩ����
    $titleBar.children().dblclick(function(event) {
        // �ӿؼ�������˫��
        event.stopPropagation();
    }).mousemove(function(event) {
        // �ӿؼ��������϶�
        //event.stopPropagation();
    });
    function dragElement(event) {
        sendMessage('DraggingWindow');
        return false;
    };
    $(document).mouseup(function() {
        $("#view_header").unbind('mousemove');
        sendMessage('EndDragWindow');
    });

    // ��С����ť
    $("#minimize").click(function() {
        sendMessage('Minimize');
    });
    // ��󻯰�ť
    $("#max").click(function() {
        maximize();
    });
    // �رհ�ť
    $("#close").click(function() {
        sendMessage('CloseWindow');
    });
     // �˳�
    $("#exit").click(function() {
        sendMessage('CloseWindow');
    });
     // �л��û�
    $("#change").click(function() {
        sendMessage('ChangeUser');
    });

    var actionShow = false;
    var actionclickCount = 0;
    $(this).mouseup(function () {
        actionclickCount++;
        if (actionShow == true) {
            $(".action-main").hide();
        }
    });

    $("#action").click(function () {
        if (actionclickCount > 1) {
            actionShow = false;
        }
        actionclickCount = 0;
        if (actionShow == false) {
            $(".action-main").show();
            actionShow = true;
        }
        else {
            $(".action-main").hide();
            actionShow = false;
        }
    });

    // ��ݼ�
    $(this).keydown(function(event) {
        switch (event.keyCode) {
            case 116: // F5
                sendMessage('Reload');
                break;
            case 122: // F11
                maximize();
                break;
            default:
                break;
        }
    });
})