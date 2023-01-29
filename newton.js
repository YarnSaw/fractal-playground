
var cores = navigator.hardwareConcurrency/2;

function derivative(a,b,c,d,e)
{
  return [[4*a[0], 4*a[1]], [3*b[0], 3*b[1]], [2*c[0], 2*c[1]], [d[0], d[1]]] // fuck off e
}

function newton_worker(canvas, iterations, a, b, c, d, e, left, right, bottom, top)
{
  console.log("sup")
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
    console.log(top, bottom)
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

    var index = i
    var workerHeight = height/cores

    worker.onmessage = function(msg)
    {
      console.log("yo")
      allEnds[index] = msg.data;
      
      worker.terminate();
      workersComplete++
      
      if (workersComplete == cores)
      {
        debugger;
        console.log(index)
        const endpoints = allEnds.flat();

        const ctx = canvas.getContext('2d');
        const img = ctx.createImageData(canvas.width, workerHeight);

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

        let index = 0
        for (let ep of endpoints)
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

        ctx.putImageData(img, 0, 0);
      }
    }
   
    top -= span;
  }  
}





function newton_local(canvas, iterations, a, b, c, d, e, left, right, bottom, top)
{
  // determine width/height, as well as what the step along the number line each pixel represents
  const width = canvas.width;
  const height = canvas.height;
  const incrementPerPixelW = (right-left)/width;
  const incrementPerPixelH = (top-bottom)/height;

  const derivation = derivative(a,b,c,d,e)

  // get image to modify
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(canvas.width, canvas.height);
  let imgLocation = 0;
  const endpoints = [];
  for (let h = top; h > bottom; h -= incrementPerPixelH)
  {
    for (let w = left; w < right; w += incrementPerPixelW)
    {
      imgLocation++;

      let startPoint = [w, h]
      let point = [w, h]

      for (let iter = 0; iter < iterations; iter++)
      {
        let aTerm = multComplex(a, powComplex(point, 4));
        let bTerm = multComplex(b, powComplex(point, 3));
        let cTerm = multComplex(c, powComplex(point, 2));
        let dTerm = multComplex(d, point); // linear
        let eTerm = e // constant

        let fx = addComplex(aTerm, addComplex(bTerm, addComplex(cTerm, addComplex(dTerm, eTerm))))

        let apTerm = multComplex(derivation[0], powComplex(point, 3));
        let bpTerm = multComplex(derivation[1], powComplex(point, 2));
        let cpTerm = multComplex(derivation[2], point);
        let dpTerm = derivation[3]; // linear
        let fPrimex = addComplex(apTerm, addComplex(bpTerm, addComplex(cpTerm, dpTerm)))

        let denominator = multComplex(fPrimex, [fPrimex[0], -fPrimex[1]])
        let numerator = multComplex(fx, [fPrimex[0], -fPrimex[1]])

        let factor = [numerator[0]/denominator[0], numerator[1]/denominator[0]]

        point = [point[0] - factor[0], point[1] - factor[1]]
      }

      endpoints.push([startPoint, point, imgLocation]);
    }
  }

  const end = Date.now()


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
}
