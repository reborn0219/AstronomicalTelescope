// 任务相关
var _TaskLine=0;	//任务刷新线程

//启动任务刷新线程
function _StartTaskLine(){
	_StopTaskLine();
	_TaskFunction();//先刷新一次任务
	_TaskLine = setInterval(_TaskFunction,1000);
}

//停止任务刷新线程
function _StopTaskLine(){
	clearInterval(_TaskLine);
	var C = $(".ExposureButton");
	C.clearCanvas();
	C.drawArc({
		fillStyle:"rgba(255,255,255,.3)"
		,x:60,y:60
		,radius:60
	});	
	C.drawArc({
		fillStyle:Color_White
		,x:60,y:60
		,radius:45
	});	
}

function UpdateTaskStatus(_r){
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
	var task=requstData;
	SystemParameters.task=task;
	$("#task_over_GoHome").attr("checked",task.over.gohome);
	$("#task_over_Shutdown").attr("checked",task.over.shutdown);
	$(".Task_Target").find("span").html(task.tasklist[0].shotposition.shotoname);
	$(".Task_Target").attr("ra",task.tasklist[0].shotposition.ra);
	$(".Task_Target").attr("dec",task.tasklist[0].shotposition.dec);
	
	var C = $(".ExposureButton");
	C.clearCanvas();
	C.drawArc({
		fillStyle:"rgba(255,255,255,.3)"
		,x:60,y:60
		,radius:60
	});	
	C.drawArc({
		fillStyle:Color_White
		,x:60,y:60
		,radius:45
	});	
	var ts = task.status; 
	if(task!=undefined ){
		if(task.tasklist[0]!=undefined && task.tasklist[0].msg!=undefined){
			//$(".Task_Message").html("执行 : " + task.msg);
			$(".Task_Message").html(Langtext("task.labels.exec",task.tasklist[0].msg));
		}
		if(ts == "complete" ||
		   ts == "idle" ||
		   ts == "closeing" ||
		   ts == "stop"){
			//任务执行结束
			StopTask();//停止执行任务
		}else if(ts == "error"){
			//任务执行错误
			MessageBox.Show({
				//title:"任务执行错误"
				//,content:"任务执行错误，错误原因：" + task.msg
				title:Langtext("task.alert.error_title")
				,content:Langtext("task.alert.error_msg" , task.msg)
				,flag:MessageBox.FLAG_ERROR
			});
			StopTask();//停止执行任务
		}else{
			//任务正在执行，刷新状态
			$(task.tasklist[0].eventlist).each(function(i,e){
				var d = $(".TaslRight_ItemList").find(".Task_Event").eq(i);
				var pc = d.find(".Task_Event_Progress");
				if(pc!=undefined){
					if(task.tasklist[0].eventlist[i].complete>=0){
						pc.css("width",(task.tasklist[0].eventlist[i].complete/task.tasklist[0].eventlist[i].num*100)+"%");
					}else{
						pc.css("width","0%");
					}
				}
			});
			
			//画按钮
			
			C.drawArc({
				fillStyle:Color_White
				,x:60,y:60
				,radius:45
			});	
			if(this.ExposureTime>0){
				var endp = 360 * (task.complete/task.num);
				C.drawArc({
					strokeStyle:Color_Blue
					,strokeWidth:6
					,x:60,y:60
					,radius:52
					,start:0 , end:endp
				});

				var lst = "";
				//输出剩余百分比
				//lst = (task.complete/task.num*100).toFixed(1) +"%";
				lst = parseInt(task.complete/task.num*100) +"%";
				C.drawText({
					strokeStyle:Color_Black
					,fillStyle:Color_Black
					,fontSize:20
					,x:60,y:60
					,text:lst
				});
			}
		}
	}
	
}
//任务刷新线程
function _TaskFunction(){
	//*20190521异步修改*/
	__A__GetTask(UpdateTaskStatus);
}

