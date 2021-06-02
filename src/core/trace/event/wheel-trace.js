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
      y1 = y1 < this.maxY ? this.maxY : y1 > 0 ? 0 : y1;
      x1 = x1 < this.maxX ? this.maxX : x1 > 0 ? 0 : x1;
      this.translate(x1, y1);
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
