'use strict';

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

module.exports = vib;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmliLmNqcy5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL2NvcmUvYWN0aW9uL2luZGV4LmpzIiwiLi4vc3JjL3V0aWxzL2luZGV4LmpzIiwiLi4vc3JjL2NvcmUvdHJhY2UvaW5kZXguanMiLCIuLi9zcmMvY29yZS90cmFjZS90b3VjaC10cmFjZS5qcyIsIi4uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBBY3Rpb24ge1xuICBzdGF0aWMgdHJhbnNmb3JtKGVsZSwgeCwgeSkge1xuICAgIGVsZS5zdHlsZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlWSgke3l9cHgpYDtcbiAgfVxufVxuZXhwb3J0IGRlZmF1bHQgQWN0aW9uO1xuIiwiY29uc3QgZ2V0U3R5bGUgPSAoZWxlLCBhdHRyKSA9PiB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxuICByZXR1cm4gZG9jdW1lbnQuZGVmYXVsdFZpZXcuZ2V0Q29tcHV0ZWRTdHlsZShlbGUpW2F0dHJdO1xufTtcbmNvbnN0IHNldFN0eWxlID0gKGVsZSwgZGF0YSkgPT4ge1xuICBsZXQgYXR0ciA9IE9iamVjdC5rZXlzKGRhdGEpWzBdLFxuICAgIHZhbHVlID0gZGF0YVthdHRyXTtcbiAgZWxlLnN0eWxlW2F0dHJdID0gdmFsdWU7XG59O1xuY29uc3QgZ2V0V2lkdGggPSAoZWxlKSA9PiB7XG4gIHJldHVybiBlbGUuY2xpZW50V2lkdGg7XG59O1xuY29uc3QgZ2V0SGVpZ2h0ID0gKGVsZSkgPT4ge1xuICByZXR1cm4gZWxlLmNsaWVudEhlaWdodDtcbn07XG5jb25zdCBnZXRXaWR0aEFuZEhlaWdodCA9IChlbGUpID0+IHtcbiAgcmV0dXJuIFtcbiAgICBnZXRXaWR0aChlbGUpLFxuICAgIGdldEhlaWdodChlbGUpXG4gIF07XG59O1xuY29uc3QgZ2V0V2lkdGhXaXRoQm9yZGVyID0gKGVsZSkgPT4ge1xuICByZXR1cm4gZWxlLm9mZnNldFdpZHRoO1xufTtcbmNvbnN0IGdldEhlaWdodFdpdGhCb3JkZXIgPSAoZWxlKSA9PiB7XG4gIHJldHVybiBlbGUub2Zmc2V0SGVpZ2h0O1xufTtcblxuY29uc3QgZ2V0V2lkdGhBbmRIZWlnaHRXaXRoQm9yZGVyID0gKGVsZSkgPT4ge1xuICByZXR1cm4gW1xuICAgIGdldFdpZHRoV2l0aEJvcmRlcihlbGUpLFxuICAgIGdldEhlaWdodFdpdGhCb3JkZXIoZWxlKVxuICBdO1xufTtcbmV4cG9ydCB7XG4gIGdldFN0eWxlLFxuICBzZXRTdHlsZSxcbiAgZ2V0V2lkdGgsXG4gIGdldEhlaWdodCxcbiAgZ2V0V2lkdGhBbmRIZWlnaHQsXG4gIGdldFdpZHRoV2l0aEJvcmRlcixcbiAgZ2V0SGVpZ2h0V2l0aEJvcmRlcixcbiAgZ2V0V2lkdGhBbmRIZWlnaHRXaXRoQm9yZGVyXG59O1xuIiwiaW1wb3J0IHtnZXRXaWR0aEFuZEhlaWdodCwgZ2V0V2lkdGhBbmRIZWlnaHRXaXRoQm9yZGVyfSBmcm9tIFwiLi4vLi4vdXRpbHMvaW5kZXhcIjtcblxuLyoqXG4gKiDlpITnkIbmqKHmnb9cbiAqL1xuY2xhc3MgVHJhY2Uge1xuICBjb25zdHJ1Y3RvcihjaGlsZCkge1xuICAgIHRoaXMuY2hpbGQgPSBjaGlsZDtcbiAgICB0aGlzLnBhcmVudCA9IGNoaWxkLnBhcmVudEVsZW1lbnQ7XG4gICAgdGhpcy5pbml0KCk7XG4gIH1cbiAgaW5pdCgpIHtcbiAgICB0aGlzLnggPSAwO1xuICAgIHRoaXMueSA9IDA7XG4gICAgdGhpcy5wb3NpdGlvbiA9IHt9O1xuICAgIHRoaXMuZXZlbnRzID0gW107XG4gICAgbGV0IFsgcGFyZW50V2lkdGgsIHBhcmVudEhlaWdodCBdID0gZ2V0V2lkdGhBbmRIZWlnaHQodGhpcy5wYXJlbnQpLFxuICAgICAgW2NoaWxkV2lkdGgsIGNoaWxkSGVpZ2h0XSA9IGdldFdpZHRoQW5kSGVpZ2h0V2l0aEJvcmRlcih0aGlzLmNoaWxkKTtcbiAgICB0aGlzLm1heFkgPSBwYXJlbnRIZWlnaHQgLSBjaGlsZEhlaWdodDtcbiAgICB0aGlzLm1heFggPSBwYXJlbnRXaWR0aCAtIGNoaWxkV2lkdGg7XG4gIH1cbiAgbGlzdGVuKCkge1xuICAgIHRoaXMuZXZlbnRzLmZvckVhY2goZXZlbnQgPT4ge1xuICAgICAgdGhpcy5jaGlsZC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCB0aGlzKTtcbiAgICB9KTtcbiAgfVxuICBnZW5lcmF0ZVBvc2l0aW9uRnJvbUV2ZW50KGV2ZW50KSB7XG4gICAgbGV0IGRhdGEgPSBldmVudC50b3VjaGVzWzBdO1xuICAgIHRoaXMucG9zaXRpb24ucGFnZVggPSBkYXRhLnBhZ2VYO1xuICAgIHRoaXMucG9zaXRpb24ucGFnZVkgPSBkYXRhLnBhZ2VZO1xuICB9XG59XG5leHBvcnQgZGVmYXVsdCBUcmFjZTtcbiIsImltcG9ydCBBY3Rpb24gZnJvbSBcIi4uL2FjdGlvbi9pbmRleFwiO1xuaW1wb3J0IFRyYWNlIGZyb20gXCIuL2luZGV4XCI7XG5cbmNsYXNzIFRvdWNoVHJhY2UgZXh0ZW5kcyBUcmFjZXtcbiAgY29uc3RydWN0b3IoZWxlKSB7XG4gICAgc3VwZXIoZWxlKTtcbiAgICB0aGlzLmluaXRFdmVudHMoKTtcbiAgfVxuICBpbml0RXZlbnRzKCkge1xuICAgIHRoaXMuZXZlbnRzLnB1c2goLi4uW1xuICAgICAgXCJ0b3VjaHN0YXJ0XCIsXG4gICAgICBcInRvdWNobW92ZVwiLFxuICAgICAgXCJ0b3VjaGVuZFwiLFxuICAgICAgXCJ0b3VjaGNhbmNlbFwiXG4gICAgXSk7XG4gIH1cbiAgaGFuZGxlRXZlbnQoZXZlbnQpIHtcbiAgICB0aGlzLmdlbmVyYXRlUG9zaXRpb25Gcm9tRXZlbnQoZXZlbnQpO1xuICAgIHN3aXRjaCAoZXZlbnQudHlwZSkge1xuICAgIGNhc2UgXCJ0b3VjaHN0YXJ0XCI6IHtcbiAgICAgIHRoaXMucG9zaXRpb24uc3RhcnRYID0gdGhpcy5wb3NpdGlvbi5wYWdlWDtcbiAgICAgIHRoaXMucG9zaXRpb24uc3RhcnRZID0gdGhpcy5wb3NpdGlvbi5wYWdlWTtcbiAgICB9YnJlYWs7XG4gICAgY2FzZSBcInRvdWNobW92ZVwiOiB7XG4gICAgICBsZXQgbW92ZVggPSB0aGlzLnBvc2l0aW9uLnBhZ2VYLFxuICAgICAgICBtb3ZlWSA9IHRoaXMucG9zaXRpb24ucGFnZVksXG4gICAgICAgIGRlbHRhWCA9IG1vdmVYIC0gdGhpcy5wb3NpdGlvbi5zdGFydFgsXG4gICAgICAgIGRlbHRhWSA9IG1vdmVZIC0gdGhpcy5wb3NpdGlvbi5zdGFydFk7XG4gICAgICB0aGlzLnBvc2l0aW9uLnN0YXJ0WCA9IG1vdmVYO1xuICAgICAgdGhpcy5wb3NpdGlvbi5zdGFydFkgPSBtb3ZlWTtcbiAgICAgIHRoaXMueCA9IHRoaXMueCArIGRlbHRhWDtcbiAgICAgIHRoaXMueSA9IHRoaXMueSArIGRlbHRhWTtcbiAgICAgIGlmKHRoaXMueSA8IHRoaXMubWF4WSkge1xuICAgICAgICB0aGlzLnkgPSB0aGlzLm1heFk7XG4gICAgICB9XG4gICAgICBpZih0aGlzLnkgPiAwKSB7XG4gICAgICAgIHRoaXMueSA9IDA7XG4gICAgICB9XG4gICAgICBBY3Rpb24udHJhbnNmb3JtKHRoaXMuY2hpbGQsIHRoaXMueCwgdGhpcy55KTtcbiAgICB9YnJlYWs7XG4gICAgY2FzZSBcInRvdWNoZW5kXCI6XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwidG91Y2hjYW5jZWxcIjpcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxufVxuZXhwb3J0IGRlZmF1bHQgVG91Y2hUcmFjZTtcbiIsImltcG9ydCBUb3VjaFRyYWNlIGZyb20gXCIuL2NvcmUvdHJhY2UvdG91Y2gtdHJhY2UuanNcIjtcbmNvbnN0IHZpYiA9IHtcbiAgYmVnaW46IChlbGUpID0+IHtcbiAgICBsZXQgdG91Y2hUcmFjZSA9IG5ldyBUb3VjaFRyYWNlKGVsZSk7XG4gICAgdG91Y2hUcmFjZS5saXN0ZW4oKTtcbiAgfVxufTtcbmV4cG9ydCBkZWZhdWx0IHZpYjtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLE1BQU0sTUFBTSxDQUFDO0FB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