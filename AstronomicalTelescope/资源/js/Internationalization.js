//国家化支持
//加载语言
var language = "";
var lang_json = "";
function loadLanguage(lang){
	language=lang;
	//console.log("加载语言",language);
	//alert("加载语言");
	_GetJSON("js/lang/" + lang+".json",function(data){
		//console.log("语言加载成功");
		lang_json=data;
		//console.log(lang_json);
	});
}
//读取本地标签
function Langtext(tag,args){
	var s = tag.split(".");
	var text="";
	var p=lang_json[s[0]];
	for(var i=1 ; i<s.length ; i++){
		if(p!=undefined){
			p=p[s[i]];
		}else{
			return "";
		}
	}
	//替换参数
	if(p!=undefined){
		for(var i=1 ; i<arguments.length;i++){
			p=p.replace("{"+(i-1)+"}",arguments[i]);
		}
	}else{
		p="";
	}
	p=p.replace(" ","&nbsp;");
	return p;
}
//将所有含有lang_data标签的html进行国际化
function TagInternationalization(){
	$("[lang_data]").each(function(i,e){
		var d = $(e);
		//console.log(d.attr("lang_data"),Langtext(d.attr("lang_data")));
		$(this).html(Langtext(d.attr("lang_data")));
	});
	$("[lang_value]").each(function(i,e){
		var d = $(e);
		$(this).val(Langtext(d.attr("lang_value")));
	});
}
$(document).ready(function(){
	TagInternationalization();
});
//loadLanguage("en-us");
loadLanguage("zh-cn");
