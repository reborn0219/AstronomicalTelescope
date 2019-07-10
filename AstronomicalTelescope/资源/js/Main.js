/**********************************************************************************************
致各位天文爱好者：

    如果您看到这段话，说明您和我们一样，致力于天文观测技术的发展。
	碳十四是一个开放的天文观测服务平台，我们将对任何致力于天文软硬件发展的第三方开发团队分享我们的研发成果，
您可以通过APP中公布的邮箱获取相关支持。
    同时诚挚的邀请您加入我们的团队或朋友圈，和来自全球的其他伙伴一起探讨切磋，
以开放的心态共同推动天文观测技术的进步，让更多普通人触摸真实宇宙！
	如果您需要相关技术代码进行二次开发，请直接联系我们，共同学习，共同成长。
	
																					碳十四
**********************************************************************************************/
// 通用JS
var GuiderObj;		//导星
//var ExposureObj;	//曝光
var APPZoom=1;
/*缩放网来适应浏览器
获取浏览器实际宽度，与1920进行比值运算
*/
function zoomPage(){
	/*
	获得浏览器宽度，zoom=浏览器宽度/1920，得出缩放比
	设置body的zoom属性
	*/
	var bodyWidth = document.body.clientWidth;
	var zoom = bodyWidth/1920;
	APPZoom=zoom;
	$("body").css("zoom",zoom);
}
/*
$(window).resize(function(){
	zoomPage();
});
*/


/*
 当页面启动后首先调用该方法，该方法会调用终端（APP，测试的时候是浏览器）的NoticeAppReady方法
 NoticeAppReady方法可以在APP.js中找打，用于终端设备的初始化，初始化完毕后终端会调用BrowserReady（就在下面）
 然后进行页面的初始化操作
*/
$(document).ready(function(){
	NoticeAppReady();
	//BrowserReady();
});

/* 
 浏览器准备完毕
 该方法有终端调用，在触发NoticeAppReady方法后终端会进行初始化，初始化完毕后会调用该方法。
 该方法首先会初始化页面的缩放比，将宽度控制在1920实际宽度中，与真实页面进行缩放，详见zoomPage方法。
 然后初始化系统参数和工具组（主要是页面中的单选按钮初始化）、系统操作函数
 然后关闭导星曲线图（开始的时候因为需要初始化曲线图的Canvas大小，所以曲线图是打开的，初始化完毕后关闭曲线图）
 然后初始化系统，该步骤用于从服务器中获取全量配置信息，并调用各部分的内容初始化将内容Put进去，各部分的内容初始化方法将视情况是否启动各模块。
 然后，有写东西没有翻开反法写，就写到了最后嘛，设置不允许打开右键菜单、显示主界面、隐藏加载界面（加载界面应该做到APP中）
 最后，启动监控线程，用于每秒钟向服务器请求一次设备状态及首页显示参数。
*/
function BrowserReady(){
	zoomPage();							//缩放页面
	
	//ExposureObj = new Exposure();
	InitParameters();					//初始化参数
	InitTools();						//初始化页面工具DIV（单选和开关等）
	SetupOperationFunction();			//安装操函数
	//开始曝光按钮绘图
	//ExposureObj.SetButton($("#ExposureButton"));
	//StartExposureRepaint();
	
	//刷新页面时间
	

	CloseThumbnail();					//关闭导星图
//    alert("关闭导星图");

	InitializationSystem();				//初始化系统参数
//    alert("初始化系统参数");

	InitWinInit();						//系统初始化窗口
//    alert("系统初始化窗口");

	//到此为止可以正常使用软件，打开屏幕（这里还没有写）
	
	//支持长按出菜单
	window.addEventListener('contextmenu', function(e){
		e.preventDefault();
	});
	$("#MainForm").removeClass("Hide");	//显示主界面	
	$("#LoadForm").addClass("Hide");	//隐藏加载界面
	setTimeout(function(){ShowView();},100); //隐藏APP的界面
	_StartDeviceStatusGetterLine();		//启动状态监控线程
	//设置绘图大小
//    alert("启动状态监控线程");

}

/*
 初始化本地参数
 将场的类型从语言中取出，并放到ExposureTypes全局便变量中，后面很多个地方会用到
*/
function InitParameters(){
	//一些参数需要等待整体加载完毕后在赋值
	ExposureTypes=[Langtext("frametype.light"),Langtext("frametype.dark"),Langtext("frametype.flat"),Langtext("frametype.bias"),Langtext("frametype.flatdark")];
}

/*
初始化系统，从服务器端得到默认的系统参数，以后在所有的操作中都要修改这个参数表
获得系统参数后：
	1. 修改界面相关参数及设置相关参数
	2. 判断是否处于曝光中，如果处于曝光中，则修改曝光相关
	3. 判断是否处于任务中，如果处于任务中，则修改所有任务处理相关
 */
