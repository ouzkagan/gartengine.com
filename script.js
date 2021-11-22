let allFiles = []
let directories = [];
let directoryCounts = {}
let directoryList = {}
let order = ['background', 'ball', 'eye color', 'iris', 'top lid', 'bottom lid', 'shine'] //use directories for now ** later it will be user decided

var inps = document.querySelectorAll("input");
[].forEach.call(inps, function (iptEl) {
    iptEl.onchange = function (e) {
        allFiles = (this.files);
        for (let i = 0; i < this.files.length; i++) {
            // console.log(this.files[i]);
            var directory = this.files[i].webkitRelativePath.split("/")[1];
            if (directories.indexOf(directory) <= -1) {
                directories.push(directory);
            }
            if (directoryCounts[directory]) {
                directoryCounts[directory] = directoryCounts[directory] + 1
                directoryList[directory] = [...directoryList[directory], this.files[i]]

            } else {
                directoryCounts[directory] = 1
                directoryList[directory] = [this.files[i]]

            }
        }
        console.log(directoryList)

        ggenerator()
    };
});
//imageFiles: bottom to top
function putImagesToCanvas(imageFiles) {
    for (let i = 0; i < imageFiles.length; i++) {
        var reader = new FileReader();
        reader.readAsDataURL(imageFiles[i]);
        reader.onloadend = function (e) {
            var myImage = new Image(); // Creates image object
            // console.log( e.target.result)
            myImage.src = e.target.result; // Assigns converted image to image object
            myImage.onload = function (ev) {
                var myCanvas = document.getElementById("myCanvas"); // Creates a canvas object
                var myContext = myCanvas.getContext("2d"); // Creates a contect object
                if (i == 0) {
                    myCanvas.width = myImage.width; // Assigns image's width to canvas
                    myCanvas.height = myImage.height; // Assigns image's height to canvas
                }
                myContext.drawImage(myImage, 0, 0); // Draws the image on canvas
                let imgData = myCanvas.toDataURL("image/png", 0.75); // Assigns image base64 string in jpeg format to a variable
            };
        };
    }
}

//return combinations()
// var a = [
//     [1, 2,3,4],
//     [1, 2],
//     [6,7,8,9,10],
//   ]

function allPossibleCombinations(items, isCombination = false) {
    // finding all possible combinations of the last 2 items
    // remove those 2, add these combinations
    // isCombination shows if the last element is itself part of the combination series
    if (items.length == 1) {
        return items[0]
    }
    else if (items.length == 2) {
        var combinations = []
        for (var i = 0; i < items[1].length; i++) {
            for (var j = 0; j < items[0].length; j++) {
                if (isCombination) {
                    // clone array to not modify original array
                    var combination = items[1][i].slice();
                    combination.push(items[0][j]);
                }
                else {
                    var combination = [items[1][i], items[0][j]];
                }
                combinations.push(combination);
            }
        }
        return combinations
    }
    else if (items.length > 2) {
        var last2 = items.slice(-2);
        var butLast2 = items.slice(0, items.length - 2);
        last2 = allPossibleCombinations(last2, isCombination);
        butLast2.push(last2)
        var combinations = butLast2;
        return allPossibleCombinations(combinations, isCombination = true)
    }
}

//   console.log(allPossibleCombinations(a));
//   console.log(allPossibleCombinations(a).length);

//generator: get combinations numbers. put files in array. call put images
function ggenerator() {
    // create 2xdimensional array
    var a = [
        [1, 2, 3, 4],
        [1, 2],
        [6, 7, 8, 9, 10],
    ]
    let numbers = [
        // [...Array.from(Array(directoryCounts[directories[0]]).keys())], //directoryCounts[directories[0]] //Array.from(Array(directoryCounts[directories[0]]).keys()) //
    ]
    console.log(Object.keys(directoryCounts))
    for (let i = 0; i < Object.keys(directoryCounts).length; i++) {
        numbers.push([...Array.from(Array(directoryCounts[directories[i]]).keys())])
    }
    // console.log(numbers)
    console.log(allPossibleCombinations(numbers)); // [5, 3, 8, 9] // [image from 0 directory,image from 1 directory, image from 2 directory]
    let firstPossible = allPossibleCombinations(numbers)[0]
    let generateArray = []
    // let generateArray = allPossibleCombinations(numbers)[0].map
    for (let i = 0; i < firstPossible.length; i++) {
        generateArray.push(directoryList[order[i]][firstPossible[i]])
    }
    console.log(generateArray)
    putImagesToCanvas([...generateArray])
}

const canvas = document.getElementById("myCanvas"); // Creates a canvas object
function dlCanvas() {
    var dt = canvas.toDataURL('image/png');

    downloadQuery([dt])
};
dl.addEventListener('click', dlCanvas, false);

function downloadQuery(dataURIs) {
    var zip = new JSZip();
    for (let i = 0; i < dataURIs.length; i++) {
        var uri = dataURIs[i];
        var idx = uri.indexOf('base64,') + 'base64,'.length; // or = 28 if you're sure about the prefix
        var content = uri.substring(idx);
        zip.file(`${i}.png`, content, { base64: true });
    }

    zip.generateAsync({ type: "blob" })
        .then(function (content) {
            // see FileSaver.js
            saveAs(content, "artwork.zip");
        });
}
