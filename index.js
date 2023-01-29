
var cores = navigator.hardwareConcurrency/2;

function mandelbrot(canvas, iterations, power, a, b, c, xMin, xMax, yMin, yMax)
{
  // Uhhh chrome use to suck but doesn't really anymore. So don't really need local but keeping cus cus
  // if (navigator.userAgent.includes('Chrome') || true)
    // mandelbrot_local(canvas, iterations, power, a, b, c, xMin, xMax, yMin, yMax)
  // else
    mandelbrot_worker(canvas, iterations, power, a, b, c, xMin, xMax, yMin, yMax)
}

function buddhabrot(canvas, iterations, power, a, b, c, xMin, xMax, yMin, yMax) 
{
  // Uhhh chrome use to suck but doesn't really anymore. So don't really need local but keeping cus cus
  // if (navigator.userAgent.includes('Chrome'))
  //   buddhabrot_local(canvas, iterations, power, a, b, c, xMin, xMax, yMin, yMax)
  // else
    buddhabrot_worker(canvas, iterations, power, a, b, c, xMin, xMax, yMin, yMax)
}

function newton(canvas, iterations, a, b, c, d, e, left, right, bottom, top)
{
  newton_worker(canvas, iterations, a, b, c, d, e, left, right, bottom, top)
}

function main()
{

  const form = document.getElementById("generation-form");
  form.addEventListener("submit", handleSubmit);

  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  // mandelbrot(canvas, 500, 2, [1,0], [1,0], [0,0], -2, 2, -2, 2)
  // buddhabrot(canvas, 100, 2, [1,0], [1,0], [0,0], -2, 2, -2, 2);
  // newton(canvas, 50, [1,0], [1,0], [1,0], [1,0], [1,0], -2, 2, -2, 2)
}

function handleSubmit(e) {
  e.preventDefault();
  const canvas = document.getElementById('canvas');
  const fractalPattern = e.target.options[e.target.options.selectedIndex].value;
  const iterations = e.target.iterations.value === "" ? 100 : parseFloat(e.target.iterations.value);
  const power = e.target.power.value === "" ? 2 : parseFloat(e.target.power.value);
  const a = e.target.a.value === "" ? 1 : parseFloat(e.target.a.value);
  const b = e.target.b.value === "" ? 1 : parseFloat(e.target.b.value);
  const c = e.target.c.value === "" ? 0 : parseFloat(e.target.c.value);
  const ai = e.target.ai.value === "" ? 0 : parseFloat(e.target.ai.value);
  const bi = e.target.bi.value === "" ? 0 : parseFloat(e.target.bi.value);
  const ci = e.target.ci.value === "" ? 0 : parseFloat(e.target.ci.value);
  const xMin = e.target.xMin.value === "" ? -2 : parseFloat(e.target.xMin.value);
  const xMax = e.target.xMax.value === "" ? 2 : parseFloat(e.target.xMax.value);
  const yMin = e.target.yMin.value === "" ? -2 : parseFloat(e.target.yMin.value);
  const yMax = e.target.yMax.value === "" ? 2 : parseFloat(e.target.yMax.value);

  switch (fractalPattern) {
    case "Mandelbrot":
      mandelbrot(canvas, iterations, power, [a, ai], [b, bi], [c, ci], xMin, xMax, yMin, yMax);
      break;
    case "Buddhabrot":
      buddhabrot(canvas, iterations, power, [a, ai], [b, bi], [c, ci], xMin, xMax, yMin, yMax);
      break;
  }
}

function downloadImage() {
  console.log("download")
  const canvas = document.getElementById("canvas");
  const URL = canvas.toDataURL("image/png")
  let a = document.createElement("a");
  a.href = URL
  a.download = "fractal.png";
  a.click();
}

window.onload = main;