// 工具

//构造一个Checkbox
function bulidCheckbox(div , checked){
	checked=checked==undefined?"false":checked;
	var d=$(div);
	d.addClass("TaskLeft_Check");
	d.attr("enabled","true");
	if(checked=="true"){
		d.attr("checked",true);
	}
	d.click(function(){
		if($(this).attr("enabled")=="true"){
			$(this).attr("checked" , !$(this).attr("checked"));
			//$(this).attr("checked" , $(this).attr("checked")=="true"?"false","true");
		}
	});
}

function bulidSwitchbox(div , checked){
	checked=checked==undefined?"false":checked;
	var d=$(div);
	d.addClass("DispalySwitch");
	d.attr("enabled","true");
	if(checked=="true"){
		d.attr("checked",true);
	}
	d.click(function(){
		if($(this).attr("enabled")=="true"){
			$(this).attr("checked" , !$(this).attr("checked"));
			//$(this).attr("checked" , $(this).attr("checked")=="true"?"false","true");
		}
	});
}


function InitTools(){
	$(".TaskLeft_Check").each(function(i,e){
		bulidCheckbox(e);
	});
	
	$(".DispalySwitch").each(function(i,e){
		bulidSwitchbox(e);
	});
}

