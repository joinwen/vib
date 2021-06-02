/**
 * 处理模板
 */
import Phase from "./phase/index";

class Trace extends Phase{
  constructor(p) {
    super();
    this.p = p;
    this.events = [];
  }
  get child() {
    return this.p.child;
  }
  get parent() {
    return this.p.parent;
  }
  get scrollbar() {
    return this.p.scrollbar;
  }
  get maxY() {
    return this.p.maxY;
  }
  get maxX() {
    return this.p.maxX;
  }
  set flag(value) {
    this.p.flag = value;
  }
  get flag() {
    return this.p.flag;
  }
  set x0(value) {
    this.p.x0 = value;
  }
  get x0() {
    return this.p.x0;
  }
  set x1(value) {
    this.p.x1 = value;
  }
  get x1() {
    return this.p.x1;
  }
  set y0(value) {
    this.p.y0 = value;
  }
  get y0() {
    return this.p.y0;
  }
  set y1(value) {
    this.p.y1 = value;
  }
  get y1() {
    return this.p.y1;
  }
  set startX(value) {
    this.p.startX = value;
  }
  get startX() {
    return this.p.startX;
  }
  set startY(value) {
    this.p.startY = value;
  }
  get startY() {
    return this.p.startY;
  }
  set startTime(value) {
    this.p.startTime = value;
  }
  get startTime() {
    return this.p.startTime;
  }
  listen() {
    this.events.forEach(event => {
      event[1].addEventListener(event[0], this);
    });
  }
}
export default Trace;
