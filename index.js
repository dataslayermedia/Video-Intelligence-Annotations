// Imports the Google Cloud Video Intelligence library + Node's fs library
const video = require('@google-cloud/video-intelligence').v1p2beta1;
const fs = require('fs');
const util = require('util');

// Creates a client
const client = new video.VideoIntelligenceServiceClient();

(async function () {

    var labelVideo = function (label, index) {

        var p1 = index % 2;
        var p2 = (index + 1) % 2;
        var command = "ffmpeg -y -i ./processing-" + p1 + ".mp4 -vf \"drawtext=fontfile=/System/Library/Fonts/SFNSMono.ttf:text='" + label + "':fontcolor=white:fontsize=50:box=1:boxcolor=black@0.5:boxborderw=5:x=50:y=(h-text_h)/2:enable='between(t," + index + "," + (index + 1) + ")'\" -codec:a copy processing-" + p2 + ".mp4";

        var result = require('child_process').execSync(command);

        console.log(result);
    }

    /**
     * TODO(developer): Uncomment the following line before running the sample.
     */
    // const path = 'Local file to analyze, e.g. ./my-file.mp4';

    // Reads a local video file and converts it to base64
    // const readFile = util.promisify(fs.readFile);
    //  const file = await readFile("./outside.MP4");
    //  const inputContent = file.toString('base64');

    // Constructs request
    const request = {
        inputUri: 'gs://alexa-translation/single.mp4',
        features: ['LABEL_DETECTION'],
        videoContext: {
            "labelDetectionConfig": {
                "labelDetectionMode": "FRAME_MODE",
                "stationaryCamera": false
            }
        }
    };

    console.log("starting...");

    // Detects labels in a video
    const [operation] = await client.annotateVideo(request);

    console.log('Waiting for operation to complete...');
    const [operationResult] = await operation.promise();

    // Gets annotations for video
    const labels = operationResult.annotationResults[0].frameLabelAnnotations;

    var labelNew = [];

    labels.forEach(function (label, index) {

        console.log("Item detected: " + label.entity.description);
        console.log("Start Time: " + label.frames[0].timeOffset.seconds);
        console.log("End Time: " + label.frames[label.frames.length - 1].timeOffset.seconds);
        console.log("\n\r\n");
        console.log(index);

        var startTime = label.frames[0].timeOffset.seconds;
        var endTime = label.frames[label.frames.length - 1].timeOffset.seconds;

        while (startTime != endTime) {

            if (!!labelNew[startTime]) {
                labelNew[startTime] = labelNew[startTime] + "\n" + label.entity.description;
            } else {
                labelNew[startTime] = label.entity.description;
            }
            startTime++;
        }

    });


    // Annotate the video

    for (var i = 0; i < labelNew.length; i++) {
        if (!!labelNew[i]) {
            labelVideo(labelNew[i], i);
        }
    }

    console.log(labelNew);

})();