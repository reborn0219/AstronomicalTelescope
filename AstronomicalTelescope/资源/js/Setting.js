// 设置相关
//只有空闲和跟星中可以修改，其他状态都不可以修改
function CanModifySettings(){
	if(SystemParameters.status=="idle" || SystemParameters.status=="track"){
		return true;
	}
	return false;
}

//初始化设置部分
function InitSetting(){
	SettingClickOperationFunction();		//设备设置按钮单击操作
	
	MountSettingOperationFunction();		//赤道仪设置窗口
	CameraSettingOperationFunction();		//主镜设置窗口
	GuiderCameraSettingOperationFunction();	//导星镜设置窗口
	FocuserSettingOperationFunction();		//调焦器设置窗口
	FilterWheelsSettingOperationFunction();	//滤镜轮设置窗口
	
	SystemSettingOperationFunction();		//系统设置窗口
	
	InitFilterColors();						//初始化滤镜标签颜色
	
	//所有设备设置的关闭按钮
	$("#SettingFormCloseButton").click(function(){
		$("#SettingForm").addClass("Hide");
		$("#MainForm").removeClass("Hide");
	});
	//主页右上角的菜单按钮（单击后首先调用设备属性查询）
	$("#MenuButton").click(function(){
		$("#SettingForm").removeClass("Hide");
		$("#MainForm").addClass("Hide");
		//调用设备属性查询
		UpdateDevicesInfo();
	});
	//选项卡按钮（如果单击的是设备连接，则调用设备查询）
	$(".TabCards").find("div").click(SettingCardClick);
}


//所有设备设置按钮的单击事件注册
function SettingClickOperationFunction(){
	$(".DM_Set").click(function(){
		$(".Set_Device_Form").addClass("Hide");
		$(".Device_Setting").removeClass("Hide");
		$("."+$(this).attr("id")+"_Form").removeClass("Hide");
		UpdateSettingFormInfo();
	});
}

//设置设置窗口的数值变化
function UpdateSettingFormInfo(){
	//设置所有设备框内的内容
	if(SystemParameters.devices.mount!=undefined){
		$("#SS_Mount_Port").html(SystemParameters.devices.mount.port);
		$("#SS_Mount_Longitude").html(SystemParameters.devices.mount.longitude!=undefined?SystemParameters.devices.mount.longitude:" ");
		$("#SS_Mount_Latitude").html(SystemParameters.devices.mount.latitude!=undefined?SystemParameters.devices.mount.latitude:" ");
		$("#SS_Mount_Date").html(SystemParameters.devices.mount.datetime!=undefined?SystemParameters.devices.mount.datetime:" ");
	}

	if(SystemParameters.devices.camera!=undefined){
		$("#SS_Camera_Port").html(SystemParameters.devices.camera.port);
		$("#SS_Camera_Port").attr("pid",SystemParameters.devices.camera.id);
		$("#SS_Camera_Caliber").html(SystemParameters.devices.camera.caliber!=undefined?SystemParameters.devices.camera.caliber+"mm":"0mm");
		$("#SS_Camera_Focal").html(SystemParameters.devices.camera.focus!=undefined?SystemParameters.devices.camera.focus+"mm":"0mm");
		$("#SS_Camera_F").html(SystemParameters.devices.camera.f);
		$("#SS_Camera_Gain").html(SystemParameters.devices.camera.gain!=undefined?SystemParameters.devices.camera.gain:0);
		$("#SS_Camera_Offset").html(SystemParameters.devices.camera.offset!=undefined?SystemParameters.devices.camera.offset:0);
		$("#SS_Camera_Cool").attr("checked",SystemParameters.devices.camera.cool!=undefined && SystemParameters.devices.camera.cool);
		$("#SS_Camera_PTemp").html(SystemParameters.devices.camera.preset_temperature!=undefined?SystemParameters.devices.camera.preset_temperature+"°C":"-0°C");
	}

	if(SystemParameters.devices.camera_g!=undefined){
		$("#SS_GuiderCamera_Port").html(SystemParameters.devices.camera_g.port);
		$("#SS_GuiderCamera_Port").attr("pid",SystemParameters.devices.camera_g.id);
		$("#SS_GuiderCamera_Caliber").html(SystemParameters.devices.camera_g.caliber!=undefined?SystemParameters.devices.camera_g.caliber+"mm":"0mm");
		$("#SS_GuiderCamera_Focal").html(SystemParameters.devices.camera_g.focus!=undefined?SystemParameters.devices.camera_g.focus+"mm":"0mm");
		$("#SS_GuiderCamera_F").html(SystemParameters.devices.camera_g.f);
		$("#SS_GuiderCamera_Gain").html(SystemParameters.devices.camera_g.gain!=undefined?SystemParameters.devices.camera_g.gain:0);
		$("#SS_GuiderCamera_Offset").html(SystemParameters.devices.camera_g.offset!=undefined?SystemParameters.devices.camera_g.offset:0);
	}

	if(SystemParameters.devices.focuser!=undefined){$("#SS_Focuser_Port").html(SystemParameters.devices.focuser.port);
		$("#SS_Focuser_Position").html(SystemParameters.devices.focuser.position!=undefined?SystemParameters.devices.focuser.position:0);
		$("#SS_Focuser_Max").html(SystemParameters.devices.focuser.max!=undefined?SystemParameters.devices.focuser.max:0);
	}

	if(SystemParameters.devices.filterwheels!=undefined){
		$("#SS_FilterWheels_Port").html(SystemParameters.devices.filterwheels.port);
		$("#SS_FilterWheels_Hole").html(SystemParameters.devices.filterwheels.holes.length!=undefined?SystemParameters.devices.filterwheels.holes.length:0);
		$(".SS_Filters_List").html("");
		if(SystemParameters.devices.filterwheels.holes.length!=undefined){
			$(SystemParameters.devices.filterwheels.holes).each(function(i,e){
				label = e.label;
				color=e.color;color==""?c="#ABABAB":color;
				AddFilter2SettingForm(label,color);
			});
		}
	}
}

