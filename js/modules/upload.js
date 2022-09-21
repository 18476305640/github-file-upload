import '../jquery.js'
// 引入配置对象
import configObj from './config.js'
// dns加速
function dns (url) {
  let dnsUrl = configObj.dns || "https://cdn.jsdelivr.net/gh/"
  if (dnsUrl.indexOf("/") != dnsUrl.length - 1) dnsUrl += "/";
  let delimiter = configObj.branch + "/";
  let start_index = url.indexOf(delimiter);
  let _last_str = url.substring(start_index, url.length)
  let last_str = configObj.userAndRepo + "@" + _last_str
  // 返回加速后的链接
  return dnsUrl + last_str;
}
let githubUpload = function (fileName, fileData,isImage = true) {
  $("#resource_box").html("")
  $("#msg").html("<p>① 正在上传，请稍等...</p>")
  $.ajax({
    type: 'put',
    url: `https://api.github.com/repos/${configObj.userAndRepo}/contents${configObj.path}/${new Date().Format("yyyy")}/${new Date().Format("MM")}/${new Date().Format("dd")}/${fileName}`,
    headers: {
      'Authorization': 'token ' + configObj.token,
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({
      message: "Upload via web tool",
      branch: configObj.branch,
      content: fileData
    }),
    success (data) {
      // 对原始链接进行nds加速
      let repoUrl = dns(data.content.download_url)

      // 将内容写到剪切板
      let finallyUrl = repoUrl;
      
      if(isImage) {
        // 如果是图片用md图片格式进行包装
        console.log(">>> 正在上传的是图片");
        finallyUrl = urlFormat(repoUrl, "md")
      }
      navigator.clipboard.writeText(finallyUrl).then(function () {
        console.log('OK，Template copied to clipboard！')
        $("#msg").html($("#msg").html() + "<p style='color:#008040'>② 上传成功了，请查看剪切板！ヾ(^▽^*)))</p>")
        if (isImage) {
          $("#resource_box").html(`<img src="${repoUrl}" />`)
        }

      }, function () {
        $("#msg").html("<span style='color:red'>Error,Unable to write to clipboard. :-(</span>")
      });

    },
    error (errInfo) {
      $("#msg").html($("#msg").html() + "<p style='color:red'>② 上传失败了，请检查配置与网络是否正常！  ┗|｀O′|┛ 嗷~~</p>")
    }
  })
}

// 公共工具类
let UploadFromFile = function (file,fileName = null) {
  // 如果是DataTransferItem 就转为File
  if(file.kind == "file" ) file = file.getAsFile();
  if(file.size <= 0) return;
    var fr = new FileReader(); //FileReader方法： https://developer.mozilla.org/zh-CN/docs/Web/API/FileReader
    // 读取为base64格式的数据
    fr.readAsDataURL(file);
    fr.onload = function (e) {
      let result = e.target.result
      
      // 如果是zip压缩文件，对后缀进行修改
      let fileData = e.target.result.split(",")[1];
      fileName = fileName || file.name;
      // 如果是图片，都以时间缀进行命名,否则是文件原名
      let isImage = false;
      if((result+"").indexOf("data:image") == 0) {
        let suffix = fileName.split(".")[1];
        fileName = new Date().getTime() + "." + suffix
        isImage = true;
      }
      githubUpload(fileName, fileData,isImage)
    }

}

export { githubUpload, UploadFromFile }