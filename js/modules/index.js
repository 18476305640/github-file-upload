// 导入配置
import configObj from './config.js'
import '../jquery.js'
import '../utils.js'

window.PlaceToSelect = function(current_repos = window.tmp_userAndRepo) {
  if(!current_repos) current_repos = JSON.parse(localStorage.getItem("userAndRepo"));
  if(!current_repos || !(current_repos instanceof Array)) return;
  let options = "";
  for (let z = 0; z < current_repos.length; z++) {
    options += `<option value ='${current_repos[z].full_name}' >${current_repos[z].full_name}</option>`
  }
  $("select[name^='userAndRepo']").html("<option value =''>--检验成功，请选择--</option>" + options)
}
$(function () {
  
  // 回显配置
  //回显html前准备
  
  (function () {
    $("input[name='token']").val(configObj.token)
    // 下拉框的数据回显
    let option_nodes = $("select > option")
     //回显userAndRepo时html前准备
    let _userAndRepo = localStorage.getItem("userAndRepo")
    let _config = localStorage.getItem("config")
    if( _userAndRepo || (_config == null) ) {
      $("#userAndRepo_td").html(`
      <select name="userAndRepo">
        <option value ="">--需要检验token--</option>
      </select>
      `);
      PlaceToSelect();
      // 恢复选中
      for(let i = 0; i<option_nodes.length; i++) {
        let option_node = $(option_nodes[i])
        if(option_node.val() == configObj.userAndRepo) {
          option_node.attr("selected",true);
        }
      }
    }else {
      $("#userAndRepo_td").html(`<input type="text" name="userAndRepo" placeholder="请手动输入，比如：“zhuangjie/img-repo”">`)
      $("input[name^='userAndRepo']").val(configObj.userAndRepo)
    }
    $("select[name='userAndRepo']").val(configObj.userAndRepo)
    $("input[name='branch']").val(configObj.branch)
    $("input[name='path']").val(configObj.path)
    $("input[name='dns']").val(configObj.dns)
  })()
  // 配置的保存
  let configButName = $("#config_control").html()
  let default_config = {
  }
  $("#config_control").click(function () {
    if ($("#config").is(":visible")) {
      if(window.tmp_userAndRepo) {
        localStorage.setItem("userAndRepo",JSON.stringify(window.tmp_userAndRepo))
      }
      $("#config_control").html(configButName)
      // 执行保存配置的操作
      configObj.token = $("input[name='token']").val()
      configObj.userAndRepo = $("select[name='userAndRepo']").val() ||  $("input[name='userAndRepo']").val()
      configObj.branch = $("input[name='branch']").val()
      configObj.path = $("input[name='path']").val()
      configObj.dns = $("input[name='dns']").val()
      localStorage.setItem("config", JSON.stringify(configObj));
    } else {
      $("#config_control").html(`<i class="fa fa-floppy-o" aria-hidden="true"></i>&nbsp;&nbsp;保存`)

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
    // 将文件对象挂载到window对象上！！
    window.currentChooseFiles = $('#myFile')[0].files;
    if (window.currentChooseFiles[0].type.indexOf("image") == 0) {
      // 上传的是图片
      var windowURL = window.URL || window.webkitURL;
      var dataURL = windowURL.createObjectURL($('#myFile')[0].files[0]);
      $('#img_pre_show').attr('src', dataURL)
    } else {
      $('#img_pre_show').attr('src', "img/file.svg")
    }
    // 给资源绑定可点击复制的功能
    bindCopy(".resource_box", ".copyUrl", "href", "click");

    $("#upload_hint").hide()
  })

  // 当token输入框失去焦点事件
  $("input[name^='token']").blur(function (e) {
    
    // console.log("失去焦点了")
    let token = $("input[name^='token']").val();
    // 如果没有修改，则不做任何操作
    if(configObj.token == token && window.tmp_userAndRepo != null) return;
    $("#userAndRepo_td").html(`
      <select name="userAndRepo">
        <option value ="">--正在检验中--</option>
      </select>
      `);
    // 是否检验
    window.isCheck = false;
    // 如果超时，将显示输入框形式而不是下拉框
    setTimeout(function() {
      console.log("check",window.isCheck)
      if(window.isCheck) return;
      $("#userAndRepo_td").html(`<input type="text" name="userAndRepo" placeholder="检验超时，请手动输入，比如：“zhuangjie/img-repo”">`)
    },3000)
    // 发起请求
    $.ajax({
      type: 'get',
      url: "https://api.github.com/user/repos",
      headers: {
        'Authorization': 'token ' + token,
        'Accept': 'application/vnd.github+json'
      },
      success(data) {
        console.log("成功")
        let current_repos = []
        for (let i = 0; i < data.length; i++) {
          let item = data[i]
          // 只操作用户创建的
          if (!item.has_issues) continue;
          current_repos.push({
            full_name: item.full_name,
            pushed_at: new Date(item.pushed_at).getTime(),
            default_branch: item.default_branch,
            // avatar_url :item.owner.avatar_url
          })
        }
        // 排序
        for (let j = 0; j < current_repos.length - 1; j++) {
          for (let p = j + 1; p < current_repos.length; p++) {
            if (current_repos[j].pushed_at < current_repos[p].pushed_at) {
              let tmp = current_repos[j]
              current_repos[j] = current_repos[p]
              current_repos[p] = tmp;
            }
          }
        }
        window.tmp_userAndRepo = current_repos
        // 将内容放在下拉框中
        // console.log("排序好的",current_repos)
        PlaceToSelect(current_repos)
        window.isCheck = true

      },
      error(err) {
        console.log("失败")
        console.log(err)
        if (err.status == 401) {
          alert("校验失败，请检查一下token是否填写错误~")
        }
      }

    })

    $("select[name^='userAndRepo']").change(function () {
      let userAndRepo = $("select[name^='userAndRepo']").val();
      let current_repos = window.tmp_userAndRepo
      if(userAndRepo == '' || !(current_repos instanceof Array )) return;
      for (let i = 0; i < current_repos.length; i++) {
        let item = current_repos[i]
        if (item.full_name == userAndRepo) {
          console.log(i, item)
          $("input[name^=branch]").val(item.default_branch)
        }
      }
    })


  })




})