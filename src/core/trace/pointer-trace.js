import Trace from "./index";
import Action from "../action/index";
class PointerTrace extends Trace{
  constructor(ele) {
    super(ele);
    this.initEvents();
    this.flag = false;
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
    this.generatePositionFromEvent(event);
    switch (event.type) {
    case "pointerdown": {
      this.position.startX = event.pageX;
      this.position.startY = event.pageY;
      this.flag = true;
    }break;
    case "pointermove": {
      if(!this.flag) {
        return;
      }
      let moveX = this.position.pageX,
        moveY = this.position.pageY,
        deltaX = moveX - this.position.startX,
        deltaY = moveY - this.position.startY;
      this.position.startX = moveX;
      this.position.startY = moveY;
      this.x = this.x + deltaX;
      this.y = this.y + deltaY;
      if(this.y < this.maxY) {
        this.y = this.maxY;
      }
      if(this.y > 0) {
        this.y = 0;
      }
      Action.transform(this.child, this.x, this.y);
    }break;
    case "pointerup":
      this.flag = false;
      break;
    case "pointercancel":
      this.flag = false;
      break;
    }
  }
  generatePositionFromEvent(event) {
    this.position.pageX = event.pageX;
    this.position.pageY = event.pageY;
  }
}
export default PointerTrace;
