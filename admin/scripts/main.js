/*
* @Author: Wanglj
* @Date:   2017-08-28 11:48:37
* @Last Modified by:   Wanglj
* @Last Modified time: 2017-08-28 18:34:55
*/

'use strict';
var common={
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
                tooltip.addClass("antZoomIn");
            }
            if(direction=="bottom"){
                dom.find(".dadao_tooltip").css({
                    left:left,
                    top:top+height
                });
            }

            $("body").append(dom);
            tooltip.get(0).addEventListener("animationend",function(){
                tooltip.removeClass("antZoomIn");
            },false);
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
                    setTimeout(function(){
                        domEle.remove();
                    },300);
                    domEle.find(".dadao_tooltip").addClass("antZoomOut");
                    domEle.get(0).addEventListener("animationend",function(){
                        domEle.remove();
                    },false);
                    tamp=DOM.indexOf(id);
                    DOM.splice(tamp,1);
                }
            });
        });
    }
}