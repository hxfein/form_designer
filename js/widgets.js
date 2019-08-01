var Widget={
	//创建实例复制到表格中
	createInstance:function(cell){},
	//在实例添加到表单后调用
	afterCreateInstance:function(){},
	//显示控件的编辑器
	showPropertyEditor:function(widget){},
	//将属性变化反映到表格中的控件上
	performChange:function(widget,propertyBox){},
	//将组件的属性复制到属性编辑框中
	copyPropertyToBox:function(propertyBox,widget){
		var properties=widget.data("properties")||{};
		$.each(properties,function(propertyKey){//TODO:处理点选，多选
			var propertyValue=properties[propertyKey]||'';
			var propertyField=propertyBox.find("*[name='"+propertyKey+"']");
			propertyField.val(propertyValue);
		});
	},
	//从输入属性框中取值 
	getPropertiesFromBox:function(propertyBox){
		var properties={};//TODO:处理点选，多选
		propertyBox.find(".attr").each(function(){
			var name=$(this).attr("name")||'';
			var value=$(this).val()||'';
			properties[name]=value;
		});
		return properties;
	},
	//将属性框中的属性复制到元素
	copyPropertyToWidget:function(propertyBox,widget){
		var config=widget.data("properties")||{};
		propertyBox.find(".attr").each(function(){
			var name=$(this).attr("name")||'';
			var value=$(this).val()||'';
			config[name]=value;
		});
		widget.data("properties",config);
	},
	//清除属性框的属性
	clearBoxProperties:function(propertyBox){
		$(propertyBox).find(".attr").each(function(){
			$(this).val("");//TODO:处理点选，多选
		});
	},
	//创建字段编码
	createFieldCode:function(){
		var num=Math.random()*1000+1000;
		var code="index"+num.toFixed(0);
		var existsField=$("#"+code);
		if(existsField.length!=0){
			return Widget.createFieldCode();
		}else{
			return code;
		}
	},
	createTableCode:function(){
		var num=Math.random()*1000+1000;
		var code="rep"+num.toFixed(0);
		var existsReport=$("#"+code);
		if(existsReport.length!=0){
			return Widget.createTableCode();
		}else{
			return code;
		}
	},
	loadCodeItemList:function(code_id,callback){
		var url="codeitems.dhtml?code_id="+code_id;
		$.get(url,function(json){
			if(callback!=null){
				callback(json);
			}
		});
	}
};
//文本标签
Widget['text']={
	createInstance:function(cell){
		var html='<div class="widget"><span contenteditable="true">文本</span></div>';
		var field_code=Widget.createFieldCode();
		var widget=$(html).data("properties",{widgetType:'text',id:field_code,text:'文本'});
		widget.attr("id",field_code);
		return widget;
	},
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
	showPropertyEditor:function(widget){
		$(".propertyBox").hide();
		var propertyBox=$("#textProperty").show();
		Widget.clearBoxProperties(propertyBox);
		Widget.copyPropertyToBox(propertyBox,widget);
		propertyBox.data("widget",widget);
	},
	performChange:function(widget,propertyBox){
		var properties=Widget.getPropertiesFromBox(propertyBox);
		widget.find("span").text(properties['text']||'');
		widget.parent().attr("align",properties['align']||'');
		Widget.copyPropertyToWidget(propertyBox,widget);
	}
};

//单文本框
Widget['textbox']={
	createInstance:function(cell){
		var html='<div class="widget"><input type="text" class="u-input"/></div>';
		var field_code=Widget.createFieldCode();
		var properties={widgetType:'textbox',id:field_code,index_code:field_code,index_name:field_code,save_type:2,index_type:'varchar',field_length:'200',placeholder:'输入提示'};
		var widget=$(html).data("properties",properties);
		widget.attr("id",field_code);
		widget.find("input").attr("placeholder","输入提示");
		return widget;
	},
	showPropertyEditor:function(widget){
		$(".propertyBox").hide();
		var propertyBox=$("#textboxProperty").show();
		Widget.clearBoxProperties(propertyBox);
		Widget.copyPropertyToBox(propertyBox,widget);
		propertyBox.data("widget",widget);
	},
	performChange:function(widget,propertyBox){
		var properties=Widget.getPropertiesFromBox(propertyBox);
		var config=widget.data("properties")||{};
		widget.find("input").attr('placeholder', properties['placeholder']||'');
		Widget.copyPropertyToWidget(propertyBox,widget);
	}
};

