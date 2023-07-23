'use strict';

var cores = navigator.hardwareConcurrency/2;

function mandelbrot_dcp(canvas, iterations, power, a, b, c, left, right, bottom, top)
{
  const height = canvas.height;
  const width = canvas.width;
  const step = (top - bottom) / height;

  function* input()
  {
    for (let i = 0; i < height; i++)
      yield bottom + (step * i);
  }
  function workFn(input, options)
  {
    progress();
    options.top = input;
    options.bottom = input;
    options.height = 1;
    const { mandelbrot } = require('fractals.js');
    return mandelbrot(options);
  }
  const args = {
    left,
    right,
    width,
    iterations,
    power,
    a,
    b,
    c
  };
  function handleResults(result)
  {
    const { sliceNumber, result: res  } = result;
    const ctx = canvas.getContext('2d');

    const img = ctx.createImageData(canvas.width, 1);
    for (let i = 0; i < res.length; i++)
    {
      img.data[i] = res[i]
    }
    ctx.putImageData(img, 0, sliceNumber-1);
  }

  return deployJob(input(), workFn, [args], handleResults, [{joinKey: 'brotwurst', joinSecret: 'fractal'}]);
}


function mandelbrot_worker(canvas, iterations, power, a, b, c, left, right, bottom, top)
{
  return new Promise((resolve, reject) => {
    const width = canvas.width;
    const height = canvas.height;

    const perWorkerHeight = Math.floor(height/cores);
    const perWorkerImaginarySegment = (top - bottom)/cores;
    var workersComplete = 0;

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

        workersComplete++;
        if (workersComplete == cores)
          resolve();
      }

      top -= perWorkerImaginarySegment;
    }
  });
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
  return Promise.resolve();
}
