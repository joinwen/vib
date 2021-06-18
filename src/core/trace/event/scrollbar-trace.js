import Trace from "../index";

class ScrollbarTrace extends Trace {
  constructor(p) {
    super(p);
    this.initEvents();
  }
  initEvents() {
    this.events = [
      [["mousedown","touchstart"],this.scrollbar.ele],
      // eslint-disable-next-line no-undef
      [["mousemove","touchmove"], window],
      // eslint-disable-next-line no-undef
      [["mouseup","touchend"], window],
      // eslint-disable-next-line no-undef
      [["mousecancel","touchcancel"], window]
    ];
  }
  handleEvent(event) {
    switch (event.type) {
    case "mousedown":
    case "pointerdown":
    case "touchstart":
      {
        console.log("**start**");
        this.flag = 1;
        this.child.addEventListener("selectstart", (e) => {
          e.preventDefault();
        });
        this.startX = event.pageX;
        this.startY = event.pageY;
        this.x0 = this.x1;
        this.y0 = this.y1;
        this.startTime = Date.now();
      }break;
    case "mousemove":
    case "pointermove":
    case "touchmove":
      {
        if([0,3].includes(this.flag)) {
          return;
        }
        this.flag = 2;
        console.log("**going**");
        let moveX = event.pageX,
          moveY = event.pageY,
          deltaX = this.startX - moveX,
          deltaY = this.startY - moveY;
        this.startX = moveX;
        this.startY = moveY;

        let x1 = this.x1 + deltaX;
        let y1 = this.y1 + deltaY;
        y1 = y1 < this.maxY ? this.maxY : y1 > 0 ? 0 : y1;
        x1 = x1 < this.maxX ? this.maxX : x1 > 0 ? 0 : x1;
        this.translate(x1, y1);
      }break;
    case "mouseup":
    case "pointerup":
    case "touchend":
      {
        this.handleCancel();
      }break;
    case "mousescroll":
    case "pointercancel":
    case "touchcancel":
      {
        this.handleCancel();
      }break;
    }
  }
}
export default ScrollbarTrace;