//添加一个新的事件
function addEvent(event){
	var d=$("<div class='Task_Event'></div>");d.attr("enabled",true);
	var s;
	$(".Task_AddBtn").before(d);
	//ID
	s=$("<div class='fdiv Event_Item'></div>");d.append(s);s.html($(".TaslRight_ItemList").find(".Task_Event").length);
	//场
	s=$("<div class='fdiv Event_Item'></div>");
	var _tv =event!=undefined?event.type:0;
	d.append(s);s.html(ExposureTypes[_tv]);s.attr("value",_tv);
		s.click(function(){
			var s=$(this);
			if(s.parent().attr("enabled")=="true"){
				var v = parseInt(s.attr("value"));
				v+=1;v=v>=ExposureType.length?0:v;
				s.attr("value",v);
				s.html(ExposureTypes[v]);
				var dt=$(this).parent().find("div").eq(3);
				if(v==3){
					dt.html("0S");
				}else{
					dt.html(dt.attr("value"));
				}
				UpdateTaskEstimateData();//重新计算大小bias时间为0
			}
		});
	//滤镜
	_tv =event!=undefined?event.filterwhell:0;
	
	//console.log("SystemParameters.devices",SystemParameters.devices);
	if(SystemParameters.devices!=undefined && SystemParameters.devices.filterwheels!=undefined && SystemParameters.devices.filterwheels.holes!=undefined && SystemParameters.devices.filterwheels.holes.length>0){
		if(_tv<0 || _tv>=SystemParameters.devices.filterwheels.holes.length){_tv=0;}//滤镜轮编号容错
		s=$("<div class='fdiv Event_Item'></div>");d.append(s);s.html(SystemParameters.devices.filterwheels.holes[_tv].label);s.attr("value",_tv);s.css("color",SystemParameters.devices.filterwheels.holes[_tv].color);
			s.click(function(){
				var s=$(this);
				if(s.parent().attr("enabled")=="true"){
					var v = parseInt(s.attr("value"));
					v+=1;v=v>=SystemParameters.devices.filterwheels.holes.length?0:v;
					s.attr("value",v);
					s.html(SystemParameters.devices.filterwheels.holes[v].label);
					s.css("color",SystemParameters.devices.filterwheels.holes[v].color);
				}
			});
	}else{
		//不存在滤镜轮
		s=$("<div class='fdiv Event_Item' value='-1'>--</div>");d.append(s);
	}
	//时间
	_tv =event!=undefined?event.exposuretime:5;
	//s=$("<div class='fdiv Event_Item'><input type='text' value='"+_tv+"S'></div>");d.append(s);
	s=$("<div class='fdiv Event_Item' value='"+_tv+"S'>"+_tv+"S</div>");d.append(s);
		s.click(function(){
			if($(this).parent().find("div").eq(1).attr("value")==3){return;}
			var s=$(this);
			if(s.parent().attr("enabled")=="true")
			{
				var v = $(this).attr("value").replace("S","");
				ShowNnumberCard({
					value:v
					,custom:{me:$(this)}
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
						data.custom.me.attr("value",v+"S");
						data.custom.me.html(v+"S");
						UpdateTaskEstimateData();
					}
				});
			}
		});
	//bin
	_tv =event!=undefined?event.bin:0;
	s=$("<div class='fdiv Event_Item'> </div>");d.append(s);
	if(SystemParameters.devices.camera!=undefined){
		s.html(SystemParameters.devices.camera.bins[_tv] + "×" + SystemParameters.devices.camera.bins[_tv]);s.attr("value",_tv);
		s.click(function(){
			var s=$(this);
			if(s.parent().attr("enabled")=="true"){
				var v = parseInt(s.attr("value"));
				v+=1;v=v>=SystemParameters.devices.camera.bins.length?0:v;
				s.attr("value",v);
				s.html(SystemParameters.devices.camera.bins[v] + "×" + SystemParameters.devices.camera.bins[v]);
				UpdateTaskEstimateData();//重新计算大小
			}
		});
	}
	//数量
	_tv =event!=undefined?event.num:10;
	s=$("<div class='fdiv Event_Item' value='"+_tv+"'>"+_tv+"</div>");d.append(s);
		s.click(function(){
			var s=$(this);
			if(s.parent().attr("enabled")=="true")
			{
				var v = $(this).attr("value");
				ShowNnumberCard({
					value:v
					,custom:{me:$(this)}
					,check:function(data){
						var v=data.value;
						if(v<=0 && v>100){
							MessageBox.Show({
								title:Langtext("task.alert.setting_error_title")
								,flag:MessageBox.FLAG_INFORMATION
								,content:Langtext("task.alert.size_error_content")
							});
							return false;
						}
						return true;
					}
					,ok:function(data){
						var v = parseInt(data.value);
						data.custom.me.attr("value",v);
						data.custom.me.html(v);
						UpdateTaskEstimateData();
					}
				});
			}
		});
	//操作
	s=$("<div class='LastDiv Event_Item'><label class='DeleteTesk'>×</label></div>");d.append(s);
		s.find("label").click(function(){
			//删除
			if($(this).parent().parent().attr("enabled")=="true"){	
				MessageBox.Show({
					//title:"删除确认"
					//,content:"确定要删除该事件吗？"
					title:Langtext("task.alert.del_title")
					,content:Langtext("task.alert.delevent_msg")
					,flag:MessageBox.FLAG_QUERY
					,buttons:MessageBox.BUTTONS_YES_NO
					,datas:{t:$(this)}
					,callback:function(res){
						if(res.result==MessageBox.BUTTON_YES){
							res.datas.t.parent().parent().remove();
							Task_Resort();
							UpdateTaskEstimateData();//重新计算大小
						}
					}
				});
			}
		});
	UpdateTaskEstimateData();//重新计算大小
	//滚动到最底部
	var scrollHeight = $('.TaskBox').prop("scrollHeight");
  	$('.TaskBox').animate({scrollTop:scrollHeight}, 0);	//动画效果
}

