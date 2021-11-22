let generationNumber = 600
let allFiles = []
let directories = [];
let directoryCounts = {}
let directoryList = {}
let order = ['background', 'ball', 'eye color', 'iris', 'top lid', 'bottom lid', 'shine']  //use directories for now ** later it will be user decided
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

        
    };
});
//imageFiles: bottom to top
function putImagesToCanvas(imageFiles) {
    var hiddenCanvas = document.getElementById("hiddenCanvas"); // Creates a canvas object
    var ctx = hiddenCanvas.getContext("2d"); // Creates a contect object
    ctx.clearRect(0, 0, hiddenCanvas.width, hiddenCanvas.height);
    for (let i = 0; i < imageFiles.length; i++) {
        var reader = new FileReader();

        if (imageFiles[i]) {
            // console.log(imageFiles[i])
            reader.readAsDataURL(imageFiles[i]);
        }
        else { return }
        // reader.readAsDataURL(imageFiles[i]);
        reader.onloadend = function (e) {
            let gImage = new Image(); // Creates image object
            gImage.src = e.target.result; // Assigns converted image to image object
            gImage.posIndex = i;

            gImage.onload = function (ev) {
                if (i == 0) {
                    hiddenCanvas.width = gImage.width; // Assigns image's width to canvas
                    hiddenCanvas.height = gImage.height; // Assigns image's height to canvas
                    // console.log("=====================================================\n")
                }
                // console.log(imageFiles[i].webkitRelativePath, order[i])
                ctx.drawImage(this, 0, 0); // Draws the image on canvas
                if(i === imageFiles.length - 1) {
                    let imgData = hiddenCanvas.toDataURL("image/png"); // Assigns image base64 string in PNG format to a variable
                    // console.log(imgData)
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

function cartesian(args) {
    var r = [], max = args.length-1;
    function helper(arr, i) {
        for (var j=0, l=args[i].length; j<l; j++) {
            var a = arr.slice(0); // clone arr
            a.push(args[i][j]);
            if (i==max)
                r.push(a);
            else
                helper(a, i+1);
        }
    }
    helper([], 0);
    return r;
}


//generator: get combinations numbers. put files in array. call put images
function ggenerator() {
    // create 2xdimensional array
    let numbers = [
    ]
    for (let i = 0; i < Object.keys(directoryCounts).length; i++) {
        numbers.push([...Array.from(Array(directoryCounts[order[i]]).keys())])
    }
    console.log(numbers)
    //allPossibleCombinations gives last out of index. that's why i put this.
    // numbers.push([0])

    // console.log(allPossibleCombinations(numbers)); // [5, 3, 8, 9] // [image from 0 directory,image from 1 directory, image from 2 directory]
    let combinations = cartesian(numbers)
    // let combinations = allPossibleCombinations(numbers).map((arr) => {
    //     // arr.pop();
    //     return arr;
    // });

    // combinations = multiDimensionalUnique(combinations);
    
    
    
    let generateArray = []
    let row = []
    // let generateArray = allPossibleCombinations(numbers)[0].map
    let finalGenerationNumber = generationNumber > combinations.length ? combinations.length : generationNumber
    console.log(generationNumber, combinations.length,finalGenerationNumber )
    for (let i = 0; i < finalGenerationNumber; i++) {
        row = []
        for (let j = 0; j < order.length; j++) {

            if(directoryList[order[j]][combinations[i][j]] ===undefined) {
                console.log(order[j], combinations[i])
                console.log(directoryList[order[j]],[combinations[i][j]])
            }
            row.push(directoryList[order[j]][combinations[i][j]])
        }
        console.log(row)
        generateArray.push(row)
    }

    // console.log(generateArray)
    for (let i = 0; i < finalGenerationNumber; i++) {
        putImagesToCanvas([...generateArray[i]])
    }
}
const generateButton = document.querySelector(".generate-btn"); 
const downloadButton = document.querySelector(".download-button"); 
downloadButton.addEventListener('click', (e)=>{
    queryDownloader([...downloadQuery])
})

generateButton.addEventListener('click', (e)=>{
    //check if directories are done
    ggenerator()
})



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
