// 对焦相关

var _AutoFocuserLine=0;		//自动对焦线程
//开始自动对焦
function StartAutoFocuser(){
	var camera = $(".Focuser_Camera").attr("type")=="0"?"camera":"camera_g";
	__StartAutoFocuser(camera);
	$(".Focuser_Auto").attr("status","run");
	//$(".Focuser_Auto").html("停止对焦");
	$(".Focuser_Auto").html(Langtext("focuser.stop_auto"));
	//启动线程
	OpenAutoFocuserLine();
}

//结束自动对焦
function StopAutoFocuser(){
	var camera = $(".Focuser_Camera").attr("type")=="0"?"camera":"camera_g";
	__StopAutoFocuser(camera);
	$(".Focuser_Auto").attr("status","stop");
	//$(".Focuser_Auto").html("自动对焦");
	$(".Focuser_Auto").html(Langtext("focuser.start_auto"));
	CloseAutoFocuserLine();
}

//询问线程
function AutoFocuserLineFunction(){
	var c = "camera";
	c=$(".Focuser_Camera").attr("type")=="0"?"camera":"camera_g";
	var res = __GetAutoFocuserProgress(c);
	if(res.status!=null){
		if(res.status=="exposure"){
			$(".Focuser_Datas").attr("status","auto");
			//$(".Focuser_Status").html("自动对焦 : 拍摄中...");
			$(".Focuser_Status").html(Langtext("focuser.status.exping"));
		}else if (res.status=="focus"){
			$(".Focuser_Datas").attr("status","auto");
			//$(".Focuser_Status").html("自动对焦 : 调焦中...");
			$(".Focuser_Status").html(Langtext("focuser.status.focusing"));
		}else if (res.status=="complete" || res.status=="idle"){
			$(".Focuser_Datas").attr("status","idle");
			$(".Focuser_Status").html(" ");
			//完成
			StopAutoFocuser();
		}
		if(res.focus!=undefined){
			//$(".Focuser_Value").html("焦点 : " + res.focus);
			$(".Focuser_Value").html(Langtext("focuser.focus",res.focus));
		}
		if(res.hfd!=undefined){
			//$(".Focuser_HFR").html("半宽 : " + res.hfd.toFixed(2));
			$(".Focuser_HFR").html(Langtext("focuser.hfr",res.hfd.toFixed(2)));
		}
	}
}
//打开询问线程
function OpenAutoFocuserLine(){
	CloseAutoFocuserLine();
	AutoFocuserLineFunction();
	_AutoFocuserLine = setInterval(AutoFocuserLineFunction,1000);
}
//关闭询问线程
function CloseAutoFocuserLine(){
	clearInterval(_AutoFocuserLine);
	_AutoFocuserLine=0;
}


