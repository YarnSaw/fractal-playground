var cores = navigator.hardwareConcurrency/2;

function buddhabrot_dcp(canvas, iterations, power, a, b, c, left, right, bottom, top, color, trials, slices) 
{
  const width = canvas.width;
  const height = canvas.height;
  var visits = new Array(width*height).fill(0)

  const input = new dcp['range-object'].RangeObject({start: 1, end: slices})

  function workFn(input, options)
  {
    progress();
    const { buddhabrot } = require('fractals.js');
    return buddhabrot(options, true);
  }

  const args = {
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
  };

  var workersComplete = 0;
  function handleResults(result)
  {
    const { result: res } = result
    for (let i = 0; i < res.length; i++)
    {
      visits[i] += res[i]
    }
    workersComplete++
    document.getElementById('slices').innerHTML = `Now completed ${workersComplete} slices of ${slices}`;

    if (workersComplete == slices)
    {
      drawBuddhabrot(canvas, visits, color);
    }
  }

  return deployJob(input, workFn, [args], handleResults, [{joinKey: 'brotwurst', joinSecret: 'fractal'}], 'buddhabrot');
}


function buddhabrot_worker(canvas, iterations, power, a, b, c, left, right, bottom, top, color, trials) 
{
  return new Promise((resolve, reject) => {
    const width = canvas.width;
    const height = canvas.height;
    var visits = new Array(width*height).fill(0)

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
          drawBuddhabrot(canvas, visits, color);
          resolve();
        }
      }
    }
  });
}

function buddhabrot_local(canvas, iterations, power, a, b, c, left, right, bottom, top, color, trials) 
{

  const visits = buddhabrot({
      type: 'buddhabrot',
      trials,
      width: canvas.width,
      height: canvas.height,
      top,
      bottom,
      left,
      right,
      iterations,
      power,
      a,
      b,
      c
    }
  )
  
  drawBuddhabrot(canvas, visits, color);
  return Promise.resolve();
}

function drawBuddhabrot(canvas, visits, color)
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