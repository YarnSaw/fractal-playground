var cores = navigator.hardwareConcurrency/2;

function buddhabrot_worker(canvas, iterations, power, a, b, c, left, right, bottom, top, color) 
{
  const width = canvas.width;
  const height = canvas.height;
  var visits = new Array(width*height).fill(0)

  let trials = 500000;

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
          img.data[i*4] = color == "Red" || color == "Yellow" ? 255*(visits[i]**0.5)/(mostVisited**0.5) : 0;
          img.data[i*4+1] = color == "Green" || color == "Yellow" ? 255*(visits[i]**0.5)/(mostVisited**0.5) : 0;
          img.data[i*4+2] = color == "Blue" ? 255*(visits[i]**0.5)/(mostVisited**0.5) : 0;
          img.data[i*4+3] = 255;
        }
        ctx.putImageData(img, 0, 0);
      }
    }

  }  
}

function buddhabrot_local(canvas, iterations, power, a, b, c, left, right, bottom, top, color) 
{
  const width = canvas.width;
  const height = canvas.height;
  const heightDiff = top - bottom
  const widthDiff = right - left

  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(canvas.width, canvas.height);

  let visits = new Array(width*height).fill(0)
  let trials = 100000;

  for (let i = 0; i < trials; i++)
  {
    let x1 = Math.random() * (heightDiff) + (bottom)
    let y1 = Math.random() * (widthDiff) + (left)
    
    const startPoint = [x1,y1]
    let currentPoint = [x1,y1]
    let tmpPoints = [[...startPoint]]
    let toInfinity = false;

    for (let iter = 0; iter < iterations; iter++)
    {
      let firstTerm = multComplex(a, powComplex(currentPoint, power));
      let secondTerm = multComplex(b, startPoint);
      currentPoint = addComplex(addComplex(firstTerm, secondTerm), c);

      if (currentPoint[0]**2 + currentPoint[1]**2 > 9)
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
        if (point[0] >= right || point[0] <= left || point[1] <= bottom || point[1] >= top)
          continue
        let xcoord = Math.round((point[0] - left) * width/widthDiff);
        let ycoord = Math.round((point[1] - bottom) * width/heightDiff);
        if (xcoord < 0 || ycoord < 0 || xcoord + ycoord*width >= visits.length)
          continue
        visits[xcoord + ycoord*width]++;
      }
    }
  }

  const mostVisited = visits.reduce((a,b) => { return Math.max(a, b)});
  for (let i = 0; i < visits.length; i++)
  {
    img.data[i*4] = color == "Red" || color == "Yellow" ? 255*(visits[i]**0.5)/(mostVisited**0.5) : 0;
    img.data[i*4+1] = color == "Green" || color == "Yellow" ? 255*(visits[i]**0.5)/(mostVisited**0.5) : 0;
    img.data[i*4+2] = color == "Blue" ? 255*(visits[i]**0.5)/(mostVisited**0.5) : 0;
    img.data[i*4+3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}