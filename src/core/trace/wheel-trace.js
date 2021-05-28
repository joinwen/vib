import Trace from "./index";

class WheelTrace extends Trace{
  constructor(ele) {
    super(ele);
    this.initEvents();
  }
  initEvents() {
    this.events.push(...[
      "wheel",
      "mousewheel",
      "DOMMouseScroll"
    ]);
  }
  handleEvent(event) {
    this.generatePositionFromEvent(event);
  }
}
export default WheelTrace;
