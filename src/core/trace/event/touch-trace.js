import Trace from "../index";

class TouchTrace extends Trace{
  constructor(p) {
    super(p);
    this.initEvents();
  }
  initEvents() {
    this.events.push(...[
      ["touchstart", this.child],
      // eslint-disable-next-line no-undef
      ["touchmove", window],
      // eslint-disable-next-line no-undef
      ["touchend", window],
      // eslint-disable-next-line no-undef
      ["touchcancel", window]
    ]);
  }
  handleEvent(event) {
    event = this.unifyEvent(event);
    switch (event.type) {
    case "touchstart": {
      this.handleStart(event);
    }break;
    case "touchmove": {
      this.handleGoing(event);
    }break;
    case "touchend": {
      this.handleStop();
    }break;
    case "touchcancel": {
      this.handleCancel();
    }break;
    }
  }
  unifyEvent(event) {
    if(event.touches && event.touches[0]) {
      event.pageX = event.touches[0].pageX;
      event.pageY = event.touches[0].pageY;
    }
    return event;
  }
}
export default TouchTrace;
