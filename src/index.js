import MouseTrace from "./core/trace/event/mouse-trace.js";
import TouchTrace from "./core/trace/event/touch-trace";
import Particle from "./core/particle/index";
import PointerTrace from "./core/trace/event/pointer-trace";
import WheelTrace from "./core/trace/event/wheel-trace";
import ScrollbarTrace from "./core/trace/event/scrollbar-trace";
const vib = {
  begin: (ele) => {
    let p = new Particle(ele);
    let mouseTrace = new MouseTrace(p),
      touchTrace = new TouchTrace(p),
      wheelTrace = new WheelTrace(p),
      scrollbarTrace = new ScrollbarTrace(p),
      pointerTrace = new PointerTrace(p);
    // mouseTrace.listen();
    // touchTrace.listen();
    // wheelTrace.listen();
    scrollbarTrace.listen();
    // pointerTrace.listen();
  }
};
export default vib;
