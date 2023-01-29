importScripts('math.js', 'complex.js')

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


function mandelbrot(options)
{
  const a = options.a
  const b = options.b
  const c = options.c
  const power = options.power
  const incrementPerPixelH = options.incrementPerPixelH
  const incrementPerPixelW = options.incrementPerPixelW
  const top = options.top
  const bottom = options.bottom
  const left = options.left
  const right = options.right
  const iterations = options.iterations

  const img = new Uint8Array(options.arraySize)
  const start = Date.now()

  let ind = 0;
  let imgLocation = 0;
  for (let h = top; h > bottom; h -= incrementPerPixelH)
  {
    for (let w = left; w < right; w += incrementPerPixelW)
    {
      const startPoint = [w,h];
      let currentPoint = [w,h];

      let neededIter = NaN;
      // currently image is all black or white for in/out respectively
      for (let iter = 0; iter < iterations; iter++)
      {
        ind++;
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
        img[imgLocation*4]   = 0;
        img[imgLocation*4+1] = 0;
        img[imgLocation*4+2] = 0;
        img[imgLocation*4+3] = 255;
      }
      else
      {
        let hue = (neededIter**0.5)/(iterations**0.5);
        let color = HSVtoRGB(hue, 1, 1);
        img[imgLocation*4]   = color[0];
        img[imgLocation*4+1] = color[1];
        img[imgLocation*4+2] = color[2];
        img[imgLocation*4+3] = 255;
      }
      imgLocation++;
    }
  }

  postMessage(img)
}

function buddhabrot(options)
{
  var visits = new Array(options.width*options.height).fill(0)

  const heightDiff = options.top - options.bottom
  const widthDiff = options.right - options.left

  for (let i = 0; i < options.trials; i++)
  {
    let x1 = Math.random() * (heightDiff) + (options.bottom)
    let y1 = Math.random() * (widthDiff) + (options.left)
    
    const startPoint = [x1,y1]
    let currentPoint = [x1,y1]
    let tmpPoints = [[...startPoint]]
    let toInfinity = false;

    for (let iter = 0; iter < options.iterations; iter++)
    {
      let firstTerm = multComplex(options.a, powComplex(currentPoint, options.power));
      let secondTerm = multComplex(options.b, startPoint);
      currentPoint = addComplex(addComplex(firstTerm, secondTerm), options.c);

      if (Math.abs(currentPoint[0]) > 4 || Math.abs(currentPoint[1]) > 4)
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
        if (point[0] >= options.right || point[0] <= options.left || point[1] <= options.bottom || point[1] >= options.top)
          continue
        let xcoord = Math.round((point[0] - options.left) * options.width/widthDiff);
        let ycoord = Math.round((point[1] - options.bottom) * options.height/heightDiff);
        if (xcoord < 0 || ycoord < 0 || xcoord + ycoord*options.width >= visits.length)
        {
          debugger;
          continue

        }
        visits[xcoord + ycoord*options.width]++;
      }
    }
  }
  postMessage(visits)
}



onmessage = function main(msg) {
  // msg.data is what I care about
  if (msg.data.type === 'mandelbrot')
    mandelbrot(msg.data);
  if (msg.data.type === 'buddhabrot')
    buddhabrot(msg.data)
}