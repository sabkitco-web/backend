const stream = require("stream");
const ffmpeg = require("fluent-ffmpeg");
const { AUDIO_FORMAT_MAP } = require("../utils/const");
const axios = require('axios');






const { PDFDocument } = require('pdf-lib');
const puppeteer = require('puppeteer');


async function htmlToImageBuffer(html, pdfWidth, pdfHeight) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Set viewport to PDF page dimensions
    await page.setViewport({ 
        width: Math.ceil(pdfWidth), 
        height: Math.ceil(pdfHeight) 
    });
    
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    // networkidle0 - when images are present.
    // domcontentloaded - when simple html.
    await page.waitForSelector('#headerDiv', { timeout: 3000 })


        // Wait for all images to load
    // await page.evaluate(() => {
    //     return Promise.all(
    //         Array.from(document.images)
    //             .filter(img => !img.complete)
    //             .map(img => new Promise(resolve => {
    //                 img.onload = img.onerror = resolve;
    //             }))
    //     );
    // });

    // Get the actual div dimensions
    const divSize = await page.evaluate(() => {
        const div = document.getElementById('headerDiv');
        const rect = div.getBoundingClientRect();
        return { 
            width: Math.ceil(rect.width), 
            height: Math.ceil(rect.height),
            x: Math.ceil(rect.x),
            y: Math.ceil(rect.y)
        };
    });

    // Screenshot only the headerDiv with its actual position and size
    const buffer = await page.screenshot({
        type: 'png',
        clip: { 
            x: divSize.x, 
            y: divSize.y, 
            width: divSize.width, 
            height: divSize.height 
        }
    });

    await browser.close();
    return buffer;
}


// async function htmlToImageBuffer(html, width = 600, height = 60) {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     await page.setViewport({ width, height });
//     await page.setContent(html);
//     const buffer = await page.screenshot({ type: 'png' });
//     await browser.close();
//     return buffer;
// }

// Height : 841.89 Width : 595.28





const headerHTML = `
 <body style="background: #fff; margin: 0;">
        <div style="padding: 10px; background: #f5f5f5; text-align: center;" id ="headerDiv">
            <h1 class="title" style="margin: 0; font-size: 32px; color:red;">Test book pass pro sale <span style = "color : green">jagdish_2025</span></h1>
        </div>
    </body>
`;

const coverHTML = `
<body style="background: #fff; margin: 0;">
<div id = "headerDiv" style="
    border:3px solid #4A90E2; 
    padding:40px; 
    margin:40px; 
    text-align:center; 
    background:#EAF3FF;

">
    <h1 style="color:#2C3E50; margin-bottom:10px;">Report Title</h1>
    <h3 style="color:#4A90E2; margin-top:0;">Subtitle or Description</h3>

    <p style="margin-top:30px; color:#000;">Prepared By: Your Company Name <span style="color: green">jagdish</span></p>
    <p style="color:#000;">Date: 2025</p>
 
</div>
 </body>
`

//    <img style="background: #fff; object-fit: cover; display: block;height : 300px; width 300px" src="https://plus.unsplash.com/premium_photo-1664201889896-6a42c19e953a?q=80&w=2436&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
            // />

async function pdfManager(req, res) {
   try {
        const { pdfUrl = "https://storage.googleapis.com/testbook/sitemaps-testing/Empty_pdf.pdf" } = req.query || {}
        if (!pdfUrl) return res.status(400).send('Missing pdfUrl');

        // Download PDF
        const pdfResponse = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
        const pdfDoc = await PDFDocument.load(pdfResponse.data);

        // Get first page dimensions to use as reference
        const firstPage = pdfDoc.getPages()[0];
        const { width: pdfWidth, height: pdfHeight } = firstPage.getSize();

        // Convert HTML to image with PDF dimensions 
        // Height : 841.89 Width : 595.28
        const headerImgBuffer = await htmlToImageBuffer(headerHTML, pdfWidth, pdfHeight);
        const coverImgBuffer = await htmlToImageBuffer(coverHTML, pdfWidth, pdfHeight);

        // Embed images in PDF
        const headerImage = await pdfDoc.embedPng(headerImgBuffer);
        const coverImage = await pdfDoc.embedPng(coverImgBuffer);

        const pages = pdfDoc.getPages();
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          const { width, height } = page.getSize();

          if (i == 0) {
            // For cover, scale to fit and center
            // const coverDims = coverImage.scaleToFit(width, height);
            const coverDims = coverImage.scale(1);

            const x = (width - coverDims.width) / 2;
            const y = (height - coverDims.height) /2 ;   // remove devide by 2 if want to start from top of the page
            
            page.drawImage(coverImage, {
                x: x,
                y: y,
                width: coverDims.width,
                height: coverDims.height,
            });
            continue; 
          }
          
          // Header dimensions
          const headerDims = headerImage.scale(1); // Use actual size
          
          // Header (top)
          page.drawImage(headerImage, {
              x: 0,
              y: height - headerDims.height,
              width: headerDims.width,
              height: headerDims.height,
          });

          // Footer (bottom)
          page.drawImage(headerImage, {
              x: 0,
              y: 0,
              width: headerDims.width,
              height: headerDims.height,
          });
        }

        const pdfBytes = await pdfDoc.save();
        res.setHeader('Content-Type', 'application/pdf');
        res.send(pdfBytes);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error processing PDF');
    }
}










































//  for local 
// ffmpeg.setFfmpegPath("/opt/homebrew/bin/ffmpeg"); 

// for vm
ffmpeg.setFfmpegPath("/usr/bin/ffmpeg");

async function extractAudio(req, res) {
  try {

    // Check if file exists
    if (!req.files || !req.files.length) {
      return res.status(400).send({
        status: false,
        data: {},
        msg: "Empty file",
      });
    }

    const { format = "mp3" } = req.body;
    const videoFile = req.files[0];
    const videoBuffer = videoFile.buffer;

    const videoStream = new stream.PassThrough();
    videoStream.end(videoBuffer);
    const chunks = [];
    const selected = AUDIO_FORMAT_MAP[format.toLowerCase()] || { format: "mp3" };

    // Convert video to audio in memory
    await new Promise((resolve, reject) => {

        const outputStream = new stream.PassThrough();
        let command = ffmpeg(videoStream).noVideo().toFormat(selected.format);
        // Only set codec if it exists
        if (selected.codec) {
            command = command.audioCodec(selected.codec);
        }
        command
            .on("error", (err) => reject(err))
            .pipe(outputStream, { end: true });

        outputStream.on("data", (chunk) => chunks.push(chunk));
        outputStream.on("end", resolve);
        outputStream.on("error", (err) => reject(err));
    });

    // Combine all chunks into a single buffer
    const audioBuffer = Buffer.concat(chunks);

    // Send audio buffer in JSON
    res.status(200).send({
      status: true,
      data: audioBuffer,
      msg: "Audio extracted successfully",
    });

  } catch (err) {
    console.error(err);
    res.status(500).send({
      status: false,
      msg: err?.message || "Error processing video",
    });
  }
}



module.exports = { extractAudio, pdfManager };