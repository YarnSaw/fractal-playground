
var cores = navigator.hardwareConcurrency/2;

function mandelbrot(canvas, iterations, power, a, b, c, xMin, xMax, yMin, yMax)
{
  // Uhhh chrome use to suck but doesn't really anymore. So don't really need local but keeping cus cus
  // if (navigator.userAgent.includes('Chrome') || true)
    // mandelbrot_local(canvas, iterations, power, a, b, c, xMin, xMax, yMin, yMax)
  // else
    mandelbrot_worker(canvas, iterations, power, a, b, c, xMin, xMax, yMin, yMax)
}

function buddhabrot(canvas, iterations, power, a, b, c, xMin, xMax, yMin, yMax, color) 
{
  // Uhhh chrome use to suck but doesn't really anymore. So don't really need local but keeping cus cus
  // if (navigator.userAgent.includes('Chrome'))
  //   buddhabrot_local(canvas, iterations, power, a, b, c, xMin, xMax, yMin, yMax, color)
  // else
    buddhabrot_worker(canvas, iterations, power, a, b, c, xMin, xMax, yMin, yMax, color)
}

function newton(canvas, iterations, a, b, c, d, e, left, right, bottom, top)
{
  // newton_local(canvas, iterations, a, b, c, d, e, left, right, bottom, top)
  newton_worker(canvas, iterations, a, b, c, d, e, left, right, bottom, top)
}

function main()
{

  const form = document.getElementById("generation-form");
  form.addEventListener("submit", handleSubmit);

  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  // mandelbrot(canvas, 500, 2, [1,0], [1,0], [0,0], -2, 2, -2, 2)
  // buddhabrot(canvas, 100, 2, [1,0], [1,0], [0,0], -2, 2, -2, 2, "Red");
  // newton(canvas, 50, [1,0], [1,0], [1,0], [1,0], [1,0], -2, 2, -2, 2)
}

function handleSubmit(event) {
  event.preventDefault();
  const canvas = document.getElementById('canvas');
  const fractalPattern = event.target.options.value;
  const color = event.target.colors.value;
  const iterations = event.target.iterations.value === "" ? 100 : parseFloat(event.target.iterations.value);
  const power = event.target.power.value === "" ? 2 : parseFloat(event.target.power.value);
  const a = event.target.a.value === "" ? 1 : parseFloat(event.target.a.value);
  const b = event.target.b.value === "" ? 1 : parseFloat(event.target.b.value);
  const c = event.target.c.value === "" ? 0 : parseFloat(event.target.c.value);
  const d = event.target.d.value === "" ? 0 : parseFloat(event.target.d.value);
  const e = event.target.e.value === "" ? 0 : parseFloat(event.target.e.value);
  const ai = event.target.ai.value === "" ? 0 : parseFloat(event.target.ai.value);
  const bi = event.target.bi.value === "" ? 0 : parseFloat(event.target.bi.value);
  const ci = event.target.ci.value === "" ? 0 : parseFloat(event.target.ci.value);
  const di = event.target.di.value === "" ? 0 : parseFloat(event.target.di.value);
  const ei = event.target.ei.value === "" ? 0 : parseFloat(event.target.ei.value);
  const xMin = event.target.xMin.value === "" ? -2 : parseFloat(event.target.xMin.value);
  const xMax = event.target.xMax.value === "" ? 2 : parseFloat(event.target.xMax.value);
  const yMin = event.target.yMin.value === "" ? -2 : parseFloat(event.target.yMin.value);
  const yMax = event.target.yMax.value === "" ? 2 : parseFloat(event.target.yMax.value);

  const aspectRatio = event.target['aspect-ratio'].value;
  if (aspectRatio == "Square")
  {
    canvas.width = 500;
    canvas.height = 500;
  }
  if (aspectRatio == '16:9')
  {
    canvas.width = 640
    canvas.height = 360
  }
  if (aspectRatio == '4:3')
  {
    canvas.width = 500
    canvas.height = 375
  }
  // debugger;

  // clear the canvas before generating a new image
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);

  switch (fractalPattern) {
    case "Mandelbrot":
      mandelbrot(canvas, iterations, power, [a, ai], [b, bi], [c, ci], xMin, xMax, yMin, yMax);
      break;
    case "Buddhabrot":
      buddhabrot(canvas, iterations, power, [a, ai], [b, bi], [c, ci], xMin, xMax, yMin, yMax, color);
      break;
    case "Newton":
      newton(canvas, iterations, [a, ai], [b, bi], [c, ci], [d, di], [e, ei], xMin, xMax, yMin, yMax);
      break;
  }
}

function handleSelectionChange() {
  const option = document.getElementById("options").value;
  switch (option) {
    case "Mandelbrot":
      document.getElementsByClassName("power")[0].hidden = false;
      document.getElementsByClassName("D")[0].hidden = true;
      document.getElementsByClassName("E")[0].hidden = true;
      break;
    case "Buddhabrot":
      document.getElementsByClassName("power")[0].hidden = false;
      document.getElementsByClassName("D")[0].hidden = true;
      document.getElementsByClassName("E")[0].hidden = true;
      break;
    case "Newton":
      document.getElementsByClassName("power")[0].hidden = true;
      document.getElementsByClassName("D")[0].hidden = false;
      document.getElementsByClassName("E")[0].hidden = false;
      break;
  }
}

function downloadImage() {
  console.log("download")
  const imageType = document.getElementsByName("file-format")[0].value.toLowerCase();
  const canvas = document.getElementById("canvas");
  const URL = canvas.toDataURL(`image/${imageType}`)
  let a = document.createElement("a");
  a.href = URL
  a.download = `fractal.${imageType}`;
  a.click();
}

window.onload = main;