import MouseTrace from "./core/trace/mouse-trace.js";
import Particle from "./core/particle/index";
const vib = {
  begin: (ele) => {
    let p = new Particle(ele);
    let mouseTrace = new MouseTrace(p);
    mouseTrace.listen();
  }
};
export default vib;
