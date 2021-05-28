import {getWidthAndHeight, getWidthAndHeightWithBorder} from "../../utils";

class MouseTrace {
  constructor(ele) {
    this.ele = ele;
    this.init();
  }
  init() {
    this.x = 0;
    this.y = 0;
    this.position = {};
    this.events = [
      "mousedown",
      "mousemove",
      "mouseup",
      "mousecancel"
    ];
    let [ parentWidth, parentHeight ] = getWidthAndHeight(this.ele.parentElement),
      [childWidth, childHeihgt] = getWidthAndHeightWithBorder(this.ele);
    this.maxY = parentHeight - childHeihgt;
    this.maxX = parentWidth - childWidth;
  }
  handleEvent(event) {
    this.generatePositionFromEvent(event);
  }
  generatePositionFromEvent(event) {
    let data = event.touches[0];
    this.position.pageX = data.pageX;
    this.position.pageY = data.pageY;
  }
  listen() {
    this.events.forEach(event => {
      this.ele.addEventListener(event, this);
    });
  }
}
export default MouseTrace;
