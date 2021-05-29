import {setStyle, getWidthAndHeight, getWidthAndHeightWithBorder} from "../../utils";

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
    this.x = 0;
    this.y = 0;
  }
  initStyle() {
    setStyle(this.child, {"user-select": "none"});
  }
}
export default Particle;
