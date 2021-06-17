'use strict';

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
        this.handleStart(event);
      }break;
    case "mousemove":
    case "pointermove":
    case "touchmove":
      {
        this.handleGoing(event);
      }break;
    case "mouseup":
    case "pointerup":
    case "touchend":
      {
        this.handleStop();
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
    let mouseTrace = new MouseTrace(p),
      touchTrace = new TouchTrace(p),
      wheelTrace = new WheelTrace(p),
      scrollbarTrace = new ScrollbarTrace(p);
      new PointerTrace(p);
    mouseTrace.listen();
    touchTrace.listen();
    wheelTrace.listen();
    scrollbarTrace.listen();
    // pointerTrace.listen();
  }
};

module.exports = vib;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmliLmNqcy5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL3V0aWxzL2luZGV4LmpzIiwiLi4vc3JjL2NvcmUvYW5pbWF0aW9uL3N0cmF0ZWd5LmpzIiwiLi4vc3JjL2NvcmUvYW5pbWF0aW9uL2luZGV4LmpzIiwiLi4vc3JjL2NvcmUvdHJhY2UvcGhhc2UvaW5kZXguanMiLCIuLi9zcmMvY29yZS90cmFjZS9pbmRleC5qcyIsIi4uL3NyYy9jb3JlL3RyYWNlL2V2ZW50L21vdXNlLXRyYWNlLmpzIiwiLi4vc3JjL2NvcmUvdHJhY2UvZXZlbnQvdG91Y2gtdHJhY2UuanMiLCIuLi9zcmMvY29yZS9zY3JvbGxiYXIvaW5kZXguanMiLCIuLi9zcmMvY29yZS9wYXJ0aWNsZS9pbmRleC5qcyIsIi4uL3NyYy9jb3JlL3RyYWNlL2V2ZW50L3BvaW50ZXItdHJhY2UuanMiLCIuLi9zcmMvY29yZS90cmFjZS9ldmVudC93aGVlbC10cmFjZS5qcyIsIi4uL3NyYy9jb3JlL3RyYWNlL2V2ZW50L3Njcm9sbGJhci10cmFjZS5qcyIsIi4uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBnZXRTdHlsZSA9IChlbGUsIGF0dHIpID0+IHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG4gIHJldHVybiBkb2N1bWVudC5kZWZhdWx0Vmlldy5nZXRDb21wdXRlZFN0eWxlKGVsZSlbYXR0cl07XG59O1xuY29uc3Qgc2V0U3R5bGUgPSAoZWxlLCBkYXRhKSA9PiB7XG4gIGxldCBhdHRyID0gT2JqZWN0LmtleXMoZGF0YSlbMF07XG4gIGVsZS5zdHlsZVthdHRyXSA9IGRhdGFbYXR0cl07XG59O1xuY29uc3QgZ2V0V2lkdGggPSAoZWxlKSA9PiB7XG4gIHJldHVybiBlbGUuY2xpZW50V2lkdGg7XG59O1xuY29uc3QgZ2V0SGVpZ2h0ID0gKGVsZSkgPT4ge1xuICByZXR1cm4gZWxlLmNsaWVudEhlaWdodDtcbn07XG5jb25zdCBnZXRXaWR0aEFuZEhlaWdodCA9IChlbGUpID0+IHtcbiAgcmV0dXJuIFtcbiAgICBnZXRXaWR0aChlbGUpLFxuICAgIGdldEhlaWdodChlbGUpXG4gIF07XG59O1xuY29uc3QgZ2V0V2lkdGhXaXRoQm9yZGVyID0gKGVsZSkgPT4ge1xuICByZXR1cm4gZWxlLm9mZnNldFdpZHRoO1xufTtcbmNvbnN0IGdldEhlaWdodFdpdGhCb3JkZXIgPSAoZWxlKSA9PiB7XG4gIHJldHVybiBlbGUub2Zmc2V0SGVpZ2h0O1xufTtcblxuY29uc3QgZ2V0V2lkdGhBbmRIZWlnaHRXaXRoQm9yZGVyID0gKGVsZSkgPT4ge1xuICByZXR1cm4gW1xuICAgIGdldFdpZHRoV2l0aEJvcmRlcihlbGUpLFxuICAgIGdldEhlaWdodFdpdGhCb3JkZXIoZWxlKVxuICBdO1xufTtcblxuY29uc3Qgc3R5bGUyU3RyaW5nID0gKHN0eWxlKSA9PiB7XG4gIHJldHVybiBPYmplY3Qua2V5cyhzdHlsZSkucmVkdWNlKChwcmV2LG5leHQpID0+IHtcbiAgICByZXR1cm4gcHJldiArIGAke25leHR9OiAke3N0eWxlW25leHRdfTtgO1xuICB9LFwiXCIpO1xufTtcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG5jb25zdCByYWYgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxuICB3aW5kb3cuc2V0VGltZW91dCgoY2FsbGJhY2spLCAxNyk7XG59O1xuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG5jb25zdCBjYW5jZWxSYWYgPSB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgfHwgY2xlYXJUaW1lb3V0O1xuXG5leHBvcnQge1xuICBzdHlsZTJTdHJpbmcsXG4gIHJhZixcbiAgY2FuY2VsUmFmLFxuICBnZXRTdHlsZSxcbiAgc2V0U3R5bGUsXG4gIGdldFdpZHRoLFxuICBnZXRIZWlnaHQsXG4gIGdldFdpZHRoQW5kSGVpZ2h0LFxuICBnZXRXaWR0aFdpdGhCb3JkZXIsXG4gIGdldEhlaWdodFdpdGhCb3JkZXIsXG4gIGdldFdpZHRoQW5kSGVpZ2h0V2l0aEJvcmRlclxufTtcbiIsImNvbnN0IFNUUkFURUdZX0xJU1QgPSB7XG4gIGxpbmVhcjogKHByb2dyZXNzKSA9PiB7XG4gICAgcmV0dXJuIHByb2dyZXNzO1xuICB9LFxuICBlYXNlSW46IChwcm9ncmVzcykgPT4ge1xuICAgIHJldHVybiBTVFJBVEVHWV9MSVNULmVhc2VJblF1YWQocHJvZ3Jlc3MpO1xuICB9LFxuICBlYXNlSW5RdWFkOiAocHJvZ29yZXNzKSA9PiB7XG4gICAgcmV0dXJuIE1hdGgucG93KHByb2dvcmVzcywgMik7XG4gIH0sXG4gIGVhc2VJbkN1YmljOiAocHJvZ3Jlc3MpID0+IHtcbiAgICByZXR1cm4gTWF0aC5wb3cocHJvZ3Jlc3MsIDMpO1xuICB9LFxuICBlYXNlSW5RdWFydDogKHByb2dyZXNzKSA9PiB7XG4gICAgcmV0dXJuIE1hdGgucG93KHByb2dyZXNzLCA0KTtcbiAgfSxcbiAgZWFzZUluUXVpbnQ6IChwcm9ncmVzcykgPT4ge1xuICAgIHJldHVybiBNYXRoLnBvdyhwcm9ncmVzcywgNSk7XG4gIH0sXG4gIGVhc2VPdXQ6IChwcm9ncmVzcykgPT4ge1xuICAgIHJldHVybiBTVFJBVEVHWV9MSVNULmVhc2VPdXRRdWFkKHByb2dyZXNzKTtcbiAgfSxcbiAgZWFzZU91dFF1YWQ6IChwcm9ncmVzcykgPT4ge1xuICAgIHJldHVybiBwcm9ncmVzcyAqIDIgLSBNYXRoLnBvdyhwcm9ncmVzcywgMik7XG4gIH0sXG4gIGVhc2VPdXRDdWJpYzogKHByb2dyZXNzKSA9PiB7XG4gICAgcmV0dXJuIE1hdGgucG93KHByb2dyZXNzIC0gMSwgMykgKyAxO1xuICB9LFxuICBlYXNlT3V0UXVhcnQ6IChwcm9ncmVzcykgPT4ge1xuICAgIHJldHVybiAxIC0gTWF0aC5wb3cocHJvZ3Jlc3MgLSAxLCA0KTtcbiAgfSxcbiAgZWFzZU91dFF1aW50OiAocHJvZ3Jlc3MpID0+IHtcbiAgICByZXR1cm4gTWF0aC5wb3cocHJvZ3Jlc3MgLSAxLCA1KSArIDE7XG4gIH0sXG4gIGJhY2s6IChwcm9ncmVzcykgPT4ge1xuICAgIGxldCBiID0gNDtcbiAgICByZXR1cm4gKHByb2dyZXNzID0gcHJvZ3Jlc3MgLSAxKSAqIHByb2dyZXNzICogKChiICsgMSkgKiBwcm9ncmVzcyArIGIpICsgMTtcbiAgfSxcbiAgYm91bmNlOiAocHJvZ3Jlc3MpID0+IHtcbiAgICBpZiAoKHByb2dyZXNzIC89IDEpIDwgMSAvIDIuNzUpIHtcbiAgICAgIHJldHVybiA3LjU2MjUgKiBwcm9ncmVzcyAqIHByb2dyZXNzO1xuICAgIH0gZWxzZSBpZiAocHJvZ3Jlc3MgPCAyIC8gMi43NSkge1xuICAgICAgcmV0dXJuIDcuNTYyNSAqIChwcm9ncmVzcyAtPSAxLjUgLyAyLjc1KSAqIHByb2dyZXNzICsgMC43NTtcbiAgICB9IGVsc2UgaWYgKHByb2dyZXNzIDwgMi41IC8gMi43NSkge1xuICAgICAgcmV0dXJuIDcuNTYyNSAqIChwcm9ncmVzcyAtPSAyLjI1IC8gMi43NSkgKiBwcm9ncmVzcyArIDAuOTM3NTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIDcuNTYyNSAqIChwcm9ncmVzcyAtPSAyLjYyNSAvIDIuNzUpICogcHJvZ3Jlc3MgKyAwLjk4NDM3NTtcbiAgICB9XG4gIH0sXG4gIGVsYXN0aWM6IChwcm9ncmVzcykgPT4ge1xuICAgIHZhciBmID0gMC4yMixcbiAgICAgIGUgPSAwLjQ7XG5cbiAgICBpZiAocHJvZ3Jlc3MgPT09IDApIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICBpZiAocHJvZ3Jlc3MgPT09IDEpIHtcbiAgICAgIHJldHVybiAxO1xuICAgIH1cblxuICAgIHJldHVybiBlICogTWF0aC5wb3coMiwgLTEwICogcHJvZ3Jlc3MpICogTWF0aC5zaW4oKChwcm9ncmVzcyAtIGYgLyA0KSAqICgyICogTWF0aC5QSSkpIC8gZikgKyAxO1xuICB9LFxufTtcbmNvbnN0IFNUUkFURUdZID0ge307XG5PYmplY3Qua2V5cyhTVFJBVEVHWV9MSVNUKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgU1RSQVRFR1lba2V5XSA9IGtleTtcbn0pO1xuZXhwb3J0IHsgU1RSQVRFR1lfTElTVCwgU1RSQVRFR1kgfTtcbiIsImltcG9ydCB7Y2FuY2VsUmFmLCByYWYsIHNldFN0eWxlfSBmcm9tIFwiLi4vLi4vdXRpbHMvaW5kZXhcIjtcbmltcG9ydCB7U1RSQVRFR1lfTElTVH0gZnJvbSBcIi4vc3RyYXRlZ3lcIjtcbmNsYXNzIEFuaW1hdGlvbiB7XG4gIC8qKlxuICAgKlxuICAgKiBAcGFyYW0geDAg6LW354K5XG4gICAqIEBwYXJhbSB4MSDnu4jngrlcbiAgICogQHBhcmFtIGR1cmF0aW9uIOWKqOeUu+aXtumVv1xuICAgKi9cbiAgYW5pbWF0ZShbeDAsIHgxXSwgW3kwLCB5MV0sIGR1cmF0aW9uLCBzdHJhdGVneSA9IFwiZWFzZU91dFF1aW50XCIpIHtcbiAgICBsZXQgc3RhcnQgPSBEYXRlLm5vdygpLFxuICAgICAgc3RyYXRlZ3lGbiA9IFNUUkFURUdZX0xJU1Rbc3RyYXRlZ3ldO1xuICAgIGxldCBmbiA9ICgpID0+IHtcbiAgICAgIGxldCBwYXNzZWQgPSBEYXRlLm5vdygpIC0gc3RhcnQsXG4gICAgICAgIHByb2dyZXNzID0gdGhpcy5yb3VuZChzdHJhdGVneUZuKHBhc3NlZCAvIGR1cmF0aW9uKSwgNiksXG4gICAgICAgIGlkID0gbnVsbCxcbiAgICAgICAgZGVsdGFYID0geDEgLSB4MCxcbiAgICAgICAgZGVsdGFZID0geTEgLSB5MDtcblxuICAgICAgaWYodGhpcy5mbGFnID09PSAzKSB7XG4gICAgICAgIGlmKHByb2dyZXNzIDwgMSl7XG4gICAgICAgICAgdGhpcy50cmFuc2xhdGUoeDAgKyBkZWx0YVggKiBwcm9ncmVzcyx5MCArIGRlbHRhWSAqIHByb2dyZXNzKTtcbiAgICAgICAgICBpZCA9IHJhZihmbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy50cmFuc2xhdGUoeDAgKyBkZWx0YVgsIHkwICsgZGVsdGFZKTtcbiAgICAgICAgICBjYW5jZWxSYWYoaWQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgICBmbigpO1xuICB9XG4gIHJvdW5kKG51bWJlciwgcHJlY2lzaW9uKSB7XG4gICAgcmV0dXJuIE1hdGgucm91bmQoK251bWJlciArIFwiZVwiICsgcHJlY2lzaW9uKSAvIE1hdGgucG93KDEwLCBwcmVjaXNpb24pO1xuICB9XG4gIHRyYW5zbGF0ZShob3JWYWx1ZSwgdmVyVmFsdWUpIHtcbiAgICB0aGlzLnkxID0gTWF0aC5yb3VuZCh2ZXJWYWx1ZSk7XG4gICAgdGhpcy54MSA9IE1hdGgucm91bmQoaG9yVmFsdWUpO1xuICAgIHRoaXMuc2Nyb2xsYmFyLnVwZGF0ZVBvc2l0aW9uKHRoaXMueTEpO1xuICAgIHNldFN0eWxlKHRoaXMuY2hpbGQsIHtcbiAgICAgIHRyYW5zZm9ybTogYHRyYW5zbGF0ZVkoJHt0aGlzLnkxfXB4KSB0cmFuc2xhdGVYKCR7dGhpcy54MX1weClgXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICpcbiAgICogQHBhcmFtIHgwIOi1t+eCuVxuICAgKiBAcGFyYW0geDEg57uI54K5XG4gICAqIEBwYXJhbSBzdGFydFRpbWUg6LW35aeL5pe26Ze0XG4gICAqIEBwYXJhbSBtYXgg5pyA5aSn5L2N56e7XG4gICAqIEBwYXJhbSBhIOWKoOmAn+W6plxuICAgKiBAcmV0dXJucyB7KCp8bnVtYmVyKVtdfVxuICAgKi9cbiAgbW9tZW50dW0oeDAsIHgxLCBzdGFydFRpbWUsIG1heCwgYSA9IDAuMDAwNikge1xuICAgIGxldCB0aW1lLCBkaXN0YW5jZSwgc3BlZWQsIHgsIHQ7XG4gICAgdGltZSA9IERhdGUubm93KCkgLSBzdGFydFRpbWU7ICAvLyDml7bpl7RcbiAgICBkaXN0YW5jZSA9IHgxIC0geDA7ICAgICAgICAgICAgIC8vIOS9jeenu1xuICAgIHNwZWVkID0gTWF0aC5hYnMoZGlzdGFuY2UpIC8gdGltZTsgIC8vIOW5s+Wdh+mAn+W6piA9PiDotbflp4vpgJ/luqZcbiAgICB4ID0geDEgKyAoc3BlZWQgKiBzcGVlZCkgLyAoMiAqIGEpICogKGRpc3RhbmNlIDwgMCA/IC0xIDogMSk7ICAgLy8g5LulYeS4uuWKoOmAn+W6puWMgOWHj+mAn+WIsDDnmoTkvY3np7tcbiAgICB0ID0gc3BlZWQgLyBhOyAgLy8g5YyA5YeP6YCf6L+Q5Yqo55qE5pe26Ze0XG4gICAgaWYoeCA8IG1heCkge1xuICAgICAgeCA9IG1heDtcbiAgICAgIGRpc3RhbmNlID0gTWF0aC5hYnMoeCAtIHgxKTtcbiAgICAgIHQgPSBkaXN0YW5jZSAvIHNwZWVkO1xuICAgIH1cbiAgICBpZih4ID4gMCkge1xuICAgICAgeCA9IDA7XG4gICAgICBkaXN0YW5jZSA9IE1hdGguYWJzKHgxKSArIHg7XG4gICAgICB0ID0gZGlzdGFuY2UgLyBzcGVlZDtcbiAgICB9XG4gICAgcmV0dXJuIFtcbiAgICAgIHgxLFxuICAgICAgTWF0aC5yb3VuZCh4KSxcbiAgICAgIHRcbiAgICBdO1xuICB9XG59XG5leHBvcnQgZGVmYXVsdCBBbmltYXRpb247XG4iLCJpbXBvcnQgQW5pbWF0aW9uIGZyb20gXCIuLi8uLi9hbmltYXRpb24vaW5kZXhcIjtcbmNsYXNzIFBoYXNlIGV4dGVuZHMgQW5pbWF0aW9ue1xuICB1bmlmeUV2ZW50KGV2ZW50KSB7XG4gICAgcmV0dXJuIGV2ZW50O1xuICB9XG4gIGhhbmRsZVN0YXJ0KGV2ZW50KSB7XG4gICAgY29uc29sZS5sb2coXCIqKnN0YXJ0KipcIik7XG4gICAgdGhpcy5mbGFnID0gMTtcbiAgICB0aGlzLmNoaWxkLmFkZEV2ZW50TGlzdGVuZXIoXCJzZWxlY3RzdGFydFwiLCAoZSkgPT4ge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH0pO1xuICAgIHRoaXMuc3RhcnRYID0gZXZlbnQucGFnZVg7XG4gICAgdGhpcy5zdGFydFkgPSBldmVudC5wYWdlWTtcbiAgICB0aGlzLngwID0gdGhpcy54MTtcbiAgICB0aGlzLnkwID0gdGhpcy55MTtcbiAgICB0aGlzLnN0YXJ0VGltZSA9IERhdGUubm93KCk7XG4gIH1cbiAgaGFuZGxlR29pbmcoZXZlbnQpIHtcbiAgICBpZihbMCwzXS5pbmNsdWRlcyh0aGlzLmZsYWcpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuZmxhZyA9IDI7XG4gICAgY29uc29sZS5sb2coXCIqKmdvaW5nKipcIik7XG4gICAgbGV0IG1vdmVYID0gZXZlbnQucGFnZVgsXG4gICAgICBtb3ZlWSA9IGV2ZW50LnBhZ2VZLFxuICAgICAgZGVsdGFYID0gbW92ZVggLSB0aGlzLnN0YXJ0WCxcbiAgICAgIGRlbHRhWSA9IG1vdmVZIC0gdGhpcy5zdGFydFk7XG4gICAgdGhpcy5zdGFydFggPSBtb3ZlWDtcbiAgICB0aGlzLnN0YXJ0WSA9IG1vdmVZO1xuXG4gICAgbGV0IHgxID0gdGhpcy54MSArIGRlbHRhWDtcbiAgICBsZXQgeTEgPSB0aGlzLnkxICsgZGVsdGFZO1xuICAgIHkxID0geTEgPCB0aGlzLm1heFkgPyB0aGlzLm1heFkgOiB5MSA+IDAgPyAwIDogeTE7XG4gICAgeDEgPSB4MSA8IHRoaXMubWF4WCA/IHRoaXMubWF4WCA6IHgxID4gMCA/IDAgOiB4MTtcbiAgICB0aGlzLnRyYW5zbGF0ZSh4MSwgeTEpO1xuICAgIGlmKERhdGUubm93KCkgLSB0aGlzLnN0YXJ0VGltZSA+IDMwMCkge1xuICAgICAgdGhpcy5zdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgdGhpcy54MCA9IHRoaXMueDE7XG4gICAgICB0aGlzLnkwID0gdGhpcy55MTtcbiAgICB9XG4gIH1cbiAgaGFuZGxlU3RvcCgpIHtcbiAgICBjb25zb2xlLmxvZyhcIioqc3RvcCoqXCIpO1xuICAgIGlmKHRoaXMuZmxhZyA9PT0gMikge1xuICAgICAgdGhpcy5mbGFnID0gMztcbiAgICAgIGlmKERhdGUubm93KCkgLSB0aGlzLnN0YXJ0VGltZSA8IDMwMCkge1xuICAgICAgICBsZXQgW3kwLCB5MSwgdGltZTFdID0gdGhpcy5tb21lbnR1bSh0aGlzLnkwLCB0aGlzLnkxLCB0aGlzLnN0YXJ0VGltZSwgdGhpcy5tYXhZKTtcbiAgICAgICAgbGV0IFt4MCwgeDEsIHRpbWUyXSA9IHRoaXMubW9tZW50dW0odGhpcy54MCwgdGhpcy54MSwgdGhpcy5zdGFydFRpbWUsIHRoaXMubWF4WCk7XG4gICAgICAgIGxldCB0aW1lID0gIE1hdGgubWF4KHRpbWUxLCB0aW1lMik7XG4gICAgICAgIGlmKHRpbWUpIHtcbiAgICAgICAgICB0aGlzLmFuaW1hdGUoW3gwLHgxXSxbeTAseTFdLCB0aW1lKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmZsYWcgPSAzO1xuICB9XG4gIGhhbmRsZUNhbmNlbCgpIHtcbiAgICBjb25zb2xlLmxvZyhcIioqY2FuY2VsKipcIik7XG4gICAgdGhpcy5mbGFnID0gMztcbiAgfVxufVxuZXhwb3J0IGRlZmF1bHQgUGhhc2U7XG4iLCIvKipcbiAqIOWkhOeQhuaooeadv1xuICovXG5pbXBvcnQgUGhhc2UgZnJvbSBcIi4vcGhhc2UvaW5kZXhcIjtcblxuY2xhc3MgVHJhY2UgZXh0ZW5kcyBQaGFzZXtcbiAgY29uc3RydWN0b3IocCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5wID0gcDtcbiAgICB0aGlzLmV2ZW50cyA9IFtdO1xuICB9XG4gIGdldCBjaGlsZCgpIHtcbiAgICByZXR1cm4gdGhpcy5wLmNoaWxkO1xuICB9XG4gIGdldCBwYXJlbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMucC5wYXJlbnQ7XG4gIH1cbiAgZ2V0IHNjcm9sbGJhcigpIHtcbiAgICByZXR1cm4gdGhpcy5wLnNjcm9sbGJhcjtcbiAgfVxuICBnZXQgbWF4WSgpIHtcbiAgICByZXR1cm4gdGhpcy5wLm1heFk7XG4gIH1cbiAgZ2V0IG1heFgoKSB7XG4gICAgcmV0dXJuIHRoaXMucC5tYXhYO1xuICB9XG4gIHNldCBmbGFnKHZhbHVlKSB7XG4gICAgdGhpcy5wLmZsYWcgPSB2YWx1ZTtcbiAgfVxuICBnZXQgZmxhZygpIHtcbiAgICByZXR1cm4gdGhpcy5wLmZsYWc7XG4gIH1cbiAgc2V0IHgwKHZhbHVlKSB7XG4gICAgdGhpcy5wLngwID0gdmFsdWU7XG4gIH1cbiAgZ2V0IHgwKCkge1xuICAgIHJldHVybiB0aGlzLnAueDA7XG4gIH1cbiAgc2V0IHgxKHZhbHVlKSB7XG4gICAgdGhpcy5wLngxID0gdmFsdWU7XG4gIH1cbiAgZ2V0IHgxKCkge1xuICAgIHJldHVybiB0aGlzLnAueDE7XG4gIH1cbiAgc2V0IHkwKHZhbHVlKSB7XG4gICAgdGhpcy5wLnkwID0gdmFsdWU7XG4gIH1cbiAgZ2V0IHkwKCkge1xuICAgIHJldHVybiB0aGlzLnAueTA7XG4gIH1cbiAgc2V0IHkxKHZhbHVlKSB7XG4gICAgdGhpcy5wLnkxID0gdmFsdWU7XG4gIH1cbiAgZ2V0IHkxKCkge1xuICAgIHJldHVybiB0aGlzLnAueTE7XG4gIH1cbiAgc2V0IHN0YXJ0WCh2YWx1ZSkge1xuICAgIHRoaXMucC5zdGFydFggPSB2YWx1ZTtcbiAgfVxuICBnZXQgc3RhcnRYKCkge1xuICAgIHJldHVybiB0aGlzLnAuc3RhcnRYO1xuICB9XG4gIHNldCBzdGFydFkodmFsdWUpIHtcbiAgICB0aGlzLnAuc3RhcnRZID0gdmFsdWU7XG4gIH1cbiAgZ2V0IHN0YXJ0WSgpIHtcbiAgICByZXR1cm4gdGhpcy5wLnN0YXJ0WTtcbiAgfVxuICBzZXQgc3RhcnRUaW1lKHZhbHVlKSB7XG4gICAgdGhpcy5wLnN0YXJ0VGltZSA9IHZhbHVlO1xuICB9XG4gIGdldCBzdGFydFRpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMucC5zdGFydFRpbWU7XG4gIH1cbiAgbGlzdGVuKCkge1xuICAgIHRoaXMuZXZlbnRzLmZvckVhY2goZXZlbnQgPT4ge1xuICAgICAgbGV0IGFyciA9IFtldmVudFswXV0uZmxhdCgpLFxuICAgICAgICB0YXJnZXQgPSBldmVudFsxXTtcbiAgICAgIGFyci5mb3JFYWNoKG5hbWUgPT4ge1xuICAgICAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihuYW1lLCB0aGlzKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59XG5leHBvcnQgZGVmYXVsdCBUcmFjZTtcbiIsImltcG9ydCBUcmFjZSBmcm9tIFwiLi4vaW5kZXhcIjtcblxuY2xhc3MgTW91c2VUcmFjZSBleHRlbmRzIFRyYWNle1xuICBjb25zdHJ1Y3RvcihwKSB7XG4gICAgc3VwZXIocCk7XG4gICAgdGhpcy5pbml0RXZlbnRzKCk7XG4gIH1cbiAgaW5pdEV2ZW50cygpIHtcbiAgICB0aGlzLmV2ZW50cy5wdXNoKC4uLltcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxuICAgICAgW1wibW91c2Vkb3duXCIsIHRoaXMuY2hpbGRdLFxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG4gICAgICBbXCJtb3VzZW1vdmVcIiwgd2luZG93XSxcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxuICAgICAgW1wibW91c2V1cFwiLCB3aW5kb3ddLFxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG4gICAgICBbXCJtb3VzZWNhbmNlbFwiLCB3aW5kb3ddXG4gICAgXSk7XG4gIH1cbiAgaGFuZGxlRXZlbnQoZXZlbnQpIHtcbiAgICBldmVudCA9IHN1cGVyLnVuaWZ5RXZlbnQoZXZlbnQpO1xuICAgIHN3aXRjaCAoZXZlbnQudHlwZSkge1xuICAgIGNhc2UgXCJtb3VzZWRvd25cIjoge1xuICAgICAgdGhpcy5oYW5kbGVTdGFydChldmVudCk7XG4gICAgfWJyZWFrO1xuICAgIGNhc2UgXCJtb3VzZW1vdmVcIjoge1xuICAgICAgdGhpcy5oYW5kbGVHb2luZyhldmVudCk7XG4gICAgfWJyZWFrO1xuICAgIGNhc2UgXCJtb3VzZXVwXCI6IHtcbiAgICAgIHRoaXMuaGFuZGxlU3RvcCgpO1xuICAgIH1icmVhaztcbiAgICBjYXNlIFwibW91c2VjYW5jZWxcIjoge1xuICAgICAgdGhpcy5oYW5kbGVDYW5jZWwoKTtcbiAgICB9YnJlYWs7XG4gICAgfVxuICB9XG59XG5leHBvcnQgZGVmYXVsdCBNb3VzZVRyYWNlO1xuIiwiaW1wb3J0IFRyYWNlIGZyb20gXCIuLi9pbmRleFwiO1xuXG5jbGFzcyBUb3VjaFRyYWNlIGV4dGVuZHMgVHJhY2V7XG4gIGNvbnN0cnVjdG9yKHApIHtcbiAgICBzdXBlcihwKTtcbiAgICB0aGlzLmluaXRFdmVudHMoKTtcbiAgfVxuICBpbml0RXZlbnRzKCkge1xuICAgIHRoaXMuZXZlbnRzLnB1c2goLi4uW1xuICAgICAgW1widG91Y2hzdGFydFwiLCB0aGlzLmNoaWxkXSxcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxuICAgICAgW1widG91Y2htb3ZlXCIsIHdpbmRvd10sXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcbiAgICAgIFtcInRvdWNoZW5kXCIsIHdpbmRvd10sXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcbiAgICAgIFtcInRvdWNoY2FuY2VsXCIsIHdpbmRvd11cbiAgICBdKTtcbiAgfVxuICBoYW5kbGVFdmVudChldmVudCkge1xuICAgIGV2ZW50ID0gdGhpcy51bmlmeUV2ZW50KGV2ZW50KTtcbiAgICBzd2l0Y2ggKGV2ZW50LnR5cGUpIHtcbiAgICBjYXNlIFwidG91Y2hzdGFydFwiOiB7XG4gICAgICB0aGlzLmhhbmRsZVN0YXJ0KGV2ZW50KTtcbiAgICB9YnJlYWs7XG4gICAgY2FzZSBcInRvdWNobW92ZVwiOiB7XG4gICAgICB0aGlzLmhhbmRsZUdvaW5nKGV2ZW50KTtcbiAgICB9YnJlYWs7XG4gICAgY2FzZSBcInRvdWNoZW5kXCI6IHtcbiAgICAgIHRoaXMuaGFuZGxlU3RvcCgpO1xuICAgIH1icmVhaztcbiAgICBjYXNlIFwidG91Y2hjYW5jZWxcIjoge1xuICAgICAgdGhpcy5oYW5kbGVDYW5jZWwoKTtcbiAgICB9YnJlYWs7XG4gICAgfVxuICB9XG4gIHVuaWZ5RXZlbnQoZXZlbnQpIHtcbiAgICBpZihldmVudC50b3VjaGVzICYmIGV2ZW50LnRvdWNoZXNbMF0pIHtcbiAgICAgIGV2ZW50LnBhZ2VYID0gZXZlbnQudG91Y2hlc1swXS5wYWdlWDtcbiAgICAgIGV2ZW50LnBhZ2VZID0gZXZlbnQudG91Y2hlc1swXS5wYWdlWTtcbiAgICB9XG4gICAgcmV0dXJuIGV2ZW50O1xuICB9XG59XG5leHBvcnQgZGVmYXVsdCBUb3VjaFRyYWNlO1xuIiwiaW1wb3J0IHtnZXRXaWR0aEFuZEhlaWdodCwgZ2V0V2lkdGhBbmRIZWlnaHRXaXRoQm9yZGVyLCBzZXRTdHlsZSwgc3R5bGUyU3RyaW5nfSBmcm9tIFwiLi4vLi4vdXRpbHMvaW5kZXhcIjtcblxuY2xhc3MgU2Nyb2xsYmFyIHtcbiAgY29uc3RydWN0b3IocCkge1xuICAgIGxldCBwYXJlbnQgPSBwLnBhcmVudCxcbiAgICAgIGNoaWxkID0gcC5jaGlsZCxcbiAgICAgIFtwYXJlbnRXaWR0aCwgcGFyZW50SGVpZ2h0IF0gPWdldFdpZHRoQW5kSGVpZ2h0KHBhcmVudCksXG4gICAgICBbY2hpbGRXaWR0aCwgY2hpbGRIZWlnaHRdID0gZ2V0V2lkdGhBbmRIZWlnaHRXaXRoQm9yZGVyKGNoaWxkKTtcbiAgICB0aGlzLnJhdGlvWCA9IHBhcmVudFdpZHRoIC8gY2hpbGRXaWR0aDtcbiAgICB0aGlzLnJhdGlvWSA9IHBhcmVudEhlaWdodCAvIGNoaWxkSGVpZ2h0O1xuICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5yYXRpb1kgKiAxMDAgKyBcIiVcIjtcbiAgICB0aGlzLndpZHRoID0gdGhpcy5yYXRpb1ggKiAxMDAgKyBcIiVcIjtcbiAgICB0aGlzLnN0YXJ0WCA9IDA7XG4gICAgdGhpcy5zdGFydFkgPSAwO1xuICAgIHRoaXMueCA9IDA7XG4gICAgdGhpcy55ID0gMDtcbiAgICB0aGlzLmZsYWcgPSAwO1xuICAgIHRoaXMuaW5pdERvbShwYXJlbnQpO1xuICAgIHRoaXMuaW5pdEV2ZW50cygpO1xuICB9XG4gIGluaXREb20ocGFyZW50KSB7XG4gICAgbGV0IHBhcmVudFN0eWxlID0ge1xuICAgICAgICBwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLFxuICAgICAgICB0b3A6IDAsXG4gICAgICAgIGJvdHRvbTogMCxcbiAgICAgICAgcmlnaHQ6IFwiMnB4XCIsXG4gICAgICAgIHdpZHRoOiBcIjZweFwiLFxuICAgICAgfSxcbiAgICAgIGNoaWxkU3R5bGUgPSB7XG4gICAgICAgIHRvcDogMCxcbiAgICAgICAgbGVmdDogMCxcbiAgICAgICAgcG9zaXRpb246IFwiYWJzb2x1dGVcIixcbiAgICAgICAgXCJib3gtc2l6aW5nXCI6IFwiYm9yZGVyLWJveFwiLFxuICAgICAgICBoZWlnaHQ6IHRoaXMuaGVpZ2h0LFxuICAgICAgICB3aWR0aDogXCIxMDAlXCIsXG4gICAgICAgIFwiYm9yZGVyLXJhZGl1c1wiOiBcIjRweFwiLFxuICAgICAgICBiYWNrZ3JvdW5kOiBcIiNkZGRlZTBcIixcbiAgICAgIH07XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG4gICAgbGV0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiksXG4gICAgICBodG1sID0gYDxkaXYgY2xhc3M9XCJzY3JvbGxlci1wYXJlbnRcIiBzdHlsZT1cIiR7c3R5bGUyU3RyaW5nKHBhcmVudFN0eWxlKX1cIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic2Nyb2xsZXItY2hpbGRcIiBzdHlsZT1cIiR7c3R5bGUyU3RyaW5nKGNoaWxkU3R5bGUpfVwiPjwvZGl2PlxuICAgICAgICAgICAgIDwvZGl2PmA7XG4gICAgZGl2LmlubmVySFRNTCA9IGh0bWw7XG4gICAgcGFyZW50LmFwcGVuZChkaXYuZmlyc3RDaGlsZCk7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG4gICAgdGhpcy5lbGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnNjcm9sbGVyLWNoaWxkXCIpO1xuICB9XG5cbiAgaW5pdEV2ZW50cygpIHtcbiAgICB0aGlzLmV2ZW50cyA9IFtcbiAgICAgIFtbXCJtb3VzZWRvd25cIixcInBvaW50ZXJkb3duXCIsXCJ0b3VjaHN0YXJ0XCJdLHRoaXMuZWxlXSxcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxuICAgICAgW1tcIm1vdXNlbW92ZVwiLFwicG9pbnRlcm1vdmVcIixcInRvdWNobW92ZVwiXSwgd2luZG93XSxcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxuICAgICAgW1tcIm1vdXNldXBcIixcInBvaW50ZXJ1cFwiLFwidG91Y2hlbmRcIl0sIHdpbmRvd10sXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcbiAgICAgIFtbXCJtb3VzZWNhbmNlbFwiLFwicG9pbnRlcmNhbmNlbFwiLFwidG91Y2hjYW5jZWxcIl0sIHdpbmRvd11cbiAgICBdO1xuICB9XG5cbiAgdXBkYXRlUG9zaXRpb24odmFsdWUpIHtcbiAgICB2YWx1ZSA9IHRoaXMucmF0aW9ZICogdmFsdWU7XG4gICAgdGhpcy50cmFuc2xhdGUoLXZhbHVlKTtcbiAgfVxuICB0cmFuc2xhdGUodmFsdWUpIHtcbiAgICB0aGlzLnkgPSB2YWx1ZTtcbiAgICBzZXRTdHlsZSh0aGlzLmVsZSwge1xuICAgICAgdG9wOiBgJHt2YWx1ZX1weGBcbiAgICB9KTtcbiAgfVxuICBsaXN0ZW4oKSB7XG4gICAgdGhpcy5ldmVudHMuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgIGxldCBbZXZlbnROYW1lcywgdGFyZ2V0XSA9IGl0ZW07XG4gICAgICBldmVudE5hbWVzLmZvckVhY2goZXZlbnQgPT4ge1xuICAgICAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgdGhpcyk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuICBoYW5kbGVFdmVudChldmVudCkge1xuICAgIHN3aXRjaCAoZXZlbnQudHlwZSkge1xuICAgIGNhc2UgXCJtb3VzZWRvd25cIjpcbiAgICBjYXNlIFwicG9pbnRlcmRvd25cIjpcbiAgICBjYXNlIFwidG91Y2hzdGFydFwiOlxuICAgICAge1xuICAgICAgICB0aGlzLmZsYWcgPSAxO1xuICAgICAgICBzZXRTdHlsZSh0aGlzLmVsZSx7XG4gICAgICAgICAgYmFja2dyb3VuZDogXCIjYzdjOWNjXCJcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnNvbGUubG9nKGV2ZW50KTtcbiAgICAgICAgdGhpcy5zdGFydFggPSBldmVudC5wYWdlWDtcbiAgICAgICAgdGhpcy5zdGFydFkgPSBldmVudC5wYWdlWTtcbiAgICAgIH1icmVhaztcbiAgICBjYXNlIFwibW91c2Vtb3ZlXCI6XG4gICAgY2FzZSBcInBvaW50ZXJtb3ZlXCI6XG4gICAgY2FzZSBcInRvdWNobW92ZVwiOlxuICAgICAge1xuICAgICAgICBpZih0aGlzLmZsYWcgPT09IDEpIHtcbiAgICAgICAgICBsZXQgbW92ZVggPSBldmVudC5wYWdlWCxcbiAgICAgICAgICAgIG1vdmVZID0gZXZlbnQucGFnZVksXG4gICAgICAgICAgICBkZWx0YVggPSBldmVudC5wYWdlWCAtIHRoaXMuc3RhcnRYLFxuICAgICAgICAgICAgZGVsdGFZID0gZXZlbnQucGFnZVkgLSB0aGlzLnN0YXJ0WSxcbiAgICAgICAgICAgIHkgPSB0aGlzLnkgKyBkZWx0YVk7XG4gICAgICAgICAgdGhpcy5zdGFydFggPSBtb3ZlWDtcbiAgICAgICAgICB0aGlzLnN0YXJ0WSA9IG1vdmVZO1xuICAgICAgICAgIHRoaXMudHJhbnNsYXRlKHkpO1xuICAgICAgICB9XG4gICAgICB9YnJlYWs7XG4gICAgY2FzZSBcIm1vdXNldXBcIjpcbiAgICBjYXNlIFwicG9pbnRlcnVwXCI6XG4gICAgY2FzZSBcInRvdWNoZW5kXCI6XG4gICAgICB7XG4gICAgICAgIHRoaXMuZmxhZyA9IDM7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGV2ZW50KTtcbiAgICAgICAgc2V0U3R5bGUodGhpcy5lbGUsIHtcbiAgICAgICAgICBiYWNrZ3JvdW5kOiBcIiNkZGRlZTBcIlxuICAgICAgICB9KTtcbiAgICAgIH1icmVhaztcbiAgICBjYXNlIFwibW91c2VzY3JvbGxcIjpcbiAgICBjYXNlIFwicG9pbnRlcmNhbmNlbFwiOlxuICAgIGNhc2UgXCJ0b3VjaGNhbmNlbFwiOlxuICAgICAge1xuICAgICAgICB0aGlzLmZsYWcgPSAzO1xuICAgICAgICBzZXRTdHlsZSh0aGlzLmVsZSwge1xuICAgICAgICAgIGJhY2tncm91bmQ6IFwiI2RkZGVlMFwiXG4gICAgICAgIH0pO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhldmVudCk7XG4gICAgICB9YnJlYWs7XG4gICAgfVxuICB9XG59XG5leHBvcnQgZGVmYXVsdCBTY3JvbGxiYXI7XG4iLCJpbXBvcnQge3NldFN0eWxlLCBnZXRXaWR0aEFuZEhlaWdodCwgZ2V0V2lkdGhBbmRIZWlnaHRXaXRoQm9yZGVyfSBmcm9tIFwiLi4vLi4vdXRpbHMvaW5kZXhcIjtcbmltcG9ydCBTY3JvbGxiYXIgZnJvbSBcIi4uL3Njcm9sbGJhci9pbmRleFwiO1xuXG4vKipcbiAqIFBhcnRpY2xlOiDnspLlrZBcbiAqL1xuY2xhc3MgUGFydGljbGUge1xuICBjb25zdHJ1Y3RvcihjaGlsZCkge1xuICAgIHRoaXMuY2hpbGQgPSBjaGlsZDtcbiAgICB0aGlzLmluaXQoKTtcbiAgICB0aGlzLmluaXRTdHlsZSgpO1xuICB9XG4gIGluaXQoKSB7XG4gICAgdGhpcy5wYXJlbnQgPSB0aGlzLmNoaWxkLnBhcmVudEVsZW1lbnQ7XG4gICAgbGV0IFtwYXJlbnRXaWR0aCwgcGFyZW50SGVpZ2h0IF0gPWdldFdpZHRoQW5kSGVpZ2h0KHRoaXMucGFyZW50KSxcbiAgICAgIFtjaGlsZFdpZHRoLCBjaGlsZEhlaWdodF0gPSBnZXRXaWR0aEFuZEhlaWdodFdpdGhCb3JkZXIodGhpcy5jaGlsZCk7XG4gICAgdGhpcy5tYXhZID0gcGFyZW50SGVpZ2h0IC0gY2hpbGRIZWlnaHQ7XG4gICAgdGhpcy5tYXhYID0gcGFyZW50V2lkdGggLSBjaGlsZFdpZHRoO1xuICAgIHRoaXMueDAgPSAwOyAgLy8geCDotbfngrlcbiAgICB0aGlzLnkwID0gMDsgIC8vIHkg6LW354K5XG4gICAgdGhpcy54MSA9IDA7ICAvLyB4IOe7iOeCuVxuICAgIHRoaXMueTEgPSAwOyAgLy8geSDnu4jngrlcbiAgICB0aGlzLnN0YXJ0WCA9IDA7ICAvLyDlvZPliY0geCDotbfngrlcbiAgICB0aGlzLnN0YXJ0WSA9IDA7ICAvLyDlvZPliY0geSDotbfngrlcbiAgICB0aGlzLmZsYWcgPSAwOyAgLy8g5LqL5Lu25aSE55CG6Zi25q6177yM6buY6K6kIDDvvIxub3QgYmUgdHJhY2VkXG4gICAgdGhpcy5zdGFydFRpbWUgPSBEYXRlLm5vdygpOyAgLy8g5byA5aeL5pe26Ze0XG4gICAgdGhpcy5zY3JvbGxiYXIgPSBuZXcgU2Nyb2xsYmFyKHRoaXMpOyAgIC8vIOa7muWKqOadoVxuICB9XG4gIGluaXRTdHlsZSgpIHtcbiAgICBzZXRTdHlsZSh0aGlzLmNoaWxkLCB7XCJ1c2VyLXNlbGVjdFwiOiBcIm5vbmVcIn0pO1xuICB9XG59XG5leHBvcnQgZGVmYXVsdCBQYXJ0aWNsZTtcbiIsImltcG9ydCBUcmFjZSBmcm9tIFwiLi4vaW5kZXhcIjtcbmNsYXNzIFBvaW50ZXJUcmFjZSBleHRlbmRzIFRyYWNle1xuICBjb25zdHJ1Y3RvcihwKSB7XG4gICAgc3VwZXIocCk7XG4gICAgdGhpcy5pbml0RXZlbnRzKCk7XG4gIH1cbiAgaW5pdEV2ZW50cygpIHtcbiAgICB0aGlzLmV2ZW50cy5wdXNoKC4uLltcbiAgICAgIFtcInBvaW50ZXJkb3duXCIsIHRoaXMuY2hpbGRdLFxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG4gICAgICBbXCJwb2ludGVybW92ZVwiLCB3aW5kb3ddLFxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG4gICAgICBbXCJwb2ludGVydXBcIiwgd2luZG93XSxcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxuICAgICAgW1wicG9pbnRlcmNhbmNlbFwiLCB3aW5kb3ddXG4gICAgXSk7XG4gIH1cbiAgaGFuZGxlRXZlbnQoZXZlbnQpIHtcbiAgICBldmVudCA9IHN1cGVyLnVuaWZ5RXZlbnQoZXZlbnQpO1xuICAgIHN3aXRjaCAoZXZlbnQudHlwZSkge1xuICAgIGNhc2UgXCJwb2ludGVyZG93blwiOiB7XG4gICAgICB0aGlzLmhhbmRsZVN0YXJ0KGV2ZW50KTtcbiAgICB9YnJlYWs7XG4gICAgY2FzZSBcInBvaW50ZXJtb3ZlXCI6IHtcbiAgICAgIHRoaXMuaGFuZGxlR29pbmcoZXZlbnQpO1xuICAgIH1icmVhaztcbiAgICBjYXNlIFwicG9pbnRlcnVwXCI6IHtcbiAgICAgIHRoaXMuaGFuZGxlU3RvcCgpO1xuICAgIH1icmVhaztcbiAgICBjYXNlIFwicG9pbnRlcmNhbmNlbFwiOiB7XG4gICAgICB0aGlzLmhhbmRsZUNhbmNlbCgpO1xuICAgIH1icmVhaztcbiAgICB9XG4gIH1cbn1cbmV4cG9ydCBkZWZhdWx0IFBvaW50ZXJUcmFjZTtcbiIsImltcG9ydCBUcmFjZSBmcm9tIFwiLi4vaW5kZXhcIjtcbmNsYXNzIFdoZWVsVHJhY2UgZXh0ZW5kcyBUcmFjZXtcbiAgY29uc3RydWN0b3IocCkge1xuICAgIHN1cGVyKHApO1xuICAgIHRoaXMuaW5pdEV2ZW50cygpO1xuICB9XG4gIGluaXRFdmVudHMoKSB7XG4gICAgdGhpcy5ldmVudHMucHVzaCguLi5bXG4gICAgICBbXCJ3aGVlbFwiLCB0aGlzLmNoaWxkXSxcbiAgICAgIFtcIm1vdXNld2hlZWxcIiwgdGhpcy5jaGlsZF0sXG4gICAgICBbXCJET01Nb3VzZVNjcm9sbFwiLCB0aGlzLmNoaWxkXVxuICAgIF0pO1xuICB9XG4gIGhhbmRsZUV2ZW50KGV2ZW50KSB7XG4gICAgZXZlbnQgPSB0aGlzLnVuaWZ5RXZlbnQoZXZlbnQpO1xuICAgIHN3aXRjaCAoZXZlbnQudHlwZSkge1xuICAgIGNhc2UgXCJ3aGVlbFwiOiB7XG4gICAgICBsZXQgeDEgPSB0aGlzLngxICsgKC1ldmVudC5kZWx0YVgpLFxuICAgICAgICB5MSA9IHRoaXMueTEgKyAoLWV2ZW50LmRlbHRhWSk7XG4gICAgICB5MSA9IHkxIDwgdGhpcy5tYXhZID8gdGhpcy5tYXhZIDogeTEgPiAwID8gMCA6IHkxO1xuICAgICAgeDEgPSB4MSA8IHRoaXMubWF4WCA/IHRoaXMubWF4WCA6IHgxID4gMCA/IDAgOiB4MTtcbiAgICAgIHRoaXMudHJhbnNsYXRlKHgxLCB5MSk7XG4gICAgfWJyZWFrO1xuICAgIH1cbiAgfVxuICB1bmlmeUV2ZW50KGV2ZW50KSB7XG4gICAgLy8gMS4g5qCH5YeGIOm8oOagh+a7mui9ruS6i+S7tlxuICAgIGlmKFwiZGVsdGFYXCIgaW4gZXZlbnQpIHtcbiAgICB9IGVsc2UgaWYoXCJ3aGVlbERlbHRheFwiIGluIGV2ZW50KSB7XG4gICAgICAvLyAyLiBtb3VzZXdoZWVsIOS6i+S7tlxuICAgIH0gZWxzZSBpZihcIndoZWVsRGVsdGFcIiBpbiBldmVudCkge1xuXG4gICAgfSBlbHNlIGlmKFwiZGV0YWlsXCIgaW4gZXZlbnQpIHtcbiAgICAgIC8vIDMuIERPTU1vdXNlU2Nyb2xsIOS6i+S7tlxuICAgIH1cbiAgICByZXR1cm4gZXZlbnQ7XG4gIH1cbn1cbmV4cG9ydCBkZWZhdWx0IFdoZWVsVHJhY2U7XG4iLCJpbXBvcnQgVHJhY2UgZnJvbSBcIi4uL2luZGV4XCI7XG5cbmNsYXNzIFNjcm9sbGJhclRyYWNlIGV4dGVuZHMgVHJhY2Uge1xuICBjb25zdHJ1Y3RvcihwKSB7XG4gICAgc3VwZXIocCk7XG4gICAgdGhpcy5pbml0RXZlbnRzKCk7XG4gIH1cbiAgaW5pdEV2ZW50cygpIHtcbiAgICB0aGlzLmV2ZW50cyA9IFtcbiAgICAgIFtbXCJtb3VzZWRvd25cIixcInRvdWNoc3RhcnRcIl0sdGhpcy5zY3JvbGxiYXIuZWxlXSxcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxuICAgICAgW1tcIm1vdXNlbW92ZVwiLFwidG91Y2htb3ZlXCJdLCB3aW5kb3ddLFxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG4gICAgICBbW1wibW91c2V1cFwiLFwidG91Y2hlbmRcIl0sIHdpbmRvd10sXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcbiAgICAgIFtbXCJtb3VzZWNhbmNlbFwiLFwidG91Y2hjYW5jZWxcIl0sIHdpbmRvd11cbiAgICBdO1xuICB9XG4gIGhhbmRsZUV2ZW50KGV2ZW50KSB7XG4gICAgc3dpdGNoIChldmVudC50eXBlKSB7XG4gICAgY2FzZSBcIm1vdXNlZG93blwiOlxuICAgIGNhc2UgXCJwb2ludGVyZG93blwiOlxuICAgIGNhc2UgXCJ0b3VjaHN0YXJ0XCI6XG4gICAgICB7XG4gICAgICAgIHRoaXMuaGFuZGxlU3RhcnQoZXZlbnQpO1xuICAgICAgfWJyZWFrO1xuICAgIGNhc2UgXCJtb3VzZW1vdmVcIjpcbiAgICBjYXNlIFwicG9pbnRlcm1vdmVcIjpcbiAgICBjYXNlIFwidG91Y2htb3ZlXCI6XG4gICAgICB7XG4gICAgICAgIHRoaXMuaGFuZGxlR29pbmcoZXZlbnQpO1xuICAgICAgfWJyZWFrO1xuICAgIGNhc2UgXCJtb3VzZXVwXCI6XG4gICAgY2FzZSBcInBvaW50ZXJ1cFwiOlxuICAgIGNhc2UgXCJ0b3VjaGVuZFwiOlxuICAgICAge1xuICAgICAgICB0aGlzLmhhbmRsZVN0b3AoKTtcbiAgICAgIH1icmVhaztcbiAgICBjYXNlIFwibW91c2VzY3JvbGxcIjpcbiAgICBjYXNlIFwicG9pbnRlcmNhbmNlbFwiOlxuICAgIGNhc2UgXCJ0b3VjaGNhbmNlbFwiOlxuICAgICAge1xuICAgICAgICB0aGlzLmhhbmRsZUNhbmNlbCgpO1xuICAgICAgfWJyZWFrO1xuICAgIH1cbiAgfVxufVxuZXhwb3J0IGRlZmF1bHQgU2Nyb2xsYmFyVHJhY2U7XG4iLCJpbXBvcnQgTW91c2VUcmFjZSBmcm9tIFwiLi9jb3JlL3RyYWNlL2V2ZW50L21vdXNlLXRyYWNlLmpzXCI7XG5pbXBvcnQgVG91Y2hUcmFjZSBmcm9tIFwiLi9jb3JlL3RyYWNlL2V2ZW50L3RvdWNoLXRyYWNlXCI7XG5pbXBvcnQgUGFydGljbGUgZnJvbSBcIi4vY29yZS9wYXJ0aWNsZS9pbmRleFwiO1xuaW1wb3J0IFBvaW50ZXJUcmFjZSBmcm9tIFwiLi9jb3JlL3RyYWNlL2V2ZW50L3BvaW50ZXItdHJhY2VcIjtcbmltcG9ydCBXaGVlbFRyYWNlIGZyb20gXCIuL2NvcmUvdHJhY2UvZXZlbnQvd2hlZWwtdHJhY2VcIjtcbmltcG9ydCBTY3JvbGxiYXJUcmFjZSBmcm9tIFwiLi9jb3JlL3RyYWNlL2V2ZW50L3Njcm9sbGJhci10cmFjZVwiO1xuY29uc3QgdmliID0ge1xuICBiZWdpbjogKGVsZSkgPT4ge1xuICAgIGxldCBwID0gbmV3IFBhcnRpY2xlKGVsZSk7XG4gICAgbGV0IG1vdXNlVHJhY2UgPSBuZXcgTW91c2VUcmFjZShwKSxcbiAgICAgIHRvdWNoVHJhY2UgPSBuZXcgVG91Y2hUcmFjZShwKSxcbiAgICAgIHdoZWVsVHJhY2UgPSBuZXcgV2hlZWxUcmFjZShwKSxcbiAgICAgIHNjcm9sbGJhclRyYWNlID0gbmV3IFNjcm9sbGJhclRyYWNlKHApLFxuICAgICAgcG9pbnRlclRyYWNlID0gbmV3IFBvaW50ZXJUcmFjZShwKTtcbiAgICBtb3VzZVRyYWNlLmxpc3RlbigpO1xuICAgIHRvdWNoVHJhY2UubGlzdGVuKCk7XG4gICAgd2hlZWxUcmFjZS5saXN0ZW4oKTtcbiAgICBzY3JvbGxiYXJUcmFjZS5saXN0ZW4oKTtcbiAgICAvLyBwb2ludGVyVHJhY2UubGlzdGVuKCk7XG4gIH1cbn07XG5leHBvcnQgZGVmYXVsdCB2aWI7XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFJQSxNQUFNLFFBQVEs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QztBQUNwRSxLQUFLLENBQUMsQ0FBQztBQUNQLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUUsUUFBUSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsTUFBTSxFQUFFO0FBQy9DLElBQUksSUFBSSxJQUFJLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3BDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxTQUFTLENBQUM7QUFDbEMsSUFBSSxRQUFRLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUN2QixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLElBQUksQ0FBQztBQUN0QyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxLQUFLLEdBQUcsS0FBSyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxRQUFRLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2pFLElBQUksQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDbEIsSUFBSSxHQUFHLENBQUMsR0FBRyxHQUFHLEVBQUU7QUFDaEIsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ2QsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7QUFDbEMsTUFBTSxDQUFDLEdBQUcsUUFBUSxHQUFHLEtBQUssQ0FBQztBQUMzQixLQUFLO0FBQ0wsSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDZCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDWixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNsQyxNQUFNLENBQUMsR0FBRyxRQUFRLEdBQUcsS0FBSyxDQUFDO0FBQzNCLEtBQUs7QUFDTCxJQUFJLE9BQU87QUFDWCxNQUFNLEVBQUU7QUFDUixNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQ25CLE1BQU0sQ0FBQztBQUNQLEtBQUssQ0FBQztBQUNOLEdBQUc7QUFDSDs7QUMxRUEsTUFBTSxLQUFLLFNBQVMsU0FBUztBQUM3QixFQUFFLFVBQVUsQ0FBQyxLQUFLLEVBQUU7QUFDcEIsSUFBSSxPQUFPLEtBQUssQ0FBQztBQUNqQixHQUFHO0FBQ0gsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFO0FBQ3JCLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUM3QixJQUFJLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO0FBQ2xCLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLEtBQUs7QUFDdEQsTUFBTSxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDekIsS0FBSyxDQUFDLENBQUM7QUFDUCxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQztBQUM5QixJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQztBQUM5QixJQUFJLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztBQUN0QixJQUFJLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztBQUN0QixJQUFJLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ2hDLEdBQUc7QUFDSCxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUU7QUFDckIsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDbEMsTUFBTSxPQUFPO0FBQ2IsS0FBSztBQUNMLElBQUksSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7QUFDbEIsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQzdCLElBQUksSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUs7QUFDM0IsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUs7QUFDekIsTUFBTSxNQUFNLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNO0FBQ2xDLE1BQU0sTUFBTSxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0FBQ25DLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7QUFDeEIsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztBQUN4QjtBQUNBLElBQUksSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxNQUFNLENBQUM7QUFDOUIsSUFBSSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLE1BQU0sQ0FBQztBQUM5QixJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUN0RCxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUN0RCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQzNCLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLFNBQVMsR0FBRyxHQUFHLEVBQUU7QUFDMUMsTUFBTSxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNsQyxNQUFNLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUs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
