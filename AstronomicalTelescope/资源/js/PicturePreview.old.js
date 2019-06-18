// 图片预览部分

//预览图片
var _PreviewZoom_TouchStart;
var _Preview_NowPicture;
//调出预览图像窗口
//cbtn表示是否显示校准按钮，如果显示可以单击调出校准窗口
function Preview(pic ,cbtn=false){
	$(".Preview_Picture").css("background-image","");
	//是否显示校准按钮
	if(cbtn){
		$(".Preview_Calibration").removeClass("Hide");
	}else{
		$(".Preview_Calibration").addClass("Hide");
	}
	
	_Preview_NowPicture=pic;
	$(".PicturePreviewForm").attr("file",pic.id);
	$(".PicturePreviewForm").removeClass("Hide");
	$(".Preview_Picture").css("width","100%");
	$(".Preview_Picture").css("height","100%");
	var cw = document.body.clientWidth;
	var pw = parseInt($(".Preview_Picture").css("width").replace("px"));
	var ph = parseInt($(".Preview_Picture").css("height").replace("px"));	
	
	Preview_Replay();
}

//重新设置图像
function Preview_Replay(){
	$(".Preview_PictureLoading").removeClass("Hide");
	//var imgs = ["http://192.168.31.92:8080/config.do?cmd=cameraImagePreview&params={file:"+_Preview_NowPicture.id+"type:"+camera+",t:"+Math.random()+"}"];
	var imgs = [HOST+_Preview_NowPicture.url];
	$.imgpreload(imgs,{
		each:function(data){
		},
		all:function(){
			//加载完成
			$(".Preview_Picture").css("background-image","url("+imgs[0]+")");
			$(".Preview_PictureLoading").addClass("Hide");
		}
	});
	
	//$(".Preview_Picture").css("background-image","url("+_Preview_NowPicture.url+")");
	DrawPreviewHistogram();
}

function DrawPreviewHistogram(){
	//_Preview_NowPicture.histogram.datas=_Preview_NowPicture.histogram.data;//修正赵立彦的错误
	//修正全0错误
	if(_Preview_NowPicture.histogram.white==0 && _Preview_NowPicture.histogram.black==0){
		_Preview_NowPicture.histogram.white=255;
	}
	var C = $(".HistogramBlock").find("canvas");
	var w = $(".HistogramBlock").css("width").replace("px","");
	C.attr("width",w+"px");
	C.attr("height","360px");
	//绘制数据
	var wp=(w-200)/256;//每列数值对应的像素，左右留边
	var wp2=(w-200)/256
	//_Preview_NowPicture.histogram.datas.length
	var max = _Preview_NowPicture.histogram.max*1.2;
	var hp=250/max;//每行数值对应的像素
	//划线
	for(i=0;i<256 ; i++){
		//y2=hp*(max-_Preview_NowPicture.histogram.datas[i]);
		var d = Math.log(_Preview_NowPicture.histogram.datas[i]);					
		d = d -1;
		d = d<0 ? 0 : d;
		//e.gc.drawLine(i + 10, H, i + 10, (int) Math.round(H - (d * H / Math.log10(max))));
		//y2=hp*(max-_Preview_NowPicture.histogram.datas[i]);
		
		y2= 250 - (d * 250 /Math.log(max));
		C.drawLine({
			strokeStyle:(i>=_Preview_NowPicture.histogram.black && i<=_Preview_NowPicture.histogram.white?Color_White:"#878787")
			,strokeWidth:wp*1.1		//1.1是为了消除黑边
			,x1:100+i*wp,y1:250
			,x2:100+i*wp,y2:y2
		});
	}
	//加控制线
	C.drawLine({
		strokeStyle:Color_Green
		,strokeWidth:15		//1.1是为了消除黑边
		,rounded: true
		,x1:100,y1:305
		,x2:w-100,y2:305
	});
	
	
	//已经走过的线
	C.drawLine({
		strokeStyle:Color_Black
		,strokeWidth:15	
		,rounded: true
		,x1:100,y1:305
		,x2:100+_Preview_NowPicture.histogram.black*wp2,y2:305
	});
	C.drawLine({
		strokeStyle:Color_White
		,strokeWidth:15	
		,rounded: true
		,x1:w-100,y1:305
		,x2:100+_Preview_NowPicture.histogram.white*wp2,y2:305
	});
	
	//画控制点
	C.drawEllipse({
		fillStyle:Color_Black
		,strokeStyle:Color_White
		,strokeWidth:2
		,x:100+_Preview_NowPicture.histogram.black*wp2
		,y:305
		,width:50,height:50
	});
	
	C.drawEllipse({
		fillStyle:Color_White
		,x:100+_Preview_NowPicture.histogram.white*wp2
		,strokeStyle:Color_White
		,strokeWidth:2
		,y:305
		,width:50,height:50
	});
}

