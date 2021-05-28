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

  class TouchTrace {
    constructor(ele) {
      this.ele = ele;
      this.init();
    }
    init() {
      this.x = 0;
      this.y = 0;
      this.position = {};
      this.events = [
        "touchstart",
        "touchmove",
        "touchend",
        "touchcancel"
      ];
      let [ parentWidth,parentHeight ] = getWidthAndHeight(this.ele.parentElement),
        [childWidth, childHeight ] = getWidthAndHeightWithBorder(this.ele);
      this.maxY = parentHeight - childHeight;
      this.maxX = parentWidth - childWidth;
    }
    handleEvent(event) {
      this.generatePositionFromEvent(event);
      switch (event.type) {
      case "touchstart": {
        let startX = this.position.pageX,
          startY = this.position.pageY;
        this.position.startX = startX;
        this.position.startY = startY;
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
        Action.transform(this.ele, this.x, this.y);
      }break;
      }
    }
    generatePositionFromEvent(event) {
      let data = event.touches[0];
      this.position.pageX = data.pageX;
      this.position.pageY = data.pageY;
    }
    listen() {
      this.events.forEach(event => {
        this.ele.addEventListener(event, this);
      });
    }
  }

  const vib = {
    begin: (ele) => {
      let touchTrace = new TouchTrace(ele);
      touchTrace.listen();
    }
  };

  return vib;

})));
