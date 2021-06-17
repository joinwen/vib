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
        this.handleStart(event);
      }break;
    case "mousemove":
    case "pointermove":
    case "touchmove":
      {
        this.handleGoing(event);
      }break;
    case "mouseup":
    case "pointerup":
    case "touchend":
      {
        this.handleStop();
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
