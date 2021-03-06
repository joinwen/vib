import {setStyle, getWidthAndHeight, getWidthAndHeightWithBorder} from "../../utils/index";
import Scrollbar from "../scrollbar/index";

/**
 * Particle: 粒子
 */
class Particle {
  constructor(child) {
    this.child = child;
    this.init();
    this.initStyle();
  }
  init() {
    this.parent = this.child.parentElement;
    let [parentWidth, parentHeight ] =getWidthAndHeight(this.parent),
      [childWidth, childHeight] = getWidthAndHeightWithBorder(this.child);
    this.maxY = parentHeight - childHeight;
    this.maxX = parentWidth - childWidth;
    this.x0 = 0;  // x 起点
    this.y0 = 0;  // y 起点
    this.x1 = 0;  // x 终点
    this.y1 = 0;  // y 终点
    this.startX = 0;  // 当前 x 起点
    this.startY = 0;  // 当前 y 起点
    this.flag = 0;  // 事件处理阶段，默认 0，not be traced
    this.startTime = Date.now();  // 开始时间
    this.scrollbar = new Scrollbar(this);   // 滚动条
  }
  initStyle() {
    setStyle(this.child, {"user-select": "none"});
  }
}
export default Particle;
