import '../jquery.js'
// 引入配置对象
import configObj from './config.js'
// dns加速
function dns (url) {
  let dnsUrl = configObj.dns || "https://cdn.jsdelivr.net/gh/"
  let delimiter = configObj.branch + "/";
  let start_index = url.indexOf(delimiter);
  let _last_str = url.substring(start_index, url.length)
  let last_str = configObj.userAndRepo + "@" + _last_str
  // 返回加速后的链接
  return dnsUrl + last_str;
}
let githubUpload = function githubUpload (fileName, fileData) {
  console.log(fileName)
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
      navigator.clipboard.writeText(urlFormat(repoUrl, "md")).then(function () {
        console.log('OK，Template copied to clipboard！')
        $("#msg").html($("#msg").html() + "<p style='color:#008040'>② 上传成功了，请查看剪切板！ヾ(^▽^*)))</p>")
        if (repoUrl.indexOf(".zip") < 0) {
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
let toUplog = function toUplog (fileName, fileData) {
  githubUpload(fileName, fileData)
}
export { githubUpload, toUplog }