//重新排序
function Task_Resort(){
	$(".TaslRight_ItemList").find(".Task_Event").each(function(i,e){
		$(e).find("div").eq(0).html(i+1);
	});
}

//计算预计拍摄时长及数量
function UpdateTaskEstimateData(){
	/*数量、时间、大小*/
	var time = 0;	//毫秒数
	var count = 0;	//总张数
	var size = 0;	//总大小
	
	
	$(".TaslRight_ItemList").find(".Task_Event").each(function(i,e){
		var d=$(e);
		var _type=0;
		var _time=0;
		var _bin=0;
		var _count=0;
		d.find(".Event_Item").each(function(f,p){
			var _d=$(p);
			switch(f){
				case 1:	//场，偏置帧不用计算时间
					_type=parseInt(_d.attr("value"));
					break;
				case 3:	//曝光时间，偏置帧不用计算时间
					_time = parseFloat(_d.attr("value").replace("S",""));
					break;
				case 4:	//Bin值，下载时间不同，文件大小不同
					_bin=parseInt(_d.attr("value"));
					break;
				case 5:	//拍摄数量
					_count=parseInt(_d.attr("value"));
					break;	
			}
		});
		//console.log(_type,_time,_bin,_count);
		count+=_count;
		if(SystemParameters.devices.camera!=undefined && SystemParameters.devices.camera.filesize!=undefined){
			size+=SystemParameters.devices.camera.filesize[_bin]*_count;
		}
		if(_type!=3){//不是偏置
			time+=_time*1000*_count;
		}
	});
	//写入页面
	var txt = $(".TaslLeft_ItemList").find(".TaskLeft_Display");
	var v_time = parseInt((time/1000)/3600)+":"+parseInt((time/1000)/60%60)+":"+parseInt((time/1000)%60);
	var v_size = "M";
	if(size<1024){
		v_size=size+"k";
	}else if(size<1024*1024){
		v_size=(size/1024).toFixed(2)+"M";
	}else{
		v_size=(size/1024/1024).toFixed(2)+"G";
	}
	/*
	$(txt[0]).html("预估时长: " + v_time);
	$(txt[2]).html("预估大小: " + v_size);
	$(txt[3]).html("拍摄数量: " + count+"张");
	*/
	$(txt[0]).html(Langtext("task.labels.es_time",v_time));
	$(txt[2]).html(Langtext("task.labels.es_size",v_size));
	$(txt[3]).html(Langtext("task.labels.es_count",count));
}

//停止任务
function StopTask(){
	__StopTask();
	_ToStopTaskStatus();
	_StopTaskLine();
	$(".Task_Message").html("");
}