function InitializationSystem(){
  
	__SetLanguage(language);
	//获得所有的系统默认参数
	//alert("准备调用初始化");
	SystemParameters = __GetInitializationSystemParameters();
	//同步赤道仪GPS信息
	if(SystemParameters.devices.mount!=undefined && SystemParameters.devices.mount.initlocation==false){
		//初始化赤道仪信息
		var d=GetLocalGPS();
		_MountSet_ReSetLocal(d.longitude,d.latitude,d.datetime);
	}
	//设置版本号
	if(SystemParameters.version!=undefined){
		$("#version").html(Langtext("settings.about.name")+" (FV : " + SystemParameters.version+")");
	}
	//UpdateExposureDisplayData();
	//初始化任务
	//var task = __GetTask();		//获得最初的任务，这里在做任务的时候要覆盖一下，从系统初始化参数中得到分析
	//SystemParameters.task=task;
	$("#System_Devicename").val(SystemParameters.name);
	UpdateDevicesInfo(false);
	InitSettingContent();		//设置窗口数据初始化
	InitExposureContent();		//初始化曝光内容
	InitCalibrationContent();	//初始化校准内容
	InitGuiderContent();		//初始化导星内容
	InitFocuserContent();		//调焦窗口
	InitTaskContent();			//根据任务为初始化内容
	InitLiveView();				//初始化实时取景
	InitCalibration();			//初始化校准相关
}

//分析系统参数，这里对整体状态进行分析，然后根据当前状态做动作执行
//该方法应该间隔1秒钟访问一次系统状态时调用，但暂时未使用
function AnalysisSystemParameters(){
	console.log("系统参数分析");
	if(SystemParameters.status=="exposure"){
		//系统正在曝光中
		console.log("系统正在曝光中");
	}
}


///////////////////////////注册操作函数////////////////////////////
/*操作函数*/
function SetupOperationFunction(){
	$("#ScatterCanvas").click(Click_ScatterCanvas);	//设置导星绘图
	SetupMountControllerFunction();			//赤道仪控制盘按键设置
	SetupExposureParameters();				//设置曝光参数的触发函数
	SetupTargetSearchFunction();			//搜索窗口事件初始化	
	DisplaySettingOperationFunction();		//显示与关闭显示设置
	
	NC_Init();								//小键盘初始化
	InitExposure();							//初始化曝光设置
	InitSetting();							//初始化设置相关
	InitTask();								//初始化任务相关
	InitPreview();							//初始化缩略图方相关
	InitFoucser();							//初始化自动对焦
	InitGuider();							//导星初始化
	//单击gohome按钮
	$(".GoHome").click(function(){
		GoHome();
	});
	
	//禁止长按出菜单
	window.addEventListener('contextmenu', function(e){ 
	    e.preventDefault(); 
	});
}



