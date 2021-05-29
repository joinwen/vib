import Action from "../action/index";
import Trace from "./index";

class MouseTrace extends Trace{
  constructor(ele) {
    super(ele);
    this.initEvents();
    this.flag = 3;
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
      console.log("mousedown");
      this.flag = 1;
      this.child.addEventListener("selectstart", (e) => {
        e.preventDefault();
      });
      this.position.startX = this.position.pageX;
      this.position.startY = this.position.pageY;
      this.startTime = Date.now();
    }break;
    case "mousemove": {
      if(this.flag === 3) {
        return;
      }
      this.flag = 2;
      console.log("move");
      let moveX = this.position.pageX,
        moveY = this.position.pageY,
        deltaX = moveX - this.position.startX,
        deltaY = moveY - this.position.startY;
      this.position.startX = moveX;
      this.position.startY = moveY;
      this.x += deltaX;
      this.y += deltaY;
      if(this.y < this.maxY) {
        this.y = this.maxY;
      }
      if(this.y > 0) {
        this.y = 0;
      }
      Action.transform(this.child, this.y);
      if(Date.now() - this.startTime > 300) {
        this.startTime = Date.now();
      }
    }break;
    case "mouseup": {
      console.log("mouseup");
      if(this.flag === 2) {
        this.flag = 3;
        let [y, time] = Action.momentum(this.position.startY, this.y, this.startTime, this.maxY);
        console.log(y);
        Action.transformWithAnimation(this.child, y, this.y, time);
        this.y = y;
      }
      this.flag = 3;
    }break;
    case "mousecancel": {
      console.log("mousecancel");
      this.flag = 3;
    }break;
    }
  }
  generatePositionFromEvent(event) {
    this.position.pageX = event.pageX;
    this.position.pageY = event.pageY;
  }
}
export default MouseTrace;
