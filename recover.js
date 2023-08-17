var previousJobs;
var keystore;
var canvas;

async function main()
{

  if (!keystore)
  {
    keystore = await dcp.wallet.get();
    dcp.wallet.addId(keystore)
  }

  const recover = document.getElementById("recovery");
  recover.addEventListener('submit', handleRecover);
  const jobs = document.getElementById('jobs');

  previousJobs = localStorage.getItem('jobs') ? JSON.parse(localStorage.getItem('jobs')) : [];
  for (let previousJob of previousJobs)
  {
    const elem = document.createElement('option');
    elem.value = previousJob.job;
    elem.innerHTML = previousJob.job;
    jobs.appendChild(elem);
  }
  canvas = document.getElementById('canvas');
}

function recoverMandel(result)
{
  mandelbrotResultAndCanvas(result, canvas)
}

function wrapRecoverBuddha(slices)
{  
  const width = canvas.width;
  const height = canvas.height;
  var visits = new Array(width*height).fill(0)
  var workersComplete = 0
  
  function recoverBuddha(result)
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
      drawBuddhabrot(canvas, visits, 'Yellow');
    }
  }

  return recoverBuddha;
}


async function handleRecover(event)
{
  event.preventDefault();
  // clear the canvas before recovering a new image
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);

  const conn = new dcp.protocol.Connection(dcpConfig.scheduler.services.resultSubmitter.location, keystore);
  const selectedJob = previousJobs.filter((job) => job.job == event.target.jobs.value)[0];
  

  const info = await dcp.compute.getJobInfo(selectedJob.job);

  var recoverFn;
  switch (selectedJob.fractal) {
    case 'mandelbrot':
      recoverFn = recoverMandel;
      break;
    case 'buddhabrot':
      recoverFn = wrapRecoverBuddha(info.totalSlices);
      break;
  }

  if (info.status == 'finished')
  {
    // job done, collect all results, display final image
    for (let i = 1; i <= info.totalSlices; i += 50)
    {
      const range = [];
      for (let j = i; j < i+50; j++)
        range.push(j); 

      updateResultStats(conn, selectedJob.job, range, 50, recoverFn, undefined, true)
    }
  }
  else if (info.status == 'estimation' || info.status == 'running')
  {
    // generation isn't done yet, so hook back into listening for it to finish
  }
  else
  {
    alert(`Something wrong with the job, it ended up in ${info.status} state`);
  }
}

function downloadImage() {
  console.log("download")
  const imageType = document.getElementsByName("file-format")[0].value.toLowerCase();
  const canvas = document.getElementById("canvas");
  const URL = canvas.toDataURL(`image/${imageType}`)
  let a = document.createElement("a");
  a.href = URL
  a.download = `fractal.${imageType}`;
  a.click();
}

window.onload = main;