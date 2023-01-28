function main()
{
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');;
  let imageData = ctx.createImageData(100,100);
  for (let i = 0; i < imageData.data.length/4; i++)
  {
    imageData.data[i*4] = 128
    imageData.data[i*4+1] = 128
    imageData.data[i*4+2] = 128
    imageData.data[i*4+3] = 255

  }
  ctx.putImageData(imageData, 0, 0)
  console.log(imageData);

}




window.onload = main