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
    // 获取文件名
    $progressDiv = $tr.find("div.progress");
    // 获取文件大小
    var fileSize = $progressDiv.prev().text();
    var fileName = $progressDiv.prev().prev().text();
    // 清空行
    $tr.empty();
    // 创建第1列，文件图标
    var $td = $("<td>", {
        width: 30
    });
    $td.html('<span class="img-cz"><img src="file.png" width="30"></span>');
    $td.appendTo($tr);
    // 创建第2列，文件名和文件大小
    $td = $("<td>", {
        colspan: 3
    });
    $td.html('<h3>' + fileName + '</h3><span class="font-b c-grey">' + fileSize + '</span><span class="c-grey">-已完成</span>');
    $td.appendTo($tr);
    // 创建第3列，打开文件按钮
    $td = $("<td>", {
        width: 20
    });
    $td.html('<a href="javascript:;" class="img-cz" title="打开"><img src="paper18.png" width="16px"></a>');
    $td.find("img").click(function() {
        $tr.css("clickover");
        sendMessage('OpenItem', $tr.attr("id") + "," + "file");
    });
    $td.appendTo($tr);
    // 创建第4列，打开文件夹按钮
    $td = $("<td>", {
        width: 20
    });
    $td.html('<a href="javascript:;" class="img-cz" title="打开所在文件夹"><img src="folder49.png"></a>');
    $td.find("img").click(function() {
        $tr.css("clickover");
        sendMessage('OpenItem', $tr.attr("id") + "," + "folder");
    });
    $td.appendTo($tr);
    // 在本行里添加第5列，删除按钮
    $td = $("<td>", {
        width: 20
    }).appendTo($tr);
    $td.html('<a href="javascript:;" class="delete"><img src="../close.png"></a>');
    // 查找第一级别的"a"且其class为"delete"
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
    // 防止已经完成了，还继续更新
    if ($tr.attr("class") != "loading") {
        return;
    };
    // 查找本"tr"内部的"div"且其class为"progress"
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
    // 获取到文件列表对象
    var $fileList = $("#fileList");
    // 创建新行
    var $tr = $("<tr>", {
        id: fid
    });
    $tr.addClass("loading");
    var fileNum = $fileList.find("tr").length;
    if (0 == fileNum) { // 如果没有内容则添加到末尾
        $tr.appendTo($fileList);
    } else { // 如果有内容，则插入到第一行
        var $topRow = $fileList.find("tr:first");
        $topRow.before($tr);
    }
    // 在本行里添加第1列，文件图标
    var $td = $("<td>", {
        width: 30,
    }).appendTo($tr);
    $td.html('<span class="img-cz"><img src="file.png" width="30"></span>')
        // 在本行里添加第2列，文件名和文件大小
    $td = $("<td>", {
        colspan: 3
    }).appendTo($tr);
    $td.html('<span>' + fileName + '</span>' + '<span class="c-grey">' + fileSize + '</span>' + '<div class="progress"><p style="width: 0%"><span class="p-text\">0%</span></p></div>');
    // 在本行里添加第3列，删除按钮
    $td = $("<td>", {
        width: 20
    }).appendTo($tr);
    $td.html('<a href="javascript:;" class="delete"><img src="../close.png"></a>');
    // 查找第一级别的"a"且其class为"delete"
    $td.find("> a.delete").click(function() {
        $tr.remove();
        sendMessage('DeleteItem', $tr.attr("id"));
    });
}
$(document).ready(function() {
    $("#fileList").empty();
    // 清空所有下载文件
    $("#clearFileList").click(function() {
        sendMessage('ClearFileList');
        $("#fileList").children().remove();
    });
    // 后退
    $("#back").click(function() {
        sendMessage('GoBack');
    });
    // 前进
    $("#forward").click(function() {
        sendMessage('GoForward');
    });
    // 刷新
    $("#refresh").click(function() {
        sendMessage('Reload');
    });
    // 停止
    $("#stop").click(function() {
        sendMessage('Stop')
    });
    // 弹出下载
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
    // 关闭下载
    $("#download-close").click(function() {
        var $downloadDlg = $(".downpop");
        $downloadDlg.hide();
        $downloadDlg.removeClass('animated fadeIn');
        sendMessage('CloseDownloadDlg');
    });
    // 标题栏
    var $titleBar = $("#view_header");
    $titleBar.mousedown(function(event) {
        // 开始拖动
        sendMessage('BeginDragWindow');
        $(this).bind('mousemove', dragElement);
    });
    // 设置屏蔽标题栏内部元素的一些操作
    $titleBar.children().dblclick(function(event) {
        // 子控件不允许双击
        event.stopPropagation();
    }).mousemove(function(event) {
        // 子控件不允许拖动
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

    // 最小化按钮
    $("#minimize").click(function() {
        sendMessage('Minimize');
    });
    // 最大化按钮
    $("#max").click(function() {
        maximize();
    });
    // 关闭按钮
    $("#close").click(function() {
        sendMessage('CloseWindow');
    });
     // 退出
    $("#exit").click(function() {
        sendMessage('CloseWindow');
    });
     // 切换用户
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

    // 快捷键
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