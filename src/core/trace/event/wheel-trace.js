import Trace from "../index";
class WheelTrace extends Trace{
  constructor(p) {
    super(p);
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
    event = this.unifyEvent(event);
    switch (event.type) {
    case "wheel": {
      let x1 = this.x1 + (-event.deltaX),
        y1 = this.y1 + (-event.deltaY);
      if(y1 < this.maxY) {
        y1 = this.maxY;
      }
      if(y1 > 0) {
        y1 = 0;
      }
      this.translate(y1);
      // if(Date.now() - this.startTime > 300) {
      //   this.startTime = Date.now();
      //   this.x0 = this.x1;
      //   this.y0 = this.y1;
      // }
    }break;
    }
  }
  unifyEvent(event) {
    // 1. 标准 鼠标滚轮事件
    if("deltaX" in event) {
      console.log(event);
    } else if("wheelDeltax" in event) {
      // 2. mousewheel 事件
    } else if("wheelDelta" in event) {

    } else if("detail" in event) {
      // 3. DOMMouseScroll 事件
    }
    return event;
  }
}
export default WheelTrace;
