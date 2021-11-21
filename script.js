directories = []

var inps = document.querySelectorAll('input');
[].forEach.call(inps, function(iptEl) {
    iptEl.onchange = function(e) {
        console.log(this.files);
        blah.src = URL.createObjectURL(this.files[0])

        for(let i = 0; i < this.files.length; i++) {
            console.log(this.files[i])
            var directory = this.files[i].webkitRelativePath.split('/')[1]
            if(directories.indexOf(directory) <= -1){
                directories.push(directory)
            }
        }

    };
});
