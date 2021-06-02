import Trace from "../index";
class PointerTrace extends Trace{
  constructor(p) {
    super(p);
    this.initEvents();
  }
  initEvents() {
    this.events.push(...[
      ["pointerdown", this.child],
      // eslint-disable-next-line no-undef
      ["pointermove", window],
      // eslint-disable-next-line no-undef
      ["pointerup", window],
      // eslint-disable-next-line no-undef
      ["pointercancel", window]
    ]);
  }
  handleEvent(event) {
    event = super.unifyEvent(event);
    switch (event.type) {
    case "pointerdown": {
      this.handleStart(event);
    }break;
    case "pointermove": {
      this.handleGoing(event);
    }break;
    case "pointerup": {
      this.handleStop();
    }break;
    case "pointercancel": {
      this.handleCancel();
    }break;
    }
  }
}
export default PointerTrace;
