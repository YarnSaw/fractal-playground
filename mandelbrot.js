
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
  // determine width/height, as well as what the step along the number line each pixel represents
  const width = canvas.width;
  const height = canvas.height;
  const incrementPerPixelW = (right-left)/width;
  const incrementPerPixelH = (top-bottom)/height;

  // get image to modify
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(canvas.width, canvas.height);
  for (let h = 0; h < height; h += 1)
  {
    for (let w = 0; w < width; w += 1)
    {
      const x = incrementPerPixelW*w + left
      const y = incrementPerPixelH*h - top
      const startPoint = [x,y];
      let currentPoint = [x,y];

      let neededIter = NaN;
      // currently image is all black or white for in/out respectively
      for (let iter = 0; iter < iterations; iter++)
      {
        // the full mandelbrot equations
        let firstTerm = multComplex(a, powComplex(currentPoint, power));
        let secondTerm = multComplex(b, startPoint);
        currentPoint = addComplex(addComplex(firstTerm, secondTerm), c);
        
        // if point is outside a certain bound, it's not in the set
        if (currentPoint[0]**2 + currentPoint[1]**2 > 9)
        {
          neededIter = iter;
          break;
        }
      }

      if (Number.isNaN(neededIter))
      {
        img.data[(h*width + w) * 4]   = 0;
        img.data[(h*width + w) *4+1] = 0;
        img.data[(h*width + w) *4+2] = 0;
        img.data[(h*width + w) *4+3] = 255;
      }
      else
      {
        let hue = (neededIter**0.5)/(iterations**0.5);
        let color = HSVtoRGB(hue, 1, 1);
        img.data[(h*width + w) *4]   = color[0];
        img.data[(h*width + w) *4+1] = color[1];
        img.data[(h*width + w) *4+2] = color[2];
        img.data[(h*width + w) *4+3] = 255;
      }
      
    }
  }

  ctx.putImageData(img, 0, 0);
}
