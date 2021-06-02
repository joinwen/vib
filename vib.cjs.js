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
    setStyle(this.ele,{
      top: `${-value}px`
    });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmliLmNqcy5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL3V0aWxzL2luZGV4LmpzIiwiLi4vc3JjL2NvcmUvYW5pbWF0aW9uL3N0cmF0ZWd5LmpzIiwiLi4vc3JjL2NvcmUvYW5pbWF0aW9uL2luZGV4LmpzIiwiLi4vc3JjL2NvcmUvdHJhY2UvcGhhc2UvaW5kZXguanMiLCIuLi9zcmMvY29yZS90cmFjZS9pbmRleC5qcyIsIi4uL3NyYy9jb3JlL3RyYWNlL2V2ZW50L21vdXNlLXRyYWNlLmpzIiwiLi4vc3JjL2NvcmUvdHJhY2UvZXZlbnQvdG91Y2gtdHJhY2UuanMiLCIuLi9zcmMvY29yZS9zY3JvbGxiYXIvaW5kZXguanMiLCIuLi9zcmMvY29yZS9wYXJ0aWNsZS9pbmRleC5qcyIsIi4uL3NyYy9jb3JlL3RyYWNlL2V2ZW50L3BvaW50ZXItdHJhY2UuanMiLCIuLi9zcmMvY29yZS90cmFjZS9ldmVudC93aGVlbC10cmFjZS5qcyIsIi4uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBnZXRTdHlsZSA9IChlbGUsIGF0dHIpID0+IHtcclxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcclxuICByZXR1cm4gZG9jdW1lbnQuZGVmYXVsdFZpZXcuZ2V0Q29tcHV0ZWRTdHlsZShlbGUpW2F0dHJdO1xyXG59O1xyXG5jb25zdCBzZXRTdHlsZSA9IChlbGUsIGRhdGEpID0+IHtcclxuICBsZXQgYXR0ciA9IE9iamVjdC5rZXlzKGRhdGEpWzBdO1xyXG4gIGVsZS5zdHlsZVthdHRyXSA9IGRhdGFbYXR0cl07XHJcbn07XHJcbmNvbnN0IGdldFdpZHRoID0gKGVsZSkgPT4ge1xyXG4gIHJldHVybiBlbGUuY2xpZW50V2lkdGg7XHJcbn07XHJcbmNvbnN0IGdldEhlaWdodCA9IChlbGUpID0+IHtcclxuICByZXR1cm4gZWxlLmNsaWVudEhlaWdodDtcclxufTtcclxuY29uc3QgZ2V0V2lkdGhBbmRIZWlnaHQgPSAoZWxlKSA9PiB7XHJcbiAgcmV0dXJuIFtcclxuICAgIGdldFdpZHRoKGVsZSksXHJcbiAgICBnZXRIZWlnaHQoZWxlKVxyXG4gIF07XHJcbn07XHJcbmNvbnN0IGdldFdpZHRoV2l0aEJvcmRlciA9IChlbGUpID0+IHtcclxuICByZXR1cm4gZWxlLm9mZnNldFdpZHRoO1xyXG59O1xyXG5jb25zdCBnZXRIZWlnaHRXaXRoQm9yZGVyID0gKGVsZSkgPT4ge1xyXG4gIHJldHVybiBlbGUub2Zmc2V0SGVpZ2h0O1xyXG59O1xyXG5cclxuY29uc3QgZ2V0V2lkdGhBbmRIZWlnaHRXaXRoQm9yZGVyID0gKGVsZSkgPT4ge1xyXG4gIHJldHVybiBbXHJcbiAgICBnZXRXaWR0aFdpdGhCb3JkZXIoZWxlKSxcclxuICAgIGdldEhlaWdodFdpdGhCb3JkZXIoZWxlKVxyXG4gIF07XHJcbn07XHJcblxyXG5jb25zdCBzdHlsZTJTdHJpbmcgPSAoc3R5bGUpID0+IHtcclxuICByZXR1cm4gT2JqZWN0LmtleXMoc3R5bGUpLnJlZHVjZSgocHJldixuZXh0KSA9PiB7XHJcbiAgICByZXR1cm4gcHJldiArIGAke25leHR9OiAke3N0eWxlW25leHRdfTtgO1xyXG4gIH0sXCJcIik7XHJcbn07XHJcblxyXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcclxuY29uc3QgcmFmID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCBmdW5jdGlvbihjYWxsYmFjaykge1xyXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxyXG4gIHdpbmRvdy5zZXRUaW1lb3V0KChjYWxsYmFjayksIDE3KTtcclxufTtcclxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXHJcbmNvbnN0IGNhbmNlbFJhZiA9IHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSB8fCBjbGVhclRpbWVvdXQ7XHJcblxyXG5leHBvcnQge1xyXG4gIHN0eWxlMlN0cmluZyxcclxuICByYWYsXHJcbiAgY2FuY2VsUmFmLFxyXG4gIGdldFN0eWxlLFxyXG4gIHNldFN0eWxlLFxyXG4gIGdldFdpZHRoLFxyXG4gIGdldEhlaWdodCxcclxuICBnZXRXaWR0aEFuZEhlaWdodCxcclxuICBnZXRXaWR0aFdpdGhCb3JkZXIsXHJcbiAgZ2V0SGVpZ2h0V2l0aEJvcmRlcixcclxuICBnZXRXaWR0aEFuZEhlaWdodFdpdGhCb3JkZXJcclxufTtcclxuIiwiY29uc3QgU1RSQVRFR1lfTElTVCA9IHtcbiAgbGluZWFyOiAocHJvZ3Jlc3MpID0+IHtcbiAgICByZXR1cm4gcHJvZ3Jlc3M7XG4gIH0sXG4gIGVhc2VJbjogKHByb2dyZXNzKSA9PiB7XG4gICAgcmV0dXJuIFNUUkFURUdZX0xJU1QuZWFzZUluUXVhZChwcm9ncmVzcyk7XG4gIH0sXG4gIGVhc2VJblF1YWQ6IChwcm9nb3Jlc3MpID0+IHtcbiAgICByZXR1cm4gTWF0aC5wb3cocHJvZ29yZXNzLCAyKTtcbiAgfSxcbiAgZWFzZUluQ3ViaWM6IChwcm9ncmVzcykgPT4ge1xuICAgIHJldHVybiBNYXRoLnBvdyhwcm9ncmVzcywgMyk7XG4gIH0sXG4gIGVhc2VJblF1YXJ0OiAocHJvZ3Jlc3MpID0+IHtcbiAgICByZXR1cm4gTWF0aC5wb3cocHJvZ3Jlc3MsIDQpO1xuICB9LFxuICBlYXNlSW5RdWludDogKHByb2dyZXNzKSA9PiB7XG4gICAgcmV0dXJuIE1hdGgucG93KHByb2dyZXNzLCA1KTtcbiAgfSxcbiAgZWFzZU91dDogKHByb2dyZXNzKSA9PiB7XG4gICAgcmV0dXJuIFNUUkFURUdZX0xJU1QuZWFzZU91dFF1YWQocHJvZ3Jlc3MpO1xuICB9LFxuICBlYXNlT3V0UXVhZDogKHByb2dyZXNzKSA9PiB7XG4gICAgcmV0dXJuIHByb2dyZXNzICogMiAtIE1hdGgucG93KHByb2dyZXNzLCAyKTtcbiAgfSxcbiAgZWFzZU91dEN1YmljOiAocHJvZ3Jlc3MpID0+IHtcbiAgICByZXR1cm4gTWF0aC5wb3cocHJvZ3Jlc3MgLSAxLCAzKSArIDE7XG4gIH0sXG4gIGVhc2VPdXRRdWFydDogKHByb2dyZXNzKSA9PiB7XG4gICAgcmV0dXJuIDEgLSBNYXRoLnBvdyhwcm9ncmVzcyAtIDEsIDQpO1xuICB9LFxuICBlYXNlT3V0UXVpbnQ6IChwcm9ncmVzcykgPT4ge1xuICAgIHJldHVybiBNYXRoLnBvdyhwcm9ncmVzcyAtIDEsIDUpICsgMTtcbiAgfSxcbiAgYmFjazogKHByb2dyZXNzKSA9PiB7XG4gICAgbGV0IGIgPSA0O1xuICAgIHJldHVybiAocHJvZ3Jlc3MgPSBwcm9ncmVzcyAtIDEpICogcHJvZ3Jlc3MgKiAoKGIgKyAxKSAqIHByb2dyZXNzICsgYikgKyAxO1xuICB9LFxuICBib3VuY2U6IChwcm9ncmVzcykgPT4ge1xuICAgIGlmICgocHJvZ3Jlc3MgLz0gMSkgPCAxIC8gMi43NSkge1xuICAgICAgcmV0dXJuIDcuNTYyNSAqIHByb2dyZXNzICogcHJvZ3Jlc3M7XG4gICAgfSBlbHNlIGlmIChwcm9ncmVzcyA8IDIgLyAyLjc1KSB7XG4gICAgICByZXR1cm4gNy41NjI1ICogKHByb2dyZXNzIC09IDEuNSAvIDIuNzUpICogcHJvZ3Jlc3MgKyAwLjc1O1xuICAgIH0gZWxzZSBpZiAocHJvZ3Jlc3MgPCAyLjUgLyAyLjc1KSB7XG4gICAgICByZXR1cm4gNy41NjI1ICogKHByb2dyZXNzIC09IDIuMjUgLyAyLjc1KSAqIHByb2dyZXNzICsgMC45Mzc1O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gNy41NjI1ICogKHByb2dyZXNzIC09IDIuNjI1IC8gMi43NSkgKiBwcm9ncmVzcyArIDAuOTg0Mzc1O1xuICAgIH1cbiAgfSxcbiAgZWxhc3RpYzogKHByb2dyZXNzKSA9PiB7XG4gICAgdmFyIGYgPSAwLjIyLFxuICAgICAgZSA9IDAuNDtcblxuICAgIGlmIChwcm9ncmVzcyA9PT0gMCkge1xuICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIGlmIChwcm9ncmVzcyA9PT0gMSkge1xuICAgICAgcmV0dXJuIDE7XG4gICAgfVxuXG4gICAgcmV0dXJuIGUgKiBNYXRoLnBvdygyLCAtMTAgKiBwcm9ncmVzcykgKiBNYXRoLnNpbigoKHByb2dyZXNzIC0gZiAvIDQpICogKDIgKiBNYXRoLlBJKSkgLyBmKSArIDE7XG4gIH0sXG59O1xuY29uc3QgU1RSQVRFR1kgPSB7fTtcbk9iamVjdC5rZXlzKFNUUkFURUdZX0xJU1QpLmZvckVhY2goKGtleSkgPT4ge1xuICBTVFJBVEVHWVtrZXldID0ga2V5O1xufSk7XG5leHBvcnQgeyBTVFJBVEVHWV9MSVNULCBTVFJBVEVHWSB9O1xuIiwiaW1wb3J0IHtjYW5jZWxSYWYsIHJhZiwgc2V0U3R5bGV9IGZyb20gXCIuLi8uLi91dGlscy9pbmRleFwiO1xuaW1wb3J0IHtTVFJBVEVHWV9MSVNUfSBmcm9tIFwiLi9zdHJhdGVneVwiO1xuY2xhc3MgQW5pbWF0aW9uIHtcbiAgLyoqXG4gICAqXG4gICAqIEBwYXJhbSB4MCDotbfngrlcbiAgICogQHBhcmFtIHgxIOe7iOeCuVxuICAgKiBAcGFyYW0gZHVyYXRpb24g5Yqo55S75pe26ZW/XG4gICAqL1xuICBhbmltYXRlKFt4MCwgeDFdLCBbeTAsIHkxXSwgZHVyYXRpb24sIHN0cmF0ZWd5ID0gXCJlYXNlT3V0UXVpbnRcIikge1xuICAgIGxldCBzdGFydCA9IERhdGUubm93KCksXG4gICAgICBzdHJhdGVneUZuID0gU1RSQVRFR1lfTElTVFtzdHJhdGVneV07XG4gICAgbGV0IGZuID0gKCkgPT4ge1xuICAgICAgbGV0IHBhc3NlZCA9IERhdGUubm93KCkgLSBzdGFydCxcbiAgICAgICAgcHJvZ3Jlc3MgPSB0aGlzLnJvdW5kKHN0cmF0ZWd5Rm4ocGFzc2VkIC8gZHVyYXRpb24pLCA2KSxcbiAgICAgICAgaWQgPSBudWxsLFxuICAgICAgICBkZWx0YVggPSB4MSAtIHgwLFxuICAgICAgICBkZWx0YVkgPSB5MSAtIHkwO1xuXG4gICAgICBpZih0aGlzLmZsYWcgPT09IDMpIHtcbiAgICAgICAgaWYocHJvZ3Jlc3MgPCAxKXtcbiAgICAgICAgICB0aGlzLnRyYW5zbGF0ZSh4MCArIGRlbHRhWCAqIHByb2dyZXNzLHkwICsgZGVsdGFZICogcHJvZ3Jlc3MpO1xuICAgICAgICAgIGlkID0gcmFmKGZuKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnRyYW5zbGF0ZSh4MCArIGRlbHRhWCwgeTAgKyBkZWx0YVkpO1xuICAgICAgICAgIGNhbmNlbFJhZihpZCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICAgIGZuKCk7XG4gIH1cbiAgcm91bmQobnVtYmVyLCBwcmVjaXNpb24pIHtcbiAgICByZXR1cm4gTWF0aC5yb3VuZCgrbnVtYmVyICsgXCJlXCIgKyBwcmVjaXNpb24pIC8gTWF0aC5wb3coMTAsIHByZWNpc2lvbik7XG4gIH1cbiAgdHJhbnNsYXRlKGhvclZhbHVlLCB2ZXJWYWx1ZSkge1xuICAgIHRoaXMueTEgPSBNYXRoLnJvdW5kKHZlclZhbHVlKTtcbiAgICB0aGlzLngxID0gTWF0aC5yb3VuZChob3JWYWx1ZSk7XG4gICAgdGhpcy5zY3JvbGxiYXIudXBkYXRlUG9zaXRpb24odGhpcy55MSk7XG4gICAgc2V0U3R5bGUodGhpcy5jaGlsZCwge1xuICAgICAgdHJhbnNmb3JtOiBgdHJhbnNsYXRlWSgke3RoaXMueTF9cHgpIHRyYW5zbGF0ZVgoJHt0aGlzLngxfXB4KWBcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKiBAcGFyYW0geDAg6LW354K5XG4gICAqIEBwYXJhbSB4MSDnu4jngrlcbiAgICogQHBhcmFtIHN0YXJ0VGltZSDotbflp4vml7bpl7RcbiAgICogQHBhcmFtIG1heCDmnIDlpKfkvY3np7tcbiAgICogQHBhcmFtIGEg5Yqg6YCf5bqmXG4gICAqIEByZXR1cm5zIHsoKnxudW1iZXIpW119XG4gICAqL1xuICBtb21lbnR1bSh4MCwgeDEsIHN0YXJ0VGltZSwgbWF4LCBhID0gMC4wMDA2KSB7XG4gICAgbGV0IHRpbWUsIGRpc3RhbmNlLCBzcGVlZCwgeCwgdDtcbiAgICB0aW1lID0gRGF0ZS5ub3coKSAtIHN0YXJ0VGltZTsgIC8vIOaXtumXtFxuICAgIGRpc3RhbmNlID0geDEgLSB4MDsgICAgICAgICAgICAgLy8g5L2N56e7XG4gICAgc3BlZWQgPSBNYXRoLmFicyhkaXN0YW5jZSkgLyB0aW1lOyAgLy8g5bmz5Z2H6YCf5bqmID0+IOi1t+Wni+mAn+W6plxuICAgIHggPSB4MSArIChzcGVlZCAqIHNwZWVkKSAvICgyICogYSkgKiAoZGlzdGFuY2UgPCAwID8gLTEgOiAxKTsgICAvLyDku6Vh5Li65Yqg6YCf5bqm5YyA5YeP6YCf5YiwMOeahOS9jeenu1xuICAgIHQgPSBzcGVlZCAvIGE7ICAvLyDljIDlh4/pgJ/ov5DliqjnmoTml7bpl7RcbiAgICBpZih4IDwgbWF4KSB7XG4gICAgICB4ID0gbWF4O1xuICAgICAgZGlzdGFuY2UgPSBNYXRoLmFicyh4IC0geDEpO1xuICAgICAgdCA9IGRpc3RhbmNlIC8gc3BlZWQ7XG4gICAgfVxuICAgIGlmKHggPiAwKSB7XG4gICAgICB4ID0gMDtcbiAgICAgIGRpc3RhbmNlID0gTWF0aC5hYnMoeDEpICsgeDtcbiAgICAgIHQgPSBkaXN0YW5jZSAvIHNwZWVkO1xuICAgIH1cbiAgICByZXR1cm4gW1xuICAgICAgeDEsXG4gICAgICBNYXRoLnJvdW5kKHgpLFxuICAgICAgdFxuICAgIF07XG4gIH1cbn1cbmV4cG9ydCBkZWZhdWx0IEFuaW1hdGlvbjtcbiIsImltcG9ydCBBbmltYXRpb24gZnJvbSBcIi4uLy4uL2FuaW1hdGlvbi9pbmRleFwiO1xyXG5jbGFzcyBQaGFzZSBleHRlbmRzIEFuaW1hdGlvbntcclxuICB1bmlmeUV2ZW50KGV2ZW50KSB7XHJcbiAgICByZXR1cm4gZXZlbnQ7XHJcbiAgfVxyXG4gIGhhbmRsZVN0YXJ0KGV2ZW50KSB7XHJcbiAgICBjb25zb2xlLmxvZyhcIioqc3RhcnQqKlwiKTtcclxuICAgIHRoaXMuZmxhZyA9IDE7XHJcbiAgICB0aGlzLmNoaWxkLmFkZEV2ZW50TGlzdGVuZXIoXCJzZWxlY3RzdGFydFwiLCAoZSkgPT4ge1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9KTtcclxuICAgIHRoaXMuc3RhcnRYID0gZXZlbnQucGFnZVg7XHJcbiAgICB0aGlzLnN0YXJ0WSA9IGV2ZW50LnBhZ2VZO1xyXG4gICAgdGhpcy54MCA9IHRoaXMueDE7XHJcbiAgICB0aGlzLnkwID0gdGhpcy55MTtcclxuICAgIHRoaXMuc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcclxuICB9XHJcbiAgaGFuZGxlR29pbmcoZXZlbnQpIHtcclxuICAgIGlmKFswLDNdLmluY2x1ZGVzKHRoaXMuZmxhZykpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdGhpcy5mbGFnID0gMjtcclxuICAgIGNvbnNvbGUubG9nKFwiKipnb2luZyoqXCIpO1xyXG4gICAgbGV0IG1vdmVYID0gZXZlbnQucGFnZVgsXHJcbiAgICAgIG1vdmVZID0gZXZlbnQucGFnZVksXHJcbiAgICAgIGRlbHRhWCA9IG1vdmVYIC0gdGhpcy5zdGFydFgsXHJcbiAgICAgIGRlbHRhWSA9IG1vdmVZIC0gdGhpcy5zdGFydFk7XHJcbiAgICB0aGlzLnN0YXJ0WCA9IG1vdmVYO1xyXG4gICAgdGhpcy5zdGFydFkgPSBtb3ZlWTtcclxuXHJcbiAgICBsZXQgeDEgPSB0aGlzLngxICsgZGVsdGFYO1xyXG4gICAgbGV0IHkxID0gdGhpcy55MSArIGRlbHRhWTtcclxuICAgIHkxID0geTEgPCB0aGlzLm1heFkgPyB0aGlzLm1heFkgOiB5MSA+IDAgPyAwIDogeTE7XHJcbiAgICB4MSA9IHgxIDwgdGhpcy5tYXhYID8gdGhpcy5tYXhYIDogeDEgPiAwID8gMCA6IHgxO1xyXG4gICAgdGhpcy50cmFuc2xhdGUoeDEsIHkxKTtcclxuICAgIGlmKERhdGUubm93KCkgLSB0aGlzLnN0YXJ0VGltZSA+IDMwMCkge1xyXG4gICAgICB0aGlzLnN0YXJ0VGltZSA9IERhdGUubm93KCk7XHJcbiAgICAgIHRoaXMueDAgPSB0aGlzLngxO1xyXG4gICAgICB0aGlzLnkwID0gdGhpcy55MTtcclxuICAgIH1cclxuICB9XHJcbiAgaGFuZGxlU3RvcCgpIHtcclxuICAgIGNvbnNvbGUubG9nKFwiKipzdG9wKipcIik7XHJcbiAgICBpZih0aGlzLmZsYWcgPT09IDIpIHtcclxuICAgICAgdGhpcy5mbGFnID0gMztcclxuICAgICAgaWYoRGF0ZS5ub3coKSAtIHRoaXMuc3RhcnRUaW1lIDwgMzAwKSB7XHJcbiAgICAgICAgbGV0IFt5MCwgeTEsIHRpbWUxXSA9IHRoaXMubW9tZW50dW0odGhpcy55MCwgdGhpcy55MSwgdGhpcy5zdGFydFRpbWUsIHRoaXMubWF4WSk7XHJcbiAgICAgICAgbGV0IFt4MCwgeDEsIHRpbWUyXSA9IHRoaXMubW9tZW50dW0odGhpcy54MCwgdGhpcy54MSwgdGhpcy5zdGFydFRpbWUsIHRoaXMubWF4WCk7XHJcbiAgICAgICAgbGV0IHRpbWUgPSAgTWF0aC5tYXgodGltZTEsIHRpbWUyKTtcclxuICAgICAgICBpZih0aW1lKSB7XHJcbiAgICAgICAgICB0aGlzLmFuaW1hdGUoW3gwLHgxXSxbeTAseTFdLCB0aW1lKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMuZmxhZyA9IDM7XHJcbiAgfVxyXG4gIGhhbmRsZUNhbmNlbCgpIHtcclxuICAgIGNvbnNvbGUubG9nKFwiKipjYW5jZWwqKlwiKTtcclxuICAgIHRoaXMuZmxhZyA9IDM7XHJcbiAgfVxyXG59XHJcbmV4cG9ydCBkZWZhdWx0IFBoYXNlO1xyXG4iLCIvKipcbiAqIOWkhOeQhuaooeadv1xuICovXG5pbXBvcnQgUGhhc2UgZnJvbSBcIi4vcGhhc2UvaW5kZXhcIjtcblxuY2xhc3MgVHJhY2UgZXh0ZW5kcyBQaGFzZXtcbiAgY29uc3RydWN0b3IocCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5wID0gcDtcbiAgICB0aGlzLmV2ZW50cyA9IFtdO1xuICB9XG4gIGdldCBjaGlsZCgpIHtcbiAgICByZXR1cm4gdGhpcy5wLmNoaWxkO1xuICB9XG4gIGdldCBwYXJlbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMucC5wYXJlbnQ7XG4gIH1cbiAgZ2V0IHNjcm9sbGJhcigpIHtcbiAgICByZXR1cm4gdGhpcy5wLnNjcm9sbGJhcjtcbiAgfVxuICBnZXQgbWF4WSgpIHtcbiAgICByZXR1cm4gdGhpcy5wLm1heFk7XG4gIH1cbiAgZ2V0IG1heFgoKSB7XG4gICAgcmV0dXJuIHRoaXMucC5tYXhYO1xuICB9XG4gIHNldCBmbGFnKHZhbHVlKSB7XG4gICAgdGhpcy5wLmZsYWcgPSB2YWx1ZTtcbiAgfVxuICBnZXQgZmxhZygpIHtcbiAgICByZXR1cm4gdGhpcy5wLmZsYWc7XG4gIH1cbiAgc2V0IHgwKHZhbHVlKSB7XG4gICAgdGhpcy5wLngwID0gdmFsdWU7XG4gIH1cbiAgZ2V0IHgwKCkge1xuICAgIHJldHVybiB0aGlzLnAueDA7XG4gIH1cbiAgc2V0IHgxKHZhbHVlKSB7XG4gICAgdGhpcy5wLngxID0gdmFsdWU7XG4gIH1cbiAgZ2V0IHgxKCkge1xuICAgIHJldHVybiB0aGlzLnAueDE7XG4gIH1cbiAgc2V0IHkwKHZhbHVlKSB7XG4gICAgdGhpcy5wLnkwID0gdmFsdWU7XG4gIH1cbiAgZ2V0IHkwKCkge1xuICAgIHJldHVybiB0aGlzLnAueTA7XG4gIH1cbiAgc2V0IHkxKHZhbHVlKSB7XG4gICAgdGhpcy5wLnkxID0gdmFsdWU7XG4gIH1cbiAgZ2V0IHkxKCkge1xuICAgIHJldHVybiB0aGlzLnAueTE7XG4gIH1cbiAgc2V0IHN0YXJ0WCh2YWx1ZSkge1xuICAgIHRoaXMucC5zdGFydFggPSB2YWx1ZTtcbiAgfVxuICBnZXQgc3RhcnRYKCkge1xuICAgIHJldHVybiB0aGlzLnAuc3RhcnRYO1xuICB9XG4gIHNldCBzdGFydFkodmFsdWUpIHtcbiAgICB0aGlzLnAuc3RhcnRZID0gdmFsdWU7XG4gIH1cbiAgZ2V0IHN0YXJ0WSgpIHtcbiAgICByZXR1cm4gdGhpcy5wLnN0YXJ0WTtcbiAgfVxuICBzZXQgc3RhcnRUaW1lKHZhbHVlKSB7XG4gICAgdGhpcy5wLnN0YXJ0VGltZSA9IHZhbHVlO1xuICB9XG4gIGdldCBzdGFydFRpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMucC5zdGFydFRpbWU7XG4gIH1cbiAgbGlzdGVuKCkge1xuICAgIHRoaXMuZXZlbnRzLmZvckVhY2goZXZlbnQgPT4ge1xuICAgICAgZXZlbnRbMV0uYWRkRXZlbnRMaXN0ZW5lcihldmVudFswXSwgdGhpcyk7XG4gICAgfSk7XG4gIH1cbn1cbmV4cG9ydCBkZWZhdWx0IFRyYWNlO1xuIiwiaW1wb3J0IFRyYWNlIGZyb20gXCIuLi9pbmRleFwiO1xyXG5cclxuY2xhc3MgTW91c2VUcmFjZSBleHRlbmRzIFRyYWNle1xyXG4gIGNvbnN0cnVjdG9yKHApIHtcclxuICAgIHN1cGVyKHApO1xyXG4gICAgdGhpcy5pbml0RXZlbnRzKCk7XHJcbiAgfVxyXG4gIGluaXRFdmVudHMoKSB7XHJcbiAgICB0aGlzLmV2ZW50cy5wdXNoKC4uLltcclxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXHJcbiAgICAgIFtcIm1vdXNlZG93blwiLCB0aGlzLmNoaWxkXSxcclxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXHJcbiAgICAgIFtcIm1vdXNlbW92ZVwiLCB3aW5kb3ddLFxyXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcclxuICAgICAgW1wibW91c2V1cFwiLCB3aW5kb3ddLFxyXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcclxuICAgICAgW1wibW91c2VjYW5jZWxcIiwgd2luZG93XVxyXG4gICAgXSk7XHJcbiAgfVxyXG4gIGhhbmRsZUV2ZW50KGV2ZW50KSB7XHJcbiAgICBldmVudCA9IHN1cGVyLnVuaWZ5RXZlbnQoZXZlbnQpO1xyXG4gICAgc3dpdGNoIChldmVudC50eXBlKSB7XHJcbiAgICBjYXNlIFwibW91c2Vkb3duXCI6IHtcclxuICAgICAgdGhpcy5oYW5kbGVTdGFydChldmVudCk7XHJcbiAgICB9YnJlYWs7XHJcbiAgICBjYXNlIFwibW91c2Vtb3ZlXCI6IHtcclxuICAgICAgdGhpcy5oYW5kbGVHb2luZyhldmVudCk7XHJcbiAgICB9YnJlYWs7XHJcbiAgICBjYXNlIFwibW91c2V1cFwiOiB7XHJcbiAgICAgIHRoaXMuaGFuZGxlU3RvcCgpO1xyXG4gICAgfWJyZWFrO1xyXG4gICAgY2FzZSBcIm1vdXNlY2FuY2VsXCI6IHtcclxuICAgICAgdGhpcy5oYW5kbGVDYW5jZWwoKTtcclxuICAgIH1icmVhaztcclxuICAgIH1cclxuICB9XHJcbn1cclxuZXhwb3J0IGRlZmF1bHQgTW91c2VUcmFjZTtcclxuIiwiaW1wb3J0IFRyYWNlIGZyb20gXCIuLi9pbmRleFwiO1xyXG5cclxuY2xhc3MgVG91Y2hUcmFjZSBleHRlbmRzIFRyYWNle1xyXG4gIGNvbnN0cnVjdG9yKHApIHtcclxuICAgIHN1cGVyKHApO1xyXG4gICAgdGhpcy5pbml0RXZlbnRzKCk7XHJcbiAgfVxyXG4gIGluaXRFdmVudHMoKSB7XHJcbiAgICB0aGlzLmV2ZW50cy5wdXNoKC4uLltcclxuICAgICAgW1widG91Y2hzdGFydFwiLCB0aGlzLmNoaWxkXSxcclxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXHJcbiAgICAgIFtcInRvdWNobW92ZVwiLCB3aW5kb3ddLFxyXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcclxuICAgICAgW1widG91Y2hlbmRcIiwgd2luZG93XSxcclxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXHJcbiAgICAgIFtcInRvdWNoY2FuY2VsXCIsIHdpbmRvd11cclxuICAgIF0pO1xyXG4gIH1cclxuICBoYW5kbGVFdmVudChldmVudCkge1xyXG4gICAgZXZlbnQgPSB0aGlzLnVuaWZ5RXZlbnQoZXZlbnQpO1xyXG4gICAgc3dpdGNoIChldmVudC50eXBlKSB7XHJcbiAgICBjYXNlIFwidG91Y2hzdGFydFwiOiB7XHJcbiAgICAgIHRoaXMuaGFuZGxlU3RhcnQoZXZlbnQpO1xyXG4gICAgfWJyZWFrO1xyXG4gICAgY2FzZSBcInRvdWNobW92ZVwiOiB7XHJcbiAgICAgIHRoaXMuaGFuZGxlR29pbmcoZXZlbnQpO1xyXG4gICAgfWJyZWFrO1xyXG4gICAgY2FzZSBcInRvdWNoZW5kXCI6IHtcclxuICAgICAgdGhpcy5oYW5kbGVTdG9wKCk7XHJcbiAgICB9YnJlYWs7XHJcbiAgICBjYXNlIFwidG91Y2hjYW5jZWxcIjoge1xyXG4gICAgICB0aGlzLmhhbmRsZUNhbmNlbCgpO1xyXG4gICAgfWJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICB1bmlmeUV2ZW50KGV2ZW50KSB7XHJcbiAgICBpZihldmVudC50b3VjaGVzICYmIGV2ZW50LnRvdWNoZXNbMF0pIHtcclxuICAgICAgZXZlbnQucGFnZVggPSBldmVudC50b3VjaGVzWzBdLnBhZ2VYO1xyXG4gICAgICBldmVudC5wYWdlWSA9IGV2ZW50LnRvdWNoZXNbMF0ucGFnZVk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZXZlbnQ7XHJcbiAgfVxyXG59XHJcbmV4cG9ydCBkZWZhdWx0IFRvdWNoVHJhY2U7XHJcbiIsImltcG9ydCB7Z2V0V2lkdGhBbmRIZWlnaHQsIGdldFdpZHRoQW5kSGVpZ2h0V2l0aEJvcmRlciwgc2V0U3R5bGUsIHN0eWxlMlN0cmluZ30gZnJvbSBcIi4uLy4uL3V0aWxzL2luZGV4XCI7XHJcblxyXG5jbGFzcyBTY3JvbGxiYXIge1xyXG4gIGNvbnN0cnVjdG9yKHApIHtcclxuICAgIGxldCBwYXJlbnQgPSBwLnBhcmVudCxcclxuICAgICAgY2hpbGQgPSBwLmNoaWxkLFxyXG4gICAgICBbcGFyZW50V2lkdGgsIHBhcmVudEhlaWdodCBdID1nZXRXaWR0aEFuZEhlaWdodChwYXJlbnQpLFxyXG4gICAgICBbY2hpbGRXaWR0aCwgY2hpbGRIZWlnaHRdID0gZ2V0V2lkdGhBbmRIZWlnaHRXaXRoQm9yZGVyKGNoaWxkKTtcclxuICAgIHRoaXMucmF0aW9YID0gcGFyZW50V2lkdGggLyBjaGlsZFdpZHRoO1xyXG4gICAgdGhpcy5yYXRpb1kgPSBwYXJlbnRIZWlnaHQgLyBjaGlsZEhlaWdodDtcclxuICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5yYXRpb1kgKiAxMDAgKyBcIiVcIjtcclxuICAgIHRoaXMud2lkdGggPSB0aGlzLnJhdGlvWCAqIDEwMCArIFwiJVwiO1xyXG4gICAgdGhpcy5pbml0RG9tKHBhcmVudCk7XHJcbiAgICB0aGlzLmluaXRFdmVudHMoKTtcclxuICB9XHJcbiAgaW5pdERvbShwYXJlbnQpIHtcclxuICAgIGxldCBwYXJlbnRTdHlsZSA9IHtcclxuICAgICAgICBwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLFxyXG4gICAgICAgIHRvcDogMCxcclxuICAgICAgICBib3R0b206IDAsXHJcbiAgICAgICAgcmlnaHQ6IFwiMnB4XCIsXHJcbiAgICAgICAgd2lkdGg6IFwiNnB4XCIsXHJcbiAgICAgIH0sXHJcbiAgICAgIGNoaWxkU3R5bGUgPSB7XHJcbiAgICAgICAgdG9wOiAwLFxyXG4gICAgICAgIGxlZnQ6IDAsXHJcbiAgICAgICAgcG9zaXRpb246IFwiYWJzb2x1dGVcIixcclxuICAgICAgICBcImJveC1zaXppbmdcIjogXCJib3JkZXItYm94XCIsXHJcbiAgICAgICAgaGVpZ2h0OiB0aGlzLmhlaWdodCxcclxuICAgICAgICB3aWR0aDogXCIxMDAlXCIsXHJcbiAgICAgICAgXCJib3JkZXItcmFkaXVzXCI6IFwiNHB4XCIsXHJcbiAgICAgICAgYmFja2dyb3VuZDogXCIjZGRkZWUwXCIsXHJcbiAgICAgIH07XHJcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcclxuICAgIGxldCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLFxyXG4gICAgICBodG1sID0gYDxkaXYgY2xhc3M9XCJzY3JvbGxlci1wYXJlbnRcIiBzdHlsZT1cIiR7c3R5bGUyU3RyaW5nKHBhcmVudFN0eWxlKX1cIj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzY3JvbGxlci1jaGlsZFwiIHN0eWxlPVwiJHtzdHlsZTJTdHJpbmcoY2hpbGRTdHlsZSl9XCI+PC9kaXY+XHJcbiAgICAgICAgICAgICA8L2Rpdj5gO1xyXG4gICAgZGl2LmlubmVySFRNTCA9IGh0bWw7XHJcbiAgICBwYXJlbnQuYXBwZW5kKGRpdi5maXJzdENoaWxkKTtcclxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxyXG4gICAgdGhpcy5lbGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnNjcm9sbGVyLWNoaWxkXCIpO1xyXG4gIH1cclxuICBpbml0RXZlbnRzKCkge1xyXG4gICAgdGhpcy5ldmVudHMgPSBbXHJcbiAgICAgIFtbXCJtb3VzZWRvd25cIixcInBvaW50ZXJkb3duXCIsXCJ0b3VjaHN0YXJ0XCJdLHRoaXMuZWxlXSxcclxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXHJcbiAgICAgIFtbXCJtb3VzZW1vdmVcIixcInBvaW50ZXJtb3ZlXCIsXCJ0b3VjaG1vdmVcIl0sIHdpbmRvd10sXHJcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxyXG4gICAgICBbW1wibW91c2V1cFwiLFwicG9pbnRlcnVwXCIsXCJ0b3VjaGVuZFwiXSwgd2luZG93XSxcclxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXHJcbiAgICAgIFtbXCJtb3VzZWNhbmNlbFwiLFwicG9pbnRlcmNhbmNlbFwiLFwidG91Y2hjYW5jZWxcIl0sIHdpbmRvd11cclxuICAgIF07XHJcbiAgfVxyXG4gIHVwZGF0ZVBvc2l0aW9uKHZhbHVlKSB7XHJcbiAgICB2YWx1ZSA9IHRoaXMucmF0aW9ZICogdmFsdWU7XHJcbiAgICBzZXRTdHlsZSh0aGlzLmVsZSx7XHJcbiAgICAgIHRvcDogYCR7LXZhbHVlfXB4YFxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcbmV4cG9ydCBkZWZhdWx0IFNjcm9sbGJhcjtcclxuIiwiaW1wb3J0IHtzZXRTdHlsZSwgZ2V0V2lkdGhBbmRIZWlnaHQsIGdldFdpZHRoQW5kSGVpZ2h0V2l0aEJvcmRlcn0gZnJvbSBcIi4uLy4uL3V0aWxzL2luZGV4XCI7XHJcbmltcG9ydCBTY3JvbGxiYXIgZnJvbSBcIi4uL3Njcm9sbGJhci9pbmRleFwiO1xyXG5cclxuLyoqXHJcbiAqIFBhcnRpY2xlOiDnspLlrZBcclxuICovXHJcbmNsYXNzIFBhcnRpY2xlIHtcclxuICBjb25zdHJ1Y3RvcihjaGlsZCkge1xyXG4gICAgdGhpcy5jaGlsZCA9IGNoaWxkO1xyXG4gICAgdGhpcy5pbml0KCk7XHJcbiAgfVxyXG4gIGluaXQoKSB7XHJcbiAgICB0aGlzLnBhcmVudCA9IHRoaXMuY2hpbGQucGFyZW50RWxlbWVudDtcclxuICAgIGxldCBbcGFyZW50V2lkdGgsIHBhcmVudEhlaWdodCBdID1nZXRXaWR0aEFuZEhlaWdodCh0aGlzLnBhcmVudCksXHJcbiAgICAgIFtjaGlsZFdpZHRoLCBjaGlsZEhlaWdodF0gPSBnZXRXaWR0aEFuZEhlaWdodFdpdGhCb3JkZXIodGhpcy5jaGlsZCk7XHJcbiAgICB0aGlzLm1heFkgPSBwYXJlbnRIZWlnaHQgLSBjaGlsZEhlaWdodDtcclxuICAgIHRoaXMubWF4WCA9IHBhcmVudFdpZHRoIC0gY2hpbGRXaWR0aDtcclxuICAgIHRoaXMueDAgPSAwOyAgLy8geCDotbfngrlcclxuICAgIHRoaXMueTAgPSAwOyAgLy8geSDotbfngrlcclxuICAgIHRoaXMueDEgPSAwOyAgLy8geCDnu4jngrlcclxuICAgIHRoaXMueTEgPSAwOyAgLy8geSDnu4jngrlcclxuICAgIHRoaXMuc3RhcnRYID0gMDsgIC8vIOW9k+WJjSB4IOi1t+eCuVxyXG4gICAgdGhpcy5zdGFydFkgPSAwOyAgLy8g5b2T5YmNIHkg6LW354K5XHJcbiAgICB0aGlzLmZsYWcgPSAwOyAgLy8g5LqL5Lu25aSE55CG6Zi25q6177yM6buY6K6kIDDvvIxub3QgYmUgdHJhY2VkXHJcbiAgICB0aGlzLnN0YXJ0VGltZSA9IERhdGUubm93KCk7ICAvLyDlvIDlp4vml7bpl7RcclxuICAgIHRoaXMuc2Nyb2xsYmFyID0gbmV3IFNjcm9sbGJhcih0aGlzKTsgICAvLyDmu5rliqjmnaFcclxuICB9XHJcbiAgaW5pdFN0eWxlKCkge1xyXG4gICAgc2V0U3R5bGUodGhpcy5jaGlsZCwge1widXNlci1zZWxlY3RcIjogXCJub25lXCJ9KTtcclxuICB9XHJcbn1cclxuZXhwb3J0IGRlZmF1bHQgUGFydGljbGU7XHJcbiIsImltcG9ydCBUcmFjZSBmcm9tIFwiLi4vaW5kZXhcIjtcclxuY2xhc3MgUG9pbnRlclRyYWNlIGV4dGVuZHMgVHJhY2V7XHJcbiAgY29uc3RydWN0b3IocCkge1xyXG4gICAgc3VwZXIocCk7XHJcbiAgICB0aGlzLmluaXRFdmVudHMoKTtcclxuICB9XHJcbiAgaW5pdEV2ZW50cygpIHtcclxuICAgIHRoaXMuZXZlbnRzLnB1c2goLi4uW1xyXG4gICAgICBbXCJwb2ludGVyZG93blwiLCB0aGlzLmNoaWxkXSxcclxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXHJcbiAgICAgIFtcInBvaW50ZXJtb3ZlXCIsIHdpbmRvd10sXHJcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxyXG4gICAgICBbXCJwb2ludGVydXBcIiwgd2luZG93XSxcclxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXHJcbiAgICAgIFtcInBvaW50ZXJjYW5jZWxcIiwgd2luZG93XVxyXG4gICAgXSk7XHJcbiAgfVxyXG4gIGhhbmRsZUV2ZW50KGV2ZW50KSB7XHJcbiAgICBldmVudCA9IHN1cGVyLnVuaWZ5RXZlbnQoZXZlbnQpO1xyXG4gICAgc3dpdGNoIChldmVudC50eXBlKSB7XHJcbiAgICBjYXNlIFwicG9pbnRlcmRvd25cIjoge1xyXG4gICAgICB0aGlzLmhhbmRsZVN0YXJ0KGV2ZW50KTtcclxuICAgIH1icmVhaztcclxuICAgIGNhc2UgXCJwb2ludGVybW92ZVwiOiB7XHJcbiAgICAgIHRoaXMuaGFuZGxlR29pbmcoZXZlbnQpO1xyXG4gICAgfWJyZWFrO1xyXG4gICAgY2FzZSBcInBvaW50ZXJ1cFwiOiB7XHJcbiAgICAgIHRoaXMuaGFuZGxlU3RvcCgpO1xyXG4gICAgfWJyZWFrO1xyXG4gICAgY2FzZSBcInBvaW50ZXJjYW5jZWxcIjoge1xyXG4gICAgICB0aGlzLmhhbmRsZUNhbmNlbCgpO1xyXG4gICAgfWJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5leHBvcnQgZGVmYXVsdCBQb2ludGVyVHJhY2U7XHJcbiIsImltcG9ydCBUcmFjZSBmcm9tIFwiLi4vaW5kZXhcIjtcclxuY2xhc3MgV2hlZWxUcmFjZSBleHRlbmRzIFRyYWNle1xyXG4gIGNvbnN0cnVjdG9yKHApIHtcclxuICAgIHN1cGVyKHApO1xyXG4gICAgdGhpcy5pbml0RXZlbnRzKCk7XHJcbiAgfVxyXG4gIGluaXRFdmVudHMoKSB7XHJcbiAgICB0aGlzLmV2ZW50cy5wdXNoKC4uLltcclxuICAgICAgW1wid2hlZWxcIiwgdGhpcy5jaGlsZF0sXHJcbiAgICAgIFtcIm1vdXNld2hlZWxcIiwgdGhpcy5jaGlsZF0sXHJcbiAgICAgIFtcIkRPTU1vdXNlU2Nyb2xsXCIsIHRoaXMuY2hpbGRdXHJcbiAgICBdKTtcclxuICB9XHJcbiAgaGFuZGxlRXZlbnQoZXZlbnQpIHtcclxuICAgIGV2ZW50ID0gdGhpcy51bmlmeUV2ZW50KGV2ZW50KTtcclxuICAgIHN3aXRjaCAoZXZlbnQudHlwZSkge1xyXG4gICAgY2FzZSBcIndoZWVsXCI6IHtcclxuICAgICAgbGV0IHgxID0gdGhpcy54MSArICgtZXZlbnQuZGVsdGFYKSxcclxuICAgICAgICB5MSA9IHRoaXMueTEgKyAoLWV2ZW50LmRlbHRhWSk7XHJcbiAgICAgIHkxID0geTEgPCB0aGlzLm1heFkgPyB0aGlzLm1heFkgOiB5MSA+IDAgPyAwIDogeTE7XHJcbiAgICAgIHgxID0geDEgPCB0aGlzLm1heFggPyB0aGlzLm1heFggOiB4MSA+IDAgPyAwIDogeDE7XHJcbiAgICAgIHRoaXMudHJhbnNsYXRlKHgxLCB5MSk7XHJcbiAgICB9YnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHVuaWZ5RXZlbnQoZXZlbnQpIHtcclxuICAgIC8vIDEuIOagh+WHhiDpvKDmoIfmu5rova7kuovku7ZcclxuICAgIGlmKFwiZGVsdGFYXCIgaW4gZXZlbnQpIHtcclxuICAgIH0gZWxzZSBpZihcIndoZWVsRGVsdGF4XCIgaW4gZXZlbnQpIHtcclxuICAgICAgLy8gMi4gbW91c2V3aGVlbCDkuovku7ZcclxuICAgIH0gZWxzZSBpZihcIndoZWVsRGVsdGFcIiBpbiBldmVudCkge1xyXG5cclxuICAgIH0gZWxzZSBpZihcImRldGFpbFwiIGluIGV2ZW50KSB7XHJcbiAgICAgIC8vIDMuIERPTU1vdXNlU2Nyb2xsIOS6i+S7tlxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGV2ZW50O1xyXG4gIH1cclxufVxyXG5leHBvcnQgZGVmYXVsdCBXaGVlbFRyYWNlO1xyXG4iLCJpbXBvcnQgTW91c2VUcmFjZSBmcm9tIFwiLi9jb3JlL3RyYWNlL2V2ZW50L21vdXNlLXRyYWNlLmpzXCI7XHJcbmltcG9ydCBUb3VjaFRyYWNlIGZyb20gXCIuL2NvcmUvdHJhY2UvZXZlbnQvdG91Y2gtdHJhY2VcIjtcclxuaW1wb3J0IFBhcnRpY2xlIGZyb20gXCIuL2NvcmUvcGFydGljbGUvaW5kZXhcIjtcclxuaW1wb3J0IFBvaW50ZXJUcmFjZSBmcm9tIFwiLi9jb3JlL3RyYWNlL2V2ZW50L3BvaW50ZXItdHJhY2VcIjtcclxuaW1wb3J0IFdoZWVsVHJhY2UgZnJvbSBcIi4vY29yZS90cmFjZS9ldmVudC93aGVlbC10cmFjZVwiO1xyXG5jb25zdCB2aWIgPSB7XHJcbiAgYmVnaW46IChlbGUpID0+IHtcclxuICAgIGxldCBwID0gbmV3IFBhcnRpY2xlKGVsZSk7XHJcbiAgICBsZXQgbW91c2VUcmFjZSA9IG5ldyBNb3VzZVRyYWNlKHApLFxyXG4gICAgICB0b3VjaFRyYWNlID0gbmV3IFRvdWNoVHJhY2UocCksXHJcbiAgICAgIHdoZWVsVHJhY2UgPSBuZXcgV2hlZWxUcmFjZShwKSxcclxuICAgICAgcG9pbnRlclRyYWNlID0gbmV3IFBvaW50ZXJUcmFjZShwKTtcclxuICAgIG1vdXNlVHJhY2UubGlzdGVuKCk7XHJcbiAgICB0b3VjaFRyYWNlLmxpc3RlbigpO1xyXG4gICAgd2hlZWxUcmFjZS5saXN0ZW4oKTtcclxuICAgIC8vIHBvaW50ZXJUcmFjZS5saXN0ZW4oKTtcclxuICB9XHJcbn07XHJcbmV4cG9ydCBkZWZhdWx0IHZpYjtcclxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBSUEsTUFBTSxRQUFRLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxLQUFLO0FBQ2hDLEVBQUUsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsQyxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQy9CLENBQUMsQ0FBQztBQUNGLE1BQU0sUUFBUSxHQUFHLENBQUMsR0FBRyxLQUFLO0FBQzFCLEVBQUUsT0FBTyxHQUFHLENBQUMsV0FBVyxDQUFDO0FBQ3pCLENBQUMsQ0FBQztBQUNGLE1BQU0sU0FBUyxHQUFHLENBQUMsR0FBRyxLQUFLO0FBQzNCLEVBQUUsT0FBTyxHQUFHLENBQUMsWUFBWSxDQUFDO0FBQzFCLENBQUMsQ0FBQztBQUNGLE1BQU0saUJBQWlCLEdBQUcsQ0FBQyxHQUFHLEtBQUs7QUFDbkMsRUFBRSxPQUFPO0FBQ1QsSUFBSSxRQUFRLENBQUMsR0FBRyxDQUFDO0FBQ2pCLElBQUksU0FBUyxDQUFDLEdBQUcsQ0FBQztBQUNsQixHQUFHLENBQUM7QUFDSixDQUFDLENBQUM7QUFDRixNQUFNLGtCQUFrQixHQUFHLENBQUMs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LENBQUMsR0FBRyxFQUFFLENBQUM7QUFDdEQsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDdEQsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUMzQixJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxTQUFTLEdBQUcsR0FBRyxFQUFFO0FBQzFDLE1BQU0sSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDbEMsTUFBTSxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7QUFDeEIsTUFBTSxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7QUFDeEIsS0FBSztBQUNMLEdBQUc7QUFDSCxFQUFFLFVBQVUsR0FBRztBQUNmLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUM1QixJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLEVBQUU7QUFDeEIsTUFBTSxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztBQUNwQixNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxTQUFTLEdBQUcsR0FBRyxFQUFFO0FBQzVDLFFBQVEsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDekYsUUFBUSxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElB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
