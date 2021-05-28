import Trace from "./index";

class MouseTrace extends Trace{
  constructor(ele) {
    super(ele);
    this.initEvents();
  }
  initEvents() {
    this.events.push(...[
      "mousedown",
      "mousemove",
      "mouseup",
      "mousecancel"
    ]);
  }
  handleEvent(event) {
    console.log(event);
    this.generatePositionFromEvent(event);
  }
}
export default MouseTrace;
