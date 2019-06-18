// 目标检索相关

/********************************************目标检索部分*************************************************/

//调用搜索页面，speed true或false，是否显示左侧的倍速按钮
//select选择后执行的方法
var _SelectTargetFunction;
function ShowTargetSearchForm(prm){
	if(prm.speed==true){
		$(".Target_Serach").css("margin-left","250px");
		$(".Target_Serach").css("width","calc(100% - 250px)");
		$(".Mount_Speed").removeClass("Hide");
	}else{
		$(".Target_Serach").css("margin-left","0px");
		$(".Target_Serach").css("width","100%");
		$(".Mount_Speed").addClass("Hide");
	}
	$(".SearchForm").removeClass("Hide");
	_SelectTargetFunction = prm.select;
	if(prm.display==undefined || prm.display=="condition"){
		//显示精选天体
		$(".Targets_List").html("");
		ConditionSearch("");
	}else{
		//不变
	}
}

function HideTargetSearchForm(){
	$(".SearchForm").addClass("Hide");
}

//目标搜索窗口事件初始化
function SetupTargetSearchFunction(){
	//页面的筛选按钮
	$(".BoutiqueButton").click(function(){
		$(".Search_Condition").removeClass("Hide");
	});
	//目标选择
	$(".ConditionType").find(".Radio_Button").each(function(i,e){
		$(e).click(function(){
			$(this).attr("checked",!$(this).attr("checked"));
			//ToConditionSearch();
		});
	});
	//最小高度
	$(".ConditionAltitude").find(".Radio_Button").each(function(i,e){
		$(e).click(function(){
			$(".ConditionAltitude").find(".Radio_Button").each(function(i,e){
				$(e).attr("checked",false);
			});
			$(this).attr("checked",!$(this).attr("checked"));
			//ToConditionSearch();
		});
	});
	
	//拍摄时间
	$(".ConditionTime").find(".Radio_Button").each(function(i,e){
		$(e).click(function(){
			$(".ConditionTime").find(".Radio_Button").each(function(i,e){
				$(e).attr("checked",false);
			});
			$(this).attr("checked",!$(this).attr("checked"));
			//ToConditionSearch();
		});
	});
	
	//不限按钮
	$(".ConditionSize_Number_NR").click(function(){
		$(".ConditionSize_Number_NR").attr("checked",!$(".ConditionSize_Number_NR").attr("checked"));
		if($(".ConditionSize_Number_NR").attr("checked")){
			$(".__CNS").addClass("Hide");
		}else{
			$(".__CNS").removeClass("Hide");
		}
		//ToConditionSearch();
	});
	
	$("#ConditionSize_Duration_Min").click(function(){
		var value = parseInt($("#ConditionSize_Duration_Min").html());
		ShowNnumberCard({
			value:value
			,check:function(data){
				var v = parseInt(data.value);
				if(v>0 && v<1000){
					return true;
				}
				//Alert("请输入搜索天体范围最小值，大小在0-1000之间！");
				MessageBox.Show({
					title:Langtext("targetserach.alert.errdata_title")
					,content:Langtext("targetserach.alert.errsize_msg")
				});
				return false;
			}
			,ok:function(data){
				var value = parseInt(data.value);
				$("#ConditionSize_Duration_Min").html(value);
				//ToConditionSearch();
			}
		});
	});
	$("#ConditionSize_Duration_Max").click(function(){
		var value = parseInt($("#ConditionSize_Duration_Max").html());
		ShowNnumberCard({
			value:value
			,check:function(data){
				var v = parseInt(data.value);
				if(v>0 && v<1000){
					return true;
				}
				//Alert("请输入搜索天体范围最大值，大小在0-1000之间！");
				MessageBox.Show({
					title:Langtext("targetserach.alert.errdata_title")
					,content:Langtext("targetserach.alert.errsize_msg")
				});
				return false;
			}
			,ok:function(data){
				var value = parseInt(data.value);
				$("#ConditionSize_Duration_Max").html(value);
				//ToConditionSearch();
			}
		});
	});
	//滚动事件
	$(".Targets_List").scroll(function(){
		var hei = $(this).find(".TargetItem").length*230;
		//console.log($(this).scrollTop() , $(this).height(),hei);
		
		if (hei-$(this).scrollTop() <= $(this).height()+100) {
            if(__SearchType==0 && !__SearchLoading){
				TargetSerach();
			}else{
				ConditionSearch(__SearchTargetName,__SearchCondition);
			}
        }
	});
	
	//主页面的搜索按钮
	$(".SearchButton").click(function(){
		ToTargetSerach();
	});
	
	//精选天体的检索按钮
	$(".Search_SearchButton").click(function(){
		//Alert("筛选精品天体");
		//$(".Search_Condition").addClass("Hide");
		ToConditionSearch();
	});
}

