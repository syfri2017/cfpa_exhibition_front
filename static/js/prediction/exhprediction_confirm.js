var pageShzt = '';
// window.onbeforeunload = function () {
//     if (pageShzt != '01' && pageShzt != '03') {
//         return "确认展会报名数据已经提交？未提交的报名数据将会丢失！";
//     }
// }
new Vue({
    el: "#app",
    data: function () {
        return {
            loading: false,
            showPicVisible: false,
            editZwyx: false,
            editPage: true,
            previewImg: '',
            qyid: "",//企业id
            userid: "",
            //企业基本信息
            jbxxData: {
                zwgsmc: '',
                tyshxydm: '',
                yyzzBase64: '',
                yjdz: '',
                frdb: '',
                frdbdh: '',
                lxr: '',
                lxrsj: '',
                cz: '',
                bgdh: '',
                dzyx: '',
                wz: '',
                sjztmc: '',
                shztmc: '',
                cjrmc: '',
                cjsj: '',
                xgrmc: '',
                xgsj: '',
                shrmc: '',
                shsj: ''
            },
            //企业开票信息
            kpxxData: {},
            //企业问卷调查
            wjdcData: {},
            //企业介绍
            qyjsData: {
                logoBase64: '',
                qyjj: ''
            },
            //产品介绍
            cpjsData: [],
            //展位需求意向
            zwyxData: [],
            zwyxForm: [],
            yxzwData:[],
            qqW:'576021001', //火灾预防   576021001
            qqE:'931270355', //灭火救援   931270355
            zwxzzt: '00',//展位选择状态
            sfkqzw: true,//是否开启选展位浮动提示框，（开始选展位开启此变量）
            yxzwxx: '',
            sfkqYxzwzs: false, //是否开启已选展位列表,
            kssj:'2018/12/24 15:15:34',  //展位选择开始时间
            now:''
        }
    },
    created: function () {
        this.getNow()
        var type = getQueryString("type");
        this.shiroData = shiroGlobal;
        this.loading = true;
        this.userid = getQueryString("userid");
        this.getYxzwData();
        this.tishi();
        
    },
    methods: {
        tishi: function(){
            var i=1;
            $(document).ready(function () {
              
               $('#menu-toggle-btn').click(function (e) {
                   
                   var e = document.getElementsByClassName("topScroll"); 
                   if((i%2)==1){
                       e[0].style.width= "calc(100% - 60px)"; 
                       i++;
                   }else{
                       e[0].style.width= "calc(100% - 300px)"; 
                       i++;
                   }
       
               })
           })
        },
        getNow: function(){
            axios.post('/xfxhapi/zwjbxx/getNow').then(function (res) {
                this.now=res.data
            }.bind(this), function (error) {
                console.log(error)
            })
        },
        // 内部特权是打开，否则注释掉
        isInternal: function(){
            axios.post('/xfxhapi/zwjbxx/isInternal').then(function (res) {
                if(res.data){
                    this.sfkqzw = true
                    this.sfkqYxzwzs = true
                    if(this.jbxxData.shzt == '03'&& this.sfkqzw&&this.yxzwData.length<=0){
                        $('#imgDiv').show()
                    }
                }
            }.bind(this), function (error) {
                console.log(error)
            })
        },
        compareDate (d1,d2){
            return ((new Date(d1.replace(/-/g,"\/"))) > (new Date(d2.replace(/-/g,"\/"))));
        },
        //已选展位
        getYxzwData: function () {
            axios.post('/xfxhapi/zwjbxx/getSelectedPos').then(function (res) {
                if (res.data.result.length > 0) {
                    var datas = res.data.result;
                    this.yxzwData=datas
                    var qq=''
                    for(var i=0;i<datas.length;i++){
                        if(i==0){
                            this.yxzwxx+=datas[i].zwh
                            if((datas[i].zwh.indexOf('W1')!= -1
                            ||datas[i].zwh.indexOf('W2')!= -1
                            ||datas[i].zwh.indexOf('W3-A')!= -1)
                            &&qq.indexOf(this.qqW)== -1){
                                qq+=this.qqW
                            }else{
                                if(qq.indexOf(this.qqE)== -1){
                                    qq+=this.qqE
                                }
                            }
                        }else{
                            this.yxzwxx+="，"+datas[i].zwh
                            if((datas[i].zwh.indexOf('W1')!= -1
                            ||datas[i].zwh.indexOf('W2')!= -1
                            ||datas[i].zwh.indexOf('W3-A')!= -1)
                            &&qq.indexOf(this.qqW)== -1){
                                if(qq){
                                    qq+="和"+this.qqW
                                }else{
                                    qq=this.qqW
                                }
                            }else{
                                if(qq.indexOf(this.qqE)== -1){
                                    if(qq){
                                        qq+="和"+this.qqE
                                    }else{
                                        qq=this.qqE
                                    }
                                }
                            }
                        }
                    }
                    if(qq!=''){
                        this.yxzwxx+='，请尽快添加QQ群：'+qq
                    }
                    this.zwxzzt='01'
                    this.sfkqYxzwzs=true
                }
                this.getJbxxData(this.userid);
            }.bind(this), function (error) {
                console.log(error)
            })
        },
        //企业基本信息
        getJbxxData: function (val) {
            this.loading = true;
            var params = {
                userid: this.userid,
                deleteFlag: 'N'
            }
            axios.post('/xfxhapi/qyjbxx/doFindByUserid', params).then(function (res) {
                if (res.data.result != null) {
                    this.jbxxData = res.data.result;
                    this.jbxxData.imageUrl = baseUrl + "/upload/" + this.jbxxData.src;
                    this.jbxxData.yjdz = this.jbxxData.yjdzshengmc + this.jbxxData.yjdzshimc + this.jbxxData.yjdzxx;
                    if (this.jbxxData.sjzt == '01' || this.jbxxData.sjzt == '04') {
                        this.editPage = false;
                    } else {
                        this.editPage = true;
                    }
                    this.qyid = this.jbxxData.qyid;
                    this.getZwyxData(this.qyid);
                    this.getKpxxData(this.qyid);
                    this.getWjdcData(this.qyid);
                    this.getQyjsData(this.qyid);
                    this.getCpjsData(this.qyid);
                    // 内部特权是打开，否则注释掉
                    this.isInternal()
                    // 开启展位选择
                    if(this.compareDate (this.now,this.kssj)){
                        if(this.jbxxData.shzt == '03'&& this.sfkqzw){
                            $('#imgDiv').show()
                        }
                    }
                    pageShzt = this.jbxxData.shzt;
                }
                this.loading = false;
            }.bind(this), function (error) {
                console.log(error)
            })
        },
        //企业开票信息
        getKpxxData: function (val) {
            axios.get('/xfxhapi/qykpxx/' + val).then(function (res) {
                if (res.data.result != null) {
                    this.kpxxData = res.data.result;
                    //统一社会信用代码格式化
                    this.kpxxData.tyshxydm = longNumFormat(this.kpxxData.tyshxydm);
                    //银行账户格式化
                    this.kpxxData.yhzh = longNumFormat(this.kpxxData.yhzh);
                }
            }.bind(this), function (error) {
                console.log(error)
            })
        },
        //企业问卷调查
        getWjdcData: function (val) {
            axios.get('/xfxhapi/qywjdc/' + val).then(function (res) {
                if (res.data.result != null) {
                    this.wjdcData = res.data.result;
                    var tempList = this.wjdcData.reserve1.split(",");
                    var zycp = '';
                    for (var i in tempList) {
                        zycp = zycp + tempList[i].substr(4) + '、';
                    }
                    this.wjdcData.zycp = zycp.substr(0, zycp.length - 1);
                }
            }.bind(this), function (error) {
                console.log(error)
            })
        },
        //企业介绍
        getQyjsData: function (val) {
            axios.get('/xfxhapi/qyjs/doFindQyjsById/' + val).then(function (res) {
                if (res.data.result != null) {
                    this.qyjsData = res.data.result;
                    this.qyjsData.imageUrl = baseUrl + "/upload/" + this.qyjsData.src
                }
            }.bind(this), function (error) {
                console.log(error)
            })
        },
        //产品介绍
        getCpjsData: function (val) {
            var param = {
                qyid: val
            }
            axios.post('/xfxhapi/qycpjs/list', param).then(function (res) {
                if (res.data.result != null) {
                    this.cpjsData = res.data.result;
                    for (var i in this.cpjsData) {
                        this.cpjsData[i].imageUrl = baseUrl + "/upload/" + this.cpjsData[i].src
                    }
                }
            }.bind(this), function (error) {
                console.log(error)
            })
        },
        //展位需求意向
        getZwyxData: function (val) {
            var params = {
                qyid: val,
                deleteFlag: 'N'
            }
            axios.post('/xfxhapi/qyzwyx/list', params).then(function (res) {
                if (res.data.result.length == 0) {
                    this.zwyxData = null;
                } else if (res.data.result.length > 0) {
                    //this.xqyxForm = res.data.result[0];
                    //返回null时不自动带入min值
                    this.zwyxData = res.data.result[0];
                    if (res.data.result[0].bzzwgs != null) {
                        // this.zwyxData.bzzwgs = res.data.result[0].bzzwgs;
                        this.zwyxForm.bzzwgs = res.data.result[0].bzzwgs;
                    }
                    if (res.data.result[0].sngdzw != null) {
                        // this.zwyxData.sngdzw = res.data.result[0].sngdzw;
                        this.zwyxForm.sngdzw = res.data.result[0].sngdzw;
                    }
                    if (res.data.result[0].swgdzw != null) {
                        // this.zwyxData.swgdzw = res.data.result[0].swgdzw;
                        this.zwyxForm.swgdzw = res.data.result[0].swgdzw;
                    }
                }
            }.bind(this), function (error) {
                console.log(error)
            })
        },
        imgPreview: function (val) {
            this.previewImg = val;
            this.showPicVisible = true;
        },
        saveClick: function () {
            if (this.zwyxForm.bzzwgs > 0 || this.zwyxForm.sngdzw > 0 || this.zwyxForm.swgdzw > 0) {
                if (this.zwyxData == null) {//新增
                    var params = {
                        qyid: this.qyid,
                        bzzwgs: this.zwyxForm.bzzwgs,
                        sngdzw: this.zwyxForm.sngdzw,
                        swgdzw: this.zwyxForm.swgdzw,
                        deleteFlag: 'N',
                        cjrid: this.shiroData.userid,
                        cjrmc: this.shiroData.username
                    }
                    axios.post('/xfxhapi/qyzwyx/doInsertByVo', params).then(function (res) {
                        if (res.data.result == 1) {
                            this.$message({
                                message: '成功保存企业参展展位需求意向',
                                type: 'success'
                            });
                            this.getZwyxData(this.qyid);
                            this.editZwyx = false;
                        }
                    }.bind(this), function (error) {
                        console.log(error);
                    })
                } else {//修改
                    var params = {
                        uuid: this.zwyxData.uuid,
                        qyid: this.qyid,
                        bzzwgs: this.zwyxForm.bzzwgs,
                        sngdzw: this.zwyxForm.sngdzw,
                        swgdzw: this.zwyxForm.swgdzw,
                        xgrid: this.shiroData.userid,
                        xgrmc: this.shiroData.username
                    }
                    axios.post('/xfxhapi/qyzwyx/doUpdateByVO', params).then(function (res) {
                        if (res.data.result == 1) {
                            this.$message({
                                message: '成功保存企业参展展位需求意向',
                                type: 'success'
                            });
                            this.getZwyxData(this.qyid);
                            this.editZwyx = false;
                        }
                    }.bind(this), function (error) {
                        console.log(error);
                    })
                }
            } else {
                this.$message({
                    message: '请至少选择一种展位填写需求意向',
                    type: 'warning'
                });
            }
        },
        canclClick: function () {
            var params = {
                userid: this.userid
            }
            loadDivParam("prediction/exhprediction_edit", params);
        },
        submitClick: function () {
            this.$confirm('提交后仅可修改展位意向信息，其他信息不能修改', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                var params = {
                    qyid: this.qyid,
                    sjzt: '03',
                    shzt: '01',
                    xgrid: this.shiroData.userid,
                    xgrmc: this.shiroData.username
                }
                axios.post('/xfxhapi/qyjbxx/doUpdateByVO', params).then(function (res) {
                    if (res.data.result == 1) {
                        this.$message({
                            message: '报名信息已提交待审核',
                            type: 'success'
                        });
                        this.editPage = true;
                        this.jbxxData.shzt = '01';
                        pageShzt = '01';
                    }
                }.bind(this), function (error) {
                    console.log(error);
                })
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消提交'
                });
            });
        },
    }
})
