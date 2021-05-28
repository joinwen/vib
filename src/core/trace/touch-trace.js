import Action from "../action/index";
import {getWidthAndHeight, getWidthAndHeightWithBorder} from "../../utils/index";

class TouchTrace {
  constructor(ele) {
    this.ele = ele;
    this.init();
  }
  init() {
    this.x = 0;
    this.y = 0;
    this.position = {};
    this.events = [
      "touchstart",
      "touchmove",
      "touchend",
      "touchcancel"
    ];
    let [ parentWidth,parentHeight ] = getWidthAndHeight(this.ele.parentElement),
      [childWidth, childHeight ] = getWidthAndHeightWithBorder(this.ele);
    this.maxY = parentHeight - childHeight;
    this.maxX = parentWidth - childWidth;
  }
  handleEvent(event) {
    this.generatePositionFromEvent(event);
    switch (event.type) {
    case "touchstart": {
      this.position.startX = this.position.pageX;
      this.position.startY = this.position.pageY;
    }break;
    case "touchmove": {
      let moveX = this.position.pageX,
        moveY = this.position.pageY,
        deltaX = moveX - this.position.startX,
        deltaY = moveY - this.position.startY;
      this.position.startX = moveX;
      this.position.startY = moveY;
      this.x = this.x + deltaX;
      this.y = this.y + deltaY;
      if(this.y < this.maxY) {
        this.y = this.maxY;
      }
      if(this.y > 0) {
        this.y = 0;
      }
      Action.transform(this.ele, this.x, this.y);
    }break;
    case "touchend":
      break;
    case "touchcancel":
      break;
    }
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
export default TouchTrace;