//可拍摄范围曲线图绘图函数
function DrawStarCurve(c,data){
	/*
	日落时间先前取整到小时
	日出时间向前取整到小时+1小时
	*/
	var _sunset = data.sunset;
	var _sunrise = data.sunrise;
	var tbegin = parseInt(_sunset.substring(_sunset.indexOf(" "),_sunset.indexOf(":")));
	var tend = parseInt(_sunrise.substring(_sunrise.indexOf(" "),_sunrise.indexOf(":")))+1;
	c.attr("width",600);
	c.attr("height",200);
	c.clearCanvas();
	
	//绘制坐标系
	
	//计算时间节点素组
	var timeP = new Array();
	var bt = Date.parse(new Date(data.sunset));		//日落时间戳
	var et = Date.parse(new Date(data.sunrise));	//日出时间戳
	var ct = Date.parse(new Date(data.midheaven));	//中天时间戳
	for(i=tbegin ; i<24 ; i++){
		timeP.push(i);
	}
	for(i=0 ; i<=tend ; i++){
		timeP.push(i);
	}
	//角度横线绘制
	for(i=0;i<4;i++){
		c.drawLine({
			strokeStyle:Color_White
			,strokeDash: [i<3?5:0]
			,strokeWidth:1
			,x1:50,y1:40+i*40
			,x2:550,y2:40+i*40
		});
		c.drawText({
			fillStyle:Color_White
			,fontSize:20
			,fontFamily:"微软雅黑"
			,text:90-30*i
			,x:25,y:40+i*40
		});
	}
	//时间节点绘制
	var dis = 500/(timeP.length-1);		//时间点距离
	for(i=0;i<timeP.length;i++){
		c.drawLine({
			strokeStyle:Color_White
			,strokeDash: [i<3?5:0]
			,strokeWidth:1
			,x1:50+i*dis,y1:160
			,x2:50+i*dis,y2:165
		});
		c.drawText({
			fillStyle:Color_White
			,fontSize:20
			,fontFamily:"微软雅黑"
			,text:timeP[i]
			,x:50+i*dis,y:180
		});
	}
	//绘制曲线
	var zak=1;		//曲线间隔
	var zaf = (timeP.length-1)*3600*1000/500;	//每像素对应的时间毫秒数
	var alts = new Array();
	//计算开始时间的时间戳
	var nowDate = new Date(data.sunset);
	nowDate.setMinutes(0);
	nowDate.setSeconds(0);
	nowDate.setMilliseconds(0);
	var beginTime = Date.parse(nowDate);//起始时间对应的毫秒数
	
	line_A={
		strokeStyle:Color_Green
		,strokeWidth:4
	};
	line_B={
		strokeStyle:Color_Red
		,strokeWidth:4
	};
	line_C={
		strokeStyle:Color_Red
		,strokeWidth:4
	};
	
	var ip_A=0;	//正常曲线
	var ip_B=0;	//日落前曲线
	var ip_C=0;	//日出后曲线
	var midl={};	//中天线位置
	var _mid=500000;//中天接近值
	//////////////////////////////////////////////////////////////////////////
	var begin_exp=-1;		//开始时间点，最小高度相关
	var end_exp=-1;			//结束时间点，最小高度相关
	var exp_angle=0;		//查询最小高度
	$(".ConditionAltitude").find(".Radio_Button").each(function(i,e){
		if($(e).attr("checked")){
			exp_angle=i;
		}
	});
	exp_angle=exp_angle>0?(exp_angle+1)*10:exp_angle;
	//////////////////////////////////////////////////////////////////////////
	
	for(i=0;i<500;i+=zak){
		_t = beginTime+i*zaf*zak;
		
		lst = _GetSiderealTime(_t,data.longitude);	//具体恒星时
		//console.log(_t,data.longitude,lst);
		HA = _GetHourAngle(data.ra,lst);			//时角
		alt = _GetAltitude(data.latitude,data.dec,HA);//高度
		
		_h=120*alt/90;
		h=160-_h;
		if(_h>=0){
			if(_t>bt && _t<=et){
				ip_A++;
				eval("line_A.x"+ip_A+"="+(i*zak+50));
				eval("line_A.y"+ip_A+"="+h);
				alts.push({i:i,h:h});
			}
			else if(_t<=bt){
				ip_B++;
				eval("line_B.x"+ip_B+"="+(i*zak+50));
				eval("line_B.y"+ip_B+"="+h);
			}else if(_t>=et){
				ip_C++;
				eval("line_C.x"+ip_C+"="+(i*zak+50));
				eval("line_C.y"+ip_C+"="+h);
			}
		}
		//console.log(new Date(_t),h);
		
		//计算高度
		if(Math.abs(ct-_t)<_mid){
			//更新中天位置
			_mid=Math.abs(ct-_t);
			midl={i:i,h:h};
		}
	}
	//绘制可拍摄区域
	for(i=0;i<alts.length;i++){
		if(alts[i].h>=exp_angle){
			begin_exp=alts[i].i;
			break;
		}
	}
	for(i=alts.length-1;i>=0;i--){
		if(alts[i].h>=exp_angle){
			end_exp=alts[i].i;
			break;
		}
	}
	/*
	if(begin_exp>=0 && end_exp>=0){
		//绘制区域
		_w=end_exp-begin_exp;
		c.drawRect({
			fillStyle:Color_Green
			,x:begin_exp+50,y:40
			,width:_w,height:120
		});
	}
	*/
	//画中天线
	
	//console.log(bt,ct,et);
	//console.log(new Date(bt).Format("MM-dd hh:mm"),new Date(ct).Format("MM-dd hh:mm"),new Date(et).Format("MM-dd hh:mm"));
	if(ct>=bt && ct<=et){
		c.drawLine({
			strokeStyle:Color_Blue
			,strokeWidth:2
			,x1:midl.i*zak+50 ,y1:40
			,x2:midl.i*zak+50 ,y2:160
		});
	}
	//划线
	c.drawLine(line_A);
	c.drawLine(line_B);
	c.drawLine(line_C);
	
}