//更新设备属性信息(默认为同步调用)
function UpdateDevicesInfo(async){
	async=async==undefined?true:async;
	//async=false;//由于异步调用可能出错，换成同步试试看
	if(async){
		//异步调用
		setTimeout(function(){
			___UpdateDevicesInfo();
		},0);
	}else{
		//同步调用
		___UpdateDevicesInfo();
	}
}
//仅供上一个函数调用
function ___UpdateDevicesInfo(){
	var rsd =__GetParameters_Devices();
	SystemParameters.devices=rsd;
	//alert(JSON.stringify(rsd));
	//alert(JSON.stringify(SystemParameters.devices));
	//console.log("__GetParameters_Devices" , SystemParameters.devices);
	//更新设置信息
	//console.log(SystemParameters);
	$(".Mount_Speed").find(".Radio_Button").remove();	//清空现有赤道仪倍率
	//alert(JSON.stringify(SystemParameters.devices));
	//alert(JSON.stringify(SystemParameters.devices.mount));
	if(SystemParameters.devices.mount!=undefined){
		$(".DM_Mount").parent().removeClass("Hide");
		$("#DM_Mount_Brand").html(SystemParameters.devices.mount.brand!=undefined?SystemParameters.devices.mount.brand:Langtext("settings.devices.unidentified"));
		$("#DM_Mount_Model").html(SystemParameters.devices.mount.model!=undefined?SystemParameters.devices.mount.model:Langtext("settings.devices.unidentified"));
		$("#DM_Mount_Longitude").html(SystemParameters.devices.mount.longitude!=undefined?SystemParameters.devices.mount.longitude:" ");
		$("#DM_Mount_Latitude").html(SystemParameters.devices.mount.latitude!=undefined?SystemParameters.devices.mount.latitude:" ");
		$("#DM_Mount_Datetime").html(SystemParameters.devices.mount.datetime!=undefined?SystemParameters.devices.mount.datetime:" ");
		
		//设置赤道仪移动倍率
		$(SystemParameters.devices.mount.speeds).each(function(i,e){
			var d=$('<div class="Radio_Button MountSpeedItem" speed="'+i+'">× '+e+'</div>');
			$(".Mount_Speed").append(d);
			d.attr("checked",MountSpeed==i)
			d.click(function(){
				$(".Mount_Speed").find(".Radio_Button").each(function(i,e){
					$(e).attr("checked",false);
				});
				$(this).attr("checked",true);
				SetMountSpeed($(this).attr("speed"));
			});
		});
		if(MountSpeed==-1){
			if(SystemParameters.devices.mount.speeds.length==undefined || SystemParameters.devices.mount.speeds.length==0){
				SetMountSpeed(0);
			}else{
				SetMountSpeed(SystemParameters.devices.mount.speeds.length-1);
			}
		}
	}else{
		$(".DM_Mount").parent().addClass("Hide");
	}
	
	//主相机
	$("#EXP_Bins").html("");
	if(SystemParameters.devices.camera!=undefined){
		$(".DM_Camera").parent().removeClass("Hide");
		$("#DM_Camera_Brand").html(SystemParameters.devices.camera.brand!=undefined?SystemParameters.devices.camera.brand:Langtext("settings.devices.unidentified"));
		$("#DM_Camera_Model").html(SystemParameters.devices.camera.model!=undefined?SystemParameters.devices.camera.model:Langtext("settings.devices.unidentified"));
		$("#DM_Camera_Size").html(SystemParameters.devices.camera.width!=undefined?(SystemParameters.devices.camera.width +"×" + SystemParameters.devices.camera.height):Langtext("main.devices.unidentified"));
		$("#DM_Camera_Color").html(SystemParameters.devices.camera.color=="C"?Langtext("settings.devices.c_color"):Langtext("settings.devices.c_monochrome"));
		$("#DM_Camera_Caliber").html(SystemParameters.devices.camera.caliber!=undefined?SystemParameters.devices.camera.caliber+"mm":"0mm");
		$("#DM_Camera_Focal").html(SystemParameters.devices.camera.focus!=undefined?SystemParameters.devices.camera.focus+"mm":"0mm");
		SystemParameters.devices.camera.f=0;
		if(SystemParameters.devices.camera.caliber!=undefined && SystemParameters.devices.camera.focus!=undefined){
			SystemParameters.devices.camera.f=SystemParameters.devices.camera.focus/SystemParameters.devices.camera.caliber
			SystemParameters.devices.camera.f=SystemParameters.devices.camera.f.toFixed(2);
		}else{
			SystemParameters.devices.camera.f=0;
		}
		$("#DM_Camera_F").html(SystemParameters.devices.camera.f);
		//修改首页的Bin
		//bin = $("#EXP_Bins").attr("bin");
		$(SystemParameters.devices.camera.bins).each(function(i,e){
			var d=$('<div class="Radio_Button" checked bin="'+i+'">Bin '+e+'</div>');
			$("#EXP_Bins").append(d);
			d.click(function(){
				//单击bin按钮的时候
				ExposureBin = $(this).attr("bin");
				UpdateExposureDisplayData();
			});
			d.attr("checked",i==ExposureBin);
		});
		//设置首页的Gain和Offset
		console.log("设置GainOffset");
		$("#EXP_Gains").find(".Radio_Button").eq(0).attr("value",parseInt(SystemParameters.devices.camera.gain_max*.25));
		$("#EXP_Gains").find(".Radio_Button").eq(1).attr("value",parseInt(SystemParameters.devices.camera.gain_max*.5));
		$("#EXP_Gains").find(".Radio_Button").eq(2).attr("value",parseInt(SystemParameters.devices.camera.gain_max*.75));
		$("#EXP_Gain_T").html(SystemParameters.devices.camera.gain);
		
		$("#EXP_Offsets").find(".Radio_Button").eq(0).attr("value",parseInt(SystemParameters.devices.camera.offset_max*.25));
		$("#EXP_Offsets").find(".Radio_Button").eq(1).attr("value",parseInt(SystemParameters.devices.camera.offset_max*.5));
		$("#EXP_Offsets").find(".Radio_Button").eq(2).attr("value",parseInt(SystemParameters.devices.camera.offset_max*.75));
		$("#EXP_Offset_T").html(SystemParameters.devices.camera.offset);
	}else{
		$(".DM_Camera").parent().addClass("Hide");
	}
	
	//导星相机
	if(SystemParameters.devices.camera_g!=undefined){
		$(".DM_GuiderCamera").parent().removeClass("Hide");
		
		$("#DM_GuiderCamera_Brand").html(SystemParameters.devices.camera_g.brand!=undefined?SystemParameters.devices.camera_g.brand:Langtext("settings.devices.unidentified"));
		$("#DM_GuiderCamera_Model").html(SystemParameters.devices.camera_g.model!=undefined?SystemParameters.devices.camera_g.model:Langtext("settings.devices.unidentified"));
		$("#DM_GuiderCamera_Size").html(SystemParameters.devices.camera_g.width!=undefined?(SystemParameters.devices.camera_g.width +"×" + SystemParameters.devices.camera_g.height):Langtext("settings.devices.unidentified"));
		$("#DM_GuiderCamera_Color").html(SystemParameters.devices.camera_g.color=="C"?Langtext("settings.devices.c_color"):Langtext("settings.devices.c_monochrome"));
		$("#DM_GuiderCamera_Caliber").html(SystemParameters.devices.camera_g.caliber!=undefined?SystemParameters.devices.camera_g.caliber+"mm":"0mm");
		$("#DM_GuiderCamera_Focal").html(SystemParameters.devices.camera_g.focus!=undefined?SystemParameters.devices.camera_g.focus+"mm":"0mm");
		SystemParameters.devices.camera_g.f=0;
		if(SystemParameters.devices.camera_g.caliber!=undefined && SystemParameters.devices.camera_g.focus!=undefined){
			SystemParameters.devices.camera_g.f=SystemParameters.devices.camera_g.focus/SystemParameters.devices.camera_g.caliber
			SystemParameters.devices.camera_g.f=SystemParameters.devices.camera_g.f.toFixed(2);
		}else{
			SystemParameters.devices.camera_g.f=0;
		}
		$("#DM_GuiderCamera_F").html(SystemParameters.devices.camera_g.f);
		
	}else{
		$(".DM_GuiderCamera").parent().addClass("Hide");
	}
	
	//电调焦
	if(SystemParameters.devices.focuser!=undefined){
		$(".DM_Focuser").parent().removeClass("Hide");
		$("#DM_Focuser_Brand").html(SystemParameters.devices.focuser.brand!=undefined?SystemParameters.devices.focuser.brand:Langtext("settings.devices.unidentified"));
		$("#DM_Focuser_Model").html(SystemParameters.devices.focuser.model!=undefined?SystemParameters.devices.focuser.model:Langtext("settings.devices.unidentified"));
	}else{
		$(".DM_Focuser").parent().addClass("Hide");
	}
	
	//滤镜轮
	$("#EXP_Filters").html("");
	if(SystemParameters.devices.filterwheels!=undefined){
		$(".DM_FilterWheels").parent().removeClass("Hide");
		$("#DM_FilterWheels_Brand").html(SystemParameters.devices.filterwheels.brand!=undefined?SystemParameters.devices.filterwheels.brand:Langtext("settings.devices.unidentified"));
		$("#DM_FilterWheels_Model").html(SystemParameters.devices.filterwheels.model!=undefined?SystemParameters.devices.filterwheels.model:Langtext("settings.devices.unidentified"));
		$("#DM_FilterWheels_Hole").html(SystemParameters.devices.filterwheels.holes!=undefined?SystemParameters.devices.filterwheels.holes.length:0);
		$(".DM_FilterWheels_List").html("");
		if(SystemParameters.devices.filterwheels.holes!=undefined){
			//console.log(SystemParameters.devices.filterwheels.holes);
			$(SystemParameters.devices.filterwheels.holes).each(function(i,e){
				var label = e.label;
				var color=e.color;color==""?c="#ABABAB":color;
				var d=$('<div class="DM_Filter" style="background-color:'+color+'">'+label+'</div>');
				$(".DM_FilterWheels_List").append(d);

				d=$('<div class="Radio_Button" checked filter="'+i+'" style="color:'+color+'">'+label+'</div>');
				$("#EXP_Filters").append(d);
				d.attr("checked",ExposureFilter==i);
				d.click(function(){
					//单击滤镜按钮的时候
					ExposureFilter=$(this).attr("filter");
					UpdateExposureDisplayData();
				});
			});
		}
	}else{
		$(".DM_FilterWheels").parent().addClass("Hide");
	}
	
	UpdateExposureDisplayData();//更新显示参数
	UpdateSettingFormInfo();	//更新窗口参数
	//console.log("设备更新完毕");
}

