var pageShzt = '';

new Vue({
    el: "#app",
    data: function () {
        return {
            loading: false,
            showPicVisible: false,
            previewImg: '',
            qyid: "",//企业id
            userid: "",
            //产品介绍
            cpjsData: [],
            //产品所属分类
            cpssfl_data: [],
            //要删除的图片路径list
            delPicList:[],
            //未保存的图片路径list
            unsavedPicList:[],
             //树结构配置
            defaultProps: {
                children: 'children',
                label: 'codeName',
                value: 'codeValue'
            },
            //编辑（新增）页面对话框标题
            dialogTitle: "Edit Product",
            //编辑页面显示flag
            editFormVisible: false,
            //产品图片上传参数
            CpjsUpLoadData:{
                qyid:'',
            },
            //修改界面数据
            editForm: {
                uuid:'',
                cplx:[],
                cpjj:'',
                reserve1:'',
                src:'',
                imageUrl:''
            },
            //表单验证
            editFormRules: {
                cplx: [
                    { required: true, message: 'Category of the Product is required', trigger: 'change' }
                ],
                cpjj: [
                    { required: true, message: 'Product Introduction is required', trigger: 'blur' },
                    { pattern: /^[\da-zA-Z \!\?\r\n\|\<\>\.\,\，\;\:\'\"\@\#\$\￥\=\+\_\—\%\^\&\*\(\)\（\）\[\]\{\}\\\/\~\`\-\。\·\…\！\、\“\”\‘\’\《\》\<\>\【\】\：\；\？]*$/, message: 'Characters and Symbols only',trigger: 'blur' },
                   // { pattern: /^[A-Za-z0-9 ]+$/, message: 'Characters and number and blank only',trigger: 'blur' },
                    { min: 1, max: 300, message: 'less than 300 characters', trigger: 'blur' }
                ]
            },
        }
    },
    created: function () {
        loadBreadcrumb("Product Introduction", "-1");
        this.shiroData = shiroGlobal;
        this.loading = true;
        this.userid = this.shiroData.userid;
        this.getJbxxData(this.userid);
        //查询产品所属分类
        this.getCpssfl();
    },
    methods: {
        //根据代码集获取产品所属分类
        getCpssfl: function(){
            axios.get('/xfxhapi/codelist/getDzlxTree/CPLX_EN').then(function (res) {
                this.cpssfl_data = res.data.result;
            }.bind(this), function (error) {
                console.log(error);
            })
        },
        //根据userid查询qyid
        getJbxxData: function (val) {
            this.loading = true;
            var params = {
                userid: this.userid,
                deleteFlag: 'N'
            }
            axios.post('/xfxhapi/qyjbxx/doFindByUserid', params).then(function (res) {
                if (res.data.result != null) {
                    this.qyid = res.data.result.qyid;
                    this.CpjsUpLoadData.qyid = res.data.result.qyid;
                    this.getCpjsData(this.qyid);
                }
                this.loading = false;
            }.bind(this), function (error) {
                console.log(error)
            })
        },
        //查询产品介绍
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
        //图片预览
        imgPreview: function (val) {
            this.previewImg = val;
            this.showPicVisible = true;
        },
        //产品图片change
        CpPicsChange: function (file,fileList) {
            var fileName = file.name.lastIndexOf(".");//取到文件名开始到最后一个点的长度
            var fileNameLength = file.name.length;//取到文件名长度
            var fileFormat = file.name.substring(fileName + 1, fileNameLength);
            const isPng = fileFormat.toLowerCase() == "png";
            const isJpg = fileFormat.toLowerCase() == "jpg";
            const isLt2M = file.size / 1024 /1024 <= 2; 
            if(!isPng && !isJpg){
                this.$message.error('Picture has to be endswith png or jpg');
                fileList.splice(-1, 1);
            }else if(!isLt2M){
                this.$message.error('Picture has to be less than 2MB!');
                fileList.splice(-1, 1);
            }else{
                //this.delPicList.push(this.delPicSrc);
                this.delPicList.push(this.editForm.src);
            }
        },
         //产品图片上传成功回调方法
        cpjsPicSuccess: function (res, file) {
            this.editForm.src = res.src;
            this.editForm.imageUrl = URL.createObjectURL(file.raw);
            this.unsavedPicList.push(res.src);
        },
        //点击编辑按钮
        editClick: function(val){
            this.dialogTitle= "Edit Product";
            //产品类型准换成级联下拉数组
            var cplxArray = [];
            cplxArray.push(val.cplx.substr(0, 1) + "000");
            cplxArray.push(val.cplx);
            //向form赋值
            this.editForm.uuid = val.uuid;
            this.editForm.cplx = cplxArray;
            this.editForm.cpjj = val.cpjj;
            this.editForm.reserve1 = val.reserve1;
            this.editForm.src = val.src;
            this.editForm.imageUrl = val.imageUrl;
            //显示编辑页面
            this.editFormVisible = true;
        },
        //点击删除按钮
        deleteClick: function(val){
            if(this.cpjsData.length <= 1){
                this.$message({
                    type: 'error',
                    message: 'Please fill out at least one product example'
                  });
            }else{
                this.$confirm('Do you confirm deletion?', 'Warning', {
                confirmButtonText: 'Delete',
                cancelButtonText: 'Cancel',
                type: 'warning'
              }).then(() => {
                axios.post('/xfxhapi/qycpjs/doDeleteCpxx', val).then(function (res) {
                    this.$message({
                        type: 'success',
                        message: 'deleted successfully!'
                    });
                    //删除图片
                    var list = [];
                    list.push(val.src);
                    axios.post('/xfxhapi/qycpjs/delPic',list).then(function (res) {
                        this.delPicList = [];
                    }.bind(this), function (error) {
                        console.log(error);
                    })
                    //刷新产品列表
                    this.getCpjsData(this.qyid);
                }.bind(this), function (error) {
                    console.log(error)
                })
                
              }).catch(() => {
                this.$message({
                  type: 'info',
                  message: 'Delete canceled!'
                });          
              });
            }
        },
        //新增
        addClick: function(){
            if(this.cpjsData.length<6){
                this.dialogTitle= "Add Product";
                this.editFormVisible = true;
            }else{
                this.$message({
                    message: 'You can add at most 6 product Examples',
                    type: 'warning'
                });
            }
            
        },
        //删除delPicList中的图片
        deletePic: function(){
            if(this.delPicList.length>0){
                axios.post('/xfxhapi/qycpjs/delPic',this.delPicList).then(function (res) {
                    this.delPicList = [];
                }.bind(this), function (error) {
                    console.log(error);
                })
            }
        },
        //关闭编辑对话框
        closeDialog: function (val) {
            //删除上传但未保存的图片
            if(this.unsavedPicList.length>0){
                axios.post('/xfxhapi/qycpjs/delPic',this.unsavedPicList).then(function (res) {
                    this.unsavedPicList = [];
                }.bind(this), function (error) {
                    console.log(error);
                })
            }
            //清空delPicList
            this.delPicList = [];
            //清空editForm
            this.editForm= {
                uuid:'',
                cplx:[],
                cpjj:'',
                reserve1:'',
                src:'',
                imageUrl:''
            };
            //编辑页隐藏
            this.editFormVisible = false;
            //重置校验
            this.$refs["editForm"].resetFields();
        },
        //提交
        editSubmit: function(val){
            this.$refs["editForm"].validate((valid) => {
                if (valid) {
                    if(this.editForm.src == null || this.editForm.src == ""){
                        this.$message({
                            message: 'Product Photo is required',
                            type: 'warning'
                        });
                        console.log('error submit!!');
                        return false;
                    }else{
                        if(val.uuid != null && val.uuid != ""){//编辑
                            var params = {
                                uuid:this.editForm.uuid,
                                cplx:this.editForm.cplx[this.editForm.cplx.length -1],
                                cpjj:this.editForm.cpjj,
                                reserve1:this.editForm.reserve1,
                                src:this.editForm.src,
                                xgrid: this.shiroData.userid,
                                xgrmc: this.shiroData.username
                            }
                            axios.post('/xfxhapi/qycpjs/doUpdateByVO', params).then(function (res) {
                                if (res.data.result > 0) {
                                    this.$message({
                                        message: 'Save successful',
                                        type: 'success'
                                    });
                                    this.deletePic();
                                }else{
                                    this.$message({
                                        message: 'Save failed',
                                        type: 'warning'
                                    });
                                }
                                //清空unsavedPicList
                                this.unsavedPicList = [];
                                //清空delPicList
                                this.delPicList = [];
                                //关闭对话框
                                this.closeDialog(this.editForm);
                                //刷新产品列表
                                this.getCpjsData(this.qyid);
                            }.bind(this), function (error) {
                                console.log(error);
                            })
                        }else{//新增
                            var params = {
                                qyid:this.qyid,
                                cplx:this.editForm.cplx[this.editForm.cplx.length -1],
                                cpjj:this.editForm.cpjj,
                                reserve1:this.editForm.reserve1,
                                src:this.editForm.src,
                                cjrid: this.shiroData.userid,
                                cjrmc: this.shiroData.username
                            }
                            axios.post('/xfxhapi/qycpjs/doInsertCpxx', params).then(function (res) {
                                if (res.data.result > 0) {
                                    this.$message({
                                        message: 'Save successful',
                                        type: 'success'
                                    });
                                    this.deletePic();
                                }else{
                                    this.$message({
                                        message: 'Save failed',
                                        type: 'warning'
                                    });
                                }
                                //清空unsavedPicList
                                this.unsavedPicList = [];
                                //清空delPicList
                                this.delPicList = [];
                                //关闭对话框
                                this.closeDialog(this.editForm);
                                //刷新产品列表
                                this.getCpjsData(this.qyid);
                            }.bind(this), function (error) {
                                console.log(error);
                            })
                        }
                    }
                    
                } else {
                  console.log('error submit!!');
                  return false;
                }
            });
            
        },
        //剩余多少个字
        checkWord:function(text,name,maxlength){
            var length = text.length;
            var curr = maxlength - length;
            var ele =  document.getElementById(name);
            if(ele != null){
                document.getElementById(name).innerHTML=curr.toString();
            }
        },
    }
})
