let generationNumber = 5
let allFiles = []
let directories = [];
let directoryCounts = {}
let directoryList = {}
let order = ['background', 'ball', 'eye color', 'iris', 'top lid', 'bottom lid', 'shine'] //use directories for now ** later it will be user decided
let downloadQuery = []
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
        // console.log(directoryList)

        ggenerator()
    };
});
//imageFiles: bottom to top
function putImagesToCanvas(imageFiles) {
    var myCanvas = document.getElementById("myCanvas"); // Creates a canvas object
    var myContext = myCanvas.getContext("2d"); // Creates a contect object
    myContext.clearRect(0, 0, myCanvas.width, myCanvas.height);
    for (let i = 0; i < imageFiles.length; i++) {
        var reader = new FileReader();

        if (imageFiles[i]) {
            console.log(imageFiles[i])
            reader.readAsDataURL(imageFiles[i]);
        }
        else { return }
        // reader.readAsDataURL(imageFiles[i]);
        reader.onloadend = function (e) {
            var myImage = new Image(); // Creates image object
            // console.log( e.target.result)
            myImage.src = e.target.result; // Assigns converted image to image object
            myImage.onload = function (ev) {
                if (i == 0) {
                    myCanvas.width = myImage.width; // Assigns image's width to canvas
                    myCanvas.height = myImage.height; // Assigns image's height to canvas
                }
                console.log(imageFiles[i].name)
                myContext.drawImage(myImage, 0, 0); // Draws the image on canvas
                if(i === imageFiles.length - 1) {
                    let imgData = myCanvas.toDataURL("image/png"); // Assigns image base64 string in PNG format to a variable
                    console.log(imgData)
                    downloadQuery.push(imgData)
                }
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
function multiDimensionalUnique(arr) {
    var uniques = [];
    var itemsFound = {};
    for (var i = 0, l = arr.length; i < l; i++) {
        var stringified = JSON.stringify(arr[i]);
        if (itemsFound[stringified]) { continue; }
        uniques.push(arr[i]);
        itemsFound[stringified] = true;
    }
    return uniques;
}

//generator: get combinations numbers. put files in array. call put images
function ggenerator() {
    // create 2xdimensional array
    let numbers = [
    ]
    for (let i = 0; i < Object.keys(directoryCounts).length; i++) {
        numbers.push([...Array.from(Array(directoryCounts[directories[i]]).keys())])
    }
    //allPossibleCombinations gives last out of index. that's why i put this.
    numbers.push([0])

    // console.log(allPossibleCombinations(numbers)); // [5, 3, 8, 9] // [image from 0 directory,image from 1 directory, image from 2 directory]
    // let combinations = allPossibleCombinations(numbers)
    let combinations = allPossibleCombinations(numbers).map((arr) => {
        arr.pop();
        return arr;
    });

    combinations = multiDimensionalUnique(combinations);

    console.log(combinations)


    let generateArray = []
    let row = []
    // let generateArray = allPossibleCombinations(numbers)[0].map
    for (let i = 0; i < generationNumber; i++) {
        row = []
        for (let j = 0; j < order.length; j++) {

            // console.log(directoryList[order[j]][combinations[i][j]])
            row.push(directoryList[order[j]][combinations[i][j]])
        }
        generateArray.push(row)
    }

    console.log(generateArray)
    for (let i = 0; i < generationNumber; i++) {
        putImagesToCanvas([...generateArray[i]])

    }
}

const canvas = document.getElementById("myCanvas"); // Creates a canvas object
function dlCanvas() {
    console.log(downloadQuery)
    queryDownloader([...downloadQuery])
};
dl.addEventListener('click', dlCanvas, false);

function queryDownloader(dataURIs) {
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
