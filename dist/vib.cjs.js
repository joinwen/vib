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
      console.log(progress);
      if(this.flag === 3) {
        if(progress < 1){
          this.translate(x0 + deltaX * progress,y0 + deltaY * progress);
          id = raf(fn);
        } else {
          this.translate(x0 + deltaX, y0 + deltaY * progress);
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
        this.animate([x0,x1],[y0,y1], time);
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

/**
 * Particle: 粒子
 */
class Particle {
  constructor(child) {
    this.child = child;
    this.init();
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
      this.x1 + (-event.deltaX);
        let y1 = this.y1 + (-event.deltaY);
      if(y1 < this.maxY) {
        y1 = this.maxY;
      }
      if(y1 > 0) {
        y1 = 0;
      }
      this.translate(y1);
      // if(Date.now() - this.startTime > 300) {
      //   this.startTime = Date.now();
      //   this.x0 = this.x1;
      //   this.y0 = this.y1;
      // }
    }break;
    }
  }
  unifyEvent(event) {
    // 1. 标准 鼠标滚轮事件
    if("deltaX" in event) {
      console.log(event);
    }
    return event;
  }
}

const vib = {
  begin: (ele) => {
    let p = new Particle(ele);
    let mouseTrace = new MouseTrace(p),
      touchTrace = new TouchTrace(p),
      wheelTrace = new WheelTrace(p);
      new PointerTrace(p);
    mouseTrace.listen();
    touchTrace.listen();
    wheelTrace.listen();
    // pointerTrace.listen();
  }
};

