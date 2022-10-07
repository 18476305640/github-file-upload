function isMobile() {
    let flag = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    return flag;
}

$(function() {
    if (isMobile()) {
        // console.log("mobile");
    } else {
        // console.log("pc");
        // 如果是pc ，显示下面的提示内容
        $("#tis2").css({
            "display":"block"
        })
    }
})

