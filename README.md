# form_designer
从项目上提炼的一套简单的自定义表单的前端基础代码，支持简单的表单定义，具有端好的扩展性。
# 如何使用
## 1.构建表单结构
该自定义表单工具与excel类似，可以先通过添加/删除行列、合并/折分单元格构建基本的表单框架结构。在表单未编辑的情况下，可以直接从excel中复制结构粘贴到表单设计器中。
## 2.添加表单组件
先选择单元格，再点击左侧“组件库”中的组件即可。为方便操作，功能上提供了以下快捷键：
* 	[CTRL+单点单元格]在单元格中设置文本；如单元格在动态表格内，则选择动态表格所在的单元格。
* 	[CTRL+双击单元格]在单元格中设置输入框。
# 如何与后台集成
点击保存按钮时，会调用js/designer.js中的如下方法：
```javascript
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
```
将设计器生成的reportHtml与reportConfig提交到后台，后台做相应的解析生成最终的用户填写表单界面。同时后端还应有一套处理保存、修改表单数据的逻辑，建议根据reportConfig里的字段动态生成数据表的方式来做。
# 添加新的控件
如果此代码中的组件不足，可自己扩展。首先在widget.js中添加控件定义。

```javascript

Widget['text']={//设置控件的名称
	//当此控件被选择进单元格时，设置展示的html代码，以及初始化控件的属性（此时此创建控件，未真正渲染到页面上）
	createInstance:function(cell){
		var html='<div class="widget"><span contenteditable="true">文本</span></div>';
		var field_code=Widget.createFieldCode();
		var widget=$(html).data("properties",{widgetType:'text',id:field_code,text:'文本'});
		widget.attr("id",field_code);
		return widget;
	},
	//当控件被渲染到页面上时的回调，通常在这里绑定事件
	afterCreateInstance:function(widget){
		widget.find("span").bind("input",function(){
			var properties=widget.data("properties")||{};
			var text=$(this).text()||"";
			properties['text']=text;
			$("#textProperty").find("input[name='text']").val(text);
		});
		// header class样式添加 表单头部
		widget.parent().addClass("header");
	},
	//选择控件时的事件回调，通常必须要在这里把控件的属性展示到右侧“表单属性配置”栏目中
	showPropertyEditor:function(widget){
		$(".propertyBox").hide();
		var propertyBox=$("#textProperty").show();
		Widget.clearBoxProperties(propertyBox);
		Widget.copyPropertyToBox(propertyBox,widget);
		propertyBox.data("widget",widget);
	},
	//当在“表单属性配置”修改控件属性后，将属性设置到控件中
	performChange:function(widget,propertyBox){
		var properties=Widget.getPropertiesFromBox(propertyBox);
		widget.find("span").text(properties['text']||'');
		widget.parent().attr("align",properties['align']||'');
		Widget.copyPropertyToWidget(propertyBox,widget);
	}
};
```
然后，找个合适的图标，把控件的入口放到designer.html中的widgetList中：
```html
<li widget="table"><a href="#"><i class="iconfont">&#xe807;</i></a><p>动态表格</p></li>
```
# 联系我
邮件:hxfein@126.com
QQ群:586897279