//重新设置赤道仪的本地数据到服务器
function _MountSet_ReSetLocal(longitude,latitude,time){
	if(longitude==undefined){
		longitude=$("#SS_Mount_Longitude").html().replace(" ","");
	}
	if(latitude==undefined){
		latitude=$("#SS_Mount_Latitude").html().replace(" ","");
	}
	longitude=longitude.toString();
	latitude=latitude.toString();
	console.log(longitude,latitude);
	longitude=longitude.replace("°"," ").replace("′"," ").replace("″","").replace("E","E ").replace("S","S ").replace("N","N ").replace("W","W ");
	latitude=latitude.replace("°"," ").replace("′"," ").replace("″","").replace("E","E ").replace("S","S ").replace("N","N ").replace("W","W ");
	__SetParameters_Mount(null,null,null,longitude,latitude,time);
}
//赤道仪设置窗口事件初始化
function MountSettingOperationFunction(){
	$("#SS_Mount_Port").click(function(){
		//单击端口按钮
	});
	//单击经度按钮
	$("#SS_Mount_Longitude").click(function(){
		if(!CanModifySettings()){return;}
		var value=$("#SS_Mount_Longitude").html();
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
				$("#SS_Mount_Longitude").html(data.prefix + " " +data.value.trim());
				//__SetParameters_Mount(null,null,null,data.value,null,null);		//更新赤道经度
				_MountSet_ReSetLocal();
				UpdateDevicesInfo();//更新所有信息
			}
		});
	});
	
	//单击纬度按钮
	$("#SS_Mount_Latitude").click(function(){
		if(!CanModifySettings()){return;}
		var value=$("#SS_Mount_Latitude").html();
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
				$("#SS_Mount_Latitude").html(data.prefix + " " +data.value.trim());
				//__SetParameters_Mount(null,null,null,null,data.value,null);		//更新赤道纬度
				_MountSet_ReSetLocal();
				UpdateDevicesInfo();//更新所有信息
			}
		});
	});
	
	
	$("#SS_Mount_Date").click(function(){
		//单击日期按钮
		if(!CanModifySettings()){return;}
		var value = $("#SS_Mount_Date").html().trim();
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
				$("#SS_Mount_Date").html(v);
				__SetParameters_Mount(null,null,null,null,null,v);		//更新赤道仪时间
				UpdateDevicesInfo();//更新所有信息
			}
		});
	});
	//与手机GPS同步
	$("#SyncGPS").click(function(){
		var d=GetLocalGPS();
		_MountSet_ReSetLocal(d.longitude,d.latitude,d.datetime);
		//__SetParameters_Mount(null,null,null,d.longitude,d.latitude,d.datatime);
		UpdateDevicesInfo(false);//更新所有信息
		MessageBox.Show({
			title:Langtext("settings.devices.alert.sync_title")
			,content:Langtext("settings.devices.alert.sync_msg")
		});
	});
}

