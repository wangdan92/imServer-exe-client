<template>
    <div>
<!--暴露栏-->
        <div class="search-item1">
            <Input search v-model="searchWords" placeholder="搜索" size="small" class="search1" @on-focus="showSearch()"/>
            <Icon type="ios-add-circle-outline"  class="text-right"  @click="showModal()"></Icon>
        </div>
<!--搜索结果-->
        <div class="search-div" v-show="showSearchDiv"  :loading="searchLoading">
            <!--搜索输入框 @on-keyup="searchChat" -->
            <div class="search-item">
                <Input search v-model="searchWords" placeholder="搜索" size="small" class="search" @on-search="searchChat"/>
            <!--关闭搜索框-->
                <Icon type="ios-close" class="text-right" @click="closeSearchDiv()"></Icon>
            </div>
            <div class="group-box" >
                <ul class="user-list">
                    <li class="user" v-for="chat in searchChatList">
                        <a href="javascript:" @click="showChat(chat)">
                           <!-- <img :src="chat.url" alt="头像">-->
                            <img :src="chat.url==null||chat.url.length<1 ? defaultPhoto:chat.url" alt="头像">
                            <b style="width: 66%; overflow: hidden;text-overflow:ellipsis;white-space: nowrap;">{{ chat.chatGroupName }}</b>
                            <p style="width: 66%; overflow: hidden;text-overflow:ellipsis;white-space: nowrap;">{{ chat.sendName+":"+chat.content }}</p>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
<!--发起群聊的弹窗-->
        <Modal v-model="launchGroupChatModel"  width="650"
               class="user-model"
               :mask-closable="maskClosable"
               :styles="ModalStyle">
            <p slot="header" style="text-align: center">
                <span>发起群聊</span>
            </p>
            <div slot="footer">
                <Button type="primary" size="small"  :disabled="disabled"  @click="launchChatGroup">发起群聊</Button>
                <Button type="warning" size="small"  @click="cancelLaunch">取消</Button>
            </div>
            <Transfer  :data="contactsList"
                       :target-keys="targetKeys"
                       :list-style="listStyle"
                       :titles="titles"
                       :not-found-text="notFoundText"
                       filterable
                       :filter-method="searchMethod"
                       :render-format="myRender"
                       @on-change="handleChange">
                <div :style="{float: 'right', margin: '5px'}">
                    <i-button  size="small" @click="reloadMockData">重置</i-button>
                </div>
            </Transfer>
        </Modal>
  <!--定义群名称的弹窗-->
        <Modal v-model="setGroupName"   :mask-closable="maskClosable">
            <p slot="header" style="text-align: center">
                <span>确定发起群聊?</span>
            </p>
            <Input v-model="newChatGroupName" :autofocus="autoFocus" :maxlength="maxLength"   placeholder="请输入群名称(默认群名称:'群聊')"/>
            <div slot="footer">
                <Button type="primary" size="small"  @click="onOk()">确定</Button>
                <Button type="warning" size="small"  @click="onCancel()">取消</Button>
            </div>
        </Modal>
    </div>
