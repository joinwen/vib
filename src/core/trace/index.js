import {getWidthAndHeight, getWidthAndHeightWithBorder} from "../../utils";

/**
 * 处理模板
 */
class Trace {
  constructor(child) {
    this.child = child;
    this.parent = child.parentElement;
    this.init();
  }
  init() {
    this.x = 0;
    this.y = 0;
    this.position = {};
    this.events = [];
    let [ parentWidth, parentHeight ] = getWidthAndHeight(this.parent),
      [childWidth, childHeight] = getWidthAndHeightWithBorder(this.child);
    this.maxY = parentHeight - childHeight;
    this.maxX = parentWidth - childWidth;
  }
  listen() {
    this.events.forEach(event => {
      this.child.addEventListener(event, this);
    });
  }
  generatePositionFromEvent(event) {
    let data = event.touches[0];
    this.position.pageX = data.pageX;
    this.position.pageY = data.pageY;
  }
}
export default Trace;
