import Animation from "../../animation/index";
class Phase extends Animation{
  unifyEvent(event) {
    return event;
  }
  handleStart(event) {
    console.log("**start**");
    this.flag = 1;
    this.child.addEventListener("selectstart", (e) => {
      e.preventDefault();
    });
    this.startX = event.pageX;
    this.startY = event.pageY;
    this.x0 = this.x1;
    this.y0 = this.y1;
    this.startTime = Date.now();
  }
  handleGoing(event) {
    if([0,3].includes(this.flag)) {
      return;
    }
    this.flag = 2;
    console.log("**going**");
    let moveX = event.pageX,
      moveY = event.pageY,
      deltaX = moveX - this.startX,
      deltaY = moveY - this.startY;
    this.startX = moveX;
    this.startY = moveY;

    let x1 = this.x1 + deltaX;
    let y1 = this.y1 + deltaY;
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
  }
  handleStop() {
    console.log("**stop**");
    if(this.flag === 2) {
      this.flag = 3;
      if(Date.now() - this.startTime < 300) {
        let [y0, y1, time] = this.momentum(this.y0, this.y1, this.startTime, this.maxY);
        this.animate(y0, y1, time);
      }
    }
    this.flag = 3;
  }
  handleCancel() {
    console.log("**cancel**");
    this.flag = 3;
  }
}
export default Phase;
