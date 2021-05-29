import {setStyle, getWidthAndHeight, getWidthAndHeightWithBorder} from "../../utils/index";

/**
 * 处理模板
 */
class Trace {
  constructor(child) {
    this.child = child;
    this.parent = child.parentElement;
    this.init();
    this.initStyle();
  }
  init() {
    this.x = 0;
    this.y = 0;
    this.oldX = 0;
    this.oldY = 0;
    this.position = {};
    this.events = [];
    let [ parentWidth, parentHeight ] = getWidthAndHeight(this.parent),
      [childWidth, childHeight] = getWidthAndHeightWithBorder(this.child);
    this.maxY = parentHeight - childHeight;
    this.maxX = parentWidth - childWidth;
  }
  initStyle() {
    setStyle(this.child, {"user-select": "none"});
  }
  listen() {
    this.events.forEach(event => {
      event[1].addEventListener(event[0], this);
    });
  }
  generatePositionFromEvent(event) {
    let data = event.touches[0];
    this.position.pageX = data.pageX;
    this.position.pageY = data.pageY;
  }
}
export default Trace;
