// 图片预览部分
//预览图片
var _PreviewZoom_TouchStart;
var _Preview_NowPicture;
var _Preview_Histogram=new Array(4);		//直方图数据
var _Preview_ImageData;						//图像原始数据
var _Preview_Histogram_Line=undefined;		//直方图线
var _Preview_Width=0;
var _Preview_Height=0;
var _Preview_Black=0;
var _Preview_White=255;
var _Preview_Reverse=false;					//是否反向


function InitPreview_Width(){
	if(_Preview_Width>0)return;
	_Preview_Width = document.body.scrollWidth/APPZoom;
	_Preview_Height = document.body.scrollHeight/APPZoom;
	_Preview_Height= _Preview_Height==0?window.screen.height/APPZoom:_Preview_Height;
}
//调出预览图像窗口
//cbtn表示是否显示校准按钮，如果显示可以单击调出校准窗口
function Preview(pic ,cbtn){
	cbtn=cbtn==undefined?false:cbtn;
	//初始化参数
	_Preview_Histogram = new Array(4);
	_Preview_Histogram_Line=undefined;
	_Preview_Black=0;
	_Preview_White=255;
	_Preview_Reverse=false
	InitPreview_Width();
	$(".Preview_Picture").css("background-image","");
	//是否显示校准按钮
	if(cbtn){
		$(".Preview_Calibration").removeClass("Hide");
	}else{
		$(".Preview_Calibration").addClass("Hide");
	}
	var C = $("#Preview_Canvas");
//	_Preview_Width = window.screen.width;
//	_Preview_Height = window.screen.height;
	
	console.log(_Preview_Width,_Preview_Height);
//	alert(document.body.clientWidth +" , " + document.body.clientHeight);
//	alert(document.body.offsetWidth +" , " + document.body.offsetHeight);
//	alert(document.body.scrollWidth +" , " + document.body.scrollHeight);
//	alert(window.screen.width +" , " + window.screen.height);
//	alert(window.screen.availWidth +" , " + window.screen.availHeight);
	
	C.attr("width",_Preview_Width);
	C.attr("height",_Preview_Height);
	_Preview_NowPicture=pic;
	console.log(pic);
	$(".PicturePreviewForm").attr("file",pic.fileid);
	$(".PicturePreviewForm").removeClass("Hide");
	$(".Preview_Picture").css("width","100%");
	$(".Preview_Picture").css("height","100%");
	var cw = document.body.clientWidth;
	var pw = parseInt($(".Preview_Picture").css("width").replace("px"));
	var ph = parseInt($(".Preview_Picture").css("height").replace("px"));	
	Preview_InitData();
}

