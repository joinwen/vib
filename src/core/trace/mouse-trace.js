import Action from "../action/index";
import Trace from "./index";

class MouseTrace extends Trace{
  constructor(ele) {
    super(ele);
    this.initEvents();
    this.flag = false;
  }
  initEvents() {
    this.events.push(...[
      // eslint-disable-next-line no-undef
      ["mousedown", this.child],
      // eslint-disable-next-line no-undef
      ["mousemove", window],
      // eslint-disable-next-line no-undef
      ["mouseup", window],
      // eslint-disable-next-line no-undef
      ["mousecancel", window]
    ]);
  }
  handleEvent(event) {
    this.generatePositionFromEvent(event);
    switch (event.type) {
    case "mousedown": {
      this.flag = true;
      this.child.addEventListener("selectstart", (e) => {
        e.preventDefault();
      });
      this.position.startX = this.position.pageX;
      this.position.startY = this.position.pageY;
    }break;
    case "mousemove": {
      if(!this.flag) {
        return;
      }
      console.log("move");
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
    case "mouseup": {
      console.log("mouseup");
      this.flag = false;
    }break;
    case "mousecancel": {
      console.log("mousecancel");
      this.flag = false;
    }break;
    }
  }
  generatePositionFromEvent(event) {
    this.position.pageX = event.pageX;
    this.position.pageY = event.pageY;
  }
}
export default MouseTrace;
