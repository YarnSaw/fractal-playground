
var cores = navigator.hardwareConcurrency/2;
var yMin, yMax, xMin, xMax;
yMin = xMin = -1.5;
yMax = xMax =  1.5;

var generating = false;

function main()
{

  const form = document.getElementById("generation-form");
  form.addEventListener("submit", handleSubmit);

  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  handleSelectionChange();
}

function handleSubmit(event) {
  event.preventDefault();

  if (generating)
    return;
  generating = true;
  document.getElementById('generate').disabled = true;

  const canvas = document.getElementById('canvas');
  const fractalPattern = event.target.options.value;
  const color = event.target.colors.value;

  for (let ev of event.target)
  {
    if (ev.type == "number" && Number.isNaN(parseFloat(ev.value)))
    {
      alert("Unable to generate image with non-float value set");
      return;
    }
  }

  const iterations = parseFloat(event.target.iterations.value);
  const scaling = parseFloat(event.target.scaling.value);

  var a,ai,b,bi,c,ci,d,di,e,ei, power, scale, trials, slices;

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
    xMin = parseFloat(event.target.xMin.value);
    xMax = parseFloat(event.target.xMax.value);
    yMin = parseFloat(event.target.yMin.value);
    yMax = parseFloat(event.target.yMax.value);
    scale = parseFloat(event.target.scale.value);
    canvas.width = scale * (xMax + -xMin);
    canvas.height = scale * (yMax + -yMin);
    canvas.style.width = `${canvas.width}px`;
    canvas.style.height = `${canvas.height}px`;
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
    if (fractalPattern === 'Buddhabrot')
    {
      trials = parseFloat(event.target.trials.value);
      slices = parseFloat(event.target.slices.value);
    }
    newAspectRatio(scaling); // Make sure aspect ratio is correct according to what was selected.
  }
  const method = event.target['generation-type'].value;

  // clear the canvas before generating a new image
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);

  let finishedPromise;
  switch (fractalPattern) {
    case "Mandelbrot":
      if (method == "single")
        finishedPromise = mandelbrot_local(canvas, iterations, power, [a, ai], [b, bi], [c, ci], xMin, xMax, yMin, yMax);
      else if (method == "thread")
        finishedPromise = mandelbrot_worker(canvas, iterations, power, [a, ai], [b, bi], [c, ci], xMin, xMax, yMin, yMax);
      else if (method === 'dcp')
        finishedPromise = mandelbrot_dcp(canvas, iterations, power, [a, ai], [b, bi], [c, ci], xMin, xMax, yMin, yMax);
      else
        console.log("Not done yet");
      break;
    case "Buddhabrot":
      if (method == "single")
      finishedPromise = buddhabrot_local(canvas, iterations, power, [a, ai], [b, bi], [c, ci], xMin, xMax, yMin, yMax, color, trials);
      else if (method == "thread")
      finishedPromise = buddhabrot_worker(canvas, iterations, power, [a, ai], [b, bi], [c, ci], xMin, xMax, yMin, yMax, color, trials);
      else
        console.log("Not done yet");
      break;
    case "Newton":
      if (method == "single")
      finishedPromise = newton_local(canvas, iterations, [a, ai], [b, bi], [c, ci], [d, di], [e, ei], xMin, xMax, yMin, yMax);
      else if (method == "thread")
      finishedPromise = newton_worker(canvas, iterations, [a, ai], [b, bi], [c, ci], [d, di], [e, ei], xMin, xMax, yMin, yMax);
      else
        console.log("Not done yet");
      break;
  }
  if (finishedPromise)
    finishedPromise.then(() => {
      generating = false;
      document.getElementById('generate').disabled = false;
    });
}

function handleSelectionChange() {
  const option = document.getElementById("options").value;
  switch (option) {
    case "Mandelbrot":
      newAspectRatio(1);
      Array.from(document.getElementsByClassName("buddhabrot")).forEach(elem => elem.setAttribute("hidden", ""));
      Array.from(document.getElementsByClassName("newton")).forEach(elem => elem.setAttribute("hidden", ""));
      Array.from(document.getElementsByClassName("mandelbrot")).forEach(elem => elem.removeAttribute("hidden"));
      break;
    case "Buddhabrot":
      newAspectRatio(1);
      Array.from(document.getElementsByClassName("mandelbrot")).forEach(elem => elem.setAttribute("hidden", ""));
      Array.from(document.getElementsByClassName("newton")).forEach(elem => elem.setAttribute("hidden", ""));
      Array.from(document.getElementsByClassName("buddhabrot")).forEach(elem => elem.removeAttribute("hidden"));
      break;
    case "Newton":
      Array.from(document.getElementsByClassName("mandelbrot")).forEach(elem => elem.setAttribute("hidden", ""));
      Array.from(document.getElementsByClassName("buddhabrot")).forEach(elem => elem.setAttribute("hidden", ""));
      Array.from(document.getElementsByClassName("newton")).forEach(elem => elem.removeAttribute("hidden"));
      break;
  }
}

function newAspectRatio(scaling) {
  const canvas = document.getElementById('canvas');
  const ratio = document.getElementById("ratio").value;
  // Hard coded values to be used for mandelbrot. This set usually falls within
  // the area around 0,0 even when changed, these reflect that.
  // May want a user override for these later, since some sets may not fit this pattern,
  // but this is good for now.
  switch (ratio)
  {
    case "720x576":
      yMin = -1.5;
      yMax =  1.5;
      xMin =   -2;
      xMax = 1.75;
      canvas.style.width = "720px";
      canvas.style.height = "576px";
      canvas.width = 720 * scaling;
      canvas.height = 576 * scaling;
      break;
    case "1024x768":
      yMin = -1.5;
      yMax =  1.5;
      xMin =   -2;
      xMax =    2;
      canvas.style.width = "1024px";
      canvas.style.height = "768px";
      canvas.width = 1024 * scaling;
      canvas.height = 768 * scaling;
      break;
    case "1000x1000":
      yMin = xMin = -2;
      yMax = xMax =  2;
      canvas.width = canvas.height = 1000 * scaling;
      canvas.style.width = canvas.style.height = "1000px";
      break;
    case "1280x720":
      yMin = -1.6175;
      yMax =  1.6175;
      xMin =   -3.375;
      xMax = 2.375;
      canvas.style.width = "1280px";
      canvas.style.height = "720px";
      canvas.width = 1280 * scaling;
      canvas.height = 720 * scaling;
      break;
    case "1920x1080":
      yMin = -1.6175;
      yMax =  1.6175;
      xMin =  -3.375;
      xMax =   2.375;
      canvas.style.width = "1920px";
      canvas.style.height = "1080px";
      canvas.width = 1920 * scaling;
      canvas.height = 1080 * scaling;
      break
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