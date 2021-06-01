const STRATEGY_LIST = {
  linear: (progress) => {
    return progress;
  },
  easeIn: (progress) => {
    return STRATEGY_LIST.easeInQuad(progress);
  },
  easeInQuad: (progoress) => {
    return Math.pow(progoress, 2);
  },
  easeInCubic: (progress) => {
    return Math.pow(progress, 3);
  },
  easeInQuart: (progress) => {
    return Math.pow(progress, 4);
  },
  easeInQuint: (progress) => {
    return Math.pow(progress, 5);
  },
  easeOut: (progress) => {
    return STRATEGY_LIST.easeOutQuad(progress);
  },
  easeOutQuad: (progress) => {
    return progress * 2 - Math.pow(progress, 2);
  },
  easeOutCubic: (progress) => {
    return Math.pow(progress - 1, 3) + 1;
  },
  easeOutQuart: (progress) => {
    return 1 - Math.pow(progress - 1, 4);
  },
  easeOutQuint: (progress) => {
    return Math.pow(progress - 1, 5) + 1;
  },
  back: (progress) => {
    let b = 4;
    return (progress = progress - 1) * progress * ((b + 1) * progress + b) + 1;
  },
  bounce: (progress) => {
    if ((progress /= 1) < 1 / 2.75) {
      return 7.5625 * progress * progress;
    } else if (progress < 2 / 2.75) {
      return 7.5625 * (progress -= 1.5 / 2.75) * progress + 0.75;
    } else if (progress < 2.5 / 2.75) {
      return 7.5625 * (progress -= 2.25 / 2.75) * progress + 0.9375;
    } else {
      return 7.5625 * (progress -= 2.625 / 2.75) * progress + 0.984375;
    }
  },
  elastic: (progress) => {
    var f = 0.22,
      e = 0.4;

    if (progress === 0) {
      return 0;
    }
    if (progress === 1) {
      return 1;
    }

    return e * Math.pow(2, -10 * progress) * Math.sin(((progress - f / 4) * (2 * Math.PI)) / f) + 1;
  },
};
const STRATEGY = {};
Object.keys(STRATEGY_LIST).forEach((key) => {
  STRATEGY[key] = key;
});
export { STRATEGY_LIST, STRATEGY };
