const getStyle = (ele, attr) => {
  // eslint-disable-next-line no-undef
  return document.defaultView.getComputedStyle(ele)[attr];
};
const setStyle = (ele, data) => {
  let attr = Object.keys(data)[0];
  ele.style[attr] = data[attr];
};
const getWidth = (ele) => {
  return ele.clientWidth;
};
const getHeight = (ele) => {
  return ele.clientHeight;
};
const getWidthAndHeight = (ele) => {
  return [
    getWidth(ele),
    getHeight(ele)
  ];
};
const getWidthWithBorder = (ele) => {
  return ele.offsetWidth;
};
const getHeightWithBorder = (ele) => {
  return ele.offsetHeight;
};

const getWidthAndHeightWithBorder = (ele) => {
  return [
    getWidthWithBorder(ele),
    getHeightWithBorder(ele)
  ];
};

// eslint-disable-next-line no-undef
const raf = window.requestAnimationFrame || function(callback) {
  // eslint-disable-next-line no-undef
  window.setTimeout((callback), 17);
};
// eslint-disable-next-line no-undef
const cancelRaf = window.cancelAnimationFrame || clearTimeout;

export {
  raf,
  cancelRaf,
  getStyle,
  setStyle,
  getWidth,
  getHeight,
  getWidthAndHeight,
  getWidthWithBorder,
  getHeightWithBorder,
  getWidthAndHeightWithBorder
};
