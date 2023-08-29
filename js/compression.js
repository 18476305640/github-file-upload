function canvasToImageFile(select, originFile, ratio) {
    return Promise((resolve,reject)=>{
        var canvas = document.querySelector(select);
        // 转为文件
        // canvas转为blob并上传
        canvas.toBlob(function (blobObj) {
            // 转为了二进制
            let genFileObj = new File([blobObj], originFile.name, { type: originFile.type });
            console.log("正在判断是否要使用压缩上传：压缩后的大小：" + genFileObj.size + "，原始大小" + originFile.size)
            // 最终决定是否要使用压缩的上传
            resolve(genFileObj.size < originFile.size ? genFileObj : originFile)
        }, originFile.type, ratio); // 属于压缩关键第二部分
    })
    
}
// 判断是否为图片
function isImageFile(file) {
    if (file != null && file.type.indexOf("image") >= 0) return true;
    return false;
}
function ImgFileCheckCompression(originFile) {
    return new Promise((resolve, reject) => {
        let compressionConfig = JSON.parse(localStorage.getItem("config")).compression_config;
        if (compressionConfig == null || compressionConfig.compression != 1) {
            // 如果逻辑回调返回false表示不进行压缩，则  originFile 就是压缩的对象，等于没压缩
            resolve(originFile);
            return;
        }
        let compression_config_arr = compressionConfig.split(":");
        let widthWithHeightRatio = compression_config_arr[0] ? parseFloat(compression_config_arr[0]) : 0.9;
        let minWidth = compression_config_arr[1] ? parseFloat(compression_config_arr[1]) : 600;
        let ratio = compression_config_arr[2] ? parseFloat(compression_config_arr[2]) : 0.9; // 属于压缩关键第二部分

        console.log("进入压缩逻辑", widthWithHeightRatio, minWidth, ratio)
        // 开始准备获取图片原始大小（高度，宽度）
        let reader = new FileReader();
        reader.readAsDataURL(originFile);
        let img = new Image();
        reader.onload = e => {
            path = e.currentTarget.result
            img.src = path;
            img.onload = function () {
                // 获取到了宽度与高度
                const originHeight = img.height;
                const originWidth = img.width;
                // 计算出压缩后的宽度与高度，如果压缩后宽度小于600，使用原始图片宽高
                // console.log(originWidth*widthWithHeightRatio ,minWidth,originWidth*widthWithHeightRatio , minWidth,"压缩前大小：",originWidth,originHeight)
                let compressedWidth = originWidth * widthWithHeightRatio >= minWidth ? originWidth * widthWithHeightRatio : originWidth;
                let compressedHeight = originWidth * widthWithHeightRatio >= minWidth ? originHeight * widthWithHeightRatio : originHeight;
                console.log("压缩后的大小", compressedWidth, compressedHeight);
                // 将图片绘制canvas中
                $("#canvas_box").html(`
                <canvas id="myCanvas" width="${compressedWidth}" height="${compressedHeight}">
            `)
                var c = document.getElementById("myCanvas");
                var ctx = c.getContext("2d");
                ctx.drawImage(img, 0, 0, compressedWidth, compressedHeight);
                // 到这里已经将图片绘制了，但我们将之隐藏了，因为用于压缩 ，所以无需显示
                canvasToImageFile("#myCanvas", originFile, ratio).then(compressedFile=>resolve(compressedFile))
            }
        }

    })

}

export default ImgFileCheckCompression;




