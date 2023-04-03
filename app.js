const dropArea = document.querySelector(".drop-area");
const preview = document.getElementById("preview");
const ctx = preview.getContext("2d");
const downloadPngButton = document.getElementById("download-png");
const downloadJpegButton = document.getElementById("download-jpeg");
const sizeSlider = document.getElementById("size-slider");
const sizeValue = document.getElementById("size-value");
const roundnessSlider = document.getElementById("roundness-slider");
const roundnessValue = document.getElementById("roundness-value");
const xCenterSlider = document.getElementById("x-center-slider");
const xCenterValue = document.getElementById("x-center-value");
const yCenterSlider = document.getElementById("y-center-slider");
const yCenterValue = document.getElementById("y-center-value");
const zoomSlider = document.getElementById("zoom-slider");
const zoomValue = document.getElementById("zoom-value");

let currentImage;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function circleCropImage(image, size, roundness, xCenter, yCenter, zoom) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const minDimension = Math.min(image.width, image.height) * ((100 - zoom) / 100);

  const sx = (image.width - minDimension) * xCenter / 100;
  const sy = (image.height - minDimension) * yCenter / 100;

  canvas.width = canvas.height = size;

  const borderRadius = (size / 2) * roundness;
  ctx.beginPath();
  ctx.moveTo(borderRadius, 0);
  ctx.lineTo(size - borderRadius, 0);
  ctx.arcTo(size, 0, size, borderRadius, borderRadius);
  ctx.lineTo(size, size - borderRadius);
  ctx.arcTo(size, size, size - borderRadius, size, borderRadius);
  ctx.lineTo(borderRadius, size);
  ctx.arcTo(0, size, 0, size - borderRadius, borderRadius);
  ctx.lineTo(0, borderRadius);
  ctx.arcTo(0, 0, borderRadius, 0, borderRadius);
  ctx.closePath();

  ctx.clip();
  ctx.drawImage(image, sx, sy, minDimension, minDimension, 0, 0, size, size);

  return canvas;
}


function handleImageDrop(event) {
  event.preventDefault();

  const file = event.dataTransfer.files[0];
  if (!file || !file.type.startsWith("image/")) return;

  const reader = new FileReader();
  reader.onload = async (event) => {
    const image = await loadImage(event.target.result);
    currentImage = image;
    updatePreview();
  };
  reader.readAsDataURL(file);
}

function updatePreview() {
  const size = parseInt(sizeSlider.value);
  const roundness = parseFloat(roundnessSlider.value);
  const xCenter = parseInt(xCenterSlider.value);
  const yCenter = parseInt(yCenterSlider.value);
  const zoom = parseInt(zoomSlider.value);

  xCenterValue.textContent = xCenter;
  yCenterValue.textContent = yCenter;
  zoomValue.textContent = zoom;
  preview.width = preview.height = size;
  sizeValue.textContent = size;
  roundnessValue.textContent = roundness.toFixed(1);
  if (currentImage) {
    const croppedCanvas = circleCropImage(currentImage, size, roundness, xCenter, yCenter, zoom);
    ctx.drawImage(croppedCanvas, 0, 0);
  }
}

sizeSlider.addEventListener("input", updatePreview);
roundnessSlider.addEventListener("input", updatePreview);
xCenterSlider.addEventListener("input", updatePreview);
yCenterSlider.addEventListener("input", updatePreview);
zoomSlider.addEventListener("input", updatePreview);

function downloadImage(format) {
  const link = document.createElement("a");
  link.href = preview.toDataURL(`image/${format}`);
  link.download = `cropped-image.${format}`;
  link.click();
}

downloadPngButton.addEventListener("click", () => downloadImage("png"));

dropArea.addEventListener("dragover", (event) => event.preventDefault());
dropArea.addEventListener("drop", handleImageDrop);