</template>
<script>
  import conf from '../conf';
  import RequestUtils from '../../../utils/RequestUtils';
  const {selfAlert} = require('../../../utils/ChatUtils');
  export default {
    data() {
      return {
        defaultPhoto: '/static/img/defaultPhoto.png',
        currentUser:{},
        requestApi : RequestUtils.getInstance(),
        launchGroupChatModel:false,
        searchWords: '',
        userList: [],
        searchChatList: [],
        showSearchDiv: false,
        searchLoading:false,
        host: conf.getHostUrl(),
       //弹窗相关
        maskClosable:false,  //是否允许点击遮罩层关闭
        disabled:true,     //是否允许拖动
        ModalStyle:{
           top:'30px'
        },
        //穿梭框相关
        contactsList: [],
        targetKeys:  [],
        titles:["通讯录列表","已勾选的人员"],
        notFoundText:'请勾选需要添加的联系人',
        listStyle: {
          width: '250px',
          height: '420px'
        },
        newChatGroupName:"群聊",
        autoFocus:true,
        maxLength:20,
        setGroupName:false,
      };
    },
    methods: {
      /*打开搜索div*/
      showSearch: function() {
        this.search = '';
        this.showSearchDiv = true;
      },
      /*搜索群组*/
      searchChat: function() {
        let that=this;
        that.searchLoading=true;
        console.log("搜索的关键字",that.searchWords);
         let params={"userId":that.currentUser.id,"groupName":that.searchWords};
         that.requestApi.request(conf.getMyChatSessionListUrl(), params).then(res => {
          console.log("搜索结果",res);
          if (res.code==1&&res.data!=null){
              that.searchLoading=false;
              that.searchChatList=res.data;
          } ;
        }).catch(function(error) {
          console.log("搜索群组接口触发异常",error);
        });
        if (that.searchLoading==true){
             setTimeout(function() {
               that.searchLoading=false;;
             },1000)
         } ;
      },
      /*关闭搜索*/
      closeSearchDiv: function() {
        this.showSearchDiv = false;
        this.searchWords="";
        this.searchLoading=false;
        this.searchChatList=[];
      },
      /*向父组件传值*/
      showChat: function(chat) {
        this.showSearchDiv = false;
        this.$emit('showChat', chat);
      },
/**发起群聊的弹窗*/
      /*打开发起群聊的弹窗,并查询所有人员*/
      showModal(){
        //从后台查询所有人员列表
        let that=this;
        let params={"currentUserId":that.currentUser.id};
        that.requestApi.request(conf.getContactsListUrl(), params).then(res => {
         // console.log("通讯录列表",res);
          if (res.code==1&&res.data!=null){
            that.contactsList=res.data;
            that.launchGroupChatModel=true;
          } ;
        }).catch(function(error) {
          console.log("群组列表接口触发异常",error);
        });

      },
      /*取消发起群聊*/
      cancelLaunch(){
        let that=this;
        that.launchGroupChatModel=false;
        that.over();
      },
      /*监听穿梭框的值变化*/
      handleChange (newTargetKeys) {
        this.targetKeys = newTargetKeys;
        if (this.targetKeys.length>0){
            this.disabled=false;
        } ;
      },
      /*渲染穿梭框*/
      myRender (item) {
        let that=this;
        let photo=item.photoPath;
        if (photo==null||photo==undefined||photo.length<1){
           photo=that.defaultPhoto;
        }else{
          photo=conf.getFileUrl()+photo;
        }
        let div="<div style='float:right;display:flex;flex-direction:row;'>" +
          "<img style='width:30px;height:30px;' alt='头像' src='"+photo+"'/>" +
          "<p   style='width:120px;margin-left:20px'>"+item.realName +'-'+ item.departmentName+"</p>" +
          "</div>";
        return div;
      },
      /*穿梭框内的搜索人员*/
      searchMethod(data,query){
          let userObj=data.realName+"-"+data.departmentName;
          return userObj.indexOf(query)>-1;
      },
      /*充值穿梭框*/
      reloadMockData () {
        let that=this;
        that.showModal();
        that.targetKeys=[];
        that.disabled=true;
      },
      //创建群聊
      launchChatGroup(){
        let that=this;
        let userIdArr=that.targetKeys;
        if (userIdArr.length<1){
          selfAlert('请至少选择两位人员发起群聊',null,2,'warning',that);
          return;
        }else{
          that.setGroupName=true;
        }
      },
      //创建完群聊以后查询当前群信息详情
      getChatGroupMessageInfoById(param){
        let that=this;
        that.requestApi.request(conf.getChatGroupMessageInfoByIdUrl(),param).then(res => {
          if (res.code==1&&res.data!=null){
            that.over();
            console.log("发布普通群聊的结果",res.data);
            that.$emit('showChat', res.data);
          }else{
            console.log("发起群聊失败")
          }
        }).catch(function(error) {
          console.log("发起群聊触发异常",error);
        });
      },
      //确定发起群聊
      onOk:function() {
        let that=this;
        selfAlert('正在加载...',null,0,'loading',that);
        let userIdArr=that.targetKeys;
        let userList=[{"userId":that.currentUser.id}];
        for (let i=0;i<userIdArr.length;i++){
          let userId=userIdArr[i];
          userList.push({"userId":parseInt(userId)});
        } ;
        let params={"type":1,"title":"发起群聊","name":that.newChatGroupName,"createId":that.currentUser.id,"userList":userList};
        that.requestApi.request(conf.buildChatGroupUrl(), params).then(res => {
          if (res.code==1&&res.data!=null){
            let chatGroupId=res.data.id;
            let param={"chatGroupId":chatGroupId,"userId":that.currentUser.id,"groupType":1};
            that.getChatGroupMessageInfoById(param);
          } ;
        }).catch(function(error) {
          console.log("创建群聊触发异常",error);
          that.$Message.destroy();
        });
        setTimeout(function() {
          that.$Message.destroy();
        },10000)
      },
      //取消发起群聊
      onCancel:function() {
        let that=this;
        that.over();
      },
      //退出
      over(){
        let that=this;
        that.launchGroupChatModel=false;
        that.setGroupName=false;
        that.targetKeys=[];
        that.disabled=true;
        that.contactsList=[];
        that.newChatGroupName="群聊";
        that.$Message.destroy();
      }
    },
    created: function() {
      let self = this;
      self.currentUser = self.$store.state.user;
    }
  };
