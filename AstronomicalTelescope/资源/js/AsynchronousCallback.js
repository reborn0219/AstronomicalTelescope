//返回系统中运行数据的状态
function __A__GetStatus(callback){
	//alert("准备发送请求");
	SendCommandA("getInfo",{type:"main"},callback,false);
}
//获得ID之后的导星数据（不包含此ID）
function __A__GetLastGuiderPoint(id,callback){
	SendCommandA("guideStarCurve",{index:id},callback,true);
}
//获得当前准备执行或正在执行的任务
function __A__GetTask(callback){
	SendCommandA("shootTaskQuery",undefined,callback,false);
}
//获得校准过程
function __A__GetCalibrationProcess(callback){
	var req={
		type:"process"
	}
	SendCommandA("CORRECTMOUNT",req,callback,false);
}
//获得当前曝光的进度及状态
function __A__GetExposureProgress(callback){
	SendCommandA("CameraExposureProcess",{type:"camera"},callback,false);
}
//查询对焦状态
function __A__GetAutoFocuserProgress(camera,callback){
	var req={
		type:camera
		,mode:true
	};
	SendCommandA("FocuserResult",req,callback,false);
}