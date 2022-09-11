// 引入要使用的函数
import { githubUpload, toUplog } from './upload.js'
// 引入 jquery 
import '../jquery.js'
// 第一种触发方式： 点击“上传”
$("#img_pre_show").click(function () {
  if (window.FileReader) {
    var reader = new FileReader();
  } else {
    console.log('你的浏览器不支持读取文件');
  }
  var myFile = document.querySelector('#myFile');
  var file = myFile.files[0];
  reader.readAsDataURL(file);
  reader.onload = function (data) {
    let namePath = $("#myFile").val()
    let fileData = data.currentTarget.result.split(",")[1];
    let fileName = namePath.substring(namePath.lastIndexOf("\\") + 1, namePath.length).trim()
    toUplog(fileName, fileData);
  };
  reader.onerror = function () {
    console.log('读取失败');
    console.log(reader.error);
  }


})
// 第二种触发: 粘贴动作
document.addEventListener('paste', function (e) {
  var cbd = e.clipboardData;
  var fr = new FileReader();
  for (var i = 0; i < cbd.items.length; i++) {
    var item = cbd.items[i];
    if (item.kind == "file") {
      var blob = item.getAsFile();
      if (blob.size === 0) {
        return;
      }
      fr.readAsDataURL(blob);
      fr.onload = function (e) {
        let result = e.target.result
        console.log("result", result)
        let suffix = result.split("/")[1].split(";")[0]
        suffix = suffix.indexOf("zip") >= 0 ? "zip" : suffix
        // 如果是zip压缩文件，对后缀进行修改
        let fileData = e.target.result.split(",")[1];
        let fileName = new Date().getTime() + "." + suffix
        toUplog(fileName, fileData)
      }
    }
  }
});
