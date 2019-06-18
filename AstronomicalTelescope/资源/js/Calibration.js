// 校准相关
var CalibrationLine=0;	//校准线程
function _StartCalibrationLine(){
	_StopCalibrationLine();
	_CalibrationLineFunction();
	CalibrationLine=setInterval(_CalibrationLineFunction,1000);
}

function _CalibrationLineFunction(){
	//校准线程
	var res = __GetCalibrationProcess();
	if(res.status!=undefined){
		$(".Calibration_Process").find(".Calibration_Process_Item").each(function(i,e){
			//按顺序设置状态
			var d = $(e);
			if(res.steps[i]!=undefined){
				d.attr("status",res.steps[i].status);
				d.find(".Calibration_Process_Item_Message").html(res.steps[i].message+" ");
			}else{
				d.attr("status","wait");
				d.find(".Calibration_Process_Item_Message").html(" ");
			}
		});

		if(res.status=="complete" || res.status=="idle"){
			//完成校验
			_StopCalibrationLine();
			//显示按钮
			$("#Calibration_Cancel").addClass("Hide");
			$("#Calibration_OK").removeClass("Hide");
			return ;
		}
	}
}

function _StopCalibrationLine(){
	if(CalibrationLine!=0){clearInterval(CalibrationLine);}
}

//校准窗口初始化
function InitCalibration(){
	//取消按钮
	$("#Calibration_Cancel").click(function(){
		MessageBox.Show({
			//title:"取消校准"
			//,content:"确定取消本次校准吗？"
			title:Langtext("calibration.alert.cancel_title")
			,content:Langtext("calibration.alert.cancel_msg")
			,flag:MessageBox.FLAG_QUERY
			,buttons:MessageBox.BUTTONS_YES_NO
			,callback:function(res){
				if(res.result==MessageBox.BUTTON_YES){
					CalcelCalibration();
					$(".CalibrationForm").addClass("Hide");
				}
			}
		});
	});
	
	//确定按钮
	$("#Calibration_OK").click(function(){
		$(".CalibrationForm").addClass("Hide");
	});
	
}

//初始化校准数据
function InitCalibrationContent(){
	if(SystemParameters.status=="calibration"){
		//表示正在校准
		$(".CalibrationForm").removeClass("Hide");
		$("#Calibration_Cancel").removeClass("Hide");
		$("#Calibration_OK").addClass("Hide");
		_StartCalibrationLine();
	}
}

//开始校准
function StartCalibration(){
	//使用最新照片进行校准
	file = $(".PicturePreviewForm").attr("file");
	if(file!=undefined && file.length>0){
		//有文件，请求校准
		$("#Calibration_Cancel").removeClass("Hide");
		$("#Calibration_OK").addClass("Hide");
		if(__StartCalibration(file)){
			_StartCalibrationLine();
		}else{
			//Alert("校准失败");
			$(".CalibrationForm").addClass("Hide");
		}
		//打开校准线程
	}else{
		$(".CalibrationForm").addClass("Hide");
		//Alert("该数据无法校准");
		MessageBox.Show({
			title:Langtext("calibration.alert.error_title")
			,content:Langtext("calibration.alert.errordata_msg")
		});
	}
}

//取消校准
function CalcelCalibration(){
	__CalcelCalibration();
	_StopCalibrationLine();
}
