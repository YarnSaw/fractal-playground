
var cores = navigator.hardwareConcurrency/2;

/**
 * Complex addition. Really simple
 */
function addComplex(a,b)
{
  return [a[0] + b[0], a[1] + b[1]];
}

/**
 * Complex multiplication. Use FOIL on terms (a+bi) and (c+di). Combining the real vs imaginary gets the complex number
 */
function multComplex(a,b)
{
  return [a[0]*b[0] - a[1]*b[1], a[0]*b[1] + a[1]*b[0]];
}

/**
 * Power of complex numbers. If the number is a natural number, we can use our own implementation, which is relatively fast
 * If the number is not that, then use a math module that is slower but knows how to handle those
 */
function powComplex(number, power)
{
  if (!Number.isInteger(power) || power < 0)
  {
    number = math.complex(number[0], number[1]);
    let res = math.pow(number, power);
    return [res.re, res.im];
  }
  // recursively handle natural number powers
  else if (power == 2)
    return multComplex(number, number);
  else
    return multComplex(number, powComplex(number, power-1));
}

/*
Function from https://stackoverflow.com/a/17243070
*/
function HSVtoRGB(h, s, v) {
  var r, g, b, i, f, p, q, t;
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
      case 0: r = v, g = t, b = p; break;
      case 1: r = q, g = v, b = p; break;
      case 2: r = p, g = v, b = t; break;
      case 3: r = p, g = q, b = v; break;
      case 4: r = t, g = p, b = v; break;
      case 5: r = v, g = p, b = q; break;
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function mandelbrot(canvas, iterations, power, a, b, c)
{
  let top = 1
  let bottom = -1
  let left = -2
  let right = 1

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

function buddhabrot(canvas, iterations, power, a, b, c) 
{
  const width = canvas.width;
  const height = canvas.height;
  const incrementPerPixelW = 4/width;
  const incrementPerPixelH = 4/height;

  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(canvas.width, canvas.height);

  let visits = new Array(width*height).fill(0)
  let trials = 1000000;

  for (let i = 0; i < trials; i++)
  {
      let x1 = Math.random() * 4 -2
      let y1 = Math.random() * 4 -2
      
      const startPoint = [x1,y1]
      let currentPoint = [x1,y1]
      let tmpPoints = [[...startPoint]]
      let toInfinity = false;

      for (let iter = 0; iter < iterations; iter++)
      {
        let firstTerm = multComplex(a, powComplex(currentPoint, power));
        let secondTerm = multComplex(b, startPoint);
        currentPoint = addComplex(addComplex(firstTerm, secondTerm), c);

        if (Math.abs(currentPoint[0]) > 2 || Math.abs(currentPoint[1]) > 2)
        {
          toInfinity = true;
          break;
        }
        else
        {
          tmpPoints.push([...currentPoint]);
        }
      }
      if (toInfinity)
      {
        for (let point of tmpPoints)
        {
          if (point[0] >= 2 || point[0] <= -2 || point[1] <= -2 || point[1] >= 2)
            continue
          let xcoord = Math.round((point[0]+2) * width/4);
          let ycoord = Math.round((point[1]+2) * width/4);
          if (xcoord < 0 || ycoord < 0 || xcoord + ycoord*width >= visits.length)
            continue
          visits[xcoord + ycoord*width]++;
        }
      }
    }

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

function main()
{
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  // mandelbrot(canvas, 100, 2, [1,0], [1,0], [0,0])
  // buddhabrot(canvas, 100, 2, [1,0], [1,0], [0,0]);
}

function handleSubmit(e) {
  e.preventDefault();
  const canvas = document.getElementById('canvas');
  const fractalPattern = e.target.options[e.target.options.selectedIndex].value;
  const power = parseFloat(e.target.power.value);
  const a = parseFloat(e.target.a.value);
  const b = parseFloat(e.target.b.value);
  const c = parseFloat(e.target.c.value);
  console.log(power);
  console.log(a);
  console.log(b);
  console.log(c);

  switch (fractalPattern) {
    case "Mandelbrot":
      mandelbrot(canvas, 100, power, [a, 0], [b, 0], [c, 0]);
      break;
    case "Buddhabrot":
      buddhabrot(canvas, 100, power, [a, 0], [b, 0], [c, 0]);
      break;
  }
}

const form = document.getElementById("generation-form");
form.addEventListener("submit", handleSubmit);

window.onload = main;