//日期选择
Widget['datepicker']={
	createInstance:function(cell){
		var html='<div class="widget"><input type="text" class="u-input"/></div>';
		var field_code=Widget.createFieldCode();
		var properties={widgetType:'datepicker',id:field_code,index_code:field_code,index_name:field_code,save_type:2,index_type:'varchar',field_length:'200'};
		var widget=$(html).data("properties",properties);
		widget.attr("id",field_code);
		widget.find("input").attr("placeholder","日期选择");
		return widget;
	},
	showPropertyEditor:function(widget){
		$(".propertyBox").hide();
		var propertyBox=$("#datepickerProperty").show();
		Widget.clearBoxProperties(propertyBox);
		Widget.copyPropertyToBox(propertyBox,widget);
		propertyBox.data("widget",widget);
	},
	performChange:function(widget,propertyBox){
		var properties=Widget.getPropertiesFromBox(propertyBox);
		var config=widget.data("properties")||{};
		Widget.copyPropertyToWidget(propertyBox,widget);
	}
};

//数字输入框
Widget['decimalbox']={
	createInstance:function(cell){
		var html='<div class="widget"><input type="text" class="u-input"/></div>';
		var field_code=Widget.createFieldCode();
		var properties={widgetType:'decimalbox',id:field_code,index_code:field_code,index_name:field_code,save_type:2,index_type:'numeric',field_length:'32,2'};
		var widget=$(html).data("properties",properties);
		widget.attr("id",field_code);
		widget.find("input").attr("placeholder","数字输入框");
		return widget;
	},
	showPropertyEditor:function(widget){
		$(".propertyBox").hide();
		var propertyBox=$("#decimalboxProperty").show();
		Widget.clearBoxProperties(propertyBox);
		Widget.copyPropertyToBox(propertyBox,widget);
		propertyBox.data("widget",widget);
	},
	performChange:function(widget,propertyBox){
		var properties=Widget.getPropertiesFromBox(propertyBox);
		var config=widget.data("properties")||{};
		Widget.copyPropertyToWidget(propertyBox,widget);
	}
};
//文本域
Widget['textarea']={
	createInstance:function(cell){
		var html='<div class="widget"><textarea class="u-input"></textarea></div>';
		var field_code=Widget.createFieldCode();
		var properties={widgetType:'textarea',id:field_code,index_code:field_code,index_name:field_code,save_type:2,index_type:'varchar',field_length:'2000'};
		var widget=$(html).data("properties",properties);
		widget.attr("id",field_code);
		widget.find("textarea").attr("placeholder","多文本框");
		return widget;
	},
	showPropertyEditor:function(widget){
		$(".propertyBox").hide();
		var propertyBox=$("#textareaProperty").show();
		Widget.clearBoxProperties(propertyBox);
		Widget.copyPropertyToBox(propertyBox,widget);
		propertyBox.data("widget",widget);
	},
	performChange:function(widget,propertyBox){
		var properties=Widget.getPropertiesFromBox(propertyBox);
		var config=widget.data("properties")||{};
		Widget.copyPropertyToWidget(propertyBox,widget);
	}
};
//下拉框
Widget['select']={
	createInstance:function(cell){
		var html='<div class="widget"><select class="u-select"><option value="">--请选择--</option></select></div>';
		var field_code=Widget.createFieldCode();
		var properties={widgetType:'select',id:field_code,index_code:field_code,index_name:field_code,save_type:2,index_type:'varchar',field_length:'200'};
		var widget=$(html).data("properties",properties);
		widget.attr("id",field_code);
		return widget;
	},
	showPropertyEditor:function(widget){
		$(".propertyBox").hide();
		var propertyBox=$("#selectProperty").show();
		Widget.clearBoxProperties(propertyBox);
		Widget.copyPropertyToBox(propertyBox,widget);
		propertyBox.data("widget",widget);
	},
	performChange:function(widget,propertyBox){
		var properties=Widget.getPropertiesFromBox(propertyBox);
		var config=widget.data("properties")||{};
		Widget.copyPropertyToWidget(propertyBox,widget);
		var select=widget.find("select").empty();
		select.append('<option value="">--请选择--</option>');
		var code_id=properties['datasource_id'];
		if(code_id!=''){
			Widget.loadCodeItemList(code_id,function(json){
				json=json||[];
				for(var i=0;i<json.length;i++){
					var key=json[i].key||'';
					var value=json[i].value||'';
					var option=$('<option></option>').text(value).attr("value",key);
					select.append(option);
				}
			});
		}
	}
};