//主页曝光参数页面内容设置
function SetupExposureParameters(){
	//曝光类型
	$("#EXP_Type").find(".Radio_Button").each(function(i,e){
		$(e).click(function(){
			var p = $(this);
			ExposureType = p.attr("type");
			UpdateExposureDisplayData();
		});
	});
	
	//选择曝光时间，这个工具已经去掉了，后期在考虑加入
	$("#EXP_Time_R").change(function(){
		var v= $("#EXP_Time_R").val();
		var p = v / parseInt($("#EXP_Time_R").attr("max"));
		$("#EXP_Time_R").css("background-size",p+ "% 100%");
		ExposureTime=v*1000;
		UpdateExposureDisplayData();
	});
	//自定义曝光时间
	$("#EXP_Times").find(".Radio_Button").each(function(i,e){
		$(e).click(function(){
			if(ExposureType=="bias"){
				return;
			}
			//单击时间后
			var d= $(this);
			var txt = d.attr("value");
			if(txt!="0"){
				$("#EXP_Time_T").html(txt+" S");
				ExposureTime=txt*1000;
			}
			$("#EXP_Times").find(".Radio_Button").each(function(ii,ee){
				$(ee).attr("checked",false);
			});
			d.attr("checked",true);
			setTimeout(UpdateExposureDisplayData,0);
		});
	});
	
	$("#EXP_Time_T").click(function(){
		if(ExposureType=="bias"){
			return;
		}
		var v = $("#EXP_Time_T").html();
		var s="S";
		if(v.indexOf("ms")>0){
			s="ms";
		}
		v=v.replace("ms","").replace("S","").trim();
		ShowNnumberCard({
			value:v
			,suffixlist:["S","ms"]
			,suffix:s
			,check:function(data){
				var v=data.value;
				if(v<=0 ||(data.suffix=="S" && v>600) || (data.suffix=="ms" && v>600000)){
					MessageBox.Show({
						title:Langtext("exposure.alert.time_err_title")
						,flag:MessageBox.FLAG_INFORMATION
						,content:Langtext("exposure.alert.time_err_content",10)
					});
					return false;
				}
				return true;
			}
			,ok:function(data){
				var v = data.value;
				if(data.suffix=="S"){
					v*=1000;
				}
				$("#EXP_Times").find(".Radio_Button").each(function(ii,ee){
					$(ee).attr("checked",false);
				});
				$("#EXP_Time_DEF").attr("checked",true);
				ExposureTime=v;
				setTimeout(UpdateExposureDisplayData,0);
			}
		});
	});
	
	//Gain Offset设置，系统初始化的时候可以获得该参数
	$("#EXP_Gains").find(".Radio_Button").each(function(i,e){
		$(e).click(function(){
			var d = $(this);
			var txt = d.attr("value");
			$("#EXP_Gains").find(".Radio_Button").each(function(ii,ee){
				$(ee).attr("checked",false);
			});
			d.attr("checked",true);
			if(txt!=0){
				$("#EXP_Gain_T").html(txt);
				__SetParameters_Camera(0,null,null,null,null,null,txt);
			}
		});
	});
	$("#EXP_Gain_T").click(function(){
		ShowNnumberCard({
			value:$("#EXP_Gain_T").html()
			,check:function(data){
				var v = parseInt(data.value);
				if(v>0 && v<=SystemParameters.devices.camera.gain_max){
					return true;
				}
				//Alert("请输入正确的Gain值，取值范围为0 - "+SystemParameters.devices.camera.gain_max);
				MessageBox.Show({
					//title:"无法执行任务"
					title:Langtext("settings.devices.alert.settingerror")
					,flag:MessageBox.FLAG_INFORMATION
					//,content:"请输入正确的Gain值，取值范围为0 - "+SystemParameters.devices.camera.gain_max
					,content:Langtext("settings.devices.alert.gain_error",SystemParameters.devices.camera.gain_max)
				});
				return false;
			}
			,ok:function(data){
				if(!CanModifySettings()){return;}
				var gain = parseInt(data.value);
				$("#EXP_Gain_T").html(gain);
				__SetParameters_Camera(0,null,null,null,null,null,gain);
				$("#EXP_Gains").find(".Radio_Button").each(function(ii,ee){
					$(ee).attr("checked",false);
				});
				$("#EXP_Gains").find(".Radio_Button").eq(3).attr("checked",true);
			}
		});
	});
	
	$("#EXP_Offsets").find(".Radio_Button").each(function(i,e){
		$(e).click(function(){
			var d = $(this);
			var txt = d.attr("value");
			$("#EXP_Offsets").find(".Radio_Button").each(function(ii,ee){
				$(ee).attr("checked",false);
			});
			d.attr("checked",true);
			if(txt!=0){
				$("#EXP_Offset_T").html(txt);
				__SetParameters_Camera(0,null,null,null,null,null,null,txt);
			}
		});
	});
	$("#EXP_Offset_T").click(function(){
		ShowNnumberCard({
			value:$("#EXP_Offset_T").html()
			,check:function(data){
				var v = parseInt(data.value);
				if(v>0 && v<=SystemParameters.devices.camera.offset_max){
					return true;
				}
				//Alert("请输入正确的Offset值，取值范围为0 - "+SystemParameters.devices.camera.offset_max);
				MessageBox.Show({
					//title:"无法执行任务"
					title:Langtext("settings.devices.alert.settingerror")
					,flag:MessageBox.FLAG_INFORMATION
					//,content:"请输入正确的Offset值，取值范围为0 - "+SystemParameters.devices.camera.offset_max
					,content:Langtext("settings.devices.alert.offset_error",SystemParameters.devices.camera.offset_max)
				});
				return false;
			}
			,ok:function(data){
				if(!CanModifySettings()){return;}
				var offset = parseInt(data.value);
				$("#EXP_Offset_T").html(offset);
				__SetParameters_Camera(0,null,null,null,null,null,null,offset);
				$("#EXP_Offsets").find(".Radio_Button").each(function(ii,ee){
					$(ee).attr("checked",false);
				});
				$("#EXP_Offsets").find(".Radio_Button").eq(3).attr("checked",true);
			}
		});
	});
	
}
/*
 更新曝光的显示数据
 当参数发生改变的时候，用于更新曝光参数设置页面和曝光状态栏显示。
*/
function UpdateExposureDisplayData(){
	//这是曝光参数设置页面场类型选中状态
	$("#EXP_Type").find(".Radio_Button").each(function(i,e){
		$(e).attr("checked",ExposureType==$(e).attr("type"));
	});

	//设置滤镜轮选中状态
	$("#EXP_Filters").find(".Radio_Button").each(function(i,e){
		$(e).attr("checked",ExposureFilter==$(e).attr("filter"));
	});
	
	//设置Bin值选中状态
	$("#EXP_Bins").find(".Radio_Button").each(function(i,e){
		$(e).attr("checked",ExposureBin==$(e).attr("bin"));
	});
	
	//设置曝光时间
	var _t = ExposureTime>=1000?(ExposureTime/1000).toFixed(2)+" S":ExposureTime+" ms";
	_t=_t.replace(".00","");
	
	if(ExposureType=="bias"){
		$("#EXP_Time_T").html("0 S");
	}else{
		$("#EXP_Time_T").html(_t);
	}
	//$("#EXP_Time_T").html(_t);
	//$("#EXP_Time_R").val(ExposureTime/1000);
	
	//更新状态栏
	//var exptype = "亮场";
	//更新状态栏场状态
	var exptype = Langtext("frametype.light");
	switch(ExposureType){
		case "light":
			//exptype = "亮场";
			exptype = Langtext("frametype.light");
			break;
		case "dark":
			//exptype = "暗场";
			exptype = Langtext("frametype.dark");
			break;
		case "flat":
			//exptype = "平场";
			exptype = Langtext("frametype.flat");
			break;
		case "bias":
			//exptype = "偏置";
			exptype = Langtext("frametype.bias");
			break;
		case "flat-dark":
			//exptype = "暗平场";
			exptype = Langtext("frametype.flatdark");
			break;
	}
	$("#PI_Type").html(exptype);
	//更新状态栏的相机参数
	if(SystemParameters.devices.camera!=undefined){
		bin = SystemParameters.devices.camera.bins[ExposureBin];
		$("#PI_Bin").html(bin +"×" + bin);
		$("#PI_ExposureTime").html(ExposureTime>=1000?(ExposureTime/1000).toFixed(0)+" S":ExposureTime+" ms");
		$("#PI_Gain").html(SystemParameters.devices.camera.gain);
		$("#PI_Offset").html(SystemParameters.devices.camera.offset);
		if(SystemParameters.devices.camera.cool==true){
			$("#PI_CameraTemperature").html(SystemParameters.devices.camera.temperature.toFixed(2)+"°C");
			$("#PI_CameraCooling").html(parseInt(SystemParameters.devices.camera.refrigeration.toFixed(0))+"%");
		}else{
			$("#PI_CameraTemperature").html("--");
			$("#PI_CameraCooling").html("--");
		}
	}
}