function Preview_InitData(){
	var C = $("#Preview_Canvas");
	C.clearCanvas();
	C.drawRect({
		fillStyle: '#666',
		x:_Preview_Width/2,
		y:_Preview_Height/2,
		width: 400,
		height: 100,
		cornerRadius: 10
	});
	C.drawText({
		fillStyle:"#FFF",
		x:_Preview_Width/2,
		y:_Preview_Height/2,
		fontSize:40,
		fontFamily:"微软雅黑",
		text:Langtext("picturepreview.loading_title")
	});
	//console.log(HOST+_Preview_NowPicture.image);
	
	var img = new Image();
	//img.src=HOST+_Preview_NowPicture.image;	
	//alert("P_E"+ img.src);
	img.crossOrigin=""; // "" 等价于Anonymous
	img.onload=function(){
		var c = document.getElementById("Preview_Canvas");
		var ctx=c.getContext("2d");
		ctx.drawImage(img,0,0,_Preview_Width,_Preview_Height);
		_Preview_ImageData = ctx.getImageData(0,0,_Preview_Width,_Preview_Height);	//获得图像数据
		var _rd=_Preview_ImageData.data;
		
		//取直方图
		if(_Preview_NowPicture.color==undefined || _Preview_NowPicture.color=="M"){
			//单色
			var his=new Array(257);//最后一位是最大值
			InitArray(his,0);
			for(var i=0 ; i<_rd.length;i+=4){
				if(_rd[i+3]>0){
					his[_rd[i]]+=1;
					his[256] = his[256]<his[_rd[i]]?his[_rd[i]]:his[256];
				}
			}
			_Preview_Histogram[0]=his;
			console.log("获得直方图成功" + his[256]);
		}else{
			//彩色
			var his=new Array(256);InitArray(his,0);
			var hisr=new Array(256);InitArray(hisr,0);
			var hisg=new Array(256);InitArray(hisg,0);
			var hisb=new Array(256);InitArray(hisb,0);
			for(var i=0 ; i<_rd.lenght;i+=4){
				if(_rd[i+3]>0){
					var t = (_rd[i]+_rd[i+1]+_rd[i+2])/3;
					his[t]+=1;his[256] = his[256]<his[_rd[i]]?his[_rd[i]]:his[256];
					hisr[_rd[i]]+=1;hisr[256] = hisr[256]<hisr[_rd[i]]?hisr[_rd[i]]:hisg[256];
					hisg[_rd[i+1]]+=1;hisg[256] = hisg[256]<hisg[_rd[i+1]]?hisg[_rd[i+1]]:hisg[256];
					hisb[_rd[i+2]]+=1;hisb[256] = hisb[256]<hisb[_rd[i+2]]?hisb[_rd[i+2]]:hisb[256];
				}
			}
			_Preview_Histogram[0]=his;
			_Preview_Histogram[1]=hisr;
			_Preview_Histogram[2]=hisg;
			_Preview_Histogram[3]=hisb;			
		}
		DrawPreviewHistogram();//绘制一次直方图
	}
	img.src=HOST+_Preview_NowPicture.image;	
}
//重新设置图像
function Preview_Replay(){
	//用原来的数据对0-255色阶进行重构
	var _rd=_Preview_ImageData.data;
	var c = document.getElementById("Preview_Canvas");
	var ctx=c.getContext("2d");
	var imgData=ctx.getImageData(0,0,_Preview_Width,_Preview_Height);
	if(_Preview_NowPicture.color==undefined || _Preview_NowPicture.color=="M"){
		//单色
		var pv = _Preview_White-_Preview_Black;
		pv = pv<=0?1:pv;
		var pva = 255/pv;
		for(var i=0 ; i<_rd.length;i+=4){
			if(_rd[i+3]>0){
				//不透明的部分
				var v = (_rd[i]+_rd[i+1]+_rd[i+2])/3;
				if(v<=_Preview_Black){
					v=0;
				}else if(v>=_Preview_White){
					v=255;
				}else{
					//平分0-255
					v=(v-_Preview_Black)*pva;
				}
				imgData.data[i+3]=_rd[i+3];
				if(_Preview_Reverse){
					v=255-v;
				}
				imgData.data[i]=v;
				imgData.data[i+1]=v;
				imgData.data[i+2]=v;
			}
		}
	}else{
		//彩色
	}
	ctx.putImageData(imgData,0,0);
}