//启动任务
function StartTask(){
	//按照老版本任务进行设置
	if(SystemParameters.status!="idle"){
		//设备处于忙碌中，不允许开始任务
		MessageBox.Show({
			title:Langtext("task.alert.unable_title")
			,content:Langtext("task.alert.unable_busyness")
		});
		return;
	}
	if(SystemParameters.devices.camera==undefined){
		//主相机不存在错误
		MessageBox.Show({
			title:Langtext("task.alert.unable_title")
			,content:Langtext("task.alert.camera_does_not_exist")
		});
		return;
	}
	/*
	task = {
		autofocuse:{
			changefw:$("#task_changeFW_F").attr("checked")=="checked"				//切换滤镜后对焦
			,eventbegin:$("#task_eventStart_F").attr("checked")=="checked"			//事件开始前自动对焦
			,intervaltime:$("#task_time_F").attr("checked")=="checked"?$("#task_time_F_T").val():0			//间隔X秒后自动对焦，0表示不自动对焦
		}
		,autoguider:$("#task_autoGuider").attr("checked")=="checked"						//自动打开导星
		,autocalibration:{
			intervaltime:$("#task_time_C").attr("checked")=="checked"?$("#task_time_C_T").val():0		//间隔X秒后自动校准赤道仪，0表示不校准
			,eventbegin:$("#task_eventBegin_C").attr("checked")=="checked"		//事件开始前自动校准赤道仪
		}
		,over:{
			gohome:$("#task_over_GoHome").attr("checked")=="checked"						//执行结束后赤道仪归位
			,shutdown:$("#task_over_Shutdown").attr("checked")=="checked"				//执行结束后关机
		}
		,tasklist:[{
			taskname:$(".Task_Target").find("span").html()
			,shotposition:{
				shotoname:$(".Task_Target").find("span").html()
				,ra:$(".Task_Target").attr("ra")
				,dec:$(".Task_Target").attr("dec")
			}
		}]
	};
	*/
	task = {
		autofocuse:{
			changefw:false			//切换滤镜后对焦
			,eventbegin:false		//事件开始前自动对焦
			,intervaltime:0			//间隔X秒后自动对焦，0表示不自动对焦
		}
		,autoguider:true			//自动打开导星
		,autocalibration:{
			intervaltime:0			//间隔X秒后自动校准赤道仪，0表示不校准
			,eventbegin:false		//事件开始前自动校准赤道仪
		}
		,over:{
			gohome:$("#task_over_GoHome").attr("checked")=="checked"						//执行结束后赤道仪归位
			,shutdown:$("#task_over_Shutdown").attr("checked")=="checked"				//执行结束后关机
		}
		,tasklist:[{
			taskname:$(".Task_Target").find("span").html()
			,shotposition:{
				shotoname:$(".Task_Target").find("span").html()
				,ra:$(".Task_Target").attr("ra")
				,dec:$(".Task_Target").attr("dec")
			}
		}]
	};
	//设备查询return
	if((task.autofocuse.changefw || task.autofocuse.eventbegin || task.autofocuse.intervaltime>0) && SystemParameters.devices.focuser==undefined){
		//使用了调焦器，但是调焦器不在线
		MessageBox.Show({
			title:Langtext("task.alert.unable_title")
			,content:Langtext("task.alert.focuser_does_not_exist")
		});
		return;
	}
	/*
	//本版本不更新，下一版本开放
	if(task.autoguider && (SystemParameters.devices.camera_g==undefined || SystemParameters.devices.mount==undefined)){
		//需要自动开启导星，但赤道仪或导星相机不存在
		MessageBox.Show({
			title:Langtext("task.alert.unable_title")
			,content:Langtext("task.alert.guider_does_not_exist")
		});
		return;
	}
	*/
	if(task.autofocuse.changefw && SystemParameters.devices.filterwheels==undefined){
		//滤镜轮不在线
		MessageBox.Show({
			title:Langtext("task.alert.unable_title")
			,content:Langtext("task.alert.filterwheels_does_not_exist")
		});
		return;
	}
	
	//判断任务执行
	if(task.tasklist[0].shotposition.ra!=undefined && task.tasklist[0].shotposition.ra.length>0){
		//说明已经选定目标
		da = __GetDataByTargetName($(".Task_Target").find("span").html());
		if(da.altitude>0){
			//组织任务
			var eventlist = new Array();
			var dp=false;//平场和暗场确认
			$(".TaslRight_ItemList").find(".Task_Event").each(function(i,e){
				var d=$(e);
				var f = d.find(".Event_Item");
				event={
					type:parseInt($(f[1]).attr("value"))
					,filterwhell:parseInt($(f[2]).attr("value"))
					,exposuretime:parseFloat($(f[3]).attr("value").replace("S",""))
					,bin:parseInt($(f[4]).attr("value"))
					,num:parseInt($(f[5]).attr("value"))
				};
				if(event.type==1 || event.type==2 || event.type==4){
					dp=true;
				}
				//task.tasklist[0].eventlist.add(event);
				eventlist.push(event);
			});
			task.tasklist[0].eventlist=eventlist;
			if(dp){
				//暗场镜头盖提示
				MessageBox.Show({
					title:Langtext("task.alert.other_devices_does_not_title")
					,content:Langtext("task.alert.other_devices_does_not_exist")
					,flag:MessageBox.FLAG_WARNING
				});
			}
			result = __StartTask(task);//执行任务
			if(result._result==1){
				//任务执行成功
				console.log("开始执行任务");
				SystemParameters.status=="task";//暂时修改状态，一秒钟总状态还会刷新
				_ToStartTaskStatus();
				_StartTaskLine();
				//是否需要打开导星
				if(task.autoguider){
					__InitGoGuider();
				}
			}else{
				//开始执行任务时的失败
				MessageBox.Show({
					title:Langtext("task.alert.unable_title")
					,content:Langtext("task.alert.unable_msg",result._data)
					,flag:MessageBox.FLAG_WARNING

				});
			}
			
		}else{
			//拍摄目标在地平线以下错误
			MessageBox.Show({
				title:Langtext("task.alert.unable_title")
				,content:Langtext("task.alert.unable_unhorizon")
				,flag:MessageBox.FLAG_WARNING
			});
		}
	}else{
		//没有选择拍摄目标错误
		MessageBox.Show({
			title:Langtext("task.alert.unable_title")
			,content:Langtext("task.alert.unable_notarget")
			,flag:MessageBox.FLAG_WARNING
		});
	}
	
}