/*赤道仪按键函数*/
function SetupMountControllerFunction(){
	//中心按键
	$(".BDF_MenuButton").click(function(){
		//alert("遗漏的东西 ： 监测设备状态为IDLE的时候表示GOTO完毕，记得隐藏.Box_Goto");
		ShowTargetSearchForm({
			speed:true
			,select:function(data){	//选中目标后
				if(data.altitude[0]=="-"){
					MessageBox.Show({
						//title:"GOTO"
						//,content:"目标当前时间在地平线以下，是否继续GOTO？"
						title:Langtext("main.alert.goto_title")
						,content:Langtext("main.alert.goto_msg")
						,flag:MessageBox.FLAG_QUERY
						,buttons:MessageBox.BUTTONS_YES_NO
						,callback:function(res){
							console.log("准备GOTO：",res.result);
							if(res.result==MessageBox.BUTTON_YES){
								$(".Box_Goto").removeClass("Hide");
								__MountGoto(data.ra,data.dec);
								//状态GOTO完成的时候取消对话框显示
							}
						}
					});
					return false;
				}else{
					$(".Box_Goto").removeClass("Hide");
					__MountGoto(data.ra,data.dec);
				}
				return true;
			}
		});
	});
	$(".BDF_MenuButton").find("div").on("touchstart",function(){ShowTargetSearchForm({speed:true});});
	$(".DirectionButton").find("div").on("touchstart",MountControllerKeyDown);		//当手指按下的时候触发赤道仪移动事件
	$(".DirectionButton").find("div").on("touchend",MountControllerKeyUp);			//当手指抬起的时候停止赤道仪移动
	$(".DirectionButton").find("div").on("touchcancel",MountControllerKeyUp);		//为了防止意外，在取消触屏事件的时候再取消一次赤道仪移动
	//$(".DirectionButton").find("div").on("touchcancel",MountControllerKeyUp);
	/*
	$(".MountController").on("touchend",function(){
		$(".DBF_UP").css("background-color",Color_White);
		$(".DBF_DOWN").css("background-color",Color_White);
		$(".DBF_LEFT").css("background-color",Color_White);
		$(".DBF_RIGHT").css("background-color",Color_White);
		setTimeout(function(){__MountMove(0,0,MountSpeed);},0);
	});
	*/
	
	//取消GOTO按钮事件
	$(".Box_Goto_Button").click(function(){
		$(".Box_Goto").addClass("Hide");
		setTimeout(function(){__MountGotoStop();},0);
	});
}

//赤道仪移动按下事件
var _MountIsMove=false;
function MountControllerKeyDown(){
	if(_MountIsMove){return;}//如果赤道仪正在移动，则不允许移动，防止按键错误
	_MountIsMove=true;
	var id = this.id;
	$("."+id).css("background-color",Color_Green);
	var ra=0;
	var dec=0;
	if($(this).attr("axis")=="ra"){
		//ra
		ra=parseInt($(this).attr("direction"))
	}else{
		//dec
		dec=parseInt($(this).attr("direction"))
	}
	setTimeout(function(){
		__MountMove(ra,dec,MountSpeed);
	},0);
}

//赤道仪按键移动抬起事件
function MountControllerKeyUp(){
	_MountIsMove=false;
	var id = this.id;
	$("."+id).css("background-color",Color_White);
	setTimeout(function(){__MountMove(0,0,MountSpeed);},0);
	
}
//单击散点图函数
function Click_ScatterCanvas(){
	if($(".GuiderThumbnail").hasClass("Hide")){
		CloseThumbnail();
	}else{
		OpenThumbnail();
	}
}

//打开导星曲线（用于单击雷达图的时候触发）
function OpenThumbnail(){
	$(".GuiderThumbnail").addClass("Hide");
	$(".GuiderLine").removeClass("Hide");
	$(".GuiderFrame").removeClass("Closed");
	$(".GuiderFrame").addClass("Opened");
	GuiderObj.Display="Line";
	$(".MountController").addClass("Hide");
}

//关闭导星曲线（用于单击雷达图的时候触发）
function CloseThumbnail(){
	$(".GuiderThumbnail").removeClass("Hide");
	$(".GuiderLine").addClass("Hide");
	$(".GuiderFrame").addClass("Closed");
	$(".GuiderFrame").removeClass("Opened");
	GuiderObj.Display="Scatter";
	
	if(DisplayMountController){
		$(".MountController").removeClass("Hide");
	}
}

