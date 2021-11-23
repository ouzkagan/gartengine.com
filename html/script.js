let generationNumber = null
let allFiles = []
let directories = [];
let directoryCounts = {}
let directoryList = {}
let order = []  //use directories for now ** later it will be user decided
let downloadQuery = []
let finalGenerationNumber = 0
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
            if (i == this.files.length - 1) {
                generateDirectoryOrder(directories)
            }
        }
        // console.log(directoryList)
        document.querySelector('.steps').style.display = 'none'
        document.querySelector('.reorder').style.display = 'block'


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


function notify(a) {
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


//right now we try to draw on same canvas adnd we are calling this function in sync loop. so it doesn't wait for it to finish.
//maybe we can fix this via creating different canvas for each array.
//instead of ctx we can send i and that would hold the information about sequence

const promiseOfAllImages = async (tiles) => {
    // console.log(tiles)
    // Wait until ALL images are loaded
    return Promise.all(
        tiles.map(function (t) {
            // Load each tile, and "resolve" when done
            return new Promise(async (resolve) => {
                const img = new Image();
                img.src = t;
                img.onload = function () {
                    // Image has loaded... resolve the promise!
                    resolve(img);
                };
            });
        })
    );
};
const promiseOfAllCanvas = function (sequence, images) {
    console.log(images)
    return Promise.all(
        images.map(function (image, index) {
            // Load each tile, and "resolve" when done
            return new Promise(function (resolve) {
                if (document.getElementById(`canvas-id-${sequence}`) === null) {
                    document.querySelector('.canvas-container').innerHTML += `<canvas class="generated-canvas" style="width: 75%;" id='canvas-id-${sequence}'>`;
                }
                let disposableCanvas = document.getElementById(`canvas-id-${sequence}`);
                if(index === 0){
                    disposableCanvas.width = "512"
                    disposableCanvas.height = "512"
                }
                let ctx = disposableCanvas.getContext("2d");

                console.log(`drawing seq-${sequence} ${image}`)
                ctx.drawImage(image, 0, 0)
                resolve(disposableCanvas.toDataURL("image/png"))
            });
        })
    );
}

const drawImages = async (sequence, images) => {

    // return a Promise synchronously
    return new Promise((resolve, reject) => {
        if (document.getElementById(`canvas-id-${sequence}`) === null) {
            document.querySelector('.canvas-container').innerHTML += `<canvas style="width: 75%;" id='canvas-id-${sequence}'>`;
        }
        let disposableCanvas = document.getElementById(`canvas-id-${sequence}`);
        let ctx = disposableCanvas.getContext("2d");

        if (images.length === order.length) {
            console.log('first image--take size. seq number:', sequence)
            let gImage = new Image(); // Creates image object
            gImage.src = images[0]; // Assigns converted image to image object
            gImage.onload = () => {
                console.log("setted size of to", disposableCanvas, gImage.width, gImage.height)
                disposableCanvas.width = gImage.width; // Assigns image's width to canvas
                disposableCanvas.height = gImage.height; // Assigns image's width to canvas
            }
        }

        let img = images.shift();
        // console.log(images.length)

        imgToDraw = new Image();
        imgToDraw.src = img;
        imgToDraw.onload = () => {
            ctx.drawImage(imgToDraw, 0, 0); // Draws the image on canvas
            console.log(`Image number ${order.length - images.length} drawed on canvas no canvas-id-${sequence}.`)
            if (images.length > 0) {
                //   console.log(images)
                // resolve with next iteration so we can await all
                notify(images.length);
                resolve(drawImages(sequence, images));
            } else {
                console.log(`seq number ${sequence} is finishing`);
                // done
                let imgData = disposableCanvas.toDataURL("image/png"); // Assigns image base64 string in PNG format to a variable
                // console.log(imgData)
                downloadQuery.push(imgData)
                resolve(disposableCanvas.remove());

            }
        };
        this.imgToDraw.onerror = reject;
    });
}


const uploadDocuments = async (event, files) => {
    const filePromises = files.map((file) => {
        // Return a promise per file
        return new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = async (e) => {
                try {
                    fileContent = reader.result;
                    
                    // console.log(file.webkitRelativePath)
                    // Resolve the promise with the response value
                    resolve(fileContent);
                    //resolve({img:fileContent, name:file.webkitRelativePath})
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
const putImagesToCanvas = async (imageFiles, cb, seq) => {
    // var hiddenCanvas = document.getElementById("hiddenCanvas"); // Creates a canvas object
    // var ctx = hiddenCanvas.getContext("2d"); // Creates a contect object
    // ctx.clearRect(0, 0, hiddenCanvas.width, hiddenCanvas.height);
    const imagesToDraw = await uploadDocuments(0, imageFiles)//correctly gives the sequence for every image
    // console.log(imagesToDraw)

    document.querySelector('.completed').style.display = "block"
    document.querySelector('.completed').innerText = "Preparing. " + seq 
    const downloadableContent = await promiseOfAllImages(imagesToDraw)
        .then(function (allImages) {
            // console.log("All images are loaded!", allImages); // [Img, Img, Img]
            // draw(tiles, allImages, ground);
            return allImages
        }).then(all => {

            // console.log("drawing images to canvas started for seq-",seq)
            return promiseOfAllCanvas(seq, all)
        }).then(x=>{

            // console.log("adding to download query. download query length:", downloadQuery.length)
            downloadQuery.push( x[order.length-1])
            return downloadQuery.length //last state of canvas
        }).then(done => {
            setTimeout(() => {
                document.getElementById(`canvas-id-${seq}`).remove()
            }, 250);
            if(done === finalGenerationNumber){
                downloadButton.disabled = false
                downloadButton.style.cursor = 'pointer';
                document.querySelector('.completed').innerText = "Completed"
                
            }
        })
        .catch(err => console.log(err))
    // await asdfg(imagesToDraw, seq);
    
        // console.log(downloadableContent)
    // let reader = new FileReader();
    // if (imageFiles[0]) {
    //     // console.log(imageFiles[i])
    //     reader.readAsDataURL(imageFiles[0]);
    // }
    // else { return }
    // // reader.readAsDataURL(imageFiles[i]);
    // reader.onloadend = function (e) {
    //     let gImage = new Image(); // Creates image object
    //     gImage.src = e.target.result; // Assigns converted image to image object
    //     // gImage.posIndex = i;
    //     gImage.onload = function (ev) {
    //         hiddenCanvas.width = gImage.width; // Assigns image's width to canvas
    //         hiddenCanvas.height = gImage.height; // Assigns image's height to canvas
    //     };
    // };


}

function draw(tiles, images, ground) {
    var tileW = 16;
    var tileH = 16;
    for (var y = 0; y < ground.length; y++) {
        for (var x = 0; x < ground[y].length; x++) {
            var tile = tiles.indexOf(ground[y][x] + "");
            ctx.drawImage(images[tile], x * tileW, y * tileH);
        }
    }
}

// draw images asyncli
const asdfg = async (imagesToDraw, seq) => {
    // console.log(imagesToDraw)
    // let hiddenCanvas = document.getElementById("hiddenCanvas"); // Creates a canvas object
    // let ctx = hiddenCanvas.getContext("2d"); // Creates a contect object

    promiseOfAllImages(imagesToDraw)
        .then(function (allImages) {
            console.log("All images are loaded!", allImages); // [Img, Img, Img]
            // draw(tiles, allImages, ground);
            return allImages
        }).then(all => {
            return promiseOfAllCanvas(seq, all)
        }).then(x=>{
            console.log("seq is done",x)
        }).catch(err => console.log(err))

    // await drawImages(seq, imagesToDraw);
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
    var r = [], max = args.length - 1;
    function helper(arr, i) {
        for (var j = 0, l = args[i].length; j < l; j++) {
            var a = arr.slice(0); // clone arr
            a.push(args[i][j]);
            if (i == max)
                r.push(a);
            else
                helper(a, i + 1);
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
    finalGenerationNumber = generationNumber > combinations.length ? combinations.length : generationNumber
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
        putImagesToCanvas([...generateArray[k]], asdfg, k)
    }

}
const generateButton = document.querySelector(".generate-btn");
const downloadButton = document.querySelector(".download-button");
downloadButton.addEventListener('click', (e) => {
    queryDownloader([...downloadQuery])
    downloadQuery = []
})

generateButton.addEventListener('click', (e) => {
    downloadQuery = []
    //check if directories are done
    if (directories.length !== 0) {
        ggenerator();

    }

})


//seperate this
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

drake.on('drop', function (el, target, source, sibling) {
    reorderDirectories()
})

// follow sub directories
function reorderDirectories() {
    const newOrder = []
    subdirectories.childNodes.forEach(item => {
        newOrder.push(item.getAttribute('data-directory'))
    })
    order = [...newOrder]
}
