import animation from "../animation/index";

class Action {
  static transform(ele, y) {
    ele.style.transform = `translateY(${y}px)`;
  }
  static transformWithAnimation(ele, y, oldY, duration) {
    console.log(y, oldY, duration);
    let deltaY = y - oldY;
    animation(ele, duration,{
      attr: "transform",
      value: (progress) => {
        let newY = (progress * deltaY) + oldY;
        return `translateY(${newY}px)`;
      }
    });
  }

  /**
   *
   * @param x0 起点位移
   * @param x1 终点位移
   * @param a 加速度
   */
  static momentum(x0, x1, startTime, max, a = 0.0006) {
    console.log(x0, x1);
    let time = Date.now() - startTime,
      distance = x1 - x0,
      speed = Math.abs(distance) / time,
      x = x1 + (speed * speed) / (2 * a) * (distance < 0 ? -1 : 1),
      t = speed / a;
    if(x < max) {
      x = max;
      distance = Math.abs(x - x1);
      t = distance / speed;
    } else if(x > 0) {
      x = 0;
      distance = Math.abs(x1) + x;
      t = distance / speed;
    }
    return [
      x,
      t
    ];
  }
}
export default Action;
