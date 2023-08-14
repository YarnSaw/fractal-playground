var keystore

async function deployJob(inputSet, workFn, args, handleResult, computeGroups)
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
  });
  job.on('error', console.error);
  job.on('cancel', console.error);

  job.collateResults = false;
  job.requires(['manyfractals/fractals.js'])
  job.public.name = `Fractal Generation @ ${Date.now()}`;
  job.setPaymentAccountKeystore(keystore);

  // Note: do I want this passed in, or determined from the document here?
  // job.computeGroups = computeGroups || job.computeGroups;

  const resultsNotRetrieved = new Array(inputSet.length);
  for (let i = 0; i < results.length; i++)
  {
    results[i] = i+1
  }

  const conn = new dcp.protocol.Connection(dcpConfig.scheduler.services.resultSubmitter.location, keystore);

  var canClearInterval = false;
  const updateResInterval = setInterval(updateResultStats, 10 * 1000);
  async function updateResultStats()
  {
    if (canClearInterval)
    {
      clearInterval(updateResInterval);
      document.getElementById('slices').innerText = '';
    }

    const { success, payload } = await conn.send('fetchResult', {
      job: job.id,
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

    if (!canClearInterval)
      document.getElementById('slices').innerText = `${resultsNotRetrieved.length - inputSet.length} results received out of ${inputSet.length} slices.`;
    
  }

  await job.exec(dcp.compute.marketValue);
  canClearInterval = true;

  return job.id;
}

