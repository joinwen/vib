(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.vib = factory());
}(this, (function () { 'use strict';

  const setStyle = (ele, data) => {
    let attr = Object.keys(data)[0],
      value = data[attr];
    ele.style[attr] = value;
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

  function animation(ele, duration, location) {
    let start = Date.now();
    let fn = () => {
      let passed = Date.now() - start,
        progress = passed / duration,
        id = null;
      if(progress <= 1) {
        setStyle(ele,{
          [location.attr]: [location.value(progress)]
        });
        id = raf(fn);
      } else {
        setStyle(ele,{
          [location.attr]: [location.value(1)]
        });
        cancelRaf(id);
      }
    };
    fn();
  }

  class Action {
    static transform(ele, y) {
      ele.style.transform = `translateY(${y}px)`;
    }
    static transformWithAnimation(ele, y, oldY, duration) {
      console.log(y, oldY, duration);
      let deltaY = y - oldY;
      animation(ele, duration,{
        attr: "transform",
        value: (progress) => {
          let newY = (progress * deltaY) + oldY;
          return `translateY(${newY}px)`;
        }
      });
    }

    /**
     *
     * @param x0 起点位移
     * @param v0 起点速度
     * @param a 加速度
     */
    static momentum(x0, x1, startTime, max, a = 0.006) {
      console.log(x0, x1);
      let time = Date.now() - startTime,
        distance = x1 - x0,
        speed = Math.abs(distance) / time,
        x = x1 + (speed * speed) / (2 * a) * (distance < 0 ? -1 : 1),
        t = speed / a;
      if(x < max) {
        x = max;
        distance = Math.abs(x - x1);
        t = distance / speed;
      } else if(x > 0) {
        x = 0;
        distance = Math.abs(x1) + x;
        t = distance / speed;
      }
      return [
        x,
        t
      ];
    }
  }

  /**
   * 处理模板
   */
  class Trace {
    constructor(child) {
      this.child = child;
      this.parent = child.parentElement;
      this.init();
      this.initStyle();
    }
    init() {
      this.x = 0;
      this.y = 0;
      this.oldX = 0;
      this.oldY = 0;
      this.position = {};
      this.events = [];
      let [ parentWidth, parentHeight ] = getWidthAndHeight(this.parent),
        [childWidth, childHeight] = getWidthAndHeightWithBorder(this.child);
      this.maxY = parentHeight - childHeight;
      this.maxX = parentWidth - childWidth;
    }
    initStyle() {
      setStyle(this.child, {"user-select": "none"});
    }
    listen() {
      this.events.forEach(event => {
        event[1].addEventListener(event[0], this);
      });
    }
    generatePositionFromEvent(event) {
      let data = event.touches[0];
      this.position.pageX = data.pageX;
      this.position.pageY = data.pageY;
    }
  }

  class MouseTrace extends Trace{
    constructor(ele) {
      super(ele);
      this.initEvents();
      this.flag = 3;
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
      this.generatePositionFromEvent(event);
      switch (event.type) {
      case "mousedown": {
        console.log("mousedown");
        this.flag = 1;
        this.child.addEventListener("selectstart", (e) => {
          e.preventDefault();
        });
        this.position.startX = this.position.pageX;
        this.position.startY = this.position.pageY;
        this.startTime = Date.now();
      }break;
      case "mousemove": {
        if(this.flag === 3) {
          return;
        }
        this.flag = 2;
        console.log("move");
        let moveX = this.position.pageX,
          moveY = this.position.pageY,
          deltaX = moveX - this.position.startX,
          deltaY = moveY - this.position.startY;
        this.position.startX = moveX;
        this.position.startY = moveY;
        this.x += deltaX;
        this.y += deltaY;
        if(this.y < this.maxY) {
          this.y = this.maxY;
        }
        if(this.y > 0) {
          this.y = 0;
        }
        Action.transform(this.child, this.y);
        if(Date.now() - this.startTime > 300) {
          this.startTime = Date.now();
        }
      }break;
      case "mouseup": {
        console.log("mouseup");
        if(this.flag === 2) {
          this.flag = 3;
          let [y, time] = Action.momentum(this.position.startY, this.y, this.startTime, this.maxY);
          console.log(y);
          Action.transformWithAnimation(this.child, y, this.y, time);
          this.y = y;
        }
        this.flag = 3;
      }break;
      case "mousecancel": {
        console.log("mousecancel");
        this.flag = 3;
      }break;
      }
    }
    generatePositionFromEvent(event) {
      this.position.pageX = event.pageX;
      this.position.pageY = event.pageY;
    }
  }

  const vib = {
    begin: (ele) => {
      // let touchTrace = new TouchTrace(ele);
      let mouseTrace = new MouseTrace(ele);
      // let pointerTrace = new PointerTrace(ele);
      // let wheelTrace = new WheelTrace(ele);
      // touchTrace.listen();
      mouseTrace.listen();
      // pointerTrace.listen();
      // wheelTrace.listen();
    }
  };

  return vib;

})));