/*移动曝光时间滚动条*/
function MoveTime(){
	
}

function SetDisplayStatus(_r){
	alert(_r);
	var r =  AnythingToJson(_r);
	var requstData;
	if(r.result == 1){
		requstData=r.data;
		if(requstData==undefined){
			requstData={};
		}
		requstData._result=r.result;
	}else{
		if(requstData==undefined){
			requstData={};
		}
		requstData._result=r.result;
		requstData._data=r.data;
	}
	var s=requstData;
	if(s!=undefined && s!=null){
		/*
		 主设备更新，在页面最顶部的状态
		 首先把所有设备设置为空闲状态
		 然后根据从服务器中获得的状态进行对应更新
		 滤镜轮比较特殊，显示的是当前滤镜的标签（不带颜色）
		*/
		SystemParameters.status=s.status;
		$(".Status").attr("status",s.status==undefined?"idle":s.status);$(".Status").html(Langtext("main.status.idle"));
		$(".D_Camera").attr("status",s.status==undefined?"idle":s.status);$(".D_Camera").html(Langtext("main.devices.idle"));
		$(".D_Guider").attr("status",s.status==undefined?"idle":s.status);$(".D_Guider").html(Langtext("main.devices.idle"));
		$(".D_Mount").attr("status",s.status==undefined?"idle":s.status);$(".D_Mount").html(Langtext("main.devices.idle"));
		$(".D_Focuser").attr("status",s.status==undefined?"idle":s.status);$(".D_Focuser").html(Langtext("main.devices.idle"));
		$(".D_FilterWheels").attr("status",s.status==undefined?"idle":s.status);$(".D_FilterWheels").html(Langtext("main.devices.empty"));
		//下面一行中用于判断设备是否欠压，如果设备欠压，则设备状态背景色为红色，不欠压为绿色
		$(".Status").css("background-color",s.low_voltage=="true"?Color_Red:Color_Green);
		if(s.status!=undefined)$(".Status").html(Langtext("main.status."+s.status));
		if(s.camera!=undefined)$(".D_Camera").html(Langtext("main.devices."+s.camera));
		if(s.camera_g!=undefined)$(".D_Guider").html(Langtext("main.devices."+s.camera_g));
		if(s.focuser!=undefined)$(".D_Focuser").html(Langtext("main.devices."+s.focuser));
		if(s.mount!=undefined)$(".D_Mount").html(Langtext("main.devices."+s.mount));
		if(s.mount==undefined || s.mount=="idle"){
			$(".Box_Goto").addClass("Hide");
		}
		if(s.mount=="goto"){
			$(".Box_Goto").removeClass("Hide");
		}
		//滤镜轮标签更新
		if(s.filterwheels!=undefined && SystemParameters.devices.filterwheels!=undefined && SystemParameters.devices.filterwheels.holes!=undefined && SystemParameters.devices.filterwheels.holes.length>0){
			$(".D_FilterWheels").html(SystemParameters.devices.filterwheels.holes[s.filterwheels].label);
		}
		//如果设备温度值不为空，则更新设备当前温度
		if(s.temperature!=undefined){$(".Temperature").html(s.temperature);}
		//如果设备剩余空间不为空，则更新当前剩余空间信息
		if(s.capacity!=undefined){
			/*
			var _cap = s.capacity[1];
			var capacity=(_cap.toFixed(1))+" M";
			if(_cap>=1024){
				capacity=(_cap/1024).toFixed(1)+" G";
			}
			*/
			$(".Capacity").html(s.capacity[1]);
		}else{
			$(".Capacity").html("0M");
		}
		//更新赤道仪经纬度信息
		if(s.ra!=undefined){$("#PI_Ra").html(s.ra);}else{$("#PI_Ra").html("--");}
		if(s.dec!=undefined){$("#PI_Dec").html(s.dec);}else{$("#PI_Dec").html("--");}
		//更新相机制冷效率及当前温度（如果制冷打开的话）
		if(s.cool!=undefined && s.cool==true){
			$("#PI_CameraTemperature").html(s.camera_temperature+"°C");
			$("#PI_CameraCooling").html(parseInt(s.camera_refrigeration)+"%");
		}else{
			$("#PI_CameraTemperature").html("--");
			$("#PI_CameraCooling").html("--");
		}
		//更新系统设置界面中的当前经纬度，这个数据用于设置HOME位
		if(s.ra!=undefined && s.dec!=undefined){
			$("#NowLoc").html("RA : " + s.ra +"&nbsp;&nbsp;&nbsp;&nbsp;DEC : " +s.dec);
		}else{
			$("#NowLoc").html("");
		}
		//查看导星状态是否改变如果改变则将导星开启
		if(s.guider!=undefined){
			var _ss=s.guider;
			//与导星按钮上的状态做比较
			var grun_n=!(_ss=="stop" || _ss=="idle");
			var grun_o=GuiderIsRun();
			if (grun_n!=grun_o){
				__Guider_Status_Counter++;
				if(__Guider_Status_Counter>=2){
					__Guider_Status_Counter=0;
					//状态有改变
					//打开或关闭导星
					if(grun_n){
						//打开导星
						GuiderObj.Start();
					}else{
						//关闭导星
						GuiderObj.Stop();
					}
				}
			}else{
				__Guider_Status_Counter=0;
			}
		}else{
		}
	}
}
var __Guider_Status_Counter=0;//导星状态改变计数器，等2的时候才执行改变
/***********************************状态刷新**********************************/
//所有状态的刷新
var _DeviceStatusGetterLine=0;
function _DeviceStatusGetterFunction(){
    Alert("请输入正确的赤道仪时间，格式为：年-月-日 时:分:秒\n\n如：2019-03-14 22:03:14");
	RefreshDatetime();//刷新时间显示
	//*20190521异步修改*/
	__A__GetStatus(SetDisplayStatus);
}
//刷新页面时间
function RefreshDatetime(){
	var myDate = new Date();
	var date=myDate.getDate(); 
	var h=myDate.getHours();       //获取当前小时数(0-23)
	var m=myDate.getMinutes();     //获取当前分钟数(0-59)
	var s=myDate.getSeconds(); 
	var now=_getNow(h)+':'+_getNow(m)+":"+_getNow(s);
	$(".Datetime").html(now);
}
function _getNow(s) {
    return s < 10 ? '0' + s: s;
}
/*
 启动设备状态刷新函数
 首先不管是否已经启动，先关闭之前的启动
 然后调用一次更新函数
 最后利用定时器启动这个函数，时间为每秒钟访问一次。
 同时把启动定时器的指针存放到_DeviceStatusGetterLine中用于结束定时器。
*/
function _StartDeviceStatusGetterLine(){
	_StopDeviceStatusGetterLine();
	//RefreshDatetime();
	//setInterval(RefreshDatetime,1000);
	_DeviceStatusGetterFunction();
	_DeviceStatusGetterLine = setInterval(_DeviceStatusGetterFunction,1000);//每秒钟获取一次状态
}

