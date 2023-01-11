import '../../gitReadWrite.js'

// 帧应用
LOCAL_GIT_READY();
window.upload.onUpload(function(data) {
    console.log("上传成功事件",data)
})