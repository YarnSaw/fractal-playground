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
  // determine width/height, as well as what the step along the number line each pixel represents
  const width = canvas.width;
  const height = canvas.height;
  const incrementPerPixelW = 4/width;
  const incrementPerPixelH = 4/height;

  // get image to modify
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(canvas.width, canvas.height);
  let imgLocation = 0;
  for (let h = 2; h > -2; h -= incrementPerPixelH)
  {
    for (let w = -2; w < 2; w += incrementPerPixelW)
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
        let hue = neededIter/iterations;
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

function main()
{
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  mandelbrot(canvas, 80, 2, [0.4,0], [1,0], [0,0])
}




window.onload = main