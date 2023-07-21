var keystore


async function deployJob(inputSet, workFn, args, handleResult, computeGroups)
{
  if (!keystore)
    keystore = await dcp.wallet.get();

  const job = dcp.compute.for(inputSet, workFn, args);

  // Handle various events to display (currently mostly just logs)
  job.on('accepted', () => {
    console.log(' - Job accepted by scheduler.');
    console.log(` - Job has id ${job.id}`);
  });
  job.on('error', console.error);
  job.on('cancel', console.error);
  job.on('result', handleResult)

  job.requires(['manyfractals/fractals.js'])
  job.public.name = `Fractal Generation @ ${Date.now()}`;
  job.setPaymentAccountKeystore(keystore);

  // Note: do I want this passed in, or determined from the document here?
  job.computeGroups = computeGroups || job.computeGroups;

  await job.exec(dcp.compute.marketValue);
  return job.id;
}

