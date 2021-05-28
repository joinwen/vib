import TouchTrace from "./core/trace/touch-trace.js";
const vib = {
  begin: (ele) => {
    let touchTrace = new TouchTrace(ele);
    touchTrace.listen();
  }
};
export default vib;
