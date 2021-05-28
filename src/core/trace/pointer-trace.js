import Trace from "./index";
class PointerTrace extends Trace{
  constructor(ele) {
    super(ele);
    this.initEvents();
  }
  initEvents() {
    this.events.push(...[
      "pointerdown",
      "pointermove",
      "pointerup",
      "pointercancel"
    ]);
  }
  handleEvent(event) {
    this.generatePositionFromEvent(event);
  }
}
export default PointerTrace;