module.exports = vib;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmliLmNqcy5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL3V0aWxzL2luZGV4LmpzIiwiLi4vc3JjL2NvcmUvYW5pbWF0aW9uL3N0cmF0ZWd5LmpzIiwiLi4vc3JjL2NvcmUvYW5pbWF0aW9uL2luZGV4LmpzIiwiLi4vc3JjL2NvcmUvdHJhY2UvcGhhc2UvaW5kZXguanMiLCIuLi9zcmMvY29yZS90cmFjZS9pbmRleC5qcyIsIi4uL3NyYy9jb3JlL3RyYWNlL2V2ZW50L21vdXNlLXRyYWNlLmpzIiwiLi4vc3JjL2NvcmUvdHJhY2UvZXZlbnQvdG91Y2gtdHJhY2UuanMiLCIuLi9zcmMvY29yZS9wYXJ0aWNsZS9pbmRleC5qcyIsIi4uL3NyYy9jb3JlL3RyYWNlL2V2ZW50L3BvaW50ZXItdHJhY2UuanMiLCIuLi9zcmMvY29yZS90cmFjZS9ldmVudC93aGVlbC10cmFjZS5qcyIsIi4uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBnZXRTdHlsZSA9IChlbGUsIGF0dHIpID0+IHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG4gIHJldHVybiBkb2N1bWVudC5kZWZhdWx0Vmlldy5nZXRDb21wdXRlZFN0eWxlKGVsZSlbYXR0cl07XG59O1xuY29uc3Qgc2V0U3R5bGUgPSAoZWxlLCBkYXRhKSA9PiB7XG4gIGxldCBhdHRyID0gT2JqZWN0LmtleXMoZGF0YSlbMF07XG4gIGVsZS5zdHlsZVthdHRyXSA9IGRhdGFbYXR0cl07XG59O1xuY29uc3QgZ2V0V2lkdGggPSAoZWxlKSA9PiB7XG4gIHJldHVybiBlbGUuY2xpZW50V2lkdGg7XG59O1xuY29uc3QgZ2V0SGVpZ2h0ID0gKGVsZSkgPT4ge1xuICByZXR1cm4gZWxlLmNsaWVudEhlaWdodDtcbn07XG5jb25zdCBnZXRXaWR0aEFuZEhlaWdodCA9IChlbGUpID0+IHtcbiAgcmV0dXJuIFtcbiAgICBnZXRXaWR0aChlbGUpLFxuICAgIGdldEhlaWdodChlbGUpXG4gIF07XG59O1xuY29uc3QgZ2V0V2lkdGhXaXRoQm9yZGVyID0gKGVsZSkgPT4ge1xuICByZXR1cm4gZWxlLm9mZnNldFdpZHRoO1xufTtcbmNvbnN0IGdldEhlaWdodFdpdGhCb3JkZXIgPSAoZWxlKSA9PiB7XG4gIHJldHVybiBlbGUub2Zmc2V0SGVpZ2h0O1xufTtcblxuY29uc3QgZ2V0V2lkdGhBbmRIZWlnaHRXaXRoQm9yZGVyID0gKGVsZSkgPT4ge1xuICByZXR1cm4gW1xuICAgIGdldFdpZHRoV2l0aEJvcmRlcihlbGUpLFxuICAgIGdldEhlaWdodFdpdGhCb3JkZXIoZWxlKVxuICBdO1xufTtcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG5jb25zdCByYWYgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxuICB3aW5kb3cuc2V0VGltZW91dCgoY2FsbGJhY2spLCAxNyk7XG59O1xuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG5jb25zdCBjYW5jZWxSYWYgPSB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgfHwgY2xlYXJUaW1lb3V0O1xuXG5leHBvcnQge1xuICByYWYsXG4gIGNhbmNlbFJhZixcbiAgZ2V0U3R5bGUsXG4gIHNldFN0eWxlLFxuICBnZXRXaWR0aCxcbiAgZ2V0SGVpZ2h0LFxuICBnZXRXaWR0aEFuZEhlaWdodCxcbiAgZ2V0V2lkdGhXaXRoQm9yZGVyLFxuICBnZXRIZWlnaHRXaXRoQm9yZGVyLFxuICBnZXRXaWR0aEFuZEhlaWdodFdpdGhCb3JkZXJcbn07XG4iLCJjb25zdCBTVFJBVEVHWV9MSVNUID0ge1xuICBsaW5lYXI6IChwcm9ncmVzcykgPT4ge1xuICAgIHJldHVybiBwcm9ncmVzcztcbiAgfSxcbiAgZWFzZUluOiAocHJvZ3Jlc3MpID0+IHtcbiAgICByZXR1cm4gU1RSQVRFR1lfTElTVC5lYXNlSW5RdWFkKHByb2dyZXNzKTtcbiAgfSxcbiAgZWFzZUluUXVhZDogKHByb2dvcmVzcykgPT4ge1xuICAgIHJldHVybiBNYXRoLnBvdyhwcm9nb3Jlc3MsIDIpO1xuICB9LFxuICBlYXNlSW5DdWJpYzogKHByb2dyZXNzKSA9PiB7XG4gICAgcmV0dXJuIE1hdGgucG93KHByb2dyZXNzLCAzKTtcbiAgfSxcbiAgZWFzZUluUXVhcnQ6IChwcm9ncmVzcykgPT4ge1xuICAgIHJldHVybiBNYXRoLnBvdyhwcm9ncmVzcywgNCk7XG4gIH0sXG4gIGVhc2VJblF1aW50OiAocHJvZ3Jlc3MpID0+IHtcbiAgICByZXR1cm4gTWF0aC5wb3cocHJvZ3Jlc3MsIDUpO1xuICB9LFxuICBlYXNlT3V0OiAocHJvZ3Jlc3MpID0+IHtcbiAgICByZXR1cm4gU1RSQVRFR1lfTElTVC5lYXNlT3V0UXVhZChwcm9ncmVzcyk7XG4gIH0sXG4gIGVhc2VPdXRRdWFkOiAocHJvZ3Jlc3MpID0+IHtcbiAgICByZXR1cm4gcHJvZ3Jlc3MgKiAyIC0gTWF0aC5wb3cocHJvZ3Jlc3MsIDIpO1xuICB9LFxuICBlYXNlT3V0Q3ViaWM6IChwcm9ncmVzcykgPT4ge1xuICAgIHJldHVybiBNYXRoLnBvdyhwcm9ncmVzcyAtIDEsIDMpICsgMTtcbiAgfSxcbiAgZWFzZU91dFF1YXJ0OiAocHJvZ3Jlc3MpID0+IHtcbiAgICByZXR1cm4gMSAtIE1hdGgucG93KHByb2dyZXNzIC0gMSwgNCk7XG4gIH0sXG4gIGVhc2VPdXRRdWludDogKHByb2dyZXNzKSA9PiB7XG4gICAgcmV0dXJuIE1hdGgucG93KHByb2dyZXNzIC0gMSwgNSkgKyAxO1xuICB9LFxuICBiYWNrOiAocHJvZ3Jlc3MpID0+IHtcbiAgICBsZXQgYiA9IDQ7XG4gICAgcmV0dXJuIChwcm9ncmVzcyA9IHByb2dyZXNzIC0gMSkgKiBwcm9ncmVzcyAqICgoYiArIDEpICogcHJvZ3Jlc3MgKyBiKSArIDE7XG4gIH0sXG4gIGJvdW5jZTogKHByb2dyZXNzKSA9PiB7XG4gICAgaWYgKChwcm9ncmVzcyAvPSAxKSA8IDEgLyAyLjc1KSB7XG4gICAgICByZXR1cm4gNy41NjI1ICogcHJvZ3Jlc3MgKiBwcm9ncmVzcztcbiAgICB9IGVsc2UgaWYgKHByb2dyZXNzIDwgMiAvIDIuNzUpIHtcbiAgICAgIHJldHVybiA3LjU2MjUgKiAocHJvZ3Jlc3MgLT0gMS41IC8gMi43NSkgKiBwcm9ncmVzcyArIDAuNzU7XG4gICAgfSBlbHNlIGlmIChwcm9ncmVzcyA8IDIuNSAvIDIuNzUpIHtcbiAgICAgIHJldHVybiA3LjU2MjUgKiAocHJvZ3Jlc3MgLT0gMi4yNSAvIDIuNzUpICogcHJvZ3Jlc3MgKyAwLjkzNzU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiA3LjU2MjUgKiAocHJvZ3Jlc3MgLT0gMi42MjUgLyAyLjc1KSAqIHByb2dyZXNzICsgMC45ODQzNzU7XG4gICAgfVxuICB9LFxuICBlbGFzdGljOiAocHJvZ3Jlc3MpID0+IHtcbiAgICB2YXIgZiA9IDAuMjIsXG4gICAgICBlID0gMC40O1xuXG4gICAgaWYgKHByb2dyZXNzID09PSAwKSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9XG4gICAgaWYgKHByb2dyZXNzID09PSAxKSB7XG4gICAgICByZXR1cm4gMTtcbiAgICB9XG5cbiAgICByZXR1cm4gZSAqIE1hdGgucG93KDIsIC0xMCAqIHByb2dyZXNzKSAqIE1hdGguc2luKCgocHJvZ3Jlc3MgLSBmIC8gNCkgKiAoMiAqIE1hdGguUEkpKSAvIGYpICsgMTtcbiAgfSxcbn07XG5jb25zdCBTVFJBVEVHWSA9IHt9O1xuT2JqZWN0LmtleXMoU1RSQVRFR1lfTElTVCkuZm9yRWFjaCgoa2V5KSA9PiB7XG4gIFNUUkFURUdZW2tleV0gPSBrZXk7XG59KTtcbmV4cG9ydCB7IFNUUkFURUdZX0xJU1QsIFNUUkFURUdZIH07XG4iLCJpbXBvcnQge2NhbmNlbFJhZiwgcmFmLCBzZXRTdHlsZX0gZnJvbSBcIi4uLy4uL3V0aWxzL2luZGV4XCI7XG5pbXBvcnQge1NUUkFURUdZX0xJU1R9IGZyb20gXCIuL3N0cmF0ZWd5XCI7XG5jbGFzcyBBbmltYXRpb24ge1xuICAvKipcbiAgICpcbiAgICogQHBhcmFtIHgwIOi1t+eCuVxuICAgKiBAcGFyYW0geDEg57uI54K5XG4gICAqIEBwYXJhbSBkdXJhdGlvbiDliqjnlLvml7bplb9cbiAgICovXG4gIGFuaW1hdGUoW3gwLCB4MV0sIFt5MCwgeTFdLCBkdXJhdGlvbiwgc3RyYXRlZ3kgPSBcImVhc2VPdXRRdWludFwiKSB7XG4gICAgbGV0IHN0YXJ0ID0gRGF0ZS5ub3coKSxcbiAgICAgIHN0cmF0ZWd5Rm4gPSBTVFJBVEVHWV9MSVNUW3N0cmF0ZWd5XTtcbiAgICBsZXQgZm4gPSAoKSA9PiB7XG4gICAgICBsZXQgcGFzc2VkID0gRGF0ZS5ub3coKSAtIHN0YXJ0LFxuICAgICAgICBwcm9ncmVzcyA9IHRoaXMucm91bmQoc3RyYXRlZ3lGbihwYXNzZWQgLyBkdXJhdGlvbiksIDYpLFxuICAgICAgICBpZCA9IG51bGwsXG4gICAgICAgIGRlbHRhWCA9IHgxIC0geDAsXG4gICAgICAgIGRlbHRhWSA9IHkxIC0geTA7XG4gICAgICBjb25zb2xlLmxvZyhwcm9ncmVzcyk7XG4gICAgICBpZih0aGlzLmZsYWcgPT09IDMpIHtcbiAgICAgICAgaWYocHJvZ3Jlc3MgPCAxKXtcbiAgICAgICAgICB0aGlzLnRyYW5zbGF0ZSh4MCArIGRlbHRhWCAqIHByb2dyZXNzLHkwICsgZGVsdGFZICogcHJvZ3Jlc3MpO1xuICAgICAgICAgIGlkID0gcmFmKGZuKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnRyYW5zbGF0ZSh4MCArIGRlbHRhWCwgeTAgKyBkZWx0YVkgKiBwcm9ncmVzcyk7XG4gICAgICAgICAgY2FuY2VsUmFmKGlkKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gICAgZm4oKTtcbiAgfVxuICByb3VuZChudW1iZXIsIHByZWNpc2lvbikge1xuICAgIHJldHVybiBNYXRoLnJvdW5kKCtudW1iZXIgKyBcImVcIiArIHByZWNpc2lvbikgLyBNYXRoLnBvdygxMCwgcHJlY2lzaW9uKTtcbiAgfVxuICB0cmFuc2xhdGUoaG9yVmFsdWUsIHZlclZhbHVlKSB7XG4gICAgdGhpcy55MSA9IE1hdGgucm91bmQodmVyVmFsdWUpO1xuICAgIHRoaXMueDEgPSBNYXRoLnJvdW5kKGhvclZhbHVlKTtcbiAgICBzZXRTdHlsZSh0aGlzLmNoaWxkLCB7XG4gICAgICB0cmFuc2Zvcm06IGB0cmFuc2xhdGVZKCR7dGhpcy55MX1weCkgdHJhbnNsYXRlWCgke3RoaXMueDF9cHgpYFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqIEBwYXJhbSB4MCDotbfngrlcbiAgICogQHBhcmFtIHgxIOe7iOeCuVxuICAgKiBAcGFyYW0gc3RhcnRUaW1lIOi1t+Wni+aXtumXtFxuICAgKiBAcGFyYW0gbWF4IOacgOWkp+S9jeenu1xuICAgKiBAcGFyYW0gYSDliqDpgJ/luqZcbiAgICogQHJldHVybnMgeygqfG51bWJlcilbXX1cbiAgICovXG4gIG1vbWVudHVtKHgwLCB4MSwgc3RhcnRUaW1lLCBtYXgsIGEgPSAwLjAwMDYpIHtcbiAgICBsZXQgdGltZSwgZGlzdGFuY2UsIHNwZWVkLCB4LCB0O1xuICAgIHRpbWUgPSBEYXRlLm5vdygpIC0gc3RhcnRUaW1lOyAgLy8g5pe26Ze0XG4gICAgZGlzdGFuY2UgPSB4MSAtIHgwOyAgICAgICAgICAgICAvLyDkvY3np7tcbiAgICBzcGVlZCA9IE1hdGguYWJzKGRpc3RhbmNlKSAvIHRpbWU7ICAvLyDlubPlnYfpgJ/luqYgPT4g6LW35aeL6YCf5bqmXG4gICAgeCA9IHgxICsgKHNwZWVkICogc3BlZWQpIC8gKDIgKiBhKSAqIChkaXN0YW5jZSA8IDAgPyAtMSA6IDEpOyAgIC8vIOS7pWHkuLrliqDpgJ/luqbljIDlh4/pgJ/liLAw55qE5L2N56e7XG4gICAgdCA9IHNwZWVkIC8gYTsgIC8vIOWMgOWHj+mAn+i/kOWKqOeahOaXtumXtFxuICAgIGlmKHggPCBtYXgpIHtcbiAgICAgIHggPSBtYXg7XG4gICAgICBkaXN0YW5jZSA9IE1hdGguYWJzKHggLSB4MSk7XG4gICAgICB0ID0gZGlzdGFuY2UgLyBzcGVlZDtcbiAgICB9XG4gICAgaWYoeCA+IDApIHtcbiAgICAgIHggPSAwO1xuICAgICAgZGlzdGFuY2UgPSBNYXRoLmFicyh4MSkgKyB4O1xuICAgICAgdCA9IGRpc3RhbmNlIC8gc3BlZWQ7XG4gICAgfVxuICAgIHJldHVybiBbXG4gICAgICB4MSxcbiAgICAgIE1hdGgucm91bmQoeCksXG4gICAgICB0XG4gICAgXTtcbiAgfVxufVxuZXhwb3J0IGRlZmF1bHQgQW5pbWF0aW9uO1xuIiwiaW1wb3J0IEFuaW1hdGlvbiBmcm9tIFwiLi4vLi4vYW5pbWF0aW9uL2luZGV4XCI7XG5jbGFzcyBQaGFzZSBleHRlbmRzIEFuaW1hdGlvbntcbiAgdW5pZnlFdmVudChldmVudCkge1xuICAgIHJldHVybiBldmVudDtcbiAgfVxuICBoYW5kbGVTdGFydChldmVudCkge1xuICAgIGNvbnNvbGUubG9nKFwiKipzdGFydCoqXCIpO1xuICAgIHRoaXMuZmxhZyA9IDE7XG4gICAgdGhpcy5jaGlsZC5hZGRFdmVudExpc3RlbmVyKFwic2VsZWN0c3RhcnRcIiwgKGUpID0+IHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB9KTtcbiAgICB0aGlzLnN0YXJ0WCA9IGV2ZW50LnBhZ2VYO1xuICAgIHRoaXMuc3RhcnRZID0gZXZlbnQucGFnZVk7XG4gICAgdGhpcy54MCA9IHRoaXMueDE7XG4gICAgdGhpcy55MCA9IHRoaXMueTE7XG4gICAgdGhpcy5zdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuICB9XG4gIGhhbmRsZUdvaW5nKGV2ZW50KSB7XG4gICAgaWYoWzAsM10uaW5jbHVkZXModGhpcy5mbGFnKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmZsYWcgPSAyO1xuICAgIGNvbnNvbGUubG9nKFwiKipnb2luZyoqXCIpO1xuICAgIGxldCBtb3ZlWCA9IGV2ZW50LnBhZ2VYLFxuICAgICAgbW92ZVkgPSBldmVudC5wYWdlWSxcbiAgICAgIGRlbHRhWCA9IG1vdmVYIC0gdGhpcy5zdGFydFgsXG4gICAgICBkZWx0YVkgPSBtb3ZlWSAtIHRoaXMuc3RhcnRZO1xuICAgIHRoaXMuc3RhcnRYID0gbW92ZVg7XG4gICAgdGhpcy5zdGFydFkgPSBtb3ZlWTtcblxuICAgIGxldCB4MSA9IHRoaXMueDEgKyBkZWx0YVg7XG4gICAgbGV0IHkxID0gdGhpcy55MSArIGRlbHRhWTtcbiAgICB5MSA9IHkxIDwgdGhpcy5tYXhZID8gdGhpcy5tYXhZIDogeTEgPiAwID8gMCA6IHkxO1xuICAgIHgxID0geDEgPCB0aGlzLm1heFggPyB0aGlzLm1heFggOiB4MSA+IDAgPyAwIDogeDE7XG4gICAgdGhpcy50cmFuc2xhdGUoeDEsIHkxKTtcbiAgICBpZihEYXRlLm5vdygpIC0gdGhpcy5zdGFydFRpbWUgPiAzMDApIHtcbiAgICAgIHRoaXMuc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgIHRoaXMueDAgPSB0aGlzLngxO1xuICAgICAgdGhpcy55MCA9IHRoaXMueTE7XG4gICAgfVxuICB9XG4gIGhhbmRsZVN0b3AoKSB7XG4gICAgY29uc29sZS5sb2coXCIqKnN0b3AqKlwiKTtcbiAgICBpZih0aGlzLmZsYWcgPT09IDIpIHtcbiAgICAgIHRoaXMuZmxhZyA9IDM7XG4gICAgICBpZihEYXRlLm5vdygpIC0gdGhpcy5zdGFydFRpbWUgPCAzMDApIHtcbiAgICAgICAgbGV0IFt5MCwgeTEsIHRpbWUxXSA9IHRoaXMubW9tZW50dW0odGhpcy55MCwgdGhpcy55MSwgdGhpcy5zdGFydFRpbWUsIHRoaXMubWF4WSk7XG4gICAgICAgIGxldCBbeDAsIHgxLCB0aW1lMl0gPSB0aGlzLm1vbWVudHVtKHRoaXMueDAsIHRoaXMueDEsIHRoaXMuc3RhcnRUaW1lLCB0aGlzLm1heFgpO1xuICAgICAgICBsZXQgdGltZSA9ICBNYXRoLm1heCh0aW1lMSwgdGltZTIpO1xuICAgICAgICB0aGlzLmFuaW1hdGUoW3gwLHgxXSxbeTAseTFdLCB0aW1lKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5mbGFnID0gMztcbiAgfVxuICBoYW5kbGVDYW5jZWwoKSB7XG4gICAgY29uc29sZS5sb2coXCIqKmNhbmNlbCoqXCIpO1xuICAgIHRoaXMuZmxhZyA9IDM7XG4gIH1cbn1cbmV4cG9ydCBkZWZhdWx0IFBoYXNlO1xuIiwiLyoqXG4gKiDlpITnkIbmqKHmnb9cbiAqL1xuaW1wb3J0IFBoYXNlIGZyb20gXCIuL3BoYXNlL2luZGV4XCI7XG5cbmNsYXNzIFRyYWNlIGV4dGVuZHMgUGhhc2V7XG4gIGNvbnN0cnVjdG9yKHApIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMucCA9IHA7XG4gICAgdGhpcy5ldmVudHMgPSBbXTtcbiAgfVxuICBnZXQgY2hpbGQoKSB7XG4gICAgcmV0dXJuIHRoaXMucC5jaGlsZDtcbiAgfVxuICBnZXQgcGFyZW50KCkge1xuICAgIHJldHVybiB0aGlzLnAucGFyZW50O1xuICB9XG4gIGdldCBtYXhZKCkge1xuICAgIHJldHVybiB0aGlzLnAubWF4WTtcbiAgfVxuICBnZXQgbWF4WCgpIHtcbiAgICByZXR1cm4gdGhpcy5wLm1heFg7XG4gIH1cbiAgc2V0IGZsYWcodmFsdWUpIHtcbiAgICB0aGlzLnAuZmxhZyA9IHZhbHVlO1xuICB9XG4gIGdldCBmbGFnKCkge1xuICAgIHJldHVybiB0aGlzLnAuZmxhZztcbiAgfVxuICBzZXQgeDAodmFsdWUpIHtcbiAgICB0aGlzLnAueDAgPSB2YWx1ZTtcbiAgfVxuICBnZXQgeDAoKSB7XG4gICAgcmV0dXJuIHRoaXMucC54MDtcbiAgfVxuICBzZXQgeDEodmFsdWUpIHtcbiAgICB0aGlzLnAueDEgPSB2YWx1ZTtcbiAgfVxuICBnZXQgeDEoKSB7XG4gICAgcmV0dXJuIHRoaXMucC54MTtcbiAgfVxuICBzZXQgeTAodmFsdWUpIHtcbiAgICB0aGlzLnAueTAgPSB2YWx1ZTtcbiAgfVxuICBnZXQgeTAoKSB7XG4gICAgcmV0dXJuIHRoaXMucC55MDtcbiAgfVxuICBzZXQgeTEodmFsdWUpIHtcbiAgICB0aGlzLnAueTEgPSB2YWx1ZTtcbiAgfVxuICBnZXQgeTEoKSB7XG4gICAgcmV0dXJuIHRoaXMucC55MTtcbiAgfVxuICBzZXQgc3RhcnRYKHZhbHVlKSB7XG4gICAgdGhpcy5wLnN0YXJ0WCA9IHZhbHVlO1xuICB9XG4gIGdldCBzdGFydFgoKSB7XG4gICAgcmV0dXJuIHRoaXMucC5zdGFydFg7XG4gIH1cbiAgc2V0IHN0YXJ0WSh2YWx1ZSkge1xuICAgIHRoaXMucC5zdGFydFkgPSB2YWx1ZTtcbiAgfVxuICBnZXQgc3RhcnRZKCkge1xuICAgIHJldHVybiB0aGlzLnAuc3RhcnRZO1xuICB9XG4gIHNldCBzdGFydFRpbWUodmFsdWUpIHtcbiAgICB0aGlzLnAuc3RhcnRUaW1lID0gdmFsdWU7XG4gIH1cbiAgZ2V0IHN0YXJ0VGltZSgpIHtcbiAgICByZXR1cm4gdGhpcy5wLnN0YXJ0VGltZTtcbiAgfVxuICBsaXN0ZW4oKSB7XG4gICAgdGhpcy5ldmVudHMuZm9yRWFjaChldmVudCA9PiB7XG4gICAgICBldmVudFsxXS5hZGRFdmVudExpc3RlbmVyKGV2ZW50WzBdLCB0aGlzKTtcbiAgICB9KTtcbiAgfVxufVxuZXhwb3J0IGRlZmF1bHQgVHJhY2U7XG4iLCJpbXBvcnQgVHJhY2UgZnJvbSBcIi4uL2luZGV4XCI7XG5cbmNsYXNzIE1vdXNlVHJhY2UgZXh0ZW5kcyBUcmFjZXtcbiAgY29uc3RydWN0b3IocCkge1xuICAgIHN1cGVyKHApO1xuICAgIHRoaXMuaW5pdEV2ZW50cygpO1xuICB9XG4gIGluaXRFdmVudHMoKSB7XG4gICAgdGhpcy5ldmVudHMucHVzaCguLi5bXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcbiAgICAgIFtcIm1vdXNlZG93blwiLCB0aGlzLmNoaWxkXSxcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxuICAgICAgW1wibW91c2Vtb3ZlXCIsIHdpbmRvd10sXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcbiAgICAgIFtcIm1vdXNldXBcIiwgd2luZG93XSxcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxuICAgICAgW1wibW91c2VjYW5jZWxcIiwgd2luZG93XVxuICAgIF0pO1xuICB9XG4gIGhhbmRsZUV2ZW50KGV2ZW50KSB7XG4gICAgZXZlbnQgPSBzdXBlci51bmlmeUV2ZW50KGV2ZW50KTtcbiAgICBzd2l0Y2ggKGV2ZW50LnR5cGUpIHtcbiAgICBjYXNlIFwibW91c2Vkb3duXCI6IHtcbiAgICAgIHRoaXMuaGFuZGxlU3RhcnQoZXZlbnQpO1xuICAgIH1icmVhaztcbiAgICBjYXNlIFwibW91c2Vtb3ZlXCI6IHtcbiAgICAgIHRoaXMuaGFuZGxlR29pbmcoZXZlbnQpO1xuICAgIH1icmVhaztcbiAgICBjYXNlIFwibW91c2V1cFwiOiB7XG4gICAgICB0aGlzLmhhbmRsZVN0b3AoKTtcbiAgICB9YnJlYWs7XG4gICAgY2FzZSBcIm1vdXNlY2FuY2VsXCI6IHtcbiAgICAgIHRoaXMuaGFuZGxlQ2FuY2VsKCk7XG4gICAgfWJyZWFrO1xuICAgIH1cbiAgfVxufVxuZXhwb3J0IGRlZmF1bHQgTW91c2VUcmFjZTtcbiIsImltcG9ydCBUcmFjZSBmcm9tIFwiLi4vaW5kZXhcIjtcblxuY2xhc3MgVG91Y2hUcmFjZSBleHRlbmRzIFRyYWNle1xuICBjb25zdHJ1Y3RvcihwKSB7XG4gICAgc3VwZXIocCk7XG4gICAgdGhpcy5pbml0RXZlbnRzKCk7XG4gIH1cbiAgaW5pdEV2ZW50cygpIHtcbiAgICB0aGlzLmV2ZW50cy5wdXNoKC4uLltcbiAgICAgIFtcInRvdWNoc3RhcnRcIiwgdGhpcy5jaGlsZF0sXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcbiAgICAgIFtcInRvdWNobW92ZVwiLCB3aW5kb3ddLFxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG4gICAgICBbXCJ0b3VjaGVuZFwiLCB3aW5kb3ddLFxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG4gICAgICBbXCJ0b3VjaGNhbmNlbFwiLCB3aW5kb3ddXG4gICAgXSk7XG4gIH1cbiAgaGFuZGxlRXZlbnQoZXZlbnQpIHtcbiAgICBldmVudCA9IHRoaXMudW5pZnlFdmVudChldmVudCk7XG4gICAgc3dpdGNoIChldmVudC50eXBlKSB7XG4gICAgY2FzZSBcInRvdWNoc3RhcnRcIjoge1xuICAgICAgdGhpcy5oYW5kbGVTdGFydChldmVudCk7XG4gICAgfWJyZWFrO1xuICAgIGNhc2UgXCJ0b3VjaG1vdmVcIjoge1xuICAgICAgdGhpcy5oYW5kbGVHb2luZyhldmVudCk7XG4gICAgfWJyZWFrO1xuICAgIGNhc2UgXCJ0b3VjaGVuZFwiOiB7XG4gICAgICB0aGlzLmhhbmRsZVN0b3AoKTtcbiAgICB9YnJlYWs7XG4gICAgY2FzZSBcInRvdWNoY2FuY2VsXCI6IHtcbiAgICAgIHRoaXMuaGFuZGxlQ2FuY2VsKCk7XG4gICAgfWJyZWFrO1xuICAgIH1cbiAgfVxuICB1bmlmeUV2ZW50KGV2ZW50KSB7XG4gICAgaWYoZXZlbnQudG91Y2hlcyAmJiBldmVudC50b3VjaGVzWzBdKSB7XG4gICAgICBldmVudC5wYWdlWCA9IGV2ZW50LnRvdWNoZXNbMF0ucGFnZVg7XG4gICAgICBldmVudC5wYWdlWSA9IGV2ZW50LnRvdWNoZXNbMF0ucGFnZVk7XG4gICAgfVxuICAgIHJldHVybiBldmVudDtcbiAgfVxufVxuZXhwb3J0IGRlZmF1bHQgVG91Y2hUcmFjZTtcbiIsImltcG9ydCB7c2V0U3R5bGUsIGdldFdpZHRoQW5kSGVpZ2h0LCBnZXRXaWR0aEFuZEhlaWdodFdpdGhCb3JkZXJ9IGZyb20gXCIuLi8uLi91dGlscy9pbmRleFwiO1xuXG4vKipcbiAqIFBhcnRpY2xlOiDnspLlrZBcbiAqL1xuY2xhc3MgUGFydGljbGUge1xuICBjb25zdHJ1Y3RvcihjaGlsZCkge1xuICAgIHRoaXMuY2hpbGQgPSBjaGlsZDtcbiAgICB0aGlzLmluaXQoKTtcbiAgfVxuICBpbml0KCkge1xuICAgIHRoaXMucGFyZW50ID0gdGhpcy5jaGlsZC5wYXJlbnRFbGVtZW50O1xuICAgIGxldCBbcGFyZW50V2lkdGgsIHBhcmVudEhlaWdodCBdID1nZXRXaWR0aEFuZEhlaWdodCh0aGlzLnBhcmVudCksXG4gICAgICBbY2hpbGRXaWR0aCwgY2hpbGRIZWlnaHRdID0gZ2V0V2lkdGhBbmRIZWlnaHRXaXRoQm9yZGVyKHRoaXMuY2hpbGQpO1xuICAgIHRoaXMubWF4WSA9IHBhcmVudEhlaWdodCAtIGNoaWxkSGVpZ2h0O1xuICAgIHRoaXMubWF4WCA9IHBhcmVudFdpZHRoIC0gY2hpbGRXaWR0aDtcbiAgICB0aGlzLngwID0gMDsgIC8vIHgg6LW354K5XG4gICAgdGhpcy55MCA9IDA7ICAvLyB5IOi1t+eCuVxuICAgIHRoaXMueDEgPSAwOyAgLy8geCDnu4jngrlcbiAgICB0aGlzLnkxID0gMDsgIC8vIHkg57uI54K5XG4gICAgdGhpcy5zdGFydFggPSAwOyAgLy8g5b2T5YmNIHgg6LW354K5XG4gICAgdGhpcy5zdGFydFkgPSAwOyAgLy8g5b2T5YmNIHkg6LW354K5XG4gICAgdGhpcy5mbGFnID0gMDsgIC8vIOS6i+S7tuWkhOeQhumYtuaute+8jOm7mOiupCAw77yMbm90IGJlIHRyYWNlZFxuICAgIHRoaXMuc3RhcnRUaW1lID0gRGF0ZS5ub3coKTsgIC8vIOW8gOWni+aXtumXtFxuICB9XG4gIGluaXRTdHlsZSgpIHtcbiAgICBzZXRTdHlsZSh0aGlzLmNoaWxkLCB7XCJ1c2VyLXNlbGVjdFwiOiBcIm5vbmVcIn0pO1xuICB9XG59XG5leHBvcnQgZGVmYXVsdCBQYXJ0aWNsZTtcbiIsImltcG9ydCBUcmFjZSBmcm9tIFwiLi4vaW5kZXhcIjtcbmNsYXNzIFBvaW50ZXJUcmFjZSBleHRlbmRzIFRyYWNle1xuICBjb25zdHJ1Y3RvcihwKSB7XG4gICAgc3VwZXIocCk7XG4gICAgdGhpcy5pbml0RXZlbnRzKCk7XG4gIH1cbiAgaW5pdEV2ZW50cygpIHtcbiAgICB0aGlzLmV2ZW50cy5wdXNoKC4uLltcbiAgICAgIFtcInBvaW50ZXJkb3duXCIsIHRoaXMuY2hpbGRdLFxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG4gICAgICBbXCJwb2ludGVybW92ZVwiLCB3aW5kb3ddLFxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG4gICAgICBbXCJwb2ludGVydXBcIiwgd2luZG93XSxcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxuICAgICAgW1wicG9pbnRlcmNhbmNlbFwiLCB3aW5kb3ddXG4gICAgXSk7XG4gIH1cbiAgaGFuZGxlRXZlbnQoZXZlbnQpIHtcbiAgICBldmVudCA9IHN1cGVyLnVuaWZ5RXZlbnQoZXZlbnQpO1xuICAgIHN3aXRjaCAoZXZlbnQudHlwZSkge1xuICAgIGNhc2UgXCJwb2ludGVyZG93blwiOiB7XG4gICAgICB0aGlzLmhhbmRsZVN0YXJ0KGV2ZW50KTtcbiAgICB9YnJlYWs7XG4gICAgY2FzZSBcInBvaW50ZXJtb3ZlXCI6IHtcbiAgICAgIHRoaXMuaGFuZGxlR29pbmcoZXZlbnQpO1xuICAgIH1icmVhaztcbiAgICBjYXNlIFwicG9pbnRlcnVwXCI6IHtcbiAgICAgIHRoaXMuaGFuZGxlU3RvcCgpO1xuICAgIH1icmVhaztcbiAgICBjYXNlIFwicG9pbnRlcmNhbmNlbFwiOiB7XG4gICAgICB0aGlzLmhhbmRsZUNhbmNlbCgpO1xuICAgIH1icmVhaztcbiAgICB9XG4gIH1cbn1cbmV4cG9ydCBkZWZhdWx0IFBvaW50ZXJUcmFjZTtcbiIsImltcG9ydCBUcmFjZSBmcm9tIFwiLi4vaW5kZXhcIjtcbmNsYXNzIFdoZWVsVHJhY2UgZXh0ZW5kcyBUcmFjZXtcbiAgY29uc3RydWN0b3IocCkge1xuICAgIHN1cGVyKHApO1xuICAgIHRoaXMuaW5pdEV2ZW50cygpO1xuICB9XG4gIGluaXRFdmVudHMoKSB7XG4gICAgdGhpcy5ldmVudHMucHVzaCguLi5bXG4gICAgICBbXCJ3aGVlbFwiLCB0aGlzLmNoaWxkXSxcbiAgICAgIFtcIm1vdXNld2hlZWxcIiwgdGhpcy5jaGlsZF0sXG4gICAgICBbXCJET01Nb3VzZVNjcm9sbFwiLCB0aGlzLmNoaWxkXVxuICAgIF0pO1xuICB9XG4gIGhhbmRsZUV2ZW50KGV2ZW50KSB7XG4gICAgZXZlbnQgPSB0aGlzLnVuaWZ5RXZlbnQoZXZlbnQpO1xuICAgIHN3aXRjaCAoZXZlbnQudHlwZSkge1xuICAgIGNhc2UgXCJ3aGVlbFwiOiB7XG4gICAgICBsZXQgeDEgPSB0aGlzLngxICsgKC1ldmVudC5kZWx0YVgpLFxuICAgICAgICB5MSA9IHRoaXMueTEgKyAoLWV2ZW50LmRlbHRhWSk7XG4gICAgICBpZih5MSA8IHRoaXMubWF4WSkge1xuICAgICAgICB5MSA9IHRoaXMubWF4WTtcbiAgICAgIH1cbiAgICAgIGlmKHkxID4gMCkge1xuICAgICAgICB5MSA9IDA7XG4gICAgICB9XG4gICAgICB0aGlzLnRyYW5zbGF0ZSh5MSk7XG4gICAgICAvLyBpZihEYXRlLm5vdygpIC0gdGhpcy5zdGFydFRpbWUgPiAzMDApIHtcbiAgICAgIC8vICAgdGhpcy5zdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgLy8gICB0aGlzLngwID0gdGhpcy54MTtcbiAgICAgIC8vICAgdGhpcy55MCA9IHRoaXMueTE7XG4gICAgICAvLyB9XG4gICAgfWJyZWFrO1xuICAgIH1cbiAgfVxuICB1bmlmeUV2ZW50KGV2ZW50KSB7XG4gICAgLy8gMS4g5qCH5YeGIOm8oOagh+a7mui9ruS6i+S7tlxuICAgIGlmKFwiZGVsdGFYXCIgaW4gZXZlbnQpIHtcbiAgICAgIGNvbnNvbGUubG9nKGV2ZW50KTtcbiAgICB9IGVsc2UgaWYoXCJ3aGVlbERlbHRheFwiIGluIGV2ZW50KSB7XG4gICAgICAvLyAyLiBtb3VzZXdoZWVsIOS6i+S7tlxuICAgIH0gZWxzZSBpZihcIndoZWVsRGVsdGFcIiBpbiBldmVudCkge1xuXG4gICAgfSBlbHNlIGlmKFwiZGV0YWlsXCIgaW4gZXZlbnQpIHtcbiAgICAgIC8vIDMuIERPTU1vdXNlU2Nyb2xsIOS6i+S7tlxuICAgIH1cbiAgICByZXR1cm4gZXZlbnQ7XG4gIH1cbn1cbmV4cG9ydCBkZWZhdWx0IFdoZWVsVHJhY2U7XG4iLCJpbXBvcnQgTW91c2VUcmFjZSBmcm9tIFwiLi9jb3JlL3RyYWNlL2V2ZW50L21vdXNlLXRyYWNlLmpzXCI7XG5pbXBvcnQgVG91Y2hUcmFjZSBmcm9tIFwiLi9jb3JlL3RyYWNlL2V2ZW50L3RvdWNoLXRyYWNlXCI7XG5pbXBvcnQgUGFydGljbGUgZnJvbSBcIi4vY29yZS9wYXJ0aWNsZS9pbmRleFwiO1xuaW1wb3J0IFBvaW50ZXJUcmFjZSBmcm9tIFwiLi9jb3JlL3RyYWNlL2V2ZW50L3BvaW50ZXItdHJhY2VcIjtcbmltcG9ydCBXaGVlbFRyYWNlIGZyb20gXCIuL2NvcmUvdHJhY2UvZXZlbnQvd2hlZWwtdHJhY2VcIjtcbmNvbnN0IHZpYiA9IHtcbiAgYmVnaW46IChlbGUpID0+IHtcbiAgICBsZXQgcCA9IG5ldyBQYXJ0aWNsZShlbGUpO1xuICAgIGxldCBtb3VzZVRyYWNlID0gbmV3IE1vdXNlVHJhY2UocCksXG4gICAgICB0b3VjaFRyYWNlID0gbmV3IFRvdWNoVHJhY2UocCksXG4gICAgICB3aGVlbFRyYWNlID0gbmV3IFdoZWVsVHJhY2UocCksXG4gICAgICBwb2ludGVyVHJhY2UgPSBuZXcgUG9pbnRlclRyYWNlKHApO1xuICAgIG1vdXNlVHJhY2UubGlzdGVuKCk7XG4gICAgdG91Y2hUcmFjZS5saXN0ZW4oKTtcbiAgICB3aGVlbFRyYWNlLmxpc3RlbigpO1xuICAgIC8vIHBvaW50ZXJUcmFjZS5saXN0ZW4oKTtcbiAgfVxufTtcbmV4cG9ydCBkZWZhdWx0IHZpYjtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUlBLE1BQU0sUUFBUSxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksS0FBSztB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QU0sR0FBRyxLQUFLLENBQUM7QUFDeEI7QUFDQSxJQUFJLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsTUFBTSxDQUFDO0FBQzlCLElBQUksSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxNQUFNLENBQUM7QUFDOUIsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDdEQsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDdEQsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUMzQixJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxTQUFTLEdBQUcsR0FBRyxFQUFFO0FBQzFDLE1BQU0sSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDbEMsTUFBTSxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7QUFDeEIsTUFBTSxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7QUFDeEIsS0FBSztBQUNMLEdBQUc7QUFDSCxFQUFFLFVBQVUsR0FBRztBQUNmLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUM1QixJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLEVBQUU7QUFDeEIsTUFBTSxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztBQUNwQixNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxTQUFTLEdBQUcsR0FBRyxFQUFFO0FBQzVDLFFBQVEsSUFB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