function DrawPreviewHistogram(e){
	var _PW=_Preview_White,_PB=_Preview_Black;
	if(e!=undefined){
		/*计算当前位置是否为黑场位置（周边扩大到100*100）或白场位置*/
		var w = $(".HistogramBlock").css("width").replace("px","");
		var wp2=(w-20)/256;
		var x=(e.touches[0].clientX-parseInt($(".HistogramBlock").css("left").replace("px","")))/APPZoom;
		//距离底部50像素
		var y=(e.touches[0].clientY)/APPZoom-_Preview_Height+410;
		//console.log(e);
	//	alert(e.touches[0].clientX +" , "+ e.touches[0].clientY);
	//	alert((e.touches[0].clientX/APPZoom) +" , "+ (e.touches[0].clientY/APPZoom));
	//	alert(x+" , "+ y);
		if(y>=100 && y<=225){
			//黑场
			_PB=x/wp2
			_PB=_PB>_Preview_White?_Preview_White:_PB;
			_PB=_PB<0?0:_PB;
		}else if(y>225 && y<=360){
			//白场
			_PW=x/wp2
			_PW=_PW<_Preview_Black?_Preview_Black:_PW;
			_PW=_PW>255?255:_PW;
		}
	}
	//_Preview_NowPicture.histogram.datas=_Preview_NowPicture.histogram.data;//修正赵立彦的错误
	var C = $(".HistogramBlock").find("canvas");
	var w = $(".HistogramBlock").css("width").replace("px","");
	C.attr("width",w+"px");
	C.attr("height","360px");
	//绘制数据
	var wp=(w-20)/256;//每列数值对应的像素，左右留边
	var wp2=(w-20)/256
	C.drawRect({
		strokeStyle:"#555",
		strokeWidth:2,
		x:10,y:100,
		width:255*wp,
		height:250,
		fromCenter: false
	});
	//_Preview_NowPicture.histogram.datas.length
	if(_Preview_NowPicture.color==undefined || _Preview_NowPicture.color=="M"){
		//单色
		var his = _Preview_Histogram[0];
		var max = his[256]*1.2;
		var hp=250/max;//每行数值对应的像素
		//划线
		var t;
		if(_Preview_Histogram_Line==undefined){
			t={strokeWidth:2,strokeStyle:"#FFF"};
			var _runs="";
			for(i=0;i<256 ; i++){
				//y2=hp*(max-_Preview_NowPicture.histogram.datas[i]);
				var d = Math.log(his[i]);					
				d = d -1;
				d = d<0 ? 0 : d;
				y2= 350 - (d * 250 /Math.log(max));
				//eval("t.x"+(i+1)+"="+(10+i*wp));
				//eval("t.y"+(i+1)+"="+y2);
				_runs +="t.x"+(i+1)+"="+(10+i*wp)+"; t.y"+(i+1)+"="+y2+";";

			}
			eval(_runs);
			_Preview_Histogram_Line=t;
		}else{
			t=_Preview_Histogram_Line;
		}
	}
	C.drawLine(t);
	if(_PB>=0){
		//黑场覆盖
		C.drawRect({
			fillStyle:"rgba(0,0,0,.7)",
			x:10,y:100,
			width:wp*_PB,
			height:250,
			fromCenter: false
		});
	}
	if(_PW<=255){
		//白场覆盖
		C.drawRect({
			fillStyle:"rgba(255,255,255,.7)",
			x:10+wp*_PW,y:100,
			width:wp*(255-_PW),
			height:250,
			fromCenter: false
		});
	}
	
	C.drawPolygon({
		fillStyle:"#000",
		strokeStyle:"#FFF",
		strokeWidth: 2,
		radius: 20,
		rotate: 180,
  		sides: 3,
		x:10+wp*_PB,
		y:110
	});
	C.drawPolygon({
		fillStyle:"#FFF",
		strokeStyle:"#FFF",
		strokeWidth: 2,
		radius: 20,
		rotate: 0,
  		sides: 3,
		x:10+wp*_PW,
		y:340
	});
	//打印黑白场
	C.drawText({
		fillStyle:"#FFF",
		x:150,
		y:40,
		fontSize:30,
		text:"Black : "+ parseInt(_PB),
		fromCenter: false
	});
	C.drawText({
		fillStyle:"#FFF",
		x:350,
		y:40,
		fontSize:30,
		text:"White : " + parseInt(_PW),
		fromCenter: false
	});
	
	//绘制反向图标
	if(_Preview_Reverse){
		//白场为底
		C.drawRect({
			fillStyle:"#000",
			strokeStyle:"#FFF",
			strokeWidth: 2,
			x:20,y:20,
			width:40,
			height:40,
			fromCenter: false
		});
		C.drawRect({
			fillStyle:"#FFF",
			strokeStyle:"#FFF",
			strokeWidth: 2,
			x:40,y:40,
			width:40,
			height:40,
			fromCenter: false
		});
	}else{
		//黑场为底
		C.drawRect({
			fillStyle:"#FFF",
			strokeStyle:"#FFF",
			strokeWidth: 2,
			x:40,y:40,
			width:40,
			height:40,
			fromCenter: false
		});
		C.drawRect({
			fillStyle:"#000",
			strokeStyle:"#FFF",
			strokeWidth: 2,
			x:20,y:20,
			width:40,
			height:40,
			fromCenter: false
		});
	}
}

