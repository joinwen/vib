const setStyle = (ele, data) => {
  let attr = Object.keys(data)[0];
  ele.style[attr] = data[attr];
};
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

const style2String = (style) => {
  return Object.keys(style).reduce((prev,next) => {
    return prev + `${next}: ${style[next]};`;
  },"");
};

// eslint-disable-next-line no-undef
const raf = window.requestAnimationFrame || function(callback) {
  // eslint-disable-next-line no-undef
  window.setTimeout((callback), 17);
};
// eslint-disable-next-line no-undef
const cancelRaf = window.cancelAnimationFrame || clearTimeout;

const STRATEGY_LIST = {
  linear: (progress) => {
    return progress;
  },
  easeIn: (progress) => {
    return STRATEGY_LIST.easeInQuad(progress);
  },
  easeInQuad: (progoress) => {
    return Math.pow(progoress, 2);
  },
  easeInCubic: (progress) => {
    return Math.pow(progress, 3);
  },
  easeInQuart: (progress) => {
    return Math.pow(progress, 4);
  },
  easeInQuint: (progress) => {
    return Math.pow(progress, 5);
  },
  easeOut: (progress) => {
    return STRATEGY_LIST.easeOutQuad(progress);
  },
  easeOutQuad: (progress) => {
    return progress * 2 - Math.pow(progress, 2);
  },
  easeOutCubic: (progress) => {
    return Math.pow(progress - 1, 3) + 1;
  },
  easeOutQuart: (progress) => {
    return 1 - Math.pow(progress - 1, 4);
  },
  easeOutQuint: (progress) => {
    return Math.pow(progress - 1, 5) + 1;
  },
  back: (progress) => {
    let b = 4;
    return (progress = progress - 1) * progress * ((b + 1) * progress + b) + 1;
  },
  bounce: (progress) => {
    if ((progress /= 1) < 1 / 2.75) {
      return 7.5625 * progress * progress;
    } else if (progress < 2 / 2.75) {
      return 7.5625 * (progress -= 1.5 / 2.75) * progress + 0.75;
    } else if (progress < 2.5 / 2.75) {
      return 7.5625 * (progress -= 2.25 / 2.75) * progress + 0.9375;
    } else {
      return 7.5625 * (progress -= 2.625 / 2.75) * progress + 0.984375;
    }
  },
  elastic: (progress) => {
    var f = 0.22,
      e = 0.4;

    if (progress === 0) {
      return 0;
    }
    if (progress === 1) {
      return 1;
    }

    return e * Math.pow(2, -10 * progress) * Math.sin(((progress - f / 4) * (2 * Math.PI)) / f) + 1;
  },
};
const STRATEGY = {};
Object.keys(STRATEGY_LIST).forEach((key) => {
  STRATEGY[key] = key;
});

class Animation {
  /**
   *
   * @param x0 起点
   * @param x1 终点
   * @param duration 动画时长
   */
  animate([x0, x1], [y0, y1], duration, strategy = "easeOutQuint") {
    let start = Date.now(),
      strategyFn = STRATEGY_LIST[strategy];
    let fn = () => {
      let passed = Date.now() - start,
        progress = this.round(strategyFn(passed / duration), 6),
        id = null,
        deltaX = x1 - x0,
        deltaY = y1 - y0;

      if(this.flag === 3) {
        if(progress < 1){
          this.translate(x0 + deltaX * progress,y0 + deltaY * progress);
          id = raf(fn);
        } else {
          this.translate(x0 + deltaX, y0 + deltaY);
          cancelRaf(id);
        }
      }
    };
    fn();
  }
  round(number, precision) {
    return Math.round(+number + "e" + precision) / Math.pow(10, precision);
  }
  translate(horValue, verValue) {
    this.y1 = Math.round(verValue);
    this.x1 = Math.round(horValue);
    this.scrollbar.updatePosition(this.y1);
    setStyle(this.child, {
      transform: `translateY(${this.y1}px) translateX(${this.x1}px)`
    });
  }

  /**
   *
   * @param x0 起点
   * @param x1 终点
   * @param startTime 起始时间
   * @param max 最大位移
   * @param a 加速度
   * @returns {(*|number)[]}
   */
  momentum(x0, x1, startTime, max, a = 0.0006) {
    let time, distance, speed, x, t;
    time = Date.now() - startTime;  // 时间
    distance = x1 - x0;             // 位移
    speed = Math.abs(distance) / time;  // 平均速度 => 起始速度
    x = x1 + (speed * speed) / (2 * a) * (distance < 0 ? -1 : 1);   // 以a为加速度匀减速到0的位移
    t = speed / a;  // 匀减速运动的时间
    if(x < max) {
      x = max;
      distance = Math.abs(x - x1);
      t = distance / speed;
    }
    if(x > 0) {
      x = 0;
      distance = Math.abs(x1) + x;
      t = distance / speed;
    }
    return [
      x1,
      Math.round(x),
      t
    ];
  }
}

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
    y1 = y1 < this.maxY ? this.maxY : y1 > 0 ? 0 : y1;
    x1 = x1 < this.maxX ? this.maxX : x1 > 0 ? 0 : x1;
    this.translate(x1, y1);
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
        let [y0, y1, time1] = this.momentum(this.y0, this.y1, this.startTime, this.maxY);
        let [x0, x1, time2] = this.momentum(this.x0, this.x1, this.startTime, this.maxX);
        let time =  Math.max(time1, time2);
        if(time) {
          this.animate([x0,x1],[y0,y1], time);
        }
      }
    }
    this.flag = 3;
  }
  handleCancel() {
    console.log("**cancel**");
    this.flag = 3;
  }
}

