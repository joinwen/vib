import Trace from "./index";
import Action from "../action/index";
class WheelTrace extends Trace{
  constructor(ele) {
    super(ele);
    this.initEvents();
  }
  initEvents() {
    this.events.push(...[
      ["wheel", this.child],
      ["mousewheel", this.child],
      ["DOMMouseScroll", this.child]
    ]);
  }
  handleEvent(event) {
    this.generatePositionFromEvent(event);
    switch (event.type) {
    case "wheel": {
      this.x += this.position.deltaX;
      this.y += this.position.deltaY;
      if(this.y < this.maxY) {
        this.y = this.maxY;
      }
      if(this.y > 0) {
        this.y = 0;
      }
      Action.transform(this.child, this.x, this.y);
    }break;
    }
  }
  generatePositionFromEvent(event) {
    // 1. 标准 鼠标滚轮事件
    if("deltaX" in event) {
      this.position.deltaX = -event.deltaX;
      this.position.deltaY = -event.deltaY;
    } else if("wheelDeltax" in event) {
      // 2. mousewheel 事件
    } else if("wheelDelta" in event) {

    } else if("detail" in event) {
      // 3. DOMMouseScroll 事件
    }
  }
}
export default WheelTrace;
