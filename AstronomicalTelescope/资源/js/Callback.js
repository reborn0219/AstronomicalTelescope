//研发过程中需要重写的回调函数
//系统中函数会用到这部分，当调用这些函数时必须按照结果进行返回



//返回系统中当前参数JSON数据，格式如下
function __GetInitializationSystemParameters(){
	var result=SendCommand("getInfo");
	return result;
}

//返回系统中运行数据的状态
function __GetStatus(){
	var res = SendCommand("getInfo",{type:"main"});
	return res;
}

//获得ID之后的导星数据（不包含此ID）
function __GetLastGuiderPoint(id){
	var res = SendCommand("guideStarCurve",{index:id});
	return res;
}

//开始导星
function __StartGuider(){
	SendCommand("guideStarAuto");
}

//停止导星
function __StopGuider(){
	SendCommand("guideStarStop");
}

function __ClearGuiderCData(){
	SendCommand("GuideStarClearCD");
}

//获得当前准备执行或正在执行的任务
function __GetTask(){
	var res = SendCommand("shootTaskQuery");
	return res;
}

//开始执行任务，传入当前设置好的任务，如果任务的status为run表示马上开始执行，其他表示暂存
function __StartTask(task){
	var res = SendCommand("shootTaskStart",task);
	return res;
}

//停止执行任务
function __StopTask(){
	SendCommand("shootTaskStop");
}

//设置当前位置为Home位
function _SetMountHome(ra,dec){
	var req={};
	if(ra!=undefined && dec!=undefined){
		req.ra=ra;
		req.dec=dec;
	}
	SendCommand("MountSetHome",req);
}

//设置赤道仪Park位
function _SetMountPark(ra,dec){
	var req={};
	if(ra!=undefined && dec!=undefined){
		req.ra=ra;
		req.dec=dec;
	}
	SendCommand("MountSetPark",req);
}
//回到Home位
function _MountGoHome(){
	SendCommand("MountGoHome");
}
//回到Park位
function _MountGoPark(){
	SendCommand("MountGoPark");
}

//移动赤道仪到指定位置
function __MountGoto(ra,dec){
	var req={
		ra:ra
		,dec:dec
	}
	SendCommand("MountGoto",req);
}

function __MountGotoStop(){
	SendCommand("MountGotoStop");
}

//移动赤道仪，如果为0表示停止轴的移动，speed表示运行速度，赤道仪可运行速度的编号
function __MountMove(ra,dec,speed){
	var req={
		rate:speed
		,ra:ra
		,dec:dec
	}
	SendCommand("MountSlew",req);
}

//根据拍摄数据进行校准，file为拍摄数据的id（文件名）
function __StartCalibration(file){
	var req={
		type:"begin"
		,imgname:file
	}
	var res = SendCommand("CORRECTMOUNT",req);
	return res._result==1;
}

//获得校准过程
function __GetCalibrationProcess(){
	var req={
		type:"process"
	}
	var res = SendCommand("CORRECTMOUNT",req);
	return res;
}

//取消已经下达的校准任务
function __CalcelCalibration(){
	var req={
		type:"stop"
	}
	var res = SendCommand("CORRECTMOUNT",req);
	return res._result==1;
}

//根据一帧数据进行曝光，则使用默认值，bin和filter为编号，time单位为毫秒
function __Exposure(type , time , bin , filter){
	var req={
		type:"camera",
		frametype:type
		,time:time/1000
		,bin:bin
		,filter:filter
	}
	var res = SendCommand("CameraExposure",req);
	return res._result==1;
}

//取消曝光
function __CancleExposure(){
	SendCommand("CameraExposureAbort",{type:"camera"});
}

//获得当前曝光的进度及状态
function __GetExposureProgress(){
	var res = SendCommand("CameraExposureProcess",{type:"camera"});
	return res;
}

//传入温度并打开指令，camera=0表示主相机，1表示导星相机
function __OpenCool(camera , preset_temperature){
	var type="camera"; 
	if(camera!=0){
		type="camera_g"
	}
	var req={type:type , cool:true, preset_temperature:preset_temperature};
	SendCommand("SetCamera", req);
}

//关闭制冷
function __CloseCool(camera){
	var type="camera";
	if(camera!=0){
		type="camera_g"
	}
	var req={type:type,cool:false};
	SendCommand("SetCamera", req);
}

