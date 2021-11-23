let generationNumber = null
let allFiles = []
let directories = [];
let directoryCounts = {}
let directoryList = {}
let order = []  //use directories for now ** later it will be user decided
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
            if(i == this.files.length -1 ){
                generateDirectoryOrder(directories)
            }
        }
        // console.log(directoryList)
        document.querySelector('.steps').style.display='none'
        document.querySelector('.reorder').style.display='block'

        
    };
});

const subdirectories = document.querySelector('.sub-directories')
function generateDirectoryOrder(directories) {
/* <li class="directory">/Layer 0</li>
            <li class="directory">/Layer 1</li>  */
            order = []
    subdirectories.innerHTML = directories.map(item => {
        order.push(item)
        return `<li class="directory" data-directory="${item}">/${item}</li>`
    }).join('')
    console.log(order)
}


function notify(a){
    console.log(a)
}
const obj = {
    async drawImages(ctx, images) {
      // return a Promise synchronously
      return new Promise((resolve, reject) => {
        let img = images.shift();
        // console.log(images.length)

        this.imgToDraw = new Image();
        this.imgToDraw.src = img;
        this.imgToDraw.onload = () => {
          ctx.drawImage(this.imgToDraw, 0, 0); // Draws the image on canvas
          if (images.length > 0) {
              //   console.log(images)
              // resolve with next iteration so we can await all
            notify(images.length); 
            resolve(this.drawImages(ctx, images));
          } else {
            console.log("I - Processing");
            // done
            var hiddenCanvas = document.getElementById("hiddenCanvas");
            let imgData = hiddenCanvas.toDataURL("image/png"); // Assigns image base64 string in PNG format to a variable
            // console.log(imgData)
            downloadQuery.push(imgData)
            resolve();
          }
        };
        this.imgToDraw.onerror = reject;
      });
    }
  };
let imagesToDraw = []
  

const uploadDocuments = async (event, files) => {
    const filePromises = files.map((file) => {
      // Return a promise per file
      return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async (e) => {
          try {
            fileContent = reader.result;

            // Resolve the promise with the response value
            resolve(fileContent);
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = (error) => {
          reject(error);
        };
      });
    });
  
    // Wait for all promises to be resolved
    const fileInfos = await Promise.all(filePromises);
  
    console.log('file infos COMPLETED');
  
    // Profit
    return fileInfos;
  };

//imageFiles: bottom to top
const putImagesToCanvas = async (imageFiles,cb) => {
    var hiddenCanvas = document.getElementById("hiddenCanvas"); // Creates a canvas object
    var ctx = hiddenCanvas.getContext("2d"); // Creates a contect object
    ctx.clearRect(0, 0, hiddenCanvas.width, hiddenCanvas.height);
    const imagesToDraw = await uploadDocuments(0, imageFiles)

    // console.log(imagesToDraw)
    // cb(imagesToDraw);
    // for (let i = 0; i < imageFiles.length; i++) {
    //     let reader = new FileReader();

    //     if (imageFiles[i]) {
    //         // console.log(imageFiles[i])
    //         reader.readAsDataURL(imageFiles[i]);
    //     }
    //     else { return }
    //     // reader.readAsDataURL(imageFiles[i]);
    //     reader.onloadend = function (e) {
    //         let gImage = new Image(); // Creates image object
    //         gImage.src = e.target.result; // Assigns converted image to image object
    //         // gImage.posIndex = i;
    //         gImage.onload = function (ev) {
    //             if (i == 0) {
    //                 imagesToDraw = []
    //                 hiddenCanvas.width = gImage.width; // Assigns image's width to canvas
    //                 hiddenCanvas.height = gImage.height; // Assigns image's height to canvas
    //                 // console.log("=====================================================\n")
    //             }
    //             imagesToDraw.push(e.target.result)
    //             // console.log(imageFiles[i].webkitRelativePath, order[i])
    //             // ctx.drawImage(this, 0, 0); // Draws the image on canvas
    //             if(i === imageFiles.length - 1) {
    //                 cb(imagesToDraw);
    //                     // let imgData = hiddenCanvas.toDataURL("image/png"); // Assigns image base64 string in PNG format to a variable
    //                     // // console.log(imgData)
    //                     // downloadQuery.push(imgData)
    //                 }
    //             };
    //     };
    // }
         let reader = new FileReader();
        if (imageFiles[0]) {
            // console.log(imageFiles[i])
            reader.readAsDataURL(imageFiles[0]);
        }
        else { return }
        // reader.readAsDataURL(imageFiles[i]);
        reader.onloadend = function (e) {
            let gImage = new Image(); // Creates image object
            gImage.src = e.target.result; // Assigns converted image to image object
            // gImage.posIndex = i;
            gImage.onload = function (ev) {
                    hiddenCanvas.width = gImage.width; // Assigns image's width to canvas
                    hiddenCanvas.height = gImage.height; // Assigns image's height to canvas
                    cb(imagesToDraw);
                };
        };


}
    // draw images asyncli
const asdfg = async (imagesToDraw) => {
    // console.log(imagesToDraw)
    let hiddenCanvas = document.getElementById("hiddenCanvas"); // Creates a canvas object
    let ctx = hiddenCanvas.getContext("2d"); // Creates a contect object
    await obj.drawImages(ctx, imagesToDraw);
    // fill a green rect over to show we are able to await it
    console.log("all done");
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
    let revOrder = [...order].reverse()
    for (let i = 0; i < Object.keys(directoryCounts).length; i++) {
        numbers.push([...Array.from(Array(directoryCounts[revOrder[i]]).keys())])
    }
    // console.log(numbers)
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
    generationNumber = Number(document.querySelector('.limit-number').value) || 9999999999999999999999999999999
    let finalGenerationNumber = generationNumber > combinations.length ? combinations.length : generationNumber
    // console.log(generationNumber, combinations.length,finalGenerationNumber )
    // console.log(order)
    revOrder = [...order].reverse()
    for (let i = 0; i < finalGenerationNumber; i++) {
        row = []
        for (let j = 0; j < revOrder.length; j++) {
            // console.log(directoryList[revOrder[j]],combinations[i],[combinations[i][j]])
            row.push(directoryList[revOrder[j]][combinations[i][j]])
        }
        generateArray.push(row)
    }

    // console.log(generateArray)
    let k = 0;
    for (k = 0; k < finalGenerationNumber; k++) {
        putImagesToCanvas([...generateArray[k]],asdfg)
        if(k === finalGenerationNumber -1){
            downloadButton.disabled = false
            document.querySelector('.completed').style.display = "block"
        }
    }
    
}
const generateButton = document.querySelector(".generate-btn"); 
const downloadButton = document.querySelector(".download-button"); 
downloadButton.addEventListener('click', (e)=>{
    queryDownloader([...downloadQuery])
    downloadQuery=[]
})

generateButton.addEventListener('click', (e)=>{
    downloadQuery=[]
    //check if directories are done
    if(directories.length !== 0){ 
        ggenerator();
        
    }
    
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


// Initialize Dragula
const drake = dragula([document.querySelector('.sub-directories')]);

drake.on('drop',function(el,target,source,sibling){
    reorderDirectories()
})
    
// follow sub directories
function reorderDirectories(){
    const newOrder = []
    subdirectories.childNodes.forEach(item => {
        newOrder.push(item.getAttribute('data-directory'))
    })
    order = [...newOrder]
}
