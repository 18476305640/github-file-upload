function canvasToImageFile(select,originFile,callback) {
    var canvas = document.querySelector(select);
    // 转为文件
    // canvas转为blob并上传
    canvas.toBlob(function (blobObj) {
        // 转为了二进制
        let genFileObj = new File([blobObj],originFile.name,{type: originFile.type});
        console.log(genFileObj.size , originFile.size)
        callback(genFileObj.size < originFile.size?genFileObj:originFile)
    },originFile.type,0.95); // 属于压缩关键第二部分
}
// 判断是否为图片
function isImageFile(file) {
    if(file.type.indexOf("image") >= 0) return true;
    return false;
}
function ImgFileCompression(imgFile,callback) {
    // 如果不是文件跳过压缩
    if(! isImageFile(imgFile) || imgFile == null ) {
        callback(imgFile);
        return;
    } 
    // 属于压缩关键第二部分
    let ratio = 0.8;
    let minWidth = 600;
    // 开始准备获取图片原始大小（高度，宽度）
    let reader = new FileReader();
    reader.readAsDataURL(imgFile);
    let img = new Image();
    reader.onload = e => {
        path = e.currentTarget.result
        img.src = path;
        img.onload = function () {
            // 获取到了宽度与高度
            const originHeight = img.height;
            const originWidth = img.width;
            // 计算出压缩后的宽度与高度
            let compressedWidth = originWidth*ratio >= 600?originWidth*ratio:originWidth;
            let compressedHeight = originWidth*ratio >= 600?originHeight*ratio:originHeight;
            
            // 将图片绘制canvas中
            $("#canvas_box").html(`
                <canvas id="myCanvas" width="${compressedWidth}" height="${compressedHeight}">
            `)
            var c=document.getElementById("myCanvas");
            var ctx=c.getContext("2d");
            ctx.drawImage(img,0,0,compressedWidth,compressedHeight);
            // 到这里已经将图片绘制了，但我们将之隐藏了，因为用于压缩 ，所以无需显示
            canvasToImageFile("#myCanvas",imgFile,callback)
        }
    }

}




