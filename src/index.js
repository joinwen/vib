import TouchTrace from "./core/trace/index.js";
const vib = {
  begin: (ele) => {
    let touchTrace = new TouchTrace(ele);
    touchTrace.listen();
  }
};
export default vib;
