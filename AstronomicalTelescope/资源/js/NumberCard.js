// JavaScript Document

var __CardNumber_ReturnValue="";		//显示内容
var __CardNumber_ReturnSuffix="";		//显示后缀
var __CardNumber_ReturnPrefix="";		//前缀
var __CardNumber_OKFcuntion = undefined;		//确定函数
var __CardNumber_CancelFcuntion = undefined;	//取消函数
var __CardNumber_CheckFunction = undefined;		//校验函数
var __CardNumber_Custom=undefined;				//自定义参数组

//初始化数字表
function NC_Init(){
	for(var i=1 ; i<=10 ; i++){
		var d = $("<div class='NC_Number' type='Number'>"+(i%10)+"</div>");
		d.click(function(){
			__CardNumber_ReturnValue+=$(this).html();
			NC_RefreshDisplay();
		});
		$(".NC_Numbers").append(d);
	}
	ad = $("<div class='NC_Number' type='.'>.</div>");
	ad.click(function(){
		__CardNumber_ReturnValue+=$(this).html();
		NC_RefreshDisplay();
	});
	$(".NC_Numbers").append(ad);
	
	ad = $("<div class='NC_Number' type='-'>-</div>");
	ad.click(function(){
		if(__CardNumber_ReturnValue.substring(0,1)=="-"){
			__CardNumber_ReturnValue=__CardNumber_ReturnValue.substr(1);
		}else{
			__CardNumber_ReturnValue="-"+__CardNumber_ReturnValue;
		}
		NC_RefreshDisplay();
	});
	$(".NC_Numbers").append(ad);
	
	//删除按钮
	$(".ContentRemove").click(function(){
		if(__CardNumber_ReturnValue.length>0){
			__CardNumber_ReturnValue=__CardNumber_ReturnValue.substring(0,__CardNumber_ReturnValue.length-1);
			NC_RefreshDisplay();
		}
	});
	
	//取消按钮
	$(".NCB_Cancel").click(function(){
		($(".NumberCard").addClass("Hide"));
		
		if(__CardNumber_CancelFcuntion!=undefined){
			__CardNumber_CancelFcuntion({custom:__CardNumber_Custom});
		}
	});
	//确定按钮
	$(".NCB_OK").click(function(){
		checked=true;
		if(__CardNumber_CheckFunction!=undefined){
			//需要校验
			checked=__CardNumber_CheckFunction({
				value:__CardNumber_ReturnValue
				,prefix:__CardNumber_ReturnPrefix
				,suffix:__CardNumber_ReturnSuffix
				,custom:__CardNumber_Custom
			});
		}
		if(checked){
			if(__CardNumber_OKFcuntion!=undefined){
				__CardNumber_OKFcuntion({
					value:__CardNumber_ReturnValue
					,prefix:__CardNumber_ReturnPrefix
					,suffix:__CardNumber_ReturnSuffix
					,custom:__CardNumber_Custom
				});
			}
			($(".NumberCard").addClass("Hide"));
		}
	});
}

function NC_RefreshDisplay(){
	$(".ReturnContent").html(__CardNumber_ReturnPrefix + " " + __CardNumber_ReturnValue+" "+__CardNumber_ReturnSuffix);
}

//显示数字窗口
function ShowNnumberCard(p){
	__CardNumber_ReturnValue="";
	__CardNumber_ReturnSuffix="";
	__CardNumber_ReturnPrefix="";
	__CardNumber_CheckFunction=p.check;
	__CardNumber_OKFcuntion = p.ok;
	__CardNumber_CancelFcuntion=p.cancel;
	if(p.value!=undefined){
		__CardNumber_ReturnValue=p.value;
	}
	if(p.suffix!=undefined){
		__CardNumber_ReturnSuffix=p.suffix;
	}
	if(p.prefix!=undefined){
		__CardNumber_ReturnPrefix=p.prefix;
	}
	if(p.custom!=undefined){
		__CardNumber_Custom=p.custom;
	}
	var tar = p.target;
	var alen = 0;
	$(".NC_Additional").children().remove();
	if(p.strlist!=undefined){
		//如果有字符串定义
		alen += p.strlist.length;
		for(i=0 ; i<p.strlist.length ; i++){
			e = p.strlist[i];
			ad = $("<div class='NC_Number' type='str'>"+e+"</div>");
			ad.click(function(){
				__CardNumber_ReturnValue+=$(this).html();
				NC_RefreshDisplay();
			});
			$(".NC_Additional").append(ad);
		}
	}
	
	if(p.suffixlist!=undefined){
		//有后缀的定义
		alen += p.suffixlist.length;
		//添加后缀列表
		for(i=0 ; i<p.suffixlist.length ; i++){
			e = p.suffixlist[i];
			ad = $("<div class='NC_Number' type='suffix'>"+e+"</div>");
			ad.click(function(){
				__CardNumber_ReturnSuffix=$(this).html();
				NC_RefreshDisplay();
			});
			$(".NC_Additional").append(ad);
			
		}
	}
	
	if(p.prefixlist!=undefined){
		//有后缀的定义
		alen += p.prefixlist.length;
		//添加后缀列表
		for(i=0 ; i<p.prefixlist.length ; i++){
			e = p.prefixlist[i];
			ad = $("<div class='NC_Number' type='prefix'>"+e+"</div>");
			ad.click(function(){
				__CardNumber_ReturnPrefix=$(this).html();
				NC_RefreshDisplay();
			});
			$(".NC_Additional").append(ad);
			
		}
	}
	if(alen>0){
		//重新设置宽度
		nw = parseInt(alen / 4)+(alen%4>0?1:0);
		$(".NumberCard_Back").css("width",(560+nw*140)+"px");
		$(".NC_Additional").removeClass("Hide");
		$(".NC_Additional").css("width",(nw*140)+"px");
	}else{
		$(".NumberCard_Back").css("width","560px");
		$(".NC_Additional").addClass("Hide");
	}
	$(".NumberCard").removeClass("Hide");
	NC_RefreshDisplay();
	//重新设置位置
	w = $(".NumberCard_Back").css("width").replace("px","");
	dw = $("body").css("width").replace("px","");
	
	if(p.left!=undefined){
		$(".NumberCard_Back").css("left",p.left + "px");	//居中显示
	}else{
		$(".NumberCard_Back").css("left",((dw-w)/2) +"px");	//居中显示
	}
	if(p.top!=undefined){
		$(".NumberCard_Back").css("top",p.top +"px");
	}else{
		
	}
}