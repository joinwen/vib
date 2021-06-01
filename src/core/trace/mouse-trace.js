import Trace from "./index";

class MouseTrace extends Trace{
  constructor(p) {
    super(p);
    this.initEvents();
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
    switch (event.type) {
    case "mousedown": {
      console.log("mousedown");
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
    case "mousemove": {
      if([0,3].includes(this.flag)) {
        return;
      }
      this.flag = 2;
      console.log("move");
      let moveX = event.pageX,
        moveY = event.pageY,
        deltaX = moveX - this.startX,
        deltaY = moveY - this.startY;
      this.startX = moveX;
      this.startY = moveY;

      let x1 = this.x1 + deltaX;
      let y1 = this.y1 + deltaY;
      console.log(y1);
      if(y1 < this.maxY) {
        y1 = this.maxY;
      }
      if(y1 > 0) {
        y1 = 0;
      }
      this.translate(y1);
      if(Date.now() - this.startTime > 300) {
        this.startTime = Date.now();
        this.x0 = this.x1;
        this.y0 = this.y1;
      }
    }break;
    case "mouseup": {
      console.log("mouseup");
      if(this.flag === 2) {
        this.flag = 3;
        if(Date.now() - this.startTime < 300) {
          let [y0, y1, time] = this.momentum(this.y0, this.y1, this.startTime, this.maxY);
          console.log(y1);
          this.animate(y0, y1, time);
        }
      }
      this.flag = 3;
    }break;
    case "mousecancel": {
      console.log("mousecancel");
      this.flag = 3;
    }break;
    }
  }
}
export default MouseTrace;
