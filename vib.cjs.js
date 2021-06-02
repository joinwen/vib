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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmliLmNqcy5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL3V0aWxzL2luZGV4LmpzIiwiLi4vc3JjL2NvcmUvYW5pbWF0aW9uL3N0cmF0ZWd5LmpzIiwiLi4vc3JjL2NvcmUvYW5pbWF0aW9uL2luZGV4LmpzIiwiLi4vc3JjL2NvcmUvdHJhY2UvcGhhc2UvaW5kZXguanMiLCIuLi9zcmMvY29yZS90cmFjZS9pbmRleC5qcyIsIi4uL3NyYy9jb3JlL3RyYWNlL2V2ZW50L21vdXNlLXRyYWNlLmpzIiwiLi4vc3JjL2NvcmUvdHJhY2UvZXZlbnQvdG91Y2gtdHJhY2UuanMiLCIuLi9zcmMvY29yZS9zY3JvbGxiYXIvaW5kZXguanMiLCIuLi9zcmMvY29yZS9wYXJ0aWNsZS9pbmRleC5qcyIsIi4uL3NyYy9jb3JlL3RyYWNlL2V2ZW50L3BvaW50ZXItdHJhY2UuanMiLCIuLi9zcmMvY29yZS90cmFjZS9ldmVudC93aGVlbC10cmFjZS5qcyIsIi4uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBnZXRTdHlsZSA9IChlbGUsIGF0dHIpID0+IHtcclxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcclxuICByZXR1cm4gZG9jdW1lbnQuZGVmYXVsdFZpZXcuZ2V0Q29tcHV0ZWRTdHlsZShlbGUpW2F0dHJdO1xyXG59O1xyXG5jb25zdCBzZXRTdHlsZSA9IChlbGUsIGRhdGEpID0+IHtcclxuICBsZXQgYXR0ciA9IE9iamVjdC5rZXlzKGRhdGEpWzBdO1xyXG4gIGVsZS5zdHlsZVthdHRyXSA9IGRhdGFbYXR0cl07XHJcbn07XHJcbmNvbnN0IGdldFdpZHRoID0gKGVsZSkgPT4ge1xyXG4gIHJldHVybiBlbGUuY2xpZW50V2lkdGg7XHJcbn07XHJcbmNvbnN0IGdldEhlaWdodCA9IChlbGUpID0+IHtcclxuICByZXR1cm4gZWxlLmNsaWVudEhlaWdodDtcclxufTtcclxuY29uc3QgZ2V0V2lkdGhBbmRIZWlnaHQgPSAoZWxlKSA9PiB7XHJcbiAgcmV0dXJuIFtcclxuICAgIGdldFdpZHRoKGVsZSksXHJcbiAgICBnZXRIZWlnaHQoZWxlKVxyXG4gIF07XHJcbn07XHJcbmNvbnN0IGdldFdpZHRoV2l0aEJvcmRlciA9IChlbGUpID0+IHtcclxuICByZXR1cm4gZWxlLm9mZnNldFdpZHRoO1xyXG59O1xyXG5jb25zdCBnZXRIZWlnaHRXaXRoQm9yZGVyID0gKGVsZSkgPT4ge1xyXG4gIHJldHVybiBlbGUub2Zmc2V0SGVpZ2h0O1xyXG59O1xyXG5cclxuY29uc3QgZ2V0V2lkdGhBbmRIZWlnaHRXaXRoQm9yZGVyID0gKGVsZSkgPT4ge1xyXG4gIHJldHVybiBbXHJcbiAgICBnZXRXaWR0aFdpdGhCb3JkZXIoZWxlKSxcclxuICAgIGdldEhlaWdodFdpdGhCb3JkZXIoZWxlKVxyXG4gIF07XHJcbn07XHJcblxyXG5jb25zdCBzdHlsZTJTdHJpbmcgPSAoc3R5bGUpID0+IHtcclxuICByZXR1cm4gT2JqZWN0LmtleXMoc3R5bGUpLnJlZHVjZSgocHJldixuZXh0KSA9PiB7XHJcbiAgICByZXR1cm4gcHJldiArIGAke25leHR9OiAke3N0eWxlW25leHRdfTtgO1xyXG4gIH0sXCJcIik7XHJcbn07XHJcblxyXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcclxuY29uc3QgcmFmID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCBmdW5jdGlvbihjYWxsYmFjaykge1xyXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxyXG4gIHdpbmRvdy5zZXRUaW1lb3V0KChjYWxsYmFjayksIDE3KTtcclxufTtcclxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXHJcbmNvbnN0IGNhbmNlbFJhZiA9IHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSB8fCBjbGVhclRpbWVvdXQ7XHJcblxyXG5leHBvcnQge1xyXG4gIHN0eWxlMlN0cmluZyxcclxuICByYWYsXHJcbiAgY2FuY2VsUmFmLFxyXG4gIGdldFN0eWxlLFxyXG4gIHNldFN0eWxlLFxyXG4gIGdldFdpZHRoLFxyXG4gIGdldEhlaWdodCxcclxuICBnZXRXaWR0aEFuZEhlaWdodCxcclxuICBnZXRXaWR0aFdpdGhCb3JkZXIsXHJcbiAgZ2V0SGVpZ2h0V2l0aEJvcmRlcixcclxuICBnZXRXaWR0aEFuZEhlaWdodFdpdGhCb3JkZXJcclxufTtcclxuIiwiY29uc3QgU1RSQVRFR1lfTElTVCA9IHtcbiAgbGluZWFyOiAocHJvZ3Jlc3MpID0+IHtcbiAgICByZXR1cm4gcHJvZ3Jlc3M7XG4gIH0sXG4gIGVhc2VJbjogKHByb2dyZXNzKSA9PiB7XG4gICAgcmV0dXJuIFNUUkFURUdZX0xJU1QuZWFzZUluUXVhZChwcm9ncmVzcyk7XG4gIH0sXG4gIGVhc2VJblF1YWQ6IChwcm9nb3Jlc3MpID0+IHtcbiAgICByZXR1cm4gTWF0aC5wb3cocHJvZ29yZXNzLCAyKTtcbiAgfSxcbiAgZWFzZUluQ3ViaWM6IChwcm9ncmVzcykgPT4ge1xuICAgIHJldHVybiBNYXRoLnBvdyhwcm9ncmVzcywgMyk7XG4gIH0sXG4gIGVhc2VJblF1YXJ0OiAocHJvZ3Jlc3MpID0+IHtcbiAgICByZXR1cm4gTWF0aC5wb3cocHJvZ3Jlc3MsIDQpO1xuICB9LFxuICBlYXNlSW5RdWludDogKHByb2dyZXNzKSA9PiB7XG4gICAgcmV0dXJuIE1hdGgucG93KHByb2dyZXNzLCA1KTtcbiAgfSxcbiAgZWFzZU91dDogKHByb2dyZXNzKSA9PiB7XG4gICAgcmV0dXJuIFNUUkFURUdZX0xJU1QuZWFzZU91dFF1YWQocHJvZ3Jlc3MpO1xuICB9LFxuICBlYXNlT3V0UXVhZDogKHByb2dyZXNzKSA9PiB7XG4gICAgcmV0dXJuIHByb2dyZXNzICogMiAtIE1hdGgucG93KHByb2dyZXNzLCAyKTtcbiAgfSxcbiAgZWFzZU91dEN1YmljOiAocHJvZ3Jlc3MpID0+IHtcbiAgICByZXR1cm4gTWF0aC5wb3cocHJvZ3Jlc3MgLSAxLCAzKSArIDE7XG4gIH0sXG4gIGVhc2VPdXRRdWFydDogKHByb2dyZXNzKSA9PiB7XG4gICAgcmV0dXJuIDEgLSBNYXRoLnBvdyhwcm9ncmVzcyAtIDEsIDQpO1xuICB9LFxuICBlYXNlT3V0UXVpbnQ6IChwcm9ncmVzcykgPT4ge1xuICAgIHJldHVybiBNYXRoLnBvdyhwcm9ncmVzcyAtIDEsIDUpICsgMTtcbiAgfSxcbiAgYmFjazogKHByb2dyZXNzKSA9PiB7XG4gICAgbGV0IGIgPSA0O1xuICAgIHJldHVybiAocHJvZ3Jlc3MgPSBwcm9ncmVzcyAtIDEpICogcHJvZ3Jlc3MgKiAoKGIgKyAxKSAqIHByb2dyZXNzICsgYikgKyAxO1xuICB9LFxuICBib3VuY2U6IChwcm9ncmVzcykgPT4ge1xuICAgIGlmICgocHJvZ3Jlc3MgLz0gMSkgPCAxIC8gMi43NSkge1xuICAgICAgcmV0dXJuIDcuNTYyNSAqIHByb2dyZXNzICogcHJvZ3Jlc3M7XG4gICAgfSBlbHNlIGlmIChwcm9ncmVzcyA8IDIgLyAyLjc1KSB7XG4gICAgICByZXR1cm4gNy41NjI1ICogKHByb2dyZXNzIC09IDEuNSAvIDIuNzUpICogcHJvZ3Jlc3MgKyAwLjc1O1xuICAgIH0gZWxzZSBpZiAocHJvZ3Jlc3MgPCAyLjUgLyAyLjc1KSB7XG4gICAgICByZXR1cm4gNy41NjI1ICogKHByb2dyZXNzIC09IDIuMjUgLyAyLjc1KSAqIHByb2dyZXNzICsgMC45Mzc1O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gNy41NjI1ICogKHByb2dyZXNzIC09IDIuNjI1IC8gMi43NSkgKiBwcm9ncmVzcyArIDAuOTg0Mzc1O1xuICAgIH1cbiAgfSxcbiAgZWxhc3RpYzogKHByb2dyZXNzKSA9PiB7XG4gICAgdmFyIGYgPSAwLjIyLFxuICAgICAgZSA9IDAuNDtcblxuICAgIGlmIChwcm9ncmVzcyA9PT0gMCkge1xuICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIGlmIChwcm9ncmVzcyA9PT0gMSkge1xuICAgICAgcmV0dXJuIDE7XG4gICAgfVxuXG4gICAgcmV0dXJuIGUgKiBNYXRoLnBvdygyLCAtMTAgKiBwcm9ncmVzcykgKiBNYXRoLnNpbigoKHByb2dyZXNzIC0gZiAvIDQpICogKDIgKiBNYXRoLlBJKSkgLyBmKSArIDE7XG4gIH0sXG59O1xuY29uc3QgU1RSQVRFR1kgPSB7fTtcbk9iamVjdC5rZXlzKFNUUkFURUdZX0xJU1QpLmZvckVhY2goKGtleSkgPT4ge1xuICBTVFJBVEVHWVtrZXldID0ga2V5O1xufSk7XG5leHBvcnQgeyBTVFJBVEVHWV9MSVNULCBTVFJBVEVHWSB9O1xuIiwiaW1wb3J0IHtjYW5jZWxSYWYsIHJhZiwgc2V0U3R5bGV9IGZyb20gXCIuLi8uLi91dGlscy9pbmRleFwiO1xyXG5pbXBvcnQge1NUUkFURUdZX0xJU1R9IGZyb20gXCIuL3N0cmF0ZWd5XCI7XHJcbmNsYXNzIEFuaW1hdGlvbiB7XHJcbiAgLyoqXHJcbiAgICpcclxuICAgKiBAcGFyYW0geDAg6LW354K5XHJcbiAgICogQHBhcmFtIHgxIOe7iOeCuVxyXG4gICAqIEBwYXJhbSBkdXJhdGlvbiDliqjnlLvml7bplb9cclxuICAgKi9cclxuICBhbmltYXRlKFt4MCwgeDFdLCBbeTAsIHkxXSwgZHVyYXRpb24sIHN0cmF0ZWd5ID0gXCJlYXNlT3V0UXVpbnRcIikge1xyXG4gICAgbGV0IHN0YXJ0ID0gRGF0ZS5ub3coKSxcclxuICAgICAgc3RyYXRlZ3lGbiA9IFNUUkFURUdZX0xJU1Rbc3RyYXRlZ3ldO1xyXG4gICAgbGV0IGZuID0gKCkgPT4ge1xyXG4gICAgICBsZXQgcGFzc2VkID0gRGF0ZS5ub3coKSAtIHN0YXJ0LFxyXG4gICAgICAgIHByb2dyZXNzID0gdGhpcy5yb3VuZChzdHJhdGVneUZuKHBhc3NlZCAvIGR1cmF0aW9uKSwgNiksXHJcbiAgICAgICAgaWQgPSBudWxsLFxyXG4gICAgICAgIGRlbHRhWCA9IHgxIC0geDAsXHJcbiAgICAgICAgZGVsdGFZID0geTEgLSB5MDtcclxuXHJcbiAgICAgIGlmKHRoaXMuZmxhZyA9PT0gMykge1xyXG4gICAgICAgIGlmKHByb2dyZXNzIDwgMSl7XHJcbiAgICAgICAgICB0aGlzLnRyYW5zbGF0ZSh4MCArIGRlbHRhWCAqIHByb2dyZXNzLHkwICsgZGVsdGFZICogcHJvZ3Jlc3MpO1xyXG4gICAgICAgICAgaWQgPSByYWYoZm4pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLnRyYW5zbGF0ZSh4MCArIGRlbHRhWCwgeTAgKyBkZWx0YVkpO1xyXG4gICAgICAgICAgY2FuY2VsUmFmKGlkKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICBmbigpO1xyXG4gIH1cclxuICByb3VuZChudW1iZXIsIHByZWNpc2lvbikge1xyXG4gICAgcmV0dXJuIE1hdGgucm91bmQoK251bWJlciArIFwiZVwiICsgcHJlY2lzaW9uKSAvIE1hdGgucG93KDEwLCBwcmVjaXNpb24pO1xyXG4gIH1cclxuICB0cmFuc2xhdGUoaG9yVmFsdWUsIHZlclZhbHVlKSB7XHJcbiAgICB0aGlzLnkxID0gTWF0aC5yb3VuZCh2ZXJWYWx1ZSk7XHJcbiAgICB0aGlzLngxID0gTWF0aC5yb3VuZChob3JWYWx1ZSk7XHJcbiAgICB0aGlzLnNjcm9sbGJhci51cGRhdGVQb3NpdGlvbih0aGlzLnkxKTtcclxuICAgIHNldFN0eWxlKHRoaXMuY2hpbGQsIHtcclxuICAgICAgdHJhbnNmb3JtOiBgdHJhbnNsYXRlWSgke3RoaXMueTF9cHgpIHRyYW5zbGF0ZVgoJHt0aGlzLngxfXB4KWBcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICpcclxuICAgKiBAcGFyYW0geDAg6LW354K5XHJcbiAgICogQHBhcmFtIHgxIOe7iOeCuVxyXG4gICAqIEBwYXJhbSBzdGFydFRpbWUg6LW35aeL5pe26Ze0XHJcbiAgICogQHBhcmFtIG1heCDmnIDlpKfkvY3np7tcclxuICAgKiBAcGFyYW0gYSDliqDpgJ/luqZcclxuICAgKiBAcmV0dXJucyB7KCp8bnVtYmVyKVtdfVxyXG4gICAqL1xyXG4gIG1vbWVudHVtKHgwLCB4MSwgc3RhcnRUaW1lLCBtYXgsIGEgPSAwLjAwMDYpIHtcclxuICAgIGxldCB0aW1lLCBkaXN0YW5jZSwgc3BlZWQsIHgsIHQ7XHJcbiAgICB0aW1lID0gRGF0ZS5ub3coKSAtIHN0YXJ0VGltZTsgIC8vIOaXtumXtFxyXG4gICAgZGlzdGFuY2UgPSB4MSAtIHgwOyAgICAgICAgICAgICAvLyDkvY3np7tcclxuICAgIHNwZWVkID0gTWF0aC5hYnMoZGlzdGFuY2UpIC8gdGltZTsgIC8vIOW5s+Wdh+mAn+W6piA9PiDotbflp4vpgJ/luqZcclxuICAgIHggPSB4MSArIChzcGVlZCAqIHNwZWVkKSAvICgyICogYSkgKiAoZGlzdGFuY2UgPCAwID8gLTEgOiAxKTsgICAvLyDku6Vh5Li65Yqg6YCf5bqm5YyA5YeP6YCf5YiwMOeahOS9jeenu1xyXG4gICAgdCA9IHNwZWVkIC8gYTsgIC8vIOWMgOWHj+mAn+i/kOWKqOeahOaXtumXtFxyXG4gICAgaWYoeCA8IG1heCkge1xyXG4gICAgICB4ID0gbWF4O1xyXG4gICAgICBkaXN0YW5jZSA9IE1hdGguYWJzKHggLSB4MSk7XHJcbiAgICAgIHQgPSBkaXN0YW5jZSAvIHNwZWVkO1xyXG4gICAgfVxyXG4gICAgaWYoeCA+IDApIHtcclxuICAgICAgeCA9IDA7XHJcbiAgICAgIGRpc3RhbmNlID0gTWF0aC5hYnMoeDEpICsgeDtcclxuICAgICAgdCA9IGRpc3RhbmNlIC8gc3BlZWQ7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gW1xyXG4gICAgICB4MSxcclxuICAgICAgTWF0aC5yb3VuZCh4KSxcclxuICAgICAgdFxyXG4gICAgXTtcclxuICB9XHJcbn1cclxuZXhwb3J0IGRlZmF1bHQgQW5pbWF0aW9uO1xyXG4iLCJpbXBvcnQgQW5pbWF0aW9uIGZyb20gXCIuLi8uLi9hbmltYXRpb24vaW5kZXhcIjtcclxuY2xhc3MgUGhhc2UgZXh0ZW5kcyBBbmltYXRpb257XHJcbiAgdW5pZnlFdmVudChldmVudCkge1xyXG4gICAgcmV0dXJuIGV2ZW50O1xyXG4gIH1cclxuICBoYW5kbGVTdGFydChldmVudCkge1xyXG4gICAgY29uc29sZS5sb2coXCIqKnN0YXJ0KipcIik7XHJcbiAgICB0aGlzLmZsYWcgPSAxO1xyXG4gICAgdGhpcy5jaGlsZC5hZGRFdmVudExpc3RlbmVyKFwic2VsZWN0c3RhcnRcIiwgKGUpID0+IHtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgfSk7XHJcbiAgICB0aGlzLnN0YXJ0WCA9IGV2ZW50LnBhZ2VYO1xyXG4gICAgdGhpcy5zdGFydFkgPSBldmVudC5wYWdlWTtcclxuICAgIHRoaXMueDAgPSB0aGlzLngxO1xyXG4gICAgdGhpcy55MCA9IHRoaXMueTE7XHJcbiAgICB0aGlzLnN0YXJ0VGltZSA9IERhdGUubm93KCk7XHJcbiAgfVxyXG4gIGhhbmRsZUdvaW5nKGV2ZW50KSB7XHJcbiAgICBpZihbMCwzXS5pbmNsdWRlcyh0aGlzLmZsYWcpKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHRoaXMuZmxhZyA9IDI7XHJcbiAgICBjb25zb2xlLmxvZyhcIioqZ29pbmcqKlwiKTtcclxuICAgIGxldCBtb3ZlWCA9IGV2ZW50LnBhZ2VYLFxyXG4gICAgICBtb3ZlWSA9IGV2ZW50LnBhZ2VZLFxyXG4gICAgICBkZWx0YVggPSBtb3ZlWCAtIHRoaXMuc3RhcnRYLFxyXG4gICAgICBkZWx0YVkgPSBtb3ZlWSAtIHRoaXMuc3RhcnRZO1xyXG4gICAgdGhpcy5zdGFydFggPSBtb3ZlWDtcclxuICAgIHRoaXMuc3RhcnRZID0gbW92ZVk7XHJcblxyXG4gICAgbGV0IHgxID0gdGhpcy54MSArIGRlbHRhWDtcclxuICAgIGxldCB5MSA9IHRoaXMueTEgKyBkZWx0YVk7XHJcbiAgICB5MSA9IHkxIDwgdGhpcy5tYXhZID8gdGhpcy5tYXhZIDogeTEgPiAwID8gMCA6IHkxO1xyXG4gICAgeDEgPSB4MSA8IHRoaXMubWF4WCA/IHRoaXMubWF4WCA6IHgxID4gMCA/IDAgOiB4MTtcclxuICAgIHRoaXMudHJhbnNsYXRlKHgxLCB5MSk7XHJcbiAgICBpZihEYXRlLm5vdygpIC0gdGhpcy5zdGFydFRpbWUgPiAzMDApIHtcclxuICAgICAgdGhpcy5zdGFydFRpbWUgPSBEYXRlLm5vdygpO1xyXG4gICAgICB0aGlzLngwID0gdGhpcy54MTtcclxuICAgICAgdGhpcy55MCA9IHRoaXMueTE7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGhhbmRsZVN0b3AoKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcIioqc3RvcCoqXCIpO1xyXG4gICAgaWYodGhpcy5mbGFnID09PSAyKSB7XHJcbiAgICAgIHRoaXMuZmxhZyA9IDM7XHJcbiAgICAgIGlmKERhdGUubm93KCkgLSB0aGlzLnN0YXJ0VGltZSA8IDMwMCkge1xyXG4gICAgICAgIGxldCBbeTAsIHkxLCB0aW1lMV0gPSB0aGlzLm1vbWVudHVtKHRoaXMueTAsIHRoaXMueTEsIHRoaXMuc3RhcnRUaW1lLCB0aGlzLm1heFkpO1xyXG4gICAgICAgIGxldCBbeDAsIHgxLCB0aW1lMl0gPSB0aGlzLm1vbWVudHVtKHRoaXMueDAsIHRoaXMueDEsIHRoaXMuc3RhcnRUaW1lLCB0aGlzLm1heFgpO1xyXG4gICAgICAgIGxldCB0aW1lID0gIE1hdGgubWF4KHRpbWUxLCB0aW1lMik7XHJcbiAgICAgICAgaWYodGltZSkge1xyXG4gICAgICAgICAgdGhpcy5hbmltYXRlKFt4MCx4MV0sW3kwLHkxXSwgdGltZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLmZsYWcgPSAzO1xyXG4gIH1cclxuICBoYW5kbGVDYW5jZWwoKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcIioqY2FuY2VsKipcIik7XHJcbiAgICB0aGlzLmZsYWcgPSAzO1xyXG4gIH1cclxufVxyXG5leHBvcnQgZGVmYXVsdCBQaGFzZTtcclxuIiwiLyoqXHJcbiAqIOWkhOeQhuaooeadv1xyXG4gKi9cclxuaW1wb3J0IFBoYXNlIGZyb20gXCIuL3BoYXNlL2luZGV4XCI7XHJcblxyXG5jbGFzcyBUcmFjZSBleHRlbmRzIFBoYXNle1xyXG4gIGNvbnN0cnVjdG9yKHApIHtcclxuICAgIHN1cGVyKCk7XHJcbiAgICB0aGlzLnAgPSBwO1xyXG4gICAgdGhpcy5ldmVudHMgPSBbXTtcclxuICB9XHJcbiAgZ2V0IGNoaWxkKCkge1xyXG4gICAgcmV0dXJuIHRoaXMucC5jaGlsZDtcclxuICB9XHJcbiAgZ2V0IHBhcmVudCgpIHtcclxuICAgIHJldHVybiB0aGlzLnAucGFyZW50O1xyXG4gIH1cclxuICBnZXQgc2Nyb2xsYmFyKCkge1xyXG4gICAgcmV0dXJuIHRoaXMucC5zY3JvbGxiYXI7XHJcbiAgfVxyXG4gIGdldCBtYXhZKCkge1xyXG4gICAgcmV0dXJuIHRoaXMucC5tYXhZO1xyXG4gIH1cclxuICBnZXQgbWF4WCgpIHtcclxuICAgIHJldHVybiB0aGlzLnAubWF4WDtcclxuICB9XHJcbiAgc2V0IGZsYWcodmFsdWUpIHtcclxuICAgIHRoaXMucC5mbGFnID0gdmFsdWU7XHJcbiAgfVxyXG4gIGdldCBmbGFnKCkge1xyXG4gICAgcmV0dXJuIHRoaXMucC5mbGFnO1xyXG4gIH1cclxuICBzZXQgeDAodmFsdWUpIHtcclxuICAgIHRoaXMucC54MCA9IHZhbHVlO1xyXG4gIH1cclxuICBnZXQgeDAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5wLngwO1xyXG4gIH1cclxuICBzZXQgeDEodmFsdWUpIHtcclxuICAgIHRoaXMucC54MSA9IHZhbHVlO1xyXG4gIH1cclxuICBnZXQgeDEoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5wLngxO1xyXG4gIH1cclxuICBzZXQgeTAodmFsdWUpIHtcclxuICAgIHRoaXMucC55MCA9IHZhbHVlO1xyXG4gIH1cclxuICBnZXQgeTAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5wLnkwO1xyXG4gIH1cclxuICBzZXQgeTEodmFsdWUpIHtcclxuICAgIHRoaXMucC55MSA9IHZhbHVlO1xyXG4gIH1cclxuICBnZXQgeTEoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5wLnkxO1xyXG4gIH1cclxuICBzZXQgc3RhcnRYKHZhbHVlKSB7XHJcbiAgICB0aGlzLnAuc3RhcnRYID0gdmFsdWU7XHJcbiAgfVxyXG4gIGdldCBzdGFydFgoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5wLnN0YXJ0WDtcclxuICB9XHJcbiAgc2V0IHN0YXJ0WSh2YWx1ZSkge1xyXG4gICAgdGhpcy5wLnN0YXJ0WSA9IHZhbHVlO1xyXG4gIH1cclxuICBnZXQgc3RhcnRZKCkge1xyXG4gICAgcmV0dXJuIHRoaXMucC5zdGFydFk7XHJcbiAgfVxyXG4gIHNldCBzdGFydFRpbWUodmFsdWUpIHtcclxuICAgIHRoaXMucC5zdGFydFRpbWUgPSB2YWx1ZTtcclxuICB9XHJcbiAgZ2V0IHN0YXJ0VGltZSgpIHtcclxuICAgIHJldHVybiB0aGlzLnAuc3RhcnRUaW1lO1xyXG4gIH1cclxuICBsaXN0ZW4oKSB7XHJcbiAgICB0aGlzLmV2ZW50cy5mb3JFYWNoKGV2ZW50ID0+IHtcclxuICAgICAgZXZlbnRbMV0uYWRkRXZlbnRMaXN0ZW5lcihldmVudFswXSwgdGhpcyk7XHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuZXhwb3J0IGRlZmF1bHQgVHJhY2U7XHJcbiIsImltcG9ydCBUcmFjZSBmcm9tIFwiLi4vaW5kZXhcIjtcclxuXHJcbmNsYXNzIE1vdXNlVHJhY2UgZXh0ZW5kcyBUcmFjZXtcclxuICBjb25zdHJ1Y3RvcihwKSB7XHJcbiAgICBzdXBlcihwKTtcclxuICAgIHRoaXMuaW5pdEV2ZW50cygpO1xyXG4gIH1cclxuICBpbml0RXZlbnRzKCkge1xyXG4gICAgdGhpcy5ldmVudHMucHVzaCguLi5bXHJcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxyXG4gICAgICBbXCJtb3VzZWRvd25cIiwgdGhpcy5jaGlsZF0sXHJcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxyXG4gICAgICBbXCJtb3VzZW1vdmVcIiwgd2luZG93XSxcclxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXHJcbiAgICAgIFtcIm1vdXNldXBcIiwgd2luZG93XSxcclxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXHJcbiAgICAgIFtcIm1vdXNlY2FuY2VsXCIsIHdpbmRvd11cclxuICAgIF0pO1xyXG4gIH1cclxuICBoYW5kbGVFdmVudChldmVudCkge1xyXG4gICAgZXZlbnQgPSBzdXBlci51bmlmeUV2ZW50KGV2ZW50KTtcclxuICAgIHN3aXRjaCAoZXZlbnQudHlwZSkge1xyXG4gICAgY2FzZSBcIm1vdXNlZG93blwiOiB7XHJcbiAgICAgIHRoaXMuaGFuZGxlU3RhcnQoZXZlbnQpO1xyXG4gICAgfWJyZWFrO1xyXG4gICAgY2FzZSBcIm1vdXNlbW92ZVwiOiB7XHJcbiAgICAgIHRoaXMuaGFuZGxlR29pbmcoZXZlbnQpO1xyXG4gICAgfWJyZWFrO1xyXG4gICAgY2FzZSBcIm1vdXNldXBcIjoge1xyXG4gICAgICB0aGlzLmhhbmRsZVN0b3AoKTtcclxuICAgIH1icmVhaztcclxuICAgIGNhc2UgXCJtb3VzZWNhbmNlbFwiOiB7XHJcbiAgICAgIHRoaXMuaGFuZGxlQ2FuY2VsKCk7XHJcbiAgICB9YnJlYWs7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbmV4cG9ydCBkZWZhdWx0IE1vdXNlVHJhY2U7XHJcbiIsImltcG9ydCBUcmFjZSBmcm9tIFwiLi4vaW5kZXhcIjtcclxuXHJcbmNsYXNzIFRvdWNoVHJhY2UgZXh0ZW5kcyBUcmFjZXtcclxuICBjb25zdHJ1Y3RvcihwKSB7XHJcbiAgICBzdXBlcihwKTtcclxuICAgIHRoaXMuaW5pdEV2ZW50cygpO1xyXG4gIH1cclxuICBpbml0RXZlbnRzKCkge1xyXG4gICAgdGhpcy5ldmVudHMucHVzaCguLi5bXHJcbiAgICAgIFtcInRvdWNoc3RhcnRcIiwgdGhpcy5jaGlsZF0sXHJcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxyXG4gICAgICBbXCJ0b3VjaG1vdmVcIiwgd2luZG93XSxcclxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXHJcbiAgICAgIFtcInRvdWNoZW5kXCIsIHdpbmRvd10sXHJcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxyXG4gICAgICBbXCJ0b3VjaGNhbmNlbFwiLCB3aW5kb3ddXHJcbiAgICBdKTtcclxuICB9XHJcbiAgaGFuZGxlRXZlbnQoZXZlbnQpIHtcclxuICAgIGV2ZW50ID0gdGhpcy51bmlmeUV2ZW50KGV2ZW50KTtcclxuICAgIHN3aXRjaCAoZXZlbnQudHlwZSkge1xyXG4gICAgY2FzZSBcInRvdWNoc3RhcnRcIjoge1xyXG4gICAgICB0aGlzLmhhbmRsZVN0YXJ0KGV2ZW50KTtcclxuICAgIH1icmVhaztcclxuICAgIGNhc2UgXCJ0b3VjaG1vdmVcIjoge1xyXG4gICAgICB0aGlzLmhhbmRsZUdvaW5nKGV2ZW50KTtcclxuICAgIH1icmVhaztcclxuICAgIGNhc2UgXCJ0b3VjaGVuZFwiOiB7XHJcbiAgICAgIHRoaXMuaGFuZGxlU3RvcCgpO1xyXG4gICAgfWJyZWFrO1xyXG4gICAgY2FzZSBcInRvdWNoY2FuY2VsXCI6IHtcclxuICAgICAgdGhpcy5oYW5kbGVDYW5jZWwoKTtcclxuICAgIH1icmVhaztcclxuICAgIH1cclxuICB9XHJcbiAgdW5pZnlFdmVudChldmVudCkge1xyXG4gICAgaWYoZXZlbnQudG91Y2hlcyAmJiBldmVudC50b3VjaGVzWzBdKSB7XHJcbiAgICAgIGV2ZW50LnBhZ2VYID0gZXZlbnQudG91Y2hlc1swXS5wYWdlWDtcclxuICAgICAgZXZlbnQucGFnZVkgPSBldmVudC50b3VjaGVzWzBdLnBhZ2VZO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGV2ZW50O1xyXG4gIH1cclxufVxyXG5leHBvcnQgZGVmYXVsdCBUb3VjaFRyYWNlO1xyXG4iLCJpbXBvcnQge2dldFdpZHRoQW5kSGVpZ2h0LCBnZXRXaWR0aEFuZEhlaWdodFdpdGhCb3JkZXIsIHNldFN0eWxlLCBzdHlsZTJTdHJpbmd9IGZyb20gXCIuLi8uLi91dGlscy9pbmRleFwiO1xyXG5cclxuY2xhc3MgU2Nyb2xsYmFyIHtcclxuICBjb25zdHJ1Y3RvcihwKSB7XHJcbiAgICBsZXQgcGFyZW50ID0gcC5wYXJlbnQsXHJcbiAgICAgIGNoaWxkID0gcC5jaGlsZCxcclxuICAgICAgW3BhcmVudFdpZHRoLCBwYXJlbnRIZWlnaHQgXSA9Z2V0V2lkdGhBbmRIZWlnaHQocGFyZW50KSxcclxuICAgICAgW2NoaWxkV2lkdGgsIGNoaWxkSGVpZ2h0XSA9IGdldFdpZHRoQW5kSGVpZ2h0V2l0aEJvcmRlcihjaGlsZCk7XHJcbiAgICB0aGlzLnJhdGlvWCA9IHBhcmVudFdpZHRoIC8gY2hpbGRXaWR0aDtcclxuICAgIHRoaXMucmF0aW9ZID0gcGFyZW50SGVpZ2h0IC8gY2hpbGRIZWlnaHQ7XHJcbiAgICB0aGlzLmhlaWdodCA9IHRoaXMucmF0aW9ZICogMTAwICsgXCIlXCI7XHJcbiAgICB0aGlzLndpZHRoID0gdGhpcy5yYXRpb1ggKiAxMDAgKyBcIiVcIjtcclxuICAgIHRoaXMuaW5pdERvbShwYXJlbnQpO1xyXG4gICAgdGhpcy5pbml0RXZlbnRzKCk7XHJcbiAgfVxyXG4gIGluaXREb20ocGFyZW50KSB7XHJcbiAgICBsZXQgcGFyZW50U3R5bGUgPSB7XHJcbiAgICAgICAgcG9zaXRpb246IFwiYWJzb2x1dGVcIixcclxuICAgICAgICB0b3A6IDAsXHJcbiAgICAgICAgYm90dG9tOiAwLFxyXG4gICAgICAgIHJpZ2h0OiBcIjJweFwiLFxyXG4gICAgICAgIHdpZHRoOiBcIjZweFwiLFxyXG4gICAgICB9LFxyXG4gICAgICBjaGlsZFN0eWxlID0ge1xyXG4gICAgICAgIHRvcDogMCxcclxuICAgICAgICBsZWZ0OiAwLFxyXG4gICAgICAgIHBvc2l0aW9uOiBcImFic29sdXRlXCIsXHJcbiAgICAgICAgXCJib3gtc2l6aW5nXCI6IFwiYm9yZGVyLWJveFwiLFxyXG4gICAgICAgIGhlaWdodDogdGhpcy5oZWlnaHQsXHJcbiAgICAgICAgd2lkdGg6IFwiMTAwJVwiLFxyXG4gICAgICAgIFwiYm9yZGVyLXJhZGl1c1wiOiBcIjRweFwiLFxyXG4gICAgICAgIGJhY2tncm91bmQ6IFwiI2RkZGVlMFwiLFxyXG4gICAgICB9O1xyXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXHJcbiAgICBsZXQgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSxcclxuICAgICAgaHRtbCA9IGA8ZGl2IGNsYXNzPVwic2Nyb2xsZXItcGFyZW50XCIgc3R5bGU9XCIke3N0eWxlMlN0cmluZyhwYXJlbnRTdHlsZSl9XCI+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic2Nyb2xsZXItY2hpbGRcIiBzdHlsZT1cIiR7c3R5bGUyU3RyaW5nKGNoaWxkU3R5bGUpfVwiPjwvZGl2PlxyXG4gICAgICAgICAgICAgPC9kaXY+YDtcclxuICAgIGRpdi5pbm5lckhUTUwgPSBodG1sO1xyXG4gICAgcGFyZW50LmFwcGVuZChkaXYuZmlyc3RDaGlsZCk7XHJcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcclxuICAgIHRoaXMuZWxlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5zY3JvbGxlci1jaGlsZFwiKTtcclxuICB9XHJcbiAgaW5pdEV2ZW50cygpIHtcclxuICAgIHRoaXMuZXZlbnRzID0gW1xyXG4gICAgICBbW1wibW91c2Vkb3duXCIsXCJwb2ludGVyZG93blwiLFwidG91Y2hzdGFydFwiXSx0aGlzLmVsZV0sXHJcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxyXG4gICAgICBbW1wibW91c2Vtb3ZlXCIsXCJwb2ludGVybW92ZVwiLFwidG91Y2htb3ZlXCJdLCB3aW5kb3ddLFxyXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcclxuICAgICAgW1tcIm1vdXNldXBcIixcInBvaW50ZXJ1cFwiLFwidG91Y2hlbmRcIl0sIHdpbmRvd10sXHJcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxyXG4gICAgICBbW1wibW91c2VjYW5jZWxcIixcInBvaW50ZXJjYW5jZWxcIixcInRvdWNoY2FuY2VsXCJdLCB3aW5kb3ddXHJcbiAgICBdO1xyXG4gIH1cclxuICB1cGRhdGVQb3NpdGlvbih2YWx1ZSkge1xyXG4gICAgdmFsdWUgPSB0aGlzLnJhdGlvWSAqIHZhbHVlO1xyXG4gICAgc2V0U3R5bGUodGhpcy5lbGUse1xyXG4gICAgICB0b3A6IGAkey12YWx1ZX1weGBcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5leHBvcnQgZGVmYXVsdCBTY3JvbGxiYXI7XHJcbiIsImltcG9ydCB7c2V0U3R5bGUsIGdldFdpZHRoQW5kSGVpZ2h0LCBnZXRXaWR0aEFuZEhlaWdodFdpdGhCb3JkZXJ9IGZyb20gXCIuLi8uLi91dGlscy9pbmRleFwiO1xyXG5pbXBvcnQgU2Nyb2xsYmFyIGZyb20gXCIuLi9zY3JvbGxiYXIvaW5kZXhcIjtcclxuXHJcbi8qKlxyXG4gKiBQYXJ0aWNsZTog57KS5a2QXHJcbiAqL1xyXG5jbGFzcyBQYXJ0aWNsZSB7XHJcbiAgY29uc3RydWN0b3IoY2hpbGQpIHtcclxuICAgIHRoaXMuY2hpbGQgPSBjaGlsZDtcclxuICAgIHRoaXMuaW5pdCgpO1xyXG4gIH1cclxuICBpbml0KCkge1xyXG4gICAgdGhpcy5wYXJlbnQgPSB0aGlzLmNoaWxkLnBhcmVudEVsZW1lbnQ7XHJcbiAgICBsZXQgW3BhcmVudFdpZHRoLCBwYXJlbnRIZWlnaHQgXSA9Z2V0V2lkdGhBbmRIZWlnaHQodGhpcy5wYXJlbnQpLFxyXG4gICAgICBbY2hpbGRXaWR0aCwgY2hpbGRIZWlnaHRdID0gZ2V0V2lkdGhBbmRIZWlnaHRXaXRoQm9yZGVyKHRoaXMuY2hpbGQpO1xyXG4gICAgdGhpcy5tYXhZID0gcGFyZW50SGVpZ2h0IC0gY2hpbGRIZWlnaHQ7XHJcbiAgICB0aGlzLm1heFggPSBwYXJlbnRXaWR0aCAtIGNoaWxkV2lkdGg7XHJcbiAgICB0aGlzLngwID0gMDsgIC8vIHgg6LW354K5XHJcbiAgICB0aGlzLnkwID0gMDsgIC8vIHkg6LW354K5XHJcbiAgICB0aGlzLngxID0gMDsgIC8vIHgg57uI54K5XHJcbiAgICB0aGlzLnkxID0gMDsgIC8vIHkg57uI54K5XHJcbiAgICB0aGlzLnN0YXJ0WCA9IDA7ICAvLyDlvZPliY0geCDotbfngrlcclxuICAgIHRoaXMuc3RhcnRZID0gMDsgIC8vIOW9k+WJjSB5IOi1t+eCuVxyXG4gICAgdGhpcy5mbGFnID0gMDsgIC8vIOS6i+S7tuWkhOeQhumYtuaute+8jOm7mOiupCAw77yMbm90IGJlIHRyYWNlZFxyXG4gICAgdGhpcy5zdGFydFRpbWUgPSBEYXRlLm5vdygpOyAgLy8g5byA5aeL5pe26Ze0XHJcbiAgICB0aGlzLnNjcm9sbGJhciA9IG5ldyBTY3JvbGxiYXIodGhpcyk7ICAgLy8g5rua5Yqo5p2hXHJcbiAgfVxyXG4gIGluaXRTdHlsZSgpIHtcclxuICAgIHNldFN0eWxlKHRoaXMuY2hpbGQsIHtcInVzZXItc2VsZWN0XCI6IFwibm9uZVwifSk7XHJcbiAgfVxyXG59XHJcbmV4cG9ydCBkZWZhdWx0IFBhcnRpY2xlO1xyXG4iLCJpbXBvcnQgVHJhY2UgZnJvbSBcIi4uL2luZGV4XCI7XHJcbmNsYXNzIFBvaW50ZXJUcmFjZSBleHRlbmRzIFRyYWNle1xyXG4gIGNvbnN0cnVjdG9yKHApIHtcclxuICAgIHN1cGVyKHApO1xyXG4gICAgdGhpcy5pbml0RXZlbnRzKCk7XHJcbiAgfVxyXG4gIGluaXRFdmVudHMoKSB7XHJcbiAgICB0aGlzLmV2ZW50cy5wdXNoKC4uLltcclxuICAgICAgW1wicG9pbnRlcmRvd25cIiwgdGhpcy5jaGlsZF0sXHJcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxyXG4gICAgICBbXCJwb2ludGVybW92ZVwiLCB3aW5kb3ddLFxyXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcclxuICAgICAgW1wicG9pbnRlcnVwXCIsIHdpbmRvd10sXHJcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxyXG4gICAgICBbXCJwb2ludGVyY2FuY2VsXCIsIHdpbmRvd11cclxuICAgIF0pO1xyXG4gIH1cclxuICBoYW5kbGVFdmVudChldmVudCkge1xyXG4gICAgZXZlbnQgPSBzdXBlci51bmlmeUV2ZW50KGV2ZW50KTtcclxuICAgIHN3aXRjaCAoZXZlbnQudHlwZSkge1xyXG4gICAgY2FzZSBcInBvaW50ZXJkb3duXCI6IHtcclxuICAgICAgdGhpcy5oYW5kbGVTdGFydChldmVudCk7XHJcbiAgICB9YnJlYWs7XHJcbiAgICBjYXNlIFwicG9pbnRlcm1vdmVcIjoge1xyXG4gICAgICB0aGlzLmhhbmRsZUdvaW5nKGV2ZW50KTtcclxuICAgIH1icmVhaztcclxuICAgIGNhc2UgXCJwb2ludGVydXBcIjoge1xyXG4gICAgICB0aGlzLmhhbmRsZVN0b3AoKTtcclxuICAgIH1icmVhaztcclxuICAgIGNhc2UgXCJwb2ludGVyY2FuY2VsXCI6IHtcclxuICAgICAgdGhpcy5oYW5kbGVDYW5jZWwoKTtcclxuICAgIH1icmVhaztcclxuICAgIH1cclxuICB9XHJcbn1cclxuZXhwb3J0IGRlZmF1bHQgUG9pbnRlclRyYWNlO1xyXG4iLCJpbXBvcnQgVHJhY2UgZnJvbSBcIi4uL2luZGV4XCI7XHJcbmNsYXNzIFdoZWVsVHJhY2UgZXh0ZW5kcyBUcmFjZXtcclxuICBjb25zdHJ1Y3RvcihwKSB7XHJcbiAgICBzdXBlcihwKTtcclxuICAgIHRoaXMuaW5pdEV2ZW50cygpO1xyXG4gIH1cclxuICBpbml0RXZlbnRzKCkge1xyXG4gICAgdGhpcy5ldmVudHMucHVzaCguLi5bXHJcbiAgICAgIFtcIndoZWVsXCIsIHRoaXMuY2hpbGRdLFxyXG4gICAgICBbXCJtb3VzZXdoZWVsXCIsIHRoaXMuY2hpbGRdLFxyXG4gICAgICBbXCJET01Nb3VzZVNjcm9sbFwiLCB0aGlzLmNoaWxkXVxyXG4gICAgXSk7XHJcbiAgfVxyXG4gIGhhbmRsZUV2ZW50KGV2ZW50KSB7XHJcbiAgICBldmVudCA9IHRoaXMudW5pZnlFdmVudChldmVudCk7XHJcbiAgICBzd2l0Y2ggKGV2ZW50LnR5cGUpIHtcclxuICAgIGNhc2UgXCJ3aGVlbFwiOiB7XHJcbiAgICAgIGxldCB4MSA9IHRoaXMueDEgKyAoLWV2ZW50LmRlbHRhWCksXHJcbiAgICAgICAgeTEgPSB0aGlzLnkxICsgKC1ldmVudC5kZWx0YVkpO1xyXG4gICAgICB5MSA9IHkxIDwgdGhpcy5tYXhZID8gdGhpcy5tYXhZIDogeTEgPiAwID8gMCA6IHkxO1xyXG4gICAgICB4MSA9IHgxIDwgdGhpcy5tYXhYID8gdGhpcy5tYXhYIDogeDEgPiAwID8gMCA6IHgxO1xyXG4gICAgICB0aGlzLnRyYW5zbGF0ZSh4MSwgeTEpO1xyXG4gICAgfWJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuICB1bmlmeUV2ZW50KGV2ZW50KSB7XHJcbiAgICAvLyAxLiDmoIflh4Yg6byg5qCH5rua6L2u5LqL5Lu2XHJcbiAgICBpZihcImRlbHRhWFwiIGluIGV2ZW50KSB7XHJcbiAgICB9IGVsc2UgaWYoXCJ3aGVlbERlbHRheFwiIGluIGV2ZW50KSB7XHJcbiAgICAgIC8vIDIuIG1vdXNld2hlZWwg5LqL5Lu2XHJcbiAgICB9IGVsc2UgaWYoXCJ3aGVlbERlbHRhXCIgaW4gZXZlbnQpIHtcclxuXHJcbiAgICB9IGVsc2UgaWYoXCJkZXRhaWxcIiBpbiBldmVudCkge1xyXG4gICAgICAvLyAzLiBET01Nb3VzZVNjcm9sbCDkuovku7ZcclxuICAgIH1cclxuICAgIHJldHVybiBldmVudDtcclxuICB9XHJcbn1cclxuZXhwb3J0IGRlZmF1bHQgV2hlZWxUcmFjZTtcclxuIiwiaW1wb3J0IE1vdXNlVHJhY2UgZnJvbSBcIi4vY29yZS90cmFjZS9ldmVudC9tb3VzZS10cmFjZS5qc1wiO1xyXG5pbXBvcnQgVG91Y2hUcmFjZSBmcm9tIFwiLi9jb3JlL3RyYWNlL2V2ZW50L3RvdWNoLXRyYWNlXCI7XHJcbmltcG9ydCBQYXJ0aWNsZSBmcm9tIFwiLi9jb3JlL3BhcnRpY2xlL2luZGV4XCI7XHJcbmltcG9ydCBQb2ludGVyVHJhY2UgZnJvbSBcIi4vY29yZS90cmFjZS9ldmVudC9wb2ludGVyLXRyYWNlXCI7XHJcbmltcG9ydCBXaGVlbFRyYWNlIGZyb20gXCIuL2NvcmUvdHJhY2UvZXZlbnQvd2hlZWwtdHJhY2VcIjtcclxuY29uc3QgdmliID0ge1xyXG4gIGJlZ2luOiAoZWxlKSA9PiB7XHJcbiAgICBsZXQgcCA9IG5ldyBQYXJ0aWNsZShlbGUpO1xyXG4gICAgbGV0IG1vdXNlVHJhY2UgPSBuZXcgTW91c2VUcmFjZShwKSxcclxuICAgICAgdG91Y2hUcmFjZSA9IG5ldyBUb3VjaFRyYWNlKHApLFxyXG4gICAgICB3aGVlbFRyYWNlID0gbmV3IFdoZWVsVHJhY2UocCksXHJcbiAgICAgIHBvaW50ZXJUcmFjZSA9IG5ldyBQb2ludGVyVHJhY2UocCk7XHJcbiAgICBtb3VzZVRyYWNlLmxpc3RlbigpO1xyXG4gICAgdG91Y2hUcmFjZS5saXN0ZW4oKTtcclxuICAgIHdoZWVsVHJhY2UubGlzdGVuKCk7XHJcbiAgICAvLyBwb2ludGVyVHJhY2UubGlzdGVuKCk7XHJcbiAgfVxyXG59O1xyXG5leHBvcnQgZGVmYXVsdCB2aWI7XHJcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUlBLE1BQU0sUUFBUSxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksS0FBSztBQUNoQyxFQUFFLElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEMsRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMvQixDQUFDLENBQUM7QUFDRixNQUFNLFFBQVEsR0FBRyxDQUFDLEdBQUcs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QUUsQ0FBQyxDQUFDO0FBQzdCLEtBQUssTUFBTTtBQUNYLEtBQUs7QUFDTCxHQUFHO0FBQ0gsRUFBRSxVQUFVLENBQUMsS0FBSyxFQUFFO0FBVXBCLElBQUksT0FBTyxLQUFLLENBQUM7QUFDakIsR0FBRztBQUNIOztBQ2hDSyxNQUFDLEdBQUcsR0FBRztBQUNaLEVBQUUsS0FBSyxFQUFFLENBQUMsR0FBRyxLQUFLO0FBQ2xCLElBQUksSUFBSSxDQUFDLEdBQUcsSUFBSSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDOUIsSUFBTyxJQUFDLFVBQVUsR0FBRyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2QyxNQUFNLFVBQVUsR0FBRyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyQyxNQUFNLFVBQVUsR0FBRyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyQyxNQUFxQixJQUFJLFlBQVksQ0FBQyxDQUFDLEVBQUU7QUFDekMsSUFBSSxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDeEIsSUFBSSxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDeEIsSUFBSSxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDeEI7QUFDQSxHQUFHO0FBQ0g7Ozs7In0=