//到运行中状态
function _ToStartTaskStatus(){
	//设置开始按钮为隐藏，设置所有的删除按钮为进度条，设置所有的按钮不可用
	$(".Task_AddBtn").addClass("Hide");
	$(".TaskButton_Start").addClass("Hide");
	$(".TaskButton_Stop").removeClass("Hide");
	/*
	//本版本不更新，下一版本开放
	$("#task_changeFW_F").attr("enabled",false);
	$("#task_eventStart_F").attr("enabled",false);
	$("#task_time_F").attr("enabled",false);
	$("#task_time_F_T").attr("enabled",false);
	$("#task_autoGuider").attr("enabled",false);
	$("#task_time_C").attr("enabled",false);
	$("#task_time_C_T").attr("enabled",false);
	$("#task_eventBegin_C").attr("enabled",false);
	*/
	$("#task_over_GoHome").attr("enabled",false);
	$("#task_over_Shutdown").attr("enabled",false);
	$(".Task_Target").attr("enabled",false);
	$(".Task_Target").find("div").attr("enabled",false);
	//设置事件的进度条
	$(".TaslRight_ItemList").find(".Task_Event").each(function(i,e){
		var d=$(e);
		d.attr("enabled","false");
		var lst = d.find(".LastDiv");
		lst.html("");	//清空
		var pd = $("<div class='Task_Event_ProgressBar'></div>");lst.append(pd);
		var pc = $("<div class='Task_Event_Progress'></div>");pd.append(pc);
		if(task.tasklist[0].eventlist[i].complete>=0){
			pc.css("width",(task.tasklist[0].eventlist[i].complete/task.tasklist[0].eventlist[i].num*100)+"%");
		}else{
			pc.css("width","0%");
		}
	});
}