Date.prototype.Format = function (fmt) { //author: meizz
  var o = {
    "M+": this.getMonth() + 1, //月份
    "d+": this.getDate(), //日
    "h+": this.getHours(), //小时
    "m+": this.getMinutes(), //分
    "s+": this.getSeconds(), //秒
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
    "S": this.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
  if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}

//根据一个具体时间算出指定经度的恒星时time为秒，longitude为纬度double数值
function _GetSiderealTime(time, longitude){
	var t=time/1000;
	var mjd = t / 86400 + 40587; 				//简化儒略日 2440587.5
	var td = t % 86400; 						//一天内的时间
	var d = (mjd - 51545.0) / 36525;  	//修正因子T
	var st = parseInt(
		    		24110.54841 + (8640184.812866 + (0.093104 - 0.0000062 * d) * d) * d + //T的多项式
		    		td * 1.00273790935 +     				//当天时间的因子
		    		longitude * 240  						//经度引起的地方时因子
	);
	st %= 86400;
	st=st<0?st+86400:st;	//将结果处理在0到24小时以内
	var hour = parseInt(st / 3600);
	var minute =parseInt(st / 60 % 60);
	var second = st % 60;
	
	var ra = hour * 3600 + minute * 60 + second;
	ra = ra * 15 / 60 / 60;
	return ra;
}

//计算时角,ra赤经，lst恒星时
function _GetHourAngle(ra ,lst){
	var HA = lst-ra;
	HA = HA<0?HA+360:HA;  //时间小于0是+360度
	return HA;
}

//根据纬度、赤纬、时角获得高度角
function _GetAltitude(latitude , dec , HA){
	var altitude=0.0;		//高度角
	//角度转弧度
	var decRadians = dec*Math.PI/180;
	var latRadians = latitude*Math.PI/180;
	var haRadians = HA*Math.PI/180;
	var sinAlt=Math.cos(haRadians) * Math.cos(decRadians) * Math.cos(latRadians) + Math.sin(decRadians) * Math.sin(latRadians);
	altitude = Math.asin(sinAlt)*180/Math.PI;
	
	
	var zenDist = Math.acos(sinAlt);
	var zSin = Math.sin(zenDist);
	
	//如果非常接近天顶
	if (Math.abs(zSin) < 1e-5) {
		altitude = 90.0;
	}
	/*
	else{
		var As = Math.cos(decRadians) * Math.sin(haRadians) / zSin;
		var Ac = (Math.sin(latRadians) * Math.cos(decRadians) * Math.cos(haRadians) - Math.cos(latRadians) * Math.sin(decRadians)) / zSin;
		var altPrime = Math.atan2(As, Ac);
		azimuth = altPrime*Math.PI/180 + 180.0;
	}*/
	
	
	return altitude;
}

//添加标签
function AddTarget(data ,fa){
	//d=$('<div class="TargetItem"><div class="TargetPicture"></div><div class="TargetInfo"><div class="TargetInfo_Title">&nbps;</div><div class="Info_Line"><div class="Info_Text">  </div><div class="Info_Text">  </div><div class="Info_Text">  </div></div><div class="Info_Line"><div class="Info_Text">  </div><div class="Info_Text"> </div><div class="Info_Text"> </div></div><div class="Info_Line"><div class="Info_Text"> </div><div class="Info_Text"> </div><div class="Info_Text"></div></div><canvas class="StarCurve"></canvas></div>');
	var d=$('<div class="TargetItem"></div>');
	d.click(function(){
		if(_SelectTargetFunction!=null && _SelectTargetFunction!=undefined){
			if(_SelectTargetFunction(data,fa)){
				//返回true隐藏窗口
				HideTargetSearchForm();
			}
		}
	});
	var pic = $('<div class="TargetPicture"></div>');d.append(pic);
	if(data.image!=undefined && data.image.length>0){
		//console.log("HOST" , HOST+data.image);
		pic.css("background-image","url("+HOST+data.image+")");
	}
	var info = $('<div class="TargetInfo">');d.append(info);
	var title = $('<div class="TargetInfo_Title"> </div>');info.append(title);
	for(i=0;i<3;i++){
		var l=$('<div class="Info_Line"></div>'); info.append(l);
		for(f=0;f<3;f++){
			var t = $('<div class="Info_Text"> </div>');
			l.append(t);
		}
	}
	var c = $('<canvas class="StarCanvas"></canvas>');d.append(c);
	
	var ts = info.find(".Info_Text");
	$(".Targets_List").append(d);
	d.find(".TargetInfo_Title").html(data.name.trim() + ((data.othername!=undefined && data.othername.length>0)?" ("+data.othername+")":""));
	$(ts[0]).html(Langtext("targetserach.labels.ra")+": " + data.ra);
	$(ts[1]).html(Langtext("targetserach.labels.dec")+": " + data.dec);
	$(ts[2]).html(Langtext("targetserach.labels.type")+": " + data.type);
	
	$(ts[3]).html(Langtext("targetserach.labels.altitude")+": " + data.altitude);
	$(ts[4]).html(Langtext("targetserach.labels.azimuth")+": " + data.azimuth);
	$(ts[5]).html(" ");
	
	$(ts[6]).html(Langtext("targetserach.labels.magnitude")+": "  + data.magnitude);
	$(ts[7]).html(Langtext("targetserach.labels.size")+": " + data.size);
	$(ts[8]).html(" ");
	//绘图
	
	setTimeout(function(){
		DrawStarCurve(c,{
			sunset:fa.sunset				//日落时间
			,sunrise:fa.sunrise				//日出时间
			,midheaven:data.midheaven		//中天时间
			,ra:data.rad
			,dec:data.decd
			,longitude:fa.longitude
			,latitude:fa.latitude
		});
	},0);
}

var __SearchTargetName="";
var __SearchType=0;		//查询类型0普通，1精选
var __SearchCon=false;
var __SearchLoading=false;

function ToTargetSerach(){
	__SearchLoading=false;
	$(".Targets_List").html("");
	__SearchTargetName=($(".SearchBar").find("input").val());
	TargetSerach();
}

//检索目标
function TargetSerach(){
	if(__SearchLoading)return ;
	__SearchLoading=true;
	__SearchType=0;
	res = __SearchTarget(__SearchTargetName);
	
	if(res!=undefined){
		fa={
			sunset:res.sunset
			,sunrise:res.sunrise
			,longitude:res.longitude
			,latitude:res.latitude
		}
		$(res.list).each(function(i,e){
			AddTarget(e,fa);
		});
		//console.log("RES",res);
	}
	__SearchLoading=false;
}


function ToConditionSearch(){
	__SearchLoading=false;
	__SearchTargetName="";
	$(".Targets_List").html("");
	ConditionSearch(__SearchTargetName , condition=true);
}
//精选天体筛选（根据条件进行筛选）,name最后一个
function ConditionSearch(name , condition=false){
	if(__SearchLoading)return ;
	__SearchLoading=true;
	__SearchCon = condition;
	var res = undefined;
	if(condition){
		//带条件
		//type , altitude , duration , minsize , maxsize, name
		var type=0;
		var altitude=0;
		var duration=0;
		var minsize=0;
		var maxsize=0;
		$(".ConditionType").find(".Radio_Button").each(function(i,e){
			var d=$(e);
			if(d.attr("checked")){
				type |= 1<<i;
			}
		});
		//console.log("type=" , type);
		$(".ConditionAltitude").find(".Radio_Button").each(function(i,e){
			var d=$(e);
			if(d.attr("checked")){
				altitude=(i+1)*10;
			}
		});
		altitude=altitude==10?0:altitude;
		$(".ConditionTime").find(".Radio_Button").each(function(i,e){
			var d=$(e);
			if(d.attr("checked")){
				duration=i;
			}
		});
		if($("#ConditionSize_Duration_Min").hasClass("Hide")){
			minsize=0;
			maxsize=0;
		}else{
			minsize=parseInt($("#ConditionSize_Duration_Min").html());
			maxsize=parseInt($("#ConditionSize_Duration_Max").html());
		}
		res=__SearchCondition(type,altitude,duration,minsize,maxsize,name);
	}else{
		res=__SearchCondition(255,0,0,0,0,name);
	}
	if(res!=undefined){
		//console.log("RES",res);
		__SearchType=1;
		fa={
			sunset:res.sunset
			,sunrise:res.sunrise
			,longitude:res.longitude
			,latitude:res.latitude
		}
		$(res.list).each(function(i,e){
			//console.log(e);
			AddTarget(e,fa);
			__SearchTargetName=e.name;
		});
	}
	__SearchLoading=false;
}