//摄像头设置
function CameraSettingOperationFunction(){
	$("#SS_Camera_Port").click(function(){
		if(SystemParameters.status!="idle"){
			MessageBox.Show({
				//title:"不支持调焦"
				//,content:"导星镜不支持自动调焦！"
				title:Langtext("setting.devices.alert.settingerror")
				,content:Langtext("setting.devices.alert.device_used")
			});
			return;
		}
		//切换相机，首先查看自己在相机列表第几个，然后找出下一个，如果下一个超出列表，则选择第一个
		var port = $("#SS_Camera_Port").attr("pid");
		var at=0;
		
		$(SystemParameters.devices.camera.alternative).each(function(i,e){
			if(e.trim()==port.trim()){
				at=i+1;
				return;
			}
		});
		if(at>=SystemParameters.devices.camera.alternative.length){
			at=0;
		}
		__ChangeCamera("camera",SystemParameters.devices.camera.alternative[at]);
		UpdateDevicesInfo();
		//__GetInitializationSystemParameters();
	});
	
	$("#SS_Camera_Caliber").click(function(){
		if(!CanModifySettings()){return;}
		ShowNnumberCard({
			value:$("#SS_Camera_Caliber").html().replace("mm","")
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
				$("#SS_Camera_Caliber").html(caliber+"mm");
				__SetParameters_Camera(0,null,null,null,caliber,null);
				UpdateDevicesInfo();
				$("#SS_Camera_F").html(SystemParameters.devices.camera.f);
				
			}
		});
	});
	
	$("#SS_Camera_Focal").click(function(){
		if(!CanModifySettings()){return;}
		ShowNnumberCard({
			value:$("#SS_Camera_Focal").html().replace("mm","")
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
				$("#SS_Camera_Focal").html(focal+"mm");
				//计算焦比
				__SetParameters_Camera(0,null,null,null,null,focal);
				UpdateDevicesInfo();
				$("#SS_Camera_F").html(SystemParameters.devices.camera.f);
			}
		});
	});
	$("#SS_Camera_Gain").click(function(){
		if(!CanModifySettings()){return;}
		ShowNnumberCard({
			value:$("#SS_Camera_Gain").html()
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
				$("#SS_Camera_Gain").html(gain);
				__SetParameters_Camera(0,null,null,null,null,null,gain);
				UpdateDevicesInfo();
			}
		});
	});
	
	$("#SS_Camera_Offset").click(function(){
		if(!CanModifySettings()){return;}
		ShowNnumberCard({
			value:$("#SS_Camera_Offset").html()
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
				$("#SS_Camera_Offset").html(offset);
				__SetParameters_Camera(0,null,null,null,null,null,null,offset);
				UpdateDevicesInfo();
			}
		});
	});
	
	
	$("#SS_Camera_Cool").click(function(){
		if(!CanModifySettings()){return;}
		if($("#SS_Camera_Cool").attr("checked")){
			__OpenCool(0,parseFloat($("#SS_Camera_PTemp").html().replace("°C","")));
			UpdateDevicesInfo();
		}else{
			__CloseCool(0);
			UpdateDevicesInfo();
		}
	});
	
	$("#SS_Camera_PTemp").click(function(){
		if(!CanModifySettings()){return;}
		if(!$("#SS_Camera_Cool").attr("checked")) return;
		ShowNnumberCard({
			value:$("#SS_Camera_PTemp").html().replace("°C","")
			,check:function(data){
				var v = parseFloat(data.value);
				if(v<=0 && v>=-50){
					return true;
				}
				//Alert("请输入正确的制冷温度，制冷范围-50°C 到 0°C");
				MessageBox.Show({
					//title:"无法执行任务"
					title:Langtext("settings.devices.alert.settingerror")
					,flag:MessageBox.FLAG_INFORMATION
					//,content:"请输入正确的制冷温度，制冷范围-50°C 到 0°C"
					,content:Langtext("settings.devices.alert.temp_error")
				});
				return false;
			}
			,ok:function(data){
				if(!CanModifySettings()){return;}
				$("#SS_Camera_PTemp").html(data.value+"°C");
				__OpenCool(0,parseFloat(data.value));
				UpdateDevicesInfo();
			}
		});
	});
}

//导星摄像头设置
function GuiderCameraSettingOperationFunction(){
	
	$("#SS_GuiderCamera_Port").click(function(){
		//切换相机，首先查看自己在相机列表第几个，然后找出下一个，如果下一个超出列表，则选择第一个
		var port = $("#SS_GuiderCamera_Port").attr("pid");
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
		UpdateDevicesInfo();
		//__GetInitializationSystemParameters();
	});
	
	$("#SS_GuiderCamera_Caliber").click(function(){
		if(!CanModifySettings()){return;}
		ShowNnumberCard({
			value:$("#SS_GuiderCamera_Caliber").html().replace("mm","")
			,check:function(data){
				var v = parseInt(data.value);
				if(v>0 && v<100000){
					return true;
				}
				//Alert("请输入正确的导星镜口径！");
				MessageBox.Show({
					//title:"无法执行任务"
					title:Langtext("settings.devices.alert.settingerror")
					,flag:MessageBox.FLAG_INFORMATION
					//,content:"请输入正确的导星镜口径！"
					,content:Langtext("settings.devices.alert.caliber_error")
				});
				return false;
			}
			,ok:function(data){
				if(!CanModifySettings()){return;}
				var caliber = parseInt(data.value.replace("mm",""));
				$("#SS_GuiderCamera_Caliber").html(caliber+"mm");
				//计算焦比
				__SetParameters_Camera(1,null,null,null,caliber,null);
				UpdateDevicesInfo();
				$("#SS_GuiderCamera_F").html(SystemParameters.devices.camera_g.f);
			}
		});
	});
	
	$("#SS_GuiderCamera_Focal").click(function(){
		if(!CanModifySettings()){return;}
		ShowNnumberCard({
			value:$("#SS_GuiderCamera_Focal").html().replace("mm","")
			,check:function(data){
				var v = parseInt(data.value);
				if(v>0 && v<100000){
					return true;
				}
				//Alert("请输入正确的导星镜焦距！");
				MessageBox.Show({
					//title:"无法执行任务"
					title:Langtext("settings.devices.alert.settingerror")
					,flag:MessageBox.FLAG_INFORMATION
					//,content:"请输入正确的导星镜焦距！"
					,content:Langtext("settings.devices.alert.focal_error")
				});
				return false;
			}
			,ok:function(data){
				if(!CanModifySettings()){return;}
				var focal = parseInt(data.value.replace("mm",""));
				$("#SS_GuiderCamera_Focal").html(focal+"mm");
				__SetParameters_Camera(1,null,null,null,null,focal);
				UpdateDevicesInfo();
				$("#SS_GuiderCamera_F").html(SystemParameters.devices.camera_g.f);
			}
		});
	});
	
	$("#SS_GuiderCamera_Gain").click(function(){
		if(!CanModifySettings()){return;}
		ShowNnumberCard({
			value:$("#SS_GuiderCamera_Gain").html()
			,check:function(data){
				var v = parseInt(data.value);
				if(v>0 && v<=SystemParameters.devices.camera_g.gain_max){
					return true;
				}
				//Alert("请输入正确的Gain值，取值范围为0 - "+SystemParameters.devices.camera_g.gain_max);
				MessageBox.Show({
					//title:"无法执行任务"
					title:Langtext("settings.devices.alert.settingerror")
					,flag:MessageBox.FLAG_INFORMATION
					//,content:"请输入正确的Gain值，取值范围为0 - "+SystemParameters.devices.camera_g.gain_max
					,content:Langtext("settings.devices.alert.gain_error",SystemParameters.devices.camera_g.gain_max)
				});
				return false;
			}
			,ok:function(data){
				if(!CanModifySettings()){return;}
				var gain = parseInt(data.value);
				$("#SS_GuiderCamera_Gain").html(gain);
				__SetParameters_Camera(1,null,null,null,null,null,gain);
				UpdateDevicesInfo();
			}
		});
	});
	$("#SS_GuiderCamera_Offset").click(function(){
		if(!CanModifySettings()){return;}
		ShowNnumberCard({
			value:$("#SS_GuiderCamera_Offset").html()
			,check:function(data){
				var v = parseInt(data.value);
				if(v>0 && v<=SystemParameters.devices.camera_g.offset_max){
					return true;
				}
				//Alert("请输入正确的Offset值，取值范围为0 - "+SystemParameters.devices.camera_g.offset_max);
				MessageBox.Show({
					//title:"无法执行任务"
					title:Langtext("settings.devices.alert.settingerror")
					,flag:MessageBox.FLAG_INFORMATION
					//,content:"请输入正确的Offset值，取值范围为0 - "+SystemParameters.devices.camera_g.offset_max
					,content:Langtext("settings.devices.alert.offset_error",SystemParameters.devices.camera_g.offset_max)
				});
				return false;
			}
			,ok:function(data){
				if(!CanModifySettings()){return;}
				var offset = parseInt(data.value);
				$("#SS_GuiderCamera_Offset").html(offset);
				__SetParameters_Camera(1,null,null,null,null,null,null,offset);
				UpdateDevicesInfo();
			}
		});
	});
}

