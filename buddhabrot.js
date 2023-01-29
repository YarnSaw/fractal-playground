var cores = navigator.hardwareConcurrency/2;


function buddhabrot_worker(canvas, iterations, power, a, b, c) 
{
  let top = 2
  let bottom = -2
  let left = -2
  let right = 2

  const width = canvas.width;
  const height = canvas.height;
  var visits = new Array(width*height).fill(0)

  let trials = 100000;

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

function buddhabrot_local(canvas, iterations, power, a, b, c) 
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