//设置赤道仪参数，如果品牌和型号为空，则表示不设置，经纬度为空、高度为0表示不设置，时间为空表不设置，端口为空表示不改变，返回true表示设置成功
function __SetParameters_Mount(port , brand , model , longitude , latitude , datetime){
	if(longitude!=undefined && latitude!=undefined){
		SendCommand("SetMount", {type:"mount",longitude: longitude, latitude: latitude});
	}
	if(datetime!=undefined){
		SendCommand("SetMount", {type:"mount",datetime: datetime});
	}
	
}

//设置摄像头实时图像的曝光时间
function __SetCameraVideoTime(camera , video ,time){
	var req = {type:camera,video:video};
	if(time!=undefined && video==true){
		req.video_time=time;
	}
	SendCommand("SetCamera",req);
}

//获得摄像头实时图像的曝光时间
function __GetCameraVideoTime(camera){
	var req = {type:"devices"};
	res = SendCommand("GetInfo",req);
	if(cmaera=="camera"){
		return res.camera.time;
	}else{
		return res.camera_g.time;
	}
}

//获得帧率等信息
function __GetVideoData(camera){
	var req = {type:camera};
	var res = SendCommand("CameraFPS",req);
	return res;
}

//同步赤道仪数据，返回true表示同步成功
function __SyncMount(ra , dec){}  

//设置摄像头数据camera=0表示主摄像头，为1表示导星摄像头，返回true表示设置成功
function __SetParameters_Camera(camera , port , brand , model  , caliber , focus, gain, offset ){
	var type="camera";
	if(camera!=0){
		type="camera_g"
	}
	var req={type:type};
	if(caliber!=null && caliber !=undefined){req.caliber=caliber;}
	if(focus!=null && focus !=undefined){req.focus=focus;}
	if(gain!=null && gain !=undefined){req.gain=gain;}
	if(offset!=null && offset !=undefined){req.offset=offset;}
	SendCommand("SetCamera", req);
}

//切换相机
function __ChangeCamera(camera , port){
	SendCommand("deviceSelect",{type:camera,id:port});
}

function __SetParameters_Focuser(port , brand , model , position , max){
	var req={type:"focuser"};
	if(position!=null && position !=undefined){req.position=position;}
	if(max!=null && max !=undefined){req.max=max;}
	SendCommand("SetFocuser", req);
}
//设置调焦器数据，filters为数据表，返回true表示设置成功
//filters格式{filters:[{lable:"red",color:"#FF0000"}]}，filters为空表示不设置
function __SetParameters_FilterWheels(port , brand , model , holes){
	var req={type:"filterwheels"};
	if(holes!=null && holes !=undefined){req.holes=holes;}
	SendCommand("SetFilterwheels", req);
}

//获得所有设备的设置参数
function __GetParameters_Devices(){
	var result = SendCommand("getInfo",{type:"devices"});
	return result;
}

//获得所有目录列表
function __GetDirectory(){
	var res = SendCommand("GetFitDirectory");
	return res;
}

//删除目录
function __RemoveDirectory(dir){
	SendCommand("RemoveFitDirectory",{fitdirectoryid:dir});
}
//根据目录ID获得指定数量的数据图片，如果id为空表示获得非任务拍摄图片，start表示从哪个数据开始(index)，size表示获得的数量
function __GetFiles(id, start , size){
	var req = {
		fitdirectoryid:id
		,start:start
		,size:size
	};
	var res = SendCommand("GetFitFile",req);
	return res;
}

function __GetImage(dir ,file,histogram){
	var req = {};
	if(dir!=undefined && dir!=""){
		req.fitdirectoryid=dir;
	}
	if(file!=undefined && file!=""){
		req.fileid=file;
	}
	if(histogram!=undefined){
		req.white=histogram.white;
		req.black=histogram.black
	}
	var res = SendCommand("GetFileData",req);
	return res;
}
//根据图片编号或路径获得图像的直方图
function __GetImageHistogram(file){
	result = {
		white:255			//默认白场
		,blakc:0		//默认黑场
		,middle:125		//默认中值
		,max:17000		//其中最大值
		,datas:[]		//从0-255的直方数据
	};
	return result;
}

//获得图片的信息，json格式返回
function __GetImageInformation(file){}

//删除一组图片，传入一个输入，数组为图片的编号
function __RemoveFiles(dir,files){
	SendCommand("RemoveFitFile",{fitdirectoryid:dir,fitid:files});
}

//构建一张可以分享的图片（用于保存到本地），rag为bool变量，默认为true，表示添加底部的内容标签，返回图片数据
//function __BuildShareImage(file , tag=true){}

