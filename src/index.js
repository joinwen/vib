import TouchTrace from "./core/trace/touch-trace.js";
import MouseTrace from "./core/trace/mouse-trace.js";
const vib = {
  begin: (ele) => {
    let touchTrace = new TouchTrace(ele);
    let mouseTrace = new MouseTrace(ele);
    touchTrace.listen();
    mouseTrace.listen();
  }
};
export default vib;