//滤镜轮设置
function FilterWheelsSettingOperationFunction(){
	/*
	$("#SS_FilterWheels_Hole").click(function(){
		ShowNnumberCard({
			value:$("#SS_FilterWheels_Hole").html()
			,ok:function(data){
				$("#SS_FilterWheels_Hole").html(data.value);
			}
		});
	});
	*/
}

//电调焦设置
function FocuserSettingOperationFunction(){
	$("#SS_Focuser_Position").click(function(){
		if(!CanModifySettings()){return;}
		ShowNnumberCard({
			value:$("#SS_Focuser_Position").html()
			,check:function(data){
				var v = parseInt(data.value);
				if(v>0 && v<=SystemParameters.devices.focuser.max){
					return true;
				}
				//Alert("请输入正确的焦点位置，范围为0 - " + SystemParameters.devices.focuser.max);
				MessageBox.Show({
					//title:"无法执行任务"
					title:Langtext("settings.devices.alert.settingerror")
					,flag:MessageBox.FLAG_INFORMATION
					//,content:"请输入正确的焦点位置，范围为0 - " + SystemParameters.devices.focuser.max
					,content:Langtext("settings.devices.alert.focuser_error",SystemParameters.devices.focuser.max)
				});
				return false;
			}
			,ok:function(data){
				if(!CanModifySettings()){return;}
				var v = parseInt(data.value);
				$("#SS_Focuser_Position").html(v);
				__SetParameters_Focuser(null,null,null,data.value,null);
				UpdateDevicesInfo();
			}
		});
	});
	
	$("#SS_Focuser_Max").click(function(){
		if(!CanModifySettings()){return;}
		ShowNnumberCard({
			value:$("#SS_Focuser_Max").html()
			,check:function(data){
				var v = parseInt(data.value);
				if(v>0){
					return true;
				}
				//Alert("焦点最大值必须是大于0的整数！");
				MessageBox.Show({
					//title:"无法执行任务"
					title:Langtext("settings.devices.alert.settingerror")
					,flag:MessageBox.FLAG_INFORMATION
					//,content:"焦点最大值必须是大于0的整数！"
					,content:Langtext("settings.devices.alert.focuser_max_error")
				});
				return false;
			}
			,ok:function(data){
				if(!CanModifySettings()){return;}
				var v = parseInt(data.value);
				$("#SS_Focuser_Max").html(v);
				__SetParameters_Focuser(null,null,null,null,data.value);
				UpdateDevicesInfo();
			}
		});
	});	
}

//设置窗口卡片点击
function SettingCardClick(){
	id = this.id;
	$(".SettingTabs").children().each(function(i,e){
		var d=$(e);
		d.addClass("Hide");
	});
	$("."+id).removeClass("Hide");
	$(".TabCards").find("div").each(function(i,e){
		var d=$(e);
		d.attr("selected",false);
		if(id==d.attr("id")){
			d.attr("selected",true);
		}
	});
	if(id=="DeviceManager"){
		//设备连接
		UpdateDevicesInfo();
	}
	if(id=="FileManager"){
		//文件管理
		_SeeDirID="";
		_FileListLastID="";
		InitTaskFileList();
		$(".ImageList").html("");
		SeeFiles(0,0);
	}
	if(id=="DsiplayManager"){
		//显示设置
		//查看显示状态，并设置
		$("#disp_status").attr("checked",$(".TopStatusBar").attr("display")=="true");
		$("#disp_guider").attr("checked",$(".GuiderFrame").attr("display")=="true");
		$("#disp_camera").attr("checked",$(".CameraParameters").attr("display")=="true");
		$("#disp_telescope").attr("checked",$(".MountParameters").attr("display")=="true");
		$("#disp_mount").attr("checked",$(".MountController").attr("display")=="true");
		$("#disp_exp").attr("checked",$(".RightControllerBar").attr("display")=="true");
		$("#disp_cali").attr("checked",$(".LeftControllerBar").attr("display")=="true");
	}
}


/********************************************设置部分代码********************************************/
//向设置窗口添加一个滤镜标签
function AddFilter2SettingForm(tag , color){
	var count = $(".SS_Filters_List").find(".SS_Filter").length;
	var d = $('<div class="SS_Filter" hole="'+count+'"><div class="SS_Filter_Number">H '+(count+1)+'</div><div class="SS_Filter_Tag" style="background-color:'+color+'">'+tag+'</div></div>');
	$(".SS_Filters_List").append(d);
	d.find(".SS_Filter_Tag").click(function(){
		//唤出窗口
		$(".SetFilterWheels_Color_Form").removeClass("Hide");
		$(".SetFilterWheels_Color_Form").css("position","absolute");
		$(".SetFilterWheels_Color_Form").css("top","0px");
		$(".SetFilterWheels_Color_Form").css("left","1240px");
		//设置颜色
		$(".SetFilterWheels_Color_Form").attr("hole",$(this).parent().attr("hole"));	//设置孔位
		var tc = $(this).css("background-color");
		var tt = $(this).html();
		$(".SetFilterWheels_Color_Form").find("#SS_Filter_Tag").val(tt);
		$(".SS_Filter_Colors").find(".SS_Filter_Color").each(function(i,e){
			$(e).attr("selected",false);
			if($(e).css("background-color")==tc){
				$(e).attr("selected",true);
				$("#SS_Filter_Tag").val(tt);
			}
		});
	});
}

