const fs = require("fs");

module.exports.deleteFile = (path) => {
    if(fs.existsSync(path)){
        fs.unlink(path, (err)=>{
            if(err){
                console.log(err)
            }else{
                console.log("file deleted successfully...")
            }
        });
    }
}