//结束设备状态刷新定时器
function _StopDeviceStatusGetterLine(){
	clearInterval(_DeviceStatusGetterLine);
}

//初始化数组用，把数组出事哈为val值，很多个地方会用到。
function InitArray(arr,val){
	for(var i=0 ; i<arr.length ; i++){
		arr[i]=val;
	}
}


//**********************************初始化部分************************************
function InitWinInit(){
	$("#i_ok").click(function(){
		$(".DeviceInit_Setting").addClass("Hide");
	});
	$(".Init_GPS").click(function(){
		var d=GetLocalGPS();
		_MountSet_ReSetLocal(d.longitude,d.latitude,d.datetime);
		RefreshInitContent();
		MessageBox.Show({
			title:Langtext("settings.devices.alert.sync_title")
			,content:Langtext("settings.devices.alert.sync_msg")
		});
	});
	//单击经度按钮
	$("#i_log").click(function(){
		if(!CanModifySettings()){return;}
		var value=$("#i_log").html();
		var prefix = value.substring(0,1);
		if(prefix=="E"|| prefix=="W"){
			value = value.substring(1,value.length).trim();
		}else{
			prefix="";
		}
		ShowNnumberCard({
			value:value
			,strlist:["°","′","″"]
			,prefix:prefix
			,prefixlist:["E","W"]
			,check:function(data){
				var v=data.prefix+data.value.trim();
				//^[EW]?((\d|[1-9]\d|1[0-7]\d)[s\-,;°度](\d|[0-5]\d)[s\-,;′＇’分](\d|[0-5]\d)(\.\d{1,2})?[s\-,;/"＂”秒]?$)
				var p= /^[EW]?((\d|[1-9]\d|1[0-7]\d)[s\-,;°](\d|[0-5]\d)[s\-,;′](\d|[0-5]\d)(\.\d{1,2})?[s\-,;″]?$)/;
				if(!p.test(v)){
					//Alert("请输入正确格式的经度。\n范围是0°00′00″到179°59′59″\nE为东经，W西经\n\n注意：度部分不可超过180，分秒部分不可超过60，都为正整数");
					MessageBox.Show({
						//title:"设置错误"
						title:Langtext("settings.devices.alert.settingerror")
						,flag:MessageBox.FLAG_INFORMATION
						//,content:"请输入正确格式的经度。\n范围是0°00′00″到179°59′59″\nE为东经，W西经\n\n注意：度部分不可超过180，分秒部分不可超过60，都为正整数"
						,content:Langtext("settings.devices.alert.longitude_error")
					});
					return false;
				}
				return true;
			}
			,ok:function(data){
				if(!CanModifySettings()){return;}
				$("#i_log").html(data.prefix + " " +data.value.trim());
				$("#SS_Mount_Longitude").html(data.prefix + " " +data.value.trim());
				_MountSet_ReSetLocal();
				RefreshInitContent();
			}
		});
	});
	
	//单击纬度按钮
	$("#i_lat").click(function(){
		if(!CanModifySettings()){return;}
		var value=$("#i_lat").html();
		var prefix = value.substring(0,1);
		
		if(prefix=="S"|| prefix=="N"){
			value = value.substring(1,value.length).trim();
		}else{
			prefix="";
		}
		ShowNnumberCard({
			value:value
			,strlist:["+","-","°","′","″"]
			,prefix:prefix
			,prefixlist:["S","N"]
			,check:function(data){
				var v=data.prefix+data.value.trim();
				//^[EW]?((\d|[1-8]\d)[s\-,;°度](\d|[0-5]\d)[s\-,;′＇’分](\d|[0-5]\d)(\.\d{1,2})?[s\-,;/"＂”秒]?$)
				var p= /^[SN]?((\d|[1-8]\d)[s\-,;°](\d|[0-5]\d)[s\-,;′](\d|[0-5]\d)(\.\d{1,2})?[s\-,;″]?$)/;
				if(!p.test(v)){
					//Alert("请输入正确格式的经度。\n范围是0°00′00″到89°59′59″\nS为南半球，N为北半球\n\n注意：度部分不可超过90，分秒部分不可超过60，都为正整数");
					MessageBox.Show({
						//title:"无法执行任务"
						title:Langtext("settings.devices.alert.settingerror")
						,flag:MessageBox.FLAG_INFORMATION
						//,content:"请输入正确格式的纬度。\n范围是0°00′00″到89°59′59″\nS为南半球，N为北半球\n\n注意：度部分不可超过90，分秒部分不可超过60，都为正整数"
						,content:Langtext("settings.devices.alert.latitude_error")
					});
					return false;
				}
				return true;
			}
			,ok:function(data){
				if(!CanModifySettings()){return;}
				$("#i_lat").html(data.prefix + " " +data.value.trim());
				$("#SS_Mount_Latitude").html(data.prefix + " " +data.value.trim());
				_MountSet_ReSetLocal();
				RefreshInitContent();
			}
		});
	});
	
	$("#i_t").click(function(){
		//单击日期按钮
		if(!CanModifySettings()){return;}
		var value = $("#i_t").html().trim();
		ShowNnumberCard({
			value:value
			,strlist:["-",":"," "]
			,check:function(data){
				var v=data.value.trim();
				var p= /^[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])\s+(20|21|22|23|[0-1]\d):[0-5]\d:[0-5]\d$/;
				if(!p.test(v)){
					//Alert("请输入正确的赤道仪时间，格式为：年-月-日 时:分:秒\n\n如：2019-03-14 22:03:14");
					MessageBox.Show({
						//title:"无法执行任务"
						title:Langtext("settings.devices.alert.settingerror")
						,flag:MessageBox.FLAG_INFORMATION
						//,content:"请输入正确的赤道仪时间，格式为：年-月-日 时:分:秒\n\n如：2019-03-14 22:03:14"
						,content:Langtext("settings.devices.alert.time_error")
					});
					return false;
				}
				return true;
			}
			,ok:function(data){
				if(!CanModifySettings()){return;}
				var v = data.value.trim();
				$("#i_t").html(v);
				__SetParameters_Mount(null,null,null,null,null,v);		//更新赤道仪时间
				RefreshInitContent();
			}
		});
	});
	
	$("#i_cp").click(function(){
		//切换相机，首先查看自己在相机列表第几个，然后找出下一个，如果下一个超出列表，则选择第一个
		var port = $("#i_cp").attr("pid");
		var at=0;
		
		$(SystemParameters.devices.camera_g.alternative).each(function(i,e){
			if(e.trim()==port.trim()){
				at=i+1;
				return;
			}
		});
		if(at>=SystemParameters.devices.camera_g.alternative.length){
			at=0;
		}
		__ChangeCamera("camera",SystemParameters.devices.camera_g.alternative[at]);
		RefreshInitContent();
	});
	
	$("#i_gp").click(function(){
		//切换相机，首先查看自己在相机列表第几个，然后找出下一个，如果下一个超出列表，则选择第一个
		var port = $("#i_gp").attr("pid");
		var at=0;
		
		$(SystemParameters.devices.camera_g.alternative).each(function(i,e){
			if(e.trim()==port.trim()){
				at=i+1;
				return;
			}
		});
		if(at>=SystemParameters.devices.camera_g.alternative.length){
			at=0;
		}
		__ChangeCamera("camera_g",SystemParameters.devices.camera_g.alternative[at]);
		RefreshInitContent();
	});
	
	$("#i_cc").click(function(){
		if(!CanModifySettings()){return;}
		ShowNnumberCard({
			value:$("#i_cc").html().replace("mm","")
			,check:function(data){
				var v = parseInt(data.value);
				if(v>0 && v<100000){
					return true;
				}
				//Alert("请输入正确的望远镜口径！");
				MessageBox.Show({
					//title:"无法执行任务"
					title:Langtext("settings.devices.alert.settingerror")
					,flag:MessageBox.FLAG_INFORMATION
					//,content:"请输入正确的望远镜口径！"
					,content:Langtext("settings.devices.alert.caliber_error")
				});
				return false;
			}
			,ok:function(data){
				if(!CanModifySettings()){return;}
				var caliber = parseInt(data.value.replace("mm",""));
				$("#i_cc").html(caliber+"mm");
				__SetParameters_Camera(0,null,null,null,caliber,null);
				RefreshInitContent();
				$("#i_cf").html(SystemParameters.devices.camera.f);
				
			}
		});
	});
	
	$("#i_cfl").click(function(){
		if(!CanModifySettings()){return;}
		ShowNnumberCard({
			value:$("#i_cfl").html().replace("mm","")
			,check:function(data){
				var v = parseInt(data.value);
				if(v>0 && v<100000){
					return true;
				}
				//Alert("请输入正确的望远镜焦距！");
				MessageBox.Show({
					//title:"无法执行任务"
					title:Langtext("settings.devices.alert.settingerror")
					,flag:MessageBox.FLAG_INFORMATION
					//,content:"请输入正确的望远镜焦距！"
					,content:Langtext("settings.devices.alert.focal_error")
				});
				return false;
			}
			,ok:function(data){
				if(!CanModifySettings()){return;}
				var focal = parseInt(data.value.replace("mm",""));
				$("#i_cfl").html(focal+"mm");
				//计算焦比
				__SetParameters_Camera(0,null,null,null,null,focal);
				RefreshInitContent();
				$("#i_cf").html(SystemParameters.devices.camera_g.f);
			}
		});
	});
	$("#i_gc").click(function(){
		if(!CanModifySettings()){return;}
		ShowNnumberCard({
			value:$("#i_gc").html().replace("mm","")
			,check:function(data){
				var v = parseInt(data.value);
				if(v>0 && v<100000){
					return true;
				}
				//Alert("请输入正确的望远镜口径！");
				MessageBox.Show({
					//title:"无法执行任务"
					title:Langtext("settings.devices.alert.settingerror")
					,flag:MessageBox.FLAG_INFORMATION
					//,content:"请输入正确的望远镜口径！"
					,content:Langtext("settings.devices.alert.caliber_error")
				});
				return false;
			}
			,ok:function(data){
				if(!CanModifySettings()){return;}
				var caliber = parseInt(data.value.replace("mm",""));
				$("#i_gc").html(caliber+"mm");
				__SetParameters_Camera(1,null,null,null,caliber,null);
				RefreshInitContent();
				$("#i_gf").html(SystemParameters.devices.camera_g.f);
				
			}
		});
	});
	
	$("#i_gfl").click(function(){
		if(!CanModifySettings()){return;}
		ShowNnumberCard({
			value:$("#i_gfl").html().replace("mm","")
			,check:function(data){
				var v = parseInt(data.value);
				if(v>0 && v<100000){
					return true;
				}
				//Alert("请输入正确的望远镜焦距！");
				MessageBox.Show({
					//title:"无法执行任务"
					title:Langtext("settings.devices.alert.settingerror")
					,flag:MessageBox.FLAG_INFORMATION
					//,content:"请输入正确的望远镜焦距！"
					,content:Langtext("settings.devices.alert.focal_error")
				});
				return false;
			}
			,ok:function(data){
				if(!CanModifySettings()){return;}
				var focal = parseInt(data.value.replace("mm",""));
				$("#i_gfl").html(focal+"mm");
				//计算焦比
				__SetParameters_Camera(1,null,null,null,null,focal);
				RefreshInitContent();
				$("#i_gf").html(SystemParameters.devices.camera.f);
			}
		});
	});
	if(SystemParameters.devices!=undefined){
		if(SystemParameters.devices.camera!=undefined && (SystemParameters.devices.camera.caliber==undefined || SystemParameters.devices.camera.caliber==0 || SystemParameters.devices.camera.focus==undefined || SystemParameters.devices.camera.focus==0)){
			//摄像头没有初始化
			$(".DeviceInit_Setting").removeClass("Hide");
			InitWinContent();
		}else if(SystemParameters.devices.camera_g!=undefined && (SystemParameters.devices.camera_g.caliber==undefined || SystemParameters.devices.camera_g.caliber==0 || SystemParameters.devices.camera_g.focus==undefined || SystemParameters.devices.camera_g.focus==0)){
			//导星相机没有初始化
			$(".DeviceInit_Setting").removeClass("Hide");
			InitWinContent();
		}
	}
}

