// 引入要使用的函数
import { githubUpload,UploadFromFile } from './upload.js'
// 引入 jquery 
import '../jquery.js'






// 【第一种】触发方式： 点击选择“上传”
$('#myFile').on('input', (e) => {
  // 清除上次文件的挂载！！
  window.currentChooseFiles = null;
  // 将文件对象挂载到window对象上！！
  window.currentChooseFiles = $('#myFile')[0].files;
  if (window.currentChooseFiles[0].type.indexOf("image") == 0) {
    // 上传的是图片
    var windowURL = window.URL || window.webkitURL;
    var dataURL = windowURL.createObjectURL($('#myFile')[0].files[0]);
    $('#img_pre_show').attr('src', dataURL)
    $('#img_pre_show').attr('isImg', "1")

  } else {
    $('#img_pre_show').attr('src', "img/file.svg")
    $('#img_pre_show').attr('isImg', "0")
  }
  
  // 让图片显示
  $('#img_pre_show').css({
    "display":"block"
  })
  // 给资源绑定可点击复制的功能
  bindCopy(".resource_box", ".copyUrl", "href", "click");

  $("#upload_hint").hide()
})
// 点击图片进行上传时触发
$("#img_pre_show").click(function () {
  let files = window.currentChooseFiles;
  if(files == null || files.length == 0) return;
  
  for(let i = 0; i < files.length; i++) {
    let file = files[i];
    console.log(file)
    UploadFromFile(file);
  }

})
// 【第二种】粘贴动作方式
document.addEventListener('paste', function (e) {
  var files = e.clipboardData.items;
  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    UploadFromFile(file);
  }
});

// 【第三种】拖拽方式
$("#choose_img")[0].addEventListener("dragover", function (e) {
  e.preventDefault();
  e.stopPropagation();
}, false);
$("#choose_img")[0].addEventListener("drop", function (e) {
  // 处理拖拽文件的逻辑
  e.preventDefault();
  e.stopPropagation();
  var df = e.dataTransfer;
  if (df.items !== undefined) {
    // Chrome拖拽文件逻辑
    let files = df.files
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      console.log("=>",file)
      UploadFromFile(file);
    }
  }
}, false)

// 【第四种-开发中】触发: 粘贴资源URL动作
document.addEventListener('paste', function (e) {
  var files = e.clipboardData.items;
  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    if(file.kind != "string") continue;
    file.getAsString(function (sourceUrl){
      if(sourceUrl.indexOf("http") != 0) return;
      console.log("*** 是http链接")
      alert("暂不支持图片链接上传~")
    });
  }
});
