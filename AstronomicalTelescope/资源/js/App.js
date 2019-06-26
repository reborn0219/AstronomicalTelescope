function AnythingToJson(v){
	var r;
	if(typeof(v)=="string" || typeof(v)=="object"){
		r=eval('(' + _r + ')');
	}else{
		r=v;
	}
	return r;
}///////////////////////////手机APP操作函数////////////////////////////
//对话框
var _MessageBoxList = {};//弹窗数组
//消息窗口
function MessageBox(){}
MessageBox.FLAG_MESSAGE="MESSAGE";		//消息，无任何标志
MessageBox.FLAG_WARNING="WARNING";		//警告标志
MessageBox.FLAG_ERROR="ERROR";		//错误标志
MessageBox.FLAG_QUERY="QUERY";			//询问标志
MessageBox.FLAG_INFORMATION="INFORMATION";//消息标志

MessageBox.BUTTONS_OK_ONLY=0;			//确定
MessageBox.BUTTONS_OK_CANCEL=1;			//确定、取消
MessageBox.BUTTONS_ABORT_RETRY_IGNORE=2;//终止、重试、忽略
MessageBox.BUTTONS_YES_NO_CANCEL=3;		//是、否、取消
MessageBox.BUTTONS_YES_NO=4;			//是、否
MessageBox.BUTTONS_RETRY_CANCEL=5;		//重试、取消
//按键返回值
MessageBox.BUTTON_CLOSE=0;				//直接关闭
MessageBox.BUTTON_OK=1;					//确定
MessageBox.BUTTON_CANCLE=2;				//取消
MessageBox.BUTTON_YES=3;				//是
MessageBox.BUTTON_NO=4;					//否
MessageBox.BUTTON_RETRY=5;				//重试
MessageBox.BUTTON_ABORT=6;				//终止
MessageBox.BUTTON_IGNORE=7;				//忽略
//调出窗口title：标题，content内容，flag标志类型，buttons按钮组，callback回调函数
MessageBox.Show = function(arg){
	if(arg!=undefined){
		var title="";
		var content="";
		var flag="MESSAGE";
		var buttons=0;
		var callback=undefined;			//回调函数
		var datas=undefined;			//请求时候带来的内容，会回传
		if(arg.title!=undefined){title=arg.title;}
		if(arg.content!=undefined){content=arg.content;}
		if(arg.flag!=undefined){flag=arg.flag;}
		if(arg.buttons!=undefined){buttons=arg.buttons;}
		if(arg.callback!=undefined){callback=arg.callback;}
		if(arg.datas!=undefined){datas=arg.datas;}
		//弹窗
		var callid="ID_";
		for(var i=0;i<16;i++){
			callid+=(((1+Math.random())*0x10000)|0).toString(16).substring(1).toUpperCase();
		}
		_MessageBoxList[callid]={
			callback:callback
			,datas:datas
		};
		//调用弹窗
		__ShowMessageBox({
			title:title
			,content:content
			,flag:flag
			,buttons:buttons
			,callid:callid
		});
	}
}
//调用APP

function __ShowMessageBox(arg){
	var title = arg.title!=undefined?arg.title:"";
	var content = arg.content!=undefined?arg.content:"";
	var flag = arg.flag!=undefined?arg.flag:MessageBox.FLAG_MESSAGE;
	var buttons=arg.buttons!=undefined?arg.buttons:MessageBox.BUTTONS_OK_ONLY;
	var callid = arg.callid;
//    PhoneInterface.dialog(title,content,flag,buttons,callid);
    window.webkit.messageHandlers.gohome.postMessage(title,content,flag,buttons,callid);

}
//回调函数
function __MessageBox_Callback(data){
	if(data!=undefined){
		var callid=data.callid;
		if(callid!=undefined){
			var m=_MessageBoxList[callid];		//取出
			delete _MessageBoxList[callid];		//删除
			if(m!=undefined){
				var callback=m.callback;
				var datas=m.datas;
				if(callback!=undefined){
					callback({result:data.result,datas:datas});
				}
			}
		}
	}
}
//设置Host参数
function _SetHost(host){
    alert("_SetHost"+host);
	HOST = "http://"+host
	//HOST = "http://"+host+":8080";
}

function GetLocalGPS(){
//    var _r = PhoneInterface.getGPS();
    alert("gps");
    var _r = window.webkit.messageHandlers.getGPS.postMessage("调用NoticeAppReady完毕");

	return eval('(' + _r + ')');
}

function DeviceClose(){
//    PhoneInterface.close();
    window.webkit.messageHandlers.close.postMessage("调用NoticeAppReady完毕");

}

//通知APP已经启动成功
function NoticeAppReady(){
    alert("已经调用NoticeAppReady");
//    window.webkit.messageHandlers.PhoneInterface.ready();
    window.webkit.messageHandlers.ready.postMessage("");
    alert("调用NoticeAppReady完毕");
}

function ShowView(){
//    PhoneInterface.showview();
    window.webkit.messageHandlers.showview.postMessage("调用NoticeAppReady完毕");

}

function GoHome(){
//    PhoneInterface.gohome();
    window.webkit.messageHandlers.gohome.postMessage("调用NoticeAppReady完毕");

}
//浏览器准备完毕后回调
function _BrowserReady(){
    alert("_BrowserReady");
	BrowserReady();
}
//var HOST="http://192.168.31.92";
var HOST="http://192.168.31.218";
var Host_Page = "/stargazer-web/stargazer.aspx";
var Video_Page = "";

function SendCommand(cmd, params, sync){
//	if(cmd=="InitSystem"){
//		alert(HOST+Host_Page+"?cmd="+cmd, "params=" + JSON.stringify(jsonData));
//	}
	var requstData={};
	var jsonData = (params && params!=undefined && params!=null)?params: {};
	var requstData = "";
	var _r= PhoneInterface.loadUrl(HOST+Host_Page+"?cmd="+cmd, "params=" + JSON.stringify(jsonData));
	var r =  eval('(' + _r + ')');
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
		console.log("指令执行错误,错误原因："+r.data);
	}
	return requstData;
}
//同步请求
function SendCommandA(cmd,params,callback,important){
	var requstData={};
	var jsonData = (params && params!=undefined && params!=null)?params: {};
	var requstData = "";
	var cbFun = undefined;
	if(callback!=undefined){
		cbFun = callback.name;
		if(cbFun==""){cbFun=callback.toString();}
	}
	//alert(HOST+Host_Page+"?cmd="+cmd+ ",params=" + JSON.stringify(jsonData)+","+cbFun+","+important);
	PhoneInterface.loadUrlA(HOST+Host_Page+"?cmd="+cmd, "params=" + JSON.stringify(jsonData),cbFun,important);
	//alert("调用完毕，等待回调");
}

function _GetJSON(path , callback){
	//$.getJSON(path,"",callback);
//    var json = PhoneInterface.getJSON(path);
    var json = window.webkit.messageHandlers.getJSON.postMessage(path);

	callback(eval('(' + json + ')'));
    alert("_GetJSON====="+json);
}


function AnythingToJson(v){
	var r;
	r=eval('(' + v + ')');
	return r;
}