//根据名称进行精确搜索，有可能搜索出双星
function __SearchTarget(name){
	result={
		sunset:"2019-02-22 19:55:32"		//日落时间，带日期
		,sunrise:"2019-02-23 06:38:62"		//日出时间，带日期
		,longtitude:123.123					//经度double类型
		,latitude:123.123					//纬度double类型
		,list:[
			{
				name:"M42"					//正式名称
				,othername:"猎户座大星云"		//别名，资额在括号里的
				,ra:"05:36:13"				//赤经
				,dec:"-05°22'57\""			//赤纬
				,azimuth:"48°46'47\""		//高度角
				,altitude:"-45°:27':02\""	//方位角
				,type:1						//天体类型具体编号需要排列一下
				,magnitude:4.5				//星等
				,size:[12.8,15.4]			//大小 角秒
				,image:""					//缩略图位置，大小为200×200的图片，如果没有则不包含此字段
				//好有一些数据需要进行整理
				,midheaven:"2019-02-23 01:38:62"			//中天时间
				,rad:123.123				//RAdouble类型
				,decd:123.123				//DECdouble类型
			}
		]
	};
	
	return result;
}



// 根据名称进行精确搜索，有可能搜索出双星
function __SearchTarget(name){
	
	var paramJson = {
		"searchtype" : "star", 
		"name" : name
    };
	result = SendCommand("starmapsearch", paramJson);
	//console.log(result);
	
	return result;
}

// 精选天体搜索
// type为8位数据，从高到低依次表示为系内天体、星团、发射星云、反射星云、星系、暗星云、行星星云、彗星
//__SearchCondition(255,0,0,0,0,name)
function __SearchCondition(type , altitude , duration , minsize , maxsize, name){
	name = name && name != null ? name : "";
	var paramJson = {
		"searchtype" : "best", 
		"name" : name,
		"type" : type,
		"altitude" : altitude,
		"duration" : duration,
		"minsize" : minsize,
		"maxsize" : maxsize
    };
	result = SendCommand("starmapsearch", paramJson);
	//console.log(result);
	return result;
}

//开启自动对焦
function __StartAutoFocuser(camera){
	var req={
		type:camera
		,mode:true
	};
	var res = SendCommand("focuserAuto",req);
	return res._result==1;
}
//停止自动对焦
function __StopAutoFocuser(camera){
	var req={
		type:camera
		,mode:false
	};
	var res = SendCommand("focuserAuto",req);
	return res._result==1;
}

//查询对焦状态
function __GetAutoFocuserProgress(camera){
	var req={
		type:camera
		,mode:true
	};
	var res = SendCommand("FocuserResult",req);
	return res;
}

//手动调焦，direction方向，-1入，1出，0停止，传入状态后开始启动变焦，收到0停止变焦
function __FocuserMove(camera , direction){
	var req={
		type:camera
		,mode:false
		,direction:direction
	};
	var res = SendCommand("focuserMove",req);
	return res._result==1;
}


/*
//精选天体搜索
//type为8位数据，从高到低依次表示为系内天体、星团、发射星云、反射星云、星系、暗星云、行星星云、彗星
function __SearchCondition(type , altitude , duration , minsize , maxsize){
	
}
*/
//根据天体名称或编号获得数据
function __GetDataByTargetName(name){
	result={
		ra:"05:36:13"				//赤经
		,dec:"-05°22'57\""			//赤纬
		,altitude:10		//当前高度,判断是否小于0，如果小于0表示在地平线一下
	};
	return result;
}

//修改登录密码
function __ChangeWifiPassword(pwd){
	var req={
		type:"system",
		password:pwd
	};
	var res = SendCommand("SetSystemInfo",req);
	return res._result==1;
}
//修改登录密码
function __ChangePassword(pwd){
	var req={
		type:"system",
		loginpassword:pwd
	}
	var res = SendCommand("SetSystemInfo",req);
	return res._result==1;
}

//修改登录密码
function __ChangeDeviceName(name){
	var req={
		type:"system",
		name:name
	};
	var res = SendCommand("SetSystemInfo",req);
	return res._result==1;
}

function __SetLanguage(lang){
	var req={
		language:lang
	};
	var res = SendCommand("InitSystem",req);
}

function __Shutdown(){
	var req={
		type:"shutdown"
	};
	var res = SendCommand("ShutDown",req);
}

function __Reboot(){
	var req={
		type:"reboot"
	};
	var res = SendCommand("ShutDown",req);
}