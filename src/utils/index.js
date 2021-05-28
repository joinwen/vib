const getStyle = (ele, attr) => {
  // eslint-disable-next-line no-undef
  return document.defaultView.getComputedStyle(ele)[attr];
};
const setStyle = (ele, data) => {
  let attr = Object.keys(data)[0],
    value = data[attr];
  ele.style[attr] = value;
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
export {
  getStyle,
  setStyle,
  getWidth,
  getHeight,
  getWidthAndHeight,
  getWidthWithBorder,
  getHeightWithBorder,
  getWidthAndHeightWithBorder
};