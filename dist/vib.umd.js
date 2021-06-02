(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.vib = factory());
}(this, (function () { 'use strict';

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

  return vib;

})));