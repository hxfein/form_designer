/*
   当前基础包包含:
   基础公共方法
   兼容老版本公共方法
   小莹姐的组件调用的公共方法类

   基础包 包含:
   browserbase.js 浏览器基础包
   colorbase.js 颜色基础包
   layout.js  布局基础包
   database.js 数据处理基础包
*/

(function (window) {
    "use strict";
    var module = {};

    //全局属性配置
    module.UI_ATTR = ["an-tabs", "an-accordion", "an-datagrid", "an-combo", "an-spinner", "an-related", "an-datagridPagination", "an-checkbox", "an-radiobox", "an-topnav","an-sidemenu","an-tabsheader","an-scrollbar","an-scrolltabs"];
    //全局布局配置
    module.UI_LAYOUT = ["g-layout", "g-max", "g-h-max", "g-w-max", "g-h-auto", "g-w-auto"];
    //全局自动执行配置
    module.UI_PERFORM = ["u-switch"];
    // 屏蔽渲染配置
    module.UI_SHIELDING = ["shielding"];//屏蔽layout perform
    module.UI_SHIELDING_LAYOUT = ["shielding-layout"];//屏蔽layout
    module.UI_SHIELDING_PERFORM = ["shielding-perform"];//屏蔽perform
    //全局事件名定义
    module.EVENT_CLICK = "andy_click";//点击事件
    module.COMBO_CHOOSE_LISET = "combo_choose_list";//combo选择事件

    // 全局延迟等级
    module.SETTIME_01 = 100;
    module.SETTIME_02 = 200;

    // IE6渲染开关
    module.LAYOUT_IE6 = true;

    // ------------------------------------------基础类公共方法

    //设置对象zindex
    //参数：对象路径， zindex层级
    //使用方法 an_setZindex(element, index);
    module.setZindex = function (element, index) {
        $(element).css("z-index", index);
    };

    // 获取0+随机数
    module.getRandom = function(n){
        return Math.floor(Math.random()*n+1);
    };

    // 获取随机id
    module.setRandomId = function(dom, name, number){
        var id = dom.attr("id");
        var randomNumber = number || 10000;
        if(id == undefined || id == null || id == ""){
            id = name+andy.getRandom(randomNumber);
            dom.attr("id", id);
            dom = $("#"+id);
        }else{
            dom = $("#"+id);
        }
        return dom;
    };

    //中继器
    //设置中继器，属性 方法 都可以
    module.setWindow = function (options) {
        var element = window.top.an_element;
        if (element) {
            window.top.an_element = $.extend(window.top.an_element, options);
        }
        else {
            window.top.an_element = options;
        }
    };

    //从中继器获取，设置的属性 方法
    module.getWindow = function (options) {
        return window.top.an_element;
    };

    //执行 为idXX的iframe里面的name方法，options为参数
    // id, name, options
    module.toWindow = function () {
        //平级查找||当前子集查找
        var id = arguments[0];
        var name = arguments[1];
        var box = window.top.$("#" + id)[0] || $("#" + id)[0];
        if (!box) {
            //平级子集查找
            box = window.top.$("iframe").contents().find("#" + id)[0];
        }
        box = box.contentWindow;
        // var box = window.top.document.getElementById(id).contentWindow;
        // var windowbox = element[0] ? element : $(this).contents().find("#" + id);

        var args = [];
        if (arguments.length > 2) {
            for (var i = 2, len = arguments.length; i < len; i++) {
                args.push(arguments[i]);
            }
        }
        ;

        if (box && box[name]) {
            box[name].apply(this, args);
        }
        else {
            console.log("don't have this id!")
        }
    };

    //弹出combo
    module.combo = function(){
        // 绑定选中事件
        var options = {};
        var funstyle = "";
        for(var i= 0; i <arguments.length;i++){
            // console.log(arguments[0]);
            var a = arguments[0];
            if(typeof a == "object"){
                options = a;
            }else if(typeof a == "string"){
                funstyle = a;
            }
        };
        var opts = $.extend({
            combo:"", //combo对象
            showEvent:"click",//默认触发事件
            hiddenEvent:"mouseleave", //默认隐藏事件
            isEnable:true,//默认可用
            setTime:200,//缓冲时间
            showComplete: function () {
                //完成显示回调  
            },
            hiddenComplete:function(){
                // 隐藏完成回调
            }
        }, options);

        if(funstyle != ""){
            if(funstyle == "getTouchTarget"){
                // 方法名 combo对象
                var combo = arguments[1];
                return getTouchTarget(combo);
            }else if(funstyle == "getShowTarget"){
                var combo = arguments[1];
                return getShowTarget(combo);
            }else if(funstyle == "hiddenTarget"){
                var combo = arguments[1];
                return hiddenShowTarget(combo);
            }
        }else{
            var combo = opts.combo;
            combo.touchTarget = combo.find("[combo]").first();
            combo.showTarget;
            combo.children(":gt(0)").each(function(i, e){
                if($(e).is("[combo='"+combo.touchTarget.attr("combo")+"']")){
                    combo.showTarget = $(e);
                }
            });
            // 获取 设置对象
            var getOption = combo.attr("opstion");
            var getValueElement = "";
            if(getOption){
                getOption = getOption.split(",");
                // 处理设置
                for(var i = 0; i < getOption.length; i++){
                    var o = getOption[i].split(":");
                    if(o[0] == "show"){
                        // showEvent = o[1];
                        opts.showEvent = o[1];
                    }else if(o[0] == "hidden"){
                        opts.hiddenEvent = o[1];
                    }
                }
            };
            var timeHanld = "";
            combo.enable = opts.isEnable;
            var eventTarget = combo.touchTarget.parent();
            if(eventTarget.is("[an-combo]")){
                eventTarget = combo.touchTarget;
            }

            if(opts.isEnable){
                eventTarget.unbind(opts.showEvent);
                eventTarget.bind(opts.showEvent, function(e){
                    if(combo.data("isEnable") && combo.data("isText") == false){
                        if(combo.hasClass("open")){
                            combo.showTarget.css("display", "none");
                            combo.removeClass("open");
                        }else{
                            if(combo.showTarget.is("ul") == false){
                                andy.formlayout();
                            }
                            combo.showTarget.css("display", "block");
                            combo.addClass("open");
                            opts.showComplete();
                        }
                    }
                });

                combo.on(opts.hiddenEvent, function(e){
                    timeHanld = setTimeout(function(){
                        combo.showTarget.css("display", "none");
                        // closeAll();
                        combo.removeClass("open");
                        opts.hiddenComplete();
                        timeHanld = "";
                    }, opts.setTime);
                });

                combo.mouseover(function(e){
                    if(timeHanld != ""){
                        clearTimeout(timeHanld);
                        timeHanld = "";
                    }
                });
            // }else{
                // 对于动作来说 把css样式 分离到 组件去
                // if(combo.touchTarget){
                //     combo.touchTarget.addClass("u-disabled");
                // }
            }

        }

        function getTouchTarget(combo){
            return combo.find("[combo]").first();
        }

        function getShowTarget(combo){
            var show;
            var touchTarget = combo.find("[combo]").first();
            combo.children(":gt(0)").each(function(i, e){
                if($(e).is("[combo='"+touchTarget.attr("combo")+"']")){
                    show = $(e);
                }
            });
            return show;
        }

        function hiddenShowTarget(combo){
            var showTarget = getShowTarget(combo);
            if(showTarget){
                showTarget.css("display", "none");
            }
            combo.removeClass("open");
        }
    };

    //浏览器启动全屏
    module.fullscreen=module.an_fullscreen = function () {
        //ie浏览启动器全屏(需要设置ie浏览器Internet选项-安全-Internet-自定义级别中-对未标记为可安全执行脚本的ActiveX控件初始化并执行脚本 点启用）
        var ieInto = function () {
            var wscript = new ActiveXObject("WScript.Shell");
            if (wscript != null) {
                wscript.SendKeys("{F11}");
            }
        }
        //非ie浏览器启动全屏
        var into = function (element) {
            if (element.requestFullscreen) {
                element.requestFullscreen();
            }
            else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            }
            else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            }
            else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
        }
        if (!!window.ActiveXObject || "ActiveXObject" in window) {
            ieInto();
        }
        else {
            into(window.top.document.documentElement);
        }
    };
    //退出全屏
    module.exitFullscreen = function () {
        //ie浏览退出器全屏
        var ieExit = function () {
            var wscript = new ActiveXObject("WScript.Shell");
            if (wscript != null) {
                wscript.SendKeys("{F11}");
            }
        }
        //非ie浏览器退出全屏
        var exit = function () {
            if (window.top.document.exitFullscreen) {
                window.top.document.exitFullscreen();
            }
            else if (window.top.document.mozCancelFullScreen) {
                window.top.document.mozCancelFullScreen();
            }
            else if (window.top.document.webkitExitFullscreen) {
                window.top.document.webkitExitFullscreen();
            }
        }
        if (!!window.ActiveXObject || "ActiveXObject" in window) {
            ieExit();
        }
        else {
            exit();
        }
    };

    //-----------------------------------------------小莹姐组件使用的公共方法

    
    /**
     * 销毁iframe，释放iframe所占用的内存。
     * 特别针对IE
     * @param iframe 需要销毁的iframe对象
     */
    module.destroyIframe = function(iframe){
        var i,ciframes;
        try{
            if(iframe.contentWindow && iframe.contentWindow.$){
                ciframes = iframe.contentWindow.$('iframe');
            }else {
                ciframes = iframe.contentWindow.document.getElementsByTagName("iframe");
            }

            //先销毁子页面的内存
            if(ciframes.length>0){
                for(i=0;i<ciframes.length;i++){
                    module.destroyIframe(ciframes[i]);
                }
            }
            //把iframe指向空白页面，这样可以释放大部分内存。
            iframe.src = 'about:blank';
        
            iframe.contentWindow.document.write('');
            iframe.contentWindow.document.clear();
        }catch(e){}
        //把iframe从页面移除
        if(iframe.parentNode){
            iframe.parentNode.removeChild(iframe);
        }
    };

    /***
     * 执行回调数组，主要用于组件模块的回调数组，
     * 要求每个函数必须有返回值，true表示继续正常执行，false
     * @param arr 函数数组
     * @param args 执行函数参数
     */
    module.arrayFunCall = function (arr, args) {
        var iden = true;
        if (arr.length > 0) {
            var i = 0;
            for (i; i < arr.length; i++) {
                if (typeof arr[i] === "function") {
                    iden = iden && arr[i](args);
                }
            }
        }
        return iden;
    };

    /**
     * 对象合并
     * @returns {*|{}} 任意个参数
     */
    module.extend = function () {
        var options, name, src, copy, copyIsArray, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;
        //如果第一个值为bool值，那么就将第二个参数作为目标参数，同时目标参数从2开始计数
        if (typeof target === "boolean") {
            deep = target;
            target = arguments[1] || {};
            // skip the boolean and the target
            i = 2;
        }
        // 当目标参数不是object 或者不是函数的时候，设置成object类型的
        if (typeof target !== "object" && !andy.isFunction(target)) {
            target = {};
        }
        //如果extend只有一个函数的时候，那么将跳出后面的操作
        if (length === i) {
            target = this;
            --i;
        }
        for (; i < length; i++) {
            // 仅处理不是 null/undefined values
            if ((options = arguments[i]) != null) {
                // 扩展options对象
                for (name in options) {
                    src = target[name];
                    copy = options[name];
                    // 如果目标对象和要拷贝的对象是恒相等的话，那就执行下一个循环。
                    if (target === copy) {
                        continue;
                    }
                    // 如果我们拷贝的对象是一个对象或者数组的话
                    if (deep && copy && ( andy.isPlainObject(copy) || (copyIsArray = andy.isArray(copy)) )) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && andy.isArray(src) ? src : [];
                        } else {
                            clone = src && andy.isPlainObject(src) ? src : {};
                        }
                        //不删除目标对象，将目标对象和原对象重新拷贝一份出来。
                        target[name] = andy.extend(deep, clone, copy);
                        // 如果options[name]的不为空，那么将拷贝到目标对象上去。
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }
        // 返回修改的目标对象
        return target;
    };

    //--------------------------------------------兼容老版本公共方法保留
    //敲击回车事件
    //an_enter({element:要绑定回车事件的dom节点、id、class,callback:回车事件中要执行的函数})----调用回车事件函数
    module.enter = function (element, callback) {
        var element = element == undefined ? document : element;
        $(element).keydown(function () {
            if (event.keyCode == 13) {
                callback();
            }
        })
    };
    //移除回车事件
    //an_unenter({element:要移除回车事件的dom节点、id、class})------调用移除回车事件函数
    module.unEnter = function (element) {
        $(element).off("keydown");
    }; 
    
    //自动滚动条
    module.scrollbar = function () {
        $('.scrollbar').each(function (index, element) {
            var scrh = $(this).height(), scrw = $(this).width();
            $(this).mCustomScrollbar(
                {
                    setWidth: scrw,
                    setHeight: scrh,
                    axis: "y",
                    scrollbarPosition: "inside",
                    autoDraggerLength: true,
                    autoHideScrollbar: true,
                    autoExpandScrollbar: true,
                    alwaysShowScrollbar: 0,
                    mouseWheel: {
                        enable: true
                    },
                    keyboard: {
                        enable: true
                    },
                    theme: "minimal-dark",
                    scrollInertia: 800,
                    live: 'on'
                });
        });
    };

    //默认图片...
    module.img = function (element) {
        if(element && element.is("img[src='#']")){
            var imgW = element.width(), imgH = element.height();
            if (element.attr('title') == '' || element.attr('title') == undefined) {
                var imgtitle = '';
            }
            else {
                var imgtitle = element.attr('title') + ' ';
            }
            element.removeAttr('src').attr('data-src', 'holder.js/' + imgW + 'x' + imgH + '?font=Lucida Family&text=' + imgtitle + imgW + '×' + imgH);
        }else{
            // $("img[src='#']").each(function (index, element) {
            //     var imgW = $(this).width(), imgH = $(this).height();
            //     if ($(this).attr('title') == '' || $(this).attr('title') == undefined) {
            //         var imgtitle = '';
            //     }
            //     else {
            //         var imgtitle = $(this).attr('title') + ' ';
            //     }
            //     $(this).removeAttr('src').attr('data-src', 'holder.js/' + imgW + 'x' + imgH + '?font=Lucida Family&text=' + imgtitle + imgW + '×' + imgH);
            // });
        }
        
    };

    //页面跳转...
    module.url = function (url, target) {
        if (target == 'top') {
            top.location = url;
        }
        else if (target == 'self') {
            self.location = url;
        }
        else {
            window.top.contentWindow.find(target).attr('src', url);
        }
    };
    //ajax加载...
    module.dataurl = function () {
        $("[data-url]").each(function () {
            var dataurl = $(this).attr('data-url');
            var datacallback = $(this).attr('data-callback');
            $(this).load(dataurl, datacallback);
        });
    };
    //a链接默认失效
    module.a = function () {
        $("[href='#']").each(function (index, element) {
              $(this).attr('href', 'javascript:void(0)');
        });
    };
    //单选多选样式渲染
    module.checked = function () {
        $(".an_checkbox").each(function (index, element) {
            var $this = $(element),
                $text = $this.attr('title'),
                packagee = '';
            if ($this.attr('type') == 'checkbox' && $this.hasClass('switch') == false) {
                packagee = '<label class="i-checks"></label>'
            }
            else if ($this.attr('type') == 'radio') {
                packagee = '<label class="i-checks"></label>'
            }
            else if ($this.attr('type') == 'checkbox' && $this.hasClass('switch')) {
                packagee = '<label class="i-switch m-r-sm"></label>';
                $text = '<span class="textmax">' + $this.attr('title') + '</span>';
            }
            if ($this.parent().is('label')) {
                //已经封装过的选择器不在渲染
                return false
            }
            else {
                $this.wrap(packagee);
                $this.after(' <i></i>' + $text);
            }
            var clickbox = $this.parent();
            if ($this.hasClass('checkbox-inline')) {
                clickbox.addClass('checkbox-inline');
            }
        });
    };
    
    module.closesearch = function (e, h, i) {
        var t = $(e).text();
        if (t == '高级搜索') {
            $(i).layout('panel', 'north').panel('resize', {
                height: h
            });
            $(i).layout('resize');
            $(e).text('关闭搜索');
        }
        if (t == '关闭搜索') {
            $(i).layout('panel', 'north').panel('resize', {
                height: 1
            });
            $(i).layout('resize');
            $(e).text('高级搜索');
        }
    };

    // 实际渲染测试
    module.miniDialog = function(options){
        var op = $.extend({}, {
            content:""
        }, options)

        var body = $("body");
        body.find(".m-alertbox").length>0?null:body.append("<div class = 'm-alertbox t-m'></div>");
        var alertBox = body.find(".m-alertbox");
        alertBox.append("<div class = 'minidialog'>"+op.content+"</div>");
        var dialog = body.find(".minidialog:last");
        dialog.css({
            "background":"#000",
            "background-color":"rgba(0, 0, 0, 0.4)",
            "text-align":"center",
            "padding":"10px",
            "word-wrap": "break-word",
            "margin-top":"10px",
            "color":"#fff"
        })
        setTimeout(function(){
            dialog.remove()
        }, 3000)
    }
    module.setDebug = function(state){
        module.debug = state;
    }
    module.getDebug = function(){
        module.debug?null:module.debug = "close";
        return module.debug;
    }

    module.startCheck = function(str){
        var debug = module.getDebug();
        module.costTime = 0;
        module.costTitle = str||"";
        module.checkHanld = null;
        debug == "open"?module.checkHanld = setInterval(function(){
            module.costTime += 1;
        }, 1):null;
    }
    
    module.endCheck = function(){
        var debug = module.getDebug();
        if(debug == "open"){
            module.checkHanld?clearInterval(module.checkHanld):null;
            module.miniDialog({
            content:module.costTitle+module.costTime
            })
            module.costTime = 0;
            module.costTitle = "";
        }
    }

    window.andy = module;
})(window);
/*
    布局、定位
*/

(function (window) {
    var module = {};

    //浮动面板
    module.floatbox = function (a) {
        if(a.is('.top')){
            if(a.is(':hidden')){
                a.show()
                    var floath=a.outerHeight();
                    a.css('top',0-floath-5+'px').animate({top:'0px'},300);
                }
            else {
                var floath=a.outerHeight();
                a.animate({top:0-floath-5+'px'},300,function(){a.hide()});
            }
        }

        if(a.is('.bottom')){
            if(a.is(':hidden')){
                a.show()
                var floath=a.outerHeight();
                a.css('bottom',0-floath-5+'px').animate({bottom:'0px'},300);
            }
            else {
                var floath=a.outerHeight();
                a.animate({bottom:0-floath-5+'px'},300,function(){a.hide()});
            }
        }
        if(a.is('.left')){
            if(a.is(':hidden')){
                a.show()
                var floatw=a.outerWidth();
                a.css('left',0-floath-5+'px').animate({left:'0px'},300);
            }else {
                var floath=a.outerWidth();
                a.animate({left:0-floath-5+'px'},300,function(){a.hide()});
            }
        }

        if(a.is('.right')){
            if(a.is(':hidden')){
                a.show()
                var floatw=a.outerWidth();
                a.css('right',0-floath-5+'px').animate({right:'0px'},300);
            }else {
                var floath=a.outerWidth();
                a.animate({right:0-floath-5+'px'},300,function(){a.hide()});
           }
        }
    };
    //浮动面板事件响应
    module.floatact = function () {
        $("[an-float]").each(function(index, element) {
            var act=$(this).attr('option');
            if(act=='click'){
                $(this).click(function(){andy.floatbox($(this))})
                }
            else if(act=='leave'){
                $(this).on("mouseleave", function(){
                    andy.floatbox($(this));
                    })
                }
        });
    };
    // 自动执行
    module.perform = function(e){
        var body = $("body");
        if(e){
            body = e;
            // body.css("overflow", "");
        };
        // 元件类功能执行
        for(var i = 0;i<andy.UI_PERFORM.length;i++){
            var name = andy.UI_PERFORM[i];
            if(name == "u-switch"){
                // body.find("." + name).each(function(index, cell){
                //     $(cell).switchs();
                // });
                if(body.hasClass(name)){
                    body.switchs();
                }
            };
        };
        // 控件tabs accrodion datagrid等执行
        for(var i = 0;i<andy.UI_ATTR.length;i++){
            var name = andy.UI_ATTR[i];
            // body.find("["+name+"]").each(function(i, e){
            //     var ui = $(e);
            //     if(!ui.attr(name)){
            //         ui.attr(name, name)
            //         ui[name.replace("-", "_")]({});
            //     }
            // })
            if(body.is("["+name+"]")){
                if(!body.attr(name)){
                    body.attr(name, name)
                    body[name.replace("-", "_")]({});
                }
            }
        };

        if(body.children("div,input,form,table,thead,tbody,th,tr,td,img,ul,li,a").length>0){
            body.children("div,input,form,table,tbody,th,tr,td,img,ul,li,a").each(function(index, cell){
                var cell = $(cell);
                if(cell.is("img")){
                    andy.img(cell);
                }
                // 屏蔽隔断判断
                if(!cell.hasClass(andy.UI_SHIELDING) && !cell.hasClass(andy.UI_SHIELDING_PERFORM) && !cell.is("[autoxmpcode=true]")){
                    andy.perform(cell)
                }
            })
        }
        
    };
    
    module.layout = function(e){
        // 浏览器是ie6 ie6是否开启渲染
        if(andy.IE() == 6 && andy.LAYOUT_IE6 == false){
            return false;
        };

        var body = $("body");
        if(e){
            body = e;
            // body.css("overflow", "");
        };

        body.each(function(index, element){
            var $element = $(element);
            var parentWidth, parentHeight;
            if($element.parent().is('body')){
                parentWidth=$(window).width();
                parentHeight=$(window).height();
                // alert("body:"+parentWidth+ parentHeight);
            }else{
                var parentElement = $element.parent();
                if(parentElement.is("form")){
                    parentElement = parentElement.parent();
                }
                parentWidth=parentElement.width();
                parentHeight=parentElement.height();
            };
            for(var i = 0;i<andy.UI_LAYOUT.length;i++){
                var name = andy.UI_LAYOUT[i];
                if($element.hasClass(name)){
                    if(name == "g-layout"){
                        //设置框架各个元素的尺寸
                        andy.autolayout($element,parentWidth,parentHeight);
                    }else if(name == "g-max"){
                        andy.gmax($element);//最大化
                    }else if(name == "g-h-max"){
                        andy.hmax($element);//高度填充
                    }else if(name == "g-w-max"){
                        andy.wmax($element);//宽度最大化 分割
                    }else if(name == "g-h-auto"){
                        andy.hauto($element);
                    }else if(name == "g-w-auto"){
                        andy.wauto($element);
                    };
                    
                };
            };
            for(var i = 0;i<andy.UI_ATTR.length;i++){
                var name = andy.UI_ATTR[i]; 
                // ["an-tabs", "an-accordion", "an-datagrid"]
                var attrName = $element.attr(name);
                if(attrName == "an-tabs"){
                    andy.tabsLayout($element);
                }else if(attrName == "an-datagrid"){
                    andy.datagridLayout($element);
                };
            };
            if($element.children("div").length > 0){
                // 处理子集为DIV的对象
                $element.children("div").each(function(i, el){
                    var div = $(el);
                    if(!div.hasClass("f-hidden") && !div.hasClass("item") && !div.hasClass(andy.UI_SHIELDING) && !div.hasClass(andy.UI_SHIELDING_LAYOUT) && !div.is("[autoxmpcode=true]")){
                        andy.layout(div);
                    }
                });
                // 渲染表单问题 待处理
                andy.formlayout();
            }else if($element.children("table,form").length > 0){
                // 处理子集为table的对象
                $element.children("table,form").each(function(i, el){
                    var cell = $(el);
                    if(!cell.hasClass(andy.UI_SHIELDING) && !cell.hasClass(andy.UI_SHIELDING_LAYOUT) && !cell.is("[autoxmpcode=true]")){
                        andy.layout(cell); 
                        // 渲染表单问题 待处理
                        andy.formlayout(cell);
                    }
                });
                
            }else if($element.children("iframe").length > 0){
                // console.log($element.children("iframe"))
                // IE6强制刷新
                var ieversion = andy.IE();
                if(ieversion <= 8 && ieversion != 0){
                    var iframe = $element.children("iframe");
                    if(iframe[0].contentWindow&&iframe[0].contentWindow.andy){
                        iframe[0].contentWindow.andy.layout();
                    }
                    //var src = iframe.attr("src");
                    //iframe.attr("src", src);
                };
            };
        });
        
    };

    // 执行渲染 和功能
    module.activeTarget = function(e){
        var body = $("body");
        if(e){
            body = e;
            // body.css("overflow", "");
        };
        andy.perform(e)
        andy.layout(e)
    }

    //tabs布局
    module.tabsLayout = function(tabs){
        var pheight = tabs.parent().height();
        var pwidth = tabs.parent().width();
        var tabsDiv = tabs[0];
        if (tabsDiv.option && tabsDiv.option.fit == false){
            if(tabsDiv.option.height > 0){
                pheight = tabsDiv.option.height;
            };
            if(tabsDiv.option.width > 0){
                pwidth = tabsDiv.option.width;
            };
        }
        var head = tabs.children(".m-tabs-header");
        var body = tabs.children(".m-tabs-content");
        var item = body.children(".item");
        var bodyPadding = parseInt(item.css("padding-left"));
        var _stringclass = {
            head:"m-tabs-header",
            body:"m-tabs-content",
            hidden:"f-hidden",
            layouted:"layouted",
            item:"item",
            active:"activate",
            headTop:"head-top",
            headLeft:"head-left",
            headRight:"head-right",
            headBottom:"head-bottom"
        };
        if(typeof(bodyPadding) != "number"){
            bodyPadding = 0;
        }
        
        var headHeight = 0;//head.outerHeight() + bodyPadding *2;
        var headWidth = 0;
        if(!tabs.hasClass(_stringclass.headTop) && !tabs.hasClass(_stringclass.headLeft) && !tabs.hasClass(_stringclass.headRight) && !tabs.hasClass(_stringclass.headBottom)){
            headHeight = head.outerHeight();
        }else if(tabs.hasClass(_stringclass.headTop)){
            headHeight = head.outerHeight();
        }else if(tabs.hasClass(_stringclass.headLeft)){
            headWidth = head.outerWidth();
        }else if(tabs.hasClass(_stringclass.headRight)){
            headWidth = head.outerWidth();
        }else if(tabs.hasClass(_stringclass.headBottom)){
            headHeight = head.outerHeight();
        }
        // tabs.height(pheight).width(pwidth);
        tabs.outerHeight(pheight).outerWidth(pwidth);
        body.outerHeight(pheight - headHeight).outerWidth(pwidth - headWidth);
        var bodyHeight = body.height();
        var bodyWidth = body.width();
        // body.height(pheight - headHeight).width(pwidth - headWidth);
        body.children().each(function(index, content){
            var $content = $(content);
            $content.removeClass(_stringclass.layouted);
            $content.outerHeight(bodyHeight).outerWidth(bodyWidth);
            // 响应式布局 后渲染当前选中页面
            if($content.hasClass(_stringclass.active)){
                andy.layout($content);
            }
        });
    }

    //datagrid布局
    module.datagridLayout = function(datagrid){
        var pheight = datagrid.parent().parent().parent().height();
        var pwidth = datagrid.parent().parent().parent().width();
        // console.log(pheight, pwidth, datagrid.offsetParent());
        datagrid.an_tableLayout(datagrid, pwidth, pheight);
    }

    module.autolayout = function(element,pw,ph){
        if(element[0]){
            element.outerWidth(pw).outerHeight(ph);
        }
        var layout = element;
        var layhead = layout.children(".layout-head");
        var layleft = layout.children(".layout-left");
        var layright = layout.children(".layout-right");
        var layfoot = layout.children(".layout-foot");
        var laycenter = layout.children(".layout-center");

        if(layhead[0]){
            // layhead.width(pw);
            layhead.outerWidth(pw);
        };

        if(layfoot[0]){
            // layfoot.width(pw);
            layfoot.outerWidth(pw);
        };

        if(layleft[0]){
            var layheadHeight = 0;
            var layfootHeight = 0;

            if(layhead[0]){
                layheadHeight = layhead.height();
            };
            if(layfoot[0]){
                layfootHeight = layfoot.height();
            };
            layleft.height(ph - layheadHeight - layfootHeight);
            layleft.css('top',layheadHeight+'px');
        };

        if(layright[0]){
            var layheadHeight = 0;
            var layfootHeight = 0;
            if(layhead[0]){
                layheadHeight = layhead.height();
            };
            if(layfoot[0]){
                layfootHeight = layfoot.height();
            };

            layright.height(ph - layheadHeight - layfootHeight);
            layright.css('top',layheadHeight+'px');
        };

        if(laycenter[0]){
            var layleftWidth = 0;
            var layrightWidth = 0;
            var layheadOuterHeight = 0;
            var layfootOuterHeight = 0;
            var layleftOuterWidth = 0;
            var layrightOuterWidth = 0;

            if(layleft[0]){
                layleftWidth = layleft.width();
                layleftOuterWidth = layleft.outerWidth();
            };
            if(layright[0]){
                layrightWidth = layright.width();
                layrightOuterWidth = layright.outerWidth();
            };
            if(layhead[0]){
                layheadOuterHeight = layhead.outerHeight();
            };
            if(layfoot[0]){
                layfootOuterHeight = layfoot.outerHeight();
            };
            // 注释的是 以前计算方式
            // laycenter.width(pw - layleftWidth - layrightWidth);
            // laycenter.height(ph - layheadOuterHeight - layfootOuterHeight);
            laycenter.outerWidth(pw - layleftOuterWidth - layrightOuterWidth);
            laycenter.outerHeight(ph - layheadOuterHeight - layfootOuterHeight);
            laycenter.css({'top':layheadOuterHeight+'px','left':layleftOuterWidth+'px'});
            // alert(layheadOuterHeight, layleftWidth, layrightWidth);
        };

        if(laycenter.children().is('iframe')){
            var h = laycenter.height();
            andy.hauto(laycenter.children('iframe'));//高度填充
            laycenter.css('overflow','hidden');
        };
    };

    // 获取对象填充内容宽高
    module.getInnerSize = function(element){
        var obj = {
            innerWidth:0,
            innerHeight:0
        };

        var elementParent = element.parent();
        var parenth = elementParent.innerHeight();
        if(elementParent.css("padding-top")){
            parenth -= parseInt(elementParent.css("padding-top"));
        }
        if(elementParent.css("padding-bottom")){
            parenth -= parseInt(elementParent.css("padding-bottom"));
        }
        var parentw = elementParent.innerWidth();
         if(elementParent.css("padding-left")){
            parentw -= parseInt(elementParent.css("padding-left"));
        }
        if(elementParent.css("padding-right")){
            parentw -= parseInt(elementParent.css("padding-right"));
        }

        obj.innerWidth = parentw;
        obj.innerHeight = parenth;
        return obj;
    }
    
    //动态高度填充 上下平分
    module.hmax = function(element){
        var obj = andy.getInnerSize(element);
        var parenth = obj.innerHeight;
        var parentw = obj.innerWidth;
        var hmaxn = element.siblings('.g-h-max').length + 1;
        // var sibls = $(element).siblings().not('.g-h-max');
        var sibls = $(element).siblings(':not(.g-h-max)');
        var sibl = sibls.not('.u-float');
        var siblingn = sibl.length;
        var sum = 0;
        for (var i = 0; i < siblingn; i++) {
            sum += $(sibl[i]).outerHeight();
        };
        // var hmaxH = parseInt((parenth - sum) / hmaxn);
        // 求余 计算浮点数
        var yu = (parenth - sum) % hmaxn;
        var hmaxH = Math.floor((parenth - sum) / hmaxn);
        if(element.index() < yu){
            hmaxH = hmaxH + 1;
        }
        // 关于 padding  border
        // element.height(hmaxH).outerWidth(parentw);
        element.outerHeight(hmaxH, true).outerWidth(parentw, true);
    };

    // 纯h
    module.hauto = function(element){
        var obj = andy.getInnerSize(element);
        var parenth = obj.innerHeight;
        var hmaxn = element.siblings('.g-h-auto').length + 1;
        // var sibls = $(element).siblings().not('.g-h-auto');
        var sibls = $(element).siblings(':not(.g-h-auto)');
        var sibl = sibls.not('.u-float');
        var siblingn = sibl.length;
        var sum = 0;
        for (var i = 0; i < siblingn; i++) {
            sum += $(sibl[i]).outerHeight();
        };
        // 求余 计算浮点数
        var yu = (parenth - sum) % hmaxn;
        var hmaxH = Math.floor((parenth - sum) / hmaxn);
        if(element.index() < yu){
            hmaxH = hmaxH + 1;
        }
        // 关于 padding  border
        element.outerHeight(hmaxH, true)
    };

    // 动态宽度填充
    module.wmax = function(element){
        var obj = andy.getInnerSize(element);
        var parenth = obj.innerHeight;
        var parentw = obj.innerWidth;
        var wmaxn = element.siblings('.g-w-max').length + 1;
        // var sibls = $(element).siblings().not('.g-w-max');
        var sibls = $(element).siblings(':not(.g-w-max)');
        var sibl = sibls.not('.u-float');
        var siblingn = sibl.length;
        var sum = 0;
        for (var i = 0; i < siblingn; i++) {
            sum += $(sibl[i]).outerWidth();
        };
        // 求余 计算浮点数
        var yu = (parentw - sum) % wmaxn;
        var wmaxH = Math.floor((parentw - sum) / wmaxn);
        if(element.index() < yu){
            wmaxH = wmaxH + 1;
        }
        element.outerHeight(parenth, true).outerWidth(wmaxH, true);
    }

    //纯w
    module.wauto = function(element){
        var obj = andy.getInnerSize(element);
        var parentw = obj.innerWidth;
        var wmaxn = element.siblings('.g-w-auto').length + 1;
        // var sibls = $(element).siblings().not('.g-w-auto');
        var sibls = $(element).siblings(':not(.g-w-auto)');
        var sibl = sibls.not('.u-float');
        var siblingn = sibl.length;
        var sum = 0;
        for (var i = 0; i < siblingn; i++) {
            sum += $(sibl[i]).outerWidth();
        };
        // 求余 计算浮点数
        var yu = (parentw - sum) % wmaxn;
        var wmaxH = Math.floor((parentw - sum) / wmaxn);
        if(element.index() < yu){
            wmaxH = wmaxH + 1;
        }
        element.outerWidth(wmaxH, true);
    }

    //动态处理填充尺寸溢出
    module.gmax = function(element){
        var obj = andy.getInnerSize(element);
        var parenth = Math.floor(obj.innerHeight);
        var parentw = Math.floor(obj.innerWidth);
        // 考虑了边框问题
        element.outerWidth(parentw, true);
        element.outerHeight(parenth, true);
    };

    //动态处理u-panel结构 针对panel-head\panel-body\panel-foot布局
    module.panelauto = function(){
        $('.u-panel.u-datagrid').each(function(index, element) {
            var upanel = $(element);
            var Pw=upanel.parent().width(), Ph=upanel.parent().height();
            upanel.height(Ph);
            var panelheight = upanel.outerHeight();
            var head = upanel.children(".panel-head");
            var body = upanel.children(".panel-body");
            var foot = upanel.children(".panel-foot");

            if(body[0]){
                body.height(panelheight - (head.outerHeight()||0) - (foot.outerHeight()||0));
            }
        }); 

        // var windowWidth = $('.u-panel.window').parent().outerWidth();
        // $('.u-panel.window').width(windowWidth);
        $('.u-panel.window').each(function(index, element) {
            var upanel = $(element);
            var padding_top = parseInt(upanel.parent().css("padding-top"));
            var padding_bottom = parseInt(upanel.parent().css("padding-bottom"));
            var Pw=upanel.parent().width(), Ph=upanel.parent().height() - padding_top - padding_bottom;
            // upanel.css("height", Ph);
            upanel.height(Ph);
            var panelheight = upanel.height();//parseInt(upanel.css("height"));
            var head = upanel.children(".panel-head");
            var body = upanel.children(".panel-body");
            var b_padding_top = parseInt(body.css("padding-top"));
            var b_padding_bottom = parseInt(body.css("padding-bottom"));
            var foot = upanel.children(".panel-foot");

            if(body){
                body.height(panelheight - (head.outerHeight()||0) - (foot.outerHeight()||0) - b_padding_top - b_padding_bottom);
            };
        }); 
    };

    //ui布局渲染
    module.uiLayout = function(element){
        // andy.UI_ATTR
        for(var i = 0;i<andy.UI_ATTR.length;i++){
            // console.log(element.children().find("["+name+"]"))
            var name = andy.UI_ATTR[i];
            element.children().find("["+name+"]").trigger("layout");
        }
        
    };
    /**
     * 表单布局
     */
    module.formlayout = function(target){
        $(".m-table-form.inline").find(".u-formitem").each(function(index, element){
            var $element = $(element);
            var thisW = $element.width(),
                thisPH = $element.parent().height();
            // 设置td高度 下面内容是以td高度为准
            // 现在新的 高度是 CSS处理的
            // if($element.hasClass("u-input-span")){
            //     $element.parent().height(thisPH);
            // };

            var maxHeight = 0;
            $element.parent().parent().find('.u-input-span, .u-input, textarea, .g-combo').each(function(i, e){
                // 获取到所有TD内容的 最大高度
                var cell = $(e);
                if(maxHeight == 0){
                    maxHeight = cell.outerHeight();
                }else if(cell.outerHeight() > maxHeight){
                    maxHeight = cell.outerHeight();
                };
            });

            $element.parent().siblings().each(function(i, e){
                var cell = $(e);
                cell.height(maxHeight);
            });
            $element.parent().height(maxHeight);
        })

        // 日期选择器
        $(".u-time-group").find(".u-time-input").each(function(i, e){
            // 屏蔽是因为解决了字体图标的问题
            var input = $(e);
            andy.inputLayout(input);
        });

        if(target){
            target.find(".u-group .u-input, .u-group .g-combo").each(function(i, e){
                // 屏蔽是因为解决了字体图标的问题
                var input = $(e);
                
                if(input.parent().hasClass("m-tooltip")){
                    andy.inputLayout(input.parent());
                }else{
                    andy.inputLayout(input);
                }
                
            });
        }else{
            // andy.fromInit()
            $(".u-group").find(".u-input, .g-combo").each(function(i, e){
                // 屏蔽是因为解决了字体图标的问题
                var input = $(e);
                
                if(input.parent().hasClass("m-tooltip")){
                    andy.inputLayout(input.parent());
                }else{
                    andy.inputLayout(input);
                }
                
            });
        }
    }

    // input布局
    module.inputLayout = function(input){
        var pw = input.parent().width();
        var cw = 0;
        var otherInputCounts = 1;
        if(input.parent().hasClass("u-time-input")){
            return false;
        }
        input.siblings().each(function(j, element){
            // 处理验证TOOLTIP 宽度
            var other = $(element);
            if(other.hasClass("infobox") == false && other.hasClass("u-nd") == false && other.hasClass("u-input") == false && other.hasClass("u-time-input") == false){
                if(input.hasClass("u-input") && other.hasClass("g-combo")){
                    pw -= other.outerWidth();
                }else if(other.hasClass("g-combo") == false && other.hasClass("u-time-input") == false){
                    pw -= other.outerWidth();
                }
            };
            if(input.hasClass("u-input") && other.hasClass("u-input") || input.hasClass("g-combo") && other.hasClass("g-combo") || input.hasClass("u-time-input") && other.hasClass("u-time-input")){
                otherInputCounts += 1;
            }
            if(other.hasClass("item-r")){
                other.css({
                    "position":"absolute",
                    "right":"0",
                    "top":"0"
                })
            }
        });

        // 求余 计算浮点数
        var yu = pw % otherInputCounts;
        var wmaxH = Math.floor(pw / otherInputCounts);
        if(input.index() < yu){
            wmaxH = wmaxH + 1;
        }
        input.outerWidth(wmaxH, true);
        // input.outerWidth(Math.floor(pw/otherInputCounts));
        // 表单里面的ul宽度
        if(input.parent().parent().hasClass("g-combo")){
            var touchTarget = andy.combo("getTouchTarget", input);
            var showTarget = andy.combo("getShowTarget", input);
            
            if(touchTarget && showTarget){
                showTarget.width(input.width());
            }
        }
    };

    //收缩layout
    module.shrinkageLayout = function(options){
        var opts = $.extend({
            element:"", //传入操作对象
            min:0,//收缩最小值
            max:100,//收缩最大值
            direction:"v",//收缩方向 v垂直 l水平
            isAnimation:true,//是否有动画效果
            time:100,//动画作用时间 毫秒
            layout:true,//框架重布局
            shrinkageBefore:function(){},//收缩之前做的操作
            callback: function () {
            } //默认回调
        }, options);

        var element = opts.element;
        var oldHeight = element.height();
        var oldWidth = element.width();
        var min = opts.min;
        var max = opts.max;
        var time = opts.time;
        var aniOver = function(){
            if(opts.layout){
                $.fn.layoutMain();
            }
            opts.callback(element);
        };

        if(!opts.isAnimation){
            time = 0;
        }

        opts.shrinkageBefore();

        if(opts.direction == "v"){
            if(element.height() != min){
                element.animate({height:min + 'px'}, time, aniOver);
            }else{
                element.animate({height:max + 'px'}, time, aniOver);
            }
        }

        if(opts.direction == "l"){
            if(element.width() != min){
                element.animate({width:min + 'px'}, time, aniOver);
            }else{
                element.animate({width:max + 'px'}, time, aniOver);
            }
        }
    };
    window.andy = $.extend({}, true, window.andy, module);
})(window);

(function ($) {
    $.fn.an_queue = function (options) {
        var fun = options.queue;
        $(this).queue("goqueue", fun);
        // $.fn.an_queue.start();
    };
    $.fn.an_queue.next = function (time) {
        var $this = $(this);
        if (time) {
            var s = setTimeout(function () {
                $this.dequeue("goqueue");
            }, time)
        }
        else {
            $this.dequeue("goqueue");
        }
    };
    //图片加载等待
    $.fn.an_imgLoad = function (options) {
        var opts = $.extend({
            time: 4000, ///等待载入时间，如果超过这个时间就直接执行回调
            callback: function () {
            } //默认回调
        }, options);
        var $this = this, i = 0, j = 0, len = this.length;
        $this.each(function () {
            var _this = this, dateSrc = $(_this).attr("date-src"), imgsrc = dateSrc ? dateSrc : _this.src;
            var img = new Image();
            img.onload = function () {
                img.onload = null;
                _this.src = imgsrc;
                i++;
            };
            img.src = imgsrc;
        });
        var t = window.setInterval(function () {
            j++;
            //$("#msg").html(i);
            if (i == len || j * 200 >= opts.time) {
                window.clearInterval(t);
                opts.callback();
            }
        }, 200);
    };

    $.fn.layoutMain = function(){
        if(andy.IE() == 6){
            //框架执行
            if(andy.LAYOUT_IE6){
                andy.layout();
            };
        }else{
            andy.layout();
            // andy.formlayout();
        };
    };
    $(function(){
        $.fn.layoutMain();
        andy.perform();//自动执行
        //默认执行图片占位
        // andy.img();
        andy.floatact();//浮动面板响应动作
        andy.a();//浮动面板响应动作
    });
})(jQuery);

//andy.loading("top", "正在加载...");

$(document).ready(function(){
    var t = null;
    var setTime = andy.SETTIME_02;
    //andy.closeoverlay();
    $(window).resize(function(e){
        if(t){
            window.clearTimeout(t);
        };
        t = window.setTimeout(function(){
            $.fn.layoutMain();
            t = null;
            if(andy.IE() > 7 || andy.IE() == 0){
                // 关于 收缩屏幕渲染问题
                t = window.setTimeout(function(){
                    $.fn.layoutMain();
                    t = null;
                }, setTime/2);
            };

        }, setTime);
    })
});/*
 浏览器识别操作
 */

(function (window) {
    var module = {}, BROWSER;
    // 获取浏览器
    module.getBrowser = function () {
        var pf = (navigator.platform || "").toLowerCase(),
            ua = navigator.userAgent.toLowerCase(),
            s;
        if (BROWSER) {
            return BROWSER;
        }
        BROWSER = {};
        function toFixedVersion(ver, floatLength) {
            ver = ("" + ver).replace(/_/g, ".");
            floatLength = floatLength || 1;
            ver = String(ver).split(".");
            ver = ver[0] + "." + (ver[1] || "0");
            ver = Number(ver).toFixed(floatLength);
            return ver;
        }

        function updateProperty(target, name, ver) {
            target = BROWSER[target]
            target.name = name;
            target.version = ver;
            target[name] = ver;
        }

        // 提供三个对象,每个对象都有name, version(version必然为字符串)
        // 取得用户操作系统名字与版本号，如果是0表示不是此操作系统
        var platform = BROWSER.platform = {
            name: (window.orientation != undefined) ? 'iPod' : (pf.match(/mac|win|linux/i) || ['unknown'])[0],
            version: 0,
            iPod: 0,
            iPad: 0,
            iPhone: 0,
            android: 0,
            win: 0,
            linux: 0,
            mac: 0
        };

        (s = ua.match(/windows ([\d.]+)/)) ? updateProperty("platform", "win", toFixedVersion(s[1])) :
            (s = ua.match(/windows nt ([\d.]+)/)) ? updateProperty("platform", "win", toFixedVersion(s[1])) :
                (s = ua.match(/linux ([\d.]+)/)) ? updateProperty("platform", "linux", toFixedVersion(s[1])) :
                    (s = ua.match(/mac ([\d.]+)/)) ? updateProperty("platform", "mac", toFixedVersion(s[1])) :
                        (s = ua.match(/ipod ([\d.]+)/)) ? updateProperty("platform", "iPod", toFixedVersion(s[1])) :
                            (s = ua.match(/ipad[\D]*os ([\d_]+)/)) ? updateProperty("platform", "iPad", toFixedVersion(s[1])) :
                                (s = ua.match(/iphone ([\d.]+)/)) ? updateProperty("platform", "iPhone", toFixedVersion(s[1])) :
                                    (s = ua.match(/android ([\d.]+)/)) ? updateProperty("platform", "android", toFixedVersion(s[1])) : 0;
        //============================================
        //取得用户的浏览器名与版本,如果是0表示不是此浏览器
        var browser = BROWSER.browser = {
            name: "unknown",
            version: 0,
            ie: 0,
            firefox: 0,
            chrome: 0,
            opera: 0,
            safari: 0,
            mobileSafari: 0,
            adobeAir: 0 //adobe 的air内嵌浏览器
        };

        (s = ua.match(/trident.*; rv\:([\d.]+)/)) ? updateProperty("browser", "ie", toFixedVersion(s[1])) : //IE11的UA改变了没有MSIE
            (s = ua.match(/msie ([\d.]+)/)) ? updateProperty("browser", "ie", toFixedVersion(s[1])) :
                (s = ua.match(/firefox\/([\d.]+)/)) ? updateProperty("browser", "firefox", toFixedVersion(s[1])) :
                    (s = ua.match(/chrome\/([\d.]+)/)) ? updateProperty("browser", "chrome", toFixedVersion(s[1])) :
                        (s = ua.match(/opera.([\d.]+)/)) ? updateProperty("browser", "opera", toFixedVersion(s[1])) :
                            (s = ua.match(/adobeair\/([\d.]+)/)) ? updateProperty("browser", "adobeAir", toFixedVersion(s[1])) :
                                (s = ua.match(/version\/([\d.]+).*safari/)) ? updateProperty("browser", "safari", toFixedVersion(s[1])) : 0;

        //下面是各种微调
        //mobile safari 判断，可与safari字段并存
        (s = ua.match(/version\/([\d.]+).*mobile.*safari/)) ? updateProperty("browser", "mobileSafari", toFixedVersion(s[1])) : 0;

        if (platform.iPad) {
            updateProperty("browser", 'mobileSafari', '0.0');
        }

        if (browser.ie) {
            if (!document.documentMode) {
                document.documentMode = Math.floor(browser.ie);
                //http://msdn.microsoft.com/zh-cn/library/cc817574.aspx
                //IE下可以通过设置 <meta http-equiv="X-UA-Compatible" content="IE=8"/>改变渲染模式
                //一切以实际渲染效果为准
            } else if (document.documentMode !== Math.floor(browser.ie)) {
                updateProperty("browser", "ie", toFixedVersion(document.documentMode));
            }
        }
        //============================================
        //取得用户浏览器的渲染引擎名与版本,如果是0表示不是此浏览器
        BROWSER.engine = {
            name: 'unknown',
            version: 0,
            trident: 0,
            gecko: 0,
            webkit: 0,
            presto: 0
        };

        (s = ua.match(/trident\/([\d.]+)/)) ? updateProperty("engine", "trident", toFixedVersion(s[1])) :
            (s = ua.match(/gecko\/([\d.]+)/)) ? updateProperty("engine", "gecko", toFixedVersion(s[1])) :
                (s = ua.match(/applewebkit\/([\d.]+)/)) ? updateProperty("engine", "webkit", toFixedVersion(s[1])) :
                    (s = ua.match(/presto\/([\d.]+)/)) ? updateProperty("engine", "presto", toFixedVersion(s[1])) : 0;

        if (BROWSER.browser.ie) {
            if (BROWSER.browser.ie == 6) {
                updateProperty("engine", "trident", toFixedVersion("4"));
            } else if (browser.ie == 7 || browser.ie == 8) {
                updateProperty("engine", "trident", toFixedVersion("5"));
            }
        }
        return BROWSER;
    };
    module.getBrowser();
    //IEtest 浏览器甄别
    module.IE = function () {
        var ie = BROWSER.browser.ie;
        var ieVersion = parseInt(ie, 10);
        return ieVersion;
    };
    // 判断是否是谷歌浏览器
    module.isChrome = function () {
        return BROWSER.browser.name === "chrome";
    };
    // 判断是否是火狐浏览器
    module.isFirefox = function () {
        return BROWSER.browser.name === "firefox";
    };

    // 获取浏览器名称及其版本
    module.getBrowserEngine = function () {
        return BROWSER.engine;
    };
    window.andy = $.extend({}, true, window.andy, module);
})(window);/*
  颜色操作
*/

(function (window) {
    var module = {};
    //随机颜色获取
    module.getRandomColor = function () {
        return "#" + ("00000" + ((Math.random() * 16777215 + 0.5) >> 0).toString(16)).slice(-6);
    };
    //判断是否为近似颜色
    //使用 isSimilarColor("#FFFFFF","#F0FFFE",10);
    module.isSimilarColor = function (sHexColorA, sHexColorB, nOffset) {
        this.offsetNum = Math.abs(nOffset);
        this.offsetNum > 255 ? this.offsetNum = this.offsetNum - 256 : "";
        var arrNumA = [parseInt(sHexColorA.substring(1, 3), 16), parseInt(sHexColorA.substring(3, 5),
            16), parseInt(sHexColorA.substring(5, 7), 16)];
        // console.log(arrNumA,"aaa")
        var arrNumB = [parseInt(sHexColorB.substring(1, 3), 16), parseInt(sHexColorB.substring(3, 5),
            16), parseInt(sHexColorB.substring(5, 7), 16)];
        // console.log(arrNumB, "bbb")
        for (var i = 0; i < arrNumA.length; i++) {
            // console.log(arrNumA[i], arrNumB[i], this.offsetNum, i)
            if (Math.abs(arrNumA[i] - arrNumB[i]) > this.offsetNum) {
                return false;
            }
        }
        return true;
    };
    window.andy = $.extend({}, true, window.andy, module);
})(window);
// json2.js 来源json官网
if (typeof JSON !== "object") {
    JSON = {};
}

(function () {
    "use strict";

    var rx_one = /^[\],:{}\s]*$/;
    var rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
    var rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
    var rx_four = /(?:^|:|,)(?:\s*\[)+/g;
    var rx_escapable = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    var rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10
            ? "0" + n
            : n;
    }

    function this_value() {
        return this.valueOf();
    }

    if (typeof Date.prototype.toJSON !== "function") {

        Date.prototype.toJSON = function () {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear() + "-" +
                        f(this.getUTCMonth() + 1) + "-" +
                        f(this.getUTCDate()) + "T" +
                        f(this.getUTCHours()) + ":" +
                        f(this.getUTCMinutes()) + ":" +
                        f(this.getUTCSeconds()) + "Z"
                : null;
        };

        Boolean.prototype.toJSON = this_value;
        Number.prototype.toJSON = this_value;
        String.prototype.toJSON = this_value;
    }

    var gap;
    var indent;
    var meta;
    var rep;


    function quote(string) {
        rx_escapable.lastIndex = 0;
        return rx_escapable.test(string)
            ? "\"" + string.replace(rx_escapable, function (a) {
                var c = meta[a];
                return typeof c === "string"
                    ? c
                    : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
            }) + "\""
            : "\"" + string + "\"";
    }


    function str(key, holder) {
        var i;          // The loop counter.
        var k;          // The member key.
        var v;          // The member value.
        var length;
        var mind = gap;
        var partial;
        var value = holder[key];
        if (value && typeof value === "object" &&
                typeof value.toJSON === "function") {
            value = value.toJSON(key);
        }
        if (typeof rep === "function") {
            value = rep.call(holder, key, value);
        }
        switch (typeof value) {
        case "string":
            return quote(value);

        case "number":
            return isFinite(value)
                ? String(value)
                : "null";

        case "boolean":
        case "null":
            return String(value);
        case "object":
            if (!value) {
                return "null";
            }
            gap += indent;
            partial = [];
            if (Object.prototype.toString.apply(value) === "[object Array]") {
                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || "null";
                }

                v = partial.length === 0
                    ? "[]"
                    : gap
                        ? "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]"
                        : "[" + partial.join(",") + "]";
                gap = mind;
                return v;
            }
            if (rep && typeof rep === "object") {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === "string") {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (
                                gap
                                    ? ": "
                                    : ":"
                            ) + v);
                        }
                    }
                }
            } else {
                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (
                                gap
                                    ? ": "
                                    : ":"
                            ) + v);
                        }
                    }
                }
            }
            v = partial.length === 0
                ? "{}"
                : gap
                    ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}"
                    : "{" + partial.join(",") + "}";
            gap = mind;
            return v;
        }
    }
    if (typeof JSON.stringify !== "function") {
        meta = {    // table of character substitutions
            "\b": "\\b",
            "\t": "\\t",
            "\n": "\\n",
            "\f": "\\f",
            "\r": "\\r",
            "\"": "\\\"",
            "\\": "\\\\"
        };
        JSON.stringify = function (value, replacer, space) {
            var i;
            gap = "";
            indent = "";
            if (typeof space === "number") {
                for (i = 0; i < space; i += 1) {
                    indent += " ";
                }
            } else if (typeof space === "string") {
                indent = space;
            }
            rep = replacer;
            if (replacer && typeof replacer !== "function" &&
                    (typeof replacer !== "object" ||
                    typeof replacer.length !== "number")) {
                throw new Error("JSON.stringify");
            }
            return str("", {"": value});
        };
    }
    if (typeof JSON.parse !== "function") {
        JSON.parse = function (text, reviver) {
            var j;

            function walk(holder, key) {

                var k;
                var v;
                var value = holder[key];
                if (value && typeof value === "object") {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }

            text = String(text);
            rx_dangerous.lastIndex = 0;
            if (rx_dangerous.test(text)) {
                text = text.replace(rx_dangerous, function (a) {
                    return "\\u" +
                            ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

            if (
                rx_one.test(
                    text
                        .replace(rx_two, "@")
                        .replace(rx_three, "]")
                        .replace(rx_four, "")
                )
            ) {

                j = eval("(" + text + ")");

                return (typeof reviver === "function")
                    ? walk({"": j}, "")
                    : j;
            }

            throw new SyntaxError("JSON.parse");
        };
    }
}());
/*
  数据操作
*/
(function (window) {
    var module = {};

    // -----------------------------------------------------------字符操作相关
    //读取数据方法 传入数据地址和加载完成后执行的方法callback
    //an_loaddata("xx.json", function(data){ console.log(data) })
    module.loaddata = function (dataUrl,argu,callback) {
        var data;
        if(arguments.length === 2){
            callback = argu;
            argu = undefined;
        }
        if (dataUrl.indexOf("{") > 0 || dataUrl.indexOf("[") > 0) {
            data = module.stringToJson(dataUrl);
            callback(data);
            return;
        }
        $.get(dataUrl, argu,function (data, status) {
            if (status == "success") {
                callback(data);
            }else {
                console.log(dataUrl + "|load data is failure!");
            };
        }).error(function(data) { 
            // 主要处理无链接的情况 status:404  statusText:"Not Found"
            callback(false, data);//data: data.status  data.statusText
        });
    };
    //传出数据方法 data结构{name:"xxx", id:"xx"}
    module.postdata = function(dataUrl, data, callback){
        if(arguments.length === 2){
            callback = data;
            data = undefined;
        }
        $.post(dataUrl, data, function (data, status) {
            if (status == "success") {
                callback(data);
            }else {
                console.log(dataUrl + "|load data is failure!");
            };
        });
    };

    // 通过API获取数据
    module.getDataByApi = function(api, callback, data, gettype){
        if(typeof api == "object"){
            return callback(api);
        }else{
            
        }
    }

    //数据转换string -> json
    module.stringToJson = function(string){
        var datastring = string;
        if(typeof datastring == "string"){
            // if(andy.IE() < 8 && andy.IE() != 0){
                // 不是不兼容parse问题 是json字符格式问题
                // datastring = JSON.parse(datastring);
            //     datastring = eval("("+datastring+")");
            // }else{
                datastring = eval("("+datastring+")");
            // }
        }
        return datastring;
    };
    // 数据转换json -> string
    module.jsonToString = function(obj){
        var data = obj;
        if(typeof data == "object"){
            data = JSON.stringify(data)
        }
        return data;
    }

    /* json字段 检索查询
        parms：arr json数据, str 条件

        Demo 1：//基础

        var arr = [3,5,7,8];

        var list1 = andy.where(arr, "data > 5") ; //得到[7,8]

        var list2 = andy.where(arr, "i  < 3"); // 得到[3,5,7]

         

        Demo 2:  //进阶

        var arr = [{id:1,name:"Jay"},{id:2,name:"Joy"},{id:3,name:"Bob"}];

        var list1 = andy.where(arr, "data.name == 'Joy'"); //得到 [{id:2,name:"Joy"}] ;

        var list2 = andy.where(arr, "data.name.indexOf('data')!=-1");//得到name含有'o'字母的 [{id:2,name:"Joy"},{id:3,name:"Bob"}];

         

        Demo 3: //高级

        var arr =[{name:"Jay",age:29,c:[{name:"A"},{name:"B"}]},{name:"Jay",age:26,c:[]},{name:"Jay",age:24,c:[{name:"C"}]}];

        var list1 = andy.where(arr, "data.age > 25 && !data.c && data.c.length > 0");

        //年龄大于25且至少有一个孩子 [{name:"Jay",age:29,children:[{name:"A"},{name:"B"}]}]
    */
    module.where =  function (arr, str) {
        var s = $.grep(arr, function (data, i){
            return JSON.parse(str);
        })
        return s;
    }

    /* 字符替换   ABCASDFASDF 把其中A替换为P, andy.stringReplace(ABCASDFASDF, A, P)
        支持 批量替换 
        andy.stringReplace(ABCASDFASDF, [A, B], P) 把A B 都替换为P
        andy.stringReplace(ABCASDFASDF, [A, B], [P, R]) 把A B 分别替换为P R
    */
    
    module.stringReplace = function(string, character, replace){
        var data = string;
        var reg;
        var setReplace = function(character, index){
            var newCharacter;
            reg = null;
            reg = new RegExp(character, "g");
            if(typeof replace == "object"){
                for(var i = 0; i < replace.length; i++){
                    if(i == index){
                        newCharacter = replace[i];
                    }
                }
            }else if(typeof replace == "string"){
                newCharacter = replace;
            }
            data = data.replace(reg, newCharacter);
        }
        if(typeof character == "object"){
            for(var i = 0; i < character.length; i++){
                setReplace(character[i], i)
            }
        }else{
            setReplace(character)
        }
        return data;
    }

    /*
        andy-data: 数据绑定 针对表单初步 实行,绑定字段,默认为input字段
        andy-data-type:
            "combo":下拉
            "verify":验证框

        andy-data-main: 主数据位置

        andy-data-auto:自动执行,默认不自动执行
            auto相关:
            andy-data-url:ajax加载数据地址

        andy-data-notAuto:不自动执行
    */
    module.an_andyData = function(data){
        var andy_main, andy_data_str, andy_data_type, getValueByData, mainData;
        mainData = data;
        andy_main = $('[andy-data-main]');
        andy_data_str = "andy-data";
        andy_data_type = "andy-data-type";

        var getValueByData = function(dataStr, index){
            var value;
            var arr = dataStr.split(".");

            var isHaveSameProperty = function(arr, pro){
                var isHave = false;
                for(var i in arr){
                    if(i == pro){
                        isHave = true;
                    }
                }
                return isHave;
            }

            var isHaveChildren = function(arr){
                var isHave = false;
                for(var i in arr){
                    isHave = true;
                }
                return isHave;
            }

            var getValue = function(thisData, arr, i, fun){
                var data = thisData[arr[i]];
                if(arr[i+1] && isHaveSameProperty(data, arr[i+1])){
                    getValue(data, arr, i+1, fun)
                }else{
                    fun(data)
                }
            }
            getValue(mainData, arr, 0, function(v){
                value = v;
            })
            return value;
        }

        andy_main.find("["+andy_data_str+"]").each(function(index, andy_data){
            var dataElement = $(andy_data);
            var valueObj = getValueByData(dataElement.attr(andy_data_str));
            // console.log(valueObj, dataElement.find("[andy-data-combo]"))
            if(dataElement.attr(andy_data_type) == "combo"){
                dataElement.an_combo(valueObj)
            }else{
                var d = dataElement;
                d.is("input")?d.val(valueObj):d.text(valueObj);
            }
        })
    }


    //内容拷贝
    module.copy = function (content, tip) {
        if ($("#copytextarea").length == 0) {
            $('body').append("<textarea id='copytextarea' style='height:0; border:0; width:0; display:block; opacity:0'></textarea>");
        }
        var copybox = $("#copytextarea");
        copybox.text(content);
        // 选择对象
        copybox.select();
        // 执行浏览器复制命令
        document.execCommand("Copy");
        alert(tip);
    };

    // 跨域 数据发送
    module.execiFrame = function(options){
        var execPageUrl = options.execPageUrl || "";
        var execData = options.execData || "";
        execData = andy.jsonToString(execData);
        // 转码
        execData = encodeURI(execData);
        execPageUrl = execPageUrl+"?exec="+ execData;
        if(typeof(exec_obj)=='undefined'){  
            exec_obj = document.createElement('iframe');  
            exec_obj.name = 'exec_frame';  
            exec_obj.src = execPageUrl;  
            exec_obj.style.display = 'none';  
            document.body.appendChild(exec_obj);  
        }else{  
            exec_obj.src = execPageUrl;  
        }  
    }

    // 链接处理
    module.getUrlParam = function (name, url) {
        var windowurl = url || window.location;
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = windowurl.search.substr(1).match(reg);
        // 转码
        // if (r != null) return unescape(r[2]); return null;
        if (r != null) return decodeURI(r[2]); return null;

    }
	window.andy = $.extend({}, true, window.andy, module);
})(window);


/*global andy,$,template*/
/**加载等待模块**/
(function (andy,$) {
    /**
     * 关闭等待
     * @param target 弹出目标层  top最外层  self自己页面
     * @param callback
     */
    var getWinTop = function () {
        try {
            var result = window.top;
            window.top.url;
            return result;
        } catch (err) {
            return window;
        }
    }
    var close = function (target,callback) {
        var loading_bg;
        if(target==="top"){
            loading_bg = getWinTop().$('body').find('.loading_bg');
        }else{
            loading_bg = window.$('body').find('.loading_bg');
        }

        loading_bg.addClass('fadeOut');
        setTimeout(function () {
            loading_bg.remove();
            if (typeof callback == 'function') {
                callback();
            }
        },500);
    };

    /**
     * 弹出覆盖层...
     * @param target 弹出目标层  top最外层  self自己页面
     * @param content 内容 可以是html字符串
     * @param clazz  样式类名
     * @param callback 回调
     */
    andy.overlay = function (target, content, clazz,callback) {
        var overlaydiv = '<div class="loading_bg ' + clazz + ' animated fadeIn">' + content + '</div>';
        if (target == 'top' && getWinTop().$('body').find('.loading_bg').length == 0) {
            getWinTop().$('body').append(overlaydiv);
        }
        else if (target == 'top' && getWinTop().$('body').find('.loading_bg').length == 1) {
            getWinTop().$('body').find('.loading_bg').html(content);
        }
        else if (target == 'self' && $('body').find('.loading_bg').length == 0) {
            $('body').append(overlaydiv);
        }
        else if (target == 'self' && $('body').find('.loading_bg').length == 1) {
            $('body').find('.loading_bg').html(content);
        }
        else if (target != 'self' && target != 'top' && $('body').find('.loading_bg').length == 0) {
            $(target).append(overlaydiv);
            $(target).find('.loading_bg').css({
                'position': 'absolute'
            });
        }
        else if (target != 'self' && target != 'top' && $('body').find('.loading_bg').length == 1) {
            $(target).find('.loading_bg').html(content);
        }
        if (typeof callback == 'function') {
            callback();
        }
    };

    /**
     * 页面加载loding...
     * @param target 弹出目标层  top最外层  self自己页面
     * @param text 文本内容
     * @param callback 回调
     */
    andy.loading = function (target, text, callback) {
        var that={};
        var content = '<div class="loading_bg_center"><span class="quarters-loader"></span><p id="loadingtext">' + text + '</p></div>';
        andy.overlay(target, content);
        if (typeof callback == 'function') {
            callback();
        }
        //关闭
        that.close = function(callback){
            close(target,callback);
        };
        //修改消息
        that.changeText = function(text){
            var content2 = '<div class="loading_bg_center"><span class="quarters-loader"></span><p id="loadingtext">' + text + '</p></div>';
            andy.overlay(target, content2);
        };
        return that;
    };
    //原来的方法保留
    andy.closeOverlay = function(callback){
        close("top",callback);
    };

    return andy;
}(andy,$));
/*!art-template - Template Engine | http://aui.github.com/artTemplate/*/
!function(){function a(a){return a.replace(t,"").replace(u,",").replace(v,"").replace(w,"").replace(x,"").split(y)}function b(a){return"'"+a.replace(/('|\\)/g,"\\$1").replace(/\r/g,"\\r").replace(/\n/g,"\\n")+"'"}function c(c,d){function e(a){return m+=a.split(/\n/).length-1,k&&(a=a.replace(/\s+/g," ").replace(/<!--[\w\W]*?-->/g,"")),a&&(a=s[1]+b(a)+s[2]+"\n"),a}function f(b){var c=m;if(j?b=j(b,d):g&&(b=b.replace(/\n/g,function(){return m++,"$line="+m+";"})),0===b.indexOf("=")){var e=l&&!/^=[=#]/.test(b);if(b=b.replace(/^=[=#]?|[\s;]*$/g,""),e){var f=b.replace(/\s*\([^\)]+\)/,"");n[f]||/^(include|print)$/.test(f)||(b="$escape("+b+")")}else b="$string("+b+")";b=s[1]+b+s[2]}return g&&(b="$line="+c+";"+b),r(a(b),function(a){if(a&&!p[a]){var b;b="print"===a?u:"include"===a?v:n[a]?"$utils."+a:o[a]?"$helpers."+a:"$data."+a,w+=a+"="+b+",",p[a]=!0}}),b+"\n"}var g=d.debug,h=d.openTag,i=d.closeTag,j=d.parser,k=d.compress,l=d.escape,m=1,p={$data:1,$filename:1,$utils:1,$helpers:1,$out:1,$line:1},q="".trim,s=q?["$out='';","$out+=",";","$out"]:["$out=[];","$out.push(",");","$out.join('')"],t=q?"$out+=text;return $out;":"$out.push(text);",u="function(){var text=''.concat.apply('',arguments);"+t+"}",v="function(filename,data){data=data||$data;var text=$utils.$include(filename,data,$filename);"+t+"}",w="'use strict';var $utils=this,$helpers=$utils.$helpers,"+(g?"$line=0,":""),x=s[0],y="return new String("+s[3]+");";r(c.split(h),function(a){a=a.split(i);var b=a[0],c=a[1];1===a.length?x+=e(b):(x+=f(b),c&&(x+=e(c)))});var z=w+x+y;g&&(z="try{"+z+"}catch(e){throw {filename:$filename,name:'Render Error',message:e.message,line:$line,source:"+b(c)+".split(/\\n/)[$line-1].replace(/^\\s+/,'')};}");try{var A=new Function("$data","$filename",z);return A.prototype=n,A}catch(B){throw B.temp="function anonymous($data,$filename) {"+z+"}",B}}var d=function(a,b){return"string"==typeof b?q(b,{filename:a}):g(a,b)};d.version="3.0.0",d.config=function(a,b){e[a]=b};var e=d.defaults={openTag:"<%",closeTag:"%>",escape:!0,cache:!0,compress:!1,parser:null},f=d.cache={};d.render=function(a,b){return q(a,b)};var g=d.renderFile=function(a,b){var c=d.get(a)||p({filename:a,name:"Render Error",message:"Template not found"});return b?c(b):c};d.get=function(a){var b;if(f[a])b=f[a];else if("object"==typeof document){var c=document.getElementById(a);if(c){var d=(c.value||c.innerHTML).replace(/^\s*|\s*$/g,"");b=q(d,{filename:a})}}return b};var h=function(a,b){return"string"!=typeof a&&(b=typeof a,"number"===b?a+="":a="function"===b?h(a.call(a)):""),a},i={"<":"<",">":">",'"':"","'":"'","&":"&"},j=function(a){return i[a]},k=function(a){return h(a).replace(/&(?![\w#]+;)|[<>"']/g,j)},l=Array.isArray||function(a){return"[object Array]"==={}.toString.call(a)},m=function(a,b){var c,d;if(l(a))for(c=0,d=a.length;d>c;c++)b.call(a,a[c],c,a);else for(c in a)b.call(a,a[c],c)},n=d.utils={$helpers:{},$include:g,$string:h,$escape:k,$each:m};d.helper=function(a,b){o[a]=b};var o=d.helpers=n.$helpers;d.onerror=function(a){var b="Template Error\n\n";for(var c in a)b+="<"+c+">\n"+a[c]+"\n\n";"object"==typeof console&&console.error(b)};var p=function(a){return d.onerror(a),function(){return"{Template Error}"}},q=d.compile=function(a,b){function d(c){try{return new i(c,h)+""}catch(d){return b.debug?p(d)():(b.debug=!0,q(a,b)(c))}}b=b||{};for(var g in e)void 0===b[g]&&(b[g]=e[g]);var h=b.filename;try{var i=c(a,b)}catch(j){return j.filename=h||"anonymous",j.name="Syntax Error",p(j)}return d.prototype=i.prototype,d.toString=function(){return i.toString()},h&&b.cache&&(f[h]=d),d},r=n.$each,s="break,case,catch,continue,debugger,default,delete,do,else,false,finally,for,function,if,in,instanceof,new,null,return,switch,this,throw,true,try,typeof,var,void,while,with,abstract,boolean,byte,char,class,const,double,enum,export,extends,final,float,goto,implements,import,int,interface,long,native,package,private,protected,public,short,static,super,synchronized,throws,transient,volatile,arguments,let,yield,undefined",t=/\/\*[\w\W]*?\*\/|\/\/[^\n]*\n|\/\/[^\n]*$|"(?:[^"\\]|\\[\w\W])*"|'(?:[^'\\]|\\[\w\W])*'|\s*\.\s*[$\w\.]+/g,u=/[^\w$]+/g,v=new RegExp(["\\b"+s.replace(/,/g,"\\b|\\b")+"\\b"].join("|"),"g"),w=/^\d[^,]*|,\d[^,]*/g,x=/^,+|,+$/g,y=/^$|,+/;e.openTag="{{",e.closeTag="}}";var z=function(a,b){var c=b.split(":"),d=c.shift(),e=c.join(":")||"";return e&&(e=", "+e),"$helpers."+d+"("+a+e+")"};e.parser=function(a){a=a.replace(/^\s/,"");var b=a.split(" "),c=b.shift(),e=b.join(" ");switch(c){case"if":a="if("+e+"){";break;case"else":b="if"===b.shift()?" if("+b.join(" ")+")":"",a="}else"+b+"{";break;case"/if":a="}";break;case"each":var f=b[0]||"$data",g=b[1]||"as",h=b[2]||"$value",i=b[3]||"$index",j=h+","+i;"as"!==g&&(f="[]"),a="$each("+f+",function("+j+"){";break;case"/each":a="});";break;case"echo":a="print("+e+");";break;case"print":case"include":a=c+"("+b.join(",")+");";break;default:if(/^\s*\|\s*[\w\$]/.test(e)){var k=!0;0===a.indexOf("#")&&(a=a.substr(1),k=!1);for(var l=0,m=a.split("|"),n=m.length,o=m[l++];n>l;l++)o=z(o,m[l]);a=(k?"=":"=#")+o}else a=d.helpers[c]?"=#"+c+"("+b.join(",")+");":"="+a}return a},"function"==typeof define?define(function(){return d}):"undefined"!=typeof exports?module.exports=d:this.template=d}();/*global andy, $*/
/**
 * Created by chen_muse on 2016/6/14.
 * 键盘事件存在特殊性，无法直接绑定在div等dom元素上，故直接绑定在document上
 *
 *
 */

(function (andy, $) {
    //String.fromCharCode 可接受一个指定的 Unicode 值，然后返回一个字符串,适用于字母数字符号
    //stringObject.charCodeAt(index) 返回指定位置的字符的 Unicode 编码
    //toLowerCase()
    var
    //CODE_MSG_MAPPING,
    //MSG_CODE_MAPPING,
        msg2CodeFun = function (code2Msg) {
            var code, msg2Code = {};
            for (code in code2Msg) {
                if (code2Msg.hasOwnProperty(code)) {
                    msg2Code[code2Msg[code]] = parseInt(code, 10);
                }
            }
            return msg2Code;
        };

    //keyUpHandler = function (e, doc) {
    //    var args, activeElement;
    //
    //    if (!module.CODE_MSG_MAPPING[e.keyCode]) {
    //        return;
    //    }
    //    //输入框被激活
    //    activeElement = doc.activeElement;
    //    if (activeElement && activeElement.localName === "input" && (activeElement.type === "text" || activeElement.type === "password")) {
    //        return;
    //    }
    //    if (activeElement && activeElement.localName === "textarea") {
    //        return;
    //    }
    //    if (activeElement && activeElement.localName === "div" && activeElement.contentEditable === "true") {
    //        return;
    //    }
    //    args = {
    //        "event": e,
    //        "keyCode": e.keyCode,
    //        "keyMsg": module.CODE_MSG_MAPPING[e.keyCode]
    //    };
    //    e.preventDefault();
    //},
    //keyDownHandler = function (e, doc) {
    //    var args, activeElement;
    //
    //    if (!module.CODE_MSG_MAPPING[e.keyCode]) {
    //        return;
    //    }
    //    //输入框被激活
    //    activeElement = doc.activeElement;
    //    if (activeElement && activeElement.localName === "input" && (activeElement.type === "text" || activeElement.type === "password")) {
    //        return;
    //    }
    //    if (activeElement && activeElement.localName === "textarea") {
    //        return;
    //    }
    //    if (activeElement && activeElement.localName === "div" && activeElement.contentEditable === "true") {
    //        return;
    //    }
    //    args = {
    //        "event": e,
    //        "keyCode": e.keyCode,
    //        "keyMsg": module.CODE_MSG_MAPPING[e.keyCode]
    //    };
    //
    //    e.preventDefault();
    //};


    //key_code 与 key名称的映射关系
    andy.CODE_MSG_MAPPING = {
        "8": "BackSpace",
        "9": "Tab",
        "12": "Clear",
        "13": "Enter",
        "16": "Shift",
        "17": "Ctrl",
        "18": "Alt",
        "19": "Pause",
        "20": "Caps_Lock",
        "27": "Esc",
        "32": "Space",
        "33": "PageUp",
        "34": "PageDown",
        "35": "End",
        "36": "Home",
        "37": "Left",
        "38": "Up",
        "39": "Right",
        "40": "Down",
        "41": "Select",
        "42": "Print",
        "43": "Execute",
        "45": "Insert",
        "46": "Delete",
        "47": "Help",
        "48": "0",
        "49": "1",
        "50": "2",
        "51": "3",
        "52": "4",
        "53": "5",
        "54": "6",
        "55": "7",
        "56": "8",
        "57": "9",
        "65": "A",
        "66": "B",
        "67": "C",
        "68": "D",
        "69": "E",
        "70": "F",
        "71": "G",
        "72": "H",
        "73": "I",
        "74": "J",
        "75": "K",
        "76": "L",
        "77": "M",
        "78": "N",
        "79": "O",
        "80": "P",
        "81": "Q",
        "82": "R",
        "83": "S",
        "84": "T",
        "85": "U",
        "86": "V",
        "87": "W",
        "88": "X",
        "89": "Y",
        "90": "Z",
        "91": "Win",
        "92": "Win",
        "96": "KP_0",
        "97": "KP_1",
        "98": "KP_2",
        "99": "KP_3",
        "100": "KP_4",
        "101": "KP_5",
        "102": "KP_6",
        "103": "KP_7",
        "104": "KP_8",
        "105": "KP_9",
        "106": "*",
        "107": "+",
        "109": "-",
        "110": ".",
        "111": "/",
        "112": "F1",
        "113": "F2",
        "114": "F3",
        "115": "F4",
        "116": "F5",
        "117": "F6",
        "118": "F7",
        "119": "F8",
        "120": "F9",
        "121": "F10",
        "122": "F11",
        "123": "F12",
        "144": "Num_Lock",
        "145": "Scroll_Lock",
        "187": "+",
        "186": ";",
        "188": ",",
        "189": "-",
        "190": ".",
        "191": "/",
        "192": "`",
        "219": "[",
        "220": "\\",
        "221": "]",
        "222": "'"
    };
    //key名称 与 key_code的映射关系
    andy.MSG_CODE_MAPPING = msg2CodeFun(andy.CODE_MSG_MAPPING);


    var keydownEvents = {};
    var keyupEvents = {};


    /**
     * 键盘按下
     * @param event
     */
    var doKeydown = function (event) {
        var keyMsg, e = event || window.event;
        //esc和回车 输入框失去焦点
        // || e.target.localName === "textarea"
        if ((e.target.localName === "input") && e && (e.keyCode == 27 || e.keyCode == 13)) {
            event.target.blur();
            return;
        }
        keyMsg = andy.CODE_MSG_MAPPING[e.keyCode];
        if (keyMsg) {
            keyMsg = keyMsg.toLowerCase();
            if (keydownEvents[keyMsg] && keydownEvents[keyMsg].length > 0) {
                keydownEvents[keyMsg].pop()(e);
                return;
            }
        }


        //e.preventDefault();
    };
    /**
     * 键盘弹起
     * 一些统一的处理，输入框，文本框等在回车以后失去焦点
     * @param event
     */
    var doKeyup = function (event) {
        var e = event || window.event;
        var keyMsg = andy.CODE_MSG_MAPPING[e.keyCode];
        if (keyMsg) {
            keyMsg = keyMsg.toLowerCase();
            if (keyupEvents[keyMsg] && keyupEvents[keyMsg].length > 0) {
                keyupEvents[keyMsg].pop()(e);
                return;
            }
        }
        //e.preventDefault();

    };
    /**
     * 增加键盘事件
     * document 事件是一个数组，通过 pop来执行
     * el元素 的事件就直接绑定
     * @param el 默认是 document
     * @param keycode 键盘值 'enter'
     * @param fun 函数
     * @param type "keyup","keydown" 默认是keyup
     */
    var addKeyEvent = function (el, keycode, type, fun) {
        type = type || "keyup";
        keycode = keycode.toLowerCase();
        if (el) {
            $(el)[type](function (event) {
                if (event.keyCode == keycode) {
                    fun(event);
                }
            });
        } else {
            if (type === "keyup") {
                keyupEvents[keycode] = keyupEvents[keycode] || [];
                keyupEvents[keycode].push(fun);
            } else if (type === "keydown") {
                keydownEvents[keycode] = keydownEvents[keycode] || [];
                keydownEvents[keycode].push(fun);
            }
        }

    };


    /**
     * 移除事件
     * @param el 事件对象
     * @param type 类型
     */
    var removeKeyEvent = function (el, type) {
        if (el) {
            $(el).off(type || "keydown");
        }
    };

    andy.addKeyEvent = addKeyEvent;
    andy.removeKeyEvent = removeKeyEvent;

    $(document).keydown(doKeydown);
    $(document).keyup(doKeyup);

}(andy, $));

/*global andy,$,template*/
/**工具提示模块**/
(function (andy, $) {
    var tooltipRender;
    var htmlStr = '<div class="infobox" style="width:{{width}};top:{{top}}; left:{{left}}; bottom:{{bottom}}; right:{{right}}; display: none;">' +
        '<i class="iconfont {{ip}}">{{itype}}</i>' +
        '<div class="content">{{#content}}</div>' +
        '</div>';
    var defaults = {
        width: 'auto',
        top: 0,
        left: 0,
        bottom: 'auto',
        right: 'auto',
        ip: "b",
        itype: '',
        content: "提示",
        position :'bottom'
    };
    var getOptionsFromDom = function (el) {
        var key, v, data = {};
        if (el.getAttribute("options")) {
            data = andy.stringToJson(el.getAttribute("options"));
        }
        for (key in defaults) {
            v = el.getAttribute(key);
            if (v) {
                data[key] = v;
            }
        }
        return data;
    };

    /**
     * tooltip 提示
     * @param element 需要提示的对象
     * @param position 方位，
     * @param content 需要提示的内容
     * @param clazz 样式，为空为黑色，"terr"为红色
     * @param isMouseOverShow bool是否鼠标移上去显示  未定义的话代表外部控制
     */
    andy.tooltip = function (element, position, content, clazz, isMouseOverShow) {
        var that = {}, infobox,
            data = $.extend({},defaults, {content:content,position:position});

        if (!element.parent().is('.m-tooltip')) {
            // 在 套div时候 给当前对象-2PX
            var zindex = 999-$(".m-tooltip").length;
            element.wrap("<div class='m-tooltip " + clazz + "' style = 'z-index:"+zindex+"'></div>");
        }
        if (position == 'bottom') {
            data.top = element.outerHeight() + 2 + 'px';
            data.itype = '';
        } else if (position == 'top') {
            data.top = 'auto';
            data.bottom = element.outerHeight() + 2 + 'px';
            data.ip = 't';
            data.itype = '';
        } else if (position == 'left') {
            data.ip = 'l';
            data.left = (-content.length * 18 + 5) + "px";
            data.itype = '';

        } else if (position == 'right') {
            data.ip = 'r';
            data.left = element.outerWidth() + "px";
            data.width = content.length * 18 + "px";
            data.itype = '';
        }

        tooltipRender = tooltipRender || template.compile(htmlStr);

        $(tooltipRender(data)).insertAfter(element);
        infobox = element.next('.infobox');

        that.show = function () {
            infobox.fadeIn(200);
        };
        that.hide = function () {
            infobox.fadeOut(200);
        };
        that.change = function (str) {
            infobox.find('.content').html(str);
        };

        if (isMouseOverShow) {
            element.on("mouseover", function () {
                that.show();
            });
            element.on("mouseleave", function () {
                that.hide();
            });
        }
        return that;
    };

    andy.showTooltip = function (el,hideAfterShow) {
        $(el).next('.infobox').fadeIn(200);
        if(hideAfterShow){
            setTimeout(function(){
                $(el).next('.infobox').fadeOut(2500);
            },500);
        }
    };
    andy.hideTooltip = function (el) {
        $(el).next('.infobox').fadeOut(200);
    };
    andy.changeTooltip = function (el, str) {
        $(el).next('.infobox').find('.content').html(str);
    };

    //自动渲染
    $(document).ready(function () {
        $(".tooltip").each(function (index, el) {
            var data = getOptionsFromDom(el);
                andy.tooltip($(el),data.position,data.content,data.type,data.isMouseOverShow);
            }
        );
    });

    return andy;
}(andy, $));
/*global  window , an_IE,document,console */
/**
 * 对话框模块
 * author:chenxiaoying
 **/
(function (andy, $) {
    "use strict";
    var DBODYHOFFSET = 33 + 37 + 7 + 12 - 3,//head+bottom + bodypadiing
        DIALOGZ = 9000,
        DIALOGROOTID = "systemstage",//默认的弹出页，没有的话就在winTop
        massageCfg = {
            "成功": {
                title: "成功!",
                icon: '',
                iconclass: 'f-color-success',
                buttons: [{text: '确定', cls: "success"}]
            },
            "询问": {
                title: "信息",
                icon: '',
                iconclass: 'f-color-info',
                buttons: [{text: '确定', cls: "success"}, {text: '取消'}]
            },
            "错误": {title: "错误!", icon: '', iconclass: 'f-color-danger', buttons: [{text: '返回'}]},
            "禁止": {title: "禁止!", icon: '', iconclass: 'f-color-danger', buttons: [{text: '返回'}]},
            "警告": {title: "警告!", icon: '', iconclass: 'f-color-warning', buttons: [{text: '返回'}, {text: '继续'}]},
            "提示": {
                title: "提示!",
                icon: '',
                iconclass: 'f-color-info',
                buttons: [{text: '确定', cls: "success"}, {text: '取消'}]
            },
            "default": {title: "提示!", icon: ''}
        },
        getWinTop = function () {
            try {
                var result = window.top;
                window.top.url;
                return result;
            } catch (err) {
                return window;
            }
        },
        find = function (argu) {
            var id, o, windowbox;
            if (argu) {
                if (typeof argu === "object") {
                    windowbox = $(argu).parents(".u-panel");
                    //如果长度是0，表示没有找到，弹出的是内嵌iframe
                    //怎么才能获取外面的窗体对象呢
                    if (windowbox.length === 0) {
                        //argu = window.winIndex;
                        windowbox = undefined;
                    }
                }
                if (typeof argu === "string") {
                    id = argu.indexOf("#") > -1 ? argu : "#" + argu;
                    //获取窗体，这里可能会有问题
                    o = getWinTop().$(id);
                    windowbox = o[0] ? o : getWinTop().$('iframe').contents().find(id);
                }
            }
            return windowbox;
        },
    //显示窗口动画
        doAnimation = function (e, name, callback) {
            var ie = andy.IE();
            if (name && (!(ie <= 8) || ie === 0)) {
                e.addClass(name);
                window.setTimeout(function () {
                    e.removeClass(name);
                    if (callback) {
                        callback(e);
                    }
                }, 500);
            } else {
                if (callback) {
                    callback(e);
                }
            }
        },
    //设置窗口位置,默认居中
        setPos = function (win, x, y) {
            var iframeW, windowH, windowW, args, sTop, t = "", l = "", r = "", b = "";

            //args = $(win.eq(0)).data("an_dialog").options;
            args = getWinTop().$.data(win[0], "an_dialog").options;
            //iframeW = win.parent()[0].contentWindow || getWinTop();
            iframeW = win.parent()[0];
            sTop = $(iframeW).scrollTop();
            if (andy.IE() > 0 || andy.isFirefox()) {
                sTop = iframeW.ownerDocument.documentElement.scrollTop || window.pageYOffset || iframeW.ownerDocument.body.scrollTop;
            }
            windowH = win.parent().height();
            windowW = win.parent().width();
            l = x || ((windowW - win.width()) / 2);
            t = y || ((windowH - win.height()) / 2) + sTop;
            //t = (andy.IE() === 6 && t !== "") ? t + iframeW.scrollTop : t;
            if (args.location) {
                if (args.location.indexOf("left") !== -1) {
                    l = 5;
                }
                if (args.location.indexOf("top") !== -1) {
                    t = 5 + sTop;
                }
                if (args.location.indexOf("right") !== -1) {
                    r = 5;
                    l = "";
                }
                if (args.location.indexOf("bottom") !== -1) {
                    //b = 5;
                    //t = "";
                    //if (andy.IE() === 6) {
                    // alert("iframeW.scrollTop-"+iframeW.scrollTop+", iframeW.clientHeight-"+iframeW.clientHeight);
                    t = sTop + iframeW.clientHeight - 5 - win.eq(0).height();
                    //}
                }
            }
            // _top:expression(eval(document.documentElement.scrollTop+document.documentElement.clientHeight/2));

            // alert("l-"+l+",t-"+t+",r-"+r+",b-"+b);
            win.eq(0).css({"left": l, "top": t, "right": r, "bottom": b});
        },
    //重置窗口大小
        reSize = function (win, w, h) {
            var options, iframeW, windowH, windowW, winMask, winBody, bodyHeightOff, data;
            try {
                data = getWinTop().$.data(win[0], "an_dialog");
                if (data && data.options) {
                    options = data.options;
                    winMask = win.next('.m-panel-mask');
                    winBody = win.find('.panel-body');
                    iframeW = win.parents("html")[0] || getWinTop();
                    windowH = $(iframeW).height();
                    windowW = $(iframeW).width();
                    bodyHeightOff = options.buttons && options.buttons.length > 0 ? DBODYHOFFSET : DBODYHOFFSET - 37;
                    if (arguments.length === 2 && w === "max") {
                        win.height(windowH - 20);
                        win.width(windowW - 10);
                        winBody.height(windowH - bodyHeightOff);
                        winBody.width(windowW - 10);
                    } else {
                        if (h !== undefined) {
                            h = h > windowH ? windowH - 10 : h;
                            win.height(h);
                            winBody.height(h === "" ? h : h - bodyHeightOff);
                        }
                        if (w !== undefined) {
                            w = w > windowW ? windowW - 10 : w;
                            win.width(w);
                            winBody.width(w === "" ? w : w - 10);
                        }
                    }
                    winMask.height(iframeW.scrollHeight);
                    winMask.width(iframeW.scrollWidth);
                }
            } catch (e) {
            }

        },
        close = function (win) {
            var winMask, moveRect, options, parent;
            if (win) {
                winMask = win.next('.m-panel-mask');
                try {
                    //options = $(win.eq(0)).data("an_dialog").options;
                    options = getWinTop().$.data(win[0], "an_dialog").options;
                }
                catch (e) {
                    throw "can not close this dialog!";
                }
                if (!options.onBeforeClose || (options.onBeforeClose && options.onBeforeClose(options))) {
                    doAnimation(win.eq(0) || win, options.aniClose, function () {
                        //移除框
                        moveRect = win.nextAll('div[dialogMoveRect="true"]');
                        if (moveRect) {
                            moveRect.remove();
                        }
                        ////console.log(win.parent('body').data('events')["click"]);
                        //隐藏窗体
                        win.hide();
                        winMask.hide();
                        //解除事件绑定
                        //执行关闭事件
                        if (options.onClose) {
                            options.onClose(options);
                        }
                        //如果有父窗体，需要关闭父窗体
                        if (options.parent) {
                            parent = find(options.parent);
                            if (parent) {
                                close(parent);
                            }
                        }
                        //销毁Iframe
                        if (options.url) {
                            andy.destroyIframe(win.find("iframe")[0]);
                            //如果页面里面还有iframe，应该把里面的一并销毁
                        }
                        if (options.div) {
                            $("#dailogreplace" + options.id).replaceWith(win.find('.panel-body').children());
                        }

                        //移除窗体
                        win.remove();
                        winMask.remove();
                    });
                }
            }
        },

        headDragInit = function () {
            var root, module = {}, clear, dmouseDown, wMain, drgEnd, wMask, moveRect, dmouseMove, dragStart = false, pos = {}, posing = {}, offset = {}, dragType, dmouseUp, changeCursor,
                cursor = [{cls: "move", coe: [1, 1, 0, 0]},
                    {cls: "n-resize", coe: [0, 1, 0, -1]},
                    {cls: "ne-resize", coe: [0, 1, 1, -1]},
                    {cls: "e-resize", coe: [0, 0, 1, 0]},
                    {cls: "se-resize", coe: [0, 0, 1, 1]},
                    {cls: "s-resize", coe: [0, 0, 0, 1]},
                    {cls: "sw-resize", coe: [1, 0, -1, 1]},
                    {cls: "w-resize", coe: [1, 0, -1, 0]},
                    {cls: "nw-resize", coe: [1, 1, -1, -1]}];
            moveRect = getWinTop().$('<div dialogMoveRect="true" style="border: 1px dashed dodgerblue; position: absolute; "></div>');
            //状态清除还原
            clear = function () {
                dragStart = false;
                if (wMain) {
                    wMain.parent('body').css("cursor", "");
                }
                wMask.removeClass("an_dialog_dragLayer");
                moveRect.remove();
            };
            drgEnd = function () {
                var iframeW, options = getWinTop().$.data(wMain[0], "an_dialog").options;
                var w = moveRect.width();
                var h = moveRect.height();
                var l = moveRect.offset().left;
                var t = moveRect.offset().top;

                if (w != wMain.outerWidth() || h != wMain.outerHeight()) {
                    options.onResize(w, h);
                    reSize(wMain, w, h);
                }
                if (l != wMain.offset().left || t != wMain.offset().top) {
                    options.onMove(l, t);
                    if (andy.IE() === 6) {
                        iframeW = wMain.parents("html")[0] || getWinTop();
                        t = t - iframeW.scrollTop;
                    }
                    setPos(wMain, l, t);
                }
                clear();
            };

            //wMain = win.eq(0);
            //改变鼠标样式，有9种可能,从上开始，顺时针一圈
            changeCursor = function (e) {
                var target = e.target || e.srcElement;
                if (dragStart) {
                    return;
                }
                dragType = "";
                //目标元素或者目标元素在拖动元素里面
                //这种情况鼠标样式可以由css控制
                if (target.getAttribute("an_dialog_drag")) {
                    wMain = $(target).parents(".m-panel");
                    if (target.getAttribute("an_dialog_drag") === "true") {
                        dragType = 0;
                    }
                } else if (target.getAttribute("an_dialog_resize")) {
                    wMain = $(target);
                } else if (target.getAttribute("an_dialog")) {
                    wMain = $(target).parents(".m-panel");
                } else {
                    wMain = undefined;
                }
                if (wMain) {
                    if (wMain.attr("an_dialog_resize") === "true") {
                        //上
                        if (wMain.position().top < e.y && e.y < wMain.position().top + 5) {
                            dragType = 1;
                        }
                        //右
                        if (wMain.position().left + wMain.outerWidth() > e.x && e.x > wMain.position().left + wMain.outerWidth() - 5) {
                            dragType = dragType ? 2 : 3;
                        }
                        //下
                        if (wMain.position().top + wMain.outerHeight() > e.y && e.y > wMain.position().top + wMain.outerHeight() - 5) {
                            dragType = dragType ? 4 : 5;
                        }
                        //左
                        if (wMain.position().left < e.x && e.x < wMain.position().left + 5) {
                            dragType = dragType === 1 ? 8 : (dragType === 5 ? 6 : 7);
                        }
                    }
                    wMask = wMain.next();
                    wMain.css("cursor", dragType ? cursor[dragType].cls : "");
                }
                return dragType;
            };
            dmouseDown = function (e) {
                if (dragStart) {
                    drgEnd();
                }
                changeCursor(e);
                if (wMain && dragType !== "") {
                    if (e.preventDefault) {
                        e.preventDefault();
                    }
                    dragStart = true;
                    //pos.x = posing.x = e.x;
                    //pos.y = posing.y = e.y;
                    pos.x = posing.x = e.clientX;
                    pos.y = posing.y = e.clientY;
                    moveRect.css("left", wMain.offset().left);
                    moveRect.css("top", wMain.offset().top);
                    moveRect.css("z-index", DIALOGZ + root.winIndex * 4 + 3);
                    moveRect.width(wMain.outerWidth());
                    moveRect.height(wMain.outerHeight());
                    wMain.parent('body').append(moveRect);
                    wMain.parent('body').css("cursor", cursor[dragType].cls);
                    wMask.addClass("an_dialog_dragLayer");
                }
            };
            dmouseMove = function (e) {
                var coe, l, t;
                if (!dragStart) {
                    changeCursor(e);
                } else {
                    offset.x = e.clientX - posing.x;
                    offset.y = e.clientY - posing.y;
                    coe = cursor[dragType].coe;
                    l = moveRect.offset().left + offset.x * coe[0];
                    t = moveRect.offset().top + offset.y * coe[1];
                    l = l <= 0 ? 0.1 : l;
                    l = l > moveRect.parent().width() - moveRect.width() ? moveRect.parent().width() - moveRect.width() : l;
                    t = t <= 0 ? 0.1 : t;


                    moveRect.css("left", l);
                    moveRect.css("top", t);
                    moveRect.width(moveRect.width() + offset.x * coe[2]);
                    moveRect.height(moveRect.height() + offset.y * coe[3]);
                    if (l <= 0.1 || t <= 0.1 || l >= moveRect.parent().width() - moveRect.width()) {
                        if (wMain.offset().left > 0.1 && wMain.offset().top > 0.1 && wMain.offset().left < moveRect.parent().width() - moveRect.width()) {
                            drgEnd();
                            return;
                        }
                    }
                    posing.x = e.clientX;
                    posing.y = e.clientY;
                    //return true;
                }
            };
            dmouseUp = function (e) {
                if (dragStart === true && wMain && cursor[dragType]) {
                    if (e.preventDefault) {
                        e.preventDefault();
                    }
                    drgEnd();
                }
            };
            module.bindEvent = function (r) {
                root = r;
                if (root.addEventListener) {
                    root.addEventListener("mousedown", dmouseDown);
                    root.addEventListener("mousemove", dmouseMove);
                    root.addEventListener("mouseup", dmouseUp);
                } else if (root.attachEvent) {
                    root.document.attachEvent("onmousedown", dmouseDown);
                    root.document.attachEvent("onmousemove", dmouseMove);
                    root.document.attachEvent("onmouseup", dmouseUp);
                } else {
                    throw "can not add dialogform event listener";
                }
            };
            module.unbindEvent = function (r) {
                root.removeEventListener("mousedown", dmouseDown);
                root.removeEventListener("mousemove", dmouseMove);
                root.removeEventListener("mouseup", dmouseUp);
                //detachEvent(event,function);
            };
            return module;
        };

    //鼠标事件绑定只在root上执行
    andy.dialoghDragInit = headDragInit;

    //构造函数
    $.fn.an_dialog = function (options, params) {
        var args, method;
        if (typeof options === "string") {
            method = $.fn.an_dialog.methods[options];
            if (method) {
                //有mothed则调用之
                return method(this, params);
            }
            throw 'The method of' + options + 'is undefined';
            return false;
        }

        args = $.extend({}, $.fn.an_dialog.defaults, options);

        return this.each(function () {
            var root, win, dialogRoot, show, iframeW, iframeOnload, organize, maxSize, bindHandler, setZ;
            if (args.locMyself) {
                root = window;
            } else {
                dialogRoot = getWinTop().document.getElementById(DIALOGROOTID);
                root = dialogRoot && dialogRoot.contentWindow.$ ? dialogRoot.contentWindow : getWinTop();
            }
            if (args.massage) {
                args.width = args.width || 300;
                args.height = args.height || 150;
            } else {
                args.width = args.width || 800;
                args.height = args.height || 600;
            }

            //显示窗体
            show = function (win) {
                var winMask, winBody, ds, resizeHandle;
                resizeHandle = null;
                winMask = win.next('.m-panel-mask');
                if (args.maxSize) {
                    reSize(win, "max");
                } else {
                    reSize(win, args.width, args.height);
                }
                setPos(win);
                //如果有多个窗口需要偏移显示位置
                ds = root.$('body').find("[an_dialog].m-panel");
                //console.log(ds.length);
                if (ds.length > 1) {
                    win[0].style.left = (parseInt(win[0].style.left, 10) + (ds.length - 1) * 15) + "px";
                    win[0].style.top = (parseInt(win[0].style.top, 10) + (ds.length - 1) * 15) + "px";
                }

                setZ(win, root.winIndex);

                //如果有焦点元素需要失去焦点
                if (andy.IE() > 7 && $(':focus').length > 0) {
                    $(':focus').blur();
                }

                win.eq(0).show();
                if (args.modalval) {
                    winMask.addClass("m-panel-maskshow");
                }
                $(root).resize(function (event) {
                    if (resizeHandle == null) {
                        resizeHandle = setTimeout(function () {
                            reSize(win);
                            resizeHandle = null;
                        }, 100)
                    }

                });
                doAnimation(win.eq(0), args.aniOpen, args.onOpen);
                if (!args.url && !args.data) {
                    args.onLoad(win);
                }
            };

            //设置
            setZ = function (win, n) {
                var winMask;
                winMask = win.next('.m-panel-mask');
                win.css("z-index", DIALOGZ + n * 4 + 2);
                winMask.css("z-index", DIALOGZ + n * 4);
            };

            maxSize = function (e) {
                var options, w = (e && e.data) || win;
                options = getWinTop().$.data(w[0], "an_dialog").options;
                if (e.target.className.indexOf("restore") > -1) {
                    $(e.target).removeClass("tool-restore");
                    $(e.target).addClass("tool-max");
                    reSize(w, e.target.getAttribute("reW"), e.target.getAttribute("reH") || "");
                } else {
                    $(e.target).addClass("tool-restore");
                    $(e.target).removeClass("tool-max");
                    e.target.setAttribute("reW", options.width || w.width());
                    e.target.setAttribute("reH", options.height || w.height());
                    reSize(w, "max");
                }
                setPos(win);
            };

            //绑定事件
            bindHandler = function (win) {
                var i;
                //添加关闭事件
                win.delegate(".tool-close", 'click', win, function (e) {
                    close(e.data);
                });
                if (args.maximizable) {
                    win.delegate(".tool-max", 'click', win, maxSize);
                    win.delegate(".tool-restore", 'click', win, maxSize);
                }
                //遮罩
                win.delegate('.m-panel-mask', 'click', win, close);
                // win.eq(2).delegate(".m-panel-mask", 'click', win, close);
                if (args.buttons) {
                    for (i = 0; i < args.buttons.length; i++) {
                        if (args.massage && massageCfg[args.massage.type] && massageCfg[args.massage.type].buttons) {
                            win.callback = args.massage.callback;
                            args.buttons[i].handler = args.buttons[i].handler || function (e) {
                                    if (e.data.callback) {
                                        e.data.callback(e.data, e);
                                    }
                                    close(e.data);
                                };
                        }
                        win.delegate("button[bt_index=" + i + "]", 'click', win, args.buttons[i].handler);
                    }
                }
            };
            //组装窗体
            organize = function () {
                var getTools, getIcon, getBottons, getContent, getTitle, dom;
                dom = '<div style="position: absolute; " an_dialog="true" an_dialog_resize = ' + args.resizeable + ' class="animated m-panel window' + args.cls + '" style="display: none">' +
                        //头部
                    '<div an_dialog="true" class="panel-head">' +
                        //工具栏
                    '<div class="m-toolbar ' + (args.draggable ? "an_dialog_drag" : "") + '" an_dialog_drag = ' + args.draggable + '>' +
                        //标题
                    '<div class="item"><div class="title">' +
                    '<i class="iconfont">#icon#</i><span id="title">#title#</span>' +
                    '</div></div>' +
                        //左侧
                    '<div an_dialog="true" class="item f-right"><div class="u-group">#tools#' +
                        //工具栏
                        //'<div class="u-group" >'+
                    '<button type="button" class="u-btn sm texture tool-close"><i class="iconfont " title="关闭">&#xe60f;</i></button>' +
                        //'</div>' +
                    '</div></div>' +
                    '</div></div>' +
                        //工具栏结束
                    '#content#' +
                    '#bottons#</div>' +
                    '<div class="m-panel-mask"></div>';
                //标题
                getTitle = function () {
                    var title;
                    if (args.massage) {
                        title = args.massage.title || massageCfg[args.massage.type].title;
                    }
                    return title || args.title;
                };
                //图标
                getIcon = function () {
                    var icon = "";
                    if (args.icon) {
                        icon = '<i class="iconfont "' + args.icon + '"></i>';
                    }
                    return icon;
                };
                //工具栏
                getTools = function () {
                    var s = "", cell, mode = '<button type="button" class="u-btn sm texture"><i class="iconfont tool-#type#"" href="javascript:void(0)" #attr#> #icon# </i></button>';
                    if (args.collapsible) {
                        s += mode.replace("#type#", "collapse").replace("#tip#", "收起").replace("#icon#", "");
                    }
                    if (args.minimizable) {
                        s += mode.replace("#type#", "min").replace("#tip#", "最小化").replace("#icon#", "");
                    }
                    if (args.maximizable) {
                        if (args.maxSize) {
                            cell = mode.replace("#type#", "restore").replace("#tip#", "还原").replace("#icon#", "");
                        } else {
                            cell = mode.replace("#type#", "max").replace("#tip#", "最大化").replace("#icon#", "");
                        }

                        s += cell.replace("#attr#", "reW = " + (options.width) + " reH =" + options.height);
                    }
                    return s;
                };
                //按钮
                getBottons = function () {
                    var s = "", i, mode = '<button  bt_index="#index#" class="#class#" > #text# #icon#</button>';
                    if (args.massage) {
                        args.buttons = args.buttons || massageCfg[args.massage.type].buttons;
                    }

                    if (args.buttons) {
                        s = '<div class="panel-foot">';
                        //if (args.massage) {
                        //    mode = mode.replace("#class#", "an_d_massage_btn col-xs-" + 12 / args.buttons.length);
                        //    mode = mode.replace("#style#", "_width:"+(400/args.buttons.length-1)+"px");
                        // } else {

                        //    mode = mode.replace("#style#", "*min-width:20px");
                        //}
                        for (i = args.buttons.length - 1; i >= 0; i--) {
                            s += mode.replace("#index#", i).replace("#class#", "u-btn sm " + args.buttons[i].cls || "texture").replace("#text#", args.buttons[i].text || "");
                            if (args.buttons[i].icon) {
                                s = s.replace("#icon#", '<i class="iconfont"> + args.buttons[i].icon </i>');
                            } else {
                                s = s.replace("#icon#", '');
                            }
                        }
                        s += "</div>";
                    }
                    // console.log(s);
                    return s;
                };

                //内容
                getContent = function () {
                    var winbody, c, el;
                    //嵌入链接页面
                    if (args.url) {
                        winbody = '<iframe frameborder="0" an_dialog="true" src = #content# class="panel-body"></iframe><div style="z-index: 1;position: absolute;left:50%;top:50%" class="loading_bg_center"><span class="quarters-loader"></span></div>';
                        //先显示loading，载入页面
                        c = args.url;
                    } else {
                        winbody = '<div an_dialog="true" class="panel-body">#content#</div>';
                        if (args.data) {
                            c = '<div class="loading_bg_center"><span class="quarters-loader"></span></div>';
                            $.ajax({
                                url: args.data, success: function (responseText) {
                                    args.onLoad(win);
                                    winbody = win.find('.loading_bg_center').replaceWith(responseText);
                                }
                            });
                        } else {
                            if (args.massage) {
                                c = '<div class="panel-massage-box"><i class="iconfont ' + massageCfg[args.massage.type].iconclass + ' panel-massage-icon">' + massageCfg[args.massage.type].icon + '</i>' +
                                    '<div class="panel-massage">' + args.massage.content + '</div></div>';
                            }
                            if (args.html) {
                                c = args.html;
                            }
                            if (args.text) {
                                c = args.text;
                            }
                            if (args.div) {
                                c = "";
                                //el = document.createElement("div");
                                //$(el).append(args.div.clone(true));
                                //c = el.innerHTML;
                                //c = c.replace(/id="*/g, 'id="c_');
                            }
                            if (args.mediaBox) {
                                c = $(root.document).an_mediabox("get", args.mediaBox);
                            }
                        }
                    }
                    winbody = winbody.replace("#content#", c);
                    // console.log(winbody);
                    return winbody;
                };
                dom = dom.replace("#title#", getTitle());
                dom = dom.replace("#icon#", getIcon());
                dom = dom.replace("#tools#", getTools());
                dom = dom.replace("#content#", getContent());
                dom = dom.replace("#bottons#", getBottons());
                // console.log(dom);
                return dom;
            };

            if (!root.$) {
                throw "错误！ " + root.name + "页面没有jquery!";
                return;
            }
            /*提示对话框已弹出*/
            if (args.id && root.$('body').find('#' + args.id).length > 0) {
                //TODO 可以让已弹出的框抖动一下
                root.$('body').find('#' + args.id).addClass("wobble");
                return false;
            }

            win = root.$(organize());
            if (args.div) {
                iframeW = win.find('.panel-body');
                iframeW.append(args.div.clone(true));
                args.div.replaceWith("<div id='dailogreplace" + args.id + "'></div>");
            }

            //在子页面中绑定dialog对象
            if (args.url) {
                iframeW = win.find('.panel-body')[0];
                iframeOnload = function () {
                    //移除等待动画
                    win.find('.loading_bg_center').remove();
                    iframeW.contentWindow.dialog = win;
                    if (iframeW.contentWindow.onresize) {
                        iframeW.contentWindow.onresize();
                    }
                    if (iframeW.contentWindow.dialogReady) {
                        iframeW.contentWindow.dialogReady(win, args);
                    }
                    args.onLoad();
                };
                if (iframeW.attachEvent) {
                    iframeW.attachEvent("onload", iframeOnload);
                } else {
                    iframeW.addEventListener("load", iframeOnload);
                }
            }

            root.winIndex = root.winIndex || 1;
            args.id = args.id || ((args.locMyself ? "win_" : "rootWin_") + root.winIndex);
            win.eq(0).attr('id', args.id);
            //给子页面查找父节点提供依据！！！
            win.find('iframe').attr('dialogid', args.id);
            win.attr({aniClose: args.aniClose});
            if (args.massage) {
                win.eq(0).addClass("an_d_massage");
            }
            bindHandler(win);
            if (args.onBeforeOpen(win)) {
                root.$('body').append(win);
                root.winIndex++;
                //绑定属性数据到上窗口上
                getWinTop().$.data(root.$("#" + args.id)[0], "an_dialog", {options: args});

                show(win);

                //页面里的所有窗体关闭完了需要卸载鼠标事件绑定
                if (!root.hasDialogHandler) {
                    root.andy.dialoghDragInit().bindEvent(root);
                    //headDragInit().bindEvent(root);
                    root.hasDialogHandler = true;
                }
            }
        });
    };
    //定义对外接口方法
    $.fn.an_dialog.methods = {
        options: function (jq) {
            var opts = getWinTop().$.data(jq[0], "an_dialog").options;
            return opts;
        },
        getOptions: function (jq) {
            var opts = getWinTop().$.data(jq[0], "an_dialog").options;
            return opts;
        },
        move: function (jq, options) {
            setPos(jq, options.left, options.top);
        },
        resize: function (jq, options) {
            reSize(jq, options.width, options.height);
        },
        //提供方法找到窗体,options可以是一个id,窗体内的一个子元素
        find: function (jq, options) {
            return find(options);
        },
        //只对url链接创建的对话框有效,执行对话框内部方法
        doCPageFun: function (jq, options) {
            //如果jq就是窗体对象
            if (jq.attr("an_dialog") === "true") {
                jq.find("iframe")[0].contentWindow[options.funName](options.argus);
            }
        },
        close: function (jq, id) {
            var windowbox;
            //如果jq就是窗体对象
            if (jq.attr("an_dialog") === "true") {
                windowbox = jq;
            } else if (id) {
                windowbox = find(id);
            }
            if (windowbox) {
                close(windowbox);
            }
        }
    };
    $.fn.an_dialog.defaults = {
        title: '窗口',
        width: 0,
        height: 0,
        reloadid: 'datagrid', //默认刷新父级#datagrid数据列表；
        modalval: true,
        source: this, //触发元素，或者是父窗口id
        aniOpen: "zoomIn",//打开动画
        aniClose: "",//关闭动画
        locMyself: false,//自己页面内弹出
        maximizable: false,
        draggable: true,
        resizeable: false,
        collapsible: false,
        closable: true,
        cls: "",
        onLoad: function () {
            //console.log("onLoad");
        },
        onBeforeOpen: function () {
            //console.log("onBeforeOpen");
            return true;
        },
        onOpen: function () {
            //console.log("onOpen");
        },
        onBeforeClose: function () {
            //console.log("onBeforeClose");
            return true;
        },
        onClose: function () {
            //console.log("onClose");
            return true;
        },
        onResize: function (w, h) {
            //console.log("onResize w:" + w + ",h:" + h);
        },
        onMove: function (x, y) {
            //console.log("onMove  x:" + x + ",y:" + y);
        }
    };


    //$(window).resize();
})(andy, jQuery);/*datagrid */
/**
 * 数据列表模块
 * author:林耘宇
 **/
(function ($) {
    $.fn.extend({
        an_datagrid:function(){
            var options = {};
            var funstyle = "";
            var arg = arguments[0];
            (typeof arg == "object")? options = arg:funstyle = arg;

            var tl = $.extend({
                table:'',//表格id
                bodyUrl:'',//创建body部分列表json
                urlParams:{},//链接参数配置
                ajaxType:'get',//请求url方式 get post
                lockTable:{
                    lockRow:0,//固定行数
                    lockColumn:0//固定列数
                },
                width:"100%",//表格显示宽度（实质是外出div宽度）
                height:"100%",//表格显示高度（实质是外出div高度）
                checkEnable:true,//check 是否可用 设置flase以便外部使用
                checkbox:"",//field字段属性
                radio:"",//field字段属性
                addColumns:"",
                coverColumns:"",
                setRowHtml:"",//生成row回调 方法，回调外部获取html td片段,传出参数tr的id 和 json
                setTrId:"",//设置tr id字段
                sortList:"",//排序设置 filed字段 icon样式 sort默认排序 升序"ascending" 降序"descending"
                onSortClick:function(){},//排序点击 排序filed字段 当前升降序ascending升序 descending降序
                onLoadComplete:function(){},
                onClickRow:function(){},//单击行事件
                onDblClickRow:function(){},//双击行事件
                onClickCell:function(){},//点击单元
                onDblClickCell:function(){}//双击单元
            }, options);

            var tableId=tl.table;
            var table = $(this);
            if(tl.table == ""){
                table = andy.setRandomId(table, "datagrid_");
                tl.table = table.attr("id");
                tableId = tl.table;
            }
            var ptable = table.parent();
            var tpheight = ptable.height();//父级高度
            var tpwidth = ptable.width();//父级宽度

            // 获取 设置对象
            var getOption = table.attr("options");
            var getValueElement = "";
            if(getOption){
                 getOption = "{"+ getOption+"}";
                 getOption = andy.stringToJson(getOption);
                // 处理设置
                for(var name in getOption){
                    if(getOption[name] == "true"){
                        tl[name] = true;
                    }else if(getOption[name] == "false"){
                        tl[name] = false;
                    }else{
                        tl[name] = getOption[name];
                    }
                }
            }
            tl.table = table;

            // 私有事件
            var lock = "EVENT_LOCK";
            var getHeadJson = "EVENT_GET_JSON";
            var getAllRowData = "EVENT_GET_ROW_DATA";
            var addRow = "EVENT_ADD_ROW";//新增行
            var getRow = "EVENT_GET_ROW";//获取行 数据
            var setRow = "EVENT_SET_ROW";//设置行数据
            var tableView = "EVENT_TABLE_VIEW";//显示隐藏列
            var addColumns = "EVENT_ADD_COLS";//增加 属性列 内容
            var coverColumns = "EVENT_COVER_COLS";//覆盖 属性列 内容
            var getChecked = "EVENT_GET_CHECKED";//获取选中数据
            var isAutoLockHead = false;//是否自动锁定head

            if(tl.height != "100%" || tl.height > 0){
                tpheight = tl.height;
            }else if(tl.height == "100%"){
                // tpheight = tl.height;
            };
            if(tl.width != "100%" || tl.width > 0){
                tpwidth = tl.width;
            }else if(tl.width == "100%"){
                // tpheight = tl.width;
            };

            if(funstyle != ""){
                if(funstyle == "locakTable"){
                    var thislock = {
                        lockRow:0,//固定行数
                        lockColumn:0//固定列数
                    };
                    var locktable = arguments[1];
                    thislock = $.extend(thislock, locktable);
                    table.trigger(lock, thislock);
                }else if(funstyle == "tableView"){
                    var node = arguments[1];
                    table.trigger(tableView, node);
                }else if(funstyle == "getHeadJson"){
                    // 获取头部JSON结构
                    var data = [];
                    var table = arguments[1];
                    var setJsonIndex = function(data){
                        var index = 0;
                        var p_index = 0;
                        var onData = function(data){
                            for(var i = 0; i <data.length; i++){
                                var dd = data[i];
                                if(dd.children.length > 0){
                                    dd.jsonParentIndex = p_index;
                                    onData(dd.children);
                                    p_index +=1;
                                }else{
                                    dd.jsonIndex = index;
                                    index += 1;
                                }
                            }
                        }
                        onData(data, index);
                    }
                    var getIsOpen = function(th){
                        var isOpen = "open";
                        if(th.hasClass("f-hidden")){
                            isOpen = "close";
                        }
                        return isOpen;
                    }
                    var getData = function(index, thIndex){
                        var ce = index-1;
                        var current = 0;
                        var thIndex = thIndex;
                        var newData = "";
                        var onData = function(data){
                            var cc = 0;//当前应有长度
                            var sc = 0;//初始长度
                            for(var i = 0; i < data.length; i ++){
                                var dd = data[i];
                                if(ce == current){
                                    if(dd.rowspan){
                                    }else{
                                        if(dd.maxColspan){
                                            cc += parseInt(dd.maxColspan);
                                        }else{
                                            cc += 1;
                                        }
                                        for(var j = sc ; j < cc; j ++){
                                            if(thIndex == j){
                                                newData = dd;
                                                break;
                                            }
                                        }
                                        sc += 1;
                                    }
                                }else{
                                    if(dd.children.length > 0){
                                        current = parseInt(dd.layer);
                                        onData(dd.children);
                                    }
                                }
                                if(newData != ""){
                                    // 如果有赋值 则退出循环
                                    break;
                                }

                            }
                        }
                        onData(data);
                        return newData;
                    }
                    table.find("thead tr").each(function(index, tr){
                        $(tr).find("th").each(function(i, th){
                            var $th = $(th);
                            var ob = {'id':index+"_"+i, 'name':$th.html(), 'view':getIsOpen($th), 'th_index':i, 'layer':index, 'colspan':$th.attr('colspan'), 'maxColspan':$th.attr('maxColspan'), 'rowspan':$th.attr('rowspan'), children:[]};
                            if(index == 0){
                                data.push(ob);
                            }else{
                                var cdata = getData(index, i);//层级 和th索引
                                if(cdata != ""){
                                    cdata.children.push(ob);
                                }
                            }
                        })
                    })
                    // 设置所有JSON索引 除开父节点
                    setJsonIndex(data);
                    return data;
                }else if(funstyle == "addColumns"){
                    var obj = {};
                    obj = {
                        data:arguments[1]
                    }
                    table.trigger(addColumns, obj);
                }else if(funstyle == "coverColumns"){
                    var obj = {};
                    obj = {
                        data:arguments[1]
                    }
                    table.trigger(coverColumns, obj);
                }else if(funstyle == "getChecked"){
                    var fun = arguments[1];
                    table.trigger(getChecked, fun)
                }else if(funstyle == "addRow"){
                    // 新增行 行数据
                    var data = arguments[1];
                    var fun = arguments[2];
                    var op = {
                        data:data,
                        callback:fun
                    }
                    table.trigger(addRow, op)
                }else if(funstyle == "getRow"){
                    var id = arguments[1];
                    var fun = arguments[2];
                    var op = {
                        id:id,
                        callback:fun
                    }
                    table.trigger(getRow, op)
                }else if(funstyle == "getAllRowData"){
                    var fun = arguments[1];
                    table.trigger(getAllRowData, fun)
                }else if(funstyle == "setRow"){
                    // id json  全设置
                    // id 属性字段 value  单个字段设置
                    var id = arguments[1];
                    var data = arguments[2];
                    var value = arguments[3];
                    var op = {
                        id:id,
                        data:data,
                        value:value
                    }
                    table.trigger(setRow, op)
                };
            }else{
                var box = $("<div style = 'position:relative;clear:both;'></div>");
                if(tpwidth != "100%"){
                    if(tl.lockTable.lockRow == 0){
                        box = $("<div style = 'position:relative;clear:both;overflow-x:auto;height:100%;'></div>");
                    }else{
                        box = $("<div style = 'position:relative;clear:both;overflow-x:auto;overflow-y:hidden;height:100%;'></div>");
                    }

                }
                table.wrap(box);

                // 绑定options
                table.data("options", tl)

                var init = function(){
                    // 显示隐藏列
                    table.bind(tableView, function(e, node){
                        var table = $("#" + tableId);
                        table.an_tableSetView(table, node);
                        var pheight = table.parent().parent().parent().height();
                        var pwidth = table.parent().parent().parent().width();
                        table.an_tableLayout(table, pwidth, pheight);
                    })

                    // 锁定行列
                    tl.table.bind(lock, function(e, locktable){
                        var table = $("#" + tableId);
                        table.an_tableLock({
                            table:tableId,//table的id
                            lockRow:locktable.lockRow,//固定行数
                            lockColumn:locktable.lockColumn,//固定列数
                            width:tpwidth,//表格显示宽度（实质是外出div宽度）
                            height:tpheight//表格显示高度（实质是外出div高度）
                        });
                        if(locktable.lockRow > 0){
                            table.parent().parent().css("overflow-y","hidden")
                        }
                        var pheight = table.parent().parent().parent().height();
                        var pwidth = table.parent().parent().parent().width();
                        table.an_tableLayout(table, pwidth, pheight);

                    });

                    //增加colums
                    tl.table.bind(addColumns, function(e, obj){
                        // console.log("aaa")
                        table.an_addColumns({
                            table:tableId,//table的id
                            columns:obj.data
                        })

                    })
                    if(tl.addColumns != ""){
                        table.an_addColumns({
                            table:tableId,//table的id
                            columns:tl.addColumns
                        })
                    }

                    tl.table.bind(coverColumns, function(e, obj){
                        if(typeof obj == "string"){
                            obj = andy.stringToJson(obj);
                        }
                        table.an_coverColumns({
                            table:tableId,//table的id
                            columns:obj.data
                        })
                    })

                    // 覆盖colums
                    if(tl.coverColumns != ""){
                        table.an_coverColumns({
                            table:tableId,
                            columns:tl.coverColumns
                        })
                    }

                    // 增加行
                    table.bind(addRow, function(e, op){
                        var options = table.data("options")
                        table.an_addRow(options, op)
                    })

                    // 获取行数据 通过id
                    table.bind(getRow, function(e, op){
                        table.an_getRow(op)
                    })

                    // 获取所有row数据
                    table.bind(getAllRowData, function(e, fun){
                        table.an_getAllRowData(fun)
                    })

                    // 获取值
                    table.bind(getChecked, function(e, fun){
                        var op = $.extend(true,{}, tl, {
                            callback:fun
                        })
                        if(op.checkbox != "" || op.radio != ""){
                            table.an_getChecked(op)
                        }
                    })

                    // 设置
                    table.bind(setRow, function(e, op){
                        table.an_setRow(op)
                    })

                    // //锁定行列
                    var lr = tl.lockTable.lockRow;
                    var lc = tl.lockTable.lockColumn;
                    if(isAutoLockHead && table.find('thead').children().length > 0){
                        lr = table.find('thead').children().length;
                        tl.lockTable.lockRow = lr;
                    }

                    if(lr >= 1 || lc >= 1){
                        table.an_tableLock({
                            table:tableId,//table的id
                            lockRow:lr,//固定行数
                            lockColumn:lc,//固定列数
                            width:tpwidth,//表格显示宽度（实质是外出div宽度）
                            height:tpheight//表格显示高度（实质是外出div高度）
                        });
                    };

                    if(tl.sortList != ""){
                        table.an_creatSortBtn()
                    }

                    var pheight = table.parent().parent().parent().height();
                    var pwidth = table.parent().parent().parent().width();
                    table.an_tableLayout(table, pwidth, pheight);

                    table.on("click", function(e){
                        var cell = $(e.target);
                        var row = cell.parent();
                        tl.onClickRow(row.index(), row)
                        tl.onClickCell(cell.index(), cell)
                    })

                    table.on("dblclick", function(e){
                        var cell = $(e.target);
                        var row = cell.parent();
                        tl.onDblClickRow(row.index(), row)
                        tl.onDblClickCell(cell.index(), cell)
                    })
                }

                if(tl.bodyUrl != ""){
                    table.an_creatDataList(tl, function(){
                        init();
                    });
                }else{
                    init()
                }
            };
        },
        an_addColumns:function(_options){
            // 添加列内容
            var table = $(this);
            var tableBody = table.find('tbody');
            var tableHeader = table.find('thead');
            if(_options.columns && _options.columns.length > 0){
                for(var i in _options.columns){
                    var columns = _options.columns[i];
                    var field = columns.field;
                    var formatter = columns.formatter;

                    tableHeader.find("[field]").each(function(index, th){
                        if($(th).attr("field") == field){
                            tableBody.find("tr").each(function(tr_index, tr){
                                $(tr).find("td").each(function(td_index, td){
                                    if(td_index == index){
                                        $(td).append(formatter);
                                    }
                                })
                            })
                        }
                    })
                }
            }
        },
        an_coverColumns:function(_options){
            // 覆盖列内容
            var table = $(this);
            var tableBody = table.find('tbody');
            var tableHeader = table.find('thead');
            if(_options.columns && _options.columns.length > 0){
                for(var i in _options.columns){
                    var columns = _options.columns[i];
                    var field = columns.field;
                    var formatter = columns.formatter;

                    tableHeader.find("[field]").each(function(index, th){
                        if($(th).attr("field") == field){
                            tableBody.find("tr").each(function(tr_index, tr){
                                $(tr).find("td").each(function(td_index, td){
                                    if(td_index == index){
                                        $(td).empty()
                                        $(td).append(formatter);
                                    }
                                })
                            })
                        }
                    })
                }
            }
        },
        an_getChecked:function(_options){
            var table = $(this);
            var tableBody = table.find('tbody');
            var tableHeader = table.find('thead');
            var field = "";
            var value = "";
            var data = [];
            if(_options.checkbox != ""){
                field = _options.checkbox;
            }else if(_options.radio != ""){
                field = _options.radio;
            }
            tableHeader.find("[field]").each(function(index, th){
                if($(th).attr("field") == field){
                    tableBody.find("tr").each(function(tr_index, tr){
                        if($(tr).hasClass("current")){
                            data.push($(tr).data("tr_data"));
                            $(tr).find("td").each(function(td_index, td){
                                if(td_index == index){
                                    if(value == ""){
                                        value += $(td).text()
                                    }else{
                                        value += ","+$(td).text()
                                    }
                                }
                            })
                        }

                    })
                }
            })

            _options.callback(value, data)
        },
        an_addRow:function(_options, op){
            var table = $(this);
            var tableBody = table.find('tbody');
            var tableHeader = table.find('thead');

            var idstr = _options.setTrId;
            if(idstr == ''){
                idstr = table.attr("id");
            }
            var lastId = tableBody.find("tr").last().attr("id");
            // var lastIndex = parseInt(lastId.charAt(lastId.length - 1))+1;
            var timestamp=new Date().getTime()
            var thisid = idstr+timestamp;
            // var thisid = idstr+lastIndex;
            var str = "<tr id='"+thisid+"'>";
            var contendStr = "";
            var tdData = op.data;
            var childrenData = "";

            if(_options.setRowHtml != ''){
                contendStr = _options.setRowHtml(thisid, tdData)
                str += contendStr.html;
                str += "</tr>";
                tableBody.append(str);
                $("#"+thisid).data("tr_data", tdData)
                if(contendStr.callback){
                    contendStr.callback(thisid, tdData, contendStr.html)
                }
                andy.perform($("#"+thisid))

            }
            if(op.callback){
                op.callback(tdData, thisid, contendStr.html)
            }
        },
        an_getRow:function(op){
            var table = $(this);
            var tableBody = table.find('tbody');
            var tableHeader = table.find('thead');
            if(op.callback){
                op.callback($("#"+op.id).data("tr_data"));
            }
        },
        an_getAllRowData:function(fun){
            var table = $(this);
            var tableBody = table.find('tbody');
            var tableHeader = table.find('thead');
            var allData = [];
            tableBody.find("tr").each(function(index, tr){
                allData.push($(tr).data("tr_data"))
            })
            if(fun){
                fun(allData)
            }
        },
        an_setRow:function(op){
            var table = $(this);
            var tableBody = table.find('tbody');
            var tableHeader = table.find('thead');
            var trId = op.id;
            var tr = tableBody.find("#"+trId);
            if(typeof op.data == "string"){
                var trData = tr.data("tr_data");
                trData[op.data] = op.value;
                tr.data("tr_data", trData);
            }else if(typeof op.data == "object"){
                tr.data("tr_data", op.data);
            };
        },
        an_creatDataList:function(_options, callBack){
            // 通过json 创建列表
            var table = $(this);
            var tableId = table.attr("id");
            var url = _options.bodyUrl;
            var ajaxType = _options.ajaxType;

            var isHaveChildren = function(data){
                var isHave = false;
                for(var j in data){
                    if(j == "children"){
                        isHave = data[j];
                    }
                }
                return isHave;
            }

            var insertTableBody = function(data){
                // return false;
                var tableBody = table.find('tbody');
                var tableHeader = table.find('thead');

                var bodyData = data.rows;
                var bodyAlign = data.rows_align || false;
                var bodyClass = data.rows_class;
                var headFieldArr = [];
                var bodyTdArr = [];

                var getHiddenByHeader = function(fieldName){
                    var hiddenClass = "";
                    tableHeader.find("th").each(function(index, th){
                        if($(th).attr("field") == fieldName && $(th).hasClass("f-hidden")){
                            hiddenClass = " f-hidden";
                        }
                    })
                    return hiddenClass;
                }

                var connectStr = function(){
                    var str = "";
                    if(headFieldArr.length>0){
                        for(var i = 0; i < headFieldArr.length; i++){
                            for(var name in bodyTdArr){
                                if(name == headFieldArr[i]){
                                    str += bodyTdArr[name];
                                }
                            }
                            if(headFieldArr[i] == "checkbox"){
                                str += "<td><input type='checkbox'></td>";
                            }else if(headFieldArr[i] == "radio"){
                                str += "<td><input type='radio' name = 'radio_"+table.attr("id")+"'></td>";
                            }
                        }
                    }else{
                        for(var name in bodyTdArr){
                            str += bodyTdArr[name];
                        }
                    }

                    return str;
                }


                tableHeader.find("[field]").each(function(index, th){
                    var $th = $(th);
                    headFieldArr[index] = $th.attr("field");
                })


                var cccStr = "";
                var createChildren2 = function(data, index){
                    for(var i = 0; i < data.length; i++){
                        var cstr = "<tr style = 'display:none;'>";
                        var conStr = "";
                        var tdData = data[i];
                        for(var j in tdData){
                            var ali = "";
                            var node = "";
                            if(bodyAlign && bodyAlign[0][j]){
                                // 设置td样式
                                ali = bodyAlign[0][j];
                            }
                            if(bodyClass && bodyClass[0][j] == "tree"){
                                var url = isHaveChildren(tdData);
                                if(typeof url === "string"){
                                    node = "group n"+(index+1);
                                    childrenUrl = "childrenUrl = "+ url;
                                }else if(typeof url === "object"){
                                    node = "group n"+(index+1);
                                    // console.log(url)
                                    createChildren2(url, index +1)
                                }else{
                                    node = "node n"+(index+1);
                                }
                            }
                            // 关于表头隐藏问题
                            var hiddenClass = getHiddenByHeader(j);
                            if(hiddenClass != ""){
                                node += hiddenClass;
                            }
                            if(j != "children"){
                                // contendStr += "<td align = '"+ali+"' class = '"+node+"' "+childrenUrl+">"+tdData[j]+"</td>";
                                bodyTdArr[j] = "<td align = '"+ali+"' class = '"+node+"' "+childrenUrl+">"+tdData[j]+"</td>";
                            }
                        }
                        conStr = connectStr();
                        cstr += conStr;
                        cstr += "</tr>";
                        cccStr += cstr;
                        cstr = "";
                        bodyTdArr = [];
                    }

                }

                var ccStr = "";

                var createChildren = function(data, index){
                    for(var i = 0; i < data.length; i++){
                        var cstr = "<tr style = 'display:none;'>";
                        var conStr = "";
                        var tdData = data[i];
                        for(var j in tdData){
                            var ali = "";
                            var node = "";
                            if(bodyAlign && bodyAlign[0][j]){
                                // 设置td样式
                                ali = bodyAlign[0][j];
                            }
                            if(bodyClass && bodyClass[0][j] == "tree"){
                                var url = isHaveChildren(tdData);
                                if(typeof url === "string"){
                                    node = "group n"+(index+1);
                                    childrenUrl = "childrenUrl = "+ url;
                                }else if(typeof url === "object"){
                                    node = "group n"+(index+1);
                                    // console.log(url)
                                    createChildren2(url, index +1)
                                }else{
                                    node = "node n"+(index+1);
                                }
                            }
                            // 关于表头隐藏问题
                            var hiddenClass = getHiddenByHeader(j);
                            if(hiddenClass != ""){
                                node += hiddenClass;
                            }
                            if(j != "children"){
                                // contendStr += "<td align = '"+ali+"' class = '"+node+"' "+childrenUrl+">"+tdData[j]+"</td>";
                                bodyTdArr[j] = "<td align = '"+ali+"' class = '"+node+"' "+childrenUrl+">"+tdData[j]+"</td>";
                            }
                        }
                        conStr = connectStr();
                        cstr += conStr;
                        cstr += "</tr>";
                        ccStr += cstr;
                        ccStr +=cccStr;
                        cstr = "";
                        cccStr = "";
                        bodyTdArr = [];
                    }

                }

                var idstr = _options.setTrId;
                if(idstr == ''){
                    idstr = tableId;
                }
                for(var i = 0; i < bodyData.length; i++){
                    var timestamp=new Date()
                    var thisid = idstr+Date.parse(timestamp)+i;
                    var str = "<tr id='"+thisid+"'>";
                    var contendStr = "";
                    var tdData = bodyData[i];
                    var tdCallBack = "";
                    var childrenData = "";

                    if(_options.setRowHtml != ''){
                        var op = _options.setRowHtml(thisid, tdData)
                        contendStr = op.html;
                        tdCallBack = op.callback || function(){};
                    }else{
                        for(var j in tdData){
                            var ali = "";
                            var node = "";
                            var childrenUrl = "";

                            if(bodyAlign && bodyAlign[0][j]){
                                // 设置td样式
                                ali = bodyAlign[0][j];
                            }
                            if(bodyClass && bodyClass[0][j] == "tree"){
                                var url = isHaveChildren(tdData);
                                if(typeof url === "string"){
                                    node = "group n1";
                                    childrenUrl = "childrenUrl = "+ url;
                                }else if(typeof url === "object"){
                                    node = "group n1";
                                    createChildren(url, 1)
                                }else{
                                    node = "node n1";
                                }
                            }else if(bodyClass){
                                node = bodyClass[0][j];
                            }
                            // 关于表头隐藏问题
                            var hiddenClass = getHiddenByHeader(j);
                            if(hiddenClass != ""){
                                node += hiddenClass;
                            }
                            if(j != "children"){
                                // contendStr += "<td align = '"+ali+"' class = '"+node+"' "+childrenUrl+">"+tdData[j]+"</td>";
                                bodyTdArr[j] = "<td align = '"+ali+"' class = '"+node+"' "+childrenUrl+">"+tdData[j]+"</td>";
                            }
                            // if()
                        }
                        contendStr = connectStr();
                    }

                    str += contendStr;
                    str += "</tr>";
                    str += ccStr;
                    ccStr = "";
                    bodyTdArr = [];
                    tableBody.append(str);
                    $("#"+thisid).data("tr_data", tdData);
                    if(tdCallBack != ""){
                        tdCallBack(thisid, tdData, contendStr);
                    }
                    if(tdData.checked && tdData.checked == true){
                        $("#"+thisid).addClass("current")
                        var input = $("#"+thisid).find('input');
                        if(input.attr('type') == "checkbox" || input.attr('type') == "radio"){
                            input.prop("checked", true);
                        }
                    }

                    contendStr = "";
                }
                if(_options.setRowHtml != ""){
                    andy.perform(table)
                }

            }

            // 执行
            if(typeof url == "string"){
                if(ajaxType == "get"){
                    andy.loaddata(url, _options.urlParams, function(data){
                        if(typeof data == "string"){
                            data = andy.stringToJson(data)
                        }
                        insertTableBody(data);
                        _options.onLoadComplete(data);
                        callBack();
                    })
                }else if(ajaxType == "post"){
                    andy.postdata(url, _options.urlParams, function(data){
                        if(typeof data == "string"){
                            data = andy.stringToJson(data)
                        }
                        insertTableBody(data);
                        _options.onLoadComplete(data);
                        callBack();
                    })
                }

            }else if(typeof url == "object"){
                // 如果是数据
                insertTableBody(url);
                callBack();
            }
        },
        an_tableInsertList:function(target, data){
            var ptr = target.parent();

            var isHaveChildren = function(data){
                var isHave = "";
                for(var j in data){
                    if(j == "children"){
                        isHave = data[j];
                    }
                }
                return isHave;
            }
            for(var i = 0; i < data.length; i++){
                var str = "<tr>";
                var tdData = data[i];
                var index = 0;
                for(var j in tdData){
                    var ali = "";
                    var node = "";
                    var childrenUrl = "";
                    var url = "";
                    ptr.children().each(function(i, t){
                        var ctd = $(t);
                        if(index == i){
                            ali = ctd.attr("align");
                            if(ctd.hasClass("group") || ctd.hasClass("node")){
                                node = "node n2";
                            }
                        }
                    })
                    // if(bodyAlign[j]){
                    //     // 设置td样式
                    //     ali = bodyAlign[j];
                    // }
                    // if(bodyClass && bodyClass[0][j] == "tree"){
                    //     url = isHaveChildren(tdData);
                    //     if(url != ""){
                    //         node = "group n1";
                    //         childrenUrl = url;
                    //     }else{
                    //         node = "node n1";
                    //     }
                    // }
                    if(j != "children"){
                        str += "<td align = '"+ali+"' class = '"+node+"' childrenUrl = '"+url+"'>"+tdData[j]+"</td>";
                    }
                    index += 1;

                }
                str += "</tr>";
                ptr.after(str);
            }
        },
        an_tableLayout:function(element, pw, ph){
            var scrollWidth = 17;
            var tableId = element[0].id;
            var table = element;
            var boxid = 'divBoxing-' + tableId;
            var bodyid = 'divBoxingbody-' + tableId;
            var headid = 'divBoxinghead-' + tableId;
            var fixedid = 'divBoxingfixed-'+tableId;

            var divBox = $("#" + boxid);//table活动体对象
            var divBoxhead = $("#" + headid);//锁定行对象
            var divBoxbody = $("#" + bodyid);//锁定列对象
            var divBoxfixed = $("#" + fixedid);//锁定头部交叉对象
            var th = $("#"+tableId+"_h");
            var tw = $("#"+tableId+"_w");

            var lheight = ph;
            var lwidth = pw;
            if(table.height() <= ph){
                // 没有滚动条的时候不计算滚动条宽度
                scrollWidth = 0;
            };
            // 锁定行列渲染
            divBox.parent().width(lwidth).height(lheight);
            divBox.width(lwidth).height(lheight);
            divBoxhead.width(divBox.width() - scrollWidth);
            th.height(table.height());
            divBoxbody.height(divBox.height() - scrollWidth);
            tw.width(table.width());

            // ----------------------------------------------选中行列操作

            // 选中行 动作
            var setStatus = function(element, status){
                if(element.parent().is("td")){
                    element.prop("checked", status);
                    var tr = element.parents("tr");
                    if(status){
                        tr.addClass("current");
                        var tr_data = tr.data("tr_data");
                        tr_data?tr_data.checked = true:tr_data ={};tr_data.checked=true;
                        tr.data("tr_data", tr_data)
                    }else{
                        tr.removeClass("current");
                        var tr_data = tr.data("tr_data");
                        tr_data?tr_data.checked = false:tr_data ={};tr_data.checked=false;
                        tr.data("tr_data", tr_data)
                    }

                };
            };
            var setCheck = function(index, element, status){
                element.find("input").each(function(i, input1){
                    var cell = $(input1);
                    // 非数字类型为全选 或者 是单选
                    if(typeof(index) != "number" || index == i){
                        if(cell.prop("checked") != status){
                            setStatus(cell, status);
                        };
                    };

                 });
            };
            // 设置所有
            var setItemAll = function(status){
                if(divBox[0]){
                    setCheck("", divBox.find("table"), status);
                }else{
                    setCheck("", table, status);
                };
                setCheck("", divBoxhead.find("table"), status);
                setCheck("", divBoxbody.find("table"), status);
                setCheck("", divBoxfixed.find("table"), status);
            };
            // 设置单个
            var setItem = function(index, status){
                if(divBox[0]){
                    setCheck(index, divBox.find("table"), status);
                }else{
                    setCheck(index, table, status);
                };
                setCheck(index, divBoxhead.find("table"), status);
                setCheck(index, divBoxbody.find("table"), status);
                setCheck(index, divBoxfixed.find("table"), status);
            };


            // ---------------------------------------------------树点击管理
            var getClassName = function(tr, name){
                var c = tr.children("."+name);
                var classname = c.attr("class");
                return classname
            };
            // 获取自己的层级
            var getGroupIndex = function(tr, classname){
                var name = getClassName(tr, classname);
                var namestr = name.split(" ");
                var nop = namestr[1].substr(0, 1);
                var non = parseInt(namestr[1].substr(1, namestr.length));
                return non;
            }
            // 获取自己的文件夹
            var getGroup = function(tr){
                var name = getClassName(tr, "node");
                var namestr = name.split(" ");
                var nop = namestr[1].substr(0, 1);

                var non = parseInt(namestr[1].substr(1, namestr.length));
                if(non >= 1){
                    non -= 1;
                };
                var preFirstGroup = tr.prevAll(".group"+nop+ non).first();
                if(non == 0){
                    preFirstGroup = null;
                }
                return preFirstGroup;
            }
            // 遍历对象 点击对象class 点击对象 是否开启
            var setNodeStatus = function(tr, fclass, clickt,  isOpen){
                // 设置节点显示状态
                var tclass = tr.attr("class");
                if(tclass && tclass.substr(0, tclass.length - 1) == fclass.substr(0, fclass.length - 1) && tclass.substr(tclass.length - 1, tclass.length) > fclass.substr(fclass.length - 1, fclass.length)){
                    // 操作文件夹
                    if(isOpen){
                        $(tr).css("display", "");
                    }else{
                        $(tr).css("display", "none");
                    }
                }else if(!tclass){
                    // 操作节点
                    if(isOpen){
                        var preFirstGroup = getGroup(tr);
                        // 如果它的父级文件夹开着 那么它就显示
                        if(preFirstGroup && preFirstGroup.children("td").hasClass("open")){
                            $(tr).css("display", "");
                        };
                    }else{
                        var preFirstGroup = getGroup(tr);
                        var clickIndex = getGroupIndex(clickt, "group");
                        var current = getGroupIndex(tr, "node");
                        if(preFirstGroup && preFirstGroup.children("td").hasClass("open") == false || current > clickIndex){
                            $(tr).css("display", "none");
                        };
                    };
                };
            };

            // 事件绑定
            var bindEvent = function(element){
                // 勾选事件绑定
                element.find("input").each(function(index, input){
                    var cell = $(input);
                    if(cell.parent().is("th") || cell.parent().is("td")){
                        if(table.data("options").checkEnable == false){
                            return false;
                        }
                        cell.unbind("click");
                        cell.click(function(e){
                            // 多选操作
                            if(cell.prop("checked") && cell.attr("type") == "checkbox"){
                                cell.parents("tr").addClass("current");
                                var tr = cell.parents("tr");
                                if(!tr.data("tr_data")){
                                    tr.data("tr_data", {
                                        checked:true
                                    })
                                }
                                var tr_data = tr.data("tr_data");
                                tr_data.checked = true;
                                setItem(index, true);
                                // 操作勾选动作
                                if(cell.parent().is("th") && cell.attr("type") == "checkbox"){
                                    // setCheck(element, true);
                                    setItemAll(true);
                                };
                            }else if(cell.attr("type") == "checkbox"){
                                cell.parents("tr").removeClass("current");
                                setItem(index, false);
                                var tr = cell.parents("tr");
                                var tr_data = tr.data("tr_data");
                                tr_data["checked"] = false;
                                // 操作取消动作
                                if(cell.parent().is("th") && cell.attr("type") == "checkbox"){
                                    setItemAll(false); 
                                };
                            }
                            // 单选操作
                            if(cell.prop("checked") && cell.attr("type") == "radio"){
                                cell.parents("tr").siblings().removeClass("current")
                                cell.parents("tr").addClass("current");
                            }

                        })
                    };

                });
                // 普通选中行 这个和多选有逻辑冲突 先屏蔽 这个选中行应该是唯一选中状态
                // element.find("table thead,tbody td:not('.group')").each(function(index, td){
                //     var cell = $(td);
                //     cell.unbind("click");
                //     cell.click(function(e){
                //         cell.parents("tr").toggleClass("current");
                //     });
                // });
                // 树表选择
                element.find(".group").each(function(index, group){
                    var cell = $(group);
                    var pcell = cell.parent();
                    var cclass = cell.attr("class");
                    var cname = cclass.split(" ");
                    cclass = cname[0] + cname[1];
                    pcell.addClass(cclass);
                    cell.unbind("click");
                    cell.click(function(e){
                        var g = $(e.target);
                        if(g.find("span").hasClass("quarters-loader")){
                            return false;
                        }
                        var tr = g.parent();
                        // 取 以上cclass赋值
                        var fclass = tr.attr("class").split(" ")[0];
                        var span = "<span class='quarters-loader' style = 'width:18px;height:18px;margin-left:8px'></span>";
                        // <span class="quarters-loader" style = "width:18px;height:18px;margin-left:8px"></span>
                        var isOpen = false;//执行动作
                        if(g.hasClass("open")){
                            isOpen = false;
                            g.removeClass("open");
                        }else{
                            isOpen = true;
                            g.addClass("open");
                        };

                        if(g.attr("childrenUrl")){
                            g.append(span);
                            andy.loaddata(g.attr("childrenUrl"), function(data){
                                g.find("span").remove(".quarters-loader");
                                table.an_tableInsertList(g, data)
                                g.attr("childrenUrl", "");
                                element.an_tableLayout(element, pw, ph);
                                // an_tableLayout:function(element, pw, ph)
                            })
                        }else{
                            tr.nextUntil("."+fclass).each(function(i, c){
                                setNodeStatus($(c), fclass, tr, isOpen);
                            });
                            // 锁定锁定行列状态
                            var headtr = divBoxhead.find("tbody tr").eq(tr.index());
                            headtr.nextUntil("."+fclass).each(function(i, c){
                                setNodeStatus($(c), fclass, headtr, isOpen);
                            });
                            var bodytr = divBoxbody.find("tbody tr").eq(tr.index());
                            bodytr.nextUntil("."+fclass).each(function(i, c){
                                setNodeStatus($(c), fclass, bodytr, isOpen);
                            });
                            var fixedtr = divBoxfixed.find("tbody tr").eq(tr.index());
                            fixedtr.nextUntil("."+fclass).each(function(i, c){
                                setNodeStatus($(c), fclass, fixedtr, isOpen);
                            });
                            // 重新渲染锁定行列
                            var pheight = table.parent().parent().parent().height();
                            var pwidth = table.parent().parent().parent().width();
                            table.an_tableLayout(table, pwidth, pheight);
                        }

                    });

                });
            };


            if(divBox[0]){
                bindEvent(divBox.find("table"));
            }else{
                bindEvent(table);
            };
            bindEvent(divBoxhead.find("table"));
            bindEvent(divBoxbody.find("table"));
            bindEvent(divBoxfixed.find("table"));
        },
        an_tableLock: function(options) {
            var tl = $.extend({
                table:'lockTable',//table的id
                lockRow:0,//固定行数
                lockColumn:0,//固定列数
                width:'100%',//表格显示宽度（实质是外出div宽度）
                height:'100%',//表格显示高度（实质是外出div高度）
                lockRowCss:'lockRowBg',//锁定行的样式
                lockColumnCss:'lockColumnBg'//锁定列的样式
            }, options);

            var tableId=tl.table;
            var table=$('#'+tableId);
            var an_datagrid = "an-datagrid";//渲染字段
            var boxid = 'divBoxing-' + tableId;
            var bodyid = 'divBoxingbody-' + tableId;
            var headid = 'divBoxinghead-' + tableId;
            var fixedid = 'divBoxingfixed-'+tableId;
            var topindex = 50;
            var bottomindex = 1;
            var fiexdindex = 100;

            // if(table){

            // jQuery.fx.interval = 10000;
            var box=$("<div id='"+boxid+"'></div>").scroll(function(e){//在此处添加事件
                if(e.target.scrollTop > 0){
                    divBoxbody.css({"z-index":bottomindex});
                    divBoxhead.css({"z-index":topindex});
                }
                if(e.target.scrollLeft > 0){
                    divBoxbody.css({"z-index":topindex});
                    divBoxhead.css({"z-index":bottomindex});
                }
                divBoxbody.stop().animate({"scrollTop":e.target.scrollTop+'px'}, 0);
                divBoxhead.stop().animate({"scrollLeft":e.target.scrollLeft+'px'}, 0);
            });
            box.css({'width':tl.width, 'height':tl.height, 'overflow':'auto', 'position':'relative', 'clear':'both'});//设置高度和宽度
            table.wrap(box);
            table.addClass('tbLock');

            //创建div
            var divBox = $("#" + boxid);
            divBox.after("<div id = '"+headid+"'></div>");
            divBox.after("<div id = '"+bodyid+"'></div>");
            divBox.after("<div id = '"+fixedid+"'></div>");
            var divBoxhead = $("#" + headid);
            var divBoxbody = $("#" + bodyid);
            var divBoxfixed = $("#" + fixedid);

            var crossNum=tl.lockRow*tl.lockColumn;
            var scrollWidth = 17;
            var rowheights = 0;
            var colwidths = 0;
            if(tl.lockRow>0){
                var tr;
                for(var r=0;r<tl.lockRow;++r){//添加行锁定
                    tr=table.find('thead tr:eq('+r+') >th').addClass('LockRow').addClass(tl.lockRowCss);
                    if(!tr[r]){
                        // 头部不够 锁定body部分
                        tr=table.find('tbody tr:eq('+r+') >td').addClass('LockRow').addClass(tl.lockRowCss);
                    };
                    var trHeight = tr[r].offsetHeight;
                    if($(tr[r]).attr("rowspan")){
                        // 跨行计算
                        trHeight = trHeight/parseInt($(tr[r]).attr("rowspan"));
                    };
                    rowheights += trHeight;
                    for(var c=0;c<tl.lockColumn;++c){//设置交叉单元格样式，除了锁定单元格外还有交叉单元格自身样式
                        if(tr){
                            table.find('thead tr th:eq('+c+')').addClass('LockCell');
                            tr.find('td:eq('+c+')').addClass('LockCell').addClass(tl.lockRowCss);
                        }

                    }
                }
            };
            if(tl.lockColumn>0){
                var rowNum=$('#'+tableId+' tr').length;
                var tr, th;
                for(var r=(tl.lockRow);r<rowNum;++r){
                    tr=table.find('tr:eq('+r+')');
                    th = table.find('thead tr:eq(0) >th')
                    for(var c=0;c<tl.lockColumn;++c){//添加列锁定
                        if(r == (tl.lockRow)){
                            colwidths += th[c].offsetWidth;
                        };
                        tr.find('td:eq('+c+')').addClass('LockCell').addClass(tl.lockColumnCss);
                    }
                }
            }

            //复制横向

            var boxwidth = divBox.width() - scrollWidth;
            // console.log(divBox.css("width"), "|", tl.width);
            divBoxhead.width(boxwidth);//设置高度和宽度
            var th = table.clone(true).attr({"id":tableId + "_h"});
            
            th.height(table.height());
            divBoxhead.css({"position":"absolute", "top":"0px", "left":"0px", "overflow":"hidden"});
            divBoxhead.height(rowheights);
            divBoxhead.append(th);
            // th.removeAttr(an_datagrid);//移除属性名
            th.attr("optipns", null);
            th.attr(an_datagrid, null);

            //复制纵向
            divBoxbody.css({"position":"absolute", "top":"0px", "left":"0px", "overflow":"hidden"});
            var divheight = divBox.height() - scrollWidth;
            divBoxbody.height(divheight);
            var tw = table.clone(true).attr({"id":tableId + "_w"});
            
            tw.width(table.width());
            divBoxbody.width(colwidths);//设置高度和宽度
            divBoxbody.append(tw);
            // IE8 下面不支持
            tw.attr("options",null);//移除属性名
            tw.attr(an_datagrid, null);
            // tw.removeAttr("an-datagrid");//移除属性名
            //当table宽度自设置为100%时候

            // //复制交叉固定
            divBoxfixed.css({"position":"absolute", "top":"0px", "left":"0px", "overflow":"hidden"});
            divBoxfixed.css({"z-index":fiexdindex});

            var fixed = table.clone(true).attr({"id":tableId + "_f"});
            
            divBoxfixed.width(colwidths).height(rowheights);
            // fixed.find("thead tr th:not(.LockCell)").remove();
            divBoxfixed.append(fixed);
            fixed.width(table.width()).height(table.height());
            fixed.attr("options",null)//移除属性名
            fixed.attr(an_datagrid, null);
            // $("#lockTable_f").css({'width':'200px', "_width":"200px"});

            // //绑定布局事件
            if(rowheights > 0 && colwidths > 0){
                table.bind("layout", function(){
                    var lheight = divBox.parent().parent().height();
                    var lwidth = divBox.parent().parent().width();
                    divBox.parent().width(lwidth).height(lheight);
                    divBox.width(lwidth).height(lheight);
                    fixed.width(table.width()).height(table.height());
                    // table.width(tl.width).height(divBox.height());

                    divBoxhead.width(divBox.width() - scrollWidth);
                    th.height(table.height());
                    divBoxbody.height(divBox.height() - scrollWidth);
                    tw.width(table.width());


                })
            }

        },
        an_tableSetView:function(element, node){
            var tableId = element[0].id;
            var table = element;
            var an_datagrid = "an-datagrid";//渲染字段
            var boxid = 'divBoxing-' + tableId;
            var bodyid = 'divBoxingbody-' + tableId;
            var headid = 'divBoxinghead-' + tableId;
            var fixedid = 'divBoxingfixed-'+tableId;

            //创建div
            var divBox = $("#" + boxid);
            var divBoxhead = $("#" + headid);
            var divBoxbody = $("#" + bodyid);
            var divBoxfixed = $("#" + fixedid);

            // 获取当前头部JSON
            var headData = table.an_datagrid("getHeadJson", table);

            var setView = function(tb){

                // 头部父级牵连
                var setHeadParent = function (){
                    var index = 0;
                    var parentNode = "";
                    var pNode = "";

                    var onParentData = function(data){
                        for(var i = 0; i <data.length; i++){
                            var dd = data[i];
                            if(node.layer == dd.layer){
                                if(node.jsonIndex == index){
                                    parentNode = dd;
                                    break;
                                }

                            }
                            if(dd.children.length > 0){
                                pNode = dd;
                                onParentData(dd.children);
                            }else{
                                index += 1;
                            }

                            if(parentNode != ""){
                                break;
                            }
                        }
                    }
                    onParentData(headData);

                    var openCounts = 0;
                    for(var i = 0;i < pNode.children.length; i++){
                        var d = pNode.children[i];
                        if(d.view == "open"){
                            openCounts +=1;
                        }
                    }
                    tb.find("thead tr").each(function(tr_index,tr){
                        $(tr).find("th").each(function(th_index, th){

                            if(tr_index == parseInt(pNode.layer) && th_index == parseInt(pNode.th_index)){
                                if(openCounts > 0){
                                    $(th).removeClass("f-hidden");
                                    $(th).attr("colspan", openCounts);
                                    pNode.view = "open";
                                }else if(openCounts == 0){
                                    $(th).addClass("f-hidden");
                                    pNode.view = "close";
                                }
                            }
                        })
                    })
                }

                // 头部子级牵连
                var setHeadChildren = function(){
                    var index = 0;
                    var parentNode = "";
                    var pNode = "";
                    var parentDom = "";

                    var onChildrenData = function(data){
                        for(var i = 0; i <data.length; i++){
                            var dd = data[i];
                            if(node.layer == dd.layer){
                                // console.log(node.jsonParentIndex, index, dd.jsonParentIndex);
                                if(node.jsonParentIndex == dd.jsonParentIndex){
                                    parentNode = dd;
                                    break;
                                }

                            }
                            if(dd.children.length > 0){
                                pNode = dd;
                                index += 1;
                                onChildrenData(dd.children);
                            }

                            if(parentNode != ""){
                                break;
                            }
                        }
                    }

                    var hiddenNode = function(nn){
                        for(var i = 0; i <nn.children.length; i++){
                            var dd = nn.children[i];

                            tb.find("thead tr").each(function(tr_index,tr){
                                $(tr).find("th").each(function(th_index, th){

                                    if(tr_index == parseInt(dd.layer) && th_index == parseInt(dd.th_index)){
                                        var $th = $(th);

                                        if(nn.view == 'open'){
                                            $th.removeClass("f-hidden");
                                            dd.view = "open";
                                        }else{
                                            $th.addClass("f-hidden");
                                            dd.view = "close";
                                        }
                                        hiddenTbody(dd);
                                    }
                                })
                            })
                            if(dd.children.length > 0){
                                hiddenNode(dd.children);
                            }
                        }
                    }

                    var getNodeStatus = function(p_node){
                        var openCounts = 0;
                        for(var i = 0;i < p_node.children.length; i++){
                            var d = p_node.children[i];
                            if(d.view == "open"){
                                openCounts +=1;
                            }
                        }
                        return openCounts;
                    }


                    onChildrenData(headData);

                    // 集合一下 全部隐藏
                    hiddenNode(parentNode);
                    // 反操作父节点数量
                    if(getNodeStatus(parentNode) > 0){
                        tb.find("thead tr").each(function(tr_index,tr){
                            $(tr).find("th").each(function(th_index, th){

                                if(tr_index == parseInt(parentNode.layer) && th_index == parseInt(parentNode.th_index)){
                                    var $th = $(th);

                                    $(th).attr("colspan", getNodeStatus(parentNode));
                                }
                            })
                        })
                    }
                }

                // 内容显示隐藏
                var hiddenTbody = function (node){
                    tb.find("tbody tr").each(function(tr_index,tr){
                        $(tr).find("td").each(function(td_index, td){

                            if(td_index == parseInt(node.jsonIndex)){
                                if(node.view == "open"){
                                    $(td).removeClass("f-hidden");
                                }else{
                                    $(td).addClass("f-hidden");
                                }
                            }
                        })

                    })
                }

                // 头部显示隐藏
                var trCounts = tb.find("thead tr").length;
                tb.find("thead tr").each(function(tr_index,tr){
                    $(tr).find("th").each(function(th_index, th){
                        if(tr_index == parseInt(node.layer) && th_index == parseInt(node.th_index)){
                            if($(th).hasClass("f-hidden")){
                                $(th).removeClass("f-hidden");
                                node.view = "open";
                            }else{
                                $(th).addClass("f-hidden");
                                node.view = "close";
                            }
                            headData = table.an_datagrid("getHeadJson", table);
                            hiddenTbody(node);
                            if(tr_index > 0){
                                setHeadParent();
                            }else if(tr_index < trCounts-1){
                                setHeadChildren();
                            }
                        }
                    })
                })
            }

            if(divBox.length > 0){
                setView(divBox);
                setView(divBoxhead);
                setView(divBoxbody);
                setView(divBoxfixed);
            }else{
                setView(table);
            }
        },
        an_tableView:function(){
            // 关于数据列表 头部显示隐藏
            var options = {};
            var funstyle = "";
            for(var i= 0; i <arguments.length;i++){
                // console.log(arguments[0]);
                var a = arguments[0];
                if(typeof a == "object"){
                    options = a;
                }else if(typeof a == "string"){
                    funstyle = a;
                }
            };

            var table = $(this);
            var dialogId = table.attr("id")+"_dialog";
            var treeId = table.attr("id")+"_tree";

            var getJson = "EVENT_GET_JSON";//获取头部当前JSON状态

            if(funstyle != ""){
                //方法写入
                if(funstyle == "getJson"){
                    var fun = arguments[1];
                    table.trigger(getJson, fun);
                };
            }else{

                var _options = $.extend({
                    width:400,
                    height:430,
                    setHeadJson:"",
                    postUrl:"",//提交当前表头显示隐藏状态地址
                    postSuccess:function(){},//提交状态成功
                    onTreeCheck:function(){}
                }, options);

                // 对话框底部按钮
                var dialog_bottom = "<div class='u-p-l-bottom u-upload-bot' style = 'width:100%;height:40px;background:#EEE;position:absolute;bottom:0px;left:0px;_top:"+(_options.height-45)+"px;_left:5px;_z-index:10000;'>"+
                                        "<div class='f-right f-p-xs'>"+
                                      "<a href='javascript:;' class='u-button-default success submit' id = 'submit_btn' style='float:left; margin-left:10px;'>确认</a>"+
                                    "</div></div>";
                // 创建对话框
                $(document).an_dialog({
                    id:dialogId,
                    aniClose:false,
                    locMyself:true,
                    onBeforeClose:function(){
                        // 关闭对话框验证
                        return true;
                    },
                    title: "显示隐藏列",
                    html: "<div class='' style = 'height:"+(_options.height-85)+"px;overflow-y:auto'><ul id='"+treeId+"' class='ztree'></ul></div>" + dialog_bottom,
                    width:_options.width,
                    height:_options.height
                });

                dialog = $("#"+dialogId);

                // 对话框确认按钮
                var submit = dialog.find("#submit_btn");
                var isSubmit = false;

                var onTreeCheck = function(node){
                    // console.log(node)
                    table.an_datagrid("tableView", node);
                }

                var setCurrentCheck = function (data){
                    var t = $.fn.zTree.getZTreeObj(treeId);
                    // var node = t.getNodeByTId(data.tId);
                    var node = t.getNodeByParam("id", data.id);
                    t.checkNode(node, true, false);
                }

                var createTree = function (treeId, set, nodes){
                    // console.log(treeId, nodes)
                    //树设置
                    var setting = {
                        treeObj:null,
                        callback:{
                            onCheck:function(event, treeId, treeNode) {
                                // 对比即时状态
                                // var cData = table.an_datagrid("getHeadJson", table);
                                // console.log(treeNode.view)
                                // var cNode = getNode(cData);
                                // function getNode(node){
                                //     var n = "";
                                //     goNode(node);
                                //     function goNode(node){
                                //         for(var i = 0; i < node.length; i++){
                                //             var d = node[i];
                                //             if(d.layer == treeNode.layer && d.th_index == treeNode.th_index){
                                //                 n = d;
                                //             }
                                //             if(d.children.length > 0){
                                //                 goNode(d.children);
                                //             }
                                //         }
                                //     }
                                //     return n;
                                // }
                                // treeNode.view = cNode.view;
                                // 外部调用事件
                                // if(treeNode.view == "open"){
                                //     treeNode.view = "close";
                                // } else{
                                //     treeNode.view = "open";
                                // }
                                _options.onTreeCheck(treeNode);
                                onTreeCheck(treeNode);
                            }
                        },
                        check: {
                            enable: true,
                            chkStyle: "checkbox",
                            chkboxType: { "Y": "sp", "N": "sp" }
                        },
                        data: {
                            simpleData: {
                              enable: true
                            }
                        }
                    };
                    if(set){
                        setting = $.extend(setting, set);
                    };

                    var tree = "";
                    // 判断是否加载ztree结构json
                    if(nodes){
                        $.fn.zTree.init($("#" + treeId), setting, nodes);
                        tree = $("#" + treeId);
                        for(var i = 0; i< nodes.length; i++){
                            // console.log(nodes[i].view)
                            if(nodes[i].view == "close"){
                                setCurrentCheck(nodes[i]);
                            }
                        }

                        // setCurrentShow(combo.showTarget);
                    }else if(op && op.url){
                        // andy.loaddata(op.url, function(data){
                        //     data = andy.stringToJson(data);
                        //     $.fn.zTree.init($("#" + treeId), setting, data);
                        //     tree = $("#" + treeId);
                        //     setCurrentShow(combo.showTarget);
                        // })
                    };
                }
                submit.on("click", function(e){
                    if(isSubmit){
                        return true;
                    }
                    isSubmit = true;
                    if(_options.postUrl == ""){
                        isSubmit = false;
                        dialog.an_dialog("close");
                    }else{
                        var headData = table.an_datagrid("getHeadJson", table);
                        $.post(_options.postUrl, headData, function(data, textStatus, jqXHR){
                            if(textStatus == "success"){
                                alert("状态已经保存");
                                _options.postSuccess();
                                isSubmit = false;
                                dialog.an_dialog("close");
                            }else{
                                alert(jqXHR);
                                isSubmit = false;
                            }

                        });
                    }
                })

                // 获取当前头部数据
                table.bind(getJson, function(e, fun){
                    var headData = table.an_datagrid("getHeadJson", table);
                    fun(headData);
                })

                // 获取当前头部JSON
                var headData = table.an_datagrid("getHeadJson", table);
                createTree(treeId, null, headData)
            }

        },
        an_creatSortBtn:function(){
            var table = $(this);
            var tableId = table.attr("id");
            var options = table.data("options");
            var lockTable = options.lockTable;
            var field = options.sortList.field;
            var sort = options.sortList.sort || "descending";//默认降序
            var icon = options.sortList.icon || "<div class = 'm-icon'><i class='iconfont'></i></div>";
            var iconb = options.sortList.iconb || "<div class = 'm-icon'><i class='iconfont'></i></div>";
            if(lockTable.lockColumn > 0 || lockTable.lockRow > 0){
                table = $("#"+tableId+"_h");
            }

            var replaceIcon = function(cell){
                sort == "descending"?sort = "ascending":sort = "descending";
                cell.replaceWith(sort == "descending"?iconb:icon);
                cell.click(function(e){
                    replaceIcon($(e.target))
                    options.onSortClick(field, sort)
                })
            }
            table.find("thead tr th").each(function(index, th){
                if($(th).attr("field") == field){
                    $(th).append(sort == "descending"?iconb:icon)
                    $(th).find(".m-icon").click(function(e){
                        replaceIcon($(e.target))
                        options.onSortClick(field, sort)
                    })
                }
            })
        }
    });
})(jQuery);/*tabs */
/**
 * 分页模块
 * author:林耘宇
 **/
(function ($) {
    $.fn.extend({
        an_tabs:function(){
            var options = {};
            var funstyle = "";
            var arg = arguments[0];
            (typeof arg == "object")? options = arg:funstyle = arg;

            var _options = $.extend({
                tabsId:"",
                index:1,//默认打开
                fit:true,//默认自适应
                autoActive:true,//自动渲染 关闭后默认只渲染首开页
                height:0,
                width:0,
                tabsEvent:"click",//tabs切换事件
                hidden:[],//隐藏tabs:0不可见 1可见 [1, 0, 1];
                onClick:function(){}
            }, options);

            var _stringclass = {
                head:"m-tabs-header",
                body:"m-tabs-content",
                layouted:"layouted",
                hidden:"f-hidden",
                item:"item",
                active:"active",
                headTop:"head-top",
                headLeft:"head-left",
                headRight:"head-right",
                headBottom:"head-bottom"
            };

            var tabs = $(this);
            if(_options.tabsId == ""){
                tabs = andy.setRandomId(tabs, "tabs_");
                _options.tabsId = tabs.attr("id");
            }
            var head = tabs.children("."+_stringclass.head);
            var body = tabs.children("."+_stringclass.body);
            var item = body.children("." + _stringclass.item);
            var leftBar = "<div class='iconfont left-bar'></div>";
            var rightBar = "<div class='iconfont right-bar'></div>";
            var showEvent = "SHOW_EVENT";
            
            // 获取 设置对象
            var getOption = tabs.attr("options");
            var getValueElement = "";
            if(getOption){
                 getOption = "{"+ getOption+"}";
                 getOption = andy.stringToJson(getOption);
                // 处理设置
                for(var name in getOption){
                    if(getOption[name] == "true"){
                        _options[name] = true;
                    }else if(getOption[name] == "false"){
                        _options[name] = false;
                    }else{
                        _options[name] = getOption[name];
                    }
                    
                }
            }

            tabs.data("fit", _options.fit);
            var show = function(index){
                body.children().each(function(i, e){
                    var t = $(e);
                    if(index == i){
                        if(!t.hasClass(_stringclass.active)){
                            t.addClass(_stringclass.active);
                        }
                        if(!t.hasClass(_stringclass.layouted)){
                            if(_options.autoActive == false){
                                t.append(t.data("content"))
                            }
                            andy.perform(t);
                            andy.layout(t);
                            t.addClass(_stringclass.layouted);
                        }
                    }else{
                        t.removeClass(_stringclass.active);
                    }
                });
            };

            // 执行隐藏
            var isHidden = function(index){
                if(_options.hidden != []){
                    if(typeof(_options.hidden[index]) == "number"){
                        return _options.hidden[index];
                    }
                }else{
                    return 1;
                };
            };

            if(funstyle != ""){
                //方法写入
                if(funstyle == "hidden"){
                    // 默认选择第一个 显示的页签
                    var getChoose = function(arr){
                        var choose = 0;
                        for(var i = 0; i < arr.length; i++){
                            if(arr[i] == 1){
                                choose = i;
                                break;
                            }
                        };
                        return choose;
                    };
                    var arr = arguments[1];
                    var choose = getChoose(arr);
                    _options.hidden = arr;
                    show(choose);

                    head.find("li").each(function(i, e){
                        var t = $(e);
                        t.removeClass(_stringclass.active);
                        if(isHidden(i) == 0){
                            t.hide();
                        }else if(isHidden(i) == 1){
                            t.show();
                            if(i == choose){
                                t.addClass(_stringclass.active);
                            }
                        };
                    });

                    
                }else if(funstyle = "show"){
                    var index = parseInt(arguments[1]);
                    if(index < 0){
                        index = 0;
                    }
                    tabs.trigger(showEvent, index);
                };
            }else{

                if(tabs[0]){
                    tabs[0].option = _options;
                }
                
                
                var tabstyle = "";
                var contentstyle = "";
                var leftBarBtn,rightBarBtn;
                // var pheight = tabs.parent().height();//父级高度

                // console.log(tabs.parent().css("height"))
                var bodyPadding = parseInt(body.css("padding-left"));
                if(!bodyPadding){
                    bodyPadding = 0;
                }
                var bodyBorder = parseInt(body.css("border-left"));
                if(!bodyBorder){
                    bodyBorder = 0;
                }
                var bodyBottomBorder = parseInt(body.css("border-bottom"));
                if(!bodyBottomBorder){
                    bodyBottomBorder = 0;
                }
    			//alert(bodyPadding);
    			
                var headHeight = 0;//head.outerHeight() + bodyPadding *2;
                var headWidth = 0;

                // 初始化左右滑动按钮
                var moveOptions = function(direction){
                    var ulWidth = getHeadWidth();
                    var headWidth = head.width()- leftBarBtn.outerWidth()*2 - head.find("li").length * 2 -2;
                    var ul = head.find("ul");
                    var left = ul.css("left") == "auto"?0:parseInt(ul.css("left"));
                    var moveLeft = left+headWidth*direction;
                    moveLeft > 0?moveLeft = 0:null;
                    moveLeft < -ulWidth?moveLeft = left:null;
                    -moveLeft > (ulWidth - headWidth)? moveLeft = headWidth - ulWidth:null; 
                    ul.animate({"left":moveLeft}, 300)
                }
                var setOptionsBtn = function(){
                    head.append(leftBar);
                    head.append(rightBar);
                    leftBarBtn = head.find(".left-bar");
                    leftBarBtn.hide()
                    leftBarBtn.click(function(){
                        moveOptions(1)
                    })
                    rightBarBtn = head.find(".right-bar");
                    rightBarBtn.hide()
                    rightBarBtn.click(function(){
                        moveOptions(-1)
                    })
                }
                if(!tabs.hasClass(_stringclass.headTop) && !tabs.hasClass(_stringclass.headLeft) && !tabs.hasClass(_stringclass.headRight) && !tabs.hasClass(_stringclass.headBottom)){
                    headHeight = head.outerHeight();
                    setOptionsBtn()
                    // tabs.addClass(_stringclass.headTop);
                }else if(tabs.hasClass(_stringclass.headTop)){
                    headHeight = head.outerHeight();
                    setOptionsBtn()
                }else if(tabs.hasClass(_stringclass.headLeft)){
                    headWidth = head.outerWidth();
                }else if(tabs.hasClass(_stringclass.headRight)){
                    headWidth = head.outerWidth();
                }else if(tabs.hasClass(_stringclass.headBottom)){
                    headHeight = head.outerHeight();
                }

                var choose = function(index){
                    head.find("li").each(function(i, e){
                        var t = $(e);
                        if(index == i){
                            if(!t.hasClass(_stringclass.active)){
                                t.addClass(_stringclass.active);
                            }
                        }else{
                            if(isHidden(i) == 0){
                                t.hide()
                                // t.addClass(_stringclass.hidden);
                            }
                            t.removeClass(_stringclass.active);
                        }
                    })
                    // hiddenTabs();
                    if(_options.autoActive == false){
                        body.children().each(function(i, e){
                            var t = $(e);
                            if(index != i){
                                if(!t.hasClass(_stringclass.layouted)){
                                    var con = t.html();
                                    if(con){
                                        t.data("content", con)
                                    }
                                    t.empty()
                                }
                            }
                        });
                    }
                    show(index);
                };

                var start = function(){
                    if(tabs.children().find(_stringclass.head)){
                        choose(_options.index - 1);
                    }

                    //绑定事件
                    head.find("li").each(function(i, e){
                        var $e = $(e);
                        // $e.is('li') || ($e = $e.closest('li'));
                        $e.find(".close").click(function(e){
                            $e.addClass("f-hidden")
                            _options.hidden[i] = 0;
                            choose(0);
                            e.stopPropagation()
                        })
                        $e.bind(_options.tabsEvent, function(event){
                            choose(i);
                            _options.onClick(event);
                            tabs.trigger(andy.EVENT_CLICK, i+1);
                        })
                    })
                };

                var getHeadWidth = function(){
                    var width = 0;
                    head.find("li").each(function(index, li){
                        width += $(li).outerWidth()
                    })
                    return width;
                }

                var fitlayout= function(){
                    var pheight = tabs.parent().height();
                    var pwidth = tabs.parent().width();
                    // tabs.height(pheight).width(pwidth);
                    tabs.outerHeight(pheight).outerWidth(pwidth);
                    body.outerHeight(pheight - headHeight).outerWidth(pwidth - headWidth);
                    // tabs.trigger("layout_complete");//出发布局结束
                    var bodyHeight = body.height();
                    var bodyWidth = body.width();
                    body.children().each(function(index, content){
                        var $content = $(content);
                        $content.outerHeight(bodyHeight).outerWidth(bodyWidth);
                    });

                    // overflow
                    if(getHeadWidth() > head.width() && leftBarBtn){
                        head.addClass("overflow")
                        head.find("ul").width(head.width()*2)
                        leftBarBtn.show()
                        rightBarBtn.show()
                    }else if(leftBarBtn){
                        head.removeClass("overflow")
                        leftBarBtn.hide()
                        rightBarBtn.hide()
                    }
                };

                // 主动选择分页
                tabs.bind(showEvent, function(e, index){
                    choose(index);
                })
                
                if(!tabs.data("fit")){
                    var pheight = tabs.parent().height();
                    var pwidth = tabs.parent().width();
                    if(_options.height>0){
                        pheight = _options.height;
                    }
                    if(_options.width>0){
                        pwidth = _options.width;
                    }
                    tabs.outerHeight(pheight).outerWidth(pwidth);
                    body.outerHeight(pheight - headHeight).outerWidth(pwidth - headWidth);
                    var bodyHeight = body.height();
                    var bodyWidth = body.width();
                    body.children().each(function(index, content){
                        var $content = $(content);
                        $content.outerHeight(bodyHeight).outerWidth(bodyWidth);
                        $content.outerWidth(bodyWidth);
                    });
                }else{
                    fitlayout();
                    tabs.bind("layout", function(){
                        fitlayout();
                    })
                };

                start();
            };
        }
    })
})(jQuery);/*
fwq 2016/3/21
switch 组件：
若在input上使用disabled也可以禁用开关
changeBefor 状态改变前，传递checkbox对象作为回掉参数
changeAfter 状态改变后，传递checkbox对象作为回掉参数
setEnable(true/false) 是否禁用开关
setState(true/false)  设置开关状态，开启||关闭
 */
;
( function ( $ ) {

	$.fn.extend( {

		switchs: function () {
			/**
			 * 控制开关样式
			 * @method stateInit
			 * @param  {[Object]}  $element [JQuery对象]
			 * @param  {[Booleam]}  flag
			 * @return {[void]}
			 */

			var stateInit = function ( $element, flag ) {
				var _icon, stateClass;
				$element.find( 'i' )
					.remove();
				$element.removeClass( 'on off' );
				flag ? _icon = '<i class="iconfont "></i>' : _icon = '<i class="iconfont "></i>';
				flag ? stateClass = 'on' : stateClass = 'off';
				$element.addClass( stateClass )
					.append( _icon )
					.addClass( 'switchState' );
			};
			Config = {
				/**
				 * 方法主程
				 * @method init
				 * @param  {[Object]} option [外部传入的配置]
				 * @return {[void]}
				 */
				init: function ( option ) {
					var defaults = {
						changeBefor: function ( $element ) {

						},
						changeAfter: function ( $element ) {

						}
					};

					var
						$element = $( this ),
						$input = $element.children( 'input' ),
						flag = $input.is( ':checked' ) ? true : false;
					if ( !$element.hasClass( 'switchState' ) ) {
						stateInit( $element, flag );
					}
					var options = $.extend( true, defaults, option || {} );

					$element.unbind( 'click' );
					$element.on( 'click', function ( event ) {
						event.stopPropagation();
						options.changeBefor( $input );

						if ( $input.prop( "disabled" ) ) return;

						var flag = $input.is( ":checked" );

						$input.prop( 'checked', !flag );
						stateInit( $(this), !flag );
						options.changeAfter( $input );
					} );
				},
				/**
				 * 是否禁用
				 * @method setEnable
				 */
				setEnable: function () {
					$( this )
						.children( 'input' )
						.prop( 'disabled', arguments[ 1 ] );
				},
				/**
				 * 开关状态
				 * @method setState
				 */
				setState: function () {
					stateInit( $( this ), arguments[ 1 ] );
					$( this )
						.children( 'input' )
						.prop( 'checked', arguments[ 1 ] );
				}
			}

			var method = arguments[ 0 ];
			if ( Config[ method ] ) {
				method = Config[ method ];
			} else if ( typeof ( method ) == 'object' || !method ) {
				method = Config.init;
			} else {
				$.error( "Something bad happened" );
				return this;
			}
			return method.apply( this, arguments );
		}
	} )
} )( jQuery );
/*global  window , an_IE,document,console */
/**
 * 表单模块  表单js交互，验证，响应样式，tooltip
 * author:chenxiaoying
 *
 * validateInKeyup 鼠标弹起的时候验证，默认是失去焦点验证
 *
 * 结构 <input type="text" class="u-input err" value="错误样式“err”">
 * <input type="text" class="u-input cor" value="正确样式“cor”">
 * <input type="text" class="u-input xs" value="MINI尺寸“xs”">
 * <input type="text" class="u-input" disabled value="禁用样式"><!--在IE8以下，禁用样式会有丢失-->
 * verify="required,phone"
 * 验证顺序和先后顺序有关，先验证required，再验证phone
 **/

(function (andy,$) {
    var customIndex = 1;
    // 日期校验 日期控件的话就不需要
    // isCorrectDate("2015-2-31") false isCorrectDate("2015-2-21") true
    var isCorrectDate = function (value) {
        if (value === "") {
            return;
        }
        if (typeof value === "string") { //是字符串但不能是空字符
            var arr = value.split("-"); //可以被-切成3份，并且第1个是4个字符
            if (arr.length === 3 && arr[0].length === 4) {
                var year = ~~arr[0];//全部转换为非负整数
                var month = ~~arr[1] - 1;
                var date = ~~arr[2];
                var d = new Date(year, month, date);
                return d.getFullYear() === year && d.getMonth() === month && d.getDate() === date;
            }
        }
        return false;
    };
    //过滤非法字符
    var quote = function (str) {
        var items = new Array("~", "`", "!", "@", "#", "$", "%", "^", "&", "*", "{", "}", "[", "]", "(", ")");
        items.push(":", ";", "'", "|", "\\", "<", ">", "?", "/", "<<", ">>", "||", "//");
        items.push("admin", "administrators", "administrator", "管理员", "系统管理员");
        items.push("select", "delete", "update", "insert", "create", "drop", "alter", "trancate");
        str = str.toLowerCase();
        for (var i = 0; i < items.length; i++) {
            if (str.indexOf(items[i]) > -1) {
                return false;
            }
        }
        return true;
    };
    //身份证
    var checkIdCard = function (num) {
        num = num.toUpperCase();
        var cityCode = {
            11: "北京",
            12: "天津",
            13: "河北",
            14: "山西",
            15: "内蒙古",
            21: "辽宁",
            22: "吉林",
            23: "黑龙江",
            31: "上海",
            32: "江苏",
            33: "浙江",
            34: "安徽",
            35: "福建",
            36: "江西",
            37: "山东",
            41: "河南",
            42: "湖北",
            43: "湖南",
            44: "广东",
            45: "广西",
            46: "海南",
            50: "重庆",
            51: "四川",
            52: "贵州",
            53: "云南",
            54: "西藏",
            61: "陕西",
            62: "甘肃",
            63: "青海",
            64: "宁夏",
            65: "新疆",
            71: "台湾",
            81: "香港",
            82: "澳门",
            91: "国外 "
        };
        if (!cityCode[num.substr(0, 2)]) {
            //alert("地址编码错误");
            return false;
        }
        //身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X。
        if (!( /(^\d{15}$)|(^\d{17}([0-9]|X)$)/.test(num) )) {
            //alert('输入的身份证号长度不对，或者号码不符合规定！\n15位号码应全为数字，18位号码末位可以为数字或X。');
            return false;
        }

        //校验位按照ISO 7064:1983.MOD 11-2的规定生成，X可以认为是数字10。
        //下面分别分析出生日期和校验位
        var len, re;
        len = num.length;
        if (len == 15) {
            re = new RegExp(/^(\d{6})(\d{2})(\d{2})(\d{2})(\d{3})$/);
            var arrSplit = num.match(re);
            //检查生日日期是否正确
            var dtmBirth = new Date('19' + arrSplit[2] + '/' + arrSplit[3] + '/' + arrSplit[4]);
            var bGoodDay;
            bGoodDay = ( dtmBirth.getYear() == Number(arrSplit[2]) ) && ( ( dtmBirth.getMonth() + 1 ) == Number(arrSplit[3]) ) && ( dtmBirth.getDate() == Number(arrSplit[4]) );
            if (!bGoodDay) {
                //alert('输入的身份证号里出生日期不对！');
                return false;
            } else {
                //将15位身份证转成18位
                //校验位按照ISO 7064:1983.MOD 11-2的规定生成，X可以认为是数字10。
                var arrInt = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2);
                var arrCh = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2');
                var nTemp = 0,
                    k;
                num = num.substr(0, 6) + '19' + num.substr(6, num.length - 6);
                for (k = 0; k < 17; k++) {
                    nTemp += num.substr(k, 1) * arrInt[k];
                }
                num += arrCh[nTemp % 11];
                return true;
            }
        }
        if (len == 18) {
            re = new RegExp(/^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/);
            var arrSplit = num.match(re);
            //检查生日日期是否正确
            var dtmBirth = new Date(arrSplit[2] + "/" + arrSplit[3] + "/" + arrSplit[4]);
            var bGoodDay;
            bGoodDay = ( dtmBirth.getFullYear() == Number(arrSplit[2]) ) && ( ( dtmBirth.getMonth() + 1 ) == Number(arrSplit[3]) ) && ( dtmBirth.getDate() == Number(arrSplit[4]) );
            if (!bGoodDay) {
                //alert(dtmBirth.getYear());
                //alert(arrSplit[2]);
                //alert('输入的身份证号里出生日期不对！');
                return false;
            } else {
                //检验18位身份证的校验码是否正确。
                //校验位按照ISO 7064:1983.MOD 11-2的规定生成，X可以认为是数字10。
                var valnum;
                var arrInt = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2);
                var arrCh = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2');
                var nTemp = 0,
                    k;
                for (k = 0; k < 17; k++) {
                    nTemp += num.substr(k, 1) * arrInt[k];
                }
                valnum = arrCh[nTemp % 11];
                if (valnum != num.substr(17, 1)) {
                    //alert('18位身份证的校验码不正确！应该为：' + valnum);
                    return false;
                }
                return true;
            }
        }
        return false;
    };
    //验证规则
    var VERIFY = {
        trim: {
            check: function (e) {//格式化
                //if (data.element.type !== "password") {
                //    value = String(value || "").trim()
                //}
                e.value = e.value.replace(/(^\s*)|(\s*$)/g, "");
                return true;
            }
        },
        required: {
            message: '不能为空',
            placeholder: "请输入文字...",
            check: function (e) {
                return e.value !== "" && e.value !== VERIFY.required.placeholder;
            }
        },
        "int": {
            message: "不是整数，请输入整数",
            placeholder: "请输入整数",
            check: function (e) {
                return /^\-?\d+$/.test(e.value);
            }
        },
        mobile: {
            message: "手机号码不合法",
            placeholder: "请输入手机号",
            check: function (e) {
                return /^(13[0-9]|14[57]|15[012356789]|17[0678]|18[0-9])\d{8}$/.test(e.value);
            }
        },
        phone: {
            message: "座机号码不合法",
            placeholder: "请输入座机号",
            check: function (e) {
                var phoneRegWithArea = /^[0][1-9]{2,3}-[0-9]{5,10}$/;
                var phoneRegNoArea = /^[1-9]{1}[0-9]{5,8}$/;
                if (e.value.length > 9) {
                    return phoneRegWithArea.test(e.value);
                }
                return phoneRegNoArea.test(e.value);
            }
        },
        mobile_phone: {
            message: "输入号码不合法",
            placeholder: "请输入手机或者座机号",
            check: function (e) {
                return VERIFY.phone.check(e) || VERIFY.mobile.check(e);
            }
        },
        decimal: {
            message: '不是小数，请输入小数',
            placeholder: '请输入小数',
            check: function (e) {
                return /^\-?\d*\.?\d+$/.test(e.value)
            }
        },
        alpha: {
            message: '包含字母以外的非法字符',
            placeholder: '请输入字母',
            check: function (e) {
                return /^[a-z]+$/i.test(e.value);
            }
        },
        alpha_numeric: {
            message: '包含字母或数字以外的非法字符',
            placeholder: '请输入字母或数字',
            check: function (e) {
                return /^[a-z0-9]+$/i.test(e.value)
            }
        },
        alpha_dash: {
            message: '包含字母或数字及下划线以外的非法字符',
            placeholder: '请输入字母或数字及下划线等字符',
            check: function (e) {
                return /^[a-z0-9_\-]+$/i.test(e.value);
            }
        },
        chs: {
            message: '请输入中文字符',
            placeholder: '请输入中文字符',
            check: function (e) {
                return /^[\u4e00-\u9fa5]+$/.test(e.value);
            }
        },
        chs_numeric: {
            message: '请输入中文字符或数字及下划线等特殊字符',
            placeholder: '请输入中文字符或数字及下划线等特殊字符',
            check: function (e) {
                return /^[\\u4E00-\\u9FFF0-9_\-]+$/i.test(e.value);
            }
        },
        qq: {
            message: "腾讯QQ号从10000开始",
            placeholder: "请输入QQ号",
            check: function (e) {
                return /^[1-9]\d{4,10}$/.test(e.value);
            }
        },
        postoffice: {
            message: "邮编格式错误",
            placeholder: "请输入邮编",
            check: function (e) {
                return /^[1-9][0-9]{5}$/.test(e.value);
            }
        },
        idcard: {
            message: "身份证格式错误",
            placeholder: "请输入身份证号",
            check: function (e) {
                return checkIdCard(e.value);
            }
        },
        ipv4: {
            message: "ip地址不正确",
            placeholder: "请输入ip地址",
            check: function (e) {
                //"(([0-9]{1,3}.){3}[0-9]{1,3}" // IP形式的URL- 199.194.52.184
                var ripv4 = /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/i;
                return ripv4.test(e.value);
            }
        },
        email: {
            message: "邮箱地址错误",
            placeholder: "请输入邮箱",
            check: function (e) {
                return /^([A-Z0-9]+[_|\_|\.]?)*[A-Z0-9]+@([A-Z0-9]+[_|\_|\.]?)*[A-Z0-9]+\.[A-Z]{2,3}$/i.test(e.value);
            }
        },
        url: {
            message: "URL格式错误",
            placeholder: "请输入链接",
            check: function (e) {
                return /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/.test(e.value);
            }
        },
        //特殊字符
        quote: {
            message: "包含非法字符",
            placeholder: "请输入...",
            check: function (e) {
                return quote(e.value);
            }
        },
        repeat: {
            message: "密码输入不一致",
            check: function (e) {
                var otherId = e.getAttribute("repeat");
                if (otherId) {
                    var otherEl = e.ownerDocument.getElementById(otherId);
                }
                if (!otherEl) {
                    return false;
                }
                return e.value === otherEl.value;
            }
        },
        "norepeat": {
            message: "输入重复",
            check: function (e) {
                var result = true, i, otherEl, norepeatName = e.getAttribute("norepeat");
                if (norepeatName && VERIFY.required.check(e)) {
                    //这里用了jquery选择器
                    var otherEls = $('[norepeat="' + norepeatName + '"]');
                    if (otherEls.length > 0) {
                        for (i = 0; i < otherEls.length; i++) {
                            otherEl = otherEls[i];
                            if (e !== otherEl && VERIFY.required.check(otherEl) && e.value === otherEl.value) {
                                result = false;
                                break;
                            }
                        }
                    }
                }
                return result;
            }
        },
        date: {
            message: '必须符合日期格式 YYYY-MM-DD',
            placeholder: "请输入日期 例如：2016-3-2",
            check: function (e) {
                return isCorrectDate(e.value);
            }
        },
        passport: {
            message: '护照格式错误或过长',
            placeholder: "请输入护照号",
            check: function (e) {
                return /^[a-zA-Z0-9]{4,20}$/i.test(e.value);
            }
        },
        minlength: {
            message: '最少输入{{minlength}}个字',
            placeholder: "请输入{{minlength}}个以上字符",
            check: function (e) {
                var elem = e;
                var num = parseInt(elem.getAttribute("minlength"), 10);
                return elem.value.length >= num;
            }
        },
        maxlength: {
            message: '最多输入{{maxlength}}个字',
            placeholder: "请输入{{maxlength}}个以下字符",
            check: function (e) {
                var elem = e;
                var num = parseInt(elem.getAttribute("maxlength"), 10);
                return elem.value.length <= num;
            }
        },
        greaterthan: {
            message: '请输入大于{{greaterthan}}的数字',
            placeholder: '请输入大于{{greaterthan}}的数字',
            check: function (e) {
                var elem = e;
                var num = parseInt(elem.getAttribute("greaterthan"), 10);
                var v = parseFloat(elem.value);
                return isNaN(v) ?false : v > num ;
            }
        },
        lessthan: {
            message: '请输入小于{{lessthan}}的数字',
            placeholder: '请输入小于{{lessthan}}的数字',
            check: function (e) {
                var elem = e;
                var num = parseInt(elem.getAttribute("lessthan"), 10);
                var v = parseFloat(elem.value);
                return isNaN(v) ? false: v < num ;
            }
        },
        contains: {
            message: "必须包含{{contains}}中的一个",
            placeholder: "必须包含{{contains}}中的一个",
            check: function (e) {
                var val = e.value;
                var vmValue = [].concat(val).map(String);
                var domValue = (e.getAttribute("contains") || "").split(",");
                var has = false;
                for (var i = 0, n = vmValue.length; i < n; i++) {
                    var v = vmValue[i]
                    if (domValue.indexOf(v) >= 0) {
                        has = true;
                        break;
                    }
                }
                return has;
            }
        },
        contain: {//还有问题
            message: "必须包含{{contain}}",
            placeholder: '请输入包含{{contain}}这样格式的字符',
            check: function (e) {
                var val = e.value;
                var vmValue = [].concat(val).map(String);
                var domValue = (e.getAttribute("contain") || "").split(",")
                if (!vmValue.length) {
                    var has = false
                } else {
                    has = true
                    for (var i = 0, n = domValue.length; i < n; i++) {
                        var v = domValue[i]
                        if (vmValue.indexOf(v) === -1) {
                            has = false
                            break
                        }
                    }
                }
                return has;
            }
        },
        pattern: {
            message: '必须匹配/{{pattern}}/这样的格式',
            placeholder: '请输入匹配/{{pattern}}/这样格式的字符',
            check: function (e) {
                var elem = e;
                var pattern = elem.getAttribute("pattern");
                var re = new RegExp('^(?:' + pattern + ')$');
                return re.test(elem.value);
            }
        }
    };

    //在IE8下的input默认提示值
    var placeholder4IE = function (element) {
        var $el = $(element), holder;
        var defval = $el.attr('placeholder');
        if(!defval || $el.attr("combo")){
            return;
        }
        $el.parent().append("<div class='ie-placeholder place'>" + defval + "</div>");
        holder = $el.parent().find(".ie-placeholder");
        if ($el[0].value == '') {
            holder.show();
        }else{
            holder.hide();
        }
        holder.click(function (event) {//获得焦点时
            $(this).hide();
            var inpt = $(this).parent().find("[placeholder]");
                inpt[0].click();
                inpt[0].focus();
        });
        $el.blur(function () {//失去焦点时
            setTimeout(function(){                         
                if($el.val() =='') {                                  
                    $el.parent().find(".ie-placeholder").show();                         
                }               
            },300)
        });
        $el.focus(function () {//获得焦点时
            $(this).parent().find(".ie-placeholder").hide();
        });

    };
    /**
     * 验证正确
     * @param el
     */

    var verifyIconDivCor = "<div class = 'u-input-cor'></div>";
    var verifyIconDivErr = "<div class = 'u-input-err'></div>";
    var setCorrect = function (el) {
        // $(el).addClass("cor");
        $(el).before(verifyIconDivCor)
    };
    var setError = function (el) {
        // $(el).addClass("err");
        $(el).before(verifyIconDivErr)
        setTimeout(function(){
            // $(el).before(verifyIconDivErr)
            // $(el).addClass("err1");
        //不支持颜色过度
        //$(el).animate({"border-color":'#D7D7D7', color:'#333', "background-color":'#fff'},3000);
        },3000)
    };
    //重置
    var reSet = function (el) {
        if($(el).prev().is("div")){
            $(el).prev().remove()
        }
        
        // $(el).removeClass("err cor err1");
    };
    /**
     * /验证函数
     * @param el 输入框
     * @param toolTip 提示组件对象
     * @returns {boolean} 是否通过验证
     */
    var check = function (el) {
        var toolTip, iden = true, cIden, i, tipStr = "", rules = el.getAttribute("verify");
        if (!rules) {
            return true;
        }
        if ($(el).is(":disabled")) {
            return true;
        }
        if (el.value === "" && rules && rules.indexOf("required") < 0) {
            return true;
        }
        rules = rules.split(",");
        for (i = 0; i < rules.length; i++) {
            cIden = VERIFY[rules[i]].check(el);
            if (cIden === false) {
                if (el.getAttribute("message")) {
                    tipStr = el.getAttribute("message");
                } else {
                    tipStr = VERIFY[rules[i]].message;
                    if (tipStr.indexOf(rules[i]) > -1) {
                        tipStr = tipStr.replace("{{" + rules[i] + "}}", el.getAttribute(rules[i]));
                    }
                }
                toolTip = $(el).next('.infobox');

                andy.changeTooltip(el, tipStr);
                andy.showTooltip(el,true);
                setError(el);
                return cIden;
            }
            iden = iden && cIden;
        }
        if (iden) {
            reSet(el);
            andy.hideTooltip(el);
            setCorrect(el);
        } else {
            setError(el);
        }
        return iden;
    };
    var bindVerify = function (element, checkFun) {
        if (element.getAttribute("tipPos")) {
            andy.tooltip($(element), element.getAttribute("tipPos"), $(element).attr('title'), 'terr');
        } else {
            andy.tooltip($(element), 'bottom', $(element).attr('title'), 'terr');
        }
        var eFun = function (event) {
            return checkFun ? checkFun(event.target) : check(event.target);
        };
        //输入中判断，ps有些判断支持，有些不支持
        if (element.getAttribute("validateOnKeyup")) {
            $(element).keyup(eFun);
        } else if (element.getAttribute("validateOnblur")) {
            $(element).blur(eFun);
        }else {
            $(element).change(eFun);
        };
        $(element).unbind("focus");
        $(element).bind("focus", function (event) {
            reSet($(this));
            if(element.getAttribute("validateOnFocus")){
                eFun(event)
            }else{
                andy.hideTooltip(this);
            };
        });
    };
    var fromInit = function (target) {
        var cell = target?target.find("[verify]"):$("[verify]");
            cell.each(function (index, element) {
                    if (element.getAttribute("verify") === "") {
                        return;
                    }
                    if (element.parentNode.className.indexOf(".m-tooltip") < 0) {

                        var rules = element.getAttribute("verify").split(",");
                        bindVerify(element);
                        //如果是必填，在标题标注一个红色的*
                        if ((rules + "").indexOf("required") > -1) {
                            $(element).parents(".u-formitem").find("label").append("<span class='f-color-danger'>*</span>");
                        }
                        //element.parentNode.style.width = element.parentNode.parentNode.offsetWidth + "px";
                        // 这里计算了 验证表单父级宽度
                        if($(element).parent().parent().hasClass("u-group")){
                            andy.inputLayout($(element).parent());
                        }
                        
                        //andy.inputLayout($(element));

                        if (!element.getAttribute("placeholder")) {
                            var placeholder = VERIFY[rules[rules.length - 1]].placeholder;
                            if (placeholder) {
                                if (placeholder.indexOf("{{") > -1) {
                                    placeholder = placeholder.replace("{{" + rules[rules.length - 1] + "}}", element.getAttribute(rules[rules.length - 1]));
                                };
                                if(!element.getAttribute("combo")){
                                    element.setAttribute("placeholder", placeholder);
                                }
                            }
                        }
                    }
                //判断ie
                if (andy.IE() <= 9 && andy.IE() !== 0) {
                    placeholder4IE(element);
                }
                }
            );

        }
        ;
//TODO 绑定自定义验证函数
//TODO 绑定后台ajax验证
//渲染，对IE8下的输入提示


    andy.fromInit = fromInit;
    /**
     * 绑定自定义验证函数
     * @param el input元素
     * @param options {massage:str check:function}
     */
    andy.addVerify = function (el, options) {
        var arg, checkName, def = {
            massage: "输入不合法",
            check: function () {
                return true;
            }
        };
        arg = $.extend(def, options);
        checkName = "custom" + customIndex;
        VERIFY[checkName] = arg;
        el.setAttribute("verify", el.getAttribute("verify") ? el.getAttribute("verify") + "," + checkName : checkName);
        bindVerify(el, arg.check);
        customIndex++;
    };
    /**
     * 绑定ajax验证
     * @param el input元素
     * @param options 增加一个message
     *
     * data如果需要自己组织，则 return 一个函数
     * 这里约定后台返回 success成功与否 msg错误消息
     *
     * 要处理异步的问题 还有和一般验证结果相与
     * 是否最后提交的时候也要执行
     */
    andy.ajaxVerify = function (el, options) {
        var arg, toolTip, defaults = {
            async: false,
            type: 'get',
            url: '',
            data: {},
            dataType: 'json',
            beforeSend: function () {
            },
            complete: function () {
            },
            //网络请求成功
            success: function () {
            },
            //网络错误
            error: function () {
            }
        };
        if (options) {
            arg = $.extend(defaults, options);
            arg.success = function (argu) {
                if (argu.success) {
                    setCorrect(el);
                } else {

                    if (argu.tipStr) {
                        andy.changeTooltip(el, argu.tipStr);
                        andy.showTooltip(el,true);

                        //andy.tooltip.setContent(toolTip, tipStr);
                        //andy.tooltip.showinfo(toolTip);
                    }
                    setError(el);
                }
                if (options.success) {
                    options.success(argu);
                }
            };
            arg.error = function (argu) {
                alert("error" + argu.toString());
            };
            bindVerify(el, function (e) {
                arg.data = options.data ? options.data() : e.value;
                $.ajax(arg);
            });
        }
    };
    andy.fromVerify = function (from) {
        var right = true;
        $(from).find("[verify]").each(function (index, element) {
            right = check(element) && right;
        });
        return right;
    };
    andy.inputCheck = check;

    andy.placeholder4IE = placeholder4IE;
    $(document).ready(function () {
        setTimeout(function(){
            fromInit();
        }, 500)
        
    });

})
(andy,jQuery);/*accordion */
/**
 * 手风琴模块
 * author:林耘宇
 **/
(function ($) {
    $.fn.extend({
        an_accordion:function(options){
            var _options = $.extend({
                index:1,//默认打开第一个 设置0为全关闭
                isAnimation:true,
                animationTime:200,//动画时间
                multiple:false,//允许同时打开多个或者关闭多个
                isAllOpen:false,//是否全打开，必须multiple为true时才生效

                fit:false,//默认自适应
                height:0,
                width:0,
                onClick:function(){}
            }, options);

            var _stringclass = {
                head:"panel-head",
                body:"panel-body",
                title:"panel-head-title",
                hidden:"f-hidden",
                active:"active"
            };

            var accordion = $(this);
            var head = accordion.children().children("."+_stringclass.head);
            var body = accordion.children().children("."+_stringclass.body);

            var getOption = accordion.attr("options");
            if(getOption){
                 getOption = "{"+ getOption+"}";
                 getOption = andy.stringToJson(getOption);
                // 处理设置
                for(var name in getOption){
                    if(getOption[name] == "true"){
                        _options[name] = true;
                    }else if(getOption[name] == "false"){
                        _options[name] = false;
                    }else{
                        _options[name] = getOption[name];
                    }
                }
            }
            var tabstyle = "";
            var contentstyle = "";

            // if(!_options.fit){
            //     tabstyle = "height:"+_options.height+"px;_height:"+_options.height+"px;width:"+_options.width+"px;";
            //     contentstyle = "height:"+(_options.height - 66)+"px;_height:"+(_options.height - 66)+"px;width:"+(_options.width - 30)+"px;overflow:auto";
            // }

            if(_options.fit){
                var parentHeight = accordion.parent().height();
                tabstyle = "height:"+parentHeight+"px";
                var headHeight = 0;
                accordion.css("overflow","hidden")
                head.each(function(index, head){
                    headHeight+= $(head).outerHeight();
                })
                contentstyle = "height:"+(parentHeight - headHeight)+"px";
                accordion.innerHeight(parentHeight)
                body.each(function(index, bd){
                    $(bd).outerHeight(parentHeight - headHeight)
                    $(bd).css("overflow-y","auto")
                })
            }
            // accordion.attr("style", tabstyle);
            // body.each(function(index, bd){
            //     $(bd).attr("style", contentstyle)
            // })

            var show = function(index){
                var page = _options.index;
                if(index){
                    page = index;
                }

                body.each(function(i, e){
                    var t = $(e);
                    if(page > 0 &&  page == (i + 1)){
                        if(_options.isAnimation){
                            if(_options.multiple){
                                t.slideToggle(_options.animationTime, function(){
                                    andy.layout(t)
                                });

                            }else{
                                t.slideDown(_options.animationTime, function(){
                                    andy.layout(t)
                                });
                            }
                        }else{
                            if(_options.multiple){
                                t.toggleClass(_stringclass.hidden);
                                andy.layout(t)
                            }else{
                                t.removeClass(_stringclass.hidden);
                            }
                        }
                    }else{
                        if(!_options.multiple){
                            if(_options.isAnimation){
                                t.slideUp(_options.animationTime);
                            }else{
                                t.addClass(_stringclass.hidden);
                            }
                        }
                    }
                })
            }

            var choose = function(index){
                body.each(function(i, e){
                    var t = $(e);
                    if(t.css("display") == "block" && _options.multiple){

                    }
                })
                show(index);
            }

            var build = function(){
                if(_options.multiple && !_options.isAllOpen){
                    body.each(function(i, e){
                        var t = $(e);
                        if(_options.index > 0 && _options.index == (i+1)){
                            if(_options.isAnimation){
                                t.slideDown(_options.animationTime, function(){
                                    andy.layout(t)
                                });
                            }
                        }else{
                            if(_options.isAnimation){
                                t.slideUp(_options.animationTime);
                            }else{
                                t.addClass(_stringclass.hidden);
                            }
                        }
                    });
                }else if(_options.multiple && _options.isAllOpen){
                    body.each(function(i, e){
                        var t = $(e);
                        if(_options.isAnimation){
                            t.slideDown(_options.animationTime, function(){
                                andy.layout(t)
                            });
                        }
                    });
                }else{
                    show();
                }
            };

            var start = function(){
                if(body){
                    build();
                };

                //绑定事件
                head.each(function(i, e){
                    $(e).click(function(e){
                        show(i+1);
                        // activate
                        head.each(function(index, head){
                            $(head).removeClass(_stringclass.active);
                        });
                        $(this).addClass(_stringclass.active);
                        _options.onClick(e);
                    })

                    if(i == _options.index-1){
                        $(this).addClass(_stringclass.active);
                    }else if(_options.isAllOpen){
                        $(this).addClass(_stringclass.active);
                    }
                })
            };
            start();
        }
    })
})(jQuery);/*pagination */
/**
 * 分页模块
 * author:林耘宇
 **/
(function ($) {
    $.fn.extend({
        an_pagination:function(){
            var options = {};
            var funstyle = "";
            var arg = arguments[0];
            (typeof arg == "object")? options = arg:funstyle = arg;

            if(funstyle != ""){
                if(funstyle == "total"){

                    $(this).trigger("total", arguments[1].total);
                }
                if(funstyle == "select"){
                     $(this).trigger("select");
                }
            }else{
                //合并设置
                var _options = $.extend({
                    index:1,//默认打开页面索引
                    total:100,//总条数
                    selectListIndex:1,//选择列表索引默认为1
                    list:[10, 20, 30, 40, 50],//每页列表
                    onSelectPage:function(){}//选择每页显示行数
                }, options);

                var pn = $(this);
                var page_fist = pn.find("[page-fist]");//跳转到第一页
                var page_prev = pn.find("[page-prev]");//跳转到上一页
                var page_next = pn.find("[page-next]");//跳转到下一页
                var page_last = pn.find("[page-last]");//跳转到最后一页
                var page_index = pn.find("[page-index]");//当前页数
                var page_select = pn.find("[page-select]");
                var page_refresh = pn.find("[page-refresh]");//刷新当前页
                if(_options.pageSize > 0){
                    for(var i = 0; i < _options.list.length; i++){
                        if(_options.pageSize == _options.list[i]){
                            _options.selectListIndex = i+1;
                        }
                    }
                };
                var currentSelectNumber = _options.list[_options.selectListIndex - 1];

                _options.selectListIndex = parseInt(_options.selectListIndex);
                
                if(_options.selectListIndex > 1 || options.selectListIndex <= _options.list.length + 1){
                    currentSelectNumber = _options.list[_options.selectListIndex - 1];
                    page_select.val(currentSelectNumber)
                }
                if(page_select){
                    currentSelectNumber = page_select.val();
                }
                var index = parseInt(_options.index);
                //当前总页数
                var currentNumber = Math.ceil(parseInt(_options.total)/currentSelectNumber);

                var changeText = function(){
                    // pn.find("[page-counts]")page-record
                    var page_counts = pn.find("[page-counts]");
                    var page_recoud = pn.find("[page-record]");
                    var page_index = pn.find("[page-index]");
                    
                    if(page_counts){
                        page_counts.text(currentNumber)
                    }
                    if(page_index){
                        page_index.val(index);
                    }
                    if(page_recoud){
                        page_recoud.text("共"+_options.total+"条记录");
                    }
                    
                }


                // 输入页码
                if(page_index){
                    page_index.focus(function(e){
                        pn.unbind("select");
                    });
                    page_index.change(function(e){
                        index=$(e.target).val();
                        if(/^\-?\d+$/.test(index) && currentNumber!=0){
                            index=index<=0?1:index>currentNumber?currentNumber:index;
                            _options.onSelectPage(index, currentSelectNumber);
                        }
                    });
                    page_index.blur(function(e){
                         pn.bind("select",function(e){
                             _options.onSelectPage(index, currentSelectNumber);
                         });
                    });
                };
                
                //选择每页显示行数
                pn.find("[page-select]").change(function(e){
                    _options.onSelectPage(index, $(e.target).val());
                    currentSelectNumber = $(e.target).val();
                    currentNumber = Math.ceil(_options.total/currentSelectNumber);
                    if(index > currentNumber){
                        index = 1;
                    };
                    changeText();
                });
                pn.bind("select",function(e){
                    _options.onSelectPage(index, currentSelectNumber);
                });
                pn.bind("total", function(e, total){
                    _options.total = total;
                    currentNumber = Math.ceil(_options.total/currentSelectNumber);
                    if(index > currentNumber){
                        index = 1;
                    };
                    changeText();
                })

                if(page_fist){
                    page_fist.click(function(e){
                        if(index != 1){
                            index =1;
                            changeText();
                            _options.onSelectPage(index, currentSelectNumber);
                        }
                    })
                };

                if(page_prev){
                    page_prev.click(function(e){
                        if(index > 1){
                            index -=1;
                            changeText();
                            _options.onSelectPage(index, currentSelectNumber);
                        }
                    })
                };

                if(page_next){
                    page_next.click(function(e){
                        if(index < currentNumber){
                            index +=1;
                            changeText();
                            _options.onSelectPage(index, currentSelectNumber);
                        }
                    })
                };

                if(page_last){
                    page_last.click(function(e){
                        if(index != currentNumber){
                            index = currentNumber;
                            changeText();
                            _options.onSelectPage(index, currentSelectNumber);
                        }
                    })
                };

                if(page_refresh){
                    page_refresh.click(function(e){
                        _options.onSelectPage(index, currentSelectNumber);
                    })
                };

                if(page_index){
                    page_index.css("type", "number");
                    // page_index.attr("type", "number")
                    page_index.blur(function(e){
                        index = parseInt(page_index.val());
                        _options.onSelectPage(parseInt(page_index.val()), currentSelectNumber);
                        // console.log(page_index.val())
                    })
                };
                
                changeText();

                return _options;

            }

        }
    })
})(jQuery);/*datagrid_pagination */
/**
 * 分页数据列表组件
 * author:林耘宇
 **/

(function($){
	$.fn.extend({
		an_datagridPagination:function(){
			var options = {};
            var funstyle = "";
            var arg = arguments[0];
            (typeof arg == "object")? options = arg:funstyle = arg;

            var _options = $.extend({
            	dpId:"",
            	url:"",
                urlParams:{},
                ajaxType:"get",
                addColumns:'',
                coverColumns:'',
                onPaginationSelect:function(){},//分页事件
                onLoadComplete:function(){},
            	onClickRow:function(){},//单击行事件
                onDblClickRow:function(){},//双击行事件
                onClickCell:function(){},//点击单元
                onDblClickCell:function(){}//双击单元
            }, options);

            var dp = $(this);
            if(_options.dpId == ""){
                dp = andy.setRandomId(dp, "datagrid_pagination_");
                _options.dpId = dp.attr("id");
                dpId=_options.dpId;
            }
            var getOption = dp.attr("options");
            var getValueElement = "";
            if(getOption){
                 getOption = "{"+ getOption+"}";
                 getOption = andy.stringToJson(getOption);
                // 处理设置
                for(var name in getOption){
                    if(getOption[name] == "true"){
                        _options[name] = true;
                    }else if(getOption[name] == "false"){
                        _options[name] = false;
                    }else{
                        _options[name] = getOption[name];
                    }
                }
            }

            var loadListData,getChecked;
            loadListData = "EVENT_LOAD_LIST";
            getChecked = "EVENT_GET_TABLE_CHECKED";

            if(funstyle != ""){
            	if(funstyle == "loadListData"){
            		var url = arguments[1];
            		var isNewPagination = arguments[2];//默认刷新分页
                    var data = arguments[3];//参数设置
                    var ajaxType = arguments[4];//请求类型
            		if(isNewPagination != false){
            			isNewPagination = true;
            		}
            		var obj = {
            			url:url,
            			isNewPagination:isNewPagination,
                        data:data,
                        ajaxType:ajaxType
            		}
                    dp.trigger(loadListData, obj);
            	}else if(funstyle == "getChecked"){
                    var fun = arguments[1];
                    dp.trigger(getChecked, fun);
                }
            }else{
				var table = dp.find("table");
                var tableId = table.attr("id");
                table = $("#"+tableId);
				var pagination = dp.find(".m-pagebar");
				var paginationId = pagination.attr("id");
                var pageIndex = 1;
				var initPagination = function(){
					if(pagination[0]){
						var templateStr = "<div class='f-left'> 每页显示"+
			              "<select class='u-select xs auto' page-select = ''>"+
			                "<option>10</option>"+
			                "<option>20</option>"+
			                "<option>30</option>"+
			                "<option>40</option>"+
			                "<option>50</option>"+
			              "</select>"+
			              "<button class='u-btn xs texture' page-fist = ''><i class='iconfont'></i></button>"+
			              "<button class='u-btn xs texture' page-prev = ''><i class='iconfont'></i></button>"+
			              "第<input type='text' style='width:50px' value='1' class='u-input xs auto' page-index = ''>共<a page-counts>10</a>页"+
			              "<button class='u-btn xs texture' page-next = ''><i class='iconfont'></i></button>"+
			              "<button class='u-btn xs texture' page-last = ''><i class='iconfont'></i></button>"+
				            "</div><div class='f-right' page-record = ''>共2000记录</div>";

				        pagination.append(templateStr);
					}
				}

                var goTable = function(data){
                    // var tableOption = $.extend(true, _options, {
                    //     bodyUrl:data
                    // })
                    // 直接替换老数据
                    _options.bodyUrl = data;
                    var tableOption = _options;
                    // console.log(tableOption, data)
                    table.an_datagrid(tableOption)

                    if(data['total'] && pagination.hasClass("promty") == false){
                        var obj = {};
                        var pageObject = {};
                        obj = $.extend(true, data,tableOption, {
                            onSelectPage:function(index, pageCounts){
                                // console.log(_options.url+"?pageNumber="+index+"&pageSize="+pageCounts)
                                // loadTable(_options.url+"?pageNumber="+index+"&pageSize="+pageCounts)
                                // loadTable(_options.url)
                                // console.log("当前页:"+index+",显示条数:"+pageCounts);
                                loadTable(_options.url+"?pageNumber="+index+"&pageSize="+pageCounts, "have");
                                 // console.log("当前页:"+index+",显示条数:"+pageCounts);
                                 pageIndex = index;
                                if(_options.onPaginationSelect){
                                    _options.onPaginationSelect(index, parseInt(pageCounts))
                                }
                            }
                        })
                        pagination.empty();
                        initPagination()
                        if(obj.urlParams.pageNumber){
                            obj.index = obj.urlParams.pageNumber;
                        }
                        pagination.an_pagination(obj);
                        
                        pagination.addClass("promty");
                    }
                    
                }

				var loadTable = function(url, ishave){
                    table.find("tbody").empty();
                    var param = _options.urlParams;
                    if(ishave == "have"){
                        param = {};
                    }

                    var loadData = function(url, param, ajaxType, callback){
                        if(ajaxType == "get"){
                            andy.loaddata(url, param, function(data){
                                callback(data)
                            })
                        }else{
                            andy.postdata(url, param, function(data){
                                callback(data)
                            })
                        }
                    }
                    
                    if(typeof url == "object"){
                        goTable(url);
                        _options.onLoadComplete(url);
                    }else if(_options.ajaxType == "get"){
                        loadData(url, param,"get", function(data){
                            goTable(data);
                            _options.onLoadComplete(data);
                        })
                    }else if(_options.ajaxType == "post"){
                        loadData(url, param,"post", function(data){
                            goTable(data);
                            _options.onLoadComplete(data);
                        })
                    }
				}
                
                if(_options.url != ""){
                	loadTable(_options.url)
                }

                // 获取列表选中值
                dp.bind(getChecked, function(e, fun){
                    var tt = $("#"+tableId);
                    tt.an_datagrid("getChecked", function(value, data){
                        fun(value, data)
                    })
                })

                dp.bind(loadListData, function(e, obj){
                	// console.log("url")
                	if(obj.isNewPagination){
                		pagination.removeClass("promty");
                	}
                    if(obj.ajaxType){
                        _options.ajaxType = obj.ajaxType;
                    }
                    if(obj.data){
                        _options.urlParams = $.extend(true, {}, _options.urlParams, obj.data)
                    }
                	loadTable(obj.url)
                })
            }
		}
	})
})($);
/*selector */
/**
 * 选择器组件
 * author:林耘宇
 **/
    //必须引入z-tree

(function ($) {
    $.fn.extend({
        an_selector: function () {
            var options = {}, METHODS = {};
            var funstyle = "";
            for (var i = 0; i < arguments.length; i++) {
                var a = arguments[0];
                if (typeof a == "object") {
                    options = a;
                } else if (typeof a == "string") {
                    funstyle = a;
                }
            }

            if (funstyle != "") {
                if (METHODS[funstyle]) {
                    //有mothed则调用之
                    return METHODS[funstyle](this, arguments[1]);
                }
                throw 'The method of' + funstyle + 'is undefined';
                return false;
            } else {
                var _options = $.extend({
                    treeid: "",//ztree dom的id
                    selects: true,//是否多选 true为多选
                    treeData: options.url || "",//传入ztree结构json
                    nodes: [],//传入本地数据同步加载-ztree
                    rightNodes: [],//已选好的数据
                    searchUrl: "",//搜索从后台获取数据
                    getUrl: "",//保留原来的点击树节点以后获取
                    searchText: "输入工号/名字",
                    treeTitle: options.leftTitle || "部门结构",
                    setting: "",//默认ztree配置
                    tableList:false,
                    cal:function(){},
                    //clickTree: function (url, treeId, text)//自己组织点击的数据 传入一个闭包函数 function(id){return function(){}}
                    submit: function () {
                    }
                }, options);
                
                var sel = $(this);
                var center = sel.find("[center]");
                var right = sel.find("[right]");
                var choose = sel.find("[choose]");//全选按钮
                var cancel = sel.find("[cancel]");//全部取消按钮
                var submit = sel.find("[submit]");//提交按钮
                var inputText = sel.find("[inputText]");//搜索框
                var search = sel.find("[search]");//搜索按钮
                var treeTitle = sel.find("[treeTitle]");//左边标题
                var chooseData = [];
                var currentTreeNode = "";
				
				//判断是否以表格的方式显示
				if(!_options.tableList){
					center.wrap("<div class='f-p-sm' center></div>");
					center.remove();
					center = $("[center]");
				}
				
                //保留
                if (treeTitle.length === 0) {
                    var treeTitle = sel.find("[leftTitle]");//左边标题
                }

                //树设置
                var default_setting = {
                    data: {
                        simpleData: {
                            enable: true
                        }
                    }
                };

                var setting = {
                    callback: {
                        onClick: function (event, treeId, treeNode) {
                            currentTreeNode = treeNode;
                            onTreeClick(currentTreeNode);
                        }
                    }
                };
                if (_options.setting != "") {
                    setting = $.extend(true, setting, _options.setting, default_setting);
                }

                setting.callback.onClick = function (event, treeId, treeNode) {
                    currentTreeNode = treeNode;
                    onTreeClick(currentTreeNode);
                };

                var tree = "";
                // 判断是否加载ztree结构json
                if (_options.treeData == "") {
                    $.fn.zTree.init($("#" + _options.treeid), setting, _options.nodes);
                    tree = $("#" + _options.treeid);
                } else {
                    andy.loaddata(_options.treeData, function (data) {
                        data = andy.stringToJson(data);
                        $.fn.zTree.init($("#" + _options.treeid), setting, data);
                        tree = $("#" + _options.treeid);
                    })
                }

                //已选框是否有数据
                if (_options.rightNodes.length > 0) {
                    for (var i = 0; i < _options.rightNodes.length; i++) {
                        var data = _options.rightNodes[i];
                        addToRight(data);
                    }
                }


                // 左边标题
                if (treeTitle) {
                    treeTitle.text(_options.treeTitle);
                }


                // 进行全选操作
                if (choose) {
                    if (_options.selects == false) {
                        choose.addClass("f-hidden");
                    }
                    choose.click(function () {
                        if (center && center.attr("table-list") != "true") {
                            center.children().each(function (index, e) {
                                for (var i = 0; i < chooseData.length; i++) {
                                    if ($(e).attr("id") == chooseData[i].id) {
                                        clearSelf($(e));
                                        addToRight(chooseData[i]);
                                    }
                                }
                            })
                        }else{
                            $("#tableOption tbody").find("tr").each(function(index, tr){
                                var trid = $(tr).attr("id");
                                for(var i = 0; i < chooseData.length; i++){
                                    if ($("#"+trid).data("tr_data").id == chooseData[i].id) {
                                        addToRight(chooseData[i]);
                                    } 
                                }

                            })
                            $("#tableOption tbody").empty()
                        }
                    })
                }
                ;

                // 进行全部取消操作
                if (cancel) {
                    if (_options.selects == false) {
                        cancel.addClass("f-hidden");
                    }
                    cancel.click(function () {
                        if (right) {
                            right.children().each(function (index, e) {
                                clearSelf($(e));
                                changeCenterFrame(chooseData);
                            })
                        }
                    })
                }


                // 提交按钮
                if (submit) {
                    submit.click(function () {
                        _options.submit(getChooseJson());
                        _options.cal(getChooseJson());
                    })
                }


                //搜索按钮
                if (search) {
                    search.click(function () {
                        onTreeClick(currentTreeNode, true);
                    });
                }

                if (inputText) {
                    inputText.attr("placeholder", _options.searchText);
                    var ie = andy.getBrowser().browser.ie;
                    if (ie && ie < 8) {
                        inputText.val(_options.searchText);
                        inputText.blur(function (e) {
                            if ($(e.target).val() == "") {
                                inputText.val(_options.searchText);
                            }
                        });
                        inputText.focus(function (e) {
                            if ($(e.target).val() == _options.searchText) {
                                inputText.val("");
                            }

                        });
                    }

                }

                // 树点击事件 event, treeId, treeNode
                function onTreeClick(treeNode, isSearch) {
                    var params = {}, url = _options.getUrl;
                    //新的链接方式
                    if (!url) {
                        url = isSearch ? _options.searchUrl : treeNode.dataUrl;
                    }

                    var text = "";
                    if (url != "") {
                        if (inputText.val() != _options.searchText && isSearch) {
                            params.search = inputText.val();
                        }
                        params.id = treeNode.id;
                        if (_options.clickTree) {
                            params = _options.clickTree(treeNode);
                        }
                        if (url && url !== "") {
                            andy.loaddata(url, params, function (data) {
                                data = andy.stringToJson(data);
                                chooseData = data;
                                changeCenterFrame(data);
                            })
                        }

                    }
                };
                
                
                var addToCenterList = function(d){
                    $("#tableOption").an_datagrid("addRow", d, function(tdData,thisid, html){
                        $("#"+thisid).on("click", function(e){
                            if($(e.target).is("input")){
                                if($(e.target).prop("checked")){
                                    $("#"+thisid).addClass("current")
                                    addToRight(d);
                                    $("#"+thisid).remove()
                                }else{
                                    $("#"+thisid).removeClass("current")
                                }
                                // console.log(html, thisid, tdData)
                            }
                        })
                    })
                }

                function changeCenterFrame(data) {
                    if (center && center.attr("table-list") != "true") {
                        center.empty();
                        for (var i = 0; i < data.length; i++) {
                            var d = data[i];
                            if (!checkId(right, d.id)) {
                                addToCenter(d);
                            }
                        }
                    }else{
                        $("#tableOption").find("tbody").empty()
                        for (var i = 0; i < data.length; i++) {
                            var d = data[i];
                            if (!checkId(right, d.id)) {
                                addToCenterList(d);
                            }
                        }
                    }
                };
                METHODS.changeCenterFrame = changeCenterFrame;

                // 添加人员到中间
                function addToCenter(data) { 
                    if (center) {
                        if (checkDataId(chooseData, data.id) && !checkId(center, data.id)) {
                            center.append("<button class='u-btn sm' id = " + data.id + " data = " + data.data + " name = " + data.name + ">" + data.name + "</button>");
                            var button = $("#" + data.id);
                            button.click(function (e) {
                                clearSelf(button);
                                addToRight(data);
                            })
                        }
                    }
                };

                // 添加人员到右侧
                function addToRight(data) {
                    if (right) {
                        if (!checkId(right, data.id) && _options.selects) {
                            right.append("<button class='u-btn sm' id = " + data.id + " data = " + data.data + " name = " + data.name + ">" + data.name + "<i class='iconfont'></i></button>");
                            var button = $("#" + data.id);
                            button.click(function (e) {
                                clearSelf(button);
                                if(center.attr("table-list") != "true"){
                                    addToCenter(data);
                                }else{
                                    addToCenterList(data);
                                }
                                
                            })
                        } else if (_options.selects == false) {
                            // 单选人员
                            right.children('button').each(function (i, button) {
                                var btn = $(button);
                                clearSelf(btn);
                                var btnData = {
                                    id: btn.attr('id'),
                                    name: btn.attr('name'),
                                    data: btn.attr('data')
                                }
                                if(center.attr("table-list") != "true"){
                                    addToCenter(data);
                                }else{
                                    addToCenterList(data);
                                }
                            })
                            right.append("<button class='u-btn sm' id = " + data.id + " data = " + data.data + " name = " + data.name + ">" + data.name + "<i class='iconfont'></i></button>");
                            var button = $("#" + data.id);
                            button.click(function (e) {
                                clearSelf(button);
                                if(center.attr("table-list") != "true"){
                                    addToCenter(data);
                                }else{
                                    addToCenterList(data);
                                }
                            })
                        }
                    }
                };
                // 查询对象是否有相同id
                function checkId(element, id) {
                    var ishave = false;
                    element.children().each(function (index, e) {
                        if (id == $(e).attr("id")) {
                            ishave = true;
                        }
                    })
                    return ishave;
                };

                // 检查数组是否有相同id
                function checkDataId(data, id) {
                    var ishave = false;
                    for (var i = 0; i < data.length; i++) {
                        var d = data[i];
                        if (id == d.id) {
                            ishave = true;
                        }
                    }
                    ;
                    return ishave;
                }

                //移除自己
                function clearSelf(element) {
                    element.unbind('click');
                    element.remove();
                };

                //获取被选框对象 生成数据后
                function getChooseJson() {
                    var str = "[";
                    right.children().each(function (index, e) {
                        var $this = $(e);
                        var s = "{'id':'" + $this.attr("id") + "','name':'" + $this.attr("name") + "','data':'" + $this.attr("data") + "', 'tId':'" + $this.attr("tId") + "'}";
                        if (str == "[") {
                            str += s;
                        } else {
                            str += "," + s;
                        }

                    })
                    str += "]";
                    var jstr = eval('(' + str + ')');
                    return jstr;
                };
            }

        },
        an_selectorMulti: function () {
            var options = {}, METHODS = {};
            var funstyle = "";
            for (var i = 0; i < arguments.length; i++) {
                var a = arguments[0];
                if (typeof a == "object") {
                    options = a;
                } else if (typeof a == "string") {
                    funstyle = a;
                }
            }


            if (funstyle != "") {
                if (METHODS[funstyle]) {
                    //有mothed则调用之
                    return METHODS[funstyle](this, arguments[1]);
                }
                throw 'The method of' + funstyle + 'is undefined';
                return false;
            } else {
                var _options = $.extend({
                    treeid: "",//ztree dom的id
                    selects: true,//是否多选 true为多选
                    treeData: options.url || "",//传入ztree结构json
                    nodes: [],//传入本地数据同步加载-ztree
                    rightNodes: [],//已选好的数据
                    tableList:true,
                    searchUrl: "",//搜索从后台获取数据
                    getUrl: "",//保留原来的点击树节点以后获取
                    searchText: "输入工号/名字",
                    treeTitle: options.leftTitle || "部门结构",
                    setting: "",//默认ztree配置
                    //clickTree: function (url, treeId, text)//自己组织点击的数据 传入一个闭包函数 function(id){return function(){}}
                    submit: function () {
                    }
                }, options);
               
                var sel = $(this);
                var head = sel.find("[selecthead]");
                var leftframe = sel.find("[leftframe]");
                
                var center = sel.find("[center]");
                var right = sel.find("[right]");
                var choose = sel.find("[choose]");//全选按钮
                var cancel = sel.find("[cancel]");//全部取消按钮
                var submit = sel.find("[submit]");//提交按钮
                var inputText = sel.find("[inputText]");//搜索框
                var search = sel.find("[search]");//搜索按钮
                
                var chooseData = [];
                var currentTreeNode = "";
				
				//判断是否以表格的方式显示
				if(!_options.tableList){
					center.wrap("<div class='f-p-sm' center></div>");
					center.remove();
					center = $("[center]");
				}

                // 操作leftframe显示
                var setShowFrame = function(index){
                    var leftframeOne = sel.find(".leftframe");
                    leftframeOne.each(function(frameindex, frame){
                        if(frameindex == index){
                            $(frame).show()
                        }else{
                            $(frame).hide()
                        }
                    })
                }

                // 生成分页页签
                if(typeof _options.treeTitle == "object"){
                    for(var i = 0; i < _options.treeTitle.length; i++){
                        head.append("<li index='1' selectbtn style='margin:5px 5px 0 0;'><a href='javascript:;'>"+_options.treeTitle[i]+"</a></li>")
                        leftframe.append("<div class = 'g-max leftframe' style = 'position:relative;'>"+
                                "<div class='panel-head f-b-b'>"+
                                    "<div class='panel-h-l'>"+
                                        "<strong class='title' treeTitle>"+_options.treeTitle[i]+"</strong>"+
                                    "</div></div>"+
                                "<div class='panel-body g-h-max'>"+
                                    "<ul id='"+_options.treeid[i]+"' class='ztree'></ul>"+
                                "</div></div>")
                    }
                    sel.an_tabs();
                    andy.layout(leftframe)
                    andy.layout(center.parent())
                    setShowFrame(0)
                }
                var treeTitle = sel.find("[treeTitle]");//左边标题
                var selectbtn = sel.find("[selectbtn]");
                

                //保留
                if (treeTitle.length === 0) {
                    var treeTitle = sel.find("[leftTitle]");//左边标题
                }

                //树设置
                var default_setting = {
                    data: {
                        simpleData: {
                            enable: true
                        }
                    }
                };

                var setting = {
                    callback: {
                        onClick: function (event, treeId, treeNode) {
                            currentTreeNode = treeNode;
                            onTreeClick(currentTreeNode);
                        }
                    }
                };
                if (_options.setting != "") {
                    setting = $.extend(true, setting, _options.setting, default_setting);
                }

                setting.callback.onClick = function (event, treeId, treeNode) {
                    currentTreeNode = treeNode;
                    onTreeClick(currentTreeNode);
                };

                var tree = "";
                // 判断是否加载ztree结构json
                // if (_options.treeData == "") {
                //     $.fn.zTree.init($("#" + _options.treeid[0]), setting, _options.nodes);
                //     tree = $("#" + _options.treeid[0]);
                // } else {
                // 	// console.log('_options.treeData[0]=>'+_options.treeData[0]);
                //     andy.loaddata(_options.treeData[0], function (data) {
                //         data = andy.stringToJson(data);
                //         console.log(_options.treeid[0]);
                //         $.fn.zTree.init($("#" + _options.treeid[0]), setting, data);
                //         tree = $("#" + _options.treeid[0]);
                //     })
                // }

                var createTree = function(index){
                    // 判断是否加载ztree结构json
                    if (_options.treeData == "") {
                        $.fn.zTree.init($("#" + _options.treeid[index]), setting, _options.nodes);
                        tree = $("#" + _options.treeid[index]);
                    } else {
                        // console.log('_options.treeData[index]=>'+_options.treeData[index]);
                        andy.loaddata(_options.treeData[index], function (data) {
                            data = andy.stringToJson(data);
                            $.fn.zTree.init($("#" + _options.treeid[index]), setting, data);
                            tree = $("#" + _options.treeid[index]);
                        })
                    }
                }
                createTree(0)

                //已选框是否有数据
                if (_options.rightNodes.length > 0) {
                    for (var i = 0; i < _options.rightNodes.length; i++) {
                        var data = _options.rightNodes[i];
                        addToRight(data);
                    }
                }

                // 结构分页
                sel.bind(andy.EVENT_CLICK, function(e, index){
                     // treeTitle.text(_options.treeTitle[index-1]);
                     setShowFrame(index-1)
                     createTree(index-1)
                })


                // 左边标题
                // if (treeTitle) {
                //     treeTitle.text(_options.treeTitle[0]);
                // }


				// 进行按钮选择操作
                // if (selectbtn) {
                // 	for(var i=0;i<selectbtn.length;i++){
                // 		$(selectbtn[i]).click(function () {
                // 			var treed = _options.treeData;
                // 			// console.log(treed);
                // 			// console.log(treed[1]);
                //    //          console.log(_options.treeData[0]);
	               //          if (_options.treeData[i] == "") {
			             //        $.fn.zTree.init($("#" + _options.treeid), setting, _options.nodes);
			             //        tree = $("#" + _options.treeid);
			             //    } else {
			             //    	console.log($(this).index());
			             //        andy.loaddata(_options.treeData[$(this).index()], function (data) {
			             //            data = andy.stringToJson(data);
			             //            console.log(_options.treeid);
			             //            $.fn.zTree.init($("#" + _options.treeid), setting, data);
			             //            tree = $("#" + _options.treeid);
			             //        })
			             //    }
                //     	})
                // 	}
                // };

                // 进行全选操作
                if (choose) {
                    if (_options.selects == false) {
                        choose.addClass("f-hidden");
                    }
                    choose.click(function () {
                        if (center && center.attr("table-list") != "true") {
                            center.children().each(function (index, e) {
                                for (var i = 0; i < chooseData.length; i++) {
                                    if ($(e).attr("id") == chooseData[i].id) {
                                        clearSelf($(e));
                                        addToRight(chooseData[i]);
                                    }
                                }
                            })
                        }else{
                            $("#tableOption tbody").find("tr").each(function(index, tr){
                                
                                var trid = $(tr).attr("id");
                                for(var i = 0; i < chooseData.length; i++){
                                    if ($("#"+trid).data("tr_data").id == chooseData[i].id) {
                                        addToRight(chooseData[i]);
                                    } 
                                }

                            })
                            $("#tableOption tbody").empty()
                        }
                    })
                }
                ;

                // 进行全部取消操作
                if (cancel) {
                    if (_options.selects == false) {
                        cancel.addClass("f-hidden");
                    }
                    cancel.click(function () {
                        if (right) {
                            right.children().each(function (index, e) {
                                clearSelf($(e));
                                changeCenterFrame(chooseData);
                            })
                        }
                    })
                }


                // 提交按钮
                if (submit) {
                    submit.click(function () {
                        _options.submit(getChooseJson());
                        _options.cal(getChooseJson());
                    })
                }


                //搜索按钮
                if (search) {
                    search.click(function () {
                        onTreeClick(currentTreeNode, true);
                    });
                }

                if (inputText) {
                    inputText.attr("placeholder", _options.searchText);
                    var ie = andy.getBrowser().browser.ie;
                    if (ie && ie < 8) {
                        inputText.val(_options.searchText);
                        inputText.blur(function (e) {
                            if ($(e.target).val() == "") {
                                inputText.val(_options.searchText);
                            }
                        });
                        inputText.focus(function (e) {
                            if ($(e.target).val() == _options.searchText) {
                                inputText.val("");
                            }

                        });
                    }

                }

                // 树点击事件 event, treeId, treeNode
                function onTreeClick(treeNode, isSearch) {
                    var params = {}, url = _options.getUrl;
                    //新的链接方式
                    if (!url) {
                        url = isSearch ? _options.searchUrl : treeNode.dataUrl;
                    }

                    var text = "";
                    if (url != "") {
                        if (inputText.val() != _options.searchText && isSearch) {
                            params.search = inputText.val();
                        }
                        params.id = treeNode.id;
                        if (_options.clickTree) {
                            params = _options.clickTree(treeNode);
                        }
                        if (url && url !== "") {
                            andy.loaddata(url, params, function (data) {
                                data = andy.stringToJson(data);
                                chooseData = data;
                                changeCenterFrame(data);
                            })
                        }

                    }
                };
				
                var addToCenterList = function(d){
                    $("#tableOption").an_datagrid("addRow", d, function(tdData,thisid, html){
                        $("#"+thisid).on("click", function(e){
                            if($(e.target).is("input")){
                                if($(e.target).prop("checked")){
                                    $("#"+thisid).addClass("current")
                                    addToRight(d);
                                    $("#"+thisid).remove()
                                }else{
                                    $("#"+thisid).removeClass("current")
                                }
                                // console.log(html, thisid, tdData)
                            }
                        })
                    })
                }

                function changeCenterFrame(data) {
                    //console.log(data);
                    if (center && center.attr("table-list") != "true") {
                        center.empty();
                        for (var i = 0; i < data.length; i++) {
                            var d = data[i];
                            if (!checkId(right, d.id)) {
                                addToCenter(d);
                            }
                        }
                    }else{
                        $("#tableOption").find("tbody").empty()
                        for (var i = 0; i < data.length; i++) {
                            var d = data[i];
                            if (!checkId(right, d.id)) {
                                addToCenterList(d);
                            }
                        }
                    }
                };
                METHODS.changeCenterFrame = changeCenterFrame;

                // 添加人员到中间
                function addToCenter(data) { 
                    if (center) {
                        if (checkDataId(chooseData, data.id) && !checkId(center, data.id)) {
                            center.append("<button class='u-btn sm' id = " + data.id + " data = " + data.data + " name = " + data.name + ">" + data.name + "</button>");
                            var button = $("#" + data.id);
                            button.click(function (e) {
                                clearSelf(button);
                                addToRight(data);
                            })
                        }
                    }
                };

                // 添加人员到右侧
                function addToRight(data) {
                    if (right) {
                        if (!checkId(right, data.id) && _options.selects) {
                            right.append("<button class='u-btn sm' id = " + data.id + " data = " + data.data + " name = " + data.name + ">" + data.name + "<i class='iconfont'></i></button>");
                            var button = $("#" + data.id);
                            button.click(function (e) {
                                clearSelf(button);
                                if(center.attr("table-list") != "true"){
                                    addToCenter(data);
                                }else{
                                    addToCenterList(data);
                                }
                                
                            })
                        } else if (_options.selects == false) {
                            // 单选人员
                            right.children('button').each(function (i, button) {
                                var btn = $(button);
                                clearSelf(btn);
                                var btnData = {
                                    id: btn.attr('id'),
                                    name: btn.attr('name'),
                                    data: btn.attr('data')
                                }
                                if(center.attr("table-list") != "true"){
                                    addToCenter(data);
                                }else{
                                    addToCenterList(data);
                                }
                            })
                            right.append("<button class='u-btn sm' id = " + data.id + " data = " + data.data + " name = " + data.name + ">" + data.name + "<i class='iconfont'></i></button>");
                            var button = $("#" + data.id);
                            button.click(function (e) {
                                clearSelf(button);
                                if(center.attr("table-list") != "true"){
                                    addToCenter(data);
                                }else{
                                    addToCenterList(data);
                                }
                            })
                        }
                    }
                };

                // 查询对象是否有相同id
                function checkId(element, id) {
                    var ishave = false;
                    element.children().each(function (index, e) {
                        if (id == $(e).attr("id")) {
                            ishave = true;
                        }
                    })
                    return ishave;
                };

                // 检查数组是否有相同id
                function checkDataId(data, id) {
                    var ishave = false;
                    for (var i = 0; i < data.length; i++) {
                        var d = data[i];
                        if (id == d.id) {
                            ishave = true;
                        }
                    }
                    ;
                    return ishave;
                }

                //移除自己
                function clearSelf(element) {
                    element.unbind('click');
                    element.remove();
                };

                //获取被选框对象 生成数据后
                function getChooseJson() {
                    var str = "[";
                    right.children().each(function (index, e) {
                        var $this = $(e);
                        var s = "{'id':'" + $this.attr("id") + "','name':'" + $this.attr("name") + "','data':'" + $this.attr("data") + "', 'tId':'" + $this.attr("tId") + "'}";
                        if (str == "[") {
                            str += s;
                        } else {
                            str += "," + s;
                        }

                    })
                    str += "]";
                    var jstr = eval('(' + str + ')');
                    return jstr;
                };
            }

        },
        //属性选择器 一般用在部门选择器
        an_selectorTree: function () {
            var options = {};
            var funstyle = "";
            for (var i = 0; i < arguments.length; i++) {
                var a = arguments[0];
                if (typeof a == "object") {
                    options = a;
                } else if (typeof a == "string") {
                    funstyle = a;
                }
            }
            ;
            if (funstyle != "") {
                //方法写入
                // if(funstyle == "total"){
                //     $(this).trigger("total", options.total);
                // }
            } else {
                //合并设置
                var _options = $.extend({
                    treeid: "",//ztree dom的id
                    selects: true,//是否多选 true为多选
                    treeData: options.url || "",//传入ztree结构json
                    nodes: [],//传入本地数据同步加载-ztree
                    rightNodes: [],//已选好的数据
                    treeTitle: options.leftTitle || "部门结构",
                    submit: function () {
                    }
                }, options);
				
                var sel = $(this);//sel是tree-selector.html页面的大容器div#selector2.g-layout.f-b
                var right = sel.find("[right]");//right是被选部门的容器div元素
                var cancel = sel.find("[cancel]");//全部取消按钮
                var submit = sel.find("[submit]");//确定按钮
                var treeTitle = sel.find("[treeTitle]");//左边标题
                var chooseData = [];
                var currentTreeNode = "";
                var treeObject = $.fn.zTree.getZTreeObj(_options.treeid);//必须初始化ztree才可以使用$.fn.zTree.getZTreeObj
                //保留
                if (treeTitle.length === 0) {
                    var treeTitle = sel.find("[leftTitle]");//左边标题
                }
				
                //树设置
                var setting = {
                    treeId: "1",
                    treeObj: null,
                    callback: {
                        onCheck: function (event, treeId, treeNode) {
                            onTreeCheck(treeNode);
                        }
                    },
                    check: {
                        enable: true,
                        chkStyle: "checkbox",
                        chkboxType: {"Y": "s", "N": "s"}
                    },
                    data: {
                        simpleData: {
                            enable: true
                        }
                    }
                };
				if (!_options.selects) {//传入的为布尔值 无需和string做判断 
                    setting.check = {
                        enable: true,
                        chkStyle: "radio"
                    }
                }

                var tree = "";
                // 判断是否加载ztree结构json
                if (_options.treeData == "") {
                    $.fn.zTree.init($("#" + _options.treeid), setting, _options.nodes);
                    tree = $("#" + _options.treeid);
                    initRight();
                } else {
                    andy.loaddata(_options.treeData, function (data) {
                        data = andy.stringToJson(data);
                        $.fn.zTree.init($("#" + _options.treeid), setting, data);
                        tree = $("#" + _options.treeid);//树容器ul
                        initRight();
                    })
                }

                //已选框是否有数据
                function initRight() {
                    if (_options.rightNodes.length > 0) {
                        for (var i = 0; i < _options.rightNodes.length; i++) {
                            var data = _options.rightNodes[i];//是一个对象包含该部门的id等
                            addToRight(data);
                            var t = $.fn.zTree.getZTreeObj(_options.treeid);
                            // var node = t.getNodeByTId(data.tId);
                            var node = t.getNodeByParam("id", data.id);//带有该部门更多的参数
                            t.checkNode(node, true, false);
                        }
                    }
                };

                // 左边标题
                if (treeTitle) {
                    treeTitle.text(_options.treeTitle);
                }


                // 进行全部取消操作
                if (cancel) {
                    if (_options.selects == false) {
                        cancel.addClass("f-hidden");
                    }
                    cancel.click(function () {
                        if (right) {
                            right.children().each(function (index, e) {
                                var t = $(e);
                                var tObject = $.fn.zTree.getZTreeObj(_options.treeid);
                                var id = t.attr("id");
                                var node = tObject.getNodeByParam("id", id);
                                removeToRight(node);
                            })
                        }
                    })
                }
                // 提交按钮
                if (submit) {
                    submit.click(function () {
                        _options.submit(getChooseJson());
                    })
                }


                //节点选取
                function onTreeCheck(treeNode) {
                    if (treeNode) {
                        if (treeNode.checked) {
                            // 选取
                            goCheck(treeNode, true);
                        } else {
                            // 取消
                            goCheck(treeNode, false);
                        }
                    }
                };

                function goCheck(treeNode, isCheck) {
                    if (treeNode && isCheck) {
                        if (treeNode.children && _options.selects) {
                            addToRight(treeNode);
                            for (var i = 0; i < treeNode.children.length; i++) {
                                goCheck(treeNode.children[i], isCheck);
                            }
                        } else {
                            addToRight(treeNode);
                        }
                    } else if (!isCheck) {
                        if (treeNode.children) {
                            removeToRight(treeNode);
                            for (var i = 0; i < treeNode.children.length; i++) {
                                goCheck(treeNode.children[i], isCheck);
                            }
                        } else {
                            removeToRight(treeNode);
                        }
                    }
                };

                // 添加人员到右侧
                function addToRight(data) {
                    if (right) {
                        if (!checkId(right, data.id) && _options.selects) {
                            right.append("<button class='u-btn sm' id = " + data.id + " data = " + data.data + " name = " + data.name + ">" + data.name + "<i class='iconfont'></i></button>");
                            var button = right.find("#" + data.id);
                            button.click(function (e) {
                                removeToRight(data);
                            })
                        } else if (_options.selects == false) {
                            var tObject = $.fn.zTree.getZTreeObj(_options.treeid);
                            // 获取结点
                            right.children('button').each(function (i, button) {
                                var id = $(button).attr("id");
                                var btnData = tObject.getNodeByParam("id", id);
                                removeToRight(btnData);
                            })
                            right.append("<button class='u-btn sm' id = " + data.id + " data = " + data.data + " name = " + data.name + ">" + data.name + "<i class='iconfont'></i></button>");
                            var button = right.find("#" + data.id);
                            button.click(function (e) {
                                removeToRight(data);
                            })
                        }
                    }
                };

                function removeToRight(data) {
                    var button = right.find("#" + data.id);
                    clearSelf(button);
                    var t = $.fn.zTree.getZTreeObj(_options.treeid);
                    if (!data.tId) {
                        data = t.getNodeByParam("id", data.id);
                    }

                    t.checkNode(data, false, false);
                }

                // 查询对象是否有相同id
                function checkId(element, id) {
                    var ishave = false;
                    element.children().each(function (index, e) {
                        if (id == $(e).attr("id")) {
                            ishave = true;
                        }
                    })
                    return ishave;
                }

                // 检查数组是否有相同id
                function checkDataId(data, id) {
                    var ishave = false;
                    for (var i = 0; i < data.length; i++) {
                        var d = data[i];
                        if (id == d.id) {
                            ishave = true;
                        }
                    }
                    ;
                    return ishave;
                }

                //移除自己
                function clearSelf(element) {
                    element.unbind('click');
                    element.remove();
                };

                //获取被选框对象 生成数据后
                function getChooseJson() {
                    var str = "[";
                    right.children().each(function (index, e) {
                        var $this = $(e);
                        var s = "{'id':'" + $this.attr("id") + "','name':'" + $this.attr("name") + "','data':'" + $this.attr("data") + "'}";
                        if (str == "[") {
                            str += s;
                        } else {
                            str += "," + s;
                        }

                    })
                    str += "]";
                    var jstr = eval('(' + str + ')');
                    return jstr;
                };
            }
            ;
        }
    })


    /**
     * 打开选择器对话框
     * @param title 标题 默认为 “人员选择”
     * @param treeTitle 树标题 “部门结构”
     * @param treeData  url 或者 json
     * @param getNodeTags func  点击一个节点以后通过这个函数获取节点数据
     * @param callback  回调 选择完成以后回调 以选择结果为参数
     */
    andy.openSelectorDialog = function (options) {
        var args, defaults = {
            title: "人员选择",
            treeTitle: "部门结构",
            treeData: "/project/tsi/data/department.json",
            callback: function (data) {

            },
            cal:function(){}
        };
        args = $.extend({}, defaults, options);
        $(document).an_dialog({
            id: "openSelector",
            width: options.width || 823,
            height: 455,
            title: args.title,
            url: options.url || ((options.pathroot||"") + "/andyui/admin/js/selector/selector.html"),
            data: args
        });

    };


    andy.initSelector = function(el){
        if (el.getAttribute("options")) {
            var data = andy.stringToJson(el.getAttribute("options"));
            data.callback = function (list) {
                data.rightNodes = list;
                //多选框初始化
                andy.multiSelect({
                    parent: $(el).find("[selectorListBox]")[0],
                    dataKey: data.dataKey,//input的name
                    onDelete: function (index) {
                        list.splice(index - 1, 1);
                    },
                    list: list
                });
            };
            if(data.rightNodes && data.rightNodes.length !== 0){
            	data.callback(data.rightNodes);
            }
            $(el).find("[openSelector]").click(
                function () {
                    if (el.className.indexOf("tree-selector") > 0) {
                        data.url = (data.pathroot||"") + "/andyui/admin/js/selector/tree-selector.html";
                        data.width = 420;
                    }else if (el.className.indexOf("multi-selector") > 0) {
                        data.url = (data.pathroot||"") + "/andyui/admin/js/selector/tabs-selector.html";
                        // console.log(data.url)
                    }
                    andy.openSelectorDialog(data);
                }
            );
        }
    };


    //options上要增加一个dataKey
    $(document).ready(function () {
        $(".selector").each(function (index, el) {
            andy.initSelector(el);
        });
    });

})(jQuery);/*combo */
/**
 * 组合框模块
 * author:林耘宇
 **/
 (function ($) {
    $.fn.extend({
        an_combo:function(){
            var options = {};
            var funstyle = "";
            var arg = arguments[0];
            (typeof arg == "object")? options = arg:funstyle = arg;


            var _options = $.extend({
                comboId:"",
                comboSize:"",//xs sm md lg
                touchTargetType:"input",
                inputVerify:"",
                showTargetType:"list",
                changeTarget:true,//切换触发对象内容
                inputName:"",
                showUrl:"",
                showData:[],//初始化数据
                checked:[],//已选id 初始化
                treeCheckBoxType:{},//树选择配置
                defaultValue:"下拉选择",//默认显示提示
                treeId:"",//下拉树ID
                treeSetting:{},//下拉树 树覆盖设置
                treeAsync:{},//下拉树异步设置
                selects:false,//是否多选
                isEnable:true,//是否可用
                isText:false,//是否为纯文本 无法选择设置
                row:0,//默认显示多少行,更多的出现滚动条
                showHeight:200,//设置 在下拉树的情况下的 显示高度
                open:false,//默认关闭
                windowAuto:true,//根据窗口自适应
                idvalue:"id",//属性字段绑定
                valuedata:"value",//属性字段绑定
                namevalue:"name",//属性字段绑定
                editor:false,//可编辑 可以输入
                onChange:function(){}//选择事件
            }, options);
            
            var combo = $(this);
            if(combo.is("input")){
                var combo_id = combo.attr("id");
                combo.removeAttr("id", "");
                combo.removeAttr("an-combo", "");
                if(!combo_id){
                    combo_id = "combo_"+andy.getRandom(10000);
                }
                var combo_style = combo.attr("style");
                combo.removeAttr("style");
                _options.inputName = combo.attr("name");
                combo.removeAttr("name");
                var combo_options = combo.attr("options");
                combo_options = "options = "+combo_options;
                combo.removeAttr("options", "");
                var combo_class = "m-combo";
                if(combo.attr("class")){
                    combo_class = combo.attr("class");
                    combo.attr("class", "");
                }

                // combo.attr("type", "hidden");
                combo.css("type", "hidden");

                var div = "<div class = '"+combo_class+"' id = '"+combo_id+"' style = '"+combo_style+"' "+combo_options+" an-combo></div>";
                combo.before(div);
                combo.remove();
                combo = $("#"+combo_id);
            }
            if(combo.attr("an-combo") != "an-combo"){
                combo.attr("an-combo", "an-combo");
            }
            
            // 给combo生成id
            if(_options.comboId == ""){
                combo = andy.setRandomId(combo, "combo_");
                _options.comboId = combo.attr("id");
            }
            var doc = $(document);
            var win = $(window);

            var ul_height = 0;//第一层ul高度

            // 私有事件
            var setRow = "EVENT_ROW";
            var setDefault = "EVENT_SET_DEFAULT";//还原默认状态
            var getVal = "EVENT_GET_VALUE";
            var getChooseId = "EVENT_GET_ID";
            var setShow = "EVENT_SHOW";//设置新的显示对象
            var setEnable = "EVENT_ENABLE";//设置是否禁用
            var setCurrentChoose = "EVENT_CHOOSE";//主动选择方法
            var hiddenTarget = "EVENT_HIDDEN_TARGET";//主动关闭显示对象
            var updateUrl = "EVENT_UPDATE_URL";
            // 特殊设置事件
            var addTree = "EVENT_TREE";//创建树多选列表

            // 配置
            var showEvent = "click";//默认显示事件
            var touchIsEnable = true;//触发对象是否可用

            // var showUrl = _options.showUrl;//异步加载url 包含list tree

            // 获取 设置对象
            var getOption = combo.attr("options");
            var getValueElement = "";
            if(getOption){
                 getOption = "{"+ getOption+"}";
                 getOption = andy.stringToJson(getOption);
                // 处理设置
                for(var name in getOption){
                    if(name == "onChange"){
                        var thisName = getOption[name];
                        _options.onChange = andy.stringToJson(thisName);
                    }else if(name == "checked"){
                        var data = getOption[name].split(",");
                        _options.checked = data;
                    }else{
                        if(getOption[name] == "true"){
                            _options[name] = true;
                        }else if(getOption[name] == "false"){
                            _options[name] = false;
                        }else{
                            _options[name] = getOption[name];
                        }
                        
                    }
                    
                }
            }
            _options.combo = combo;
            combo.data("options", _options)
            // console.log(getOption);
            //入值input// 最新的 button 对象 touchTarget:button 的情况
            _options.valueForInput = null;
            combo.find("input").each(function(i, input){
                if($(input).attr("type") == "hidden"){
                    _options.valueForInput = $(input);
                }
            });
            

            if(funstyle != ""){
                // 处理方法
                if(funstyle == "row"){
                    var row = arguments[1];
                    if(combo && combo[0]){
                        combo.trigger(setRow, row);
                    };
                }else if(funstyle == "setDefault"){
                    var fun = arguments[1];
                    combo.trigger(setDefault, fun);
                }else if(funstyle == "setCurrentChoose"){
                    var choose = arguments[1];
                    // choose:[id, id]
                    var arr = {
                        choose:choose
                    }
                    combo.trigger(setCurrentChoose, arr);
                }else if(funstyle == "getValue"){
                    var fun = arguments[1];
                    combo.trigger(getVal, fun);
                }else if(funstyle == "getChooseId"){
                    var fun = arguments[1];
                    combo.trigger(getChooseId, fun);
                }else if(funstyle == "getShowTarget"){
                    // 获取显示对象
                    return andy.combo("getShowTarget", $("#"+_options.comboId));
                }else if(funstyle == "setShowTarget"){
                    // 设置新的显示对象
                    var show = arguments[1];
                    combo.trigger(setShow, show);
                }else if(funstyle == "addTree"){
                    // 传入树设置
                    var op = arguments[1];
                    combo.trigger(addTree, op);
                }else if(funstyle == "isEnable"){
                    var isEnable = arguments[1];
                    combo.trigger(setEnable, isEnable);
                }else if(funstyle == "hiddenTarget"){
                    combo.trigger(hiddenTarget)
                }else if(funstyle == "updateUrl"){
                    var url = arguments[1];
                    var obj = {
                        data:url
                    }
                    combo.trigger(updateUrl, obj);
                };
            }else{
                 // 兼容IE6 的显示
                if(andy.IE() == 6){
                    combo.find("ul").each(function(i, e){
                        var cell = $(e);
                        if(!cell.prev().is("div")){
                            cell.before("<div></div>");
                        }
                    });
                };

                // 判断是否有侧边滚动条
                var isHaveScroll = function(){
                    var have = false;
                    if(doc.height() > win.innerHeight()){
                        have = true;
                    };
                    return have;
                };

                var setUlHeight = function(){
                    // 只有大于row的时候才出现滚动条
                    if(combo.showTarget.children().length > _options.row && _options.row != 0){
                        combo.showTarget.addClass("u-overflow-y");
                        ul_height = _options.row * combo.showTarget.children().outerHeight();
                        combo.showTarget.height(ul_height);
                        // u-overflow-y
                    }else{
                        combo.showTarget.removeClass("u-overflow-y");
                        ul_height = 0;//combo.showTarget.children().length * last_li.outerHeight();
                        combo.showTarget.css("height", "");
                    };
                };

                var setUlScrollHeight = function(height){
                    if(height < combo.showTarget.height()){
                        combo.showTarget.addClass("u-overflow-y");
                        combo.showTarget.outerHeight(height)
                    }
                }

                // 显示层排列
                var showUl = function(pul, ul){
                    var offset = pul.offset();
                    var pleft = offset.left;
                    var ptop = offset.top;
                    var doc_width = doc.width();
                    var doc_height = doc.height();
                    var doc_scrollTop = doc.scrollTop();
                    // console.log("input"+combo.touchTarget.width(), combo.touchTarget.outerWidth());
                    // ul.width(combo.touchTarget.width());
                    // console.log("ul"+ul.width(), ul.outerWidth());
                    var ul_width = ul.outerWidth();
                    setUlHeight();
                    var ulHeight = ul.height();

                    var scrollWidth = 0;
                    if(isHaveScroll()){
                        scrollWidth = 17;
                    };

                    // combo.showTarget.width(combo.touchTarget.width())

                    if(doc_width - pleft - scrollWidth >= ul_width){
                        ul.css({"left":"0px","right":"auto"});
                    }else{
                        ul.css({"left":"auto", "right":"0px"});
                    };
                    // 垂直排列
                    // ul.css({"left":pleft});
                    // 上下排列
                    // var buttonHeight = combo.touchTarget.outerHeight()-1;
                    var buttonHeight = combo.touchTarget.outerHeight();
                    /* ________________
                       |           |   buttonTop Height
                       |  ______   |___
                       |  |     |  |
                       |  -------  |-----buttonBottom Height
                       -------------------
                    */
                    
                    var buttonBottom = win.height() - (ptop - doc_scrollTop);
                    var buttonTop = win.height() - buttonBottom - buttonHeight;
                    if(_options.windowAuto){
                        if(buttonBottom >= buttonTop){
                            // ul.css("top", ptop + buttonHeight + "px");
                            ul.css("top", buttonHeight + "px");
                            setUlScrollHeight(buttonBottom - buttonHeight)
                        }else{
                            setUlScrollHeight(win.height() - buttonBottom)
                            ulHeight = combo.showTarget.outerHeight()
                            // ul.css("top", ptop-ulHeight + "px");
                            ul.css("top", -ulHeight + "px");
                        }
                    }else{
                        // ul.css("top", ptop + buttonHeight + "px");
                        ul.css("top", buttonHeight + "px");
                        setUlScrollHeight(buttonBottom - buttonHeight)
                    }
                    
                };

                // 除开ul的 显示位置
                var show = function (pdiv, div){
                    var offset = pdiv.offset();
                    var pleft = offset.left;
                    var ptop = offset.top;
                    var doc_width = doc.width();
                    var doc_height = doc.height();
                    var doc_scrollTop = doc.scrollTop();
                    // console.log("input"+combo.touchTarget.width(), combo.touchTarget.outerWidth());
                    // div.width(combo.touchTarget.width());
                    // console.log("div"+div.width(), div.outerWidth());
                    var ul_width = div.outerWidth();
                    var ulHeight = div.height();

                    var scrollWidth = 0;
                    if(isHaveScroll()){
                        scrollWidth = 17;
                    };

                    // if(combo.touchTarget.width() == "100%" || combo.touchTarget.width() == false){
                    //     combo.showTarget.width(combo.touchTarget.width())
                    // }

                    // 左右排列
                    if(doc_width - pleft - scrollWidth >= ul_width){
                        div.css({"left":"0px","right":"auto"});
                    }else{
                        div.css({"left":"auto", "right":"0px"});
                    };

                    // 垂直排列
                    // div.css({"left":pleft+"px"});

                    // 上下排列
                    // console.log(win.height() - (ptop - doc_scrollTop), ulHeight);
                    // var buttonHeight = combo.touchTarget.outerHeight() - 1;
                    var buttonHeight = combo.touchTarget.outerHeight();
                    // if(_options.windowAuto){
                    //     if($(window).height() - (ptop - doc_scrollTop) - buttonHeight <= ulHeight){
                    //         div.css("top", -ulHeight + "px");
                    //     }else{
                    //         div.css("top", buttonHeight + "px");
                    //     }
                    // }else{
                    //     div.css("top", buttonHeight + "px");
                    // }

                    var buttonBottom = win.height() - (ptop - doc_scrollTop);
                    var buttonTop = win.height() - buttonBottom - buttonHeight;
                    if(_options.windowAuto){
                        if(buttonBottom >= buttonTop){
                            // div.css("top", ptop + buttonHeight + "px");
                            div.css("top", buttonHeight + "px");
                            setUlScrollHeight(buttonBottom - buttonHeight)
                        }else{
                            setUlScrollHeight(win.height() - buttonBottom)
                            ulHeight = combo.showTarget.outerHeight()
                            // div.css("top", ptop-ulHeight + "px");
                            div.css("top", -ulHeight + "px");
                        }
                    }else{
                        // div.css("top", ptop + buttonHeight + "px");
                        div.css("top", buttonHeight + "px");
                        setUlScrollHeight(buttonBottom - buttonHeight)
                    }
                };

                // =========================================通用 显示对象方法

                // 更新显示对象 显示对象 是否清除以前结构
                var setCurrentShow = function(show, isClear){
                    if(isClear){
                        combo.showTarget.empty();
                    };
                    if(show instanceof jQuery){  
                        combo.showTarget.replaceWith(show);
                    }else{
                        combo.showTarget.replaceWith($(show));
                    };
                    andy.combo({
                        combo:combo,
                        showEvent:showEvent,
                        showComplete:function(){
                            combo.css({
                                "z-index": 99999,
                                "position":"relative"
                            });
                            combo.showTarget.css("z-index", 99999);
                            if(_options.showTargetType == "list"){
                                showUl(combo, combo.showTarget);
                            }else{
                                show(combo, combo.showTarget);
                            }
                        },
                        hiddenComplete:function(){
                            combo.css({
                                "z-index": "",
                                "position":"static"
                            });
                            combo.showTarget.css("z-index", "");
                        }
                    });
                    _options.showData = [];
                    combo.an_combo_bindEvent(_options)
                };

                // 样式修复
                // combo.addClass("u-input-span");
                // combo.css("padding", "0px");

                var setEnableFun = function(){
                    if(combo){
                        var touchTarget = combo.touchTarget;
                        if(touchTarget.is("input") == false){
                            touchTarget = touchTarget.find("input");
                        }
                        if(combo.data("isEnable") == true){
                            touchTarget.removeAttr("disabled");
                            combo.removeClass("u-disabled");
                        }else{
                            touchTarget.attr("disabled","disabled");
                            combo.addClass("u-disabled");
                        }
                    }
                }


                var init = function(combo, touchType, showType){
                    combo.data("selects", _options.selects);
                    combo.data("isEnable", _options.isEnable);
                    combo.data("isText", _options.isText);
                    combo.an_combo_creatTouch(_options);
                    combo.an_combo_creatShow(_options);
                }

                // "normal":input 普通类型  "ban":input 禁止修改
                // 当没有静态对象时 初始化默认对象
                if(combo.children().length == 0){
                    init(combo, _options.touchTargetType, _options.showTargetType);
                }else{
                    var touchTarget = andy.combo("getTouchTarget", combo);
                    // 判断触发对象类型
                    if(touchTarget.is("a")){
                        _options.touchTargetType = "button";
                        if(_options.inputName == ""){
                            _options.inputName = _options.comboId;
                        }
                        if(_options.valueForInput == null){
                            combo.append("<input type = 'hidden' name = '"+_options.inputName+"'>");
                            _options.valueForInput = combo.find("input");
                        }
                    }
                    init(combo, _options.touchTargetType, _options.showTargetType);
                    if(_options.editor == false){
                        combo.find(".u-input").addClass("u-diseditor");
                    }else{
                        combo.find(".u-input").attr("readonly", null);
                    }
                }

                andy.combo({
                    combo:combo,
                    showEvent:showEvent,
                    showComplete:function(){
                        // if(combo.parent().hasClass("u-formitem")){
                        //     combo.parent().css("z-index", 99999);
                        // };
                        combo.css({
                            "z-index": 99999,
                            "position":"relative"
                        });
                        combo.showTarget.css("z-index", 99999);
                        if(_options.showTargetType == "list"){
                            showUl(combo, combo.showTarget);
                        }else{
                            show(combo, combo.showTarget);
                        }
                    },
                    hiddenComplete:function(){
                        // if(combo.parent().hasClass("u-formitem")){
                        //     combo.parent().css("z-index", "");
                        // };
                        combo.css({
                            "z-index": "",
                            "position":"static"
                        });
                        combo.showTarget.css("z-index", "");
                    }
                });

                setEnableFun();

                // 入值input
                // if(inputValue == undefined || inputValue.length == 0){
                    _options.valueForInput = combo.touchTarget;
                    if(_options.valueForInput.is("input") == false){
                        _options.valueForInput.find("input").each(function(index, input){
                            _options.valueForInput = $(input);
                        })
                    }
                    if(_options.valueForInput.is("input")){
                        if(_options.inputName == "" && _options.valueForInput.attr("name") == undefined){
                            _options.inputName = _options.comboId + "_input";
                            _options.valueForInput.attr("name", _options.inputName);
                        }else if(_options.valueForInput.attr("name") == undefined){
                            _options.valueForInput.attr("name", _options.inputName);
                        }
                    }
                    
                    // var nameForInput = _options.inputName;
                    // if(nameForInput == ""){
                    //     nameForInput = _options.comboId + "_input";
                    // }
                    // if(combo.touchTarget.is("input")){
                    //     combo.touchTarget
                    // }
                //     combo.showTarget.after("<input class = 'inputValue' name = '"+nameId+"' id = '"+nameId+"' type = 'hidden'>");
                //     inputValue = combo.find(".inputValue");
                // }

                

                // 修改限制行
                combo.bind(setRow, function(e, row){
                    _options.row = row;
                });

                // 设置新的显示对象
                combo.bind(setShow, function(e, show){
                    setCurrentShow(show, true);
                });

                // 树结构事件绑定
                combo.bind(addTree, function(e, op){
                    // createTree(op.treeId, op.setting, op.nodes, op);
                });

                if(combo.showTarget.is("ul")){
                    // combo.find("ul li").click(function(e){
                    //     var t = $(e.target);
                    //     if(t.is('li') == false){
                    //         t = t.closest('li');
                    //     };
                    //     // 如果有 入值input 就附上value值
                    //     if(inputValue[0]){
                    //         inputValue.val(t.attr("value"));
                    //     };
                    //     if(span[0]){
                    //         if(span.children().has("p")){
                    //             var text = $(e.target).text();
                    //             span.children("p").text(text);
                    //         };
                            
                    //     };
                    //     combo.showTarget.css("display", "none");
                    //     combo.removeClass("open");
                    //     combo.trigger(andy.EVENT_CLICK, t.attr("value"));
                    // }); 
                };

                // 还原默认状态
                combo.bind(setDefault, function(e, fun){
                    var touchTarget = combo.touchTarget;
                    var inputValue = "";
                    var valueArr = "";
                    var idArr = "";
                    if(touchTarget.is("input") == false){
                        touchTarget = touchTarget.find("input");
                    } 
                    if(combo.showTarget.is("ul")){
                        combo.showTarget.children().each(function(i, li){
                            var $li = $(li);
                            if($li.hasClass("active")){
                                $li.removeClass("active");
                            }
                            if(_options.checked.length > 0){
                                for(var di in _options.checked){
                                    if($li.attr("listId") == _options.checked[di]){
                                        $li.addClass("active")
                                        if(idArr == ""){
                                            inputValue = $li.text();
                                            valueArr = $li.attr("value");
                                            idArr = $li.attr("listId")
                                        }else{
                                            inputValue += ","+$li.text();
                                            valueArr = $li.attr("value");
                                            idArr += ","+$li.attr("listId");
                                        }
                                    }
                                }
                            }
                        })
                    }

                    if(touchTarget.is("input")){
                        if(_options.checked.length > 0){
                            touchTarget.attr({"value":inputValue, "idValue":idArr, "valueData":valueArr});
                            touchTarget.val(inputValue);
                        }else{
                            touchTarget.attr({"value":_options.defaultValue, "idValue":"", "valueData":""});
                            touchTarget.val(_options.defaultValue);
                        }
                    }

                    if(fun){
                        fun(valueArr, idArr);
                    }
                    
                })

                // 是否禁用combo
                // console.log(combo)
                combo.bind(setEnable, function(e, isEnable){
                    combo.data("isEnable",isEnable);
                    setEnableFun();
                });

                combo.bind(hiddenTarget, function(e){
                    andy.combo("hiddenTarget", combo)
                });

                combo.bind(updateUrl, function(e, obj){
                    combo.an_combo("setDefault")
                    var url = obj.data;
                    var opt = combo.data("options");
                    combo.showTarget.empty();
                    opt.combo =combo;
                    if(typeof url == "string"){
                        opt.showUrl = url;
                    }else if(typeof url == "object"){
                        opt.showData = url;
                    }
                    combo.an_combo_creatShow("eventBind", opt);
                })

                // 绑定显示对象事件 绑定事件 可以在创建方法里面直接绑定 也可以调用绑定事件方法
                combo.an_combo_creatShow("eventBind", _options);
                
                // combo.an_combo_bindEvent({
                //     combo:combo,
                //     touchTargetType:touchTargetType,
                //     showTargetType:showTargetType,
                //     showUrl:showUrl
                // })

                // 设置选择id 方法
                combo.bind(setCurrentChoose, function(e, choose){

                });
            };
        },
        an_combo_creatTouch:function(){
            var options = {};
            var funstyle = "";
            for(var i= 0; i <arguments.length;i++){
                var a = arguments[0];
                if(typeof a == "object"){
                    options = a;
                }else if(typeof a == "string"){
                    funstyle = a;
                }
            };

            var _options = $.extend({
                combo:"",
                comboName:"combo",
                inputVerify:"",
                checked:"",//已选id 初始化
                selects:false,
                defaultValue:"下拉选择",
                touchTargetType:""//默认显示多少行,更多的出现滚动条
                // open:false//默认关闭
            }, options);

            var addChoose = "EVENT_ADD_CHOOSE";
            var cancelChoose = "EVENT_CANCEL_CHOOSE";
            var getVal = "EVENT_GET_VALUE";
            var getChooseId = "EVENT_GET_ID";
            var comboId = $(this).attr("id");

            var combo = $("#"+comboId);
            var selectId = "";
            var seletc = "";
            if(combo.data("selects") != undefined){
                _options.selects = combo.data("selects");
            }
            
            if(funstyle != ""){
                if(funstyle == "addChoose"){
                    var touchData = arguments[1];
                    combo.trigger(addChoose, touchData)
                }else if(funstyle == "cancelChoose"){
                    var touchData = arguments[1];
                    combo.trigger(cancelChoose, touchData)
                }else if(funstyle == "getValue"){
                    var fun = arguments[1];
                    combo.trigger(getVal, fun);
                };
            }else{
                // -------------------------------------------selects 操作
                var insetSelects = function(data){
                    seletc.addElement(data)
                }

                var removeSelects = function(data){
                    seletc.deleteElement(data)
                }
                //----------------------------------------------------button touch 操作
                var addButton = function(node){
                    //插入input:id name
                    var thiscombo = $("#"+comboId);
                    var touchTarget = andy.combo("getTouchTarget", thiscombo);
                    var oldP = touchTarget;

                    var inValueInput = _options.valueForInput;
                    // var inputValue;
                    // _options.combo.find("input").each(function(i, input){
                    //     if($(input).attr("type") == "hidden"){
                    //         inputValue = $(input);
                    //     }
                    // });
                    if(inValueInput.is("input") == false){
                        inValueInput.find("input").each(function(index, input){
                            inValueInput = $(input);
                        })
                    }
                    
                    var oldName = oldP.attr("value");
                    var idName = inValueInput.attr("idValue");
                    if(node.attr && typeof node.attr != "string"){
                        // node.attr = JSON.stringify(node.attr);
                        node.attr = "";
                    }

                    var inValue = inValueInput.attr("valueData");
                    if(oldName == undefined || oldName == "" || oldName == _options.defaultValue){
                        oldName = node.name;
                        idName = node.id;
                        inValue = (node.value || node.attrValue || node.attr);
                    }else{
                        oldName = oldName+"，"+node.name;
                        idName = idName+","+node.id;
                        var newV = (node.value || node.attrValue || node.attr);
                        inValue = inValue + "," +newV;
                    }
                    
                    if(_options.selects == false){
                        // console.log(node.name)
                        inValueInput.attr({"idValue":node.id, "valueData":(node.value || node.attrValue || node.attr)});
                        if(_options.changeTarget){
                            oldP.html(node.name+"<i class='iconfont'></i>");
                        }
                        // inputValue.attr({"value":node.value});
                    }else{
                        inValueInput.attr({"idValue":idName, "valueData":inValue});
                        if(_options.changeTarget){
                            oldP.text(oldName+"<i class='iconfont'></i>");
                        }
                        // inputValue.attr({"value":inValue});
                    }
                    if(inValueInput.attr("verify")){
                        // andy.inputCheck(inValueInput[0]);
                    }
                    
                }
                var insetButton = function(data){
                    var combo = $("#"+comboId);
                    if(_options.valueForInput == null){
                        if(combo.find("input").length == 0){
                            combo.append("<input type = 'hidden' name = '"+_options.inputName+"'>");
                            _options.valueForInput = combo.find("input");
                        };
                    }
                    var inValueInput = _options.valueForInput;
                    if(inValueInput.is("input") == false){
                        inValueInput.find("input").each(function(index, input){
                            inValueInput = $(input);
                        })
                    }
                    if(inValueInput && inValueInput.is("input")){
                        var idName = inValueInput.attr("idValue");
                        if(idName != undefined && idName != ""){
                            var idArr = idName.split(",");
                            var isHaveSameId = false;
                            for(var i = 0; i < idArr.length; i++){
                                if(idArr[i] == data.id){
                                    isHaveSameId = true;
                                }
                            }
                            if(!isHaveSameId){
                                addButton(data);
                            }
                        }else{
                            addButton(data);
                        }
                        
                    }
                }

                var removeSetButton = function(data){
                    
                }

                
                //-----------------------------------------------------input touch操作
                var getPathText = function(path){
                    var str = "";
                    for(var i = 0; i < path.length - 1; i++){
                            str += path[i].name+"-";
                    }
                    return str;
                }

                var addInput = function(node){
                    //插入input:id name
                    var thiscombo = $("#"+comboId);
                    var touchTarget = andy.combo("getTouchTarget", thiscombo);
                    // var inputValue;
                    // _options.combo.find("input").each(function(i, input){
                    //     if($(input).attr("type") == "hidden"){
                    //         inputValue = $(input);
                    //     }
                    // });
                    if(touchTarget.is("input") == false){
                        touchTarget.find("input").each(function(index, input){
                            touchTarget = $(input);
                        })
                    }
                    
                    var oldName = touchTarget.attr("value");
                    var idName = touchTarget.attr("idValue");
                    if(node.attr && typeof node.attr != "string"){
                        // node.attr = JSON.stringify(node.attr);
                        node.attr = "";
                    }

                    var inValue = touchTarget.attr("valueData");
                    var parentName = "";
                    if(node.getParentNode && _options.selects == false){
                        parentName = getPathText(node.getPath())
                    }else if(node.path && _options.selects == false){
                        parentName = getPathText(node.path)
                    }
                    
                    if(oldName == undefined || oldName == "" || oldName == _options.defaultValue){
                        oldName = parentName+node.name;
                        idName = node.id;
                        inValue = (node.value || node.attrValue || node.attr);
                    }else{
                        oldName = oldName+"，"+parentName+node.name;
                        idName = idName+","+node.id;
                        var newV = (node.value || node.attrValue || node.attr);
                        inValue = inValue + "," +newV;
                    }
                    
                    if(_options.selects == false){
                        // console.log(node.name)
                        touchTarget.attr({"value":parentName+node.name, "idValue":node.id, "valueData":(node.value || node.attrValue || node.attr)});
                        // inputValue.attr({"value":node.value});
                        touchTarget.val(parentName+node.name);
                    }else{
                        touchTarget.attr({"value":oldName, "idValue":idName, "valueData":inValue});
                        // inputValue.attr({"value":inValue});
                        touchTarget.val(oldName);
                    }
                    if(touchTarget.attr("verify")){
                        andy.inputCheck(touchTarget[0]);
                    }
                    
                }

                // input插入
                var insetInput = function(data){
                    // console.log(touchTarget[0])
                    var touchTarget = andy.combo("getTouchTarget", $("#"+comboId));

                    if(touchTarget.is("input") == false){
                        touchTarget.find("input").each(function(index, input){
                            touchTarget = $(input);
                        })
                    }

                    if(touchTarget && touchTarget.is("input")){
                        var idName = touchTarget.attr("idValue");
                        if(idName != undefined && idName != ""){
                            var idArr = idName.split(",");
                            var isHaveSameId = false;
                            for(var i = 0; i < idArr.length; i++){
                                if(idArr[i] == data.id){
                                    isHaveSameId = true;
                                }
                            }
                            if(!isHaveSameId){
                                addInput(data);
                            }
                        }else{
                            addInput(data);
                        }
                        
                    }
                }

                

                var removeSetInput = function(treeNode){
                    // 移除input:id name
                    var touchTarget = andy.combo("getTouchTarget", $("#"+comboId));
                    // var inputValue;
                    // _options.combo.find("input").each(function(i, input){
                    //     if($(input).attr("type") == "hidden"){
                    //         inputValue = $(input);
                    //     }
                    // });
                    if(touchTarget.is("input") == false){
                        touchTarget.find("input").each(function(index, input){
                            touchTarget = $(input);
                        })
                    }


                    if(touchTarget && touchTarget.is("input")){
                        var oldName = touchTarget.attr("value");
                        var idName = touchTarget.attr("idValue");

                        var inValue = touchTarget.attr("valueData");
                        // console.log("aaa:",idName)

                        var oldArr = oldName.split("，");
                        var idArr = idName.split(",");
                        var inValArr = inValue.split(",");

                        for(var i = 0; i < idArr.length; i++){
                            if(idArr[i] == treeNode.id){
                                idArr.splice(i, 1);
                                oldArr.splice(i, 1);
                                inValArr.splice(i, 1);
                            }
                        }
                        // 清空之前选择
                        touchTarget.attr("value", "");
                        touchTarget.attr("idValue", "");
                        touchTarget.attr("valueData", "");
                        var oldName = touchTarget.attr("value");
                        var idName = touchTarget.attr("idValue");

                        var inValue = touchTarget.attr("valueData");
                        for(var i = 0; i < idArr.length; i++){
                            // addInput(idArr[i]);
                            var name = oldArr[i];
                            var id = idArr[i]; 
                            var valued = inValArr[i];
                            if(i == 0){
                                oldName = name;
                                idName = id;
                                inValue = valued;

                            }else{
                                oldName = oldName+"，"+name;
                                idName = idName+","+id;
                                inValue = inValue + ","+valued;
                            }
                        }

                        touchTarget.attr("value", oldName);
                        touchTarget.val(oldName);
                        touchTarget.attr("idValue", idName);
                        touchTarget.attr("valueData", inValue);
                    }
                }
                // touchTarget
                var addTouchTarget = function(touchData){
                    if(_options.touchTargetType == "input"){
                        // console.log("input")
                        insetInput(touchData);
                    }else if(_options.touchTargetType == "button"){
                        insetButton(touchData);
                    }else if(_options.touchTargetType == "selects"){
                        insetSelects(touchData);
                    }
                }

                var cancelTouchTarget = function(touchData){
                    if(_options.touchTargetType == "input"){
                        removeSetInput(touchData);
                    }else if(_options.touchTargetType == "button"){
                        removeSetButton(touchData);
                    }else if(_options.touchTargetType == "selects"){
                        removeSelects(touchData);
                    }
                }

                // 根据不同触发对象 创建不同对象
                if(_options.touchTargetType == "input"){
                    if(_options.combo.children().length == 0){
                        var enableText = "";
                        if(_options.combo.data("isEnable") == false){
                            enableText = "disabled";
                        }
                        if(_options.checked.length > 0){
                            _options.defaultValue = "";
                        }
                        // _options.combo.append("<span class='u-up-menu'><input class = 'u-input u-diseditor' readonly='readonly' verify = '"+_options.inputVerify+"' value = '"+_options.defaultValue+"' "+enableText+" combo = '"+_options.comboName+"'><i class='iconfont u-nd'></i></span>");
                         _options.combo.append("<div class='u-group "+_options.comboSize+"'><input class = 'item item-l u-input u-diseditor' readonly='readonly' verify = '"+_options.inputVerify+"' value = '"+_options.defaultValue+"' "+enableText+" combo = '"+_options.comboName+"'><i class='iconfont mark item item-r'></i></div>");
                        andy.formlayout();
                    }
                }else if(_options.touchTargetType == "button"){
                    if(_options.combo.children().length == 0){
                        var enableText = "";
                        if(_options.combo.data("isEnable") == false){
                            enableText = "disabled";
                        }
                        if(_options.checked.length > 0){
                            _options.defaultValue = "";
                        }
                        _options.combo.append("<a class='u-btn "+_options.comboSize+"' combo = '"+_options.comboName+"'>"+_options.defaultValue+"<i class='iconfont'></i></a>");
                        // _options.combo.append("<span class='u-but-group u-group-center'><p style='color:#000'>"+_options.defaultValue+"</p><i class='iconfont'></i><button type='button' class='u-but-button' combo = '"+_options.comboName+"'></button></span>");
                        _options.combo.toggleClass("u-btn-eject u-group-center");
                        andy.formlayout();
                    }
                }else if(_options.touchTargetType == "selects"){
                    // 多选文本框
                    selectId = comboId+"_selects";
                    if(_options.combo.children().length == 0){
                        _options.combo.append("<div class='u-btn-eject' style='width:100%;' combo = '"+_options.comboName+"'><div class='u-btn-checkbox f-clear' id="+selectId+"></div></div>");
                    }
                    var inputName = _options.inputName;
                    if(inputName = ""){
                        inputName = comboId + "_input";
                    }
                    seletc = andy.multiSelect({
                        parent:document.getElementById(selectId),
                        dataKey:inputName,//input的name
                        list:[]
                    });
                }

                combo.bind(addChoose, function(e, data){
                    addTouchTarget(data);
                })

                combo.bind(cancelChoose, function(e, data){
                    cancelTouchTarget(data);
                })

                combo.bind(getVal, function(e, fun){
                    var touchTarget = andy.combo("getTouchTarget", $("#"+comboId));
                    if(touchTarget){
                        var value = touchTarget.attr("valueData");
                        fun(value);
                    }
                })

                combo.bind(getChooseId, function(e, fun){
                    var touchTarget = andy.combo("getTouchTarget", $("#"+comboId));
                    if(touchTarget.is("input") == false){
                        touchTarget.find("input").each(function(index, input){
                            touchTarget = $(input);
                        })
                    }
                    if(touchTarget){
                        var idvalue = touchTarget.attr("idvalue");
                        fun(idvalue);
                    }
                })

            }
        },
        an_combo_creatShow:function(){
            var options = {};
            var funstyle = "";
            for(var i= 0; i <arguments.length;i++){
                // console.log(arguments[0]);
                var a = arguments[0];
                if(typeof a == "object"){
                    options = a;
                }else if(typeof a == "string"){
                    funstyle = a;
                }
            };

            var _options = $.extend({
                combo:"",
                comboName:"combo",
                showTargetType:""//默认显示多少行,更多的出现滚动条
            }, options);

            var eventBind = "EVENT_BIND";

            if(funstyle != ""){
                if(funstyle == "eventBind"){
                    var obj = arguments[1];
                    $(this).trigger(eventBind, obj);
                };
            }else{
                if(_options.showTargetType == "list"){
                    if(_options.combo.children().length == 1){
                        _options.combo.append("<ul class = 'combo m-menu' combo = '"+_options.comboName+"'></ul>")
                    }
                }else if(_options.showTargetType == "tree"){
                    if(_options.combo.children().length == 1){
                        _options.combo.append("<div class='combo but-tree' style='height:"+_options.showHeight+"px;' combo ='"+_options.comboName+"'></div>")
                    }
                }

                _options.combo.bind(eventBind, function(e, obj){
                    _options.combo.an_combo_bindEvent(obj)
                })
            }
        },
        an_combo_bindEvent:function(){
            // 绑定选中事件
            var options = {};
            var funstyle = "";
            for(var i= 0; i <arguments.length;i++){
                // console.log(arguments[0]);
                var a = arguments[0];
                if(typeof a == "object"){
                    options = a;
                }else if(typeof a == "string"){
                    funstyle = a;
                }
            };

            var _options = $.extend({
                combo:"",
                selects:false,
                checked:[],//已选id 初始化
                treeId:"",//下拉树ID
                onChange:function(){},
                touchTargetType:"input",
                showTargetType:"list",
                showUrl:""
            }, options);

            var touchTarget = _options.combo.touchTarget;
            var showTarget = _options.combo.showTarget;

            if($(this).data("selects") != undefined){
                _options.selects = $(this).data("selects");
            }

            if(funstyle != ""){
                if(funstyle == "setCurrentChoose"){
                };
            }else{

                // =========================================通用 显示对象方法

                // 更新显示对象 显示对象 是否清楚以前结构
                var setCurrentShow = function(show, isClear){
                    var combo = _options.combo;
                    if(isClear){
                        combo.showTarget.empty();
                    };
                    if(show instanceof jQuery){  
                        combo.showTarget = show;
                    }else{
                        combo.showTarget = $(show);
                    };
                };

                var addTouch = function(touchData){
                    // if(_options.touchTargetType == "input"){
                        if(touchData.checked){
                            _options.combo.an_combo_creatTouch("addChoose", touchData);
                        }else{
                            _options.combo.an_combo_creatTouch("cancelChoose", touchData);
                        }
                    // }
                }

                var goTreeCheck = function(treeNode, isCheck){
                    // console.log(treeNode, isCheck);
                    // var nodes = treeObj.getSelectedNodes();
                    // console.log(treeNode.checked)
                    // 插入 触发对象 利用统一方法入口
                    if (treeNode && isCheck && treeNode.checked) {
                        if (treeNode.children && _options.selects) {
                            // insetInput(treeNode);
                            _options.combo.an_combo_creatTouch("addChoose", treeNode);
                            for (var i = 0; i < treeNode.children.length; i++) {
                                goTreeCheck(treeNode.children[i], isCheck);
                            }
                        } else {
                            // insetInput(treeNode);
                            _options.combo.an_combo_creatTouch("addChoose", treeNode);
                        }
                    } else if (!isCheck) {
                        if (treeNode.children) {
                            // removeSetInput(treeNode);
                            _options.combo.an_combo_creatTouch("cancelChoose", treeNode);
                            for (var i = 0; i < treeNode.children.length; i++) {
                                goTreeCheck(treeNode.children[i], isCheck);
                            }
                        } else {
                            // removeSetInput(treeNode);
                            _options.combo.an_combo_creatTouch("cancelChoose", treeNode);
                        }
                    }
                }

                var onTreeCheck = function(treeNode){
                    if(treeNode){
                        goTreeCheck(treeNode, treeNode.checked);
                        // if(treeNode.checked){
                        //     // 选取
                        //     goTreeCheck(treeNode, true);
                        // }else{
                        //     // 取消
                        //     goTreeCheck(treeNode, false);
                        // }
                    }
                }

                var setChecked = function(treeId, checked){
                    if(!checked){
                        return false;
                    }
                    var treeObj = $.fn.zTree.getZTreeObj(treeId);
                    for(var i = 0; i < checked.length; i++){
                        var node = treeObj.getNodeByParam("id", checked[i], null);
                        if(node){
                            treeObj.checkNode(node, true, true);
                            var nodec = {
                                path:node.getPath(),
                                children:node.children,
                                value:node[_options.valuedata],
                                attr:node.attr || "",
                                name:node[_options.namevalue],
                                children:node.children,
                                checked:node.checked,
                                id:node[_options.idvalue]
                            }
                            onTreeCheck(nodec);
                        }
                    }

                }

                var getLiData = function(li){
                    // 从li标签里面获取数据
                    var liData = {
                        checked:li.hasClass("active"),
                        value:li.attr("value"),
                        id:li.attr("listId"),
                        name:li.text()
                    }
                    return liData;
                }

                // 创建列表结构
                var creatListShow = function(){
                    // 绑定事件
                    var checkLenght = _options.checked.length;
                    showTarget.children().each(function(index, li){
                        // 初始化\
                        var $li = $(li);
                        // 如果li标签 没有识别listId 则主动以索引赋予
                        if(!$li.attr("listId")){
                            $li.attr("listId", _options.combo.attr("id")+"_"+index);
                        }
                        if(checkLenght > 0){
                            for(var i = 0; i< checkLenght; i++){
                                if($li.attr("listId") == String(_options.checked[i])){
                                    $li.addClass("active");
                                    var liData = getLiData($li);
                                    addTouch(liData)
                                }
                            }

                        }
                        $li.unbind("click");
                        $li.on("click", function(e){
                            var t = $(e.target);
                            if(t.is('li') == false){
                                t = t.closest('li');
                            };
                            
                            if(!_options.selects){
                                showTarget.children().each(function(index, li){
                                    $(li).removeClass("active");
                                })
                            }
                            t.toggleClass("active");
                            var touchData = getLiData(t);
                            $li.comboData = touchData;
                            
                            addTouch(touchData)
                            $("#"+_options.comboId).trigger(andy.COMBO_CHOOSE_LISET, $li);
                            _options.onChange($li);
                            // 点击隐藏列表
                            if(_options.selects == false && t.is('li')){
                                andy.combo("hiddenTarget", _options.combo);
                            }
                        })
                    })
                    
                }

                // 创建树结构
                var createTree = function(id, set, nodes, op){
                    var treeId = id;
                    _options.selects = op.selects;//是否多选 true为多选
                    var checked = op.checked;
                    var combo = _options.combo;
                    
                    //树设置
                    var setting = {
                        treeObj:null,
                        callback:{
                            onCheck:function(event, treeId, treeNode) {
                                var node = {
                                    path:treeNode.getPath(),
                                    children:treeNode.children,
                                    value:treeNode[_options.valuedata],
                                    attr:treeNode.attr || "",
                                    name:treeNode[_options.namevalue],
                                    children:treeNode.children,
                                    checked:treeNode.checked,
                                    id:treeNode[_options.idvalue]
                                }
                                onTreeCheck(node);
                                _options.onChange(treeNode);
                            }
                        },
                        check: {
                            enable: true,
                            autoCheckTrigger: true,
                            chkStyle: "checkbox",
                            chkboxType: { "Y": "s", "N": "s" }
                        },
                        data: {
                            key:{
                                name:_options.namevalue
                            },
                            simpleData: {
                              enable: true,
                              idKey:_options.idvalue
                            }
                        }
                    };

                    if(_options.treeCheckBoxType != {}){
                        setting.check.chkboxType = _options.treeCheckBoxType;
                    }
                    // 异步树设置
                    if(_options.treeAsync != {}){
                        setting.async = _options.treeAsync;
                    }
                    // 单选多选设置
                    if(_options.selects == false){
                        setting.check = {
                            enable:true,
                            radioType: "all",
                            chkStyle:"radio"
                        }
                    }

                    if(set){
                        setting = $.extend(true, {}, setting, set);
                    };

                    // 插入树结构
                    combo.showTarget.append("<div class='g-h-max'><ul id='"+treeId+"' class='ztree'></ul></div>");
                    var tree = "";
                    // 判断是否加载ztree结构json
                    if(nodes){
                        $.fn.zTree.init($("#" + treeId), setting, nodes);
                        tree = $("#" + treeId);
                        setChecked(treeId, checked);
                        setCurrentShow(combo.showTarget);
                    }else if(op && op.url){
                        andy.loaddata(op.url, function(data){
                            data = andy.stringToJson(data);
                            // console.log(combo.showTarget)
                            $.fn.zTree.init($("#" + treeId), setting, data);
                            tree = $("#" + treeId);
                            setChecked(treeId, checked);
                            setCurrentShow(combo.showTarget);
                        })
                    };
                }

                // showTarget
                var initShow = function(data){
                    if(_options.showTargetType == "list"){
                        var lis = "";
                        for(var i = 0; i < data.length; i++){
                            var liData = data[i];
                            var isFist = "";
                            var valueStr = "";
                            var attrStr = "";
                            var attrValueStr = "";
                            if(i == 0){
                                isFist = "first";
                            }
                            if(liData[_options.valuedata]){
                                valueStr = "value = "+liData[_options.valuedata];
                            }else if(liData.attrValue){
                                attrValueStr = "attrValue = " + liData.attrValue;
                            }else if(liData.attr){
                                // 适用于多数据类型
                                attrStr = "attrStr = "+liData.attr;
                            }
                            var li = "<li class = '"+isFist+"' "+valueStr+" "+attrStr+" "+attrValueStr+" listId = '"+liData[_options.idvalue]+"' ><a>"+liData[_options.namevalue]+"</a></li>";
                            lis += li;
                        }
                        showTarget.append(lis);
                        creatListShow();
                    }else if(_options.showTargetType == "tree"){
                        if(_options.treeId == ""){
                            _options.treeId = "treeId_"+andy.getRandom(10000);
                        }
                        createTree(_options.treeId, _options.treeSetting, data, _options);
                    }
                    
                }

                if(_options.showUrl == null || _options.showUrl == "" && _options.showData.length == 0){
                    if(_options.showTargetType == "list"){
                        creatListShow();
                    };
                    return false;
                }else if(_options.showUrl != ""){
                    andy.loaddata(_options.showUrl, function(data){
                        data = andy.stringToJson(data)
                        if(data.length > 0){
                            initShow(data);
                        }
                    })
                }else if(_options.showData.length > 0){
                    if(typeof(_options.showData) == "string"){
                        _options.showData = andy.stringToJson(_options.showData);
                    }
                    initShow(_options.showData);
                }else{
                    if(_options.showTargetType == "list"){
                        creatListShow();
                    }
                }

                _options.combo.bind("EVENT_CHOOSE", function(e, choose){
                    showTarget.children().each(function(index, li){
                        // 初始化
                        var $li = $(li);
                        for(var i = 0; i < choose.choose.length; i++){
                            if(parseInt($li.attr("listId")) == choose.choose[i]){
                                if(!_options.selects){
                                    showTarget.children().each(function(index, li){
                                        $(li).removeClass("active");
                                    })
                                }
                                $li.addClass("active");
                                var liData = getLiData($li);
                                addTouch(liData)
                            }
                        }
                       
                    })
                })
            }
        }
    });
})(jQuery);/*spinner */
/**
 * 数字调节器
 * author:林耘宇
 **/

 (function ($) {
    $.fn.extend({
    	an_spinner:function(){
    		var options = {};
            var funstyle = "";
            var arg = arguments[0];
            (typeof arg == "object")? options = arg:funstyle = arg;

            var _options = $.extend({
                spinnerSize:"",//xs sm md lg
                increment:1,//默认增减值
                min:0,//默认为0
                max:99999,//默认99999
                inputName:"",
                value:1,//默认值
                onChange:function(){}
            }, options);

            var spi = $(this);
            if(spi.is("input")){
                var spinner_id = spi.attr("id");
                spi.removeAttr("id", "");
                spi.removeAttr("an-spinner", "");
                if(!spinner_id){
                    spinner_id = "spinner_"+andy.getRandom(10000);
                }
                var spinner_style = spi.attr("style");
                if(spi.attr("name")){
                    _options.inputName = spi.attr("name");
                    spi.removeAttr("name");    
                }
                if(spi.attr("value")){
                    _options.value = spi.attr("value");
                    spi.removeAttr("value");
                }
                
                var spinner_options = spi.attr("options");

                spi.css("display", "none");
                var subSpan = "<a class='item item-l u-btn' sub><i class='iconfont'></i></a>";
                var addSpan = "<a class='item item-r u-btn' add><i class='iconfont'></i></a>";
                var valueInput = "<input type='text' class='item u-input nohover' name = '"+_options.inputName+"' style='text-align:center; width:0px; text-indent:0' value='"+_options.value+"' val>";
                var div = "<div class='u-group "+_options.spinnerSize+"' id = '"+spinner_id+"' style = '"+spinner_style+"' options = "+spinner_options+" an-spinner>"+subSpan+valueInput+addSpan+"</div>";
                spi.before(div);
                spi = $("#"+spinner_id);
                andy.layout(spi.parent());
            }
            var sub = spi.find("[sub]");
            var val = spi.find("[val]");
            var add = spi.find("[add]");

            // 私有事件
            var getValue = "EVENT_VALUE";

            // 获取 设置对象
            var getOption = spi.attr("options");
            if(getOption){
                 getOption = "{"+ getOption+"}";
                 getOption = andy.stringToJson(getOption);
                // 处理设置
                for(var name in getOption){
                    if(name == "onChange"){
                        var thisName = getOption[name];
                        _options.onChange = function(e){
                            var fun;
                            if(typeof thisName == "string"){
                                fun = andy.stringToJson(thisName);
                            }else{
                                fun = thisName;
                            }
                            
                            fun(e);
                        }
                    }else if(name == "increment"){
                        _options.increment = parseInt(getOption[name]);
                    }else if(name == "min"){
                        _options.min = parseInt(getOption[name]);
                    }else if(name == "max"){
                        _options.max = parseInt(getOption[name]);
                    }else{
                        if(getOption[name] == "true"){
                            _options[name] = true;
                        }else if(getOption[name] == "false"){
                            _options[name] = false;
                        }else{
                            _options[name] = getOption[name];
                        }
                        
                    }
                    
                }
            }

            if(funstyle != ""){
				if(funstyle == "getValue"){
					var fun = arguments[1];
					spi.trigger(getValue, fun);
				};
            }else{

            	// 方法事件绑定
            	spi.bind(getValue, function(e, fun){
					fun(val.val());
            	});

				sub.click(function(e){
					var c = parseInt(val.val());
					if(c > _options.min){
						c -= _options.increment;
						val.val(c);
                        val.attr("value", c);
                        _options.onChange(val.val());
					};
	            });

	            add.click(function(e){
					var c = parseInt(val.val());
					if(c < _options.max){
						c += _options.increment;
						val.val(c);
                        val.attr("value", c);
                        _options.onChange(val.val());
					};
	            });
            }; 
    	}
	});
})(jQuery);/*! Copyright (c) 2011 Brandon Aaron (http://brandonaaron.net)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Thanks to: http://adomas.org/javascript-mouse-wheel/ for some pointers.
 * Thanks to: Mathias Bank(http://www.mathias-bank.de) for a scope bug fix.
 * Thanks to: Seamus Leahy for adding deltaX and deltaY
 *
 * Version: 3.0.6
 * 
 * Requires: 1.2.2+
 */
 
(function($) {
 
var types = ['DOMMouseScroll', 'mousewheel'];
 
if ($.event.fixHooks) {
    for ( var i=types.length; i; ) {
        $.event.fixHooks[ types[--i] ] = $.event.mouseHooks;
    }
}
 
$.event.special.mousewheel = {
    setup: function() {
        if ( this.addEventListener ) {
            for ( var i=types.length; i; ) {
                this.addEventListener( types[--i], handler, false );
            }
        } else {
            this.onmousewheel = handler;
        }
    },
 
    teardown: function() {
        if ( this.removeEventListener ) {
            for ( var i=types.length; i; ) {
                this.removeEventListener( types[--i], handler, false );
            }
        } else {
            this.onmousewheel = null;
        }
    }
};
 
$.fn.extend({
    mousewheel: function(fn) {
        return fn ? this.bind("mousewheel", fn) : this.trigger("mousewheel");
    },
 
    unmousewheel: function(fn) {
        return this.unbind("mousewheel", fn);
    }
});
 
function handler(event) {
    var orgEvent = event || window.event, args = [].slice.call( arguments, 1 ), delta = 0, returnValue = true, deltaX = 0, deltaY = 0;
    event = $.event.fix(orgEvent);
    event.type = "mousewheel";
 
    // Old school scrollwheel delta
    if ( orgEvent.wheelDelta ) { delta = orgEvent.wheelDelta/120; }
    if ( orgEvent.detail     ) { delta = -orgEvent.detail/3; }
 
    // New school multidimensional scroll (touchpads) deltas
    deltaY = delta;
 
    // Gecko
    if ( orgEvent.axis !== undefined && orgEvent.axis === orgEvent.HORIZONTAL_AXIS ) {
        deltaY = 0;
        deltaX = -1*delta;
    }
 
    // Webkit
    if ( orgEvent.wheelDeltaY !== undefined ) { deltaY = orgEvent.wheelDeltaY/120; }
    if ( orgEvent.wheelDeltaX !== undefined ) { deltaX = -1*orgEvent.wheelDeltaX/120; }
 
    // Add event and delta to the front of the arguments
    args.unshift(event, delta, deltaX, deltaY);
 
    return ($.event.dispatch || $.event.handle).apply(this, args);
}
 
})(jQuery);/*global andy,$*/
/**
 * 拖动模块
 */
(function (andy) {
    /***
     * 向外查找元素  (向外查找)
     * <br />一直查找到document节点，如果没有设置value，则直接返回该节点， 否则与value值进行比较
     * @param {element} el 指定元素
     * @param {string} name 属性名
     * @param {string} value 属性值
     * @param {string} stopAttr 结束属性名
     * @param {string} notAttr 被排除的元素
     * @return {element} 查找的元素
     */
    andy.findOutElement = function (el, name, value, stopAttr, notAttr) {
        if (el) {
            var v, doc = el.ownerDocument;
            while (el && el !== doc) {
                if (el.getAttribute) {
                    if (stopAttr) {
                        v = el.getAttribute(stopAttr);
                        if (v === "" || v) {
                            return;
                        }
                    }
                    if (notAttr) {
                        v = el.getAttribute(notAttr);
                        if (v === "" || v) {
                            return;
                        }
                    }
                    v = el.getAttribute(name);
                    if (v === "" || v) {
                        if (value !== undefined) {
                            if (v.indexOf(value) > -1) {
                                return el;
                            }
                        } else {
                            return el;
                        }
                    }
                }
                el = el.parentNode;
            }
        }
    };

    //所有的拖动实例，实例的创建先后决定了事件的优先级
    var drags = [],
    //用于标识drags中拖动实例计数，方便管理
        dragCount = 0, currentDrag,
        dragStart = false,
        pos = {}, posing = {},
        lockTime = new Date(),
        doDragBefore;

    //增加样式，控制禁止选中文字
    var fixUserSelect = function (rootElement) {
        rootElement.className = rootElement.className + " u-global-drag";
    };
    var restoreUserSelect = function (rootElement) {
        rootElement.className = rootElement.className.replace(" u-global-drag", "");
    };
    var mouseDown = function (event) {
        var i;
        if (!dragStart && drags.length > 0) {
            for (i = drags.length - 1; i >= 0; i--) {
                dragStart = andy.arrayFunCall(drags[i].onDragCheck, {event: event, data: drags[i].data});
                if (dragStart) {
                    currentDrag = drags[i];
                    break;
                }
            }
            if (dragStart) {
                fixUserSelect(currentDrag.element || document.body);
                pos.x = posing.x = event.clientX;
                pos.y = posing.y = event.clientY;
                if (event.stopPropagation) {
                    event.stopPropagation();
                } else {
                    event.cancelBubble = true;
                }
            }
        }
    };
    var mouseMove = function (event) {
        var i, isTrue, offset = {};
        if (drags.length > 0) {
            if (dragStart && currentDrag) {
                var time = new Date() - lockTime;
                if (time > currentDrag.restrictedMoveTime) {//减少调用次数，防止卡死IE6-8
                    lockTime = time;
                    if (doDragBefore === undefined) {
                        doDragBefore = true;
                        if (currentDrag.onDragBefore.length > 0) {
                            doDragBefore = andy.arrayFunCall(currentDrag.onDragBefore, [event]);
                        }
                    }
                    //fixUserSelect(currentDrag);
                    offset.x = event.clientX - posing.x;
                    offset.y = event.clientY - posing.y;

                    posing.x = event.clientX;
                    posing.y = event.clientY;

                    if (doDragBefore) {
                        //有拖动区域限制
                        if (currentDrag.lockRect) {
                            if (event.clientX > currentDrag.lockRect.x + currentDrag.lockRect.w) {
                                offset.x = 0;
                                posing.x = currentDrag.lockRect.x + currentDrag.lockRect.w;
                            }
                            if (event.clientX < currentDrag.lockRect.x) {
                                offset.x = 0;
                                posing.x = currentDrag.lockRect.x;
                            }
                            if (event.clientY > currentDrag.lockRect.y + currentDrag.lockRect.h) {
                                offset.y = 0;
                                posing.y = currentDrag.lockRect.y + currentDrag.lockRect.h;
                            }
                            if (event.clientY < currentDrag.lockRect.y) {
                                offset.y = 0;
                                posing.x = currentDrag.lockRect.y;
                            }
                        }
                        if (currentDrag.lockX) {
                            offset.y = 0;
                        }
                        if (currentDrag.lockY) {
                            offset.x = 0;
                        }
                        //移动过程，移动偏移
                        andy.arrayFunCall(currentDrag.onDragOn, {
                            "offset": offset,
                            "data": currentDrag.data,
                            "event": event
                        });
                    }
                }
                return false;
            } else {
                for (i = drags.length - 1; i >= 0; i--) {
                    isTrue = andy.arrayFunCall(drags[i].onMoveCheck, {event: event, data: drags[i].data});
                    if (isTrue) {
                        break;
                    }
                }
            }
        }
    };
    var mouseUp = function (event) {
        if (dragStart && currentDrag) {
            //移动过程，移动偏移
            var r = andy.arrayFunCall(currentDrag.onDragEnd, {event: event, data: currentDrag.data});
            restoreUserSelect(currentDrag.element || document.body);
            dragStart = false;
            doDragBefore = undefined;
            currentDrag = undefined;
            return r;
        }
    };
    var bindEvent = function () {
        //andy.addGlobalEvent("mousedown", mouseDown);
        //andy.addGlobalEvent("mousemove", mouseMove);
        //andy.addGlobalEvent("mouseup", mouseUp);
        $(document).on("mousedown", mouseDown);
        $(document).on("mousemove", mouseMove);
        $(document).on("mouseup", mouseUp);
    };
    //元素被移除的时候要解除绑定，
    // 这个是使用的时候主动解绑，还是制定一个自动解绑机制？？？
    var unbindEvent = function () {
        //andy.removeGlobalEvent("mousedown", mouseDown);
        //andy.removeGlobalEvent("mousemove", mouseMove);
        //andy.removeGlobalEvent("mouseup", mouseUp);
        $(document).off("mousedown", mouseDown);
        $(document).off("mousemove", mouseMove);
        $(document).off("mouseup", mouseUp);
    };


    /**
     *  初始化一个拖动机制
     * @param options
     * @returns {{}}
     */
    andy.drag = function (options) {
        var defaults = {
            lockX: false,
            lockY: false,
            lockRect: undefined,//{x:0,y:0,w:0,h,0}

            restrictedMoveTime: 12,//拖动时间限定，提高性能
            //eventRegion: window.top,//事件绑定域，指定一个元素默认为全局事件
            data: {},//回调的参数
            onMoveCheck: [],//移动到触发元素上回调，例如移动上触发元素显示特殊的鼠标
            onDragCheck: [],//拖动前检查,检查是否启动拖动，对拖动区域，拖动对象进行判断
            onDragBefore: [],//拖动前回调，例如创建影子，创建拖动框
            onDragOn: [],//拖动中的回调，
            onDragBeforeEnd: [],//结束之前的回调
            onDragEnd: []//结束的回调
            // delay: 0,//延时，
            //scroll: true,考虑拖动时候关联滚动条，以后完善
        };
        var that = {};
        var args = andy.extend(defaults, options);

        //添加事件回调
        that.addEventCall = function (funcName, func) {
            if (args[funcName]) {
                args[funcName].push(func);
            }
        };
        //获取参数
        that.getData = function () {
            return args.data;
        };
        //销毁
        that.destroy = function () {
            drags.splice(args.dragIndex, 1);
            if (drags.length === 0) {
                unbindEvent();
            }
        };
        if (drags.length === 0) {
            bindEvent();
        }
        args.dragIndex = dragCount;
        dragCount++;
        drags.push(args);
        return that;
    };


    /*************一下为元素拖动**********************************************************************/
    //为指定元素绑定拖动属性 andyDrag=true;
    var bindDragEvent = function (el) {
        if (typeof el === "string") {
            //TODO 查找该元素
        }
        if (typeof el === "object") {
            el.setAttribute("andyDrag", "true");
        }
    };
    //通过page扫描来调用，这里传递字符串，还是dom呢？
    var scan = function () {
        //TODO 把元素上的data 属性都获取到
        //如果没有只是
        //创建对象
    };

    andy.dragElement = function (options) {
        var that, args, dragEl, copyEl, maxLeft, maxTop;
        var posCheck = function (argu, el) {
            el = el || andy.findOutElement(argu.event.target, args.dragName, "true", undefined, args.notDragEl);
            if (el) {
                //el.style.cursor = "move";
                return true;
            }
            return false;
        };
        var dragCheck = function (argu) {
            var el = andy.findOutElement(argu.event.target, args.dragName, "true", undefined, args.notDragEl);
            if (el && posCheck(argu, el)) {
                dragEl = el;
                return true;
            } else {
                dragEl = undefined;
                return false;
            }
        };
        var dragBefore = function (e) {
            if (args.dragHelp) {
                //TODO 创建拖动操作辅助框，
                //moveRect = window.top.$('<div dialogMoveRect="true" style="border: 1px dashed dodgerblue; position: absolute; "></div>');
                //moveRect.css("left", wMain.offset().left);
                //moveRect.css("top", wMain.offset().top);
                //moveRect.css("z-index", DIALOGZ + root.winIndex * 4 + 3);
                //moveRect.width(wMain.outerWidth());
                //moveRect.height(wMain.outerHeight());
            } else if (args.dragCopyEl) {
                //TODO 创建拷贝元素拖动
                copyEl = dragEl.cloneNode(true);
                copyEl.style.position = "absolute";
                copyEl.style.left = dragEl.offsetLeft + "px";
                copyEl.style.top = dragEl.offsetTop + "px";
                dragEl.parentNode.appendChild(copyEl);
            }
            return args.onDragBeforeElement(dragEl, e, copyEl) && true;
        };
        var dragOn = function (argu) {
            var fixPos, parentW, parentH, setPos, left, top;
            setPos = function (el) {
                left = el.offsetLeft - parseInt($(el).css("margin-left"), 10) + argu.offset.x;
                top = el.offsetTop - parseInt($(el).css("margin-top"), 10) + argu.offset.y;

                if (args.lockInParent) {
                    parentW = el.parentNode.offsetWidth;
                    parentH = el.parentNode.offsetHeight;
                    fixPos(el);
                }
                argu.left = left;
                argu.top = top;
                el.style.left = left + "px";
                el.style.top = top + "px";
            };

            fixPos = function (el) {
                var marginleft = parseInt($(el).css("margin-left"), 10),
                //marginright = parseInt($(el).css("margin-right"), 10),
                    margintop = parseInt($(el).css("margin-top"), 10);

                if (maxLeft === undefined) {
                    //为什么需要减两次
                    maxLeft = parentW - $(el).outerWidth() - marginleft - marginleft;
                }
                if (maxTop === undefined) {
                    //为什么需要减两次
                    maxTop = parentH - $(el).outerHeight() - margintop;
                }

                left = left < 0 ? 0 : left;
                left = left > maxLeft ? maxLeft : left;

                top = top < 0 ? 0 : top;
                top = top > maxTop ? maxTop : top;
            };

            if (args.dragSelf) {
                if (dragEl.getAttribute("lockx") === "true") {
                    argu.offset.y = 0;
                }
                if (dragEl.getAttribute("locky") === "true") {
                    argu.offset.x = 0;
                }
                setPos(dragEl);
            }
            //拖动拷贝元素
            if (copyEl) {
                setPos(copyEl);
            }

            return args.onDragElement(dragEl, argu, copyEl);
            // return args.onDragBeforeElement(dragEl, e, copyEl) && true;
            //TODO 区域判断
            //moveRect.css("left", moveRect.offset().left + offset.x * coe[0]);
            //moveRect.css("top", moveRect.offset().top + offset.y * coe[1]);
        };
        var dragEnd = function (argu) {
            //moveRect.remove();
            args.onDragEndElement(dragEl, argu, copyEl);
            if (copyEl && copyEl.parentNode) {
                copyEl.parentNode.removeChild(copyEl);
            }
            dragEl = undefined;
            maxLeft = undefined;
            maxTop = undefined;
            return false;
        };
        var defaults = {
            element: document.body,
            lockInParent: true,//如果有父元素，只能在父元素所在区域拖动
            dragSelf: true,//拖动自己
            dragHelp: false,//用辅助拖动框
            dragCopyEl: false,//拖动拷贝元素
            dragName: "andyDrag",
            //notDragEl:"",//被排除的元素
            "onDragCheck": [dragCheck],
            "onMoveCheck": [posCheck],
            "onDragBefore": [dragBefore],
            "onDragOn": [dragOn],
            "onDragEnd": [dragEnd],
            posCheck: function () {
            },
            onDragElement: function () {
                return true;
            },
            onDragEndElement: function () {
                return true;
            },
            onDragBeforeElement: function () {
                return true;
            }
        };
        args = andy.extend(defaults, options);
        that = andy.drag(args);
        return that;
    };

    andy.dragElement();
}(andy));
/*global andy,$,template*/
/**
 * 多选排序盒子
 * 依赖于拖动模块,拖动比它先加载
 * 作者:陈晓莹
 */
(function (andy) {
    var htmlStr = '<div  class="multi-select-box" style="position:relative;width: 100%;height:100%">'
        + '{{each list as value i}}<span multiSelect="true" index="{{i+1}}" data-id="{{list[i].val||list[i].id||list[i].text}}" class="option-block" nametext="{{list[i].text||list[i].name}}" ><span class="indexnum">{{i+1}}.</span> {{list[i].text||list[i].name}}<i notdrag="true" class="iconfont"></i></span>{{/each}}'
        + '</div><input type="hidden" name="{{dataKey}}">';

    //修改索引
    var changeIndex = function (listBox) {
        var strArry = [];
        var multiSelectInput = listBox.next("input")[0] || listBox.find("input")[0];
        listBox.find("[multiselect]").each(function (index, el) {
            el.setAttribute("index", index + 1);
            $(el).find(".indexnum").html((index + 1) + ".");
            strArry.push(el.getAttribute("data-id"));
        });
        //修改input的值,
        if (multiSelectInput) {
            multiSelectInput.value = strArry.join(",");
        }
    };
    var exchange = function (a, b) {
        var n = a.next(), p = b.prev();
        if (n[0] === b[0]) {
            b.insertBefore(a);
        } else {
            b.insertBefore(n);
            a.insertAfter(p);
        }
    };
    //绑定拖动逻辑
    var dragBind = function () {
        var lineCount, allCount, mouseIndex, lastIndex, lastIndexX, lastIndexY, elIndex, boxChildren;

        if (andy.dragElement) {
            andy.dragElement({
                dragName: "multiSelect",
                dragCopyEl: true,
                dragSelf: false,
                notDragEl: "notdrag",
                onDragBeforeElement: function (dragEl, argu, copyEl) {
                    //将原来的元素谈化
                    dragEl.style.visibility = "hidden";
                    copyEl.style.opacity = 0.5;
                    copyEl.removeAttribute("multiselect");
                    allCount = $(dragEl.parentNode).find("[multiselect]").length;
                    lineCount = parseInt(dragEl.parentNode.offsetWidth / dragEl.offsetWidth, 10);
                    elIndex = parseInt(dragEl.getAttribute("index"), 10);
                    boxChildren = $(dragEl).parent().children();

                    return true;
                },
                onDragElement: function (dragEl, argu, copyEl) {
                    var i = 0, point, index, el;
                    //区域覆盖判断
                    //中心点在 smodule 内

                    for (i; i < boxChildren.length - 1; i++) {
                        point = {};
                        index = i;
                        el = boxChildren[i];
                        point.x = (el.offsetLeft + el.offsetLeft + el.offsetWidth) / 2;
                        point.y = (el.offsetTop + el.offsetTop + el.offsetHeight) / 2;
                        if (el.className === "") {
                            return;
                        }
                        if (point.x > copyEl.offsetLeft && point.x < copyEl.offsetLeft + copyEl.offsetWidth) {
                            if (point.y > copyEl.offsetTop && point.y < copyEl.offsetTop + copyEl.offsetHeight) {
                                mouseIndex = index + 1;
                                if (( !lastIndex && mouseIndex !== elIndex) || (lastIndex && lastIndex !== mouseIndex)) {
                                    lastIndex = mouseIndex;
                                    exchange($(el), $(dragEl));
                                    break;
                                }
                            }
                        }
                    }



                    //var indexX, indexY, elIndex;
                    ////判断偏移和元素宽度倍数关系
                    //indexX = Math.round(copyEl.offsetLeft / dragEl.offsetWidth);
                    //indexY = parseInt(copyEl.offsetTop / dragEl.offsetHeight, 10);
                    //if (lastIndexX === undefined) {
                    //    lastIndexX = indexX;
                    //    lastIndexY = indexY;
                    //}
                    //mouseIndex = (indexY * lineCount + indexX) + 1;
                    //elIndex = parseInt(dragEl.getAttribute("index"), 10);
                    //if (elIndex !== mouseIndex) {
                    //    if (lastIndex === undefined) {
                    //        lastIndex = mouseIndex;
                    //    }
                    //    //把被拖动元素插入位置
                    //    //逻辑，往前移和往上移都是在之前插入
                    //    if (mouseIndex >= allCount) {
                    //        if (elIndex !== allCount) {
                    //            $(dragEl).insertAfter($(dragEl).parent().find("[index=" + allCount + "]"));
                    //        }
                    //    } else {
                    //        if (lastIndexX - indexX > 0 || lastIndexY - indexY > 0) {
                    //            $(dragEl).insertBefore($(dragEl).parent().find("[index=" + mouseIndex + "]"));
                    //        } else {
                    //            $(dragEl).insertAfter($(dragEl).parent().find("[index=" + mouseIndex + "]"));
                    //        }
                    //    }
                    //}
                    //if (lastIndex !== mouseIndex && elIndex === mouseIndex) {
                    //    $(dragEl).insertAfter($(dragEl).parent().find("[index=" + lastIndex + "]"));
                    //}
                },
                onDragEndElement: function (dragEl, argu, copyEl) {
                    lastIndexX = undefined;
                    lastIndexY = undefined;
                    lastIndex = undefined;
                    changeIndex($(dragEl).parent());
                    //$newEl.remove();
                    dragEl.style.visibility = "visible";
                }
            });
        } else {
            throw "需要在这之前加载拖动drag.js";
        }
    };

    andy.multiSelect = function (data) {
        var that={}, parent = $(data.parent);
        var selectBox = parent.find(".multi-select-box");
        parent.css("z-index",1);
        if (selectBox.length > 0) {
            parent.empty();
        }
        if (data.list) {
            var render = template.compile(htmlStr);
            var str = render(data);
            parent.append(str);
            //parent.find(".multi-select-box").height("auto").css({
            //    width: parent.width()
            //});
            parent.find(".multi-select-box").addClass("f-clear");
        }

        changeIndex(parent);

        //绑定关闭按钮
        parent.find("i").mousedown(function (e) {
            var index, box = $(this).parent().parent();
            //执行删除回调
            if (data.onDelete) {
                //被删除的节点索引，数据节点
                index = parseInt($(this).parent().attr("index"), 10);
                data.onDelete(index);
            }
            $(this).parent().remove();
            changeIndex(box);

            //要重置高度？？
            parent.find(".multi-select-box").height("auto").css({
                width: parent.width(),
                height: parent.height() || 23
            });
        });

        // 删除事件处理
        var deleteEvent = function(element){
            var index, box = element.parent().parent();
            //执行删除回调
            if (data.onDelete) {
                //被删除的节点索引，数据节点
                index = parseInt(element.parent().attr("index"), 10);
                data.onDelete(index);
            }
            element.parent().remove();
            changeIndex(box);

            //要重置高度？？
            parent.find(".multi-select-box").height("auto").css({
                width: parent.width(),
                height: parent.height() || 23
            });
        }

        //设置是否可用
        that.setEnable = function(isEnable){
            if(!isEnable){
                parent.append("<div multiSelectMask style='position: absolute;width: 100%; height: auto;z-index: 2;background: #fff; opacity: 0.5; top: 0px;'></div>");
                parent.find('[multiSelectMask]').height(parent.height());
            }else{
                parent.find('[multiSelectMask]').remove();
            }
        };

        //添加一个数据
        that.addElement = function(element){
            data.list.push(element);
            var htmlStr='<span multiSelect="true" index="'+ data.list.length +'" data-id="'+(element.val||element.id||element.text)+'" class="option-block" nametext="'+(element.text||element.name)+'" ><span class="indexnum">'+ data.list.length +'.</span> '+(element.text||element.name)+'<i notdrag="true" class="iconfont"></i></span>';
            data.removeIndex?htmlStr='<span multiSelect="true" index="'+ data.list.length +'" data-id="'+(element.val||element.id||element.text)+'" class="option-block" nametext="'+(element.text||element.name)+'" >'+(element.text||element.name)+'<i notdrag="true" class="iconfont"></i></span>':null;
            parent.find(".multi-select-box").append(htmlStr);
            parent.find(".multi-select-box span:last i").unbind("click")
            parent.find(".multi-select-box span:last i").click(function(e){
                deleteEvent($(e.target))
            })
            changeIndex(parent);
            
        };
        //删除一个节点数据,因为数据情况比较多，可能是val,可能是id,
        that.deleteElement = function(element){
            for(var i in data.list){
                if(element.id == data.list[i].id){
                    data.list.splice(i,1);
                }
            }
            parent.find("[data-id="+element.id+"]").unbind("click").remove();
            changeIndex(parent);
        };
        // 清空所有结点
        that.emptyElement = function(){
            data.list = [];
            parent.find("[data-id]").unbind("click").remove();
            changeIndex(parent);
        }

        return that;
    };


    dragBind();

}(andy));/*related */
/**
 * 联动选择
 * author:林耘宇
 **/

 (function ($) {
    $.fn.extend({
    	an_related:function(){
    		var options = {};
            var funstyle = "";
            var arg = arguments[0];
            (typeof arg == "object")? options = arg:funstyle = arg;

            var _options = $.extend({
                relatedId:"",//联动器ID
                showUrl:"",//
                relatedSize:"",//xs sm md lg
                item:[],//默认数据组["01", "02", "03"]
                checked:[],//默认选中 注意 数据里面是id数列
                row:5,//默认限制5行
                inputName:"",
                isText:false,//是否以文本形式出现
                value:""//默认值
                // onClick:function(){}
            }, options);

            var as = $(this);
            var inValueInput = "";
            // 生成基本结构 没有结构的情况
            if(as.is("input")){
                var as_id = as.attr("id");
                as.removeAttr("id", "");
                as.removeAttr("an-related", "");
                if(!as_id){
                    as_id = "related_"+andy.getRandom(10000);
                }
                var as_style = "";
                if(as.attr("style")){
                    as_style = as.attr("style");
                    as.removeAttr("style", "");
                };
                if(as.attr("name")){
                    _options.inputName = as.attr("name");
                    as.removeAttr("name");    
                }
                if(as.attr("value")){
                    _options.value = as.attr("value");
                    as.removeAttr("value");
                }

                var as_class = "u-group "+_options.relatedSize;
                if(as.attr("class")){
                    as_class = as.attr("class");
                    as.attr("class", "");
                }
                
                var as_options = as.attr("options");
                as_options = "options = "+as_options;
                as.removeAttr("options");

                as.css("display", "none");
                // var subSpan = "<span class='u-but-group u-group-left'><i class='iconfont'></i><button class='u-but-button' type='button' sub></button></span>";
                // var addSpan = "<span class='u-but-group u-group-right'><i class='iconfont'></i><button class='u-but-button' type='button' add></button></span>";
                var valueInput = "<input type = 'hidden' name = '"+_options.inputName+"' value='"+_options.value+"' val>";
                var div = "<div class='"+as_class+"' id = '"+as_id+"' style = '"+as_style+"' "+as_options+" an-related>"+valueInput+"</div>";
                as.before(div);
                as.remove();
                as = $("#"+as_id);
                andy.layout(as.parent());
            }

            // 给combo生成id
            if(_options.relatedId == ""){
                _options.relatedId = as.attr("id");
            }
            if(_options.relatedId == undefined){
                _options.relatedId = "as_"+andy.getRandom(10000);
                as.attr("id", _options.relatedId);
            }
            as = $("#"+_options.relatedId);

            as.find("input").each(function(index, input){
                var $input = $(input);
                if($input.attr("type") == "hidden"){
                    inValueInput = $input;
                    _options.inputName = $input.attr("name");
                }
            })

            // 获取 设置对象
            var getOption = as.attr("options");

            if(getOption){
                 getOption = "{"+ getOption+"}";
                 getOption = andy.stringToJson(getOption);
                // 处理设置
                for(var name in getOption){
                    if(name == "item"){
                        var data = getOption[name].split(",");
                        _options.item = data;
                    }else if(name == "checked"){
                        var data = getOption[name].split(",");
                        _options.checked = data;
                    }else{
                        _options[name] = getOption[name];
                    }
                    
                }
            };

            var itemLength = _options.item.length;
            var inputString = "";
            if(itemLength > 0){
                if(as.find("input").length < itemLength){
                    for(var i = 0; i < itemLength; i++){
                        // 最后除2 是 避免滚动条 整体布局 重新计算了宽度的
                        var itemWidth = Math.floor(as.innerWidth()/itemLength)/2;//向下取整
                        var itemClass = "item u-input nohover m-combo";
                        var itemIsEnable = true;
                        if(i == 0){
                            itemClass = "item item-l u-input nohover m-combo";
                        }else if(i == itemLength  - 1){
                            itemClass = "item item-r u-input nohover m-combo";
                        }
                        if(i > 0 && _options.checked.length == 0){
                            itemIsEnable = false;
                        }
                        var thisOptions = "options = defaultValue:'"+_options.item[i]+"',isEnable:'"+itemIsEnable+"',row:'"+_options.row+"',isText:'"+_options.isText+"'";
                        inputString += "<input class = '"+itemClass+"' style = 'width:"+itemWidth+"px' name = 'input_name' "+thisOptions+">";
                    }

                    as.prepend(inputString);
                }
            }

            // 私有事件
            var getValue = "EVENT_VALUE";
            if(funstyle != ""){
				if(funstyle == "getValue"){
					var fun = arguments[1];
					as.trigger(getValue, fun);
				};
            }else{
                var thisData = "";
                var inValueInput = "";
                var itemLength = 0;
                as.find("input").each(function(i, input){
                    var $input = $(input);
                    if($input.attr("type") == "hidden"){
                        inValueInput = $input;
                    }
                })
                var getDataById = function(id, data){
                    for(var i = 0;i < data.length; i ++){
                        if(data[i].id == id){
                            thisData = data[i].children;
                        }else if(data[i].children){
                            getDataById(id, data[i].children);
                        }
                    }
                    if(thisData != ""){
                        return thisData;
                    }
                }

                var setDataById = function(id, data, inData){
                    for(var i = 0;i < data.length; i ++){
                        if(data[i].id == id){
                            data[i].children = inData;
                        }else if(data[i].children){
                            setDataById(id, data[i].children, inData);
                        }
                    }
                }

                var createNewList = function(data, nextcombo){
                    // console.log(nextcombo.find("ul"))
                    var showTarget = nextcombo.find("ul");
                    showTarget.empty();
                    for(var i = 0; i < data.length; i++){
                        var liData = data[i];
                        var isFist = "";
                        if(i == 0){
                            isFist = "first";
                        }
                        var li = "<li class = '"+isFist+"' value = '"+liData.value+"' listId = '"+liData.id+"' ><a>"+liData.name+"</a></li>";
                        showTarget.append(li);
                    }
                    return showTarget;
                }

                var setValueInput = function(li, index){
                    var idValue = inValueInput.attr("idValue");
                    var valueData = inValueInput.attr("valueData");
                    if(!idValue){
                        var str = " ";
                        for(var i = 0; i< itemLength - 1; i++){
                            str += ", "
                        }
                        inValueInput.attr("idValue", str);
                        idValue = inValueInput.attr("idValue");
                    }
                    var arrId = idValue.split(",");
                    arrId[index] = li.attr("listid");
                    for(var i = 0; i < arrId.length; i++){
                        if(i > index){
                            arrId[i] = null;
                        }
                    }
                    inValueInput.attr("idValue", arrId);
                    if(!valueData){
                        var str = " ";
                        for(var i = 0; i< itemLength - 1; i++){
                            str += ", "
                        }
                        inValueInput.attr("valueData", str);
                        valueData = inValueInput.attr("valueData");
                    }
                    var arrValue = valueData.split(",");
                    // con
                    arrValue[index] = li.attr("value");
                    for(var i = 0; i < arrValue.length; i++){
                        if(i > index){
                            arrValue[i] = null;
                        }
                    }
                    inValueInput.attr("valueData", arrValue);
                }

                var resetChildren = function(i, idList){
                    for(var comboIndex = i+1; comboIndex < idList.length; comboIndex++){
                        var dcombo = $("#"+idList[comboIndex]);
                        dcombo.an_combo("setDefault");
                        dcombo.an_combo("isEnable", false);
                    }
                    
                }

                andy.loaddata(_options.showUrl, function(data){
                    // console.log(data)
                    var listData = data;
                    // combo初始化
                    as.find("input").each(function(i, inputList){
                        var $inputList = $(inputList);
                        if($inputList.attr("type") != "hidden"){
                            var url = ""
                            itemLength += 1;
                            if(i == 0){
                                url = _options.showUrl;
                            }
                            if(_options.checked.length >0){
                                // 初始化选择
                                var chooseData = [];
                                if(i == 0){
                                    chooseData = listData;
                                }else{
                                    chooseData = getDataById(_options.checked[i - 1], listData);
                                }
                                if(chooseData){
                                    $inputList.an_combo({
                                        row:_options.row,
                                        checked:[_options.checked[i]],
                                        showData:chooseData
                                    })
                                    if(inValueInput){
                                        var idArr = inValueInput.attr("idValue")
                                        if(!idArr){
                                            var str = " ";
                                            for(var i = 0; i< itemLength - 1; i++){
                                                str += ", "
                                            }
                                            inValueInput.attr("idValue", str);
                                            idArr = inValueInput.attr("idValue");
                                            inValueInput.attr("valueData", str);
                                        }
                                        idArr = idArr.split(",");
                                        var valueArr = inValueInput.attr("valueData").split(",");
                                        idArr[i] = _options.checked[i];
                                        var getArrValue = function(){
                                            var id = _options.checked[i];
                                            var idV = "";
                                            for(var index = 0; index < chooseData.length; index++){
                                                var cd = chooseData[index];
                                                if(id == cd.id){
                                                    idV = cd.value;
                                                }
                                            }
                                            return idV;
                                        }
                                        valueArr[i] = getArrValue();
                                        inValueInput.attr("idValue", idArr);
                                        inValueInput.attr("valueData", valueArr);
                                    }
                                }
                            }else{
                                $inputList.an_combo({
                                    row:_options.row,
                                    showUrl:url
                                })
                            }
                            
                        }
                    })
                    var idList = [];
                    as.find("[an-combo = an-combo]").each(function(i, combo){
                        var comboId = $(combo).attr("id");
                        var $combo = $("#"+comboId);
                        andy.inputLayout($combo);
                        idList.push(comboId);
                        $combo.bind(andy.COMBO_CHOOSE_LISET, function(e, li){
                            setValueInput($(li), i);
                            if(idList[i+1]){
                                var nextCombo = $("#"+idList[i+1]);
                                // var liId = parseInt($(li).attr("listId"));
                                var liId = $(li).attr("listId");
                                var childrenData = getDataById(liId, listData);
                                thisData = "";
                                // 判断children数据
                                // console.log(childrenData)
                                if(typeof(childrenData) == "object"){
                                    if(childrenData.length == 0){
                                        resetChildren(i, idList);
                                        return false;
                                    }
                                    var newList = createNewList(childrenData, nextCombo).clone();
                                    // 重置当前combo 之后的combo
                                    for(var comboIndex = i+1; comboIndex < idList.length; comboIndex++){
                                        var dcombo = $("#"+idList[comboIndex]);
                                        dcombo.an_combo("setDefault");
                                    }
                                    nextCombo.an_combo("setShowTarget", newList);
                                    nextCombo.an_combo("isEnable", true);
                                }else if(typeof(childrenData) == "string"){
                                    andy.loaddata(childrenData, function(thisNextData, statusData){
                                        // console.log(i)
                                        if(!thisNextData || thisNextData.length == 0){
                                            resetChildren(i, idList);
                                            return false;
                                        }
                                        setDataById(liId, listData, thisNextData);
                                        var newList = createNewList(thisNextData, nextCombo).clone();
                                        // // 重置当前combo 之后的combo
                                        for(var comboIndex = i+1; comboIndex < idList.length; comboIndex++){
                                            var dcombo = $("#"+idList[comboIndex]);
                                            dcombo.an_combo("setDefault");
                                        }
                                        nextCombo.an_combo("setShowTarget", newList);
                                        nextCombo.an_combo("isEnable", true);
                                    })
                                }else if(!childrenData){
                                    resetChildren(i, idList);
                                }
                                
                            }
                            
                        })
                    })
                })
            }; 
    	}
	});
})(jQuery);
(function (window) {
	var module = {}

	//关闭提示方法	
    module.an_alertclose= function(itemindex,itemcallback,itemdelaytime){
		itemindex.click(itemcallback);
        itemindex.mouseenter(function(e) {
            $(this).attr('lock',true);
			$(this).removeClass('fadeInDown');
			$(this).addClass('pulse');
        });
				
		itemindex.mouseout(function(e) {
			$(this).removeAttr('lock');
			$(this).removeClass('pulse');
			setTimeout(function(){
			if(itemindex.attr('lock')==undefined){
			itemindex.addClass('zoomOut');
			setTimeout(function(){itemindex.remove()},250);
			}
			},itemdelaytime);
			
			})
        setTimeout(function(){
			if(itemindex.attr('lock')==undefined){
			itemindex.addClass('zoomOut');
			setTimeout(function(){itemindex.remove()},250);
			}
		},itemdelaytime);
	}// JavaScript Document

	//打印提示方法
	module.an_alertitem =function(target,boxindex,al_content,al_style,al_callback,al_type,al_delaytime, _options){
		if(target=='top'){
			window.top.$('body').find('.alertnew').removeClass('alertnew');
			}else{
				$('body').find('.alertnew').removeClass('alertnew');
				}
		if(al_type=='message'){
			var item_icon='<i class="iconfont"></i> '
			}
		else if(al_type=='emial'){
			var item_icon='<i class="iconfont"></i> '
			}
		else {
			var item_icon='<img src="'+al_type+'" class="f-r-o f-left">'
			}
		boxindex.prepend("<div class='alert f-clear "+al_style+" f-m-b-xs animated fadeInDown alertnew' id = "+_options.id+" >"+item_icon+al_content+"</div>");
		if(target=='top'){				
			window.top.$('body').find('.alertnew').each(function() {
				var _this=$(this);
				andy.an_alertclose(_this,al_callback,al_delaytime);
               });
			
		}else{
		   $('body').find('.alertnew').each(function() {
		   var _this=$(this);
			andy.an_alertclose(_this,al_callback,al_delaytime);
           });
				
		}
	}
	//简易全局消息提示插件
	module.an_alert = function(options){
		var defaults = {
			id:"",
            type:'message',// message提示消息|emial系统信息|interflow交流
			style:'alert-black',//alert-success、alert-info、alert-warning、alert-danger、alert-default、alert-black
			content:'提示内容',//提示内容
//			url:'',//链接地址
//			urltarget:'self',//top,self链接的目标
			target:'top',//目标位置 top,self
			position:'t-m',//出现方向 t-m t-r b-r
			audio:'',//播放声音，仅支持高级浏览器
			callback:function(){},
			delaytime:5000//自动消失的时间
		}
		
        var _options = $.extend(defaults, options);
		
		if(_options.audio!=undefined && _options.audio!=''){
			window.top.$('body').append("<audio id='audio' src='"+_options.audio+"' autoplay></audio>");
			setTimeout(function(){window.top.$('body').find('#audio').remove()},1000);
			}
		
		if(_options.target=='top'){
			if(window.top.$('body').find('.'+_options.position).length==0){
				window.top.$('body').append("<div class='m-alertbox "+_options.position+"'></div>");
				var boxindex=window.top.$('body').find('.'+_options.position);
				andy.an_alertitem(_options.target,boxindex,_options.content,_options.style,_options.callback,_options.type,_options.delaytime, _options)
				}else{
				var boxindex=window.top.$('body').find('.'+_options.position);
				andy.an_alertitem(_options.target,boxindex,_options.content,_options.style,_options.callback,_options.type,_options.delaytime, _options)
			}
		}
		if(_options.target=='self'){
			if($('body').find('.'+_options.position).length==0){
				$('body').append("<div class='m-alertbox "+_options.position+"'></div>");
				var boxindex=$('body').find('.'+_options.position);
				andy.an_alertitem(_options.target,boxindex,_options.content,_options.style,_options.callback,_options.type,_options.delaytime, _options)
				}else{
				var boxindex=$('body').find('.'+_options.position);
				andy.an_alertitem(_options.target,boxindex,_options.content,_options.style,_options.callback,_options.type,_options.delaytime, _options)
			}
		}
	}
	
	

    $.extend(window.andy, module);
	// window.andy = module;
})(window);(function($){
	
    function createRadioBox($div,This,options){
        var initChecks = function(){
            if(options.data){
            	var valueField=options.valueField || 'value';
            	var textField=options.textField || 'text';
            	var itemWidth=options.itemWidth || '';
            	if (itemWidth!='') {
            		itemWidth="width:"+itemWidth;
    			}
            	var nameAttr=This.attr("name");
            	var editable='';
            	if (options.editable) {editable="disabled='disabled'";}
                $.each(options.data,function(index,item){
                	if (index==0) {
                		if(!options.checked){
                            This.attr("value", item[valueField])
                        }
                		$div.append('<label class="u-checkbox" style="'+itemWidth+'" ><input name="'+nameAttr+'_radio" type="radio" '+editable+' value="'+item[valueField]+'" checked="checked" >'+item[textField]+'</label>');
    				}else {
    					$div.append('<label class="u-checkbox" style="'+itemWidth+'" ><input name="'+nameAttr+'_radio" type="radio" '+editable+' value="'+item[valueField]+'" >'+item[textField]+'</label>');
    				}
                });
                registerEvent($div,This,options);
                if(options.checked){
                    This.an_checkbox("setValue", options.checked)
                }
            }    
        }

        if(options.url){
            andy.loaddata(options.url, function(data){
                options.data = data;
                initChecks();
            })
        }

        initChecks()
    }

    function registerEvent($div,This,options){
    	$div.find("input").on('click',function(){
            This.val(This.an_radiobox("getValue"));
            if(options.onclick){
                options.onclick(This)
            }
        });
    }

    function setValueToInput(This, value){
        This.attr("value", value)
    }

    $.fn.an_radiobox = function(options, param){
        if (typeof options == 'string'){
            var method = $.fn.an_radiobox.methods[options];
            if (method){
                return method(this.next(), param);
            }
        }else {
            // 获取 设置对象
            var getOption = this.attr("options");
            var getValueElement = "";
            if(getOption){
                 getOption = "{"+ getOption+"}";
                 getOption = andy.stringToJson(getOption);
                // 处理设置
                for(var name in getOption){
                    if(name == "checked"){
                        //入值隐藏input
                        setValueToInput(this, getOption[name])
                        options.checked = getOption[name];
                    }else{
                        options[name] = getOption[name];
                    }
                }
            }
        	var width = options.width||this.width();
            var height = options.height||this.height();
            var $div = $("<div class='u-input-span' ></div>");
            $div.width(width);
            $div.height(height);
            this.hide();
        	this.after($div);
        	options = options || {};
            createRadioBox($div,this,options);   
		}
    };
    
    $.fn.an_radiobox.methods={
        getValue:function(me,para){
        	var checked = me.find('input:checked');
        	var val ="";
			if (checked.length)
				val= checked[0].value;
			return val;
        },
        setValue:function(me,para){
        	me.find("input").each(function(index,item){
                if(para == $(item).attr('value')){
                    if($(item).prop('checked')!=true){         
                         $(item).prop('checked',true);
                    }
                }
            });
        }
    };
})(jQuery);(function($){
    function createCheckbox($div,This,options){
        var checkIsHave = function(id){
            var have = false;
            for(var i = 0;i < options.checked.length; i++){
                if (options.checked[i]==id) {
                    have = true;
                }
            }
            return have;
        }
        var initChecks = function(){
            if(options.data){
                var valueField=options.valueField || 'value';
                var textField=options.textField || 'text';
                var itemWidth=options.itemWidth || '';
                if (itemWidth!='') {
                    itemWidth="width:"+itemWidth;
                }
                var nameAttr=This.attr("name");
                var editable='';
                if (options.editable) {editable="disabled='disabled'";}
                $.each(options.data,function(index,item){
                    if (checkIsHave(item["id"])) {
                        if(!options.checked){
                            This.attr("value", item[valueField])
                        }
                        
                        $div.append('<label class="u-checkbox" style="'+itemWidth+'" ><input name="'+nameAttr+'_checkbox" type="checkbox" '+editable+' value="'+item[valueField]+'" checked="checked" >'+item[textField]+'</label>');
                    }else {
                        $div.append('<label class="u-checkbox" style="'+itemWidth+'" ><input name="'+nameAttr+'_checkbox" type="checkbox" '+editable+' value="'+item[valueField]+'" >'+item[textField]+'</label>');
                    }
                    
                });
                registerEvent($div,This);
                if(options.checked){
                    for(var i = 0; i < options.checked.length; i++){
                        This.an_checkbox("setValue", options.checked[i])
                    }
                }
            }  

        }

        if(options.url){
            andy.loaddata(options.url, function(data){
                options.data = data;
                initChecks();
            })
        }

        initChecks()
    }

    function registerEvent($div,This){
    	$div.find("input").on('click',function(){
            This.val(This.an_checkbox("getValue"));
        });
    }

    function setValueToInput(This, value){
        This.attr("value", value)
    }

    $.fn.an_checkbox = function(options, param){
        if (typeof options == 'string'){
            var method = $.fn.an_checkbox.methods[options];
            if (method){
                return method(this.next(), param);
            }
        }else {
            // 获取 设置对象
            var getOption = this.attr("options");
            var getValueElement = "";
            if(getOption){
                 getOption = "{"+ getOption+"}";
                 getOption = andy.stringToJson(getOption);
                // 处理设置
                for(var name in getOption){
                    if(name == "checked"){
                        //入值隐藏input
                        setValueToInput(this, getOption[name])
                        var data = getOption[name].split(",");
                        options.checked = data;
                    }else{
                        options[name] = getOption[name];
                    }
                }
            }else{
                if(options.checked){
                    setValueToInput(this, options.checked)
                }
            }
        	var width = options.width||this.width();
            var height = options.height||this.height();
            var $div = $("<div class='u-input-span' ></div>");
            $div.width(width);
            $div.height(height);
            this.hide();
        	this.after($div);
        	options = options || {};
            createCheckbox($div,this,options);   

		}
    };
    
    $.fn.an_checkbox.methods={
        getValue:function(me,para){
            var values=new Array();
            var str = "";
            me.find("input").each(function(index,item){   
                if($(item).prop('checked')==true){   
                    values.push($(item).prop('value'));
                }
            });
            str = values.join(",");

            return str; 
        },
        setValue:function(me,para){
        	me.find("input").each(function(index,item){
                if(para == $(item).attr('value')){
                    if($(item).prop('checked')!=true){         
                    	 $(item).prop('checked',true);
                    }
                }
            });
        }
    };
})(jQuery);/*!
 * rippler v0.1.1
 * http://blivesta.github.io/rippler/
 * Licensed under MIT
 * Author : blivesta
 * http://blivesta.com/
 */
(function($) {
  "use strict";
  var namespace = "rippler";
  var methods = {
    init: function(options) {
      options = $.extend({
        effectClass: "rippler-effect",
        effectSize: 16,
        addElement: "div",
        duration: 600
      }, options);
      return this.each(function() {
        var _this = this;
        var $this = $(this);
        var data = $this.data(namespace);
        if (!data) {
          options = $.extend({}, options);
          $this.data(namespace, {
            options: options
          });
          if (typeof document.ontouchstart != "undefined") {
            $this.on("touchstart." + namespace, function(event) {
              var $self = $(this);
              methods.elementAdd.call(_this, $self, event);
            });
            $this.on("touchend." + namespace, function(event) {
              var $self = $(this);
              methods.effect.call(_this, $self, event);
            });
          } else {
            $this.on("mousedown." + namespace, function(event) {
              var $self = $(this);
              methods.elementAdd.call(_this, $self, event);
            });
            $this.on("mouseup." + namespace, function(event) {
              var $self = $(this);
              methods.effect.call(_this, $self, event);
            });
          }
        }
      });
    },
    template: function(options) {
      var $this = $(this);
      options = $this.data(namespace).options;
      var element;
      var svgElementClass = "rippler-svg";
      var divElementClass = "rippler-div";
      var circle = '<circle cx="' + options.effectSize + '" cy="' + options.effectSize + '" r="' + options.effectSize / 2 + '">';
      var svgElement = '<svg class="' + options.effectClass + " " + svgElementClass + '" xmlns="http://www.w3.org/2000/svg" viewBox="' + options.effectSize / 2 + " " + options.effectSize / 2 + " " + options.effectSize + " " + options.effectSize + '">' + circle + "</svg>";
      var divElement = '<div class="' + options.effectClass + " " + divElementClass + '"></div>';
      if (options.addElement === "svg") {
        element = svgElement;
      } else {
        element = divElement;
      }
      return element;
    },
    elementAdd: function($self, event, options) {
      var _this = this;
      var $this = $(this);
      options = $this.data(namespace).options;
      $self.append(methods.template.call(_this));
      var $effect = $self.find("." + options.effectClass);
      var selfOffset = $self.offset();
      var eventX = methods.targetX.call(_this, event);
      var eventY = methods.targetY.call(_this, event);
      $effect.css({
        width: options.effectSize,
        height: options.effectSize,
        left: eventX - selfOffset.left - options.effectSize / 2,
        top: eventY - selfOffset.top - options.effectSize / 2
      });
      return _this;
    },
    effect: function($self, event, options) {
      var _this = this;
      var $this = $(this);
      options = $this.data(namespace).options;
      var $effect = $("." + options.effectClass);
      var selfOffset = $self.offset();
      var thisW = $this.outerWidth();
      var thisH = $this.outerHeight();
      var effectMaxWidth = methods.diagonal(thisW, thisH) * 2;
      var eventX = methods.targetX.call(_this, event);
      var eventY = methods.targetY.call(_this, event);
      $effect.css({
        width: effectMaxWidth,
        height: effectMaxWidth,
        left: eventX - selfOffset.left - effectMaxWidth / 2,
        top: eventY - selfOffset.top - effectMaxWidth / 2,
        transition: "all " + options.duration / 1e3 + "s ease-out"
      });
      return methods.elementRemove.call(_this);
    },
    elementRemove: function(options) {
      var _this = this;
      var $this = $(this);
      options = $this.data(namespace).options;
      var $effect = $("." + options.effectClass);
      setTimeout(function() {
        $effect.css({
          opacity: 0,
          transition: "all " + options.duration / 1e3 + "s ease-out"
        });
        setTimeout(function() {
          $effect.remove();
        }, options.duration * 1.5);
      }, options.duration);
      return _this;
    },
    targetX: function(event) {
      var e = event.originalEvent;
      var eventX;
      if (typeof document.ontouchstart != "undefined") {
        eventX = e.changedTouches[0].pageX;
      } else {
        eventX = e.pageX;
      }
      return eventX;
    },
    targetY: function(event) {
      var e = event.originalEvent;
      var eventY;
      if (typeof document.ontouchstart != "undefined") {
        eventY = e.changedTouches[0].pageY;
      } else {
        eventY = e.pageY;
      }
      return eventY;
    },
    diagonal: function(x, y) {
      if (x > 0 && y > 0) return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)); else return false;
    },
    destroy: function() {
      return this.each(function() {
        var $this = $(this);
        $(window).unbind("." + namespace);
        $this.removeData(namespace);
      });
    }
  };
  $.fn.rippler = function(method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === "object" || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error("Method " + method + " does not exist on jQuery." + namespace);
    }
  };
})(jQuery);/*topnav */
/**
 * 菜单组件  顶部菜单top
 * author:林耘宇
 **/
(function ($) {
    $.fn.extend({
        an_topnav:function(){
            var options = {};
            var funstyle = "";
            var arg = arguments[0];
            (typeof arg == "object")? options = arg:funstyle = arg;
            var _options = $.extend({
                menuId:"",
                url:"",
                urlData:"",
                checked:"",
                maxLevel:99,//最高菜单级
                downMenu:true,//是否下拉菜单
                defaultShowDown:false,//默认展示下拉
                defaultIcon:"",//默认图标
                showEvent:"mouseover",//子菜单显示事件
                hideEvent:"mouseleave",//子菜单显示事件
                childrenDownIcon:"",//子节点箭头
                isFitParent:false,//是否根据父级固定宽度自适应
                childrenRightIcon:"",
                onMouseOver:function(){},
                onMouseEnter:function(){},
                onMouseOut:function(){},
                onClick:function(){}
            }, options);

            var menu = $(this);
            if(_options.menuId == ""){
                menu = andy.setRandomId(menu, "topnav_");
                _options.menuId = menu.attr("id");
            }
            // 获取 设置对象
            var getOption = menu.attr("options");
            var getValueElement = "";
            if(getOption){
                 getOption = "{"+ getOption+"}";
                 getOption = andy.stringToJson(getOption);
                // 处理设置
                for(var name in getOption){
                    if(getOption[name] == "true"){
                        _options[name] = true;
                    }else if(getOption[name] == "false"){
                        _options[name] = false;
                    }else{
                        _options[name] = getOption[name];
                    }
                }
            }
            _options.menu = menu;
            _options.resizeHanld = null;
            _options.level = 0;

            var checkedEvent = "EVENT_CHECKED";
            var onresize = "EVENT_ON_RESIZE";
            var clearCheckedEvent = "EVENT_CLEAR_CHECKED";

            if(funstyle != ""){
                if(funstyle == "checked"){
                    var arr = arguments[1];
                    var obj = {
                        arr:arr
                    }
                    _options.menu.trigger(checkedEvent, obj);
                }else if(funstyle == "onresize"){
                    _options.menu.trigger(onresize);
                }else if(funstyle == "clearChecked"){
                    _options.menu.trigger(clearCheckedEvent);
                };
            }else{

                var createUlHtml,createMainHtml,bindEvent;

                // 获取li标签
                var getLi = function(dom){
                    if(dom.is("li") == false){
                        dom = dom.parents("li").eq(0);
                    }
                    return dom;
                };

                // 获取li标签
                var getUl = function(dom){
                    if(dom.is("ul") == false){
                        dom = dom.parents("ul").first();
                    }
                    return dom;
                };

                // 隐藏 或者收缩"其他"
                var hideOther = function(thisli){
                    thisli.siblings().each(function(index, otherLi){
                        // $(otherLi).children("a").removeClass("active");
                        $(otherLi).find("ul").removeClass("show");
                    });
                }

                // 隐藏或收缩当前
                var hideThis = function(thisli){
                    // thisli.children("a").removeClass("active");
                    thisli.find("ul").removeClass("show");
                }

                // 去除所有选中效果
                var removeActive = function(){
                    _options.menu.find("a").removeClass("active");
                }

                // 去除同级选中效果
                var removeSiblingsActive = function(li){
                    li.parent().parent().siblings().find("a").removeClass("active");
                    li.parent().parent().find("a:first").addClass("active");
                    li.siblings().find("a").removeClass("active");
                }

                // 显示当前UL
                var showUl = function(thisli){
                    if(thisli.find("ul").length == 0 && thisli.data("children")){
                        thisli.append("<ul></ul>");
                        createUlHtml(thisli)
                        thisli.find("ul").addClass("show");
                    }else{
                        thisli.find("ul").eq(0).addClass("show");
                    }
                }

                bindEvent = function(li){
                    li.unbind(_options.showEvent);
                    li.click(function(e){
                        removeSiblingsActive(li)
                        _options.onClick(li)
                        li.children("a:first").addClass("active")
                        // 阻止冒泡 准许事件发生
                        e.stopPropagation()
                    })
                    li.mouseover(function(e){
                        _options.onMouseOver(li)
                        // 阻止冒泡 准许事件发生
                        e.stopPropagation()
                    })
                    li.mouseenter(function(e){
                        _options.onMouseEnter(li)
                        e.stopPropagation()
                     })
                    // if(_options.showEvent != "click"){
                        // li对象  children数据
                        // _options.onClick(li, li.data("children"))
                    // };
                    li.bind(_options.showEvent, function(e){
                        var thisli = getLi($(e.target));                        // 顶部菜单 一级出现active
                        // if(thisli.parents("ul").length == 1){
                            // thisli.children("a").addClass("active");//当前鼠标位置标识
                        // }
                        // 事件操作
                        // if(_options.showEvent == "click"){
                            // li对象  children数据
                            // _options.onClick(li, li.data("children"))
                        // };
                        if(_options.downMenu){
                            hideOther(thisli)
                            showUl(thisli)
                        }
                        
                    });
                }

                // 创建子节点
                createUlHtml = function(parent){
                    var data = parent.data("children");
                    var level = parent.parents("ul").length;
                    if(level > _options.maxLevel){
                        return false;
                    }
                    for(var k in data){
                        var li = data[k];
                        try{
                            var icon,url,target,str,active;
                            icon = "";
                            url = "javascript:;";
                            active = "";
                            if(li.icons){
                                var thisIcon = li.icons;
                                li.icons==""?thisIcon=_options.defaultIcon:null;
                                icon = "<i class='iconfont icon'>"+thisIcon+"</i>";
                            }else if(_options.defaultIcon != ""){
                                icon = "<i class='iconfont icon'>"+_options.defaultIcon+"</i>";
                            };
                            (li.url && li.url != "")?url=li.url:null;
                            li.target?target="target="+li.target:target="";
                            if(li.id==_options.checked[level]){
                                active="active";
                                // removeActive()
                            }
                            str = "<li id = "+li.id+"><a href="+url+" "+target+" class = '"+active+"'>"+icon+li.text+"</a></li>";

                            parent.find("ul").append(str);
                            // 子节点数据绑定
                            var $li = $("#"+li.id);
                            $li.data("json", li);
                            if(li.children && li.children.length > 0 && $li.length > 0){
                                $li.data("children", li.children);
                                $li.find("a").append("<i class='iconfont arrow'>"+_options.childrenRightIcon+"</i>");
                            }
                            bindEvent($li);
                        }catch(e){
                            alert(e)
                        }
                    }
                }

                // 创建主节点片段
                createMainHtml = function(data){
                    var allWidth = 0;
                    for(var k in data){
                        var li = data[k];
                        try{
                            var icon,url,target,str,active;
                            icon = "";
                            active = "";
                            url = "javascript:;";
                            if(li.icons){
                                var thisIcon = li.icons;
                                li.icons==""?thisIcon=_options.defaultIcon:null;
                                icon = "<i class='iconfont icon'>"+thisIcon+"</i>";
                            }else if(_options.defaultIcon != ""){
                                icon = "<i class='iconfont icon'>"+_options.defaultIcon+"</i>";
                            };
                            (li.url && li.url != "")?url=li.url:null;
                            li.target?target="target="+li.target:target="";
                            li.id==_options.checked[0]?active="active":null;
                            str = "<li id = "+li.id+"><a href="+url+" "+target+" class = '"+active+"'>"+icon+li.text+"</a></li>";
                            _options.menu.append(str);
                            // 子节点数据绑定
                            var $li = $("#"+li.id);
                            $li.data("json", li);
                            if(li.children && li.children.length > 0 && $li.length > 0){
                                $li.data("children", li.children);
                                if(_options.downMenu){
                                    $li.find("a").append("<i class='iconfont arrow'>"+_options.childrenDownIcon+"</i>");
                                }
                            };
                            bindEvent($li);
                            allWidth += $li.outerWidth()
                        }catch(e){}
                    }
                    // _options.menu.width(allWidth)
                };

                // 展开操作
                showMenu = function(){
                    if(_options.checked.length>0){
                        for(var i = 0; i< _options.checked.length; i++){
                            var li = _options.menu.find("#"+_options.checked[i]);
                            if(_options.defaultShowDown){
                                showUl(li)
                            }
                        }
                    }
                }

                var getJson = function(){
                    var data;
                    if(_options.url != ""){
                        andy.loaddata(_options.url, function(data){
                            data = andy.stringToJson(data)
                            createMainHtml(data);
                            showMenu();
                        })
                    }else if(_options.urlData != ""){
                        data = andy.stringToJson(_options.urlData)
                        createMainHtml(data);
                        showMenu();
                    }else{
                        menu.find("li").each(function(index, li){
                            bindEvent($(li))
                        })
                        showMenu();
                    }
                }


                // 自适应设置
                var setResize = function(){
                    if(_options.isFitParent){
                        var mp = _options.menu.parent();
                        var right = mp.find(".right-btn");
                        var left = mp.find(".left-btn");
                        var otherWidth = 0;
                        var dis = "none";
                        mp.siblings().each(function(index, m){
                            $(m).hasClass("no-float")?null:otherWidth += $(m).outerWidth();
                        })
                        var mpWidth = mp.parent().width() - otherWidth - parseInt(mp.css("margin-left")) - parseInt(mp.css("margin-right"));
                        mp.outerWidth(mpWidth - 1)
                        mp.outerWidth()<_options.menu.outerWidth()?dis="":dis = "none";
                        left.css({
                            "top":"0",
                            "display":dis,
                            "left":"0"
                        })
                        right.css({
                            "top":"0",
                            "display":dis,
                            "left":"0"
                        })
                        if(dis=="none"){
                            _options.menu.css("left", 0)
                        }
                    }
                }

                var setOptionsBtn = function(){
                    var mp = _options.menu.parent();
                    var menuHeight = _options.menu.outerHeight();
                    var rightStr = "<div class = 'right-btn f-clear'><i class='iconfont'>&#xe60f;</i></div>";
                    var leftStr = "<div class = 'left-btn f-clear'><i class='iconfont'>&#xe626;</i></div>";
                    right = mp.parent().find(".right-btn");
                    left = mp.parent().find(".left-btn");
                    right.length>0?null:mp.append(rightStr);
                    right = mp.find(".right-btn");
                    
                    right.css({
                        "cursor": "pointer",
                        "text-decoration": "none",
                        "position":"relative",
                        "width":"16px",
                        "float":"left",
                        "display":"block",
                        "line-height":menuHeight+"px",
                        "height":menuHeight
                    })
                    right.unbind("click").on("click", function(){
                        var movedis = parseInt(_options.menu.css("left"))-mp.width();
                        movedis < -_options.menu.width()+mp.width()?movedis = -_options.menu.width()+mp.width():null;
                        _options.menu.css("left", movedis)
                    })
                    left.length>0?null:mp.append(leftStr);
                    left = mp.find(".left-btn");
                    left.css({
                        "cursor": "pointer",
                        "text-decoration": "none",
                        "position":"relative",
                        "width":"16px",
                        "float":"left",
                        "display":"block",
                        "line-height":menuHeight+"px",
                        "height":menuHeight
                    })
                    left.unbind("click").on("click", function(){
                        var movedis = parseInt(_options.menu.css("left"))+mp.width();
                        movedis>0?movedis=0:null;
                        _options.menu.css("left", movedis)
                    })
                }

                var setParentWidth = function(){
                    if(_options.isFitParent){
                        var mp = _options.menu.parent();
                        var menuHeight = _options.menu.outerHeight();
                        mp.css({
                            "height":menuHeight,
                            "overflow":"hidden",
                            "position":"relative",
                            "top":"0px",
                            "left":"0px"
                        })
                        _options.menu.css({
                            "position":"absolute",
                            "left":"0"
                        })

                        setOptionsBtn()
                        setResize()
                        $(window).resize(function(event){
                            if(_options.resizeHanld == null){
                                _options.resizeHanld = setTimeout(function(){
                                    setResize()
                                    _options.resizeHanld = null;
                                }, 300)
                            }else{
                                clearTimeout(_options.resizeHanld)
                                _options.resizeHanld = setTimeout(function(){
                                    setResize()
                                    _options.resizeHanld = null;
                                }, 300)
                            }
                        })
                    }
                }
                
                // 执行主体
                var init = function(){
                    getJson()
                    setParentWidth()
                };

                init();

                // 绑定离开事件
                _options.menu.bind(_options.hideEvent, function(){
                    _options.onMouseOut()
                    _options.menu.find("ul").removeClass("show")
                })

                // 更新父级宽度
                _options.menu.bind(onresize, function(){
                    setResize()
                })

                // 清除选择
                _options.menu.bind(clearCheckedEvent, function(e){
                    _options.menu.find("li").each(function(index, li){
                        $(li).find("a").removeClass("active")
                    })
                })

                _options.menu.bind(checkedEvent, function(e, arr){
                    var arr = arr.arr;
                    for(var i in arr){
                        var li = _options.menu.find("[id="+arr[i]+"]");
                        li.siblings().find("a").removeClass("active")
                        li.find("a").addClass("active")
                    }
                })
            }
        }
    });
})(jQuery);/*sidemenu */
/**
 * 菜单组件  包含 顶部菜单top 左侧菜单 left 右侧菜单 right 底部菜单 bottom
 * author:林耘宇
 **/
(function ($) {
    $.fn.extend({
        an_sidemenu:function(){
            var options = {};
            var funstyle = "";
            var arg = arguments[0];
            (typeof arg == "object")? options = arg:funstyle = arg;
            var _options = $.extend({
                menuId:"",
                url:"",
                urlData:"",
                checked:[],
                autoHide:true,//针对侧边菜单
                autoShow:false,//默认展开子项
                showEvent:"click",//子菜单显示事件
                hideEvent:"mouseleave",//子菜单显示事件
                defaultIcon:"",//默认图标
                childrenDownIcon:"",//子节点箭头
                childrenRightIcon:"",
                onClick:function(){},
                onComplete:function(){}
            }, options);

            var menu = $(this);
            if(_options.menuId == ""){
                menu = andy.setRandomId(menu, "menu_");
                _options.menuId = menu.attr("id");
            }
            // 获取 设置对象
            var getOption = menu.attr("options");
            var getValueElement = "";
            if(getOption){
                 getOption = "{"+ getOption+"}";
                 getOption = andy.stringToJson(getOption);
                // 处理设置
                for(var name in getOption){
                    if(getOption[name] == "true"){
                        _options[name] = true;
                    }else if(getOption[name] == "false"){
                        _options[name] = false;
                    }else{
                        _options[name] = getOption[name];
                    }
                }
            }
            _options.menu = menu;

            if(funstyle != ""){
            }else{

                var createUlHtml,createMainHtml,bindEvent;

                // 获取li标签
                var getLi = function(dom){
                    if(dom.is("li") == false){
                        dom = dom.parents("li").eq(0);
                    }
                    return dom;
                };

                // 获取li标签
                var getUl = function(dom){
                    if(dom.is("ul") == false){
                        dom = dom.parents("ul").first();
                    }
                    return dom;
                };

                // 去除所有选中效果
                var removeActive = function(){
                    _options.menu.find("a").removeClass("active");
                }

                // 隐藏 或者收缩"其他"
                var hideOther = function(thisli){
                    thisli.siblings().each(function(index, otherLi){
                        // $(otherLi).children("a").removeClass("active");
                        $(otherLi).find("ul").removeClass("show");
                    });
                }

                // 隐藏或收缩当前
                var hideThis = function(thisli){
                    // thisli.children("a").removeClass("active");
                    thisli.find("ul").removeClass("show");
                }

                // 显示当前UL
                var showUl = function(thisli){
                    if(thisli.find("ul").length == 0 && thisli.data("children")){
                        thisli.append("<ul></ul>");
                        createUlHtml(thisli)
                        thisli.find("ul").addClass("show");
                    }else{
                        thisli.find("ul").eq(0).addClass("show");
                    }
                }

                bindEvent = function(li){
                    li.unbind(_options.showEvent);
                    li.bind(_options.showEvent, function(e){
                        var thisli = getLi($(e.target));
                        removeActive()
                        _options.onClick(thisli)
                        thisli.children("a").addClass("active")
                        // 阻止冒泡 准许事件发生
                        e.stopPropagation()
                        //  // 绑定侧边菜单操作
                         if(thisli.children("ul").hasClass("show")){
                             hideThis(thisli)
                             e.stopPropagation()
                         }else{
                             showUl(thisli)
                             if(_options.autoHide){
                                 hideOther(thisli)
                             }
                             e.stopPropagation()
                         }

                    });
                }

                // 创建子节点
                createUlHtml = function(parent){
                    var data = parent.data("children");
                    var level = parent.parents("ul").length;
                    for(var k in data){
                        var li = data[k];
                        try{
                            var icon,url,target,str,active;
                            icon = "";
                            url = "javascript:;";
                            active = "";
                            if(li.icons){
                                var thisIcon = li.icons;
                                li.icons==""?thisIcon=_options.defaultIcon:null;
                                icon = "<i class='iconfont icon'>"+thisIcon+"</i>";
                            }else if(_options.defaultIcon != ""){
                                icon = "<i class='iconfont icon'>"+_options.defaultIcon+"</i>";
                            };
                            if(li.url){
                                url = li.url;
                            };
                            li.target?target="target="+li.target:target="";
                            if(li.id==_options.checked[level]){
                                active="active";
                                removeActive()
                            }
                            str = "<li id = "+li.id+"><a href="+url+" "+target+" class = '"+active+"'>"+icon+li.text+"</a></li>";
                            parent.find("ul").append(str);
                            // 子节点数据绑定
                            var $li = $("#"+li.id);
                            $li.data("json", li);
                            if(li.children && li.children.length > 0 && $li.length > 0){
                                $li.data("children", li.children);
                                $li.find("a").addClass("parent");
                                $li.find("a").append("<i class='iconfont arrow'>"+_options.childrenRightIcon+"</i>");
                            }
                            bindEvent($li);
                        }catch(e){}
                    }
                }

                // 创建主节点片段
                createMainHtml = function(data){
                    for(var k in data){
                        var li = data[k];
                        try{
                            var icon,url,target,str,active;
                            active = "";
                            icon = "";
                            url = "javascript:;";
                            if(li.icons){
                                var thisIcon = li.icons;
                                li.icons==""?thisIcon=_options.defaultIcon:null;
                                icon = "<i class='iconfont icon'>"+thisIcon+"</i>";
                            }else if(_options.defaultIcon != ""){
                                icon = "<i class='iconfont icon'>"+_options.defaultIcon+"</i>";
                            };
                            if(li.url){
                                url = li.url;
                            };
                            li.target?target="target="+li.target:target="";
                            li.id==_options.checked[0]?active="active":null;
                            str = "<li id = "+li.id+"><a href="+url+" "+target+" class = '"+active+"'>"+icon+li.text+"</a></li>";
                            _options.menu.append(str);
                            // 子节点数据绑定
                            var $li = $("#"+li.id);
                            $li.data("json", li);
                            if(li.children && li.children.length > 0 && $li.length > 0){
                                $li.data("children", li.children);
                                $li.find("a").addClass("parent");
                                $li.find("a").append("<i class='iconfont arrow'>"+_options.childrenRightIcon+"</i>");

                            };
                            bindEvent($li);
                        }catch(e){}
                    }
                };


                // 展开操作
                showMenu = function(){
                    if(_options.checked.length>0){
                        for(var i = 0; i< _options.checked.length; i++){
                            var li = _options.menu.find("#"+_options.checked[i]);
                            showUl(li)
                        }
                    }
                    _options.onComplete()
                }

                var getJson = function(){
                    var data;
                    if(_options.url != ""){
                        andy.loaddata(_options.url, function(data){
                            data = andy.stringToJson(data)
                            createMainHtml(data);
                            showMenu();
                        })
                    }else if(_options.urlData != ""){
                        data = andy.stringToJson(_options.urlData)
                        createMainHtml(data);
                        showMenu();
                    }else{
                        menu.find("li").each(function(index, li){
                            bindEvent($(li))
                        })
                        showMenu();
                    }
                }

                // 执行主体
                var init = function(){
                    getJson()
                };

                init();

                // 绑定离开事件
                _options.menu.bind(_options.hideEvent, function(){
                    // if(_options.menuType == "top"){
                    //  _options.menu.find("ul").removeClass("show")
                    // }
                })
            }
        }
    });
})(jQuery);/*tabsheader */
/**
 * 菜单组件  分页导航
 * author:林耘宇
 **/
 (function ($) {
 	$.fn.extend({
 		an_tabsheader:function(){
 			var options = {};
            var funstyle = "";
            var arg = arguments[0];
            (typeof arg == "object")? options = arg:funstyle = arg;

            var _options = $.extend({
                menuId:"",
                url:"",
                urlData:"",
                chooseIndex:0,
                changeEvent:"click",//切换事件
                onClick:function(){}
            }, options);

            var menu = $(this);
            if(_options.menuId == ""){
                menu = andy.setRandomId(menu, "tabsheader_");
                _options.menuId = menu.attr("id");
            }
            // 获取 设置对象
            var getOption = menu.attr("options");
            var getValueElement = "";
            if(getOption){
                 getOption = "{"+ getOption+"}";
                 getOption = andy.stringToJson(getOption);
                // 处理设置
                for(var name in getOption){
                    if(getOption[name] == "true"){
                        _options[name] = true;
                    }else if(getOption[name] == "false"){
                        _options[name] = false;
                    }else{
                        _options[name] = getOption[name];
                    }
                }
            }
            _options.menu = menu;

            if(funstyle != ""){
            }else{

            	var createUlHtml,createMainHtml,bindEvent;

            	// 获取li标签
            	var getLi = function(dom){
            		if(dom.is("li") == false){
            			dom = dom.parents("li").eq(0);
            		}
            		return dom;
            	};

            	// 隐藏 或者收缩"其他"
            	var hideOther = function(thisli){
            		thisli.siblings().each(function(index, otherLi){
						$(otherLi).removeClass("active");
					});
            	}

            	bindEvent = function(li){
            		li.unbind(_options.changeEvent);
            		if(_options.changeEvent != "click"){
            			// li对象  数据
						_options.onClick(li, li.data("json"))
            		};
            		li.bind(_options.changeEvent, function(e){
						var thisli = getLi($(e.target));	
						hideOther(thisli);
						thisli.addClass("active");//当前鼠标位置标识
						// 事件操作
						if(_options.changeEvent == "click"){
	            			// li对象  数据
							_options.onClick(li, li.data("json"))
	            		};
						// if(_options.downMenu){
						// 	hideOther(thisli)
						// 	showUl(thisli)
						// }
						
					});
            	}

            	// 创建主节点片段
            	createMainHtml = function(data){
            		var ul = "<ul class='m-tabs-nav'></ul>";
            		_options.menu.append(ul);
            		ul = _options.menu.find("ul");
            		for(var k in data){
            			var li = data[k];
            			try{
            				var active = "class = 'active'";
            				if(k != _options.chooseIndex){
            					active = "";
            				}
            				var liid = li.id || _options.menuId+k;
                            var url,target;
                            (li.url && li.url != "")?url=li.url:url="javascript:;";
                            li.target?target="target="+li.target:target="";
            				var str = "<li "+active+" id = "+liid+"><a href="+url+" "+target+">"+li.text+"</a></li>";
							ul.append(str);
							var $li = $("#"+liid);
                            $li.data("json",li)
							bindEvent($li);
            			}catch(e){}
            		}
            	};

            	var getJson = function(){
            		var data;
            		if(_options.url != ""){
            			andy.loaddata(_options.url, function(data){
	                        data = andy.stringToJson(data)
	                        createMainHtml(data);
	                    })
            		}else if(_options.urlData != ""){
            			data = andy.stringToJson(_options.urlData)
            			createMainHtml(data);
            		}else{
                        menu.find("li").each(function(index, li){
                            bindEvent($(li))
                        })
                    }
            	}
            	
            	// 执行主体
            	var init = function(){
					getJson()
            	};

            	init();

				// 绑定离开事件
           //  	_options.menu.bind(_options.hideEvent, function(){
        			// _options.menu.find("ul").removeClass("show")
           //  	})
            }
 		}
 	});
})(jQuery);/*scrollbar */
/**
 * 滚动条
 * author:林耘宇
 **/
(function ($) {
    $.fn.extend({
        an_scrollbar:function(){
            var options = {};
            var funstyle = "";
            var arg = arguments[0];
            var scroll = $(this);
            (typeof arg == "object")? options = arg:funstyle = arg;

            // 初始配置
            var _options = $.extend({
                scrollId:"",
                barStyle:"style01",
                minStep:2,//最小滚动步长
                overflowX:"auto",//横向滚动条
                overflowY:"auto",//纵向滚动条
                isBarPlaceholder:false,//滚动条是否占位
                isFitParent:true,
                autoHidden:false,//是否自动隐藏，在没有鼠标的时候
                resizeHanld:null,
                alwaysShow:false
            }, options);

            if(_options.scrollId == ""){
                scroll = andy.setRandomId(scroll, "scroll_");
                _options.scrollId = scroll.attr("id");
            }

            // 获取 设置对象
            var getOption = scroll.attr("options");
            if(getOption){
                 getOption = "{"+ getOption+"}";
                 getOption = andy.stringToJson(getOption);
                // 处理设置
                for(var name in getOption){
                    if(getOption[name] == "true"){
                        _options[name] = true;
                    }else if(getOption[name] == "false"){
                        _options[name] = false;
                    }else{
                        _options[name] = getOption[name];
                    }
                }
            }

            scroll.data("options", _options)

            scroll.showBar = function(){
                scroll.trigger("showScrollBar")
            }

            scroll.anchor = function(id){
                scroll.trigger("anchor", id)
            }

            if(funstyle != ""){
                scroll[arg]?scroll[arg](arguments[1]):null;
            }else{
                var topHeight = scroll.height();
                scroll.addClass("f-clear")
                scroll.wrap("<div class='m-scroll "+_options.barStyle+"'></div>")
                scroll.wrap("<div class='m-scroll-left'></div>")
                var top = scroll.parent().parent()
                var left = scroll.parent();
                var rightStr = "<div class='m-scroll-right'>"+
                "<div class='scroll-ico-top'><i class='iconfont'></i></div>"+
                "<div class='scroll-ico-con'></div>"+
                "<div class='scroll-ico-bottom'><i class='iconfont'></i></div>"+
                "</div>";
                top.append(rightStr)
                var right = left.next();
                var scrollbar = right.find(".scroll-ico-con");
                var topButton = right.find(".scroll-ico-top");

                var bottomStr = "<div class='m-scroll-bottom'>"+
                "<div class='scroll-ico-left'><i class='iconfont'></i></div>"+
                "<div class='scroll-ico-con'></div>"+
                "<div class='scroll-ico-right'><i class='iconfont'></i></div>"+
                "</div>";
                top.append(bottomStr)
                var bottom = right.next();
                var bottomScrollbar = bottom.find(".scroll-ico-con");
                var leftButton = bottom.find(".scroll-ico-left");
                var rightButton = bottom.find(".scroll-ico-right");
                leftButton.css("display")=="none"?leftButton.width(0):null;
                rightButton.css("display")=="none"?rightButton.width(0):null;
                var isBottomDrag = false;
                var startX = 0;
                
                topButton.css("display")=="none"?topButton.height(0):null;
                var bottomButton = right.find(".scroll-ico-bottom");
                bottomButton.css("display")=="none"?bottomButton.height(0):null;
                var isDrag = false;
                var startY = 0;

                // 滚动条是否占位isBarPlaceholder
                if(_options.isBarPlaceholder){
                    left.css({
                        "padding-right":scrollbar.width(),
                        "padding-bottom":bottomScrollbar.height()
                    })
                }

                scroll.showScrollBar = function(){
                    if(!_options.alwaysShow){
                        if(scroll.height()<= top.height()){
                            right.hide()
                            scroll.parent().parent().unbind("mouseout mouseover")
                            left.css({
                                "top":0,
                                "padding-right":0
                            })
                        }else if(_options.overflowY == "auto"){
                            right.show()
                            if(_options.autoHidden){
                                scroll.parent().parent().mouseout(function(e){
                                    if($(e.target).parents(".m-scroll")){
                                        right.hide()
                                        bottom.hide()
                                    }
                                    e.preventDefault()
                                })
                                scroll.parent().parent().mouseover(function(e){
                                    right.show()
                                    if(scroll.width() > top.width()){
                                        bottom.show()
                                    }
                                    e.preventDefault()
                                })
                            }
                        };
                        if(scroll.width() <= top.width()){
                            bottom.hide()
                            left.css({
                                "left":0,
                                "padding-bottom":0
                            })
                        }else if(_options.overflowX == "auto"){
                            bottom.show()
                        }
                        if(right.is(":hidden")== false && bottom.is(":hidden")== false && right.hasClass("edit") == false && _options.isBarPlaceholder){
                            right.addClass("edit")
                            bottom.addClass("edit")
                            right.height(right.height() - parseInt(left.css("padding-bottom")))
                            bottom.width(bottom.width() - parseInt(left.css("padding-right")))
                            left.after("<div class = 'm-scroll-bg'></div>")
                        }
                    }
                    // 设置滚动条高度
                    if(_options.overflowY == "auto"){
                        var sheight = parseInt(right.height()- bottomButton.height()*2)*(top.height()/left.outerHeight());
                        scrollbar.animate({"height":sheight}, 100)
                    }else{
                        right.hide()
                    }
                    
                    // 设置滚动条宽度
                    if(_options.overflowX == "auto"){
                        var swidth = parseInt(bottom.width()- leftButton.height()*2)*(top.width()/left.outerWidth());
                        // scrollbar.height(sheight)
                        bottomScrollbar.animate({"width":swidth}, 100)
                    }else{
                        bottom.hide()
                    }
                }

                scroll.getDisHeight = function(){
                    return right.height() - (scrollbar.height()-bottomButton.height()*2);
                }

                scroll.moveContent = function(dis){
                    var disHeight = right.height()-scrollbar.height()-bottomButton.height()*2;
                    var addContent = (left.outerHeight() - top.height())/disHeight;
                    var contentHeight = -dis*addContent;
                    if(contentHeight < top.height() - left.outerHeight()){
                        contentHeight = top.height() - left.outerHeight();
                    }
                    scroll.parent().css("top", contentHeight)
                }

                scroll.moveBar = function(e){
                    if(isDrag){
                        var dis = e.clientY - startY;
                        var disHeight = right.height()-scrollbar.height()-bottomButton.height()*2;
                        if(dis < topButton.height()){
                            dis = topButton.height();
                        }else if(dis > disHeight+topButton.height()){
                            dis = disHeight+topButton.height();
                        }
                        scrollbar.css("top",dis)
                        scroll.moveContent(dis - topButton.height())
                    }
                }

                // 横向滚动
                scroll.disMoveBottomBar = function(delta){
                    if(scroll.width() < top.width()){
                        return false;
                    }
                    var disWidth = bottom.width()-bottomScrollbar.width()-bottomButton.width()*2;
                    var counts = Math.ceil(disWidth/bottomScrollbar.width());
                    counts > _options.minStep?_options.minStep=counts:null;
                    var dis = parseInt(bottomScrollbar.css("left"))-delta*(disWidth/_options.minStep);
                    if(dis < leftButton.width()){
                        dis = leftButton.width();
                    }else if(dis > disWidth+leftButton.width()){
                        dis = disWidth+leftButton.width();
                    }
                    bottomScrollbar.css({"left":dis})
                    scroll.moveBottomContent(dis - topButton.width())
                }
                scroll.moveBottomContent = function(dis){
                    var disWidth = bottom.width()-bottomScrollbar.width()-leftButton.width()*2;
                    var addContent = (left.outerWidth() - top.width())/disWidth;
                    var contentWidth = -dis*addContent;
                    if(contentWidth < top.width() - left.outerWidth()){
                        contentWidth = top.width() - left.outerWidth();
                    }
                    scroll.parent().css("left", contentWidth)
                }
                scroll.moveBottomBar = function(e){
                    if(isBottomDrag){
                        var dis = e.clientX - startX;
                        var disWidth = bottom.width()-bottomScrollbar.width()-leftButton.width()*2;
                        if(dis < leftButton.width()){
                            dis = leftButton.width();
                        }else if(dis > disWidth+leftButton.width()){
                            dis = disWidth+leftButton.width();
                        }
                        bottomScrollbar.css("left",dis)
                        scroll.moveBottomContent(dis - leftButton.width())
                    }
                }

                // 距离滚动
                scroll.disMoveBar = function(delta){
                    if(scroll.height() < top.height()){
                        return false;
                    }
                    var disHeight = right.height()-scrollbar.height()-bottomButton.height()*2;
                    var counts = Math.ceil(disHeight/scrollbar.height());
                    counts > _options.minStep?_options.minStep=counts:null;
                    var dis = parseInt(scrollbar.css("top"))-delta*(disHeight/_options.minStep);
                    if(dis < topButton.height()){
                        dis = topButton.height();
                    }else if(dis > disHeight+topButton.height()){
                        dis = disHeight+topButton.height();
                    }
                    scrollbar.css({"top":dis})
                    scroll.moveContent(dis - topButton.height())
                }

                // 内容目标滚动
                scroll.contentAnchor = function(offsetTop, cheight){
                    // 滚动条剩余高度
                    var disHeight = right.height()-scrollbar.height()-bottomButton.height()*2;
                    var dis = -offsetTop;
                    if(top.height() > scroll.height()){
                        return false;
                    }
                    setTimeout(function(){
                        if(offsetTop+cheight > top.height() && dis < top.height() - scroll.height()){
                            dis = top.height() - scroll.height();
                        }
                        // 内容定位
                        scroll.parent().css("top", dis)
                        var scrollDis = (disHeight/(scroll.height() - top.height()))*(dis);
                        // var sdis = parseInt(scrollbar.css("top")) - scrollDis;
                        // if(scrollDis == 0){
                        //     sdis = scrollDis - parseInt(scrollbar.css("top"));
                        // }
                        // if(sdis < topButton.height()){
                        //     sdis = topButton.height();
                        // }else if(sdis > disHeight+topButton.height()){
                        //     sdis = disHeight+topButton.height();
                        // }
                        scrollbar.css({"top":-scrollDis})
                    }, 100)
                }

                scrollbar.mousedown(function(e){
                    isDrag = true;
                    startY = e.clientY-parseInt(scrollbar.css("top"));
                    return true;
                })

                scrollbar.parent().parent().mousemove(function(e){
                    scroll.moveBar(e)
                    return true;
                })
                scrollbar.parent().parent().mouseout(function(e){
                    e.stopPropagation()
                    return true;
                })
                scrollbar.parent().parent().mouseup(function(e){
                    isDrag = false;
                    return true;
                })
                scrollbar.parent().parent().mouseenter(function(e){
                    scroll.showScrollBar()
                    isDrag = false;
                    return true;
                })

                // ----------

                bottomScrollbar.mousedown(function(e){
                    isBottomDrag = true;
                    startX = e.clientX-parseInt(bottomScrollbar.css("left"));
                    return true;
                })

                bottomScrollbar.parent().parent().mousemove(function(e){
                    scroll.moveBottomBar(e)
                    return true;
                })
                bottomScrollbar.parent().parent().mouseout(function(e){
                    e.stopPropagation()
                    return true;
                })
                bottomScrollbar.parent().parent().mouseup(function(e){
                    isBottomDrag = false;
                    return true;
                })
                bottomScrollbar.parent().parent().mouseenter(function(e){
                    scroll.showScrollBar()
                    isBottomDrag = false;
                    return true;
                })

                // 滚轮
                top.on("mousewheel DOMMouseScroll", function (e) {
                    var delta = (e.originalEvent.wheelDelta && (e.originalEvent.wheelDelta > 0 ? 1 : -1)) || (e.originalEvent.detail && (e.originalEvent.detail > 0 ? -1 : 1)); 
                    e.preventDefault();
                    // e.stopPropagation();
                    if (delta > 0) {
                        // 向上滚
                        scroll.disMoveBar(delta)
                    } else if (delta < 0) {
                        // 向下滚
                        scroll.disMoveBar(delta)
                    }
                })

                topButton.click(function(){
                    scroll.disMoveBar(1);
                })

                bottomButton.click(function(){
                    scroll.disMoveBar(-1);
                })

                leftButton.click(function(){
                    scroll.disMoveBottomBar(1);
                })

                rightButton.click(function(){
                    scroll.disMoveBottomBar(-1);
                })
                
                scroll.mousedown(function(){
                    setTimeout(function(){
                        scroll.showScrollBar()
                    }, 300)
                })
                scroll.bind("showScrollBar", function(){
                    setTimeout(function(){
                        scroll.showScrollBar()
                    }, 100)
                })
                scroll.bind("anchor", function(e, id){
                    var an = scroll.find("#"+id);
                    var oldPosition = an.css("position");
                    if(an.length>0){
                        an.css("position", "absolute")
                        scroll.contentAnchor(an[0].offsetTop, an.height())
                        an.css("position", oldPosition)
                        an = [];
                    }
                })

                $(window).resize(function(event){
                    if(_options.isFitParent){
                        if(_options.resizeHanld == null){
                            _options.resizeHanld = setTimeout(function(){
                                scroll.showScrollBar()
                                _options.resizeHanld = null;
                            }, 300)
                        }else{
                            clearTimeout(_options.resizeHanld)
                            _options.resizeHanld = setTimeout(function(){
                                scroll.showScrollBar()
                                _options.resizeHanld = null;
                            }, 300)
                        }
                    }
                    
                })
                _options.alwaysShow?null:scroll.showScrollBar();
            }
        }
    });
})(jQuery);/*combo */
/**
 * 组合框模块
 * author:林耘宇
 **/
 (function ($) {
    $.fn.extend({
        an_inputcombo:function(){
            var options = {};
            var funstyle = "";
            var arg = arguments[0];
            (typeof arg == "object")? options = arg:funstyle = arg;

            var _options = $.extend({
                comboId:"",
                touchTargetType:"input",
                inputVerify:"",
                showTargetType:"list",
                inputName:"",
                showUrl:"",
                showData:[],//初始化数据
                checked:[],//已选id 初始化
                treeCheckBoxType:{},//树选择配置
                defaultValue:"下拉选择",//默认显示提示
                treeId:"",//下拉树ID
                treeSetting:{},//下拉树 树覆盖设置
                treeAsync:{},//下拉树异步设置
                selects:false,//是否多选
                isEnable:true,//是否可用
                isText:false,//是否为纯文本 无法选择设置
                row:0,//默认显示多少行,更多的出现滚动条
                showHeight:200,//设置 在下拉树的情况下的 显示高度
                open:false,//默认关闭
                windowAuto:true,//根据窗口自适应
                idvalue:"id",//属性字段绑定
                valuedata:"value",//属性字段绑定
                namevalue:"name",//属性字段绑定
                editor:true,//可编辑 可以输入
                autoclear:false,//失去焦点自动清除
                setListHtml:"",//自定义li标签
                onInputChange:function(){},//输入事件
                onChange:function(){}//选择事件
            }, options);
            
            var combo = $(this);
            if(combo.is("input")){
                var combo_id = combo.attr("id");
                combo.removeAttr("id", "");
                combo.removeAttr("an-combo", "");
                if(!combo_id){
                    combo_id = "combo_"+andy.getRandom(10000);
                }
                var combo_style = combo.attr("style");
                combo.removeAttr("style");
                _options.inputName = combo.attr("name");
                combo.removeAttr("name");
                var combo_options = combo.attr("options");
                combo_options = "options = "+combo_options;
                combo.removeAttr("options", "");
                var combo_class = "m-combo";
                if(combo.attr("class")){
                    combo_class = combo.attr("class");
                    combo.attr("class", "");
                }

                // combo.attr("type", "hidden");
                combo.css("type", "hidden");

                var div = "<div class = '"+combo_class+"' id = '"+combo_id+"' style = '"+combo_style+"' "+combo_options+" an-combo></div>";
                combo.before(div);
                combo.remove();
                combo = $("#"+combo_id);
                _options.comboId = combo_id;
            }
            if(combo.attr("an-combo") != "an-combo"){
                combo.attr("an-combo", "an-combo");
            }

            var setRandomId = function(dom, name, number){
                var id = dom.attr("id");
                var randomNumber = number || 10000;
                if(id == undefined || id == null || id == ""){
                    id = name+andy.getRandom(randomNumber);
                    dom.attr("id", id);
                    dom = $("#"+id);
                }else{
                    dom = $("#"+id);
                }
                return dom;
            };
            
            // 给combo生成id
            if(_options.comboId == ""){
                combo = setRandomId(combo, "combo_");
                _options.comboId = combo.attr("id");
            }
            var doc = $(document);
            var win = $(window);

            var ul_height = 0;//第一层ul高度

            // 私有事件
            var setRow = "EVENT_ROW";
            var setDefault = "EVENT_SET_DEFAULT";//还原默认状态
            var getVal = "EVENT_GET_VALUE";
            var getChooseId = "EVENT_GET_ID";
            var setShow = "EVENT_SHOW";//设置新的显示对象
            var setEnable = "EVENT_ENABLE";//设置是否禁用
            var setCurrentChoose = "EVENT_CHOOSE";//主动选择方法
            var setList = "EVENT_SET_NEW_LIST";
            var setTree = "EVENT_SET_NEW_TREE";
            // 特殊设置事件
            var addTree = "EVENT_TREE";//创建树多选列表

            // 配置
            var showEvent = "click";//默认显示事件
            var touchIsEnable = true;//触发对象是否可用

            // var showUrl = _options.showUrl;//异步加载url 包含list tree

            // 获取 设置对象
            var getOption = combo.attr("options");
            var getValueElement = "";
            if(getOption){
                 getOption = "{"+ getOption+"}";
                 getOption = andy.stringToJson(getOption);
                // 处理设置
                for(var name in getOption){
                    if(name == "onChange"){
                        var thisName = getOption[name];
                        _options.onChange = function(e){
                            var fun = andy.stringToJson(thisName);
                            fun(e);
                        }
                    }else if(name == "checked"){
                        var data = getOption[name].split(",");
                        _options.checked = data;
                    }else{
                        if(getOption[name] == "true"){
                            _options[name] = true;
                        }else if(getOption[name] == "false"){
                            _options[name] = false;
                        }else{
                            _options[name] = getOption[name];
                        }
                        
                    }
                    
                }
            }
            _options.combo = combo;
            // console.log(getOption);
            //入值input// 最新的 button 对象 touchTarget:button 的情况
            _options.valueForInput = null;
            combo.find("input").each(function(i, input){
                if($(input).attr("type") == "hidden"){
                    _options.valueForInput = $(input);
                }
            });
            

            if(funstyle != ""){
                // 处理方法
                if(funstyle == "row"){
                    var row = arguments[1];
                    if(combo && combo[0]){
                        combo.trigger(setRow, row);
                    };
                }else if(funstyle == "setDefault"){
                    var fun = arguments[1];
                    combo.trigger(setDefault, fun);
                }else if(funstyle == "setCurrentChoose"){
                    var choose = arguments[1];
                    // choose:[id, id]
                    var arr = {
                        choose:choose
                    }
                    combo.trigger(setCurrentChoose, arr);
                }else if(funstyle == "getValue"){
                    var fun = arguments[1];
                    combo.trigger(getVal, fun);
                }else if(funstyle == "getChooseId"){
                    var fun = arguments[1];
                    combo.trigger(getChooseId, fun);
                }else if(funstyle == "getShowTarget"){
                    // 获取显示对象
                    return andy.combo("getShowTarget", $("#"+_options.comboId));
                }else if(funstyle == "setShowTarget"){
                    // 设置新的显示对象
                    var show = arguments[1];
                    combo.trigger(setShow, show);
                }else if(funstyle == "setList"){
                    var arr = {
                        listdata:arguments[1]
                    };
                    combo.trigger(setList, arr);
                }else if(funstyle == "setTree"){
                    var arr = {
                        listdata:arguments[1]
                    };
                    combo.trigger(setTree, arr);
                }else if(funstyle == "addTree"){
                    // 传入树设置
                    var op = arguments[1];
                    combo.trigger(addTree, op);
                }else if(funstyle == "isEnable"){
                    var isEnable = arguments[1];
                    combo.trigger(setEnable, isEnable);
                };
            }else{
                 // 兼容IE6 的显示
                if(andy.IE() == 6){
                    combo.find("ul").each(function(i, e){
                        var cell = $(e);
                        if(!cell.prev().is("div")){
                            cell.before("<div></div>");
                        }
                    });
                };

                // 判断是否有侧边滚动条
                var isHaveScroll = function(){
                    var have = false;
                    if(doc.height() > win.innerHeight()){
                        have = true;
                    };
                    return have;
                };

                var setUlHeight = function(){
                    // 只有大于row的时候才出现滚动条
                    if(combo.showTarget.children().length > _options.row && _options.row != 0){
                        combo.showTarget.addClass("u-overflow-y");
                        ul_height = _options.row * combo.showTarget.children().outerHeight();
                        combo.showTarget.height(ul_height);
                        // u-overflow-y
                    }else{
                        combo.showTarget.removeClass("u-overflow-y");
                        ul_height = 0;//combo.showTarget.children().length * last_li.outerHeight();
                        combo.showTarget.css("height", "");
                    };
                };

                var setUlScrollHeight = function(height){
                    if(height < combo.showTarget.height()){
                        combo.showTarget.addClass("u-overflow-y");
                        combo.showTarget.outerHeight(height)
                    }
                }

                // 显示层排列
                var showUl = function(pul, ul){
                    var offset = pul.offset();
                    var pleft = offset.left;
                    var ptop = offset.top;
                    var doc_width = doc.width();
                    var doc_height = doc.height();
                    var doc_scrollTop = doc.scrollTop();
                    // console.log("input"+combo.touchTarget.width(), combo.touchTarget.outerWidth());
                    // ul.width(combo.touchTarget.width());
                    // console.log("ul"+ul.width(), ul.outerWidth());
                    var ul_width = ul.outerWidth();
                    setUlHeight();
                    var ulHeight = ul.height();

                    var scrollWidth = 0;
                    if(isHaveScroll()){
                        scrollWidth = 17;
                    };

                    // combo.showTarget.width(combo.touchTarget.width())

                    if(doc_width - pleft - scrollWidth >= ul_width){
                        ul.css({"left":"0px","right":"auto"});
                    }else{
                        ul.css({"left":"auto", "right":"0px"});
                    };
                    // 垂直排列
                    // ul.css({"left":pleft});
                    // 上下排列
                    // var buttonHeight = combo.touchTarget.outerHeight()-1;
                    var buttonHeight = combo.touchTarget.outerHeight();
                    /* ________________
                       |           |   buttonTop Height
                       |  ______   |___
                       |  |     |  |
                       |  -------  |-----buttonBottom Height
                       -------------------
                    */
                    
                    var buttonBottom = win.height() - (ptop - doc_scrollTop);
                    var buttonTop = win.height() - buttonBottom - buttonHeight;
                    if(_options.windowAuto){
                        if(buttonBottom >= buttonTop){
                            // ul.css("top", ptop + buttonHeight + "px");
                            ul.css("top", buttonHeight + "px");
                            setUlScrollHeight(buttonBottom - buttonHeight)
                        }else{
                            setUlScrollHeight(win.height() - buttonBottom)
                            ulHeight = combo.showTarget.outerHeight()
                            // ul.css("top", ptop-ulHeight + "px");
                            ul.css("top", -ulHeight + "px");
                        }
                    }else{
                        // ul.css("top", ptop + buttonHeight + "px");
                        ul.css("top", buttonHeight + "px");
                        setUlScrollHeight(buttonBottom - buttonHeight)
                    }
                    
                };

                // 除开ul的 显示位置
                var show = function (pdiv, div){
                    var offset = pdiv.offset();
                    var pleft = offset.left;
                    var ptop = offset.top;
                    var doc_width = doc.width();
                    var doc_height = doc.height();
                    var doc_scrollTop = doc.scrollTop();
                    // console.log("input"+combo.touchTarget.width(), combo.touchTarget.outerWidth());
                    // div.width(combo.touchTarget.width());
                    // console.log("div"+div.width(), div.outerWidth());
                    var ul_width = div.outerWidth();
                    var ulHeight = div.height();

                    var scrollWidth = 0;
                    if(isHaveScroll()){
                        scrollWidth = 17;
                    };

                    // if(combo.touchTarget.width() == "100%" || combo.touchTarget.width() == false){
                    //     combo.showTarget.width(combo.touchTarget.width())
                    // }

                    // 左右排列
                    if(doc_width - pleft - scrollWidth >= ul_width){
                        div.css({"left":"0px","right":"auto"});
                    }else{
                        div.css({"left":"auto", "right":"0px"});
                    };

                    // 垂直排列
                    // div.css({"left":pleft+"px"});

                    // 上下排列
                    // console.log(win.height() - (ptop - doc_scrollTop), ulHeight);
                    // var buttonHeight = combo.touchTarget.outerHeight() - 1;
                    var buttonHeight = combo.touchTarget.outerHeight();
                    // if(_options.windowAuto){
                    //     if($(window).height() - (ptop - doc_scrollTop) - buttonHeight <= ulHeight){
                    //         div.css("top", -ulHeight + "px");
                    //     }else{
                    //         div.css("top", buttonHeight + "px");
                    //     }
                    // }else{
                    //     div.css("top", buttonHeight + "px");
                    // }

                    var buttonBottom = win.height() - (ptop - doc_scrollTop);
                    var buttonTop = win.height() - buttonBottom - buttonHeight;
                    if(_options.windowAuto){
                        if(buttonBottom >= buttonTop){
                            // div.css("top", ptop + buttonHeight + "px");
                            div.css("top", buttonHeight + "px");
                            setUlScrollHeight(buttonBottom - buttonHeight)
                        }else{
                            setUlScrollHeight(win.height() - buttonBottom)
                            ulHeight = combo.showTarget.outerHeight()
                            // div.css("top", ptop-ulHeight + "px");
                            div.css("top", -ulHeight + "px");
                        }
                    }else{
                        // div.css("top", ptop + buttonHeight + "px");
                        div.css("top", buttonHeight + "px");
                        setUlScrollHeight(buttonBottom - buttonHeight)
                    }
                };

                // =========================================通用 显示对象方法

                // 更新显示对象 显示对象 是否清除以前结构
                var setCurrentShow = function(show, isClear){
                    if(isClear){
                        combo.showTarget.empty();
                    };
                    if(show instanceof jQuery){  
                        combo.showTarget.replaceWith(show);
                    }else{
                        combo.showTarget.replaceWith($(show));
                    };
                    andy.combo({
                        combo:combo,
                        showEvent:showEvent,
                        showComplete:function(){
                            if(_options.showTargetType == "list"){
                                showUl(combo, combo.showTarget);
                            }else{
                                show(combo, combo.showTarget);
                            }
                        }
                    });
                    _options.showData = [];
                    // _options.showUrl = "";
                    combo.an_inputcombo_bindEvent(_options);
                };

                // 样式修复
                // combo.addClass("u-input-span");
                // combo.css("padding", "0px");

                var setEnableFun = function(){
                    if(combo){
                        var touchTarget = combo.touchTarget;
                        if(touchTarget.is("input") == false){
                            touchTarget = touchTarget.find("input");
                        }
                        if(combo.data("isEnable") == true){
                            touchTarget.removeAttr("disabled");
                            combo.removeClass("u-disabled");
                        }else{
                            touchTarget.attr("disabled","disabled");
                            combo.addClass("u-disabled");
                        }
                    }
                }


                var init = function(combo, touchType, showType){
                    combo.data("selects", _options.selects);
                    combo.data("isEnable", _options.isEnable);
                    combo.data("isText", _options.isText);
                    combo.an_inputcombo_creatTouch(_options);
                    combo.an_inputcombo_creatShow(_options);
                    if(_options.inputName == "" || _options.inputName == undefined){
                        _options.inputName = _options.comboId+"_input";
                    }
                    if(_options.valueForInput == null){
                        combo.append("<input type = 'hidden' name = '"+_options.inputName+"'>");
                        _options.valueForInput = combo.find("input:hidden");
                    }
                }

                // "normal":input 普通类型  "ban":input 禁止修改
                // 当没有静态对象时 初始化默认对象
                if(combo.children().length == 0){
                    init(combo, _options.touchTargetType, _options.showTargetType);
                    if(_options.editor == false){
                        combo.find(".u-input:first").addClass("u-diseditor");
                    }else{
                        combo.find(".u-input:first").attr("readonly", null);
                        combo.find(".u-input:first").removeClass("u-diseditor");
                    }
                }else{
                    var touchTarget = andy.combo("getTouchTarget", combo);
                    // 判断触发对象类型
                    // if(touchTarget.is("button")){
                        // _options.touchTargetType = "button";
                        
                    // }
                    init(combo, _options.touchTargetType, _options.showTargetType);
                    if(_options.editor == false){
                        combo.find(".u-input:first").addClass("u-diseditor");
                    }else{
                        combo.find(".u-input:first").attr("readonly", null);
                    }
                }

                andy.combo({
                    combo:combo,
                    showEvent:showEvent,
                    showComplete:function(){
                        combo.css("z-index", 99999);
                        combo.showTarget.css("z-index", 99999);
                        if(_options.showTargetType == "list"){
                            showUl(combo, combo.showTarget);
                        }else{
                            show(combo, combo.showTarget);
                        }
                    },
                    hiddenComplete:function(){
                        combo.css("z-index", "");
                        combo.showTarget.css("z-index", "");
                    }
                });

                setEnableFun();

                // 入值input
                _options.valueForInput = combo.touchTarget;
                if(_options.valueForInput.is("input") == false){
                    _options.valueForInput.find("input").each(function(index, input){
                        _options.valueForInput = $(input);
                    })
                }
                // if(_options.valueForInput.is("input")){
                    if(_options.inputName == "" && _options.valueForInput.attr("name") == undefined){
                        // _options.inputName = _options.comboId + "_value";
                        _options.valueForInput.attr("name", _options.comboId + "_value");
                    }else if(_options.valueForInput.attr("name") == undefined){
                        _options.valueForInput.attr("name", _options.comboId + "_value");
                    }
                // }
                

                // 修改限制行
                combo.bind(setRow, function(e, row){
                    _options.row = row;
                });

                // 设置新的list对象 通过json
                combo.bind(setList, function(e, arr){
                    var show = combo.an_inputcombo_getList(_options, arr.listdata);
                    var target = combo.showTarget;
                    target.empty();
                    // target.append(show);
                    // combo.an_inputcombo("setDefault");
                    // setCurrentShow(target, true);
                    _options.showData = arr.listdata;
                    combo.an_inputcombo_bindEvent(_options)
                });

                // 设置新tree对象 通过json
                combo.bind(setTree, function(e, arr){
                    var target = combo.showTarget;
                    target.empty();
                    andy.combo({
                        combo:combo,
                        showEvent:showEvent,
                        showComplete:function(){
                            show(combo, combo.showTarget);
                        }
                    });
                    _options.showData = arr.listdata;
                    combo.an_inputcombo_bindEvent(_options)
                })

                // 设置新的显示对象
                combo.bind(setShow, function(e, show){
                    setCurrentShow(show, true);
                });

                // 树结构事件绑定
                combo.bind(addTree, function(e, op){
                    // createTree(op.treeId, op.setting, op.nodes, op);
                });

                if(combo.showTarget.is("ul")){
                    // combo.find("ul li").click(function(e){
                    //     var t = $(e.target);
                    //     if(t.is('li') == false){
                    //         t = t.closest('li');
                    //     };
                    //     // 如果有 入值input 就附上value值
                    //     if(inputValue[0]){
                    //         inputValue.val(t.attr("value"));
                    //     };
                    //     if(span[0]){
                    //         if(span.children().has("p")){
                    //             var text = $(e.target).text();
                    //             span.children("p").text(text);
                    //         };
                            
                    //     };
                    //     combo.showTarget.css("display", "none");
                    //     combo.removeClass("open");
                    //     combo.trigger(andy.EVENT_CLICK, t.attr("value"));
                    // }); 
                };

                // 还原默认状态
                combo.bind(setDefault, function(e, fun){
                    var touchTarget = combo.find("input:hidden");
                    var valueInput = combo.touchTarget;
                    var inputValue = "";
                    var valueArr = "";
                    var idArr = "";
                    if(valueInput.is("input") == false){
                        valueInput = combo.find("input:first");
                    } 
                    if(combo.showTarget.is("ul")){
                        combo.showTarget.children().each(function(i, li){
                            var $li = $(li);
                            if($li.hasClass("active")){
                                $li.removeClass("active");
                            }
                            if(_options.checked.length > 0){
                                for(var di in _options.checked){
                                    if($li.attr("listId") == _options.checked[di]){
                                        $li.addClass("active")
                                        if(idArr == ""){
                                            inputValue = $li.text();
                                            valueArr = $li.attr("value");
                                            idArr = $li.attr("listId")
                                        }else{
                                            inputValue += ","+$li.text();
                                            valueArr = $li.attr("value");
                                            idArr += ","+$li.attr("listId");
                                        }
                                    }
                                }
                            }
                        })
                    }

                    if(touchTarget.is("input")){
                        if(_options.checked.length > 0){
                            touchTarget.attr({"value":inputValue, "idValue":idArr, "valueData":valueArr});
                            touchTarget.val(inputValue);
                            valueInput.attr("value", inputValue);
                            valueInput.val(inputValue);
                        }else{
                            touchTarget.attr({"value":_options.defaultValue, "idValue":"", "valueData":""});
                            touchTarget.val(_options.defaultValue);
                            valueInput.attr("value", _options.defaultValue);
                            valueInput.val(_options.defaultValue);
                        }
                    }

                    if(fun){
                        fun(valueArr, idArr);
                    }
                    
                })

                // 是否禁用combo
                // console.log(combo)
                combo.bind(setEnable, function(e, isEnable){
                    combo.data("isEnable",isEnable);
                    setEnableFun();
                });


                // 绑定显示对象事件 绑定事件 可以在创建方法里面直接绑定 也可以调用绑定事件方法
                combo.an_inputcombo_creatShow("eventBind", _options);
                
                // combo.an_inputcombo_bindEvent({
                //     combo:combo,
                //     touchTargetType:touchTargetType,
                //     showTargetType:showTargetType,
                //     showUrl:showUrl
                // })

                // 设置选择id 方法
                combo.bind(setCurrentChoose, function(e, choose){

                });
            };
        },
        an_inputcombo_creatTouch:function(){
            var options = {};
            var funstyle = "";
            for(var i= 0; i <arguments.length;i++){
                var a = arguments[0];
                if(typeof a == "object"){
                    options = a;
                }else if(typeof a == "string"){
                    funstyle = a;
                }
            };

            var _options = $.extend({
                combo:"",
                comboName:"combo",
                inputVerify:"",
                checked:"",//已选id 初始化
                selects:false,
                defaultValue:"下拉选择",
                touchTargetType:""//默认显示多少行,更多的出现滚动条
                // open:false//默认关闭
            }, options);

            var addChoose = "EVENT_ADD_CHOOSE";
            var cancelChoose = "EVENT_CANCEL_CHOOSE";
            var getVal = "EVENT_GET_VALUE";
            var getChooseId = "EVENT_GET_ID";
            var comboId = $(this).attr("id");

            var combo = $("#"+comboId);
            var selectId = "";
            var seletc = "";
            if(combo.data("selects") != undefined){
                _options.selects = combo.data("selects");
            }
            
            if(funstyle != ""){
                if(funstyle == "addChoose"){
                    var touchData = arguments[1];
                    combo.trigger(addChoose, touchData)
                }else if(funstyle == "cancelChoose"){
                    var touchData = arguments[1];
                    combo.trigger(cancelChoose, touchData)
                }else if(funstyle == "getValue"){
                    var fun = arguments[1];
                    combo.trigger(getVal, fun);
                };
            }else{
                // -------------------------------------------selects 操作
                var insetSelects = function(data){
                    seletc.addElement(data)
                }

                var removeSelects = function(data){
                    seletc.deleteElement(data)
                }
                //----------------------------------------------------button touch 操作
                var addButton = function(node){
                    //插入input:id name
                    var thiscombo = $("#"+comboId);
                    var touchTarget = andy.combo("getTouchTarget", thiscombo);
                    var oldP = touchTarget.parent().find("p");
                    var inValueInput = _options.valueForInput;
                    // var inputValue;
                    // _options.combo.find("input").each(function(i, input){
                    //     if($(input).attr("type") == "hidden"){
                    //         inputValue = $(input);
                    //     }
                    // });
                    if(inValueInput.is("input") == false){
                        inValueInput.find("input").each(function(index, input){
                            inValueInput = $(input);
                        })
                    }
                    
                    var oldName = oldP.attr("value");
                    var idName = inValueInput.attr("idValue");
                    if(node.attr && typeof node.attr != "string"){
                        // node.attr = JSON.stringify(node.attr);
                        node.attr = "";
                    }

                    var inValue = inValueInput.attr("valueData");
                    if(oldName == undefined || oldName == "" || oldName == _options.defaultValue){
                        oldName = node.name;
                        idName = node.id;
                        inValue = (node.value || node.attrValue || node.attr);
                    }else{
                        oldName = oldName+"，"+node.name;
                        idName = idName+","+node.id;
                        var newV = (node.value || node.attrValue || node.attr);
                        inValue = inValue + "," +newV;
                    }
                    
                    if(_options.selects == false){
                        // console.log(node.name)
                        inValueInput.attr({"idValue":node.id, "valueData":(node.value || node.attrValue || node.attr)});
                        oldP.text(node.name);
                        // inputValue.attr({"value":node.value});
                    }else{
                        inValueInput.attr({"idValue":idName, "valueData":inValue});
                        oldP.text(oldName);
                        // inputValue.attr({"value":inValue});
                    }
                    if(inValueInput.attr("verify")){
                        // andy.inputCheck(inValueInput[0]);
                    }
                    
                }
                var insetButton = function(data){
                    var combo = $("#"+comboId);
                    if(_options.valueForInput == null){
                        if(combo.find("input").length == 0){
                            combo.append("<input type = 'hidden' name = '"+_options.inputName+"'>");
                            _options.valueForInput = combo.find("input");
                        };
                    }
                    var inValueInput = _options.valueForInput;
                    if(inValueInput.is("input") == false){
                        inValueInput.find("input").each(function(index, input){
                            inValueInput = $(input);
                        })
                    }
                    if(inValueInput && inValueInput.is("input")){
                        var idName = inValueInput.attr("idValue");
                        if(idName != undefined && idName != ""){
                            var idArr = idName.split(",");
                            var isHaveSameId = false;
                            for(var i = 0; i < idArr.length; i++){
                                if(idArr[i] == data.id){
                                    isHaveSameId = true;
                                }
                            }
                            if(!isHaveSameId){
                                addButton(data);
                            }
                        }else{
                            addButton(data);
                        }
                        
                    }
                }

                
                //-----------------------------------------------------input touch操作
                var getPathText = function(path){
                    var str = "";
                    for(var i = 0; i < path.length - 1; i++){
                            str += path[i].name+"-";
                    }
                    return str;
                }

                var addInput = function(node){
                    //插入input:id name
                    var thiscombo = $("#"+comboId);
                    // var touchTarget = andy.combo("getTouchTarget", thiscombo);
                    // var inputValue;
                    // _options.combo.find("input").each(function(i, input){
                    //     if($(input).attr("type") == "hidden"){
                    //         inputValue = $(input);
                    //     }
                    // });
                    
                    var inputValue = andy.combo("getTouchTarget", thiscombo);
                    var touchTarget = thiscombo.find("input:hidden");

                    if(inputValue.is("input") == false){
                        inputValue.find("input:first");
                    }
                    
                    var oldName = inputValue.attr("value");
                    var idName = touchTarget.attr("idValue");
                    if(node.attr && typeof node.attr != "string"){
                        // node.attr = JSON.stringify(node.attr);
                        node.attr = "";
                    }

                    var inValue = touchTarget.attr("valueData");
                    var parentName = "";
                    if(node.getParentNode && _options.selects == false){
                        parentName = getPathText(node.getPath())
                    }else if(node.path && _options.selects == false){
                        parentName = getPathText(node.path)
                    }
                    
                    if(oldName == undefined || oldName == "" || oldName == _options.defaultValue){
                        oldName = parentName+node.name;
                        idName = node.id;
                        inValue = (node.value || node.attrValue || node.attr);
                    }else{
                        oldName = oldName+"，"+parentName+node.name;
                        idName = idName+","+node.id;
                        var newV = (node.value || node.attrValue || node.attr);
                        inValue = inValue + "," +newV;
                    }
                    
                    if(_options.selects == false){
                        // touchTarget.attr({"value":parentName+node.name, "idValue":node.id, "valueData":(node.value || node.attrValue || node.attr)});
                        // touchTarget.val(parentName+node.name);
                        touchTarget.attr({"value":node.id, "idValue":node.id, "valueData":(node.value || node.attrValue || node.attr)});
                        touchTarget.val(node.id);
                        inputValue.attr("value", parentName+node.name);
                        inputValue.val(parentName+node.name);
                    }else{
                        // touchTarget.attr({"value":oldName, "idValue":idName, "valueData":inValue});
                        // touchTarget.val(oldName);
                        touchTarget.attr({"value":idName, "idValue":idName, "valueData":inValue});
                        touchTarget.val(idName);
                        inputValue.attr({"value":oldName});
                        inputValue.val(oldName);
                    }
                    if(touchTarget.attr("verify")){
                        andy.inputCheck(touchTarget[0]);
                    }
                    
                }

                // input插入
                var insetInput = function(data){
                    // console.log(touchTarget[0])
                    var touchTarget = andy.combo("getTouchTarget", $("#"+comboId));

                    if(touchTarget.is("input") == false){
                        touchTarget.find("input").each(function(index, input){
                            touchTarget = $(input);
                        })
                    }

                    if(touchTarget && touchTarget.is("input")){
                        var idName = touchTarget.attr("idValue");
                        if(idName != undefined && idName != ""){
                            var idArr = idName.split(",");
                            var isHaveSameId = false;
                            for(var i = 0; i < idArr.length; i++){
                                if(idArr[i] == data.id){
                                    isHaveSameId = true;
                                }
                            }
                            if(!isHaveSameId){
                                addInput(data);
                            }
                        }else{
                            addInput(data);
                        }
                        
                    }
                }

                

                var removeSetInput = function(treeNode){
                    // 移除input:id name
                    
                    var touchTarget = $("#"+comboId).find("input:hidden");
                    var touchValue = andy.combo("getTouchTarget", $("#"+comboId));
                    // var inputValue;
                    // _options.combo.find("input").each(function(i, input){
                    //     if($(input).attr("type") == "hidden"){
                    //         inputValue = $(input);
                    //     }
                    // });
                    if(touchValue.is("input") == false){
                        touchValue.find("input:first");
                    }


                    if(touchTarget && touchTarget.is("input")){
                        var oldName = touchValue.attr("value");
                        var idName = touchTarget.attr("idValue");

                        var inValue = touchTarget.attr("valueData");
                        // console.log("aaa:",idName)

                        var oldArr = oldName.split("，");
                        var idArr = idName.split(",");
                        var inValArr = inValue.split(",");

                        for(var i = 0; i < idArr.length; i++){
                            if(idArr[i] == treeNode.id){
                                idArr.splice(i, 1);
                                oldArr.splice(i, 1);
                                inValArr.splice(i, 1);
                            }
                        }
                        // 清空之前选择
                        touchTarget.attr("value", "");
                        touchTarget.attr("idValue", "");
                        touchTarget.attr("valueData", "");
                        var oldName = touchValue.attr("value");
                        var idName = touchTarget.attr("idValue");

                        var inValue = touchTarget.attr("valueData");
                        for(var i = 0; i < idArr.length; i++){
                            // addInput(idArr[i]);
                            var name = oldArr[i];
                            var id = idArr[i]; 
                            var valued = inValArr[i];
                            if(i == 0){
                                oldName = name;
                                idName = id;
                                inValue = valued;

                            }else{
                                oldName = oldName+"，"+name;
                                idName = idName+","+id;
                                inValue = inValue + ","+valued;
                            }
                        }

                        
                        touchValue.attr("value", oldName);
                        touchValue.val(oldName);

                        touchTarget.val(idName);
                        touchTarget.attr("value", idName);
                        touchTarget.attr("idValue", idName);
                        touchTarget.attr("valueData", inValue);
                    }
                }
                // touchTarget
                var addTouchTarget = function(touchData){
                    if(_options.touchTargetType == "input"){
                        // console.log("input")
                        insetInput(touchData);
                    }else if(_options.touchTargetType == "button"){
                        insetButton(touchData);
                    }else if(_options.touchTargetType == "selects"){
                        insetSelects(touchData);
                    }
                }

                var cancelTouchTarget = function(touchData){
                    if(_options.touchTargetType == "input"){
                        removeSetInput(touchData);
                    }else if(_options.touchTargetType == "button"){
                        removeSetButton(touchData);
                    }else if(_options.touchTargetType == "selects"){
                        removeSelects(touchData);
                    }
                }

                // 根据不同触发对象 创建不同对象
                if(_options.touchTargetType == "input"){
                    if(_options.combo.children().length == 0){
                        var enableText = "";
                        if(_options.combo.data("isEnable") == false){
                            enableText = "disabled";
                        }
                        if(_options.checked.length > 0){
                            _options.defaultValue = "";
                        }
                        _options.combo.append("<div class='u-group u-up-menu'><input class = 'item item-l u-input u-diseditor' readonly='readonly' verify = '"+_options.inputVerify+"' value = '"+_options.defaultValue+"' "+enableText+" combo = '"+_options.comboName+"'><i class='iconfont mark item item-r'></i></div>");
                        andy.formlayout();
                    }
                }else if(_options.touchTargetType == "button"){
                    if(_options.combo.children().length == 0){
                        var enableText = "";
                        if(_options.combo.data("isEnable") == false){
                            enableText = "disabled";
                        }
                        if(_options.checked.length > 0){
                            _options.defaultValue = "";
                        }
                        _options.combo.append("<span class='u-but-group u-group-center'><p style='color:#000'>"+_options.defaultValue+"</p><i class='iconfont'></i><button type='button' class='u-but-button' combo = '"+_options.comboName+"'></button></span>");
                        _options.combo.toggleClass("u-btn-eject u-group-center");
                        andy.formlayout();
                    }
                }else if(_options.touchTargetType == "selects"){
                    // 多选文本框
                    selectId = comboId+"_selects";
                    if(_options.combo.children().length == 0){
                        _options.combo.append("<div class='u-btn-eject' style='width:100%;' combo = '"+_options.comboName+"'><div class='u-btn-checkbox f-clear' id="+selectId+"></div></div>");
                    }
                    var inputName = _options.inputName;
                    if(inputName = ""){
                        inputName = comboId + "_input";
                    }
                    seletc = andy.multiSelect({
                        parent:document.getElementById(selectId),
                        dataKey:inputName,//input的name
                        list:[]
                    });
                }

                var touchTarget = andy.combo("getTouchTarget", $("#"+comboId));

                if(touchTarget.is("input") == false){
                    touchTarget = touchTarget.find("input:first");
                }
                // 绑定输入事件
                touchTarget.keyup(function(){
                    var changeValue = touchTarget.val();
                    _options.onInputChange(changeValue);
                    // _options.inputValue
                    touchTarget.attr("value", changeValue);
                    var hiddenInput = combo.find("input:hidden");
                    hiddenInput.val(changeValue);
                    hiddenInput.attr("value", changeValue);
                })

                touchTarget.blur(function(){
                    if(_options.autoclear){
                        touchTarget.attr("value", null);
                        touchTarget.val(null);
                        var hiddenInput = combo.find("input:hidden");
                        hiddenInput.val(null);
                        hiddenInput.attr("value", null);
                    }
                })

                touchTarget.mouseup(function(){
                    this.select();
                })

                combo.bind(addChoose, function(e, data){
                    // console.log(data)
                    addTouchTarget(data);
                })

                combo.bind(cancelChoose, function(e, data){
                    cancelTouchTarget(data);
                })

                combo.bind(getVal, function(e, fun){
                    var touchTarget = andy.combo("getTouchTarget", $("#"+comboId));
                    if(touchTarget){
                        var value = touchTarget.attr("valueData");
                        fun(value);
                    }
                })

                combo.bind(getChooseId, function(e, fun){
                    var touchTarget = andy.combo("getTouchTarget", $("#"+comboId));
                    if(touchTarget.is("input") == false){
                        touchTarget.find("input").each(function(index, input){
                            touchTarget = $(input);
                        })
                    }
                    if(touchTarget){
                        var idvalue = touchTarget.attr("idvalue");
                        fun(idvalue);
                    }
                })

            }
        },
        an_inputcombo_creatShow:function(){
            var options = {};
            var funstyle = "";
            for(var i= 0; i <arguments.length;i++){
                // console.log(arguments[0]);
                var a = arguments[0];
                if(typeof a == "object"){
                    options = a;
                }else if(typeof a == "string"){
                    funstyle = a;
                }
            };

            var _options = $.extend({
                combo:"",
                comboName:"combo",
                showTargetType:""//默认显示多少行,更多的出现滚动条
            }, options);

            var eventBind = "EVENT_BIND";

            if(funstyle != ""){
                if(funstyle == "eventBind"){
                    var obj = arguments[1];
                    $(this).trigger(eventBind, obj);
                };
            }else{
                if(_options.showTargetType == "list"){
                    if(_options.combo.children().length == 1){
                        _options.combo.append("<ul class = 'combo u-down-menu' combo = '"+_options.comboName+"'></ul>")
                    }
                }else if(_options.showTargetType == "tree"){
                    if(_options.combo.children().length == 1){
                        _options.combo.append("<div class='combo but-tree' style='height:"+_options.showHeight+"px;' combo ='"+_options.comboName+"'></div>")
                    }
                }

                _options.combo.bind(eventBind, function(e, obj){
                    _options.combo.an_inputcombo_bindEvent(obj)
                })
            }
        },
        an_inputcombo_getList:function(_options, data){
            var lis = "";
            if(data.length == 0){
                return lis;
            };
            for(var i = 0; i < data.length; i++){
                var liData = data[i];
                var isFist = "";
                var valueStr = "";
                var attrStr = "";
                var attrValueStr = "";

                if(i == 0){
                    isFist = "first";
                }
                if(liData[_options.valuedata]){
                    valueStr = "value = "+liData[_options.valuedata];
                }else if(liData.attrValue){
                    attrValueStr = "attrValue = " + liData.attrValue;
                }else if(liData.attr){
                    // 适用于多数据类型
                    attrStr = "attrStr = "+liData.attr;
                }
                var li = "<li class = '"+isFist+"' "+valueStr+" "+attrStr+" "+attrValueStr+" listId = '"+liData[_options.idvalue]+"' ><a>"+liData[_options.namevalue]+"</a></li>";
                if(_options.setListHtml != ""){
                    li = _options.setListHtml(liData).html;
                };
                lis += li;
            };
            return lis;
        },
        an_inputcombo_bindEvent:function(){
            // 绑定选中事件
            var options = {};
            var funstyle = "";
            for(var i= 0; i <arguments.length;i++){
                // console.log(arguments[0]);
                var a = arguments[0];
                if(typeof a == "object"){
                    options = a;
                }else if(typeof a == "string"){
                    funstyle = a;
                }
            };

            var _options = $.extend({
                combo:"",
                selects:false,
                checked:[],//已选id 初始化
                treeId:"",//下拉树ID
                onChange:function(){},
                touchTargetType:"input",
                showTargetType:"list",
                showUrl:""
            }, options);

            var touchTarget = _options.combo.touchTarget;
            var showTarget = _options.combo.showTarget;

            if($(this).data("selects") != undefined){
                _options.selects = $(this).data("selects");
            }

            if(funstyle != ""){
                if(funstyle == "setCurrentChoose"){
                };
            }else{

                // =========================================通用 显示对象方法

                // 更新显示对象 显示对象 是否清楚以前结构
                var setCurrentShow = function(show, isClear){
                    var combo = _options.combo;
                    if(isClear){
                        combo.showTarget.empty();
                    };
                    if(show instanceof jQuery){  
                        combo.showTarget = show;
                    }else{
                        combo.showTarget = $(show);
                    };
                };

                var addTouch = function(touchData){
                    // if(_options.touchTargetType == "input"){
                        // console.log(touchData)
                        if(touchData.checked){
                            _options.combo.an_inputcombo_creatTouch("addChoose", touchData);
                        }else{
                            _options.combo.an_inputcombo_creatTouch("cancelChoose", touchData);
                        }
                    // }
                }

                var goTreeCheck = function(treeNode, isCheck){
                    // console.log(treeNode, isCheck);
                    // var nodes = treeObj.getSelectedNodes();
                    // console.log(treeNode.checked)
                    // 插入 触发对象 利用统一方法入口
                    if (treeNode && isCheck && treeNode.checked) {
                        if (treeNode.children && _options.selects) {
                            // insetInput(treeNode);
                            _options.combo.an_inputcombo_creatTouch("addChoose", treeNode);
                            for (var i = 0; i < treeNode.children.length; i++) {
                                goTreeCheck(treeNode.children[i], isCheck);
                            }
                        } else {
                            // insetInput(treeNode);
                            _options.combo.an_inputcombo_creatTouch("addChoose", treeNode);
                        }
                    } else if (!isCheck) {
                        if (treeNode.children) {
                            // removeSetInput(treeNode);
                            _options.combo.an_inputcombo_creatTouch("cancelChoose", treeNode);
                            for (var i = 0; i < treeNode.children.length; i++) {
                                goTreeCheck(treeNode.children[i], isCheck);
                            }
                        } else {
                            // removeSetInput(treeNode);
                            _options.combo.an_inputcombo_creatTouch("cancelChoose", treeNode);
                        }
                    }
                }

                var onTreeCheck = function(treeNode){
                    if(treeNode){
                        goTreeCheck(treeNode, treeNode.checked);
                        // if(treeNode.checked){
                        //     // 选取
                        //     goTreeCheck(treeNode, true);
                        // }else{
                        //     // 取消
                        //     goTreeCheck(treeNode, false);
                        // }
                    }
                }

                var setChecked = function(treeId, checked){
                    if(!checked){
                        return false;
                    }
                    var treeObj = $.fn.zTree.getZTreeObj(treeId);
                    for(var i = 0; i < checked.length; i++){
                        var node = treeObj.getNodeByParam("id", checked[i], null);
                        if(node){
                            treeObj.checkNode(node, true, true);
                            var nodec = {
                                path:node.getPath(),
                                children:node.children,
                                value:node[_options.valuedata],
                                attr:node.attr || "",
                                name:node[_options.namevalue],
                                children:node.children,
                                checked:node.checked,
                                id:node[_options.idvalue]
                            }
                            onTreeCheck(nodec);
                        }
                    }

                }

                var getLiData = function(li){
                    // 从li标签里面获取数据
                    var liData = {
                        checked:li.hasClass("active"),
                        value:li.attr("value"),
                        id:li.attr("listId"),
                        name:li.text()
                    }
                    return liData;
                }

                // 创建列表结构
                var creatListShow = function(){
                    // 绑定事件
                    var checkLenght = _options.checked.length;
                    showTarget.children().each(function(index, li){
                        // 初始化\
                        var $li = $(li);
                        // 如果li标签 没有识别listId 则主动以索引赋予
                        if(!$li.attr("listId")){
                            $li.attr("listId", _options.combo.attr("id")+"_"+index);
                        }
                        if(checkLenght > 0){
                            for(var i = 0; i< checkLenght; i++){
                                if($li.attr("listId") == String(_options.checked[i])){
                                    $li.addClass("active");
                                    var liData = getLiData($li);
                                    addTouch(liData)
                                }
                            }

                        }
                        $li.unbind("click");
                        $li.on("click", function(e){
                            var t = $(e.target);
                            if(t.is('li') == false){
                                t = t.closest('li');
                            };
                            
                            if(!_options.selects){
                                showTarget.children().each(function(index, li){
                                    $(li).removeClass("active");
                                })
                            }
                            t.toggleClass("active");
                            var touchData = getLiData(t);
                            $li.comboData = touchData;
                            
                            addTouch(touchData)
                            $("#"+_options.comboId).trigger(andy.COMBO_CHOOSE_LISET, $li);
                            _options.onChange($li);
                            // 点击隐藏列表
                            if(_options.selects == false){
                                andy.combo("hiddenTarget", _options.combo);
                            }
                        })
                    })
                    
                }

                // 创建树结构
                var createTree = function(id, set, nodes, op){
                    var treeId = id;
                    _options.selects = op.selects;//是否多选 true为多选
                    var checked = op.checked;
                    var combo = _options.combo;
                    
                    //树设置
                    var setting = {
                        treeObj:null,
                        callback:{
                            onCheck:function(event, treeId, treeNode) {
                                var node = {
                                    path:treeNode.getPath(),
                                    children:treeNode.children,
                                    value:treeNode[_options.valuedata],
                                    attr:treeNode.attr || "",
                                    name:treeNode[_options.namevalue],
                                    children:treeNode.children,
                                    checked:treeNode.checked,
                                    id:treeNode[_options.idvalue]
                                }
                                onTreeCheck(node);
                                _options.onChange(treeNode);
                            }
                        },
                        check: {
                            enable: true,
                            autoCheckTrigger: true,
                            chkStyle: "checkbox",
                            chkboxType: { "Y": "s", "N": "s" }
                        },
                        data: {
                            key:{
                                name:_options.namevalue
                            },
                            simpleData: {
                              enable: true,
                              idKey:_options.idvalue
                            }
                        }
                    };

                    if(_options.treeCheckBoxType != {}){
                        setting.check.chkboxType = _options.treeCheckBoxType;
                    }
                    // 异步树设置
                    if(_options.treeAsync != {}){
                        setting.async = _options.treeAsync;
                    }
                    // 单选多选设置
                    if(_options.selects == false){
                        setting.check = {
                            enable:true,
                            radioType: "all",
                            chkStyle:"radio"
                        }
                    }

                    if(set){
                        setting = $.extend(true, {}, setting, set);
                    };

                    // 插入树结构
                    combo.showTarget.append("<div class='g-h-max'><ul id='"+treeId+"' class='ztree'></ul></div>");
                    var tree = "";
                    // 判断是否加载ztree结构json
                    if(nodes){
                        $.fn.zTree.init($("#" + treeId), setting, nodes);
                        tree = $("#" + treeId);
                        setChecked(treeId, checked);
                        setCurrentShow(combo.showTarget);
                    }else if(op && op.url){
                        andy.loaddata(op.url, function(data){
                            data = andy.stringToJson(data);
                            // console.log(combo.showTarget)
                            $.fn.zTree.init($("#" + treeId), setting, data);
                            tree = $("#" + treeId);
                            setChecked(treeId, checked);
                            setCurrentShow(combo.showTarget);
                        })
                    };
                }

                // showTarget
                var initShow = function(data){
                    if(_options.showTargetType == "list"){
                        var lis = _options.combo.an_inputcombo_getList(_options, data);
                        showTarget.append(lis);

                        creatListShow();
                    }else if(_options.showTargetType == "tree"){
                        if(_options.treeId == ""){
                            _options.treeId = "treeId_"+andy.getRandom(10000);
                        };
                        createTree(_options.treeId, _options.treeSetting, data, _options);
                    }
                    
                }

                if(_options.showUrl == null || _options.showUrl == "" && _options.showData.length == 0){
                    if(_options.showTargetType == "list"){
                        creatListShow();
                    };
                    return false;
                }else if(_options.showData.length > 0){
                    if(typeof(_options.showData) == "string"){
                        _options.showData = andy.stringToJson(_options.showData);
                    }
                    initShow(_options.showData);
                }else if(_options.showUrl != ""){
                    andy.loaddata(_options.showUrl, function(data){
                        data = andy.stringToJson(data)
                        if(data.length > 0){
                            initShow(data);
                        }
                    })
                }else{
                    if(_options.showTargetType == "list"){
                        creatListShow();
                    }
                }

                _options.combo.bind("EVENT_CHOOSE", function(e, choose){
                    showTarget.children().each(function(index, li){
                        // 初始化\
                        var $li = $(li);
                        for(var i = 0; i < choose.choose.length; i++){
                            if(parseInt($li.attr("listId")) == choose.choose[i]){
                                if(!_options.selects){
                                    showTarget.children().each(function(index, li){
                                        $(li).removeClass("active");
                                    })
                                }
                                $li.addClass("active");
                                var liData = getLiData($li);
                                addTouch(liData)
                            }
                        }
                       
                    })
                })
            }
        }
    });
})(jQuery);/*path */
/**
 * 路径导航/面包屑
 * author:林耘宇
 **/

 (function ($) {
    $.fn.extend({
        an_path:function(){
            var options = {};
            var funstyle = "";
            var arg = arguments[0];
            (typeof arg == "object")? options = arg:funstyle = arg;

            var _options = $.extend({
                url:"",
                data:"",
                disableA:false,//是否禁用a标签链接
                spliteIcon:"",
                onClick:function(){}
            }, options);

            var path = $(this);

            // 私有事件
            var reset = "EVENT_RESET";

            // 获取 设置对象
            var getOption = path.attr("options");
            if(getOption){
                 getOption = "{"+ getOption+"}";
                 getOption = andy.stringToJson(getOption);
                // 处理设置
                for(var name in getOption){
                    if(getOption[name] == "true"){
                        _options[name] = true;
                    }else if(getOption[name] == "false"){
                        _options[name] = false;
                    }else{
                        _options[name] = getOption[name];
                    }
                }
            }

            if(funstyle != ""){
                if(funstyle == "reset"){
                    var obj = {
                        data:arguments[1]
                    }
                    path.trigger(reset, obj);
                };
            }else{

                function creatList(data){
                    var str ="";
                    for(var i = 0;i<data.length;i++){
                        var d = data[i];
                        var target, url,icon, isHome, active;
                        isHome = i ==0?"home":"";
                        active = (i == data.length - 1)?" active":"";
                        url = d.url && d.url!= "" && _options.disableA == false?d.url:"javascript:;";
                        spliteIcon = "<i class = 'iconfont'>"+_options.spliteIcon+"</i>";
                        icons = d.icons && d.icon != ""?"<i class = 'iconfont homeicon'>"+d.icons+"</i>":"";
                        d.target && d.target!= ""?target = "target="+d.target:target = "";
                        str += "<li liId = "+d.id+" class = "+isHome+ active+" ><a href ="+url+" target = "+target+">"+
                        icons+d.text+spliteIcon+"</a></li>";
                    }
                    path.append(str)
                    path.find("li").each(function(index, li){
                        var $li = $(li);
                        $li.data("json", data[index])
                        $li.click(function(e){
                            _options.onClick($(this).data("json"))
                            e.preventDefault()
                        })
                    })
                }

                function loadData(){
                    if(_options.url!= ""){
                        andy.loadData(_options.url, function(data){
                            creatList(data)
                        })
                    }else{
                        creatList(_options.data)
                    }
                }

                function init(){
                    loadData()
                }
                init()


                // 方法执行
                path.bind(reset, function(e, obj){
                    path.empty()
                    creatList(obj.data)
                })
            }; 
        }
    });
})(jQuery);/*scrolltabs */
/**
 * 滚动切换
 * author:林耘宇
 **/
 (function ($) {
    $.fn.extend({
        an_scrolltabs:function(){
            var options = {};
            var funstyle = "";
            var arg = arguments[0];
            var scroll = $(this);
            (typeof arg == "object")? options = arg:funstyle = arg;

            // 初始配置
            var _options = $.extend({
                scrollId:"",
                minStep:2,//最小滚动步长
                stepWidth:0,//按照宽度来移动
                isContentMove:false,//是否根据内容元素来滚动
                isAnimation:true,//是否启用动画
                animationTime:300,//动画时长
                isBarPlaceholder:false,//切换按钮是否占位
                isFitParent:true,
                autoHidden:false,//是否自动隐藏按钮，在没有鼠标的时候
                resizeHanld:null,
                alwaysShow:false
            }, options);

            if(_options.scrollId == ""){
                scroll = andy.setRandomId(scroll, "scrolltabs_");
                _options.scrollId = scroll.attr("id");
            }

            // 获取 设置对象
            var getOption = scroll.attr("options");
            if(getOption){
                 getOption = "{"+ getOption+"}";
                 getOption = andy.stringToJson(getOption);
                // 处理设置
                for(var name in getOption){
                    if(getOption[name] == "true"){
                        _options[name] = true;
                    }else if(getOption[name] == "false"){
                        _options[name] = false;
                    }else{
                        _options[name] = getOption[name];
                    }
                }
            }

            scroll.data("options", _options)

            if(funstyle != ""){
                scroll[arg]?scroll[arg](arguments[1]):null;
            }else{
                var parentWidth = scroll.parent().innerWidth();
                var parentHeight = scroll.parent().innerHeight();
                scroll.wrap("<div class='m-scrolltabs'></div>");
                scroll.wrap("<div class='scrolltabs-con f-clear'></div>");
                scroll.css({
                    "position":"absolute",
                    "left":0
                })

                var top = scroll.parent().parent();
                var center = scroll.parent();
                
                var left = "<div class='iconfont left-bar'></div>";
                top.append(left)
                left = top.find(".left-bar");
                var right = "<div class='iconfont right-bar'></div>";
                top.append(right)
                right = top.find(".right-bar");

                if(_options.width && _options.width > 0){
                    top.outerWidth(_options.width)
                }
                if(_options.height && _options.height > 0){
                    top.outerHeight(_options.height)
                }else{
                    top.outerHeight(parentHeight)
                }
                if(_options.isBarPlaceholder == false){
                    top.addClass("m-scrolltabs-cover")
                }else if(_options.width && _options.width > 0){
                    top.outerWidth(top.outerWidth() - left.outerWidth() * 2)
                }

                if(_options.autoHidden){
                    left.hide()
                    right.hide()
                }

                scroll.setWidth = function(){
                    var cc = scroll.getChildren();
                    var all = 0;

                    cc.each(function(index, cell){
                        all += $(cell).outerWidth();
                    })
                    scroll.innerWidth(all+1)
                    scroll.css("display","block")
                }

                // 方法处理
                scroll.getChildren = function(){
                    var cc;
                    if(center.children().length > 1){
                        cc = center.children();
                    }else if(center.children().children().length > 1){
                        cc = center.children().children();
                    }
                    return cc;
                }

                scroll.getDis = function(delta){
                    var cc, moveDis = 0, currentDis = 0, left = parseInt(scroll.css('left'));
                    cc = scroll.getChildren()

                    if(delta < 0){
                        currentDis = left < 0?-left+center.width():left+center.width();
                    }else{
                        currentDis = left < 0?-left:left;
                    }
                    
                    cc.each(function(index, cell){
                        if(moveDis <= currentDis){
                            moveDis+=$(cell).outerWidth();
                            if(moveDis > currentDis){
                                if(delta < 0){
                                    moveDis = (moveDis - currentDis);
                                }else{
                                    if($(cell).outerWidth() == (moveDis - currentDis)){
                                        moveDis = $(cell).outerWidth();
                                    }else{
                                        moveDis = $(cell).outerWidth() - (moveDis - currentDis);
                                    }
                                    
                                }
                                return false;
                            }
                        }
                    })

                    // console.log(center.children().length, center.children().children().length)
                    // console.log(center.children().width(), center.children().children().width())
                    return moveDis;
                }
                scroll.disMoveBar = function(delta){
                    if(scroll.width() < top.width()){
                        left.hide();
                        right.hide();
                        return false;
                    }else{
                        left.show()
                        right.show()
                    }

                    var disWidth = scroll.outerWidth() - center.width();
                    var counts = Math.ceil(disWidth/center.width());
                    // 步长和内容长度有关系
                    counts > _options.minStep?_options.minStep=counts:null;
                    var addContent = _options.stepWidth > 0?_options.stepWidth:disWidth/counts;

                    if(_options.isContentMove){
                        addContent = scroll.getDis(delta);
                    }

                    var contentWidth = parseInt(scroll.css("left"))+delta*addContent;
                    if(contentWidth < -disWidth){
                        contentWidth = -disWidth;
                    }else if(contentWidth > 0){
                        contentWidth = 0;
                    }
                    if(_options.isAnimation){
                        scroll.animate({"left":contentWidth}, _options.animationTime)
                    }else{
                        scroll.css("left", contentWidth)
                    }
                }

                scroll.isShow = function(){
                    if(scroll.width() < top.width()){
                        return false;
                    }else{
                        if(_options.autoHidden){
                            left.show()
                            right.show()
                        }
                    }
                }


                // 触发事件
                left.click(function(){
                    scroll.disMoveBar(1)
                })

                right.click(function(){
                    scroll.disMoveBar(-1)
                })

                top.mouseover(function(){
                    scroll.isShow()
                })

                top.mouseout(function(){
                    if(_options.autoHidden){
                        left.hide()
                        right.hide()
                    }
                })

                top.mouseenter(function(){
                    scroll.isShow()
                })

                scroll.setWidth()

                $(window).resize(function(event){
                    if(_options.isFitParent){
                        if(_options.resizeHanld == null){
                            _options.resizeHanld = setTimeout(function(){
                                scroll.disMoveBar()
                                _options.resizeHanld = null;
                            }, 300)
                        }else{
                            clearTimeout(_options.resizeHanld)
                            _options.resizeHanld = setTimeout(function(){
                                scroll.disMoveBar()
                                _options.resizeHanld = null;
                            }, 300)
                        }
                    }
                    
                })

            }
        }
    });
})(jQuery);