//更新滤镜轮
function _UpdateHoles(){
	var holes=new Array();
	$(".SS_Filters_List").find(".SS_Filter_Tag").each(function(i,e){
		var hole = {label:$(e).html(),color:$(e).css("background-color")};
		holes.push(hole);
	});
	//console.log("_UpdateHoles",holes);
	__SetParameters_FilterWheels(null,null,null,holes);
}

//初始化滤镜轮可选颜色
function InitFilterColors(){
	//初始化输入窗事件
	$("#SS_Filter_Tag").change(function(){
		if(!CanModifySettings()){return;}
		var hole = $(".SetFilterWheels_Color_Form").attr("hole");
		if(hole!=undefined){
			//遍历滤镜
			var f=undefined;
			var s = $(".SS_Filter").each(function(i,e){
				if($(e).attr("hole")==hole){
					//找到后 ， 调用设置成功后  ， 设置这个标签
					f=$(e);
					//更新标签内容
				}
			});
			if(f!=undefined){
				//这里需要先讲过服务器确认在更新
				f.find(".SS_Filter_Tag").html($("#SS_Filter_Tag").val());
				SystemParameters.devices.filterwheels.holes[hole].label=$("#SS_Filter_Tag").val();
				//更新路径轮
				_UpdateHoles();
				UpdateDevicesInfo();
			}
		}
	});
	
	//colors=["#ABABAB","#f32a2a","#4c9d2f","#2684ed","#f5e200","#ee781e","#d70a30","#884798","#006ebc","#2cb6aa","#008445","#636955"];
	var colors=["#ababab","#fff100","#ee781e","#f32a2a","#e5006e","#884798","#255986","#2684ed","#2cb6aa","#008445","#4c9d2f","#abce24","#636955"];
	$(".SS_Filter_Colors").html("");
	for(i=0 ; i<colors.length ; i++){
		var d=$('<div class="SS_Filter_Color"></div>');
		d.css("background-color",colors[i]);
		$(".SS_Filter_Colors").append(d);
		d.click(function(){
			if(!CanModifySettings()){return;}
			//单击后查看是否有hole属性
			var hole = $(".SetFilterWheels_Color_Form").attr("hole");
			if(hole!=undefined){
				//遍历滤镜
				var f=undefined;
				var s = $(".SS_Filter").each(function(i,e){
					if($(e).attr("hole")==hole){
						//找到后 ， 调用设置成功后  ， 设置这个标签
						f=$(e);
					}
				});
				if(f!=undefined){
					//这里需要先讲过服务器确认在更新
					$(".SS_Filter_Color").attr("selected",false);
					$(this).attr("selected",true);
					f.find(".SS_Filter_Tag").css("background-color",$(this).css("background-color"));
					SystemParameters.devices.filterwheels.holes[hole].color=$(this).css("background-color");
					_UpdateHoles();
					UpdateDevicesInfo();
				}
			}
		});
	}
}

/**********************************************系统设置部分*************************************************/

//初始化实时取景，打开后设置
function InitLiveView(){
	//查询相机试试取景设置
	UpdateSystemInfo();
	if(SystemParameters.devices.camera!=undefined && SystemParameters.devices.camera.video==true){
		var ig = document.getElementById("ImageCollector_Video");
		ig.width=window.screen.width;
		ig.height=window.screen.height;
		OpenVideo("camera",ig);
	}else{
		
		//CloseVideo();//关闭实时取景
	}
}

//设置窗口内容初始化
function InitSettingContent(){
	var d_status = localStorage.getItem("system.display.status");
	var d_guider = localStorage.getItem("system.display.guider");
	var d_camera = localStorage.getItem("system.display.camera");
	var d_telescope = localStorage.getItem("system.display.telescope");
	var d_mount = localStorage.getItem("system.display.mount");
	var d_exposure = localStorage.getItem("system.display.exposure");
	var d_calibration = localStorage.getItem("system.display.calibration");
	$("#disp_status").attr("checked",true);
	$("#disp_guider").attr("checked",true);
	$("#disp_camera").attr("checked",true);
	$("#disp_telescope").attr("checked",true);
	$("#disp_mount").attr("checked",true);
	$("#disp_exp").attr("checked",true);
	$("#disp_cali").attr("checked",true);
	if(d_status=="false"){$("#disp_status").attr("checked",false);}
	if(d_guider=="false"){$("#disp_guider").attr("checked",false);}
	if(d_camera=="false"){$("#disp_camera").attr("checked",false);}
	if(d_telescope=="false"){$("#disp_telescope").attr("checked",false);}
	if(d_mount=="false"){$("#disp_mount").attr("checked",false);}
	if(d_exposure=="false"){$("#disp_exp").attr("checked",false);}
	if(d_calibration=="false"){$("#disp_cali").attr("checked",false);}
	_UpdateDisplaySetting();
}


function _UpdateDisplaySetting(){
	var c;
	c=$("#disp_status").attr("checked");$(".TopStatusBar").attr("display",c=="checked"||c==true);localStorage.setItem("system.display.status",c=="checked"||c==true);
	c=$("#disp_guider").attr("checked");$(".GuiderFrame").attr("display",c=="checked"||c==true);localStorage.setItem("system.display.guider",c=="checked"||c==true);
	c=$("#disp_camera").attr("checked");$(".CameraParameters").attr("display",c=="checked"||c==true);localStorage.setItem("system.display.camera",c=="checked"||c==true);
	c=$("#disp_telescope").attr("checked");$(".MountParameters").attr("display",c=="checked"||c==true);localStorage.setItem("system.display.telescope",c=="checked"||c==true);
	c=$("#disp_mount").attr("checked");$(".MountController").attr("display",c=="checked"||c==true);localStorage.setItem("system.display.mount",c=="checked"||c==true);
	c=$("#disp_exp").attr("checked");$(".RightControllerBar").attr("display",c=="checked"||c==true);$("#ExposureSettingForm").attr("display",c=="checked"||c==true);localStorage.setItem("system.display.exposure",c=="checked"||c==true);
	c=$("#disp_cali").attr("checked");$(".LeftControllerBar").attr("display",c=="checked"||c==true);localStorage.setItem("system.display.calibration",c=="checked"||c==true);
}
//显示与关闭显示窗口设置
function DisplaySettingOperationFunction(){
	
	/*
	$("#disp_status").click(function(){
		
	});
	
	$("#disp_guider").click(function(){
		var c=$("#disp_guider").attr("checked");
		$(".GuiderFrame").attr("display",c=="checked"||c==true);
	});
	
	$("#disp_camera").click(function(){
		var c=$("#disp_camera").attr("checked");
		$(".CameraParameters").attr("display",c=="checked"||c==true);
	});
	
	$("#disp_telescope").click(function(){
		var c=$("#disp_telescope").attr("checked");
		$(".MountParameters").attr("display",c=="checked"||c==true);
	});
	
	$("#disp_mount").click(function(){
		var c=$("#disp_mount").attr("checked");
		$(".MountController").attr("display",c=="checked"||c==true);
	});
	
	$("#disp_exp").click(function(){
		var c=$("#disp_exp").attr("checked");
		$(".RightControllerBar").attr("display",c=="checked"||c==true);
		$("#ExposureSettingForm").attr("display",c=="checked"||c==true);
	});
	
	$("#disp_cali").click(function(){
		var c=$("#disp_cali").attr("checked");
		$(".LeftControllerBar").attr("display",c=="checked"||c==true);
	});
	*/
}


