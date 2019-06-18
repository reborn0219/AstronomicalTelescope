// 导星相关
/**
 * 绘制散点图
 **/
function Guider(){
	this.Display="Scatter";
	this.RAColor=Color_Blue;
	this.DECColor=Color_Red;
	this.Datas=new Array(0);
	this.Count=0;			//点位总数
	this.TotalRAA=0;		//RA角度平均
	this.TotalDecA=0;		//DEC角度平均
	this.TotalRAP=0;		//RA像素平均
	this.TotalDecP=0;		//DEC像素平均
	this.DataGetterLine = 0;//导星数据获取定时器
	this.LastRqeuestID=0	//最后请求的ID
	this.LastMessage="";	//最后的信息
	
	this.rms_ra=0;			//RMS显示值
	this.rms_dec=0;
	this.rms_rap=0;
	this.rms_decp=0;
	this.rms_total=0;
	this.rms_totalp=0;
	//this.Deviation=0;	//数据偏移
	//向数组中添加元素，格式为{帧次，RA角度，DEC角度，RA像素，DEC像素，RA修正，DEC修正}
	Guider.prototype.PutData=function(data){
		this.Datas.push(data);
		//计算平均值
		//这种计算方式有问题，不在内部计算了，在外部计算好后传入
		if(this.Count==0){
			this.TotalRAA+=data[1];
			this.TotalDecA+=data[2];
			this.TotalRAP+=data[3];
			this.TotalDecP+=data[4];
		}else{
			this.TotalRAA+=data[1]/this.Count;
			this.TotalDecA+=data[2]/this.Count;
			this.TotalRAP+=data[3]/this.Count;
			this.TotalDecP+=data[4]/this.Count;
		}
		
		this.Count++;
		
		//只保留400组数据
		if(this.Datas.length>500)
		{
			this.Datas = this.Datas.slice(this.Datas.length-400);
			//this.Datas.splice(0,Datas.length-size);
		}
	}
	
	//清空数据
	Guider.prototype.Clear = function(){
		this.Datas=new Array(0);
		this.Count=0;			//点位总数
		this.TotalRAA=0;		//RA角度平均
		this.TotalDecA=0;		//DEC角度平均
		this.TotalRAP=0;		//RA像素平均
		this.TotalDecP=0;		//DEC像素平均
		this.DrawScatter();
		this.DrawLine();
	}
	
	//在画布上绘制散点图
	Guider.prototype.DrawScatter = function(){
		var C = this.ScatterCanvas;
		C.clearCanvas();
		var strokeWidth=2;
		for(var i=0 ; i<5 ; i++){
			C.drawArc({
				strokeStyle:Color_White
				,strokeWidth:strokeWidth
				,x:130,y:130
				,radius:32*i
			});	
		}
		
		C.drawLine({
			strokeStyle:Color_White
			,strokeWidth:strokeWidth
			,x1:130 , y1:0
			,x2:130 , y2:260
		})
		C.drawLine({
			strokeStyle:Color_White
			,strokeWidth:strokeWidth
			,x1:0 , y1:130
			,x2:260 , y2:130
		})
		//以下绘制点位绘制最后四百
		var PD;
		var LD
		if(this.Datas.length<=400){
			PD=this.Datas;
		}else{
			PD=this.Datas.slice(this.Datas.length-400);
		}
		for(i=0 ; i<PD.length ; i++){
			C.drawArc({
				fillStyle:i==PD.length-1?Color_Red: Color_Green
				,x:parseInt(PD[i][3]*130/4)+130
				,y:parseInt(PD[i][4]*130/4)+130
				,radius:i==PD.length-1?5:3
			});
		}
		if(PD!=undefined){
			LD=PD[PD.length-1];
		}
		LD=LD==undefined?[0,0,0,0,0,0,0]:LD;
		/*
		if(PD.length>0){
			C.drawLine({
				strokeStyle:Color_Red
				,strokeWidth:1
				,x1:130,y1:130
				,x2:parseInt(PD[PD.length-1][3]*130/4)+130,y2:parseInt(PD[PD.length-1][4]*130/4)+130
			});
		}
		*/
		//更改界面数值
		//console.log(this.TotalRAA,this.TotalRAP,this.TotalDecA,this.TotalDecP);
		//SetGuiderThumbnailDatas(this.TotalRAA,this.TotalRAP,this.TotalDecA,this.TotalDecP);
		//SetGuiderThumbnailDatas(LD[1],LD[3],LD[2],LD[4]);
		SetGuiderThumbnailDatas();
	};
	
	Guider.prototype.SetScatter = function(canvas){
		this.ScatterCanvas=canvas;
		this.ScatterCanvas.attr("width",260);
		this.ScatterCanvas.attr("height",260);
	};
	
	this.LineWidth=0;
	Guider.prototype.SetLine = function(canvas){
		this.LineCanvas = canvas;
		this.LineWidth = parseInt(this.LineCanvas.css("width").replace("px",""));
		this.LineCanvas.attr("width",this.LineWidth);
		this.LineCanvas.attr("height",260);
	};
	
	//绘制折线图
	Guider.prototype.DrawLine = function(){
		var C = this.LineCanvas;
		C.clearCanvas();
		
		var INE = 10;		//取值间隔，表示间隔多少像素绘制一个点
		var LS = (this.LineWidth-60)/INE;	//在界面中绘制多少个点
		var PD;
		var LD;
		if(this.Datas.length<=LS){
			PD=this.Datas;
		}else{
			PD=this.Datas.slice(this.Datas.length-LS);
		}
		if(PD!=undefined){
			LD=PD[PD.length-1];
		}
		LD=LD==undefined?[0,0,0,0,0,0,0]:LD;
		//console.log(this.LineWidth,LS,PD.length);
		
		//绘制横向虚线
		for(i=1 ; i<=4 ; i++){
			C.drawLine({
				strokeStyle:Color_White
				,strokeDash: [5]
				,strokeWidth:1
				,x1:40,y1:250-i*50
				,x2:this.LineWidth-20,y2:250-i*50
			});
		}
		//绘制竖线
		//这里需要计算一个偏移量
		/*
		size=200;
		for(i=size ; i<=this.LineWidth-40 ; i+=size){
			C.drawLine({
				strokeStyle:Color_White
				,strokeDash: [5]
				,strokeWidth:1
				,x1:40+i,y1:55
				,x2:40+i,y2:255
			});
		}
		*/
		//绘制数字
		for(var i=0 ; i<=4 ; i++){
			C.drawText({
				fillStyle:Color_White
				,fontSize:18
				,fontFamily:"微软雅黑"
				,x:20,y:50+i*50
				,text:(i-2)*2
			});
		}
		
		//绘制数据
		
		C.drawLine({
			strokeStyle:Color_Green
			,strokeWidth:2
			,x1:40,y1:150
			,x2:this.LineWidth-20,y2:150
		});
		//忘记绘制修正了，记得加上
		raj = {}; raj.strokeStyle=this.RAColor;raj.strokeWidth=3;
		decj = {};decj.strokeStyle=this.DECColor;decj.strokeWidth=3;
		for(i=0 ; i<PD.length ; i++){
			eval("raj.x"+(i+1)+"="+(40+i*INE));
			eval("raj.y"+(i+1)+"="+(150-(-parseFloat(PD[i][3])*25)));
			eval("decj.x"+(i+1)+"="+(40+i*INE));
			eval("decj.y"+(i+1)+"="+(150-(-parseFloat(PD[i][4])*25)));
			
			//绘制修正值
			/*
			if(PD[5]>0){
				//RA修正
				C.drawLine({
					strokeStyle:this.RAColor
					,strokeWidth:4
					,x1:40+i*INE,y1:150
					,x2:40+i*INE,y2:150+PD[5]
					,fromCenter: false
				});
			}
			if(PD[6]>0){
				//DEC修正
				C.drawLine({
					strokeStyle:this.DECColor
					,strokeWidth:4
					,x1:46+i*INE,y1:150
					,x2:46+i*INE,y2:150+PD[6]
					,fromCenter: false
				});
			}
			*/
		}
		
		C.drawLine(raj);
		C.drawLine(decj);
		
		C.drawLine({
			strokeStyle:Color_White
			,strokeWidth:2
			,x1:40,y1:5
			,x2:40,y2:255
			,x3:this.LineWidth-20,y3:255
		});
		
		//打印最后文字内容\
		var lmsg = this.LastMessage;
		var lcolor = Color_White;
		if(SystemParameters.guider!=undefined && SystemParameters.guider.status!=undefined){
			if(SystemParameters.guider.status=="stop"){
				lmsg=Langtext("guider.labels.lmsg_stoped");
				lcolor = Color_White;
			}else if(SystemParameters.guider.status=="error"){
				lmsg=Langtext("guider.labels.lmsg_error");
				lcolor = Color_Red;
			}else if(SystemParameters.guider.status=="calibration"){
				lmsg=Langtext("guider.labels.lmsg_calibration",this.LastMessage);
				lcolor = Color_Blue;
			}else{
				lmsg=this.LastMessage;
				lcolor = Color_Green;
			}
		}
		lmsg=lmsg.replace("&nbsp;"," ");
		C.drawText({
			fillStyle: lcolor
			,fontFamily:"微软雅黑"
			,fontSize:28			//20190527修改，增大字体
			,align: 'right'
			,respectAlign: true
			,text:lmsg
			,x:this.LineWidth-20,y:25
		});
		//console.log("LD",LD);
		if(this.Datas.length>0){
			d = this.Datas[this.Datas.length-1];
			C.drawText({
				fillStyle: this.RAColor
				,fontFamily:"微软雅黑"
				,fontSize:28		//20190527修改，增大字体
				,align: 'left'
				,respectAlign: true
				//,text:"RA:"+this.TotalRAA.toFixed(2)+"″("+Math.abs(this.TotalRAP.toFixed(2))+" PX)"
				,text:"RA:"+this.rms_ra.toFixed(2)+"″("+this.rms_rap.toFixed(2)+" PX)"
				,x:80,y:25
			});
			C.drawText({
				fillStyle: this.DECColor
				,fontFamily:"微软雅黑"
				,fontSize:28			//20190527修改，增大字体
				,align: 'left'
				,respectAlign: true
				//,text:"DEC:"+this.TotalDecA.toFixed(2)+"″("+Math.abs(this.TotalDecP.toFixed(2))+" PX)"
				,text:"DEC:"+this.rms_dec.toFixed(2)+"″("+this.rms_decp.toFixed(2)+" PX)"
				,x:350,y:25
			});
			C.drawText({
				fillStyle: Color_Green
				,fontFamily:"微软雅黑"
				,fontSize:28			//20190527修改，增大字体
				,align: 'left'
				,respectAlign: true
//				,text:Langtext("guider.labels.total") +" : "+Math.hypot(this.TotalRAA , this.TotalDecA).toFixed(2)+"″("+Math.hypot(this.TotalRAP , this.TotalDecP).toFixed(2)+" PX)"
				,text:Langtext("guider.labels.total") +":"+this.rms_total.toFixed(2)+"″("+this.rms_totalp.toFixed(2)+" PX)"
				,x:640,y:25
			});
		}
	};
	
	//重绘	
	Guider.prototype.Repaint = function(){
		GuiderObj.DrawScatter();
		GuiderObj.DrawLine();
	}	

	//启动导星
	Guider.prototype.Start = function(){
		//处于停止状态，开启导星，并启动导星监控线程
		if(SystemParameters.guider==undefined){
			SystemParameters.guider={};
		}
		
		$(".GuiderControllerButton").html(Langtext("guider.labels.stop"));
		$(".GuiderControllerButton").css("background-color","var(--Color_Red)");
		$(".GuiderControllerButton").attr("status","calibration");
		console.log("DDDDD",SystemParameters.guider);
		SystemParameters.guider.status="start";
		GuiderObj.LastRqeuestID=0;
		setTimeout(function(){__StartGuider();},0);
		if(GuiderObj.DataGetterLine!=0){clearInterval(GuiderObj.DataGetterLine);}
		GuiderObj.DataGetterLine = setInterval(GuiderObj.DataGetter,1000);
		
	}
	
	Guider.prototype.DataGetter=function(){
		//*20190521异步修改*/
		__A__GetLastGuiderPoint(GuiderObj.LastRqeuestID,UpdateGuiderStatus);
	}
	
	//停止导星
	Guider.prototype.Stop = function(){
		__StopGuider();
		SystemParameters.guider.status="stop";
		$(".GuiderControllerButton").attr("status","stop");
		$(".GuiderControllerButton").html(Langtext("guider.labels.start"));
		$(".GuiderControllerButton").css("background-color","var(--Color_Green)");
		if(GuiderObj.DataGetterLine!=0){clearInterval(GuiderObj.DataGetterLine);}
		GuiderObj.LastRqeuestID=0;
	}
}


