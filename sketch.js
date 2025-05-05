// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let circleX, circleY;
let circleSize = 100;
let isDraggingIndex = false; // 食指拖曳狀態
let isDraggingThumb = false; // 大拇指拖曳狀態
let trailIndex = []; // 儲存食指的軌跡
let trailThumb = []; // 儲存大拇指的軌跡

function preload() {
  // Initialize HandPose model with flipped video input
  handPose = ml5.handPose({ flipped: true });
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // Start detecting hands
  handPose.detectStart(video, gotHands);

  // Initialize circle position at the center of the canvas
  circleX = width / 2;
  circleY = height / 2;
}

function draw() {
  image(video, 0, 0);

  // Draw the circle
  fill(0, 255, 0);
  noStroke();
  circle(circleX, circleY, circleSize);

  // Draw the trails
  strokeWeight(2);
  
  // Draw the red trail for the index finger
  stroke(255, 0, 0);
  noFill();
  beginShape();
  for (let point of trailIndex) {
    vertex(point.x, point.y);
  }
  endShape();

  // Draw the green trail for the thumb
  stroke(0, 255, 0);
  beginShape();
  for (let point of trailThumb) {
    vertex(point.x, point.y);
  }
  endShape();

  // Ensure at least one hand is detected
  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // Get the index finger tip (keypoint 8)
        let indexFinger = hand.keypoints[8];
        // Get the thumb tip (keypoint 4)
        let thumb = hand.keypoints[4];

        // Check if the index finger is touching the circle
        let dIndex = dist(indexFinger.x, indexFinger.y, circleX, circleY);
        if (dIndex < circleSize / 2) {
          isDraggingIndex = true;
        }

        // Check if the thumb is touching the circle
        let dThumb = dist(thumb.x, thumb.y, circleX, circleY);
        if (dThumb < circleSize / 2) {
          isDraggingThumb = true;
        }

        // If dragging with the index finger, move the circle and record the trail
        if (isDraggingIndex) {
          circleX = indexFinger.x;
          circleY = indexFinger.y;

          // Add the current position to the index finger trail
          trailIndex.push({ x: indexFinger.x, y: indexFinger.y });
        }

        // If dragging with the thumb, move the circle and record the trail
        if (isDraggingThumb) {
          circleX = thumb.x;
          circleY = thumb.y;

          // Add the current position to the thumb trail
          trailThumb.push({ x: thumb.x, y: thumb.y });
        }

        // Stop dragging if the index finger is no longer near the circle
        if (dIndex > circleSize / 2) {
          isDraggingIndex = false;
        }

        // Stop dragging if the thumb is no longer near the circle
        if (dThumb > circleSize / 2) {
          isDraggingThumb = false;
        }

        // Draw the keypoints
        fill(255, 0, 0);
        noStroke();
        circle(indexFinger.x, indexFinger.y, 16);

        fill(0, 255, 0);
        noStroke();
        circle(thumb.x, thumb.y, 16);
      }
    }
  }

  // Clear the trails if not dragging
  if (!isDraggingIndex) {
    trailIndex = [];
  }
  if (!isDraggingThumb) {
    trailThumb = [];
  }
}
