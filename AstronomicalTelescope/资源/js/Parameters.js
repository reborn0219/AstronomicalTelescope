//通用变量申明
var Color_White = "#ABABAB";
//var Color_WhiteA = rgba(171,171,171,0.7);
var Color_Green = "#4C9D2F";
var Color_Blue = "#2684ED";
//var Color_Red = "#F32A2A"
var Color_Red = "#b70007";
var Color_Black="#232323";

var SystemParameters={};				//所有的系统参数都在这个表中，从表中更新或设置


// 参与运算的参数表

var ExposureTime = 1000;		//单片曝光的时间单位ms
var ExposureType = "light";		//曝光类型
var ExposureBin = 0;			//Bin选择类型
var ExposureFilter = 0;			//曝光滤镜算着
var DisplayMountController=true;
var MountSpeed=-1;				//赤道仪移动速率
	function SetMountSpeed(ms){
		MountSpeed=ms;
		$(".BDF_MenuButton").html("× " + SystemParameters.devices.mount.speeds[ms]);
	}

//FilterWheelsHole=7;		//滤镜轮孔数
var Filters=[["Empty",Color_White],["Red",Color_Red],["Blue",Color_Blue],["Green",Color_Green],["Hα",Color_Red],["OIII",Color_Green],["SII",Color_Blue]];				//滤镜序列[标签，颜色]
var Bins = [1,2,3,4];		//支持的Bin
//var ExposureTypes=["亮场","暗场","平场","偏置","暗平场"];//曝光类型
var ExposureTypes=[Langtext("frametype.light"),Langtext("frametype.dark"),Langtext("frametype.flat"),Langtext("frametype.bias"),Langtext("frametype.flatdark")];


//设置相机显示参数
function SetCameraDisplay(type , bin , exp , gain , offset , temperature ,cooling){
	$("#PI_Type").html(type);
	$("#PI_Bin").html(bin);
	Exps=exp+"ms";
	if(exp>1000){
		Exps = (exp/1000).toFixed(2)+"s";
	}
	$("#PI_ExposureTime").html(Exps);
	$("#PI_Gain").html(gain);
	$("#PI_Offset").html(offset);
	$("#PI_CameraTemperature").html(temperature);
	$("#PI_CameraCooling").html(cooling);
}


//设置赤道仪参数显示
function SetMountDataDisplay(ra , dec){
	$("#PI_Ra").html(ra);
	$("#PI_Dec").html(Dec);
}

//设置相机状态显示
function SetCameraStatus(s){
	$(".D_Camera").html(s);
}

//设置导星相机状态显示
function SetGuiderCameraStatus(s){
	$(".D_Guider").html(s);
}
//设置赤道仪状态显示
function SetMountStatus(s){
	$(".D_Mount").html(s);
}
//设置调焦器状态显示
function SetFocuserStatus(s){
	$(".D_Focuser").html(s);
}
//滤镜轮状态显示
function SetFilterWheelsStatus(s){
	$(".D_FilterWheels").html(s);
}
//设置设备的运行状态
function SetDeviceStatus(s,icon){
	$(".Status").html(s);
	if(arguments[1]){
		//设置图标
		$(".Status").css("background-image","url("+icon+")");
	}
}

//设置树莓派是否欠压
function SetRPIUndervoltage(s)
{
	if(s){
		$(".Undervoltage").css("background-image","url(../images/flag/Undervoltage.png)");
	}else{
		$(".Undervoltage").css("background-image","");
	}
}
//设置树莓派温度
function SetRPITemperature(s){
	$(".Temperature").html(s);
}
//设置树莓派剩余存储空间
function SetRPICapacity(s){
	$(".Capacity").html(s);
}