//到终止运行状态
function _ToStopTaskStatus(){
	$(".Task_AddBtn").removeClass("Hide");
	$(".TaskButton_Start").removeClass("Hide");
	$(".TaskButton_Stop").addClass("Hide");
	/*
	//本版本中不更新，下一版本开放
	$("#task_changeFW_F").attr("enabled",true);
	$("#task_eventStart_F").attr("enabled",true);
	$("#task_time_F").attr("enabled",true);
	$("#task_time_F_T").attr("enabled",true);
	$("#task_autoGuider").attr("enabled",true);
	$("#task_time_C").attr("enabled",true);
	$("#task_time_C_T").attr("enabled",true);
	$("#task_eventBegin_C").attr("enabled",true);
	*/
	$("#task_over_GoHome").attr("enabled",true);
	$("#task_over_Shutdown").attr("enabled",true);
	$(".Task_Target").attr("enabled",true);
	$(".Task_Target").find("div").attr("enabled",true);
	$(".TaslRight_ItemList").find(".Task_Event").each(function(i,e){
		var d=$(e);
		d.attr("enabled","true");
		var lst = d.find(".LastDiv");
		lst.html("");	//清空
		//添加删除按钮
		s=$("<label class='DeleteTesk'>×</label>");lst.append(s);
		s.click(function(){
			//删除
			if($(this).parent().parent().attr("enabled")){	
				MessageBox.Show({
					//title:"删除确认"
					//,content:"确定要删除该事件吗？"
					title:Langtext("task.alert.del_title")
					,content:Langtext("task.alert.delevent_msg")
					,flag:MessageBox.FLAG_QUERY
					,buttons:MessageBox.BUTTONS_YES_NO
					,datas:{t:$(this)}
					,callback:function(res){
						if(res.result==MessageBox.BUTTON_YES){
							res.datas.t.parent().parent().remove();
							Task_Resort();
							UpdateTaskEstimateData();//重新计算大小
						}
					}
				});
			}
		});
	});
}


//初始化任务相关内容
function InitTask(){
	//任务列表打开按钮
	$(".Task").click(function(){$("#TaskForm").removeClass("Hide");$("#MainForm").addClass("Hide")});
	//任务列表关闭按钮
	$("#TaskFormCloseButton").click(function(){
		$("#TaskForm").addClass("Hide");
		$("#MainForm").removeClass("Hide")
	});
	
	//添加事件按钮
	$(".Task_AddBtn").click(function(){addEvent();});
	//任务开始按钮
	$(".TaskButton_Start").click(function(){
		StartTask();
	});
	
	$(".TaskButton_Stop").click(function(){
		MessageBox.Show({
			//title:"停止任务"
			//,content:"确定要停止本次任务执行吗？"
			title:Langtext("task.alert.stop_title")
			,content:Langtext("task.alert.stop_msg")
			,flag:MessageBox.FLAG_QUERY
			,buttons:MessageBox.BUTTONS_YES_NO
			,callback:function(res){
				if(res.result==MessageBox.BUTTON_YES){
					StopTask();
				}
			}
		});
	});
	
	//时间按钮
	$("#task_time_F_T").click(function(){
		var v = $(this).val();
		ShowNnumberCard({
			value:v
			,custom:{me:$(this)}
			,ok:function(data){
				var v = parseInt(data.value);
				data.custom.me.val(v);
			}
		});
	});
	
	$("#task_time_C_T").click(function(){
		var v = $(this).val();
		ShowNnumberCard({
			value:v
			,custom:{me:$(this)}
			,ok:function(data){
				var v = parseInt(data.value);
				data.custom.me.val(v);
			}
		});
	});
	
	//查找目标按钮
	$(".Task_Target").click(function(){
		//console.log($(".Task_Target").attr("enabled"));
		if($(".Task_Target").attr("enabled")!="true") return;
		ShowTargetSearchForm({
			speed:false		//隐藏速度
			,select:function(data,fa){
				//console.log(data);
				
				//记录位置
				$(".Task_Target").attr("ra",data.ra);
				$(".Task_Target").attr("dec",data.dec);
				//$(".Task_Target").find("span").html(data.name.trim().split(" ")[0] +"("+da.ra+" , "+da.dec+")");
				$(".Task_Target").find("span").html(data.name.trim().split(" ")[0]);
				Task_DrawTarget(data,fa);
				return true;
				/*
				da = __GetDataByTargetName(data.name);
				if(data.altitude<=0){
					Alert("该天体目前在地平线一下，无法GOTO");
				}else{
					//GOTO到当前位置
					__Goto(data.ra,data.dec);
				}
				*/
			}
		});
	});
	
}

