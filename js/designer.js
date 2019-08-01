var Editor = {
    // 绑定添加、删除列按钮的事件
    bindColumnEditor : function(reportTable,cell, editor) {
        // 高亮显示当前编辑的列
        var highLightColumn = function(cell) {
            var index = cell.index();
            $(".col-active").removeClass("col-active");
            reportTable.find("tr").each(function() {
                $(this).find("td:eq(" + index + ")").addClass("col-active");
            });
        }
        var removeLightColumn = function(){
            $(".col-active").removeClass("col-active");
        }
        editor.mouseenter(function(e) {
            highLightColumn(cell);
            return false;
        }).mouseout(function(e) {
            removeLightColumn();
        })
        // 添加列
        editor.find(".add").click(function() {
            var index = cell.index();
            reportTable.find("tr").each(function() {
                var rowCell = $(this).find("td:eq(" + index + ")");
                var newCell = Editor.createCell();
                newCell.insertBefore(rowCell);
            });
        });
        // 删除列
        editor.find(".delete").click(function() {
            var index = cell.index();
            reportTable.find("tr").each(function() {
                var row=$(this);
                var column=row.find("td:eq(" + index + ")");
                var group=column.attr("group")||'';
                var guid=column.attr("guid")||'';
                if(group!=''){//被合并后的单元格，已隐藏:将此隐藏的单元格移除，将显示的合并单元格colspan-1
                    var groupColumn=row.find("td[guid='"+group+"']");
                    var colspan=groupColumn.attr("colspan")||1;
                    if(colspan>1){
                        groupColumn.attr("colspan",colspan-1);
                    }
                    column.remove();
                }else if(guid!=''){//显示的合并后的单元格:将此单元格移除
                    var table=row.parent();
                    var groupColumnList=table.find("td[group='"+guid+"']");
                    groupColumnList.removeAttr("group").show();
                    column.remove();
                }else{
                    column.remove();
                }
            });
        });

    },
    // 绑定添加、删除行的事件
    bindRowEditor : function(reportTable,row, editor) {
        // 高亮显示当前编辑行
        var highLightRow = function(row) {
            $(".row-active").removeClass("row-active");
            row.addClass("row-active");
        }
        var removeLightRow = function(){
            $(".row-active").removeClass("row-active");
        }
        editor.mouseenter(function(e){
            highLightRow(row);
            return false;
        }).mouseout(function(){
            removeLightRow()
        })
        // 添加行
        editor.find(".add").click(function() {
            var rowIndex=row.index();
            var previousRow=row.siblings().eq(rowIndex-1);
            if(previousRow.children().is(":hidden")){
                layer.alert("此行中有合并的单元格，不能添加行!");
                return;
            }
            var cellCount=row.children().length;
            var newRow = $("<tr></tr>");
            for(var i=0;i<cellCount;i++){
                var newColumn=$("<td></td>");
                newRow.append(newColumn);
            }
            newRow.insertBefore(row);
        });

        // 删除行
        editor.find(".delete").click(function() {
            var columnList=row.children();
            var showColumnMap={};
            $.each(columnList,function(){
                var column=$(this);
                var guid=column.attr("guid")||'';
                var group=column.attr("group")||'';
                if(guid!=''){
                    reportTable.find("td[group='"+guid+"']").removeAttr("group").show();
                    row.remove();
                }else if(group!=''){
                    var showColumn=reportTable.find("td[guid='"+group+"']");
                    showColumnMap[group]=showColumn;
                    row.remove();
                }else{
                    row.remove();
                }
            });
            $.each(showColumnMap,function(){
                var showColumn=$(this);
                var rowspan=showColumn.attr("rowspan")||1;
                showColumn.attr("rowspan",rowspan-1);
            });
        });
    },
    // 创建新的表格元素
    createCell : function() {
        var html = "<td></td>";
        return $(html);
    },
    initialize:function(reportTable,reportConfig){
        reportTable.find(".light").removeClass("light");
        reportTable.find(".childLight").removeClass("childLight");
        reportTable.find(".col-active").removeClass("col-active");
        reportTable.find(".row-active").removeClass("row-active");
        var childTable=reportTable.find("table");
        Widget['table'].bindTableEventListener(childTable);
        $.each(reportConfig,function(widgetId){
            var widget=$("#"+widgetId);
            var properties=reportConfig[widgetId]||{};
            widget.data("properties",properties);
        });
    }
};
var GridHelper = {
    merge : function() {
        var light = $(".light");
        var cellCount = GridHelper.getLightCount();
        var colspan = GridHelper.getLightColumnCount();
        var rowspan = cellCount / colspan;
        var guid=ID.guid();
        //将单元格属于同一个分组的单元格一起合并
        var mergeRelatedCells=function(cell,newGuid){
            var oldGuid=cell.attr("guid")||'';
            if(oldGuid!=''){
                var reportTable=cell.parents("table");
                var groupCells=reportTable.find("td[group='"+oldGuid+"']");
                groupCells.removeAttr("colspan").removeAttr("rowspan").attr("group",newGuid).hide();
            }
        };
        for (var i = 0; i < light.length; i++) {
            if (i == 0) {
                var cell = $(light[i]).attr("colspan", colspan).attr("rowspan",rowspan);
                mergeRelatedCells(cell,guid);
                cell.removeAttr("group").attr("guid",guid).show();
            } else {
                var cell=$(light[i]);
                mergeRelatedCells(cell,guid);
                cell.removeAttr("colspan").removeAttr("rowspan").removeAttr("guid").attr("group",guid).hide();
            }
        }
    },
    checkLight:function(td){
        // 检查选中矩阵
        var lightF = $(".light:first"),
        lightF_tr_index = lightF.parent().index(),
        lightF_td_index = lightF.index(),
        lightL = $(".light:last"),
        lightL_row_counts = parseInt(lightL.attr("rowspan") || 1),
        lightL_tr_index = lightL.parent().index()+lightL_row_counts - 1,
        lightT = td,//目标td
        lightT_tr_index = lightT.parent().index(),
        lightT_td_index = lightT.index();

        var trLength = Math.abs(lightT_tr_index - lightF_tr_index)+1,
        trLLength = Math.abs(lightL_tr_index - lightF_tr_index)+1,
        trMin = Math.min.apply(null, [lightF_tr_index, lightT_tr_index]),
        tdLenght = Math.abs(lightT_td_index - lightF_td_index)+1,
        tdMin = Math.min.apply(null, [lightF_td_index, lightT_td_index]);

        // 获取最长tr
        trLength = Math.max.apply(null, [trLength, trLLength]);
        // 获取最长td,最小初始对象
        for(var j=trMin;j<= trMin+trLength;j++){ 
            var tr = $("tr:eq("+j+")"),
            maxTdLength = GridHelper.getTrLightColCounts(tr);
            if(tr.parents(".child").find("table").is("table")){
                maxTdLength = 0;
            }
            if(tdLenght < maxTdLength){
                tdLenght = maxTdLength;
            }
            tr.find(".light").each(function(index, light){
                if(tdMin > $(light).index()){
                    tdMin = $(light).index();
                }
            })
        }
        for(var j=trMin;j< trMin+trLength;j++){ 
            for(var i = tdMin; i < tdMin+tdLenght;i++){
                // 避免选择子表上的tr对象
                var td = $("#reportTable>tbody>tr:eq("+j+")>td:eq("+(i)+")");//.children("td:eq("+(i)+")");
                var isTable = td.parents(".child").find("table").is("table");
                if(td.css("display") != "none" && isTable == false){
                    td.addClass("light")
                }
            }
        }
    },
    split : function() {
        var light = $(".light:first");
        var colspan = parseInt(light.attr("colspan") || 1);
        var rowspan = parseInt(light.attr("rowspan") || 1);
        light.attr("rowspan", 1).attr("colspan", 1);
        var guid=light.attr("guid");
        var table=light.parent().parent();
        light.removeAttr("guid").removeAttr("group");
        table.find("td[group='"+guid+"']").removeAttr("guid").removeAttr("group").show();
    },
    getLightCount : function() {
        var cellCount = 0;
        var lightCells = $(".light");
        for (var i = 0; i < lightCells.length; i++) {
            var colspan = $(lightCells[i]).attr("colspan") || 1;
            var rowspan = $(lightCells[i]).attr("rowspan") || 1;
            colspan = parseInt(colspan);
            rowspan = parseInt(rowspan);
            cellCount = cellCount + (colspan * rowspan);
        }
        return cellCount;
    },
    getTrLightColCounts:function(tr){
        var lightCounts = tr.find(".light").length,
        currentCounts = 0;
        tr.find(".light").each(function(index, light){
            var colspan = $(light).attr("colspan") || 1;
            currentCounts += parseInt(colspan);
        })
        return Math.max.apply(null, [lightCounts, currentCounts]);
    },
    getLightColumnCount : function() {
        var row = $("#reportTable").find(".light:first").parent();
        var rowCell = $(row).find(".light");
        var cellCount = 0;
        for (var i = 0; i < rowCell.length; i++) {
            var colspan = $(rowCell[i]).attr("colspan") || 1;
            cellCount += parseInt(colspan);
        }
        return cellCount;
    },
    getNearlyColumn:function(row,columnIndex){
        //获取一个行中与columnIndex对应的列相近的列
        var columnList=row.children();
        var totalIndex=0;
        for(var i=0;i<columnList.length;i++){
            var column=columnList[i];
            var colspan=column.attr("colspan");
            colspan=parseInt(colspan)||1;
            totalIndex+=colspan;
            if(totalIndex>=columnIndex){
                if(i==0){
                    return columnList[0];
                }else{
                    return columnList[i-1];
                }
            }
        }
        return columnList[columnList.length-1];
    },
    removeContent:function(e){
        var light=$(".light");
        if(e.ctrlKey==false){
            var table=light.find("table");
            if(table.is("table")){
                light=table.find(".childLight");
            }
        }else{
            // 移除table需要安卓ctrl
            var table=light.find("table");
            if(table.is("table")){
                light=light;
            }
        }
        light.removeClass("header").empty();
    },
    clearContent : function(e) {
        var reportTable=$("#reportTable")
        reportTable.find("td").each(function(index, cell){
            $(cell).removeClass("header").empty();
        })
    },
    addWidget:function(td, widgetType, afterCreate){
        var widgetType = widgetType || "text";
        var widget=Widget[widgetType];
        if(widget==null){
            layer.alert("控件["+widgetType+"]未定义!");
            return;
        }
        var widgetInstance=widget.createInstance();
        // 创建后处理默认值
        afterCreate && afterCreate(widgetInstance,widget);
        var afterCreateInstance=widget.afterCreateInstance;
        widgetInstance.appendTo(td);
        if(afterCreateInstance!=null){
            afterCreateInstance(widgetInstance);
        }
        return widgetInstance;
    }
};