//更新系统设置参数
function UpdateSystemInfo(){
	var _v = false;
	var _vt=0;
	if(SystemParameters.devices.camera!=null){
		_v=SystemParameters.devices.camera.video;
		_vt=SystemParameters.devices.camera.video_time;
	}
	$("#RuntimeVideo").attr("checked",_v);
	var set=false;
	$("#RuntimeVideo_Times").find(".Radio_Button").each(function(i,e){
		$(e).attr("checked",false);
		if(parseFloat($(e).attr("value"))==_vt){
			$(e).attr("checked",true);
			set=true;
		}
	});
	if(!set){
		//不在设置范围内
		$("#UD_Video_Time").html(_vt +" S");
		$(".UDT0").attr("checked",true);
	}
	
	//设置调焦界面
	var f_time=0;
	set=false;
	if($(".Focuser_Camera").attr("type")=="0"){
		//主相机
		f_time=SystemParameters.devices.camera!=undefined?SystemParameters.devices.camera.video_time:0;
	}else{
		//导星相机
		f_time=SystemParameters.devices.camera_g!=undefined?SystemParameters.devices.camera_g.video_time:0;
	}
	/*
	$(".Focuser_Exposures_Group").find(".Radio_Button").each(function(i,e){
		$(e).attr("checked",false);
		if(parseFloat($(e).attr("value"))==f_time){
			$(e).attr("checked",true);
			set=true;
		}
	});
	*/
	if(!set){
		//不在设置范围内
		$("#AUD_Video_Time").html(f_time +" S");
		$(".AUDT0").attr("checked",true);
	}
}

//系统设置窗口
function SystemSettingOperationFunction(){
	//显示与关闭显示设置
	$(".DisplayItem").find(".DispalySwitch").click(function(){_UpdateDisplaySetting();});
	
	//打开或关闭试试曝光按钮
	$("#RuntimeVideo").click(function(){
		//console.log("SystemParameters.devices.camera.video=",SystemParameters.devices.camera.video);
		if($(this).attr("checked")==true || $(this).attr("checked")=="checked"){
			//打开
			__SetCameraVideoTime("camera",true,SystemParameters.devices.camera.video_time)
			SystemParameters.devices.camera.video=true;
			var ig = document.getElementById("ImageCollector_Video");
			ig.width=window.screen.width;
			ig.height=window.screen.height;
			OpenVideo("camera",ig);
		}else{
			__SetCameraVideoTime("camera",false,SystemParameters.devices.camera.video_time)
			SystemParameters.devices.camera.video=false;
			CloseVideo();
		}
		UpdateSystemInfo();
	});
	
	//自定义时间
	$("#UD_Video_Time").click(function(){
		ShowNnumberCard({
			value:$("#UD_Video_Time").html().replace("S","").replace(" ","")
			,check:function(data){
				return true;
			}
			,ok:function(data){
				var v = parseFloat(data.value);
				$("#UD_Video_Time").html(v+" S");
				//UpdateDevicesInfo();
				$("#RuntimeVideo_Times").find(".Radio_Button").each(function(i,e){
					$(e).attr("checked",false);
				});
				$(".UDT0").attr("checked",true);
				//更新时间
				__SetCameraVideoTime("camera",SystemParameters.devices.camera.video,v)
				SystemParameters.devices.camera.video_time=v;
			}
		});
	});
	
	//设置主相机时间按钮
	$("#RuntimeVideo_Times").find(".Radio_Button").click(function(){
		var time = parseFloat($(this).attr("value"));
		//__SetCameraVideoTime("camera" , time);
		
		if(time==0){
			time =parseFloat($("#UD_Video_Time").html().replace("S","").replace(" ",""));
		}
		console.log("设置时间-- " + time);
		__SetCameraVideoTime("camera",SystemParameters.devices.camera.video,time)
		SystemParameters.devices.camera.video_time=time;
		UpdateSystemInfo();
	});
	
	//密码修改
	$(".EditSystemPassword").click(function(){
		var pwd = $("#System_Password").val();
		if(pwd.length>=8){
			//修改密码
			if(__ChangePassword(pwd)){
				MessageBox.Show({
					title:Langtext("settings.system.alert.change_pwd_title"),
					content:Langtext("settings.system.alert.change_pwd_content_complete")
				});
			}else{
				MessageBox.Show({
					title:Langtext("settings.system.alert.change_pwd_title"),
					content:Langtext("settings.system.alert.change_pwd_content_error")
				});
			}
		}else{
			MessageBox.Show({
				title:Langtext("settings.system.alert.change_pwd_title"),
				content:Langtext("settings.system.alert.change_pwd_content_error")
			});
		}
		
	});
	//名称修改
	$(".EditSystemDevicename").click(function(){
		var name = $("#System_Devicename").val();
		var p = /^[a-zA-Z0-9_-]{4,16}$/;
		if(name.length>=6 && name.length<=16 && p.test(name)){
			if(__ChangeDeviceName(name)){
				MessageBox.Show({
					title:Langtext("settings.system.alert.change_name_title"),
					content:Langtext("settings.system.alert.change_name_content_complete")
				});
			}else{
				MessageBox.Show({
					title:Langtext("settings.system.alert.change_name_title"),
					content:Langtext("settings.system.alert.change_name_content_error")
				});
			}
		}else{
			MessageBox.Show({
				title:Langtext("settings.system.alert.change_name_title"),
				content:Langtext("settings.system.alert.change_name_content_error")
			});
		}
	});
	//修改WIFI密码
	$(".EditWifiPassword").click(function(){
		var pwd = $("#System_Wifi_Password").val();
		if(pwd.length>=8 && pwd.length<=16){
			//修改密码
			if(__ChangeWifiPassword(pwd)){
				MessageBox.Show({
					title:Langtext("settings.system.alert.change_pwd_title"),
					content:Langtext("settings.system.alert.change_wifipwd_content_complete")
					,callback:function(res){
						//退回首页
						//GoHome();
					}
				});
			}else{
				MessageBox.Show({
					title:Langtext("settings.system.alert.change_pwd_title"),
					content:Langtext("settings.system.alert.change_pwd_content_error")
				});
			}
		}else{
			MessageBox.Show({
				title:Langtext("settings.system.alert.change_pwd_title"),
				content:Langtext("settings.system.alert.change_pwd_content_error")
			});
		}
	});
	//清空导星校准数据
	$(".ClearGuiderData").click(function(){
		MessageBox.Show({
			title:Langtext("settings.system.alert.clear_guider_title"),
			content:Langtext("settings.system.alert.clear_guider_content"),
			buttons:MessageBox.BUTTONS_YES_NO,
			callback:function(res){
				if(res.result==MessageBox.BUTTON_YES){
					//清空
					__ClearGuiderCData();
					MessageBox.Show({
						title:Langtext("settings.system.alert.clear_guider_title"),
						content:Langtext("settings.system.alert.clear_guider_complete")
					});
				}
			}
		});
	});
	
	$(".SetMountHome").click(function(){
		_SetMountHome();
		MessageBox.Show({
			title:Langtext("settings.system.alert.set_complete_title"),
			content:Langtext("settings.system.alert.set_home_content")
		});
	});
	$(".GoMountHome").click(function(){
		_MountGoHome();
	});
	
	$(".ShutdonwButton").click(function(){
		MessageBox.Show({
			title:Langtext("settings.system.alert.shutdown_title"),
			content:Langtext("settings.system.alert.shutdown_content"),
			buttons:MessageBox.BUTTONS_YES_NO,
			callback:function(res){
				if(res.result==MessageBox.BUTTON_YES){
					Stan_Shutdown();
				}
			}
		});
	});
	
	$(".RebootButton").click(function(){
		MessageBox.Show({
			title:Langtext("settings.system.alert.reboot_title"),
			content:Langtext("settings.system.alert.reboot_content"),
			buttons:MessageBox.BUTTONS_YES_NO,
			callback:function(res){
				if(res.result==MessageBox.BUTTON_YES){
					Stan_Reboot();
				}
			}
		});
	});
}