//设置导星缩略图信息
function SetGuiderThumbnailDatas(){
	$("#GT_RA_Angle").html(GuiderObj.rms_ra.toFixed(2)+"″");
	$("#GT_RA_Pixel").html(GuiderObj.rms_rap.toFixed(2)+" PX");
	$("#GT_DEC_Angle").html(GuiderObj.rms_dec.toFixed(2)+"″");
	$("#GT_DEC_Pixel").html(GuiderObj.rms_decp.toFixed(2)+" PX");
//	$("#GT_Total_Angle").html(Math.hypot(rms_ra , rms_dec).toFixed(2)+"″");
	$("#GT_Total_Angle").html(GuiderObj.rms_total.toFixed(2)+"″");
}

var GuiderThred;
function StartGuiderRepaint(){
	GuiderObj.Repaint();
	GuiderThred = setInterval(GuiderObj.Repaint,1000);
}

function StopGuiderRepaint(){
	clearInterval(GuiderThred);
}

//初始化导星，如果正在导星，则继续显示
function InitGuiderContent(){
	$(".GuiderControllerButton").html(Langtext("guider.labels.start"));
	$(".GuiderControllerButton").css("background-color","var(--Color_Green)");
	
	if(SystemParameters.guider!=undefined && SystemParameters.guider.status!=undefined){
		//console.log("导星状态：" , SystemParameters.guider.status);
		$(".GuiderControllerButton").attr("status",SystemParameters.guider.status);
		//console.log("导星初始化",SystemParameters.guider);
		if(SystemParameters.guider.status=="stop" || SystemParameters.guider.status=="idle"){
			$(".GuiderControllerButton").html(Langtext("guider.labels.start"));
			$(".GuiderControllerButton").css("background-color","var(--Color_Green)");
		}else{
			__InitGoGuider();
		}
	}
}