var bindDesignerEventListener=function(reportTable){
    // 拖拽选取
    var dragObj = {};
    reportTable.on("mousedown", "td", function(e){
        var td = $(this);
        dragObj.start = true;
        if (e.ctrlKey == false) {
            $(".light").removeClass("light");
        }
        if (e.ctrlKey == true) {
            if(td.is(".light")){
                td.removeClass("light");
            }else{
                td.addClass("light");
            }
        }else{
            // 处理字表问题
            var table=td.find("table");
            var isTable=table.is("table");
            if(isTable){
                td.removeClass("light");
            }else{
               td.addClass("light"); 
            }
        }
        return true;
    })
    reportTable.on("mousemove", "td", function(){
        var td = $(this);
        var tableWidget=td.parents(".child").find("table");
        var isTable=tableWidget.is("table");
        if(dragObj.start && isTable == false){
            td.addClass("light");
            GridHelper.checkLight(td)
        }
        // else if(dragObj.start){
        //     GridHelper.checkLight(td)
        // }
        return true;
    })
    reportTable.on("mouseup", "td", function(){
        var td = $(this);
        dragObj.start = false;
        return true;
    })

    // 鼠标在表格的第一行移动时，显示添加、删除列的按钮
    reportTable.on("mousemove","tr:first > td",function() {
        var cell=$(this);
        var children=cell.children();
        if(children.is(".col-editor")){
            return false;
        }
        var html = '<div class="col-editor"><i class="iconfont add" title="向左插入列">&#xe634;</i><i class="iconfont delete" title="删除该列">&#xe612;</i></div>';
        $(".col-editor").remove();
        var editor = $(html);
        cell.append(editor);
        Editor.bindColumnEditor(reportTable,cell, editor);
        return true;
    });
    // 鼠标在表格的最后一列移动时，显示 添加、删除行
    reportTable.on("mousemove","td",function() {
        var cell = $(this), row = $(this).parent();
        var children=cell.children();
        if(children.is(".row-editor")){
            return false;
        }
        var lastCell = row.find("td:last");
        if (cell.index() != lastCell.index()) {
            return;
        }
        var html = '<div class="row-editor"><i class="iconfont add" title="向上插入行">&#xe634;</i><i class="iconfont delete" title="删除该行">&#xe612;</i></div>';
        $(".row-editor").remove();
        var editor = $(html);
        cell.append(editor);
        Editor.bindRowEditor(reportTable,row, editor);
        return true;
    });

    // 点击单元格激活，若按了ctrl键，则批量激活
    reportTable.on("click", "td", function(e) {
        var td=$(this);

        var hasWidget=td.children().is(".widget");
        if(hasWidget==false){
            $(".propertyBox").hide();
        }
    });

    // 双击空td创建单文本框
    reportTable.on("dblclick", "td", function(e) {
        var td=$(this);
        var hasWidget=td.children().is(".widget");
        if(hasWidget==false){
            if(e.ctrlKey==true){
                var widget = GridHelper.addWidget(td,"textbox");
                td.find("input").focus()
                widget.trigger("click")
            }else{
                var widget = GridHelper.addWidget(td,"text");
                td.find("span").focus()
                widget.trigger("click")
            }
        }
    });
    
    //点击表格中的元素的事件
    reportTable.on("click",".widget",function(event){
        if(event.ctrlKey==true){
            return;
        }
        var element=$(this);
        var properties=$(this).data("properties")||{};
        var widgetType=properties['widgetType'];
        var widget=Widget[widgetType];
        if(widget!=null){
            widget.showPropertyEditor(element);
        }
        if(widgetType == "table"){
            event.stopPropagation();
        }
    });
};

