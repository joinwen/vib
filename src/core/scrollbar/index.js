import {getWidthAndHeight, getWidthAndHeightWithBorder, style2String} from "../../utils/index";

class Scrollbar {
  constructor(p) {
    let parent = p.parent,
      child = p.child,
      [parentWidth, parentHeight ] =getWidthAndHeight(parent),
      [childWidth, childHeight] = getWidthAndHeightWithBorder(child);
    this.height = (parentHeight / childHeight) * 100 + "%";
    this.width = (parentWidth / childWidth ) * 100 + "%";
    this.buildScrollbar(parent);
  }
  buildScrollbar(parent) {
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
  }
}
export default Scrollbar;
