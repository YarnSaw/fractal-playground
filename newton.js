
var cores = navigator.hardwareConcurrency/2;

function derivative(a,b,c,d,e)
{
  return [[4*a[0], 4*a[1]], [3*b[0], 3*b[1]], [2*c[0], 2*c[1]], [d[0], d[1]]] // fuck off e
}

function newton_worker(canvas, iterations, a, b, c, d, e, left, right, bottom, top)
{
  return new Promise((resolve, reject) => {
    const width = canvas.width;
    const height = cores * Math.floor(canvas.height/cores); // shhhhhh no rounding problems
    const incrementPerPixelW = (right-left)/width;
    const incrementPerPixelH = (top-bottom)/height;
    const derivation = derivative(a,b,c,d,e)

    const span = (top - bottom)/cores

    var allEnds = new Array(cores)
    var workersComplete = 0;

    for (let i = 0; i < cores; i++)
    {
      bottom = top-span;

      let worker = new Worker('worker.js');
      worker.postMessage({
        type: 'newton',
        top,
        bottom,
        left,
        right,
        incrementPerPixelW,
        incrementPerPixelH,
        iterations,
        derivation,
        a,
        b,
        c,
        d,
        e,
      });

      let workerNumber = i
      let workerHeight = height/cores

      worker.onmessage = function(msg)
      {
        allEnds[workerNumber] = msg.data;
        
        worker.terminate();
        workersComplete++
        
        if (workersComplete == cores)
        {
          const ctx = canvas.getContext('2d');
          const img = ctx.createImageData(canvas.width, canvas.height);

          const epsilon = 0.05
          const potentialClusters = []
          for (let endPoints of allEnds)
          {
            for (let ep of endPoints)
            {
              let inCluster = false;
              for (let i = 0; i < potentialClusters.length; i++)
              {
                if (ep[1][0] > potentialClusters[i][0][0]-epsilon && ep[1][0] < potentialClusters[i][0][0]+epsilon
                && ep[1][1] > potentialClusters[i][0][1]-epsilon && ep[1][1] < potentialClusters[i][0][1]+epsilon)
                {
                  potentialClusters[i][1]++;
                  inCluster = true
                }
              }
              if (!inCluster)
                potentialClusters.push([ep[1], 1])
            }
          }

          const clusters = potentialClusters.filter((element) => element[1] > 100)

          let index = 0
          for (let endPoints of allEnds)
          {
            for (let ep of endPoints)
            {
              let inCluster = false;
              for (let i = 0; i < clusters.length; i++)
              {
                if (ep[1][0] > clusters[i][0][0]-epsilon && ep[1][0] < clusters[i][0][0]+epsilon
                && ep[1][1] > clusters[i][0][1]-epsilon && ep[1][1] < clusters[i][0][1]+epsilon)
                {
                  img.data[index*4]   = i == 0 || i == 3 ? 255 :0;
                  img.data[index*4+1] = i == 1 || i == 3 ? 255 :0;
                  img.data[index*4+2] = i == 2? 255 :0;
                  img.data[index*4+3] = 255;
                  inCluster = true;
                }
              }
              if (!inCluster)
              {
                img.data[index*4]   = 0;
                img.data[index*4+1] = 0;
                img.data[index*4+2] = 0;
                img.data[index*4+3] = 255;
              }
              index++
            }
          }
          ctx.putImageData(img, 0, 0);
          resolve();
        }
      }

      top -= span;
    }
  });
}

function newton_local(canvas, iterations, a, b, c, d, e, left, right, bottom, top)
{

  const endpoints = newton({
    type: 'newton',
    top,
    bottom,
    left,
    right,
    incrementPerPixelW: (right-left)/canvas.width,
    incrementPerPixelH: (top-bottom)/canvas.height,
    iterations,
    derivation: derivative(a,b,c,d,e),
    a,
    b,
    c,
    d,
    e,
  })

  // get image to modify
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(canvas.width, canvas.height);

  const epsilon = 0.05
  const potentialClusters = []
  for (let ep of endpoints)
  {
    let inCluster = false;
    for (let i = 0; i < potentialClusters.length; i++)
    {
      if (ep[1][0] > potentialClusters[i][0][0]-epsilon && ep[1][0] < potentialClusters[i][0][0]+epsilon
      && ep[1][1] > potentialClusters[i][0][1]-epsilon && ep[1][1] < potentialClusters[i][0][1]+epsilon)
      {
        potentialClusters[i][1]++;
        inCluster = true
      }
    }
    if (!inCluster)
      potentialClusters.push([ep[1], 1])
  }

  const clusters = potentialClusters.filter((element) => element[1] > 100)

  for (let ep of endpoints)
  {
    let inCluster = false;
    for (let i = 0; i < clusters.length; i++)
    {
      if (ep[1][0] > clusters[i][0][0]-epsilon && ep[1][0] < clusters[i][0][0]+epsilon
      && ep[1][1] > clusters[i][0][1]-epsilon && ep[1][1] < clusters[i][0][1]+epsilon)
      {
        img.data[ep[2]*4]   = i == 0 || i == 3 ? 255 :0;
        img.data[ep[2]*4+1] = i == 1 || i == 3 ? 255 :0;
        img.data[ep[2]*4+2] = i == 2? 255 :0;
        img.data[ep[2]*4+3] = 255;
        inCluster = true;
      }
    }
    if (!inCluster)
    {
      img.data[ep[2]*4]   = 0;
      img.data[ep[2]*4+1] = 0;
      img.data[ep[2]*4+2] = 0;
      img.data[ep[2]*4+3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);
  return Promise.resolve();
}