//获取剪切板数据 函数
function getClipboard() {
    if (window.clipboardData) {

        return (window.clipboardData.getData('Text'));  

    }else if (window.netscape) {   
        // 兼容火狐
        netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');   

        var clip = Components.classes['@mozilla.org/widget/clipboard;1'].createInstance(Components.interfaces.nsIClipboard);   

        if (!clip) return;   

        var trans = Components.classes['@mozilla.org/widget/transferable;1'].createInstance(Components.interfaces.nsITransferable);   

        if (!trans) return;   

        trans.addDataFlavor('text/unicode');   

        clip.getData(trans, clip.kGlobalClipboard);   

        var str = new Object();   

        var len = new Object();   

        try {   

            trans.getTransferData('text/unicode', str, len);   

        }   

        catch (error) {   

            return null;   

        }   

        if (str) {   

            if (Components.interfaces.nsISupportsWString) strstr = str.value.QueryInterface(Components.interfaces.nsISupportsWString);   

            else if (Components.interfaces.nsISupportsString) strstr = str.value.QueryInterface(Components.interfaces.nsISupportsString);   

            else str = null;   

        }   

        if (str) {   

            return (str.data.substring(0, len.value / 2));   

        }   

    }   

    return null;   

}   
//读取剪切板数据，并将剪切板数据存放于各table cell中   
function readClip(e){
    if(!window.clipboardData){

        window['clipboardData'] = e.originalEvent && e.originalEvent.clipboardData || e.clipboardData || null;

    }

    readClipboardData()

    window['clipboardData'] = null;
    e.preventDefault();
}

