import TouchTrace from "./core/trace/touch-trace.js";
import MouseTrace from "./core/trace/mouse-trace.js";
import PointerTrace from "./core/trace/pointer-trace";
import WheelTrace from "./core/trace/wheel-trace";
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
export default vib;