var ppx=0 ,ppy=0;
function PMV(e){
	/*
	首先确定是黑场还是白场
	然后将相应的黑白场位置调整到单击位置
	然后重绘直方图
	重绘图像数据
	*/
	e.stopPropagation();
	/*计算当前位置是否为黑场位置（周边扩大到100*100）或白场位置*/
	var w = $(".HistogramBlock").css("width").replace("px","");
	var wp2=(w-20)/256;
	var x=(e.touches[0].clientX-parseInt($(".HistogramBlock").css("left").replace("px","")))/APPZoom;
	//距离底部50像素
	var y=(e.touches[0].clientY)/APPZoom-_Preview_Height+410;
	//console.log(e);
//	alert(e.touches[0].clientX +" , "+ e.touches[0].clientY);
//	alert((e.touches[0].clientX/APPZoom) +" , "+ (e.touches[0].clientY/APPZoom));
//	alert(x+" , "+ y);
	if(y>=100 && y<=225){
		//黑场
		_Preview_Black=x/wp2
		_Preview_Black=_Preview_Black>_Preview_White?_Preview_White:_Preview_Black;
		_Preview_Black=_Preview_Black<0?0:_Preview_Black;
	}else if(y>225 && y<=360){
		//白场
		_Preview_White=x/wp2
		_Preview_White=_Preview_White<_Preview_Black?_Preview_Black:_Preview_White;
		_Preview_White=_Preview_White>255?255:_Preview_White;
	}else{
		if(y>=0 && y<=100 && x>=0 && x<=100){
			_Preview_Reverse=!_Preview_Reverse;
		}
	}
	DrawPreviewHistogram();
//	console.time("Preview_Replay");
//	Preview_Replay();
//	console.timeEnd("Preview_Replay");
}
//当鼠标按下的时候
function Preview_MouseDown(e){
	PMV(e);
}


function Preview_MouseUp(e){
	//PMV(e);
	Preview_Replay();
}
function Preview_MouseMove(e){
	PMV(e);
	//DrawPreviewHistogram(e);
}

//初始化缩略图方法
function InitPreview(){
	//图片预览的关闭按钮
	$("#PicturePreviewFormCloseButton").click(function(){
		event.stopPropagation();
		$(".PicturePreviewForm").addClass("Hide");
		$(".PicturePreviewForm").removeAttr("file");
	});
	//直方图按钮
	$(".Preview_Histogram").click(function(){
		$(".HistogramBlock").removeClass("Hide");
	});
	
	//校准按钮
	$(".Preview_Calibration").click(function(){
		$(".CalibrationForm").removeClass("Hide");
		StartCalibration();
	});
	
	//保存到手机按钮
	$(".Preview_SaveToPhone").click(function(){
		
	});
	
	//删除图片按钮
	$(".Preview_Remove").click(function(){
		MessageBox.Show({
			//title:"删除确认"
			//,content:"确定要删除这张照片吗？"
			title:Langtext("picturepreview.alert.del_title")
			,content:Langtext("picturepreview.alert.delfile_msg")
			,flag:MessageBox.FLAG_QUERY
			,buttons:MessageBox.BUTTONS_YES_NO
			,callback:function(res){
				if(res.result==MessageBox.BUTTON_YES){
					var fs = new Array(1);
					fs[0]=_Preview_NowPicture.fileid;
					__RemoveFiles(_Preview_NowPicture.fitdirectoryid,fs);
					//隐藏
					$(".PicturePreviewForm").addClass("Hide");
					$(".PicturePreviewForm").removeAttr("file");
				}
			}
		});
	});
	
	$(".Preview_Enlarge").click(function(){
		//增大
		s=parseInt($(".Preview_Picture").css("width").replace("%",""));
		s=s/1920*100;
		s+=20;
		s=s>200?200:s;
		$(".Preview_Picture").css("width",s+"%");
		$(".Preview_Picture").css("height",s+"%");
	});
	$(".Preview_Narrow").click(function(){
		//缩小
		s=parseInt($(".Preview_Picture").css("width").replace("%",""));
		s=s/1920*100;
		s-=20;
		s=s<100?100:s;
		$(".Preview_Picture").css("width",s+"%");
		$(".Preview_Picture").css("height",s+"%");
	});
	$("#HistogramBlockCloseButton").click(function(){
		$(".HistogramBlock").addClass("Hide");
	});
	$(".HistogramBlock").on("touchstart",Preview_MouseDown);
	$(".HistogramBlock").on("touchmove",Preview_MouseMove);
	$(".HistogramBlock").on("touchend",Preview_MouseUp);
	$(".HistogramBlock").on("touchcancel",Preview_MouseUp);
}