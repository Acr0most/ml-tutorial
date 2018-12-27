var canvas = document.getElementById('canvas');
var ctx = canvas.getContext("2d");
var flag = false;
var prevX = 0;
var currX = 0;
var prevY = 0;
var currY = 0;
var testData = [];
var dot_flag = false;

function init() {
    canvas.addEventListener("mousemove", function (e) {
        findxy('move', e)
    }, false);
    canvas.addEventListener("mousedown", function (e) {
        findxy('down', e)
    }, false);
    canvas.addEventListener("mouseup", function (e) {
        findxy('up', e)
    }, false);
    canvas.addEventListener("mouseout", function (e) {
        findxy('out', e)
    }, false);
}

function draw() {
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.closePath();
}

function erase() {
    ctx.clearRect(0, 0, 75, 75);
}

function findxy(res, e) {
    if (res == 'down') {
        prevX = currX;
        prevY = currY;
        currX = e.clientX - canvas.offsetLeft;
        currY = e.clientY - canvas.offsetTop;

        flag = true;
        dot_flag = true;
        if (dot_flag) {
            ctx.beginPath();
            ctx.fillStyle = 'black';
            ctx.fillRect(currX, currY, 3, 3);
            ctx.closePath();
            dot_flag = false;
        }
    }

    if (res == 'up' || res == "out") {
        flag = false;
    }

    if (res == 'move') {
        if (flag) {
            prevX = currX;
            prevY = currY;
            currX = e.clientX - canvas.offsetLeft;
            currY = e.clientY - canvas.offsetTop;
            draw();
        }
    }
}

init();

function calcDistance(testElement, inputData) {
   distances = [];

   testElement.data.forEach((value, index) => {
      distances.push(Math.pow(value - inputData[index], 2));
   });

   distanceSum = distances.filter(distance => distance !== NaN).reduce(function(a, b) { return a + b; }, 0);

   return Math.sqrt(distanceSum);
}

function getLabelByMinDistances(distances, k=3) {
   // sort distances ascending
   distances.sort((d1, d2) => {
      if (d1.distance > d2.distance) {
         return 1;
      } else if (d1.distance < d2.distance) {
         return -1;
      }
      return 0;
   });

   var counter = [];

   // get k top elements and fill counter for label
   distances.splice(1, k).forEach(distance => {
      if (counter.find(el => el.label === distance.label)) {
         counter.find(el => el.label === distance.label).count += 1;
      } else {
          counter.push({label: distance.label, count: 1});
      }
  });

  // sort counter descending
  counter.sort((c1, c2) => {
     if (c1.count > c2.count) {
         return -1;
     } else if (c1.count < c2.count) {
         return 1;
     }
     return 0;
   });

   return counter[0].label;
}

function readData() {
   var imgData = [];
   var arr = Array.from(ctx.getImageData(0, 0, 75, 75).data);

   for (var i=0; i < arr.length; i+=4) {
      imgData.push(arr.slice(i, i+4)[3]);
   }

   return imgData;
}

function addTestData() {
   var canvasContent = readData();
   var label = document.getElementById('label').value;
   testData.push({label: label, data: canvasContent});
   erase();
}

function predict() {
   var canvasContent = readData();

   var distances = [];
   testData.forEach(testObject => {
      distances.push({label: testObject.label, distance: calcDistance(testObject, canvasContent)});
   });

   var label = getLabelByMinDistances(distances);
   document.getElementById('output').value = label;
}

function exp() {
   console.log(JSON.stringify(testData));
}
