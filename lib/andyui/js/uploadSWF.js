/*uploadSWF */
/**
 * 上传控件 单文件 多文件上传
 * author:林耘宇
 **/
(function ($) {
    $.fn.extend({
        an_uploadSWF:function(){
            var options = {};
            var funstyle = "";
            var arg = arguments[0];
            (typeof arg == "object")? options = arg:funstyle = arg;

            var _options = $.extend({
                uploadUrl:"",//上载文件路径
                uploadTemporaryUrl:"",//多文件上传临时目录
                touchFile:"",//触发打开文件事件对象
                fileType:"",//允许文件类型 "Images(jpg gif png):*.jpg;*.gif;*.png" 可后续增加mac系统文件类型
                uploadDataFieldName:"file",//上传文件数据 数据头属性名
                imgUrl:"/andyui/admin/img/",//图片资源地址
                swfUrl:"/andyui/admin/swf/",//swf资源地址
                swf:"uploadSWF.swf",//加载FLASH文件名
                xmlUrl:"",//xml文件路径配置
                width:37,//flash宽度
                fileTextLength:10,//上传描述字段限制长度
                height:37,//flash高度
                files:false,//默认多文件为true
                filesCounts:999,//限制多文件上传个数
                dialog:true,//多文件上传是否出现对话框
                oneImgView:true,//单文件上传预览
                data:"",//需要同步POST的数据 只支持字符串类型
                icon:{
                    img:"img.jpg",//预览图标
                    s_img:"s_imgs.jpg",//小图标
                    file:"file_img.jpg", //预览文件图标
                    s_file:"s_file_img.jpg" //预览文件小图标
                },
                uploadComplete:function(){},//上传完成回调
                onSubmit:function(){}
            }, options);

            var upload = $(this);
            var upload_id = upload.attr("id");
            if(upload_id == false){
                upload_id = "upload" + andy.getRandom(999);
            }

            var selectBoxId = upload_id + "_box";

            // 获取 设置对象
            var getOption = upload.attr("options");
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

            upload = $(this);

            var touchTarget = upload.find("[touchTarget]");//点击对象 打开file的
            var preview = upload.find("[preview]");//显示对象
            var dialogId = upload_id+"_uploadDialog";
            var dialog = "";
            var isUploadListComplete = false;
            var isSuccess = false;

            // 私有事件
            var showFun = "SHOW_FUNCTION";//显示缩略图
            var progress = "UPLOAD_PROGRESS";//加载进度
            var completeData = "COMPLETE_DATA";//加载数据完成
            var uploadListComplete = "UPLOAD_LIST_COMPLETE";//多文件加载完毕
            var getCurrentData = "GET_CURRENT_DATA";//获取当前文件数据
            var setCurrentDataNull = "SET_CURRENT_DATA_NULL";//置空当前文件数据

            // 图片格式定义
            var imgStyle = [".jpg",".jpeg", ".png", ".bmp", ".gif", ".eps", ".tif", ".PNG"];
            var b_img = "<img src='"+_options.imgUrl+_options.icon.img+"'>";//预览大图
            var s_img = "<img src='"+_options.imgUrl+_options.icon.s_img+"'>";//预览小图
            var b_file = "<img src='"+_options.imgUrl+_options.icon.file+"'>";
            var s_file = "<img src='"+_options.imgUrl+_options.icon.s_file+"'>";

            if(funstyle != ""){
                if(funstyle == "showFun"){
                    var data = arguments[1];
                    upload.trigger(showFun, data);
                }else if(funstyle == "progress"){
                    var loaded = arguments[1];
                    var total = arguments[2];
                    var num = arguments[3];
                    var target = arguments[4];
                    var data = {
                        loaded:loaded,
                        total:total,
                        num:num,
                        target:target
                    };
                    upload.trigger(progress, data);
                }else if(funstyle == "completeData"){
                    var data = arguments[1];
                    upload.trigger(completeData, data);
                }else if(funstyle == "uploadListComplete"){
                    var isOk = arguments[1];
                    upload.trigger(uploadListComplete, isOk);
                }else if(funstyle == "getCurrentData"){
                    var fun = arguments[1];
                    upload.trigger(getCurrentData, fun);
                }else if(funstyle == "setCurrentDataNull"){//置空当前上传文件 add 20161225
                    upload.trigger(setCurrentDataNull);
                }
            }else{

                // flash对象插入
                var swfId = upload_id+"_flashvars";
                var swf = "<div style=' position:absolute; right:-1px; top:-1px; filter: alpha(opacity=0);-moz-opacity:0;-khtml-opacity:0;opacity:0;'>"+
                  "<object classid='clsid:d27cdb6e-ae6d-11cf-96b8-444553540000' codebase='http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0' width="+_options.width+" height="+_options.height+"  name='"+swfId+"' id='"+swfId+"' align='center'>"+
                    "<param name='wmode' value='transparent' />"+
                    "<param name='allowscriptAccess' value='always' />"+
                    "<param name='movie' value='"+_options.swfUrl +_options.swf+"' />"+
                    "<param name='FlashVars' value='uploadUrl="+_options.uploadUrl+"&uploadTemporaryUrl="+_options.uploadTemporaryUrl+"&uploadId="+upload_id+"&files="+_options.files+"&data="+_options.data+"&uploadDataFieldName="+_options.uploadDataFieldName+"&xmlUrl="+_options.xmlUrl+"&fileType="+_options.fileType+"&filesCounts="+_options.filesCounts+"' />"+
                    "<embed src='"+_options.swfUrl +_options.swf+"' FlashVars='uploadUrl="+_options.uploadUrl+"&uploadTemporaryUrl="+_options.uploadTemporaryUrl+"&uploadId="+upload_id+"&files="+_options.files+"&data="+_options.data+"&uploadDataFieldName="+_options.uploadDataFieldName+"&xmlUrl="+_options.xmlUrl+"&fileType="+_options.fileType+"&filesCounts="+_options.filesCounts+"' allowscriptAccess='always' quality='high' bgcolor='#ffffff' width="+_options.width+" height="+_options.height+" name='"+swfId+"' allowFullScreen='true' align='center' type='application/x-shockwave-flash' pluginspage='http://www.macromedia.com/go/getflashplayer' />"+
                  "</object></div>";

                // 对话框底部按钮
                var dialog_bottom = "<div class='f-bg-light-lt400 f-p-xs f-info-r'>"+
                                        "<a class='u-btn texture f-ng-p-sm submit'>确定</a>"+
                                    "</div>";

                // 文本框
                var multiSelectBox = "<div class='checkbox' id='"+selectBoxId+"' preview></div>";
                var showimg = "<div class='upload-box f-hidden' showimg><ul class='m-list img upload-list'></ul></div>";
                upload.find(".item:first").prepend(multiSelectBox)

                var multiSelect = andy.multiSelect({
                    parent: document.getElementById(selectBoxId),
                    dataKey: selectBoxId,//input的name
                    removeIndex:true,
                    onDelete:function(index){
                        multiSelect.json.splice(index - 1, 1)
                        removeUl();
                    },
                    list: []
                });
                multiSelect.json = [];

                // ul生成
                upload.find(".checkbox").append(showimg)
                // var ul = "<ul class='u-upload-down upload-list f-hidden' showimg><ul>";
                // upload.append(ul);
                var showImg = upload.find("[showimg]");
                var previewBox = upload.find("[preview]");
                // multiSelect.addElement({text: "电子信息", val: "a"})

                // 当前选中数据结构
                var currentData = [];

                // 插入script

                var _showFun = upload_id+"_showFun";
                var _completeDataFun = upload_id+"_completeData";
                var _progressFun = upload_id+"_progress";
                var _uploadListCompleteFun = upload_id+"_uploadListComplete";
                var script = "<script>"+
                    // 添加显示对象图片方法
                    "function "+_showFun+"(data)"+
                    "{ $('#"+upload_id+"').an_uploadSWF('showFun', data)};"+
                    "window['"+_showFun+"'] = "+_showFun+";"+
                    "function "+_completeDataFun+"(data)"+
                    "{ $('#"+upload_id+"').an_uploadSWF('completeData', data)};"+
                    "window['"+_completeDataFun+"'] = "+_completeDataFun+";"+
                    "function "+_progressFun+"(loaded, total, num, target)"+
                    "{ $('#"+upload_id+"').an_uploadSWF('progress', loaded, total, num, target)};"+
                    "window['"+_progressFun+"'] = "+_progressFun+";"+
                    "function "+_uploadListCompleteFun+"(isOk)"+
                    "{ $('#"+upload_id+"').an_uploadSWF('uploadListComplete', isOk)};"+
                    "window['"+_uploadListCompleteFun+"'] = "+_uploadListCompleteFun+";"+
                "</script>";

                // if(_options.files == false){
                    upload.after(script);
                // }

                var openDialog = function(){
                    touchTarget.on("click", function(){
                        $(document).an_dialog({
                            id:dialogId,
                            locMyself:true,
                            onBeforeClose:function(){
                                // 关闭对话框验证
                                if(currentData.length == 0){
                                    isSuccess = true;
                                }
                                if(isSuccess == false){
                                    var se=confirm("是否放弃上传?");
                                    if (se==true){
                                        currentData = [];
                                        return true;
                                    }else{
                                        return false;
                                    }
                                }else{
                                    isSuccess = false;
                                    return true;
                                }
                            },
                            title: "文件上传管理",
                            html: "<div class='f-p-sm g-h-auto' style = 'height:325px;overflow-y:auto;'><ul class='m-list img upload-list'><li class='last'><img src='"+_options.imgUrl+"img1.jpg'></li></ul></div>"+dialog_bottom,
                            width:675,
                            height:430
                        });
                        dialog = $("#"+dialogId);

                        dialog.find(".last").append(swf);
                        var submit = dialog.find(".submit");
                        submit.isClick = false;
                        // 初始化已经上传的
                        resetView()
                        // currentData = multiSelect.json;
                        submit.on("click", function(){
                            if(isUploadListComplete == false && currentData.length > 0){
                                alert("文件还未上传完毕！");
                            }
                            if(currentData.length == 0){
                                isSuccess = true;
                                dialog.an_dialog("close");
                            }
                            if(isUploadListComplete && _options.uploadUrl != "" && submit.isClick == false){
                                // 上传成功返回
                                submit.isClick = true;
                                preview.html("正在提交...");
                                // 有JSON对象的时候使用JSON.parse
                                // 如果没有就使用eval
                                //var jd = andy.stringToJson(currentData);
                                // console.log(jd);
                                // andy.postdata(_options.uploadUrl, jd, function(data){
                                //  alert("提交完成");
                                // })
                                // 支持浏览器跨域
                                $.support.cors = true;
                                $.post(_options.uploadUrl, currentData, function(data, textStatus){
                                    // alert("提交完成");
                                    if(textStatus == "success"){
                                        preview.html("上传成功");
                                        isSuccess = true;
                                        _options.onSubmit(currentData);//触发提交完成方法
                                        dialog.an_dialog("close");
                                        addBoxByUpload(currentData)
                                        
                                        multiSelect.json = currentData;
                                        // currentData = [];
                                    }else{
                                        submit.isClick = false;
                                        alert("提交失败,请重新尝试!");
                                        preview.html("上传失败:"+textStatus);
                                    }
                                });
                            }
                        })
                    });
                };

                var creatList = function(){
                    var contentHeight = upload.height();
                    upload.append("<div class='f-p g-h-max' id = '"+dialogId+"' style = 'overflow-y:auto;'><ul class='m-list img upload-list'><li class='last'><img src='"+_options.imgUrl+"img1.jpg'></li></ul></div>");
                    dialog = $("#"+dialogId);
                    dialog.outerHeight(contentHeight);
                    dialog.find(".last").append(swf);
                };

                var addBoxByUpload = function(mulData){
                    var chooseData = mulData;
                    var mulData = multiSelect.json;
                    // 清空multibox
                    multiSelect.emptyElement()
                    for(var i in chooseData){
                        var data = chooseData[i];
                        var str = getStr(data)
                        // if(!checkIsHavdSame(data.name)){
                            multiSelect.addElement({text: str+"-"+parseInt(data.size/1024)+"kb", id:data.name})
                            var $img = previewBox.find(".option-block").last();
                            var imgUrl = data.pathUrl;
                            $img.on("mouseover", function(e){
                                createUl("<img src = '"+imgUrl+"'>", data);
                            });
                            $img.on("mouseout", function(e){
                                removeUl();
                            })
                        // }
                    }
                    
                }

                var resetView = function(){
                    var mulData = multiSelect.json;
                    currentData = JSON.parse(JSON.stringify( mulData ))
                    for(var i in mulData){
                        var data = mulData[i];
                        var imgPic = "<img src = '"+data.pathUrl+"'>";
                        var li = "<li filename ='"+data.name+"' >"+imgPic+"<div class='title'>"+data.name+"</div>"+
                         "<div class='close'><i class='iconfont'>&#xe62a; 删除</i></div></li>";;
                        dialog.find(".upload-list").prepend(li);
                        var file = getFileByFilename(data.name);
                        file.data("json", data)
                        file.find("i").on("click", function(e){
                            // 移除当前file == li
                            var $file = $(e.target).parent().parent();
                            $(e.target).unbind("click");
                            var arr = $file.data("json");
                            $file.remove();
                            delData(arr);
                        });
                        setImgSize(file.find("img"), data.pathUrl, false);
                    }
                }

                // ---------------数据操作

                var checkIsHavdSame = function(name){
                    // 多文件上传 判断是否重复添加对象
                    var isHave = false;
                    var hasData = multiSelect.json;
                    for(var i in hasData){
                        // console.log(hasData[i].name, name)
                        if(name == hasData[i].name){
                            isHave = true;
                        }
                    }
                    return isHave;
                }
                var delData = function (arr){
                    for(var i = 0; i<currentData.length; i++){
                        if(currentData[i].name == arr.name && currentData[i].size == arr.size){
                            currentData.splice(i,1);
                        }
                    }
                };

                var getStr = function(data){
                    var strArr = data.name.split(".");
                    strArr.pop()
                    var str = "";
                    for(var i in strArr){
                        str += i==0?strArr[i]:"."+strArr[i];
                    }
                    if(str.length>_options.fileTextLength){
                        str = str.substring(0, _options.fileTextLength)+"~"+data.type;
                    }else{
                        str = data.name;
                    }
                    return str;
                }

                // 本地数据验证是否有相同文件
                var isHaveSameFile = function(arr){
                    var isHave = false;
                    for(var i = 0; i<currentData.length; i++){
                        if(currentData[i].name == arr.name && currentData[i].size == arr.size){
                            if(currentData[i].replaceName && currentData[i].replaceName == arr.replaceName){
                                isHave = true;
                            }else if(!currentData[i].replaceName){
                                isHave = true;
                            }
                        }
                    }
                    return isHave;
                };

                // 通过文件名查找多文件列表对象
                var getFileByFilename = function(filename){
                    return dialog.find(".upload-list [filename = '"+filename+"']")
                };

                // 对象上传完成
                var changeComplete = function(imgUrl){
                    var $img = preview.find("img").last();
                    previewBox.attr("img", imgUrl);
                    showImg.find("img").attr("src", imgUrl);
                    upload.isComplete = true;
                    showImg.addClass("f-hidden").removeClass("f-show")
                    showImg.find("ul").empty();
                    // 预览图片加载
                    if(imgUrl){
                        setImgSize($img, imgUrl, true);
                    }
                };

                // 检查对象类型是否是图片
                var checkIsImg = function(imgType){
                    var isImg = false;
                    for(var i = 0; i < imgStyle.length; i++){
                        if(imgType == imgStyle[i]){
                            isImg = true;
                        }
                    }
                    return isImg;
                };

                // 设置图片大小
                var setImgSize = function(imgPic, url, auto){
                    if(!imgPic){
                        return false;
                    }

                    var imgPicWidth = imgPic.parent().width() || 120;
                    var imgPicHeight = imgPic.parent().height() || 100;
                    imgPic.attr("src", url);
                    var imgPicHeightSelf = imgPic.height();
                    imgPicHeightSelf>120?imgPicHeightSelf = 100:null;
                    
                    // imgPicWidth>imgPicHeight?imgPic.width(imgPicWidth):imgPic.height(imgPicHeight);
                    
                    auto?imgPic.height(imgPicHeight):imgPic.height(imgPicHeightSelf);
                    imgPic.parent().css("text-align", "center");
                };

                var createUl = function(imgPic, data){
                    showImg.removeClass("f-hidden").addClass("f-show");

                    // var li = "<li>"+imgPic+"<div class='title'>"+data.name+"</div>"+
                    var li = "<li>"+imgPic+"</li>";
                    //"<div class='u-progress xs'><div class='bar' style='width:0%'></div></div></li>";
                    showImg.find("ul").append(li);
                    var showPic = showImg.find("img");
                    // var previewPic = preview.find("img");
                    
                    // if(showPic.attr("src") != previewBox.attr("img") && checkIsImg(data.type)){
                        setImgSize(showPic, previewBox.attr("img"), true);
                    // }
                };

                var removeUl = function(){
                    showImg.removeClass("f-show").addClass("f-hidden");
                    showImg.find("ul").empty();
                };
                
                // 打开对话框
                if(_options.files == false){
                    touchTarget.after(swf);
                }else{
                    if(_options.dialog == true){
                        openDialog();
                    }else{
                        creatList();
                    }
                }

                // 自定义 touch对象功能预留

                // 获取当前数据方法
                upload.bind(getCurrentData, function(e, fun){
                    fun(currentData);
                });

                upload.bind(setCurrentDataNull,function(){
                    currentData = [];
                });

                // 方法事件绑定
                upload.bind(showFun, function(e, data){
                    var s_imgPic = s_file;
                    var imgPic = b_file;
                    if(checkIsImg(data.type)){
                        s_imgPic = s_img;
                        imgPic = b_img;
                    }
                    // if(_options.files == false){
                    //     preview.empty();
                    // }
                    
                    // 创建对话框单文件内容
                    if(dialog != ""){
                        var arr = $.makeArray(data);
                        if(isHaveSameFile(arr[0]) == false){
                            var liLength = dialog.find(".upload-list li").length;
                            var touch = dialog.find(".last");
                            if(isHaveSameFile(arr[0]) == false && liLength <= _options.filesCounts){
                                var li = "<li filename ='"+data.name+"' >"+imgPic+"<div class='title'>"+data.name+"</div>"+
                                 "<div class='u-progress xs'><div class='bar' style='width:0%'></div></div></li>";;
                                dialog.find(".upload-list").prepend(li);
                                var $li = getFileByFilename(data.name);
                                $li.find("img").css("opacity", 0.5);
                                $li.attr("isComplete", false);
                            }
                            if(liLength < _options.filesCounts){
                                // touch.width(_options.width)
                                // touch.css("display","block")
                            }
                            if(liLength > _options.filesCounts){
                                // touch.width(0)
                                // touch.css("display","none")
                                alert("当前上传个数限制为:"+_options.filesCounts+".")
                            }
                        }
                    }else{
                        // 单文件预览操作
                        multiSelect.deleteElement({text: "xx", val: "a", id:"a"})
                        var str = getStr(data)
                        multiSelect.addElement({text: "上传中...", val: "a", id:"a"})
                    }
                });

                upload.bind(completeData, function(e, data){
                    var imgUrl;
                    if(checkIsImg(data.target.type)){
                        imgUrl = andy.stringToJson(data.data).pathUrl;
                    }

                    if(_options.files){
                        // 多文件
                        var li = getFileByFilename(data.target.name);
                        var liindex = li.index();
                        if(liindex <= _options.filesCounts){
                            var arr = $.makeArray(data.target);
                            arr[0].pathUrl = imgUrl;
                            // 如果回调有name 就修改name值
                            if(andy.stringToJson(data.data).name){
                                arr[0].replaceName = andy.stringToJson(data.data).name;
                            }
                            if(isHaveSameFile(arr[0]) == false){
                                currentData.push(arr[0]);
                                if(imgUrl){//移至该处，防止相同图片重复提交
                                    var imgPic = li.find("img");
                                    setImgSize(imgPic, imgUrl, false);
                                }
                            }
                        }
                    }else{
                        //完成回调

                        multiSelect.deleteElement({text: "xx", val: "a", id:"a"})
                        var str = getStr(data.target)
                        multiSelect.addElement({text: str+"-"+parseInt(data.target.size/1024)+"kb", val: "a", id:"a"})
                        // imgUrl = andy.stringToJson(data.data)[0];
                        changeComplete(imgUrl);
                        var $img = previewBox.find(".option-block").last();
                        if(_options.oneImgView){
                            $img.on("mouseover", function(){
                                createUl("<img src = '"+imgUrl+"'>", data);
                            });
                            $img.on("mouseout", function(){
                                removeUl();
                            })
                        }
                        _options.uploadComplete(data.target);
                    }
                });

                upload.bind(uploadListComplete, function(e, isOk){
                    // 多文件上传完毕
                    isUploadListComplete = isOk;
                    _options.uploadComplete(currentData, isOk);
                });

                upload.bind(progress, function(e, data){
                    // data.loaded, data.total, data.num
                    var file = getFileByFilename(data.target.name);
                    if(data.num == 100){
                        changeComplete();
                    }else{
                        if(showImg.hasClass("f-show") && showImg.find(".bar").length >0){
                            showImg.find(".bar").css("width", data.num +"%");
                        }else{
                            showImg.find("li").prepend("<div class='u-progress xs'><div class='bar' style='width:0'></div></div>");
                            showImg.find(".bar").css("width", data.num +"%");
                        }
                        
                    }
                    // 多文件状态处理
                    if(dialog != "" && _options.files){
                        var liindex = file.index();
                        if(liindex < _options.filesCounts){
                            var arr = $.makeArray(data.target);
                            if(data.num == 100 && isHaveSameFile(arr[0]) == false){
                                file.find("img").css("opacity", 1);
                                file.find(".u-progress").remove();
                                file.append("<div class='close'><i class='iconfont'>&#xe62a; 删除</i></div>");
                                file.attr("isComplete", "true");
                                file.find("i").on("click", function(e){
                                    // 移除当前file == li
                                    $(e.target).unbind("click");
                                    file.remove();
                                    var arr = $.makeArray(data.target);
                                    delData(arr[0]);
                                    if(currentData.length <= _options.filesCounts){
                                        // var touch = dialog.find(".last");
                                        // touch.width(_options.width)
                                        // touch.css("display","block")
                                    }
                                });
                            }else{
                                file.find(".bar").css("width", data.num +"%");
                                // dialog.find(".upload-list [filename = '"+data.target.name+"']").
                            }
                        }
                        
                    }
                        
                })
            }
            return upload;
        }
    });
})(jQuery);