(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.vib = factory());
}(this, (function () { 'use strict';

  class Action {
    static transform(ele, x, y) {
      ele.style.transform = `translateY(${y}px)`;
    }
  }

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

  class PointerTrace extends Trace{
    constructor(ele) {
      super(ele);
      this.initEvents();
      this.flag = false;
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
      this.generatePositionFromEvent(event);
      switch (event.type) {
      case "pointerdown": {
        this.position.startX = event.pageX;
        this.position.startY = event.pageY;
        this.flag = true;
      }break;
      case "pointermove": {
        if(!this.flag) {
          return;
        }
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
      case "pointerup":
        this.flag = false;
        break;
      case "pointercancel":
        this.flag = false;
        break;
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
      // let mouseTrace = new MouseTrace(ele);
      let pointerTrace = new PointerTrace(ele);
      // touchTrace.listen();
      // mouseTrace.listen();
      pointerTrace.listen();
    }
  };

  return vib;

})));
