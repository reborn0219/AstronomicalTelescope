
///////////////////////////注册操作函数结束////////////////////////////

//对话框
/*
function Confirmd(msg)
{
	return confirm(msg)
}

function Alert(msg){
	alert(msg);
}
*/
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
	PhoneInterface.dialog(title,content,flag,buttons,callid);
	/*
	PhoneInterface.dialog({
		title:arg.title
		,content:arg.content
		,flag:arg.flag
		,buttons:arg.buttons
		,callid:arg.callid
	});
	*/
}


function __ShowMessageBox(arg){
	var res ={callid:arg.callid};
	if(arg.buttons==MessageBox.BUTTONS_YES_NO){
		var r= confirm(arg.content);
		res.result=r?MessageBox.BUTTON_YES:MessageBox.BUTTON_NO;
	}else{
		alert(arg.content); 
		res.result=MessageBox.BUTTON_OK;
	}
	__MessageBox_Callback(res); 
}

/*
function __ShowMessageBox(arg){
	console.log("ShowMessageBox",{
		title:arg.title
		,content:arg.content
		,flag:arg.flag
		,buttons:arg.buttons
		,callid:arg.callid
	});
	//调用回调
	__MessageBox_Callback({result:3,callid:arg.callid});
}
*/

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
	HOST = "http://"+host;
}

//通知APP已经启动成功
function NoticeAppReady(){
	//PhoneInterface.ready();
	BrowserReady();
}
//浏览器准备完毕后回调
function _BrowserReady(){
	BrowserReady();
}
//var HOST="http://192.168.31.92";
var HOST="http://192.168.31.107";
var Host_Page = "/config.do";
var Video_Page = "";
/*
function SendCommand(cmd, params, sync){
	var requstData={};
	var jsonData = (params && params!=undefined && params!=null)?{"cmd": cmd, "params": params}: {"cmd": cmd}
	var requstData = "";
	//alert(HOST+Host_Page);
	var _r= PhoneInterface.loadUrl(HOST+Host_Page+"?cmd="+cmd, jsonData);
	//alert("结果：" + _r);
	//var r = JSON.parse(_r);
	var r =  eval('(' + _r + ')');
	//alert(r.result);
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
*/
//发送数据

function SendCommand(cmd, params, sync){
	var requstData = {}; 
	var requestSync = sync && sync != null? sync: false;
	var jsonData = params && params != null? {"cmd": cmd, "params": JSON.stringify(params)}: {"cmd": cmd}
	$.ajax({
		type:"post",		
		url: "http://192.168.31.218:8080/cthCloud/getServer.aspx",
		cache: false, //禁用缓存
		dataType:'json',
		async: requestSync, //同步
		scriptCharset : 'utf-8', 
		data: jsonData,	
		error:function(){
			console.log("系统错误!");
		},
		success:function(r){
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
		}
	});
	
	//requstData= PhoneInterface.loadUrl('http://192.168.31.218:8080/cthCloud/uploadShotTaskLog.aspx');
	//requstData = JSON.parse(requstData);
	console.log("Request : " , cmd, params);
	console.log("Response : " , requstData);
	return requstData;
}
function _GetJSON(path , callback){
	$.getJSON(path,"",callback);
}