//单选框
Widget['radio']={
	createInstance:function(cell){
		var html='<div class="widget"><span class="widget_item"><input type="radio" name="radio"/>选项1</span><span class="widget_item"><input type="radio" name="radio"/>选项2</span></div>';
		var field_code=Widget.createFieldCode();
		var properties={widgetType:'radio',id:field_code,index_code:field_code,index_name:field_code,save_type:2,index_type:'varchar',field_length:'200'};
		var widget=$(html).data("properties",properties);
		widget.attr("id",field_code);
		return widget;
	},
	showPropertyEditor:function(widget){
		$(".propertyBox").hide();
		var propertyBox=$("#radioProperty").show();
		Widget.clearBoxProperties(propertyBox);
		Widget.copyPropertyToBox(propertyBox,widget);
		propertyBox.data("widget",widget);
	},
	performChange:function(widget,propertyBox){
		var properties=Widget.getPropertiesFromBox(propertyBox);
		var config=widget.data("properties")||{};
		Widget.copyPropertyToWidget(propertyBox,widget);
		var code_id=properties['datasource_id'];
		var index_code=properties['index_code'];
		widget.empty();
		if(code_id!=''){
			Widget.loadCodeItemList(code_id,function(json){
				json=json||[];
				for(var i=0;i<json.length;i++){
					var key=json[i].key||'';
					var value=json[i].value||'';
					var html='<span class="widget_item"><input value="'+key+'" type="radio" name="'+index_code+'"/>'+value+'</span>';
					var option=$(html);
					widget.append(option);
				}
			});
		}
	}
};
//多选框
Widget['multIndex']={
	createInstance:function(cell){
		var html='<div class="widget"><span class="widget_item"><input type="checkbox" name="checkbox"/>选项1</span><span class="widget_item"><input type="checkbox" name="checkbox"/>选项2</span></div>';
		var field_code=Widget.createFieldCode();
		var properties={widgetType:'multIndex',id:field_code,index_code:field_code,index_name:field_code,save_type:1,index_type:'varchar',field_length:'200'};
		var widget=$(html).data("properties",properties);
		widget.attr("id",field_code);
		return widget;
	},
	showPropertyEditor:function(widget){
		$(".propertyBox").hide();
		var propertyBox=$("#multIndexProperty").show();
		Widget.clearBoxProperties(propertyBox);
		Widget.copyPropertyToBox(propertyBox,widget);
		propertyBox.data("widget",widget);
	},
	performChange:function(widget,propertyBox){
		var properties=Widget.getPropertiesFromBox(propertyBox);
		var config=widget.data("properties")||{};
		Widget.copyPropertyToWidget(propertyBox,widget);
		var code_id=properties['datasource_id'];
		var index_code=properties['index_code'];
		widget.empty();
		if(code_id!=''){
			Widget.loadCodeItemList(code_id,function(json){
				json=json||[];
				for(var i=0;i<json.length;i++){
					var key=json[i].key||'';
					var value=json[i].value||'';
					var html='<span class="widget_item"><input value="'+key+'" type="checkbox" name="'+index_code+'"/>'+value+'</span>';
					var option=$(html);
					widget.append(option);
				}
			});
		}
	}
};

