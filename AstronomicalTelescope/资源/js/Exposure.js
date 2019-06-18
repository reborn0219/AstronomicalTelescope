// 曝光操作
//曝光初始化
var _ExposureLine=0;

/*
 启动曝光监控线程
 当曝光真正开始后会调用该方法启动曝光监控线程，用于监控曝光的状态，同时该方法也会在本模块的内容初始化部分被调用（如果系统总状态处于曝光状态的话）。
 该函数首先会停止曝光监控线程，然后先调用一次监控函数，之后利用100ms的速度启动这个线程
*/
function _StartExposureLine(){
	_StopExposureLine();
	_ExposureLineFunction();
	_ExposureLine = setInterval(_ExposureLineFunction,100);
}

/*
 停止曝光监控线程
 曝光线程停止后重新绘制Canvas，让她显示为圆圈的形式，否则会一直持续上一帧曝光的等待状态
*/
function _StopExposureLine(){
	clearInterval(_ExposureLine);
	_ExposureLine=0;
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

function UpdateExposureStatus(_r){
	if(_ExposureLine==0){return;}
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
	var prog=requstData;
	var C = $(".ExposureButton");		//曝光状态按钮
	C.clearCanvas();					//清空Canvas按钮上一帧内容
	//绘制按钮背景色为30%的透明灰色
	C.drawArc({
		fillStyle:"rgba(255,255,255,.3)"
		,x:60,y:60
		,radius:60
	});	
	//绘制中心按键的颜色为白色
	C.drawArc({
		fillStyle:Color_White
		,x:60,y:60
		,radius:45
	});	
	//判断状态是否为空闲或完成状态，如果是应该结束线程，并显示当前曝光内容
	if(prog.status=="idle" || prog.status=="complete"){
		console.log("结束曝光");
		//曝光结束
		StopExposure(false);//结束曝光
		//曝光结束后弹出文件
		var file=__GetImage("","@camera");
		if(file._result==1){
			//console.log("曝光结束：");
			//console.log(JSON.stringify(file));
			Preview(file,true);//显示图像
		}
		//console.log("显示图片");
	}else if(prog.status=="error"){		//当曝光发生错误时触发，首先调用StopExposure结束曝光，然后弹出曝光错误原因
		//曝光出现错误
		StopExposure();//结束曝光
		//Alert("曝光失败，错误原因 : ");
		MessageBox.Show({
			//title:"曝光失败"
			title:Langtext("exposure.alert.error_title")
			,flag:MessageBox.FLAG_WARNING
			//,content:"曝光失败，错误原因 : "
			,content:Langtext("exposure.alert.error_msg","")
			,callback:function(){
				//StopExposure(false);//结束曝光
			}
		});
	}else{								//最后，如果曝光处于进行中状态，则在Canvas中绘制曝光状态
		//曝光进行中
		//绘制按钮的背景色为30%的灰
		C.drawArc({
			fillStyle:"rgba(255,255,255,.3)"
			,x:60,y:60
			,radius:60
		});	
		if(prog.status=="getready"){	//如果处于曝光准备中，则绘制按钮为蓝色，并显示准备中的字样
			//准备中，显示为闪动蓝色
			C.drawArc({
				fillStyle:Color_Blue
				,x:60,y:60
				,radius:45
			});	
			C.drawText({
				strokeStyle:Color_Black
				,fillStyle:Color_Black
				,fontSize:20
				,x:60,y:60
				,text:Langtext("exposure.labels.getready")//准备中
			});
		}else if(prog.status=="down"){	//如果处于曝光内容下载中，则显示为蓝色按钮，并显示读取中字样
			//下载中，显示为闪动蓝色
			C.drawArc({
				fillStyle:Color_Blue
				,x:60,y:60
				,radius:45
			});	
			C.drawText({
				strokeStyle:Color_Black
				,fillStyle:Color_Black
				,fontSize:20
				,x:60,y:60
				,text:Langtext("exposure.labels.reading")//读取中
			});
		}else if(prog.status=="exposure"){//如果处于曝光中，则显示曝光的百分比环形等待图
			var time = prog.time;
			var passing = prog.passing;
			if(time>0){					//首先确认曝光时间必须大于0
				//绘制背景色
				C.drawArc({
					fillStyle:Color_White
					,x:60,y:60
					,radius:45
				});	
				//绘制完成百分比环
				var endp = passing /time * 360;
				C.drawArc({
					strokeStyle:Color_Green
					,strokeWidth:6
					,x:60,y:60
					,radius:52
					,start:0 , end:endp
				});
				
				var lst = "";
				//输出曝光时间
				if(passing>60){
					//输出分钟
					lst=(passing/60).toFixed(2)+"m";
				}else{
					lst=passing.toFixed(2)+"s";
				}
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
/*
 曝光监控函数
 该函数会从服务器中获得曝光状态，通过__GetExposureProgress查询（可以在Callback.js）中找到
 然后分析函数中的内容，最后将曝光的状态会知道Canvas按钮中。
*/
function _ExposureLineFunction(){
	//*20190521异步修改*/
	__A__GetExposureProgress(UpdateExposureStatus);	//查询报告状态
	
}

//停止曝光
function StopExposure(stop){
	stop = stop==undefined?true:stop;
	_StopExposureLine();
	if(stop){
		__CancleExposure();
	}
}

/*
 开始曝光
 首先判断设备状态是否处于空闲，如果不在空闲状态则不允许进行曝光
 然后判断设备是否处于任务、goto、校准、自动调焦等状态，如果是则也不允许曝光进行
 最后判断是否处于曝光状态，如果处于曝光状态，该按钮的作用是停止曝光
 一切判断完毕，则查看用户选择的是否为暗场或暗平场，如果是，则要求用户关闭镜头盖再继续
 最后，调用_StartExposure启动曝光
*/
function StartExposure(){
	if(SystemParameters.status!="idle"){
		if(SystemParameters.status=="task"){
			//正在执行任务，不可做其他动作
			MessageBox.Show({
				//title:"无法执行"
				//,content:"任务执行中..."
				title:Langtext("exposure.alert.unable_title")
				,content:Langtext("exposure.alert.unable_task")
			});
		}else if(status=="exposure"){
			//正在曝光，是否停止
			MessageBox.Show({
				//title:"终止曝光"
				title:Langtext("exposure.alert.stop_title")
				,flag:MessageBox.FLAG_QUERY
				,buttons:MessageBox.BUTTONS_YES_NO
				//,content:"需要停止曝光吗？"
				,content:Langtext("exposure.alert.stop_msg")
				,callback:function(res){
					if(res.result==MessageBox.BUTTON_YES){
						StopExposure();
					}
				}
			});
		}else if(status=="goto"){
			//Alert("赤道仪正在Goto，请等待Goto完毕再执行此项操作。");
			MessageBox.Show({
				//title:"无法执行"
				//,content:"赤道仪正在Goto，请等待Goto完毕再执行此项操作。"
				title:Langtext("exposure.alert.unable_title")
				,content:Langtext("exposure.alert.unable_goto")
			});
		}else if(status=="calibration"){
			MessageBox.Show({
				//title:"无法执行"
				//,content:"赤道仪正在校准，请等待校准完毕再执行此项操作。"
				title:Langtext("exposure.alert.unable_title")
				,content:Langtext("exposure.alert.unable_calibration")
			});
			//Alert("赤道仪正在校准，请等待校准完毕再执行此项操作。");
		}else if(status=="focusing"){
			MessageBox.Show({
				//title:"无法执行"
				//,content:"主相机正在对焦，请等对焦准完毕再执行此项操作。"
				title:Langtext("exposure.alert.unable_title")
				,content:Langtext("exposure.alert.unable_focusing")
			});
			//Alert("主相机正在对焦，请等对焦准完毕再执行此项操作。");
		}
		return ;
	}
	
	if(ExposureType=="dark" || ExposureType=="flat-dark"){
		MessageBox.Show({
			//title:"暗场拍摄"
			title:Langtext("exposure.alert.drak_title")
			//,content:"执行暗场拍摄，请确认镜头盖已经关闭。"
			,content:Langtext("exposure.alert.dark_msg")
			,callback:function(){
				_StartExposure();
			}
		});
	}else{
		_StartExposure();
	}
	
}

/*
 启动曝光
 根据曝光参数组织曝光信息串传给服务器，如果曝光启动成功__Exposure函数（在Callback.js中，返回true则表示成功），利用_StartExposureLine启动曝光监控函数
 否则提示错误信息
*/
function _StartExposure(){
	//补丁修改正
	var et = 0;
	if(ExposureType=="light"){et=0;}
	else if(ExposureType=="dark"){et=1;}
	else if(ExposureType=="flat"){et=2;}
	else if(ExposureType=="bias"){et=3;}
	else if(ExposureType=="flat-dark"){et=4;}
	if(__Exposure(et,ExposureTime,ExposureBin,ExposureFilter)){//启动曝光函数
		//曝光启动
		SystemParameters.status="exposure";
		_StartExposureLine();
	}else{
		MessageBox.Show({
			//title:"无法执行"
			title:Langtext("exposure.alert.unable_title")
			,flag:MessageBox.FLAG_WARNING
			//,content:"当前不可拍摄，请检查相机连接是否正常。"
			,content:Langtext("exposure.alert.unable_error")
		});
	}
}

//初始化曝光界面用到的元素事件
function InitExposure(){
	//设置按钮绘图大小
	var C=$(".ExposureButton");
	C.attr("width",120);
	C.attr("height",120);
	//当单击Canvas按钮的时候触发函数
	C.click(function(){
			$("#ExposureSettingForm").addClass("Hide");
			var status = SystemParameters.status;
			if(status=="idle"){
				//空闲状态，可以进行曝光
				if(SystemParameters.devices.camera!=undefined){
					StartExposure();	//开始曝光
				}else{
					MessageBox.Show({
						title:Langtext("exposure.alert.error_title")
						,content:Langtext("exposure.alert.devices_does_not_exist")
					});
				}
			}else{
				if(status=="task"){
					//正在执行任务，不可做其他动作
					MessageBox.Show({
						//title:"无法执行"
						//,content:"任务执行中..."
						title:Langtext("exposure.alert.unable_title")
						,content:Langtext("exposure.alert.unable_task")
					});
				}else if(status=="exposure"){
					//正在曝光，是否停止
					MessageBox.Show({
						//title:"终止曝光"
						title:Langtext("exposure.alert.stop_title")
						,content:Langtext("exposure.alert.stop_msg")
						,flag:MessageBox.FLAG_QUERY
						,buttons:MessageBox.BUTTONS_YES_NO
						//,content:"需要停止曝光吗？"
						,callback:function(res){
							if(res.result==MessageBox.BUTTON_YES){
								StopExposure();
							}
						}
					});
				}else if(status=="goto"){
					//Alert("赤道仪正在Goto，请等待Goto完毕再执行此项操作。");
					MessageBox.Show({
						//title:"无法执行"
						//,content:"赤道仪正在Goto，请等待Goto完毕再执行此项操作。"
						title:Langtext("exposure.alert.unable_title")
						,content:Langtext("exposure.alert.unable_goto")
					});
				}else if(status=="calibration"){
					MessageBox.Show({
						//title:"无法执行"
						//,content:"赤道仪正在校准，请等待校准完毕再执行此项操作。"
						title:Langtext("exposure.alert.unable_title")
						,content:Langtext("exposure.alert.unable_calibration")
					});
					//Alert("赤道仪正在校准，请等待校准完毕再执行此项操作。");
				}else if(status=="focusing"){
					MessageBox.Show({
						//title:"无法执行"
						//,content:"主相机正在对焦，请等对焦准完毕再执行此项操作。"
						title:Langtext("exposure.alert.unable_title")
						,content:Langtext("exposure.alert.unable_focusing")
					});
					//Alert("主相机正在对焦，请等对焦准完毕再执行此项操作。");
				}
			}
		});
	C.clearCanvas();
	//画按钮
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
	
	//曝光设置按钮单击
	$(".ExposureSetting").click(function(){			//单击曝光按钮（单针曝光）
		if(SystemParameters.status=="exposure") return;//正在曝光中
		if($("#ExposureSettingForm").hasClass("Hide")){
			$("#ExposureSettingForm").removeClass("Hide");
		}else{
			$("#ExposureSettingForm").addClass("Hide");
		}
	});
}

//初始化曝光内容
function InitExposureContent(){
	//console.log("曝光初始化，状态值=",SystemParameters.status);
	if(SystemParameters.status=="exposure"){
		//启动曝光相关
		_StartExposureLine();
	}
}

/********************************实时取景***********************************/
//设置视频
var Video_Setting=false;
var Video_FrameID=0;
var Video_Light=true;//小灯亮灭
function SetVideo(d , camera){
	//if(Video_Setting){return;}
	var img = new Image();
	camera=camera.replace("_","");
	img.crossOrigin="";
	//console.log(img.src);
	img.onload=function(){
		var c = document.getElementById("DEV_Video");
		InitPreview_Width();
		var _w = _Preview_Width;
		var _h = _Preview_Height;
//		var C = $("#DEV_Video");
//		C.attr("width",_w);
//		C.attr("height",_h);
		c.width= _w;
		c.height=_h;
		var ctx=c.getContext("2d");
		ctx.drawImage(img,0,0,_w,_h);
		var _rd=ctx.getImageData(0,0,_w,_h);
		//向目标绘制
		d.width=_w;
		d.height=_h;
		d.getContext("2d").putImageData(_rd,0,0);
		//获取帧率信息
		var fps = __GetVideoData(camera);
		if(fps!=undefined){
			//更新数据
			var fpsno=0;
			var fpsnow=0;
			var fpstol=0;
			var hfd=0;
			if(fps.hfd!=undefined){
				hfd = fps.hfd.toFixed(2);
				$(".Focuser_HFR").html(Langtext("focuser.hfr",fps.hfd.toFixed(2)));
			}
			fpsno=fps.fpsno!=undefined?fps.fpsno:0;
			fpsnow=fps.fps!=undefined?fps.fps.toFixed(1):0;
			fpstol=fps.fpstol!=undefined?fps.fpstol.toFixed(1):0;
			if(Video_FrameID!=fpsno){
				Video_FrameID=fpsno;
				Video_Light=!Video_Light;//小灯变化
			}
			//绘制帧率参数和小灯
			var C=$(d);
			
			C.drawRect({
				fillStyle:Color_White,
				x:_w-660,y:_h-70,
				width:640,height:50,
				cornerRadius:10,
				fromCenter: false
			});
			//小灯闪烁
			C.drawEllipse({
				fillStyle:Video_Light?Color_Red:"#000",
				x:_w-50,y:_h-55,
				width:20,height:20,
				fromCenter: false
			});
			C.drawText({
				fillStyle:"#000",
				fontSize:28,
				x:_w-60,y:_h-46,
				align:"right",
				respectAlign: true,
				text:"Frame:" + fpsno + "  Rate:"+ fpstol +"(Current:"+fpsnow+")  HFD:"+hfd
			});
		}
	}
	img.src=HOST+"/stargazer-web/stargazer.aspx?cmd="+camera+"_preview&_t="+Math.random();
}

var Video_Camera="";
var Video_Thread=0;
var Video_Display=undefined;
//打开实时取景
function OpenVideo(camera , dsp){
	console.log("打开视频：" ,camera);
	console.log("视频投放：" ,dsp);
	//CloseVideo();
	Video_Display=dsp;
	Video_Camera=camera;
	__SetCameraVideoTime(camera,true);
	SetVideo(Video_Display,Video_Camera);
	clearInterval(Video_Thread);
	Video_Thread = setInterval(function(){
		SetVideo(Video_Display,Video_Camera);
	},500);
}
//停止实时取景
function CloseVideo(camera){
	clearInterval(Video_Thread);
	//关闭两个摄像头实时取景
	if(camera==undefined){
		__SetCameraVideoTime("camera",false);
		__SetCameraVideoTime("camera_g",false);
	}else{
		__SetCameraVideoTime(camera,false);
	}
}