var Preview_Down={type:0,x:0,y:0}
/*
function Preview_Test(txt){
	v = $(".Picture_Test").html();
	v = v+"<br />" +txt;
	$(".Picture_Test").html(v);
	var scrollHeight = $('.Picture_Test').prop("scrollHeight");
  	$('.Picture_Test').animate({scrollTop:scrollHeight}, 10);	//动画效果
}
*/
//当鼠标按下的时候
function Preview_MouseDown(e){
	e.stopPropagation();
	/*计算当前位置是否为黑场位置（周边扩大到100*100）或白场位置*/
	var w = $(".HistogramBlock").css("width").replace("px","");
	var wp2=(w-200)/256;
	/*
	var x=e.offsetX/APPZoom;			
	var y=e.offsetY/APPZoom;	//手机触摸事件中这个数据是错误的
	*/
	var x=e.touches[0].clientX-parseInt($(".HistogramBlock").css("left").replace("px",""));
	//var y=e.touches[0].clientY-parseInt($(".HistogramBlock").css("top").replace("px",""));
	//Preview_Test($(".HistogramBlock").css("left") +" , " + $(".HistogramBlock").css("top"));
	//Preview_Test(e.touches[0].clientX +" , " + e.touches[0].clientY);
	x=x/APPZoom;
	//y=y/APPZoom;//除APPZoom为真实位置
	/*
	console.log(e.offsetX,e.offsetY);
	console.log(x,y);
	*/
	
	var _b = 100+_Preview_NowPicture.histogram.black*wp2;
	var _w = 100+_Preview_NowPicture.histogram.white*wp2;
	Preview_Down.type=0;
	
	//测试绘制
	/*
	var C = $(".HistogramBlock").find("canvas");
	C.drawRect({
		strokeStyle:Color_White
		,strokeWidth:2
		,x:x,y:y
		,width:100,height:100
	});
	*/
	//if(y>=100 && y<=360){
		if(x>=_b-100 && x<=_b+100){
			//黑场
			Preview_Down.type=1;
		}else if(x>=_w-100 && x<=_w+100){
			//白场
			Preview_Down.type=2;
		}
	//}
	//Preview_Test(Preview_Down.type +" , " +x +" , " + y);
	//console.log(Preview_Down.type);
}
function Preview_MouseUp(e){
	//Preview_Test("Preview_MouseUp");
	e.stopPropagation();
	Preview_Down.type=0;
	//重新请求绘制直方图的新图像
	
	_Preview_NowPicture=__GetImage(_Preview_NowPicture.type,_Preview_NowPicture.id,{
		black:_Preview_NowPicture.histogram.black
		,white:_Preview_NowPicture.histogram.white
	});
	Preview_Replay();
}
function Preview_MouseMove(e){
	//Preview_Test("Preview_MouseMove");
	/*
	if(Preview_Down.type==0){
		Preview_MouseDown(e);
	}*/
	e.stopPropagation();
	if(Preview_Down.type!=0){
		//设置黑白场
		/*
		var x=e.offsetX/APPZoom;	//除APPZoom为真实位置
		var y=e.offsetY/APPZoom;
		*/
		var x=e.touches[0].clientX-parseInt($(".HistogramBlock").css("left").replace("px",""));
		//var y=e.touches[0].clientY-parseInt($(".HistogramBlock").css("top").replace("px",""));
		x=x/APPZoom;
		//y=y/APPZoom;//除APPZoom为真实位置
		var w = $(".HistogramBlock").css("width").replace("px","");
		var wp2=(w-200)/256;
		if(Preview_Down.type==1){
			//黑场计算，不能大于白场
			var _b = (x-100)/wp2;
			//修正_b
			if(_b<=_Preview_NowPicture.histogram.white && _b>=0){
				_Preview_NowPicture.histogram.black=_b;
			}
		}else if(Preview_Down.type==2){
			//白场，不能大于黑场
			var _w= (x-100)/wp2;
			if(_w>=_Preview_NowPicture.histogram.black && _w<=255){
				_Preview_NowPicture.histogram.white=_w;
			}
		}
		//重新绘图
		DrawPreviewHistogram();
	}
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
					__RemoveFiles(_Preview_NowPicture.type,_Preview_NowPicture.id);
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
	
	/*
	$(".HistogramBlock").find("canvas").mousedown(Preview_MouseDown);
	$(".HistogramBlock").find("canvas").mousemove(Preview_MouseMove);
	$(".HistogramBlock").find("canvas").mouseup(Preview_MouseUp);
	*/
	$(".HistogramBlock").on("touchstart",Preview_MouseDown);
	$(".HistogramBlock").on("touchmove",Preview_MouseMove);
	$(".HistogramBlock").on("touchend",Preview_MouseUp);
	
	/*
	//手指放在图片上
	$(".Preview_Picture").on("touchstart",function(e){
		console.log("touchstart",e.touches[0]);
		if(e.touches.length==1){
			var one = e.touches[0];
			_PreviewZoom_TouchStart={
				x:one.clientX
				,y:one.clientY
			}
		}
		//_PreviewZoom_TouchStart=
	});
	//手指离开图片
	$(".Preview_Picture").on("touchend",function(e){
		//console.log("touchend",e);
	});
	
	//手指在图片上移动
	$(".Preview_Picture").on("touchmove",function(e){
		//console.log("touchmove",e);
		mx = e.offsetX;
		my = e.offsetY;
		//计算开始点与当前点之间的距离，并向相等位置移动图片的left和top
		ntop = parseInt($(".Preview_Picture").css("top").replace("px",""));
		nleft = parseInt($(".Preview_Picture").css("left").replace("px",""));
		$(".Preview_Picture").css("left",nleft-(_PreviewZoom_TouchStart.x-mx));
		$(".Preview_Picture").css("top",ntop-(_PreviewZoom_TouchStart.y-my));
		console.log(_PreviewZoom_TouchStart.x-mx,_PreviewZoom_TouchStart.y-my);
		//console.log(mx,my);
		_PreviewZoom_TouchStart={
			x:mx
			,y:my
		}
	});
	*/
}