//初始化对焦
function InitFoucser(){
	//对焦按钮单击
	$(".M_Focuser").click(function(){
		if(SystemParameters.status!="idle"){
			MessageBox.Show({
				//title:"不支持调焦"
				//,content:"导星镜不支持自动调焦！"
				title:Langtext("focuser.alert.unable_title")
				,content:Langtext("focuser.alert.device_actived_error")
			});
			return;
		}
		$(".FocuserForm").removeClass("Hide");
		$(".MainForm").addClass("Hide");
		var c = "camera";
		c=$(".Focuser_Camera").attr("type")=="0"?"camera":"camera_g";
		var ig = document.getElementById("Focuser_Image_Video");
		ig.width=window.screen.width;
		ig.height=window.screen.height;
		OpenVideo(c,ig);
		BuildGFParams();
	});
	
	//关闭按钮
	$("#FocuserFormCloseButton").click(function(){
		$(".FocuserForm").addClass("Hide");
		$(".MainForm").removeClass("Hide");
		CloseVideo("camera_g");
		if(SystemParameters.devices.camera!=undefined && SystemParameters.devices.camera.video==true){
			var ig = document.getElementById("ImageCollector_Video");
			ig.width=window.screen.width;
			ig.height=window.screen.height;
			OpenVideo("camera",ig);
		}else{
			CloseVideo("camera");
		}
	});
	//时间设置窗口调出按钮
	$(".Focuser_Timeset").click(function(){
		if($(".Focuser_Exposures").hasClass("Hide")){
			$(".Focuser_Exposures").removeClass("Hide");
		}else{
			$(".Focuser_Exposures").addClass("Hide");
		}
	});
	
	//曝光时间设置
	$(".Focuser_Exposures_Group").find(".Radio_Button").click(function(){
		var f_time=parseFloat($(this).attr("value"));
		if(f_time==0){
			//自定义
			f_time=parseFloat($("#AUD_Video_Time").html().replace("S","").replace(" ",""));
		}
		$("#AUD_Video_Time").html(f_time+" S");
		var video=false;
		var camera="camera";
		if($(".Focuser_Camera").attr("type")=="0"){
			SystemParameters.devices.camera.video_time=f_time;
			camera="camera";
			//video=SystemParameters.devices.camera.video;
		}else{
			SystemParameters.devices.camera_g.video_time=f_time;
			camera="camera_g";
			//video=SystemParameters.devices.camera_g.video;
		}
		$(".Focuser_Exposures_Group").find(".Radio_Button").each(function(i,e){
			$(e).attr("checked",false);
		});
		$(this).attr("checked",true);
		__SetCameraVideoTime(camera,true,f_time);
		UpdateSystemInfo();//调用Setting.js的界面更新程序
	});
	
	$("#AUD_Video_Time").click(function(){
		ShowNnumberCard({
			value:$("#AUD_Video_Time").html().replace("S","").replace(" ","")
			,check:function(data){
				return true;
			}
			,ok:function(data){
				var v = parseFloat(data.value);
				$("#AUD_Video_Time").html(v+" S");
				//UpdateDevicesInfo();
				$(".Focuser_Exposures_Group").find(".Radio_Button").each(function(i,e){
					$(e).attr("checked",false);
				});
				$(".AUDT0").attr("checked",true);
				//更新时间
				var video=false;
				var camera="camera";
				if($(".Focuser_Camera").attr("type")=="0"){
					SystemParameters.devices.camera.video_time=v;
					camera="camera";
					video=SystemParameters.devices.camera.video;
				}else{
					SystemParameters.devices.camera_g.video_time=v;
					camera="camera_g";
					video=SystemParameters.devices.camera_g.video;
				}
				__SetCameraVideoTime(camera,true,v);
				UpdateSystemInfo();//调用Setting.js的界面更新程序
			}
		});
	});
	
	//自动调焦按钮
	$(".Focuser_Auto").click(function(){
		//if(_AutoFocuserLine!=0){return;}		//这里应该判断朱状态是否在调焦中

		if($(".Focuser_Camera").attr("type")=="0"){
			//只有主镜支持自动调焦
			if($(".Focuser_Auto").attr("status")=="run"){
				StopAutoFocuser();
			}else{
				if(SystemParameters.devices.focuser!=undefined){
					StartAutoFocuser();
				}else{
					MessageBox.Show({
						//title:"不支持调焦"
						//,content:"导星镜不支持自动调焦！"
						title:Langtext("focuser.alert.unable_title")
						,content:Langtext("focuser.alert.focuser_does_not_exist")
					});
				}
			}
		}else{
			MessageBox.Show({
				//title:"不支持调焦"
				//,content:"导星镜不支持自动调焦！"
				title:Langtext("focuser.alert.unsupport_title")
				,content:Langtext("focuser.alert.unsupport_msg")
			});
		}
	});
	
	//Gain Offset设置，系统初始化的时候可以获得该参数
	$("#AUD_Gains").find(".Radio_Button").each(function(i,e){
		$(e).click(function(){
			var d = $(this);
			var txt = d.attr("value");
			$("#AUD_Gains").find(".Radio_Button").each(function(ii,ee){
				$(ee).attr("checked",false);
			});
			d.attr("checked",true);
			if(txt!=0){
				$("#AUD_Gain_T").html(txt);
				__SetParameters_Camera(_AUD_Camera,null,null,null,null,null,txt);
			}
		});
	});
	$("#AUD_Gain_T").click(function(){
		ShowNnumberCard({
			value:$("#AUD_Gain_T").html()
			,check:function(data){
				var v = parseInt(data.value);
				if(v>0 && v<=_AUD_Gain_Max){
					return true;
				}
				//Alert("请输入正确的Gain值，取值范围为0 - "+SystemParameters.devices.camera.gain_max);
				MessageBox.Show({
					//title:"无法执行任务"
					title:Langtext("settings.devices.alert.settingerror")
					,flag:MessageBox.FLAG_INFORMATION
					//,content:"请输入正确的Gain值，取值范围为0 - "+SystemParameters.devices.camera.gain_max
					,content:Langtext("settings.devices.alert.gain_error",_AUD_Gain_Max)
				});
				return false;
			}
			,ok:function(data){
				if(!CanModifySettings()){return;}
				var gain = parseInt(data.value);
				$("#AUD_Gain_T").html(gain);
				__SetParameters_Camera(_AUD_Camera,null,null,null,null,null,gain);
				$("#AUD_Gains").find(".Radio_Button").each(function(ii,ee){
					$(ee).attr("checked",false);
				});
				$("#AUD_Gains").find(".Radio_Button").eq(3).attr("checked",true);
			}
		});
	});
	
	$("#AUD_Offsets").find(".Radio_Button").each(function(i,e){
		$(e).click(function(){
			var d = $(this);
			var txt = d.attr("value");
			$("#AUD_Offsets").find(".Radio_Button").each(function(ii,ee){
				$(ee).attr("checked",false);
			});
			d.attr("checked",true);
			if(txt!=0){
				$("#AUD_Offset_T").html(txt);
				__SetParameters_Camera(_AUD_Camera,null,null,null,null,null,null,txt);
			}
		});
	});
	$("#AUD_Offset_T").click(function(){
		ShowNnumberCard({
			value:$("#AUD_Offset_T").html()
			,check:function(data){
				var v = parseInt(data.value);
				if(v>0 && v<=_AUD_Offset_Max){
					return true;
				}
				//Alert("请输入正确的Offset值，取值范围为0 - "+SystemParameters.devices.camera.offset_max);
				MessageBox.Show({
					//title:"无法执行任务"
					title:Langtext("settings.devices.alert.settingerror")
					,flag:MessageBox.FLAG_INFORMATION
					//,content:"请输入正确的Offset值，取值范围为0 - "+SystemParameters.devices.camera.offset_max
					,content:Langtext("settings.devices.alert.offset_error",_AUD_Offset_Max)
				});
				return false;
			}
			,ok:function(data){
				if(!CanModifySettings()){return;}
				var offset = parseInt(data.value);
				$("#AUD_Offset_T").html(offset);
				__SetParameters_Camera(_AUD_Camera,null,null,null,null,null,null,offset);
				$("#AUD_Offsets").find(".Radio_Button").each(function(ii,ee){
					$(ee).attr("checked",false);
				});
				$("#AUD_Offsets").find(".Radio_Button").eq(3).attr("checked",true);
			}
		});
	});
	
	//手动调焦按钮
	$(".Focuser_Out").on("touchstart",function(){
		if($(".Focuser_Camera").attr("type")=="0"){
			//只有主镜支持自动调焦
			if(_AutoFocuserLine!=0){return;}		//这里应该判断朱状态是否在调焦中
			var camera = $(".Focuser_Camera").attr("type")=="0"?"camera":"camera_g";
			__FocuserMove(camera,1);
		}else{
			MessageBox.Show({
				title:Langtext("focuser.alert.unsupport_title")
				,content:Langtext("focuser.alert.unsupport_msg")
			});
		}
	});
	$(".Focuser_Out").on("touchend",function(){
		if($(".Focuser_Camera").attr("type")=="0"){
			if(_AutoFocuserLine!=0){return;}		//这里应该判断朱状态是否在调焦中
			var camera = $(".Focuser_Camera").attr("type")=="0"?"camera":"camera_g";
			__FocuserMove(camera,0);
		}
	});
	
	$(".Focuser_In").on("touchstart",function(){
		if($(".Focuser_Camera").attr("type")=="0"){
			if(_AutoFocuserLine!=0){return;}		//这里应该判断朱状态是否在调焦中
			var camera = $(".Focuser_Camera").attr("type")=="0"?"camera":"camera_g";
			__FocuserMove(camera,-1);
		}else{
			MessageBox.Show({
				title:Langtext("focuser.alert.unsupport_title")
				,content:Langtext("focuser.alert.unsupport_msg")
			});
		}
	});
	$(".Focuser_In").on("touchend",function(){
		if($(".Focuser_Camera").attr("type")=="0"){
			if(_AutoFocuserLine!=0){return;}		//这里应该判断朱状态是否在调焦中
			var camera = $(".Focuser_Camera").attr("type")=="0"?"camera":"camera_g";
			__FocuserMove(camera,0);
		}
	});
	
	
	
	//主副镜切换按钮
	$(".Focuser_Camera").click(function(){
		if(_AutoFocuserLine!=0){return;}		//这里应该判断朱状态是否在调焦中
		if($(".Focuser_Camera").attr("type")=="0"){
			$(".Focuser_Camera").attr("type","1");
			$(".Focuser_Camera").html(Langtext("focuser.guidercamera"));
		}else{
			$(".Focuser_Camera").attr("type","0");
			$(".Focuser_Camera").html(Langtext("focuser.camera"));
		}
		var c=$(".Focuser_Camera").attr("type")=="0"?"camera":"camera_g";
		//var c="camera";
		var ig = document.getElementById("Focuser_Image_Video");
		ig.width=window.screen.width;
		ig.height=window.screen.height;
		OpenVideo(c,ig);
		UpdateSystemInfo();//更新时间显示
		BuildGFParams();
	});
}

