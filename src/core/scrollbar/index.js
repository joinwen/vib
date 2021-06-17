import {getWidthAndHeight, getWidthAndHeightWithBorder, setStyle, style2String} from "../../utils/index";

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
            moveY = event.pageY,
            deltaX = event.pageX - this.startX,
            deltaY = event.pageY - this.startY,
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
export default Scrollbar;
