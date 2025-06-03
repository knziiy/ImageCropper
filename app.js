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

function circleCropImage(image, size, roundness, xCenter, yCenter, zoom, outputScale = 1) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const minDimension = Math.min(image.width, image.height) * ((100 - zoom) / 100);

  const sx = (image.width - minDimension) * xCenter / 100;
  const sy = (image.height - minDimension) * yCenter / 100;

  // 出力解像度をoutputScale倍に
  canvas.width = canvas.height = size * outputScale;

  const borderRadius = (size * outputScale / 2) * roundness;
  ctx.beginPath();
  ctx.moveTo(borderRadius, 0);
  ctx.lineTo(canvas.width - borderRadius, 0);
  ctx.arcTo(canvas.width, 0, canvas.width, borderRadius, borderRadius);
  ctx.lineTo(canvas.width, canvas.height - borderRadius);
  ctx.arcTo(canvas.width, canvas.height, canvas.width - borderRadius, canvas.height, borderRadius);
  ctx.lineTo(borderRadius, canvas.height);
  ctx.arcTo(0, canvas.height, 0, canvas.height - borderRadius, borderRadius);
  ctx.lineTo(0, borderRadius);
  ctx.arcTo(0, 0, borderRadius, 0, borderRadius);
  ctx.closePath();

  ctx.clip();
  ctx.drawImage(
    image,
    sx, sy, minDimension, minDimension,
    0, 0, canvas.width, canvas.height
  );

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
    // プレビューは1倍スケール
    const croppedCanvas = circleCropImage(currentImage, size, roundness, xCenter, yCenter, zoom, 1);
    ctx.clearRect(0, 0, preview.width, preview.height);
    ctx.drawImage(croppedCanvas, 0, 0, preview.width, preview.height);
  }
}

function downloadImage(format) {
  const size = parseInt(sizeSlider.value);
  const roundness = parseFloat(roundnessSlider.value);
  const xCenter = parseInt(xCenterSlider.value);
  const yCenter = parseInt(yCenterSlider.value);
  const zoom = parseInt(zoomSlider.value);
  if (!currentImage) return;

  // 元画像の短辺を基準に最大解像度で出力（倍率）
  const maxOutput = Math.min(currentImage.width, currentImage.height);
  const outputScale = Math.max(1, Math.floor(maxOutput / size));
  const exportCanvas = circleCropImage(currentImage, size, roundness, xCenter, yCenter, zoom, outputScale);

  const link = document.createElement("a");
  link.href = exportCanvas.toDataURL(`image/${format}`);
  link.download = `cropped-image.${format}`;
  link.click();
}

sizeSlider.addEventListener("input", updatePreview);
roundnessSlider.addEventListener("input", updatePreview);
xCenterSlider.addEventListener("input", updatePreview);
yCenterSlider.addEventListener("input", updatePreview);
zoomSlider.addEventListener("input", updatePreview);
downloadPngButton.addEventListener("click", () => downloadImage("png"));

dropArea.addEventListener("dragover", (event) => event.preventDefault());
dropArea.addEventListener("drop", handleImageDrop);