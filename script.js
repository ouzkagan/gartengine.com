directories = [];

var inps = document.querySelectorAll("input");
[].forEach.call(inps, function (iptEl) {
    iptEl.onchange = function (e) {
        console.log(this.files);

        // let imageFile = this.files[0];
        // var reader = new FileReader();
        // reader.readAsDataURL(imageFile);
        // reader.onloadend = function (e) {
        //     var myImage = new Image(); // Creates image object
        //     console.log( e.target.result)
        //     myImage.src = e.target.result; // Assigns converted image to image object
        //     myImage.onload = function (ev) {
        //         var myCanvas = document.getElementById("myCanvas"); // Creates a canvas object
        //         var myContext = myCanvas.getContext("2d"); // Creates a contect object
        //         myCanvas.width = myImage.width; // Assigns image's width to canvas
        //         myCanvas.height = myImage.height; // Assigns image's height to canvas
        //         myContext.drawImage(myImage, 0, 0); // Draws the image on canvas
        //         let imgData = myCanvas.toDataURL("image/png", 0.75); // Assigns image base64 string in jpeg format to a variable
        //     };
        // };

        // setTimeout(() => {
        //     let imageFile2 = this.files[1];
        //     var reader2 = new FileReader();
        //     reader2.readAsDataURL(imageFile2);
        //     reader2.onloadend = function (e) {
        //         var myImage2 = new Image(); // Creates image object
        //         myImage2.src = e.target.result; // Assigns converted image to image object
        //         myImage2.onload = function (ev) {
        //             var myCanvas2 = document.getElementById("myCanvas"); // Creates a canvas object
        //             var myContext2 = myCanvas2.getContext("2d"); // Creates a contect object
        //             myContext2.drawImage(myImage2, 0, 0); // Draws the image on canvas
        //             let imgData2 = myCanvas2.toDataURL("image/png", 0.75); // Assigns image base64 string in jpeg format to a variable
        //         };
        //     }; 
        // }, 2000);

        putImagesToCanvas([this.files[0], this.files[1]])

        for (let i = 0; i < this.files.length; i++) {
            // console.log(this.files[i]);
            var directory = this.files[i].webkitRelativePath.split("/")[1];
            if (directories.indexOf(directory) <= -1) {
                directories.push(directory);
            }
        }
    };
});
//imageFiles: bottom to top
function putImagesToCanvas(imageFiles){
    for(let i = 0; i < imageFiles.length; i++){
        var reader = new FileReader();
        reader.readAsDataURL(imageFiles[i]);
        reader.onloadend = function (e) {
            var myImage = new Image(); // Creates image object
            // console.log( e.target.result)
            myImage.src = e.target.result; // Assigns converted image to image object
            myImage.onload = function (ev) {
                var myCanvas = document.getElementById("myCanvas"); // Creates a canvas object
                var myContext = myCanvas.getContext("2d"); // Creates a contect object
                if(i == 0){
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
var a = [
    [1, 2,3,4],
    [1, 2],
    [6,7,8,9,10],
  ]
  
  function allPossibleCombinations(items, isCombination=false){
      // finding all possible combinations of the last 2 items
      // remove those 2, add these combinations
      // isCombination shows if the last element is itself part of the combination series
      if(items.length == 1){
         return items[0]
      }
      else if(items.length == 2){
         var combinations = []
         for (var i=0; i<items[1].length; i++){
             for(var j=0; j<items[0].length; j++){
                 if(isCombination){
                     // clone array to not modify original array
                     var combination = items[1][i].slice();
                     combination.push(items[0][j]);
                 }
                 else{
                     var combination = [items[1][i], items[0][j]];
                 }
                 combinations.push(combination);
             }
         }
         return combinations
      }
      else if(items.length > 2){
         var last2 = items.slice(-2);
         var butLast2 = items.slice(0, items.length - 2);
         last2 = allPossibleCombinations(last2, isCombination);
         butLast2.push(last2)
         var combinations = butLast2;
         return allPossibleCombinations(combinations, isCombination=true)
      }
  }
  
//   console.log(allPossibleCombinations(a));
//   console.log(allPossibleCombinations(a).length);

//generator: get combinations numbers. put files in array. call put images