function Stan_Shutdown(){
	__Shutdown();
	DeviceClose();
}

function Stan_Reboot(){
	__Reboot();
	DeviceClose();
}


/**********************************************文件管理部分*************************************************/
var _FileListLastID="";
var _SeeDirID="";
//初始化文件列表，在点击进入页面的时候调用
function InitTaskFileList(){
	var dirs = __GetDirectory();
	//非任务拍摄
	var d=$('<div class="File_TaskItem" tid="0" selected>'+Langtext("settings.file.nontask_files")+'</div>');
	d.click(function(){
		_FileListLastID="";
		_SeeDirID="";
		$(".File_TaskList").find(".File_TaskItem").each(function(f,p){
			$(p).attr("selected",false);
		});
		$(this).attr("selected",true);
		
		$(".ImageList").html("");
		SeeFiles();
	});
	$(".File_TaskList").html(d);
	
	//任务列表
	$(".File_TaskList").append("");
	$(dirs.directorys).each(function(i,e){
		var d = $('<div class="File_TaskItem">'+e.name+'<div class="File_TaskItem_Del"></div></div>');
		d.attr("tid",e.id);
		$(".File_TaskList").append(d);
		d.find(".File_TaskItem_Del").click(function(e){
			e.stopPropagation();
			//删除目录
			var tid=$(this).parent().attr("tid");
			MessageBox.Show({
				//title:"删除确认"
				title:Langtext("settings.file.alert.del_title")
				//,content:"确定要删除该文件夹吗？\n这将是不可恢复的操作！"
				,content:Langtext("settings.file.alert.del_dir_msg")
				,flag:MessageBox.FLAG_QUERY
				,datas:{tid:tid,t:$(this)}
				,buttons:MessageBox.BUTTONS_YES_NO
				,callback:function(res){
					if(res.result==MessageBox.BUTTON_YES){
					   __RemoveDirectory(res.datas.tid);
						res.datas.t.parent().remove();
						if(tid==_SeeDirID){
							//如果是当前预览的
							_FileListLastID="";
							_SeeDirID="";
							$(".ImageList").html("");
						}
					}
				}
			});
		});
		d.click(function(){
			_FileListLastID="";
			_SeeDirID=$(this).attr("tid");
			$(".File_TaskList").find(".File_TaskItem").each(function(f,p){
				$(p).attr("selected",false);
			});
			$(this).attr("selected",true);
			
			$(".ImageList").html("");
			SeeFiles();
		});
	});
	
	//列表滚动
	$(".ImageList").scroll(function(){
		var hei = $(this).find(".ImageItem").length/3*320;
		hei += $(this).find(".ImageItem").length%3!=0?320:0;	//是否多出一行
		//console.log(hei,$(this).scrollTop(),hei-$(this).scrollTop() , $(this).height());
		//console.log(hei-$(this).scrollTop() , $(this).height());
		if (hei-$(this).scrollTop() <= $(this).height()+100) {
			//console.log("加载");
            SeeFiles();
        }
	});
	
}

//获得最后的序列ID
function GetFileListLastID(){
	var p = $(".ImageList").find(".ImageItem").last();
	if(p==undefined){
		return "";
	}else{
		return p.attr("fid");
	}
}
//根据编号查看文件列表,每次显示30张
var _SeeFile_Seeing=false;
function SeeFiles(){
	if(_SeeFile_Seeing){return;}
	_SeeFile_Seeing=true;
	_FileListLastID=GetFileListLastID();
	fs = __GetFiles(_SeeDirID,_FileListLastID,30);
	$(fs.files).each(function(i,e){
		var d=$('<div class="ImageItem"><div class="ImageRemove"></div></div>');
		//console.log(HOST+e.thumbnail);
		d.css("background-image","url("+HOST+e.thumbnail+")");
		d.attr("fid",e.id);
		_FileListLastID=e.id;
		d.find(".ImageRemove").click(function(e){
			e.stopPropagation();
			//删除文件
			var fid=$(this).parent().attr("fid");
			MessageBox.Show({
				//title:"删除确认"
				title:Langtext("settings.file.alert.del_title")
				//,content:"确定要删除该文件吗？\n这将是不可恢复的操作！"
				,content:Langtext("settings.file.alert.del_file_msg")
				,flag:MessageBox.FLAG_QUERY
				,datas:{fid:fid,t:$(this)}
				,buttons:MessageBox.BUTTONS_YES_NO
				,callback:function(res){
					if(res.result==MessageBox.BUTTON_YES){
						res.datas.t.parent().remove();
						__RemoveFiles(_SeeDirID,[res.datas.fid]);
					}
				}
			});
		});
		d.click(function(){
			var dir = _SeeDirID;
			dir=(dir=="exposure")?"":dir;
			file=__GetImage(dir,$(this).attr("fid"));
			Preview(file);
		});
		$(".ImageList").append(d);
	});
	_SeeFile_Seeing=false;
}