/**
 * 处理模板
 */

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
      let arr = [event[0]].flat(),
        target = event[1];
      arr.forEach(name => {
        target.addEventListener(name, this);
      });
    });
  }
}

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
    event = super.unifyEvent(event);
    switch (event.type) {
    case "mousedown": {
      this.handleStart(event);
    }break;
    case "mousemove": {
      this.handleGoing(event);
    }break;
    case "mouseup": {
      this.handleStop();
    }break;
    case "mousecancel": {
      this.handleCancel();
    }break;
    }
  }
}

class TouchTrace extends Trace{
  constructor(p) {
    super(p);
    this.initEvents();
  }
  initEvents() {
    this.events.push(...[
      ["touchstart", this.child],
      // eslint-disable-next-line no-undef
      ["touchmove", window],
      // eslint-disable-next-line no-undef
      ["touchend", window],
      // eslint-disable-next-line no-undef
      ["touchcancel", window]
    ]);
  }
  handleEvent(event) {
    event = this.unifyEvent(event);
    switch (event.type) {
    case "touchstart": {
      this.handleStart(event);
    }break;
    case "touchmove": {
      this.handleGoing(event);
    }break;
    case "touchend": {
      this.handleStop();
    }break;
    case "touchcancel": {
      this.handleCancel();
    }break;
    }
  }
  unifyEvent(event) {
    if(event.touches && event.touches[0]) {
      event.pageX = event.touches[0].pageX;
      event.pageY = event.touches[0].pageY;
    }
    return event;
  }
}

class Scrollbar {
  constructor(p) {
    let parent = p.parent,
      child = p.child,
      [parentWidth, parentHeight ] =getWidthAndHeight(parent),
      [childWidth, childHeight] = getWidthAndHeightWithBorder(child);
    this.ratioX = parentWidth / childWidth;
    this.ratioY = parentHeight / childHeight;
    this.height = this.ratioY * 100 + "%";
    this.width = this.ratioX * 100 + "%";
    this.startX = 0;
    this.startY = 0;
    this.x = 0;
    this.y = 0;
    this.flag = 0;
    this.initDom(parent);
    this.initEvents();
  }
  initDom(parent) {
    let parentStyle = {
        position: "absolute",
        top: 0,
        bottom: 0,
        right: "2px",
        width: "6px",
      },
      childStyle = {
        top: 0,
        left: 0,
        position: "absolute",
        "box-sizing": "border-box",
        height: this.height,
        width: "100%",
        "border-radius": "4px",
        background: "#dddee0",
      };
    // eslint-disable-next-line no-undef
    let div = document.createElement("div"),
      html = `<div class="scroller-parent" style="${style2String(parentStyle)}">
                <div class="scroller-child" style="${style2String(childStyle)}"></div>
             </div>`;
    div.innerHTML = html;
    parent.append(div.firstChild);
    // eslint-disable-next-line no-undef
    this.ele = document.querySelector(".scroller-child");
  }

  initEvents() {
    this.events = [
      [["mousedown","pointerdown","touchstart"],this.ele],
      // eslint-disable-next-line no-undef
      [["mousemove","pointermove","touchmove"], window],
      // eslint-disable-next-line no-undef
      [["mouseup","pointerup","touchend"], window],
      // eslint-disable-next-line no-undef
      [["mousecancel","pointercancel","touchcancel"], window]
    ];
  }

  updatePosition(value) {
    value = this.ratioY * value;
    this.translate(-value);
  }
  translate(value) {
    this.y = value;
    setStyle(this.ele, {
      top: `${value}px`
    });
  }
  listen() {
    this.events.forEach(item => {
      let [eventNames, target] = item;
      eventNames.forEach(event => {
        target.addEventListener(event, this);
      });
    });
  }
  handleEvent(event) {
    switch (event.type) {
    case "mousedown":
    case "pointerdown":
    case "touchstart":
      {
        this.flag = 1;
        setStyle(this.ele,{
          background: "#c7c9cc"
        });
        console.log(event);
        this.startX = event.pageX;
        this.startY = event.pageY;
      }break;
    case "mousemove":
    case "pointermove":
    case "touchmove":
      {
        if(this.flag === 1) {
          let moveX = event.pageX,
            moveY = event.pageY;
            event.pageX - this.startX;
            let deltaY = event.pageY - this.startY,
            y = this.y + deltaY;
          this.startX = moveX;
          this.startY = moveY;
          this.translate(y);
        }
      }break;
    case "mouseup":
    case "pointerup":
    case "touchend":
      {
        this.flag = 3;
        // console.log(event);
        setStyle(this.ele, {
          background: "#dddee0"
        });
      }break;
    case "mousescroll":
    case "pointercancel":
    case "touchcancel":
      {
        this.flag = 3;
        setStyle(this.ele, {
          background: "#dddee0"
        });
        // console.log(event);
      }break;
    }
  }
}