//绘制目标
function Task_DrawTarget(data,fa){
	$(".Task_Target_Image").css("background-image","url("+HOST+data.image+")");
	var infs = $(".Task_Target_Info").find(".Task_Target_Item");
	$(infs[0]).html(data.name.trim() + ((data.othername!=undefined && data.othername.length>0)?" ("+data.othername+")":""));
	$(infs[1]).html(Langtext("targetserach.labels.ra")+": " + data.ra);
	$(infs[2]).html(Langtext("targetserach.labels.dec")+": " + data.dec);
	$(infs[3]).html(Langtext("targetserach.labels.altitude")+": " + data.altitude);
	$(infs[4]).html(Langtext("targetserach.labels.azimuth")+": " + data.azimuth);
	var C = $(".Task_Target_StarCanvas");
	DrawStarCurve(C,{
		sunset:fa.sunset				//日落时间
		,sunrise:fa.sunrise				//日出时间
		,midheaven:data.midheaven		//中天时间
		,ra:data.rad
		,dec:data.decd
		,longitude:fa.longitude
		,latitude:fa.latitude
	});
}

//获得正在执行中的任务并初始化，这部分应该包含在系统初始化中
function InitTaskContent(){
	//SystemParameters.task = __GetTask();
	task =SystemParameters.task;
	_ToStopTaskStatus();
	//console.log("TASK=" , task);
	$(".TaslRight_ItemList").find(".Task_Event").remove();	//删除原来的任务
	if(task!=undefined && task.tasklist!=undefined){
		//如果有任务
		//初始化条件部分
		/*
		//本版本中不更新，下一版本中开放此功能
		$("#task_changeFW_F").attr("checked",task.autofocuse.changefw);
		$("#task_eventStart_F").attr("checked",task.autofocuse.eventbegin);
		$("#task_time_F").attr("checked",task.autofocuse.intervaltime>0);
		$("#task_time_F_T").val(task.autofocuse.intervaltime);
		$("#task_autoGuider").attr("checked",task.autoguider);
		$("#task_time_C").attr("checked",task.autocalibration.intervaltime>0);
		$("#task_time_C_T").val(task.autocalibration.intervaltime);
		$("#task_eventBegin_C").attr("checked",task.autocalibration.eventbegin);
		*/
		$("#task_over_GoHome").attr("checked",task.over.gohome);
		$("#task_over_Shutdown").attr("checked",task.over.shutdown);
		$(".Task_Target").find("span").html(task.tasklist[0].shotposition.shotoname);
		$(".Task_Target").attr("ra",task.tasklist[0].shotposition.ra);
		$(".Task_Target").attr("dec",task.tasklist[0].shotposition.dec);
		var _name = task.tasklist[0].shotposition.shotoname;
		//搜索这个目标
		if(_name!=undefined && _name.length>0){
			var stre = __SearchTarget(_name);
			if(stre._result==1){
				if(stre.list[0]!=undefined){
					var stre_data=stre.list[0];
					var stre_fa={
						sunset:stre.sunset
						,sunrise:stre.sunrise
						,longitude:stre.longitude
						,latitude:stre.latitude
					};
					Task_DrawTarget(stre_data,stre_fa);
				}
				
			}
		}
		//添加任务
		$(task.tasklist[0].eventlist).each(function(i,e){
			addEvent(e);
		});
		
		//查看是否正在执行中，如果正在执行则设置执行状态
		
		if(task.status=="run" ||
		   task.status=="read" ||
		   task.status=="goto" ||
		   task.status=="home" ||
		   task.status=="focusing" ||
		   task.status=="calibration" ||
		   task.status=="changefw" ||
		   task.status=="suspend"){
			//调出窗口
			//$("#TaskForm").removeClass("Hide");
			//$("#MainForm").addClass("Hide")
			//正在执行，改变执行状态，并设置各进度按钮
			_ToStartTaskStatus();
			//执行任务
			_StartTaskLine();//启动任务监控线程
		}
	}else{
		addEvent();//添加一个空任务
	}
}