
var cores = navigator.hardwareConcurrency/2;

function mandelbrot_worker(canvas, iterations, power, a, b, c)
{
  let top = 2
  let bottom = -2
  let left = -2
  let right = 2

  const width = canvas.width;
  const height = cores * Math.floor(canvas.height/cores); // shhhhhh no rounding problems
  const incrementPerPixelW = (right-left)/width;
  const incrementPerPixelH = (top-bottom)/height;
  
  const span = (top - bottom)/cores
  const arraySize = width*Math.floor(4*height/cores)
  const workers = []

  for (let i = 0; i < cores; i++)
  {
    bottom = top-span;

    let workerNumber = i;
    let worker = new Worker('worker.js');
    worker.postMessage({
      type: 'mandelbrot',
      arraySize,
      top,
      bottom,
      left,
      right,
      incrementPerPixelW,
      incrementPerPixelH,
      iterations,
      power,
      a,
      b,
      c
    });

    const workerHeight = height/cores
    worker.onmessage = function(msg)
    {
      const ctx = canvas.getContext('2d');
      const img = ctx.createImageData(canvas.width, workerHeight);
      for (let i = 0; i < msg.data.length; i++)
      {
        img.data[i] = msg.data[i]
      }
      ctx.putImageData(img, 0, workerNumber*workerHeight);
      worker.terminate();
    }

    top -= span;
  }  
}


function mandelbrot_local(canvas, iterations, power, a, b, c)
{

  let top = 2
  let bottom = -2
  let left = -2
  let right = 2

  // determine width/height, as well as what the step along the number line each pixel represents
  const width = canvas.width;
  const height = canvas.height;
  const incrementPerPixelW = (right-left)/width;
  const incrementPerPixelH = (top-bottom)/height;

  // get image to modify
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(canvas.width, canvas.height);
  let imgLocation = 0;
  for (let h = top; h > bottom; h -= incrementPerPixelH)
  {
    for (let w = left; w < right; w += incrementPerPixelW)
    {
      imgLocation++;
      const startPoint = [w,h];
      let currentPoint = [w,h];

      let neededIter = NaN;
      // currently image is all black or white for in/out respectively
      for (let iter = 0; iter < iterations; iter++)
      {
        // the full mandelbrot equations
        let firstTerm = multComplex(a, powComplex(currentPoint, power));
        let secondTerm = multComplex(b, startPoint);
        currentPoint = addComplex(addComplex(firstTerm, secondTerm), c);
        
        // if point is outside a certain bound, it's not in the set
        if (Math.abs(currentPoint[0]) > 2 || Math.abs(currentPoint[1]) > 2)
        {
          neededIter = iter;
          break;

        }
      }

      if (Number.isNaN(neededIter))
      {
        img.data[imgLocation*4]   = 0;
        img.data[imgLocation*4+1] = 0;
        img.data[imgLocation*4+2] = 0;
        img.data[imgLocation*4+3] = 255;
      }
      else
      {
        let hue = (neededIter**0.5)/(iterations**0.5);
        let color = HSVtoRGB(hue, 1, 1);
        img.data[imgLocation*4]   = color[0];
        img.data[imgLocation*4+1] = color[1];
        img.data[imgLocation*4+2] = color[2];
        img.data[imgLocation*4+3] = 255;
      }
      
    }
  }

  ctx.putImageData(img, 0, 0);
}
