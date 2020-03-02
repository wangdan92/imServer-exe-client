export default {
  app_name: '即时通讯',
  version: '1.0.1',
  httpUrl: '',
  websocketUrl: '',
  //文件服务器url
  multipartUrl:'',
  //统一请求地址
  getHostUrl: function() {
    //开发环境
    if (process.env.NODE_ENV === 'development') {
     // this.httpUrl = 'http://10.168.2.215:9296/wjw-imServer/'
      this.httpUrl = 'http://60.12.221.6:39015/wjw-imServer/'
    }
    //生产环境
    else {
      this.httpUrl = 'http://60.12.221.6:39015/wjw-imServer/'
     // this.httpUrl = 'http://10.168.2.215:9296/wjw-imServer/'
    }
    return this.httpUrl
  },
  //文件服务器访问路径
  getMultipartUrl: function() {
    if (process.env.NODE_ENV === 'development') {
      this.multipartUrl = 'http://60.12.221.6:39013/multipartPlatform/'
    }else {
      this.multipartUrl = 'http://60.12.221.6:39013/multipartPlatform/'
    }
    return this.multipartUrl
  },
  //获取文件或者头像的网络路径
  getFileUrl:function(){
    return this.multipartUrl +"/getFileFromParam?filePath="
  },
  //获取websocket请求前缀
  getWsUrl: function() {
    if (process.env.NODE_ENV === 'development') {
     // this.websocketUrl = 'ws://10.168.2.215:9296/wjw-imServer/ws'
       this.websocketUrl = 'ws://60.12.221.6:39015/wjw-imServer/ws'
    }else {
      //this.websocketUrl = 'ws://60.12.221.6:39015/wjw-imServer/ws'
        this.websocketUrl = 'ws://10.168.2.215:9296/wjw-imServer/ws'
    }
    return this.websocketUrl
  },
  //登录
  login: function() {
    return this.getHostUrl() + "login";
  },
  loginByTokenUrl:function(){
     return this.getHostUrl()+"/oaLoginByToken";
  },
  //退出登录
  logout: function() {
    return this.getHostUrl() + "logout";
  },
  //获取通讯录好友列表
  getChatUsersUrl: function(param) {
    return this.getHostUrl() + "/imCharGroupUser/listByChatGroupId/"+param;
  },
  //获取聊天信息记录
  getChatGroupHistoryMsgUrl:function(){
    return this.getHostUrl() + "/imChatGroupMessage/listImChatGroupMessage";
  },
  //获取所有群组列表接口
  getAllDepartment:function() {
    return this.getHostUrl()+"/imUser/getAllDepartment";
  },
  //根据部门名称查询部门人员
  getDeptMembersUrl:function(){
    return this.getHostUrl()+"/imUser/getDeptMembers";
  },
  //获取所有人员的列表
  getContactsListUrl:function(){
    return this.getHostUrl()+"/imUser/getContactsList";
  },
 //发起群聊
  buildChatGroupUrl:function(){
    return this.getHostUrl()+"/imCharGroup/addImChatGroup";
  },

  //获取我的信息会话列表
  getMyChatSessionListUrl:function(){
    return this.getHostUrl()+"/immessage/listAllByUserId";
  },
  //获取我的群组列表
  getMyChatGroupListUrl:function(userId){
    return this.getHostUrl()+"/imCharGroupUser/listGroupByUserId/"+userId;
  },

  //重置未读数量
  resetMarkReadUrl:function(){
    return this.getHostUrl()+"/immessage/markRead";
  },
  //获取群组(单聊)详情
  getChatGroupDetailUrl:function(chatGroupId){
    return this.getHostUrl()+"/imCharGroup/detail/"+chatGroupId;
  },
  //获取群组(群组)详情
  getChatGroupMessageInfoByIdUrl:function(){
    return this.getHostUrl()+"/immessage/getGroupInfoById";
  },
  //修改群公告接口
  updateChatGroupNoticeUrl:function(){
    return this.getHostUrl()+"/imCharGroup/updateImChatGroupNotice";
  },
  //修改群名称
  updateChatGroupNameUrl:function(){
    return this.getHostUrl()+"/imCharGroup/updateImChatGroupName";
  },
  //获取用户详情信息
  getUserInfoUrl:function() {
    return this.getHostUrl()+"/imUser/getUserInfoById";
  },
 //修改用户信息
  updateUserInfoUrl:function(){
    return this.getHostUrl()+"/imUser/updateUserInfo";
  },
  //修改用户头像
  updatePhotoPathUrl:function(){
  return this.getHostUrl()+"/imUser/updatePhotoPath";
},
  getSingleChatUrl:function(params) {
    return this.getHostUrl()+"/imCharGroup/singleChat/"+params.userId1+"/"+params.userId2
  },
  //校验信息内容是否包含敏感词
  validateMsgUrl:function() {
    return this.getHostUrl()+"/imChatGroupMessage/validateMsg";
  }
};
