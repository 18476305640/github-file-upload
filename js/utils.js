function urlFormat (url, format = "md", describe = new Date().Format('yyyy-MM-dd')) {
  // 如果是压缩文件
  if (url.indexOf(".zip") >= 0) {
    return url
  }

  switch (format) {
    case "md":
      return `![${describe}](${url})`
      break
    default:
      return url
  }
}