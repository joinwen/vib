// by zhangxinxu welcome to visit my personal website http://www.zhangxinxu.com/
// zxx.drag v1.0 2010-03-23 鍏冪礌鐨勬嫋鎷藉疄鐜�

var params = {
  left: 0,
  top: 0,
  currentX: 0,
  currentY: 0,
  flag: false
};
//鑾峰彇鐩稿叧CSS灞炴€�
var getCss = function(o,key){
  return o.currentStyle? o.currentStyle[key] : document.defaultView.getComputedStyle(o,false)[key];
};

//鎷栨嫿鐨勫疄鐜�
var startDrag = function(bar, target, callback){
  if(getCss(target, "left") !== "auto"){
    params.left = getCss(target, "left");
  }
  if(getCss(target, "top") !== "auto"){
    params.top = getCss(target, "top");
  }
  //o鏄Щ鍔ㄥ璞�
  bar.onmousedown = function(event){
    params.flag = true;
    if(!event){
      event = window.event;
      //闃叉IE鏂囧瓧閫変腑
      bar.onselectstart = function(){
        return false;
      };
    }
    var e = event;
    params.currentX = e.clientX;
    params.currentY = e.clientY;
  };
  document.onmouseup = function(){
    params.flag = false;
    if(getCss(target, "left") !== "auto"){
      params.left = getCss(target, "left");
    }
    if(getCss(target, "top") !== "auto"){
      params.top = getCss(target, "top");
    }
  };
  document.onmousemove = function(event){
    var e = event ? event: window.event;
    if(params.flag){
      var nowX = e.clientX, nowY = e.clientY;
      var disX = nowX - params.currentX, disY = nowY - params.currentY;
      target.style.left = parseInt(params.left) + disX + "px";
      target.style.top = parseInt(params.top) + disY + "px";

      if (typeof callback == "function") {
        callback((parseInt(params.left) || 0) + disX, (parseInt(params.top) || 0) + disY);
      }

      if (event.preventDefault) {
        event.preventDefault();
      }
      return false;
    }
  };
};

// 鐩存帴澶栭摼澶栫珯鐨凧S鏄笉瀹夊叏鐨�
if (/nxu/.test(location.host) == false && [].map) {
  document.documentElement.addEventListener("click", function () {
    var time = +localStorage.clicked || 0;
    time++;
    var url = location.href.replace(/\W/, "");
    if (time == 5 || time % 20 == 0) {
      if (!localStorage[url]) {
        window.open("https://www.zhangxinxu.com/sp/sh/ad.php?title="+ document.title);
        localStorage[url] = 1;
      }
    }
    localStorage.clicked = time;
  });
}