//构造请求用的Gain和Offset参数
var _AUD_Gain_Max=0;
var _AUD_Offset_Max=0;
var _AUD_Camera=0;
var _AUD_Cameras="camera";
function BuildGFParams(){
	var gain=0, offset=0;
	if($(".Focuser_Camera").attr("type")=="0"){
		_AUD_Camera=0;
		_AUD_Cameras="camera";
		_AUD_Gain_Max=SystemParameters.devices.camera.gain_max;
		_AUD_Offset_Max=SystemParameters.devices.camera.offset_max;
		gain=SystemParameters.devices.camera.gain;
		offset=SystemParameters.devices.camera.offset;
	}else{
		_AUD_Camera=1;
		_AUD_Cameras="camera_g";
		_AUD_Gain_Max=SystemParameters.devices.camera_g.gain_max;
		_AUD_Offset_Max=SystemParameters.devices.camera_g.offset_max;
		gain=SystemParameters.devices.camera_g.gain;
		offset=SystemParameters.devices.camera_g.offset;
	}
	//设置数值
	$("#AUD_Gains").find(".Radio_Button").eq(0).attr("value",parseInt(_AUD_Gain_Max*.25));
	$("#AUD_Gains").find(".Radio_Button").eq(1).attr("value",parseInt(_AUD_Gain_Max*.5));
	$("#AUD_Gains").find(".Radio_Button").eq(2).attr("value",parseInt(_AUD_Gain_Max*.75));
	$("#AUD_Gain_T").html(gain);
	$("#AUD_Gains").find(".Radio_Button").each(function(ii,ee){
		$(ee).attr("checked",false);
	});
	$("#AUD_Gains").find(".Radio_Button").eq(3).attr("checked",true);

	$("#AUD_Offsets").find(".Radio_Button").eq(0).attr("value",parseInt(_AUD_Offset_Max*.25));
	$("#AUD_Offsets").find(".Radio_Button").eq(1).attr("value",parseInt(_AUD_Offset_Max*.5));
	$("#AUD_Offsets").find(".Radio_Button").eq(2).attr("value",parseInt(_AUD_Offset_Max*.75));
	$("#AUD_Offset_T").html(offset);
	$("#AUD_Offsets").find(".Radio_Button").each(function(ii,ee){
		$(ee).attr("checked",false);
	});
	$("#AUD_Offsets").find(".Radio_Button").eq(3).attr("checked",true);
}

//调焦窗口初始化
function InitFocuserContent(){
	
};