function readClipboardData() {  
    //获取剪切板数据
    var str = getClipboard();

    //获取行数 
    var len = str.split("\n");  

    var reportTable=$("#reportTable"),
    light = reportTable.find(".light");
    //获取当前text控件的父元素td的索引   
    // var tdIndex = $(this).parent().index(); 
    var tdIndex = light.index();
    if(tdIndex == -1) tdIndex = 0;

    //获取当前text控件的父元素的父元素tr的索引
    // var trIndex = $(this).parent().parent().index(); 
    var trIndex = light.parent().index();
    if(trIndex == -1) trIndex = 0;

    var trStr; 
    //从excle表格中复制的数据，最后一行为空行，因此无需对len数组中最后的元素进行处理
    for(var i=0;i<len.length-1;i++){   
       //excel表格同一行的多个cell是以空格 分割的，此处以空格为单位对字符串做 拆分操作。
       // trStr = len[i].split(/\s+/);//考虑到合并单元的问题 合并单元预留""
       trStr = len[i].split(/\s/);

       console.log(trStr)
        //将excel中的一行数据存放在table中的一行cell中
        for(var j=0;j<trStr.length-1;j++){ 
            // $("tr:eq("+trIndex+")").children("td:eq("+(tdIndex+j)+")").children().val(trStr[j]); 
            var td = $("tr:eq("+trIndex+")").children("td:eq("+(tdIndex+j)+")");
            if(trStr[j] == ""){
                // 提示需要手动合并单元
                td.addClass("light")
            }else{
                GridHelper.addWidget(td,null, function(cell,widget){
                    cell.find("span").text(trStr[j])
                    cell.data("properties").text = trStr[j];
                    widget.afterCreateInstance(cell)
                })
            } 
        }   
        trIndex ++ ;   
    }
    //防止onpaste事件起泡
    return false;    
}   

