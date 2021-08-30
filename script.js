const filters = document.querySelector('.filters');
const inputs = document.querySelectorAll('.filters input');
const outputs = document.querySelectorAll('.filters output');
const resetBtn = document.querySelector('.btn-reset');
const nextBtn = document.querySelector('.btn-next');
const loadBtn = document.querySelector('.btn-load');
const saveBtn = document.querySelector('.btn-save');
const fileInput = document.querySelector('input[type="file"]');
const buttons = document.querySelectorAll('.btn');
const fullscreenBtn = document.querySelector('.fullscreen');
const canvasContainer = document.querySelector('.canvas-container');
const canvas = canvasContainer.querySelector('canvas');
const defaultInputValues = {};
let currentInputValues = {};

//=== Record default inputs values

inputs.forEach((input, i) => {
  defaultInputValues[input.name] = input.value + input.dataset.sizing;
});

currentInputValues = { ...defaultInputValues };

//=== Fullscreen mode toggler

function goFullscreen() {
  fullscreenBtn.classList.remove('openfullscreen');
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen();
  } else if (document.documentElement.mozRequestFullScreen) {
    document.documentElement.mozRequestFullScreen();
  } else if (document.documentElement.webkitRequestFullscreen) {
    document.documentElement.webkitRequestFullscreen();
  } else if (document.documentElement.msRequestFullscreen) {
    document.documentElement.msRequestFullscreen();
  }
}

function leaveFullscreen() {
  fullscreenBtn.classList.add('openfullscreen');
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  }
}

document.addEventListener('fullscreenchange', () => {
  if (document.fullscreenElement) {
    fullscreenBtn.classList.remove('openfullscreen');
  } else {
    fullscreenBtn.classList.add('openfullscreen');
  }
});

fullscreenBtn.addEventListener('click', e => {
  return document.fullscreenElement ? leaveFullscreen() : goFullscreen();
});

//=== Buttons active state handler

function setActiveBtn() {
  buttons.forEach(btn => {
    btn.classList.remove('btn-active');
  });
  this.classList.add('btn-active');
}

buttons.forEach(btn => {
  btn.addEventListener('click', setActiveBtn);
});

//=== Reset inputs

resetBtn.addEventListener('click', () => {
  inputs.forEach(input => {
    input.value = parseInt(defaultInputValues[input.name]);
    setOutput(input);
    reloadCanvas();
  });
});

//=== Show image
const ctx = canvas.getContext('2d');
let imgObj = new Image();
imgObj.setAttribute('crossOrigin', 'anonymous');

function reloadCanvas(filter = '') {
  canvas.width = parseInt(window.getComputedStyle(canvasContainer).width);

  let imgObjWidth = imgObj.naturalWidth;
  let imgObjHeight = imgObj.naturalHeight;
  let aspect = imgObjWidth / imgObjHeight;

  let width;
  let height;
  if (aspect < 1 && parseInt(window.innerWidth) > 520) {
    height = 520;
    width = height * aspect;
  } else {
    width = canvas.width;
    height = width / aspect;
  }
  canvas.width = width;
  canvas.height = height;

  ctx.filter = filter;
  ctx.drawImage(imgObj, 0, 0, width, height);
}

function showImage(source) {
  imgObj.src = source;

  imgObj.addEventListener('load', () => {
    loaded = true;
    reloadCanvas(createPhotoFilter());
  });

  window.addEventListener('resize', () => {
    reloadCanvas(createPhotoFilter());
  });
}

showImage(canvas.dataset.firstimage);

//=== Set next image

const imagesPath = 'https://raw.githubusercontent.com/rolling-scopes-school/stage1-tasks/assets/images/';

const schedule = {
  6: 'night',
  12: 'morning',
  18: 'day',
  24: 'evening',
};

let timeNow = new Date();
let dayTimeNow = (Math.floor(timeNow.getHours() / 6) + 1) * 6;
let count = 0;
let virtualImg = new Image();
let loaded = true;

function setNextImage() {
  function makeTwoDigits(num) {
    return num < 10 ? '0' + num : num;
  }

  count++;
  if (count > 20) {
    count = 1;
  }

  let pathToImage = `${imagesPath}${schedule[dayTimeNow]}/${makeTwoDigits(count)}.jpg`;

  showImage(pathToImage);
}

nextBtn.addEventListener('click', () => {
  if (!loaded) {
    return;
  }
  loaded = false;
  setNextImage();
});

//=== Set local images

fileInput.addEventListener('input', () => {
  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.addEventListener(
    'load',
    () => {
      showImage(reader.result);
    },
    false,
  );
  if (file) {
    reader.readAsDataURL(file);
    fileInput.value = null;
  }
});

//=== Create photo filter

function createPhotoFilter() {
  let appliedFilters = [];

  for (let inputValue in currentInputValues) {
    appliedFilters.push(`${inputValue}(${currentInputValues[inputValue]})`);
  }

  return appliedFilters.join(' ');
}

function setOutput(element) {
  let output = element.nextElementSibling;
  if (!output.matches('output')) {
    return;
  }
  output.value = element.value;
  currentInputValues[element.name] = element.value + element.dataset.sizing;
}

filters.addEventListener('input', e => {
  let element = e.target;
  if (element.matches('input')) {
    setOutput(element);
  }
  reloadCanvas(createPhotoFilter());
});

//=== Save filtered image

function saveImage(filter) {
  let virtualLink = document.createElement('a');
  let widthForCalc = canvas.width;
  let filterForSafe;

  canvas.width = imgObj.naturalWidth;
  canvas.height = imgObj.naturalHeight;

  let widthAspect = imgObj.naturalWidth / widthForCalc;

  filterForSafe = filter.replace(/blur\(.*px\)/gi, `blur(${parseInt(currentInputValues.blur) * widthAspect}px)`);

  ctx.filter = filterForSafe;
  ctx.drawImage(imgObj, 0, 0, imgObj.naturalWidth, imgObj.naturalHeight);

  virtualLink.download = 'download.png';
  virtualLink.href = canvas.toDataURL('image/png');
  virtualLink.click();
  virtualLink.remove();

  reloadCanvas(createPhotoFilter());
}

saveBtn.addEventListener('click', e => {
  e.preventDefault();
  saveImage(createPhotoFilter());
});
