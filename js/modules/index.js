// 导入配置
import configObj from './config.js'
import '../jquery.js'
import '../utils.js'
$(function () {
  // 回显配置
  (function () {
    $("input[name='token']").val(configObj.token)
    $("input[name='userAndRepo']").val(configObj.userAndRepo)
    $("input[name='branch']").val(configObj.branch)
    $("input[name='path']").val(configObj.path)
    $("input[name='dns']").val(configObj.dns)
  })()
  // 配置的保存
  let configButName = $("#config_control").text()
  let default_config = {

  }
  $("#config_control").click(function () {
    if ($("#config").is(":visible")) {
      $("#config_control").text(configButName)
      // 执行保存配置的操作
      configObj.token = $("input[name='token']").val()
      configObj.userAndRepo = $("input[name='userAndRepo']").val()
      configObj.branch = $("input[name='branch']").val()
      configObj.path = $("input[name='path']").val()
      configObj.dns = $("input[name='dns']").val()
      localStorage.setItem("config", JSON.stringify(configObj));
    } else {
      $("#config_control").text("保存")

    }
    $("#config").slideToggle();
  })
  // 上传扩展到父容器
  $("#choose_img > input[name='content'],#img_pre_show").click(function (event) {
    event.stopPropagation();    //  阻止事件冒泡
  })

  $("#choose_img").click(function () {
    $("#choose_img > input[name='content']").click()
  })

  $('#myFile').on('input', (e) => {
    // 清除上次文件的挂载！！
    window.currentChooseFiles = null;
    var windowURL = window.URL || window.webkitURL;
    var dataURL = windowURL.createObjectURL($('#myFile')[0].files[0]);
    // 将文件对象挂载到window对象上！！
    window.currentChooseFiles = $('#myFile')[0].files;
    if (window.currentChooseFiles[0].type.indexOf("image") == 0) {
      // 上传的是图片
      $('#img_pre_show').attr('src', dataURL)
    } else {
      $('#img_pre_show').attr('src', "img/file.png")
    }
    // 给资源绑定可点击复制的功能
    bindCopy(".resource_box",".copyUrl","href","click");

    $("#upload_hint").hide()
  })

  


})