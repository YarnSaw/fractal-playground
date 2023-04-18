
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

  for (let ev of event.target)
  {
    if (ev.type == "number" && Number.isNaN(parseFloat(ev.value)))
    {
      debugger
      alert("Unable to generate image with non-float value set");
      return;
    }
  }

  const iterations = parseFloat(event.target.iterations.value);

  var a,ai,b,bi,c,ci,d,di,e,ei, power, xMin, xMax, yMin, yMax;

  if (fractalPattern == "Newton")
  {
    power = parseFloat(event.target.power.value);
    a = parseFloat(event.target.N_a.value);
    b = parseFloat(event.target.N_b.value);
    c = parseFloat(event.target.N_c.value);
    d = parseFloat(event.target.N_d.value);
    e = parseFloat(event.target.N_e.value);
    ai = parseFloat(event.target.N_ai.value);
    bi = parseFloat(event.target.N_bi.value);
    ci = parseFloat(event.target.N_ci.value);
    di = parseFloat(event.target.N_di.value);
    ei = parseFloat(event.target.N_ei.value);
  }
  else
  {
    power = parseFloat(event.target.power.value);
    a = parseFloat(event.target.a.value);
    b = parseFloat(event.target.b.value);
    c = parseFloat(event.target.c.value);
    ai = parseFloat(event.target.ai.value);
    bi = parseFloat(event.target.bi.value);
    ci = parseFloat(event.target.ci.value);
  }
  
  xMin = parseFloat(event.target.xMin.value);
  xMax = parseFloat(event.target.xMax.value);
  yMin = parseFloat(event.target.yMin.value);
  yMax = parseFloat(event.target.yMax.value);

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
      document.getElementsByClassName("color-select")[0].hidden = true;
      document.getElementsByClassName("color-select")[1].hidden = true;
      document.getElementById("brot").style.display = "inherit";
      document.getElementById("newton").style.display = "none";
      break;
    case "Buddhabrot":
      document.getElementsByClassName("color-select")[0].hidden = false;
      document.getElementsByClassName("color-select")[1].hidden = false;
      document.getElementById("brot").style.display = "inherit";
      document.getElementById("newton").style.display = "none";
      break;
    case "Newton":
      document.getElementsByClassName("color-select")[0].hidden = true;
      document.getElementsByClassName("color-select")[1].hidden = true;
      document.getElementById("brot").style.display = "none";
      document.getElementById("newton").style.display = "inherit";
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