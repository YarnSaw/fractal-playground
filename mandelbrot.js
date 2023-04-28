
var cores = navigator.hardwareConcurrency/2;

function mandelbrot_worker(canvas, iterations, power, a, b, c, left, right, bottom, top)
{
  const width = canvas.width;
  const height = canvas.height;

  const perWorkerHeight = Math.floor(height/cores);
  const perWorkerImaginarySegment = (top - bottom)/cores;

  for (let i = 0; i < cores; i++)
  {
    let workerBottom = top-perWorkerImaginarySegment;

    // If we can't perfectly split our image by our core count, add the extra couple rows to the last segment
    if ((i == cores - 1) && height % cores) 
      workerBottom = bottom;

    let workerNumber = i;
    let worker = new Worker('worker.js');
    worker.postMessage({
      type: 'mandelbrot',
      top,
      bottom: workerBottom,
      left,
      right,
      width,
      height: (i == cores - 1) ? perWorkerHeight + height % cores : perWorkerHeight,
      iterations,
      power,
      a,
      b,
      c
    });

    const workerHeight = perWorkerHeight;
    worker.onmessage = function(msg)
    {
      const ctx = canvas.getContext('2d');

      const img = ctx.createImageData(canvas.width, (i == cores - 1) ? perWorkerHeight + height % cores : perWorkerHeight);
      for (let i = 0; i < msg.data.length; i++)
      {
        img.data[i] = msg.data[i]
      }
      ctx.putImageData(img, 0, workerNumber*workerHeight);
      worker.terminate();
    }

    top -= perWorkerImaginarySegment;
  }  
}


function mandelbrot_local(canvas, iterations, power, a, b, c, left, right, bottom, top)
{
  const result = mandelbrot({
      top,
      bottom,
      left,
      right,
      width: canvas.width,
      height: canvas.height,
      iterations,
      power,
      a,
      b,
      c
    }
  )

  const ctx = canvas.getContext('2d');
  const img = new ImageData(result, canvas.width, canvas.height);
  ctx.putImageData(img, 0, 0);
}