/**
 * Particle: 粒子
 */
class Particle {
  constructor(child) {
    this.child = child;
    this.init();
    this.initStyle();
  }
  init() {
    this.parent = this.child.parentElement;
    let [parentWidth, parentHeight ] =getWidthAndHeight(this.parent),
      [childWidth, childHeight] = getWidthAndHeightWithBorder(this.child);
    this.maxY = parentHeight - childHeight;
    this.maxX = parentWidth - childWidth;
    this.x0 = 0;  // x 起点
    this.y0 = 0;  // y 起点
    this.x1 = 0;  // x 终点
    this.y1 = 0;  // y 终点
    this.startX = 0;  // 当前 x 起点
    this.startY = 0;  // 当前 y 起点
    this.flag = 0;  // 事件处理阶段，默认 0，not be traced
    this.startTime = Date.now();  // 开始时间
    this.scrollbar = new Scrollbar(this);   // 滚动条
  }
  initStyle() {
    setStyle(this.child, {"user-select": "none"});
  }
}

class PointerTrace extends Trace{
  constructor(p) {
    super(p);
    this.initEvents();
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
    event = super.unifyEvent(event);
    switch (event.type) {
    case "pointerdown": {
      this.handleStart(event);
    }break;
    case "pointermove": {
      this.handleGoing(event);
    }break;
    case "pointerup": {
      this.handleStop();
    }break;
    case "pointercancel": {
      this.handleCancel();
    }break;
    }
  }
}

class WheelTrace extends Trace{
  constructor(p) {
    super(p);
    this.initEvents();
  }
  initEvents() {
    this.events.push(...[
      ["wheel", this.child],
      ["mousewheel", this.child],
      ["DOMMouseScroll", this.child]
    ]);
  }
  handleEvent(event) {
    event = this.unifyEvent(event);
    switch (event.type) {
    case "wheel": {
      let x1 = this.x1 + (-event.deltaX),
        y1 = this.y1 + (-event.deltaY);
      y1 = y1 < this.maxY ? this.maxY : y1 > 0 ? 0 : y1;
      x1 = x1 < this.maxX ? this.maxX : x1 > 0 ? 0 : x1;
      this.translate(x1, y1);
    }break;
    }
  }
  unifyEvent(event) {
    return event;
  }
}

class ScrollbarTrace extends Trace {
  constructor(p) {
    super(p);
    this.initEvents();
  }
  initEvents() {
    this.events = [
      [["mousedown","touchstart"],this.scrollbar.ele],
      // eslint-disable-next-line no-undef
      [["mousemove","touchmove"], window],
      // eslint-disable-next-line no-undef
      [["mouseup","touchend"], window],
      // eslint-disable-next-line no-undef
      [["mousecancel","touchcancel"], window]
    ];
  }
  handleEvent(event) {
    switch (event.type) {
    case "mousedown":
    case "pointerdown":
    case "touchstart":
      {
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
      }break;
    case "mousemove":
    case "pointermove":
    case "touchmove":
      {
        if([0,3].includes(this.flag)) {
          return;
        }
        this.flag = 2;
        console.log("**going**");
        let moveX = event.pageX,
          moveY = event.pageY,
          deltaX = this.startX - moveX,
          deltaY = this.startY - moveY;
        this.startX = moveX;
        this.startY = moveY;

        let x1 = this.x1 + deltaX;
        let y1 = this.y1 + deltaY;
        y1 = y1 < this.maxY ? this.maxY : y1 > 0 ? 0 : y1;
        x1 = x1 < this.maxX ? this.maxX : x1 > 0 ? 0 : x1;
        this.translate(x1, y1);
      }break;
    case "mouseup":
    case "pointerup":
    case "touchend":
      {
        this.handleCancel();
      }break;
    case "mousescroll":
    case "pointercancel":
    case "touchcancel":
      {
        this.handleCancel();
      }break;
    }
  }
}

const vib = {
  begin: (ele) => {
    let p = new Particle(ele);
    new MouseTrace(p);
      new TouchTrace(p);
      new WheelTrace(p);
      let scrollbarTrace = new ScrollbarTrace(p);
      new PointerTrace(p);
    // mouseTrace.listen();
    // touchTrace.listen();
    // wheelTrace.listen();
    scrollbarTrace.listen();
    // pointerTrace.listen();
  }
};

export default vib;