</script>
<style lang="scss" scoped>
    @import '../../../../../static/styles/theme';
     .search-item1 {
         margin: 0 0 1rem;
        .search1 {
            width: 16.6rem;
        }
        i {
             color: $color-default;
             font-size: 1.4rem;
             font-weight: bolder;
             float: right;
             padding: 0.5rem;
             &:hover {
                 background-color: $color-gray;
             }
         }
    }
    .search-div {
        position: absolute;
        display: flex;
        flex-direction: column;
        top: 0;
        left: 6rem;
        height: 100%;
        width: 22rem;
        background-color: $color-light-gray;
        z-index: 999999999999999999;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);

        .search-item {
            padding: 1rem;

            i {
                color: $color-default;
                font-size: 1.4rem;
                font-weight: bolder;
                float: right;
                padding: 0.5rem;
                &:hover {
                    background-color: $color-gray;
                }
            }

            .search {
                width: 17.6rem;
            }
        }

        .group-box {
            flex: 1;
            overflow-y: scroll;

            .count {
                color: #aaaaaa;
            }

            li {
                list-style: none;
                position: relative;
                font-size: 1.2rem;
                cursor: pointer;
                font-weight: 200;
                margin-bottom: 2rem;

                h5 {
                    padding: 0.5rem 0;
                    cursor: pointer;
                    font-size: 1.3rem;
                    font-weight: 200;

                    i {
                        vertical-align: baseline;
                    }
                }

                img {
                    width: 4.4rem;
                    height: 4.4rem;
                    position: absolute;
                    top: 0.4rem;
                    left: 2rem;
                }

                b {
                    position: absolute;
                    font-size: 1.3rem;
                    left: 7.5rem;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    font-weight: 600;
                    top: 0.6rem;
                }

                p {
                    position: absolute;
                    left: 7.5rem;
                    bottom: 0.4rem;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    width: 75%;
                    font-size: 1.1rem;
                    color: #aaaaaa;
                }
            }

            .user {
                height: 5.2rem;
                position: relative;
                a {
                    display: block;
                    width: 100%;
                    height: 100%;
                    color: $color-default;
                    position: relative;

                    i {
                        display: inline-block;
                        width: 1.8rem;
                        height: 1.6rem;
                        background-color: #ff0000;
                        border-radius: 50%;
                        color: $color-write;
                        text-align: center;
                        font-style: normal;
                        position: absolute;
                        left: 1rem;
                        top: 0;
                        z-index: 99999999999;
                    }
                }

                &:hover {
                    background-color: $color-gray !important;

                    & > i {
                        color: $color-default;
                        background-color: $color-write;
                    }
                }

                .active {
                    background-color: $color-gray !important;
                }

                & > i {
                    position: absolute;
                    right: 1rem;
                    bottom: 1.6rem;
                    cursor: pointer;
                    border-radius: 50%;
                    padding: 0.2rem;
                    text-align: center;
                    color: $color-light-gray;

                    &:hover {
                        color: $color-default;
                        background-color: $color-write;
                    }
                }
            }
        }
    }

    /* 重新覆盖iview 里面的 model 小于768px 时候 宽度变100% 的问题 */
    @media (max-width: 768px) {
        .user-model {
            .ivu-modal {
                width: 30rem !important;
                margin: 0 auto;
            }
        }
    }
</style>