//动态表格
Widget['table']={
	createInstance:function(cell){
		var tableTemplate=$("#tableTemplate").clone();
		tableTemplate.removeAttr("style").removeAttr("id");
		var table_code=Widget.createTableCode();
		var properties={widgetType:'table',id:table_code,table_code:table_code,table_name:"子表"+table_code};
		var html='<div class="widget child"></div>';
		var widget=$(html).data("properties",properties);
		widget.attr("id",table_code).append(tableTemplate).appendTo(cell);
		tableTemplate.find(".widget").each(function(){
			var bean=$(this);
			var index=bean.index();
			var field_code=Widget.createFieldCode();
			var title=tableTemplate.find(".title:eq("+index+")").text();
			bean.attr("id",field_code);
			var config={widgetType:'textbox',id:field_code,index_code:field_code,index_name:title,save_type:2,index_type:'varchar',field_length:'200'};
			bean.data("properties",config);
		});
		Widget['table'].bindTableEventListener(tableTemplate);
		tableTemplate.find(".title").attr("contenteditable","true");
		return widget;
	},
	showPropertyEditor:function(widget){
		$(".propertyBox").hide();
		var propertyBox=$("#tableProperty").show();
		Widget.clearBoxProperties(propertyBox);
		Widget.copyPropertyToBox(propertyBox,widget);
		propertyBox.data("widget",widget);
	},
	performChange:function(widget,propertyBox){
		var properties=Widget.getPropertiesFromBox(propertyBox);
		var config=widget.data("properties")||{};
		Widget.copyPropertyToWidget(propertyBox,widget);
	},
	bindTableEventListener:function(tableTemplate){
		tableTemplate.on("click",".item",function(){
			$(".childLight").removeClass("childLight");
			$(this).addClass("childLight");
		});
		tableTemplate.on("mousemove",".title",function(){
			var cell = $(this), row = $(this).parent();
			var html = '<div class="col-editor"><i class="iconfont add" title="向左插入列">&#xe634;</i><i class="iconfont delete" title="删除该列">&#xe612;</i></div>';
			$(".col-editor").remove();
			var editor = $(html);
			cell.append(editor);
			
			var highLightColumn = function(cell) {
				var index = cell.index();
				$(".col-active").removeClass("col-active");
				tableTemplate.find("tr").each(function() {
					$(this).find("td:eq(" + index + ")").addClass("col-active");
				});
			};
			editor.find(".add").bind("mousemove",function(){
				highLightColumn(cell);
			}).click(function(){
				var index = cell.index();
				var titleRow=tableTemplate.find("tr:first");
				var inputRow=tableTemplate.find("tr:last");
				var titleCell=titleRow.children().eq(index);
				var inputCell=inputRow.children().eq(index);
				$('<th class="title" contenteditable="true">字段</th>').insertBefore(titleCell);
				var html='';
				html+='<td class="item">';
				html+='<div class="widget">';
				html+='<input type="text" placeholder="填写数据" class="u-input"/>';
				html+='</div>';
				html+='</td>';
				var newRow=$(html);
				var field_code=Widget.createFieldCode();
				var config={widgetType:'textbox',id:field_code,index_code:field_code,index_name:field_code,save_type:2,index_type:'varchar',field_length:'200'};
				newRow.find(".widget").data("properties",config);
				newRow.insertBefore(inputCell);
			});
			editor.find(".delete").mousemove(function() {
				highLightColumn(cell);
			}).click(function() {
				var index = cell.index();
				var titleRow=tableTemplate.find("tr:first");
				var inputRow=tableTemplate.find("tr:last");
				var titleCell=titleRow.children().eq(index);
				var inputCell=inputRow.children().eq(index);
				titleCell.remove();
				inputCell.remove();
			});
		});
	}
};