/*
* @Author: Wanglj
* @Date:   2017-08-28 11:48:37
* @Last Modified by:   Wanglj
* @Last Modified time: 2017-10-23 11:59:32
*/

'use strict';
var common={
    getUrlInfo:(function(){
        var URL="http://ee-api-test.baijiakeji.cn",//url地址
            version="v1",//版本号
            SocketURL="http://ee-test-im.baijiakeji.cn/";//socket url地址
        return {
            URL:URL,
            version:version,
            SocketURL:SocketURL
        }
    })(),
    isLogin:(function(){
        var result=null;
        if(window.localStorage&&window.localStorage.length==0||window.localStorage&&window.localStorage.getItem("userLoginInfo")==undefined){
            result=false;
        }else{
            result=true;
        }
        return result;
    })(),
    getMsg:function(){
        return;
        var socket = io(this.getUrlInfo.SocketURL),
            userLoginInfo=JSON.parse(this.storageFunc.get("userLoginInfo")),
            uuid=null,
            company=null,
            clientMsgInfo=null;
        if(userLoginInfo==undefined){
            //没有用户信息
            return;
        }
        uuid=userLoginInfo["user"]["id"];
        company=userLoginInfo["user"]["company_id"];
        clientMsgInfo={"uuid":uuid,"company":company};
        socket.on("connect", function() {
            console.log("socket 连接了..");
            socket.emit("uid",clientMsgInfo);
        });
    },
    tooltip:function(){
        var DOM=[],CreateDOM=[],tooltip=null;
        var timer=null;
        $(document).delegate("[data-tooltip]","mouseenter",function(e){
            e.stopPropagation();
            e.preventDefault();
            var randomNum=new Date().getTime()+Math.floor(5*Math.random()+100);
            var $this=$(this);
            var dataNum=$this.data("id");
            var direction=null,content=null,dom=null;

            if($.inArray(dataNum,DOM)!=-1){
                return;
            }
            $this.data("id",randomNum);
            DOM.push(randomNum);
            direction=$this.attr("data-arrow-direction")||"bottom";
            content=$this.attr("data-tooltip")||"大道易图";
            dom=$("<div><div class='dadao_tooltip dadao_tooltip_placement_"+direction+"'><div class='dadao_tooltip_content'><div class='dadao_tooltip_arrow'></div><div class='dadao_tooltip_inner'><span>"+content+"</span></div></div></div></div>");
            var left=$this.offset().left,
                top=$this.offset().top,
                height=$this.height(),
                width=$this.width();
            var halftop=Math.ceil(height/4);
            tooltip=dom.find(".dadao_tooltip");
            if(direction=="right"){
                dom.find(".dadao_tooltip").css({
                    left:left+width,
                    top:top+halftop
                });
                /*tooltip.addClass("antZoomIn");*/
            }
            if(direction=="bottom"){
                dom.find(".dadao_tooltip").css({
                    left:left,
                    top:top+height
                });
            }

            $("body").append(dom);
            /*tooltip.get(0).addEventListener("animationend",function(){
                tooltip.removeClass("antZoomIn");
            },false);*/
            CreateDOM.push({
                id:randomNum,
                dom:dom
            });
        });
        $(document).delegate("[data-tooltip]","mouseleave",function(e){
            e.stopPropagation();
            e.preventDefault();
            var $this=$(this),
            id=$this.data("id"),
            domEle=null,
            tamp=null;
            $.each(CreateDOM,function(idx,item){
                if(id==item["id"]){
                    domEle=item.dom;
                    /*setTimeout(function(){
                        domEle.remove();
                    },300);
                    domEle.find(".dadao_tooltip").addClass("antZoomOut");
                    domEle.get(0).addEventListener("animationend",function(){
                        domEle.remove();
                    },false);*/
                    domEle.remove();
                    tamp=DOM.indexOf(id);
                    DOM.splice(tamp,1);
                }
            });
        });
    },
    //左下角头像按钮
    hoverHeaderPic:function(){
        var box=$("#setting_me"),
        winHeight=$(window).height(),
        oEle=box.find(".tick"),
        left=box.offset().left,
        width=box.width(),
        height=oEle.height(),
        dom=null,
        isopen=false,
        children=null,
        bottom=winHeight-box.offset().top-height;
        oEle.on("click",function(evt){
            evt.stopPropagation();
            var html=box.find(".ui_user_panel").clone().show();
            if(isopen){
                children.addClass("antZoomOut");
                children.get(0).addEventListener&&children.get(0).addEventListener("animationend",function(){
                    children.removeClass("antZoomOut");
                    dom.remove();
                    isopen=false;
                });
                setTimeout(function(){
                    dom.remove();
                    isopen=false;
                },300);
            }else{
                dom=$("<div><div style='position:fixed;z-index:1000;left:"+(left+width+2)+"px;bottom:"+bottom+"px;transform-origin:0 100%;-webkit-transform-origin:0 100%;-moz-transform-origin:0 100%;-ms-transform-origin:0 100%;'></div></div>").appendTo($("body"));
                children=dom.children();
                children.append(html);
                children.addClass("antZoomIn");
                children.get(0).addEventListener&&children.get(0).addEventListener("animationend",function(){
                    children.removeClass("antZoomIn");
                });
                isopen=true;
            }
        });
        $(document).on("click",function(){
            if(isopen){
                oEle.trigger("click");
            }
        });
    },
    //switch开头效果
    inputSwitch:function(opt){
        $(document).delegate('[data-toggle="switch"]',"click",function(){
            var isSelected=$(this).is(".dadao_switch_checked");
            if(isSelected){
                $(this).removeClass("dadao_switch_checked");
                opt&&opt.off&&opt.off($(this));
            }else{
                $(this).addClass("dadao_switch_checked");
                opt&&opt.on&&opt.on($(this));
            }
        });
    },
    storageFunc:(function(){
        var storage=window.localStorage;
        var result={
            get:function(item){
                return storage.getItem(item);
            },
            set:function(item,value){
                storage.setItem(item,value);
            },
            remove:function(item){
                storage.removeItem(item);
            },
            removeAll:function(){
                storage.clear();
            }
        }
        return result;
    })(),
    toQuot:function(){
        var that=this;
        var quot=function(){
            var dtd=$.Deferred();
            $.ajax({
                url:"http://ee-api-test.baijiakeji.cn/v1/employees/logout",
                type:"post",
                headers:{
                    Authorization:"Bearer "+JSON.parse(that.storageFunc.get("userLoginInfo"))["token"]
                },
                asunc:true,
                success:function(data){
                    dtd.resolve(data);
                },
                error:function(){
                    dtd.reject(arguments);
                }
            });
            return dtd.promise();
        }
        $.when(quot()).done(function(data){
            console.log(data);
            if(data.code=="10010"){}else{}
            try{
                that.storageFunc.removeAll();
                antdObj.message.success("退出成功！",1.5,function(){
                    window.location.href="/";
                });
            }catch(e){

            }
        }).fail(function(error){});
    },
    changeHeaderInfo:function(){//修改右上角昵称
        var user_model=$(".user_model"),
            date=user_model.find(".date"),
            name=$("#uname"),
            tamp=null,
            that=this,
            transNumtoCNStr=function(num){
                var result=null;
                switch(num){
                    case 0:
                        result="日";
                        break;
                    case 1:
                        result="一";
                        break;
                    case 2:
                        result="二";
                        break;
                    case 3:
                        result="三";
                        break;
                    case 4:
                        result="四";
                        break;
                    case 5:
                        result="五";
                        break;
                    case 6:
                        result="六";
                        break;
                }
                return result;
            };
        tamp=new Date();
        tamp=tamp.getFullYear()+"年"+(tamp.getMonth()+1)+"月"+tamp.getDate()+"日"+" "+"星期"+transNumtoCNStr(tamp.getDay())
        date.text(tamp);
        tamp=JSON.parse(that.storageFunc.get("userInfoMation"));
        tamp=tamp&&(tamp["username"]||tamp["nickname"]);
        tamp=tamp==undefined?"":tamp;
        name.text(tamp);
    }
}