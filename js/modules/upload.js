//configObj
let configObj = {
  token: "",
  userAndRepo: "",
  branch: "",
  path: "",
  ...JSON.parse(localStorage.getItem("config")) // 加载配置
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
      let repoUrl = data.content.download_url

      // 将内容写到剪切板
      navigator.clipboard.writeText(urlFormat(repoUrl, "md", fileName)).then(function () {
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
let toUplog = function toUplog (fileName = new Date().getTime(), fileData) {
  githubUpload(fileName, fileData)
}
export { githubUpload, toUplog }