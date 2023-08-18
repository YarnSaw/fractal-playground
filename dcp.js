var keystore

async function deployJob(inputSet, workFn, args, handleResult, computeGroups, fractal)
{
  if (!keystore)
  {
    keystore = await dcp.wallet.get();
    dcp.wallet.addId(keystore)
  }

  const job = dcp.compute.for(inputSet, workFn, args);

  // Handle various events to display (currently mostly just logs)
  job.on('accepted', () => {
    console.log(' - Job accepted by scheduler.');
    console.log(` - Job has id ${job.id}`);

  // Save job/job info to localstorage to be recovered later
  const previousJobs = localStorage.getItem('jobs') ? JSON.parse(localStorage.getItem('jobs')) : [];
  previousJobs.push({ job: job.id, arguments: args[0], fractal});
  localStorage.setItem('jobs', JSON.stringify(previousJobs));
  });

  job.on('error', console.error);
  job.on('cancel', console.error);

  job.collateResults = false;
  job.requires(['fractalia/fractals.js'])
  job.public.name = `Fractal Generation @ ${Date.now()}`;
  job.setPaymentAccountKeystore(keystore);

  // Note: do I want this passed in, or determined from the document here?
  job.computeGroups = computeGroups || job.computeGroups;

  const resultsNotRetrieved = new Array(inputSet.length);
  for (let i = 0; i < resultsNotRetrieved.length; i++)
  {
    resultsNotRetrieved[i] = i+1
  }

  const conn = new dcp.protocol.Connection(dcpConfig.scheduler.services.resultSubmitter.location, keystore);

  const updateResInterval = setInterval(() => updateResultStats(conn, job.id, resultsNotRetrieved, inputSet.length, handleResult, updateResInterval), 10 * 1000);

  await job.exec(dcp.compute.marketValue);
  return job.id;
}

async function updateResultStats(conn, job, resultsNotRetrieved, inputSize, handleResult, interval, recovery = false)
{
  const { success, payload } = await conn.send('fetchResult', {
    job,
    owner: keystore.address,
    range: resultsNotRetrieved,
  }, keystore);

  if (success)
  {
    await Promise.all(payload.map(async r => {
      resultsNotRetrieved.splice(resultsNotRetrieved.indexOf(r.slice), 1);
      const res = await dcp.utils.fetchURI(decodeURIComponent(r.value), [dcpConfig.scheduler.location.origin]);
      handleResult({sliceNumber: r.slice, result: res});
    }));
  }

  if (resultsNotRetrieved.length === 0 && !recovery)
  {
    clearInterval(interval);
    document.getElementById('slices').innerText = '';
  }
  else if (!recovery)
    document.getElementById('slices').innerText = `${inputSize - resultsNotRetrieved.length} results received out of ${inputSize} slices.`;
}
