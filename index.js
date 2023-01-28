
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
  let top = 2
  let bottom = -2
  let left = -2
  let right = 2

  const width = canvas.width;
  const height = canvas.height;
  var visits = new Array(width*height).fill(0)

  let trials = 1000000;

  const workers = []
  var workersComplete = 0;
  for (let i = 0; i < cores; i++)
  {
    let worker = new Worker('worker.js');
    worker.postMessage({
      type: 'buddhabrot',
      trials,
      width,
      height,
      top,
      bottom,
      left,
      right,
      iterations,
      power,
      a,
      b,
      c
    });

    worker.onmessage = function(msg)
    {
      for (let i = 0; i < msg.data.length; i++)
      {
        visits[i] += msg.data[i]
      }
      worker.terminate();
      workersComplete++

      if (workersComplete == cores)
      {
        const ctx = canvas.getContext('2d');
        const img = ctx.createImageData(canvas.width, canvas.height);

        const mostVisited = visits.reduce((a,b) => { return Math.max(a, b)});
        for (let i = 0; i < visits.length; i++)
        {
          img.data[i*4] = 255*visits[i]/mostVisited;
          img.data[i*4+1] = 0;
          img.data[i*4+2] = 0;
          img.data[i*4+3] = 255;
        }
        ctx.putImageData(img, 0, 0);
      }
    }

  }  
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