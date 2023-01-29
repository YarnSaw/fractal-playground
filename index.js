
var cores = navigator.hardwareConcurrency/2;

function mandelbrot(canvas, iterations, power, a, b, c)
{
  if (navigator.userAgent.includes('Chrome'))
    mandelbrot_local(canvas, iterations, power, a, b, c)
  else
    mandelbrot_worker(canvas, iterations, power, a, b, c)
}

function buddhabrot(canvas, iterations, power, a, b, c) 
{
  if (navigator.userAgent.includes('Chrome'))
    buddhabrot_local(canvas, iterations, power, a, b, c)
  else
    buddhabrot_worker(canvas, iterations, power, a, b, c)
}

function main()
{

  const form = document.getElementById("generation-form");
  form.addEventListener("submit", handleSubmit);

  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  // mandelbrot(canvas, 500, 2, [1,0], [1,0], [0,0])
  buddhabrot(canvas, 100, 2, [1,0], [1,0], [0,0]);
}

function handleSubmit(e) {
  e.preventDefault();
  const canvas = document.getElementById('canvas');
  const fractalPattern = e.target.options[e.target.options.selectedIndex].value;
  const power = parseFloat(e.target.power.value);
  const a = parseFloat(e.target.a.value);
  const b = parseFloat(e.target.b.value);
  const c = parseFloat(e.target.c.value);
  const xMin = e.target.xMin.value;
  const xMax = e.target.xMax.value;
  const yMin = e.target.yMin.value;
  const yMax = e.target.yMax.value;
  
  console.log(power);
  console.log(a);
  console.log(b);
  console.log(c);

  switch (fractalPattern) {
    case "Mandelbrot":
      mandelbrot(canvas, 100, power, [a, 0], [b, 0], [c, 0], xMin, xMax, yMin, yMax);
      break;
    case "Buddhabrot":
      buddhabrot(canvas, 100, power, [a, 0], [b, 0], [c, 0], xMin, xMax, yMin, yMax);
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