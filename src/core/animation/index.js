import {cancelRaf, raf, setStyle} from "../../utils/index";

function animation(ele, duration, location) {
  let start = Date.now();
  let fn = () => {
    let passed = Date.now() - start,
      progress = passed / duration,
      id = null;
    if(progress <= 1) {
      setStyle(ele,{
        [location.attr]: [location.value(progress)]
      });
      id = raf(fn);
    } else {
      setStyle(ele,{
        [location.attr]: [location.value(1)]
      });
      cancelRaf(id);
    }
  };
  fn();
}
export default animation;
