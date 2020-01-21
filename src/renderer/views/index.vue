<template>
    <div class="v-im">
        <div class="left-bar" style="-webkit-app-region: drag">
            <ul>
                <!--tab导航页-->
                <li class="userPhoto" @click="modal = true">
                    <img :src="urlPrefix+currentUser.photoPath"  :alt="currentUser.photoPath"/>
                </li>
                <!--聊天窗口-->
                <li>
                    <router-link v-bind:to="'/index/chatBox'">
                        <Icon type="ios-text-outline"/>
                    </router-link>
                </li>
                <!--通讯录窗口-->
                <li>
                    <router-link v-bind:to="'/index/userBox'">
                        <Icon type="ios-contact-outline"/>
                    </router-link>
                </li>
                <!--聊天列表-->
                <li>
                    <router-link v-bind:to="'/index/chatGroupBox'">
                        <Icon type="ios-contacts-outline"/>
                    </router-link>
                </li>
            </ul>
        </div>
        <!--路由界面-->
        <keep-alive>
            <router-view class="content" v-if="isRouterAlive"/>
        </keep-alive>
        <!--弹出层-->
        <Modal closable class="user-model" v-model="modal"
               footer-hide :title="currentUser.name" width="300">
            <p class="user-model-img">
                <img :src="urlPrefix+currentUser.photoPath"
                     width="150px"
                     height="150px"
                     alt="头像"
                     class="img"
                     v-show="isUpload==false"/>
                <Progress v-show="isUpload" :percent="percent" :stroke-width="20" status="active" text-inside />
                <!--上传图片组件-->
                <Upload :action="action" name="fileName"
                        :format="imgFormat"
                        :data="tokenImg"
                        :show-upload-list="showUploadList"
                        :headers="headers"
                        :max-size="imgMaxSize"
                        :with-credentials="cookieAuth"
                        :before-upload="beforeUpload"
                        :on-progress="handleStart"
                        :on-format-error="handleFormatError"
                        :on-exceeded-size="handleImgMaxSize"
                        :on-success="handleSuccess"
                        :on-error="handleError">
                    <Button size="small" icon="ios-cloud-upload-outline" shape="circle" type="primary">更新</Button>
                </Upload>
            </p>
            <p class="user-model-item">
                <label>姓名：</label>
                <span>{{currentUser.realName}}</span>
            </p>
            <p class="user-model-item">
                <label>手机：</label>
                <span>{{currentUser.mobile}}</span>
            </p>
            <p class="user-model-item">
                <label>邮箱：</label>
                <span>{{currentUser.email}}</span>
            </p>
            <p>
                <Button type="error" long @click="myLogout">退出</Button>
            </p>
        </Modal>
    </div>