function UpdateGuiderStatus(_r){
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
	var res=requstData;
	//console.log("Guider_RES",res);
	if(res.data!=undefined){
		var last = res.data.length-1;
		if(res.data[last].type!=undefined){
			GuiderObj.LastMessage=res.data[last].runinfo;
			$(".GuiderControllerButton").html(Langtext("guider.labels.stop"));
			$(".GuiderControllerButton").css("background-color","var(--Color_Red)");
			GuiderObj.LastRqeuestID=res.data[last].id;
			if(res.data[last].type==1){
				SystemParameters.guider.status="guide";
				$(".GuiderControllerButton").attr("status","guide");
				$(res.data).each(function(i,e){
					try{
						var graph = e.graph;
						if(e.type==1){
							GuiderObj.PutData(new Array(graph.id,graph.ra,graph.dec,graph.rap,graph.decp,graph.rac,graph.decc));
						}
					}catch(err){
						console.error(err);
					}
				});

				//页面显示内容值
				if(res.data[last].stats!=undefined){
					var r_s=res.data[last].stats;
					GuiderObj.rms_ra=parseFloat(r_s.rmsraarcs);
					GuiderObj.rms_dec=parseFloat(r_s.rmsdecarcs);
					GuiderObj.rms_rap=parseFloat(r_s.rmsra);
					GuiderObj.rms_decp=parseFloat(r_s.rmsdec);
					GuiderObj.rms_total=parseFloat(r_s.rmstotalarcs);
					GuiderObj.rms_totalp=parseFloat(r_s.rmstotal);
				}

			}else if(res.data[last].type==0){
				SystemParameters.guider.status="calibration";
				$(".GuiderControllerButton").attr("status","calibration");
			}else if(res.data[last].type==-1){
				SystemParameters.guider.status="stop";
				//出现错误，错误后停止导星
				GuiderObj.Stop();
				//Alert("导星错误，导星停止，原因 : " + GuiderObj.LastMessage);
				MessageBox.Show({
					//title:"导星错误"
					title:Langtext("guider.alert.guider_error_title")
					,flag:MessageBox.FLAG_INFORMATION
					//,content:"导星出现错误，导星停止，原因 : " + GuiderObj.LastMessage
					,content:Langtext("guider.alert.guider_error")
				});
			}
		}else{
			//没有在导星
			GuiderObj.Stop();
		}
	}
}

