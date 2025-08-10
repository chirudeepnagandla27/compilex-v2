const { rejects } = require('assert');
const {exec} =require('child_process');
const { error } = require('console');
const fs =require('fs');
const path =require('path');
const { stdout, stderr } = require('process');
const outputPath=path.join(__dirname,'outputs');
if(!fs.existsSync(outputPath)){
    fs.mkdirSync(outputPath,{recursive:true});
}
const executeCpp=async (filepath)=>{
    const jobID=path.basename(filepath).split('.')[0];
    const outPath=path.join(outputPath,`${jobID}.exe`);
    return new Promise((resolve,reject)=>{
        //must do for all the languages
        exec(`g++ ${filepath} -o ${outPath} && ${outPath} `, (error, stdout, stderr) => {
        if(error){
            reject({error,stderr});
        }
        if(stderr){
            reject(stderr);
        }
        resolve(stdout);
    });
});
};
module.exports={executeCpp};