class Action {
  static transform(ele, x, y) {
    ele.style.transform = `translateY(${y}px)`;
  }
}

const getWidth = (ele) => {
  return ele.clientWidth;
};
const getHeight = (ele) => {
  return ele.clientHeight;
};
const getWidthAndHeight = (ele) => {
  return [
    getWidth(ele),
    getHeight(ele)
  ];
};
const getWidthWithBorder = (ele) => {
  return ele.offsetWidth;
};
const getHeightWithBorder = (ele) => {
  return ele.offsetHeight;
};

const getWidthAndHeightWithBorder = (ele) => {
  return [
    getWidthWithBorder(ele),
    getHeightWithBorder(ele)
  ];
};

/**
 * 处理模板
 */
class Trace {
  constructor(child) {
    this.child = child;
    this.parent = child.parentElement;
    this.init();
  }
  init() {
    this.x = 0;
    this.y = 0;
    this.position = {};
    this.events = [];
    let [ parentWidth, parentHeight ] = getWidthAndHeight(this.parent),
      [childWidth, childHeight] = getWidthAndHeightWithBorder(this.child);
    this.maxY = parentHeight - childHeight;
    this.maxX = parentWidth - childWidth;
  }
  listen() {
    this.events.forEach(event => {
      this.child.addEventListener(event, this);
    });
  }
  generatePositionFromEvent(event) {
    let data = event.touches[0];
    this.position.pageX = data.pageX;
    this.position.pageY = data.pageY;
  }
}

class TouchTrace extends Trace{
  constructor(ele) {
    super(ele);
    this.initEvents();
  }
  initEvents() {
    this.events.push(...[
      "touchstart",
      "touchmove",
      "touchend",
      "touchcancel"
    ]);
  }
  handleEvent(event) {
    this.generatePositionFromEvent(event);
    switch (event.type) {
    case "touchstart": {
      this.position.startX = this.position.pageX;
      this.position.startY = this.position.pageY;
    }break;
    case "touchmove": {
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
    }
  }
}

const vib = {
  begin: (ele) => {
    let touchTrace = new TouchTrace(ele);
    touchTrace.listen();
  }
};

export default vib;