$(function() {
    var reportTable=$("#reportTable");
    bindDesignerEventListener(reportTable);

    // 初始化excel复制转换对象
    $(document.body).bind("paste", function(e){
        readClip(e)
    })
    // $("body").append("<input type='text' id = 'excelclip' onpaste='readClip(event)'>")

    // 合并单元格
    $("#mergeButton").click(function() {
        GridHelper.merge();
    });
    // 拆分单元格
    $("#splitButton").click(function() {
        GridHelper.split();
    });
    // 移除选中单元格内容
    $("#removeButton").click(function(e){
        GridHelper.removeContent(e);
    })
    // 清空单元格
    $("#clearButton").click(function(e) {
        GridHelper.clearContent(e);
    });
    //保存
    $("#saveButton").click(function(){
        var propertyMap={};
        $("#reportTable").find(".widget").each(function(){
            var widget=$(this);
            var properties=widget.data("properties");
            var id=widget.attr("id");
            propertyMap[id]=properties;
        });
        var reportHtml=$("#reportTable").prop("outerHTML");
        var report_id=Config['report_id'];
        var reportConfig=JSON.stringify(propertyMap);
        var parameter={reportHtml:reportHtml,reportConfig:reportConfig,report_id:report_id};
        console.log(parameter);//TODO:在这里将reportHtml和reportConfig提交到后台，解析生成实际表单
        // $.post("save_config.dhtml",parameter,function(json){
        //  layer.alert(json.message);
        // });
    });
    
    //历史版本
    $("#historyButton").click(function(){
        var url="history_version.dhtml?report_id="+Config['report_id'];
        $.get(url,function(html){
            layer.open({
                type: 1,
                area: ['500px', '360px'],
                shade: false,
                title: '选择历史版本',
                content:html
            });
        });
    });
    //应用版本
    $(document).on("click",".applyButton",function(){
        var id=$(this).attr("id");
        var url="get_history.dhtml?id="+id;
        $.get(url,function(json){
            var reportHtml=json.reportHtml;
            var reportConfig=json.reportConfig||'{}';
            reportConfig=eval("("+reportConfig+")");
            $("#designContent").html(reportHtml);
            var reportTable=$("#reportTable")
            bindDesignerEventListener(reportTable);
            Editor.initialize(reportTable,reportConfig);
            layer.closeAll();
        });
    });
    
    
    
    // 点击控件时，将控件的实例复制到表格中
    $("#widgetList").find("li").click(function(){
        var li=$(this);
        var widgetType=li.attr("widget")||'text';
        var light=$(".light:first");
        var table=light.find("table");
        var isTable=table.is("table");
        if(isTable){
            light=table.find(".childLight:first");
        }
        light.empty();
        var widgetInstance = GridHelper.addWidget(light, widgetType)
        // var widget=Widget[widgetType];
        // if(widget==null){
        //  layer.alert("控件["+widgetType+"]未定义!");
        //  return;
        // }
        // var widgetInstance=widget.createInstance();
        // var afterCreateInstance=widget.afterCreateInstance;
        // widgetInstance.appendTo(light);
        // if(afterCreateInstance!=null){
        //  afterCreateInstance(widgetInstance);
        // }
        widgetInstance.trigger("click");
    });

    
    //属性编辑框属性改变时，修改属性值
    $(document).on("change",".attr",function(){
        var propertyBox=$(this).parents(".propertyBox");
        var widget=propertyBox.data("widget");
        if(widget==null){
            return;
        }
        var properties=widget.data("properties");
        if(properties==null){
            return;
        }
        var widgetType=properties['widgetType'];
        var widgetFunction=Widget[widgetType];
        if(widgetFunction==null){
            return;
        }
        widgetFunction.performChange(widget,propertyBox);
    });
    //初始化
    var reportConfig=Config['reportConfig']||{};
    Editor.initialize(reportTable,reportConfig);
});
var ID={
    guid:function(){
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }
};