//导星是否处于运行状态，只要不是stop或者idel就属于运行状态
function GuiderIsRun(){
	return !($(".GuiderControllerButton").attr("status")=="stop"||$(".GuiderControllerButton").attr("status")=="idle");
}
//初始化开始导星
function __InitGoGuider(){
	$(".GuiderControllerButton").html(Langtext("guider.labels.stop"));
		$(".GuiderControllerButton").css("background-color","var(--Color_Red)");
		//设置导星刷新
		GuiderObj.LastRqeuestID=0;
		if(GuiderObj.DataGetterLine!=0){clearInterval(GuiderObj.DataGetterLine);}
		GuiderObj.DataGetterLine = setInterval(GuiderObj.DataGetter,1000);
}

//导星初始化
function InitGuider(){
	$(".ClearButton").click(function(){GuiderObj.Clear()});
	
	//单击开始或结束导星按钮
	$(".GuiderControllerButton").click(function(){
		//console.log("导星",SystemParameters.guider.status);
		if(SystemParameters.guider!=undefined && SystemParameters.guider.status!=undefined){
			if(SystemParameters.guider.status=="stop" || SystemParameters.guider.status=="idle"){
				if(SystemParameters.devices.mount!=undefined & SystemParameters.devices.camera_g!=undefined){
					GuiderObj.Start();
				}else{
					MessageBox.Show({
						title:Langtext("guider.alert.guider_error_title")
						,content:Langtext("guider.alert.devices_does_not_exist")
					});
				}
			}else{
				//处于导星或校准状态
				
				MessageBox.Show({
					//title:"停止导星"
					title:Langtext("guider.alert.guider_stop_title")
					//,content:"是否停止导星？"
					,content:Langtext("guider.alert.guider_stop")
					,flag:MessageBox.FLAG_QUERY
					,buttons:MessageBox.BUTTONS_YES_NO
					,callback:function(res){
						if(res.result==MessageBox.BUTTON_YES){
							GuiderObj.Stop();
						}
					}
				});
			}
		}else{
			//没有开始导星
			//console.log("开启导星");
			GuiderObj.Start();
		}
	});
	
	//开始导星数据绘图
	GuiderObj=new Guider();
	GuiderObj.SetScatter($("#ScatterCanvas"));
	GuiderObj.SetLine($("#LineCanvas"));
	StartGuiderRepaint();
}