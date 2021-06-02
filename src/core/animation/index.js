import {cancelRaf, raf, setStyle} from "../../utils/index";
import {STRATEGY_LIST} from "./strategy";
class Animation {
  /**
   *
   * @param x0 起点
   * @param x1 终点
   * @param duration 动画时长
   */
  animate([x0, x1], [y0, y1], duration, strategy = "easeOutQuint") {
    let start = Date.now(),
      strategyFn = STRATEGY_LIST[strategy];
    let fn = () => {
      let passed = Date.now() - start,
        progress = this.round(strategyFn(passed / duration), 6),
        id = null,
        deltaX = x1 - x0,
        deltaY = y1 - y0;
      console.log(progress);
      if(this.flag === 3) {
        if(progress < 1){
          this.translate(x0 + deltaX * progress,y0 + deltaY * progress);
          id = raf(fn);
        } else {
          this.translate(x0 + deltaX, y0 + deltaY);
          cancelRaf(id);
        }
      }
    };
    fn();
  }
  round(number, precision) {
    return Math.round(+number + "e" + precision) / Math.pow(10, precision);
  }
  translate(horValue, verValue) {
    this.y1 = Math.round(verValue);
    this.x1 = Math.round(horValue);
    setStyle(this.child, {
      transform: `translateY(${this.y1}px) translateX(${this.x1}px)`
    });
  }

  /**
   *
   * @param x0 起点
   * @param x1 终点
   * @param startTime 起始时间
   * @param max 最大位移
   * @param a 加速度
   * @returns {(*|number)[]}
   */
  momentum(x0, x1, startTime, max, a = 0.0006) {
    let time, distance, speed, x, t;
    time = Date.now() - startTime;  // 时间
    distance = x1 - x0;             // 位移
    speed = Math.abs(distance) / time;  // 平均速度 => 起始速度
    x = x1 + (speed * speed) / (2 * a) * (distance < 0 ? -1 : 1);   // 以a为加速度匀减速到0的位移
    t = speed / a;  // 匀减速运动的时间
    if(x < max) {
      x = max;
      distance = Math.abs(x - x1);
      t = distance / speed;
    }
    if(x > 0) {
      x = 0;
      distance = Math.abs(x1) + x;
      t = distance / speed;
    }
    return [
      x1,
      Math.round(x),
      t
    ];
  }
}
export default Animation;