function InitWinContent(){
	RefreshInitContent();
}

function RefreshInitContent(){
	UpdateDevicesInfo(false);
	//更新数据
	if(SystemParameters.devices!=undefined && SystemParameters.devices.mount!=undefined){
		$("#i_mp").html( SystemParameters.devices.mount.port);
		$("#i_log").html( SystemParameters.devices.mount.longitude);
		$("#i_lat").html( SystemParameters.devices.mount.latitude);
		$("#i_t").html( SystemParameters.devices.mount.datetime);
	}
	if(SystemParameters.devices!=undefined && SystemParameters.devices.camera!=undefined){
		$("#i_cp").attr("pid",SystemParameters.devices.camera.id);
		$("#i_cp").html( SystemParameters.devices.camera.port);
		$("#i_cc").html( SystemParameters.devices.camera.caliber);
		$("#i_cfl").html( SystemParameters.devices.camera.focus);
		$("#i_cf").html(SystemParameters.devices.camera.f);
	}
	if(SystemParameters.devices!=undefined && SystemParameters.devices.camera_g!=undefined){
		$("#i_gp").attr("pid",SystemParameters.devices.camera_g.id);
		$("#i_gp").html( SystemParameters.devices.camera_g.port);
		$("#i_gc").html( SystemParameters.devices.camera_g.caliber);
		$("#i_gfl").html( SystemParameters.devices.camera_g.focus);
		$("#i_gf").html(SystemParameters.devices.camera_g.f);
	}
}