</template>
<script>
  import { logout,ChatListUtils,selfAlert } from '../utils/ChatUtils';
  import RequestUtils from '../utils/RequestUtils';
  import conf from './im/conf/index';
  import StoreUtils from '../utils/StoreUtils';
  export default {
    data() {
      return {
        isRouterAlive:true,
        urlPrefix:conf.getFileUrl(),
        currentUser: {},//当前用户信息
        modal: false ,  //是否显示弹窗层
        defaultPhoto: '/static/img/defaultPhoto.png',
        //上传头像相关
        isUpload:false,
        percent:0,
        //上传的地址，必填
        action: conf.getMultipartUrl() + 'upload',
        imgFormat: ['jpg', 'jpeg', 'png', 'gif'],
        //上传图片时附带的额外参数
        tokenImg: {
          access_token: StoreUtils.getToken(),
          type: 'image'
        },
        //是否显示已上传文件列表
        showUploadList:false,
        //设置上传的请求头部
        headers: {
          'Access-Control-Allow-Origin': '*',
          'token': StoreUtils.getToken()
        },
        //图片最大限制，单位 kb
        imgMaxSize:5120,
        cookieAuth:true,
      };
    },
    //当前用户
  /*  computed: {
      currentUser:{
        get: function() {
          return this.$store.state.user;
        },
        set: function(currentUser) {
          this.$store.commit('setUser', currentUser);
        }
      }
    },*/
    methods: {
      //上传头像相关
      //上传文件之前的钩子，参数为上传的文件，若返回 false 或者 Promise 则停止上传
      beforeUpload(file) {
        console.log("上传文件之前的钩子",file);
        this.isUpload=true;
        this.tokenImg = {
          access_token: StoreUtils.getToken(),
          type: 'image'
        };
        this.tokenFile = {
          access_token: StoreUtils.getToken(),
          type: 'file'
        };
        return new Promise(resolve => {
          this.$nextTick(function() {
            resolve(true);
          });
        });
      },
      //文件上传时的钩子，返回字段为 event, file, fileList
      handleStart(event,file) {
        this.percent=event.percent;
      },
      //文件格式验证失败时的钩子，返回字段为 file, fileList
      handleFormatError(file) {
        let that=this;
        that.isUpload=false;
        selfAlert('文件 ' + file.name + ' 格式不正确。',null,2,'warning',that);
      },
      //上传的图片超出指定大小
      handleImgMaxSize(file) {
        let that=this;
        that.isUpload=false;
        selfAlert('图片 ' + file.name + ' 太大，不能超过 512K！',null,2,'warning',that);
      },
      //文件上传成功时的钩子，返回字段为 response, file, fileList
      handleSuccess(res, file) {
        let that = this;
        that.isUpload=false;
        if (res.code === 1) {
          let path =res.data;
          let newUser=JSON.parse(JSON.stringify(that.currentUser));
          newUser.photoPath=path;
          that.updatePhotoPath(newUser);
        } else {
          selfAlert('图片 ' + file.name + ' 太大，不能超过 512K！',null,2,'error',that);
        }
      },
      //文件上传失败时的钩子，返回字段为 error, file, fileList
      handleError: function(error) {
        console.log("上传触发异常",error);
        this.isUpload=false;
        selfAlert("上传错误",null,2,'error',this);
      },
      //修改用户头像
      updatePhotoPath:function(newUser){
         let that=this;
         if (newUser!=null&&newUser.id!=undefined){
           let requestApi = RequestUtils.getInstance();
           requestApi.request(conf.updatePhotoPathUrl(), newUser).then(res => {
             if (res.code==1){
               //退出聊天
               console.log("修改用户头像成功");
               StoreUtils.setUser(newUser);
               that.$store.commit("setUser",newUser);
               that.currentUser=newUser;
               that.isRouterAlive = false;
               that.$nextTick(function () {
                 that.isRouterAlive = true;
               })
               return;
             } ;
           });
         } ;
      },
      //退出登录
      myLogout() {
        let self = this;
        RequestUtils.getInstance().request(conf.logout()).then(res => {
              if (res.code==1){
                //退出聊天
                logout(self);
              } ;
          });
      },
    },
    created: function() {
     console.log("index.vue >>>create");
      let that=this;
      let currentUser= this.$store.state.user;
      that.currentUser=currentUser;
      that.urlPrefix=conf.getFileUrl();
    },
    mounted: function() {

    }
  };
</script>
<style lang="scss">
    @import '../../../static/styles/theme.scss';
    @import '../../../static/styles/v-im.scss';

    .v-im {
        display: flex;
        flex-direction: row;

        .left-bar {
            background-color: #1c2438;
            width: 6rem;
            height: 100%;

            ul {
                margin: 3rem 1.2rem 1.2rem 1.2rem;
                list-style: none;

                li {
                    -webkit-app-region: no-drag;
                    display: block;
                    width: 3.6rem;
                    height: 3.6rem;
                    text-align: center;
                    margin-bottom: 2rem;
                    cursor: pointer;

                    .ivu-icon {
                        font-size: 3rem !important;
                        color: $color-default;
                        margin: 0.3rem;
                        cursor: pointer;

                        &:hover {
                            color: $color-write;
                        }
                    }

                    .router-link-active {
                        .ivu-icon {
                            color: $color-write;
                        }
                    }
                }

                .userPhoto {
                    margin-bottom: 2rem;

                    img {
                        width: 3.6rem;
                        height: 3.6rem;
                    }
                }
            }
        }

        .content {
            flex: 1;
        }
    }
</style>
