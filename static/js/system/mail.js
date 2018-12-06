//axios默认设置cookie
axios.defaults.withCredentials = true;
var vue = new Vue({
    el: '#app',
    data: function () {
        return {
            //搜索表单
            searchForm: {
                id: "",
                username: "",
            },
            //表数据
            tableData: [],
            allRoles: [],
            //显示加载中样
            loading: false,          
            labelPosition: 'right',
            //多选值
            multipleSelection: [],
            //当前页
            currentPage: 1,
            //分页大小
            pageSize: 10,
            //总记录数
            total: 0,
            //序号
            indexData: 0,
            //详情页是否显示
            itemFormVisible: false,
            //Dialog Title
            dialogTitle: "邮箱编辑",
            //选中的序号
            editIndex: -1,
            //修改界面是否显示
            editFormVisible: false,
            editLoading: false,
            editFormRules: {
                
                username: [
                    { required: false, message: '请输入邮箱地址', trigger: 'blur' },
                    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur,change' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { pattern: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,16}$/, message: '密码应为6-16位字母和数字组合', trigger: 'blur' }
                ]

            },
            //修改界面数据
            editForm: {

                username: "",
                password: "",
                encoding: "",
                host: "",
                port: "",
                protocol: "",
                term: "",
                roles: []

            },
            editFormSelect: [],
            editRoles: [],
            roleDetailVisible: false,
            roleDetailList: [],
            roleDetailSelect: [],
            //操作方式
            operation: "insert",
            //登陆用户
            shiroData: "",
            //修改密码是否显示
            editPasswordShow: false,
            //登陆用户名-旧
            usernameOld: "",
        }
    },
    created: function () {
		/**面包屑 by li.xue 20180628*/
        loadBreadcrumb("邮箱管理", "-1");
        //table高度
        tableheight = tableheight10;
        //登录用户
        this.shiroData = shiroGlobal;
        this.searchClick('click');
    },
    methods: {
        //表格查询事件
        searchClick: function(type) {
            //按钮事件的选择
            if(type == 'page'){
                this.tableData = [];
            }else{
                this.currentPage = 1;
            }
            this.loading = true;//表格重新加载
            var params = {

                username: this.searchForm.username.replace(/%/g,"\\%"),
                pageSize: this.pageSize,
                pageNum: this.currentPage
            }
            //邮箱管理-表格
            axios.post('/xfxhapi/mail/findByVO', params).then(function (res) {
            
                this.tableData = res.data.result;
                this.total = res.data.result.length;
                this.loading = false;

            }.bind(this), function (error) {
                console.log(error)
            })
        },

        //清空查询条件
        clearClick: function () {

            this.searchForm.id = "",
            this.searchForm.username = "",
            this.searchClick('reset');

        },
        //表格勾选事件
        selectionChange: function (val) {
            for (var i = 0; i < val.length; i++) {
                var row = val[i];
            }
            this.multipleSelection = val;
            console.info(val);
        },
      
        //增加、修改时“生日”表单赋值
        dateChangebirthday(val) {
            this.editForm.birth = val;
        },
        //表格重新加载数据
        loadingData: function () {
            var _self = this;
            _self.loading = true;
            setTimeout(function () {
                console.info("加载数据成功");
                _self.loading = false;
            }, 300);
        },
        //查看角色详情
        roleDetails: function(id){
            var _self = this;
            _self.roleDetailVisible = true;
            axios.get('/xfxhapi/role/getRole/' + id).then(function(res){
                this.roleDetailList = res.data.result;
                for(var i=0;i<this.roleDetailList.length;i++){
                    this.roleDetailSelect.push(this.roleDetailList[i].rolename);
                }
            }.bind(this),function(error){
                console.log(error)
            })
        },
        //获取所有的角色
        getAllRoles: function () {
            axios.get('/xfxhapi/role/getAll').then(function (res) {
                this.allRoles = res.data.result;
            }.bind(this), function (error) {
                console.log(error)
            })
        },

        //新增事件
        addClick: function () {
            this.dialogTitle = "邮箱新增";
            this.editPasswordShow = true;
            this.getAllRoles();
            this.editFormVisible = true;
        },
        //表格修改事件
        editClick: function(val, index) {
            this.editIndex = index;
            this.dialogTitle = "邮箱编辑";
            this.editPasswordShow = false;
            this.getAllRoles();
            
            this.editSearch(val);
            this.editFormVisible = true;
        },

        //修改密码
        editPassword: function(){
            var flag = this.editPasswordShow;
            this.editPasswordShow = !flag;
        },

        //修改时查询方法
        editSearch: function(val){
            //获取选择行主键
            var params = {
                uuid: val.uuid
            };
            axios.post('/xfxhapi/mail/findByVO', params).then(function(res) {
                this.editForm = res.data.result[0];
                // this.usernameOld = this.editForm.username;
                // //角色复选框赋值
                // var roles = [];
                // for (var i = 0; i < this.editForm.roles.length; i++) {
                //     roles.push(this.editForm.roles[i].rolename);
                // }
                // this.editForm.roles = roles;       
            }.bind(this), function (error) {
                console.log(error)
            }) 

        },

        //编辑提交点击事件
        editSubmit: function(formName) {
            debugger;
            
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    
                    var val = this.editForm;
                    
                    //角色
                    var roleList = [];
                    for(var i=0;i<val.roles.length;i++){
                        for(var j=0;j<this.allRoles.length;j++){
                            if(val.roles[i] == this.allRoles[j].rolename){
                                var temp = {
                                    roleid : this.allRoles[j].roleid,
                                    rolename: this.allRoles[j].rolename,
                                    roleinfo: this.allRoles[j].roleinfo
                                }
                                roleList.push(temp);
                                break;
                            }
                        }
                    }
                    var params = {
                        username: val.username,
                        password: val.password,
                        // organizationId: organizationIdString,
                        birth: val.birth,
                        sex: val.sex,
                        mobile: val.mobile,
                        email: val.email,
                        roles: roleList,
                        deptid: 'GLYH'
                    }
                    if(this.dialogTitle == "邮箱新增"){
                        axios.get('/xfxhapi/account/getNum/' + this.editForm.username + "/static").then(function(res){
                            if(res.data.result != 0){
                                this.$message({
                                    message: "用户名已存在!",
                                    type: "error"
                                });
                            }else{
                                axios.post('/xfxhapi/user/insertByVO', params).then(function(res){
                                    var addData = res.data.result;
                                    this.tableData.unshift(addData);
                                    this.total = this.tableData.length;
                                }.bind(this),function(error){
                                    console.log(error)
                                })
                                this.editFormVisible = false;
                            }
                        }.bind(this),function(error){
                            console.log(error)
                        })
                    }else if(this.dialogTitle == "邮箱编辑"){
                        params.pkid = val.pkid;
                        params.userid = val.userid;
                        params.alterId = this.shiroData.userid;
                        if(this.editForm.username == this.usernameOld){
                            this.editSubmitUpdateDB(params);
                        }else{
                            axios.get('/xfxhapi/account/getNum/' + this.editForm.username + "/static").then(function(res){
                                if(res.data.result != 0){
                                    this.$message({
                                        message: "用户名已存在",
                                        type: "error"
                                    });
                                }else{
                                   this.editSubmitUpdateDB(params);
                                }
                            }.bind(this),function(error){
                                console.log(error)
                            })
                        }
                    }
                } else {
                    console.log('error save!!');
                    return false;
                }
            });
        },

        //修改方法-update数据库  by li.xue 2018/11/22 15:46
        editSubmitUpdateDB: function(params){
            axios.post('/xfxhapi/user/updateByVO', params).then(function (res){
                var result = res.data.result;
                this.tableData[this.editIndex].username = result.username;
                this.tableData[this.editIndex].organizationName = result.organizationName;
                this.tableData[this.editIndex].birth = result.birth;
                this.tableData[this.editIndex].sex = result.sex;
                this.tableData[this.editIndex].mobile = result.mobile;
                this.tableData[this.editIndex].email = result.email;
                this.tableData[this.editIndex].roles = result.roles;
                this.editFormVisible = false;
            }.bind(this), function (error) {
                console.log(error)
            })
        },

        //获取复选框选中值
        getCheckValue(val){
            this.editFormSelect = val;
        },
        
        //删除所选，批量删除
        removeSelection: function () {
            if (this.multipleSelection.length < 1) {
                this.$message({
                    message: "请至少选中一条记录",
                    type: "warning"
                });
                return;
            }
            this.$confirm('确认删除选中信息?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                axios.post('/xfxhapi/mail/deleteByList', this.multipleSelection).then(function (res) {

                    this.$message({
                        message: "成功删除" + res.data.result + "条用户信息",
                        showClose: true,
                        onClose: this.searchClick('delete')
                    });


                }.bind(this), function (error) {
                    console.log(error)
                })
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                });
            });

        },
        //查看详情
        closeDialog: function (val) {
            this.editFormVisible = false;
            
            this.$refs["editForm"].resetFields();
        },
        //展开 收起
        spread: function(){
            var a = document.getElementById("roleSpread").innerText;  
            if(a == "展开"){
                document.getElementById('roleDiv').style.height='auto';
                document.getElementById("roleSpread").innerText="收起";
            }else if(a == "收起"){
                document.getElementById('roleDiv').style.height='34px';
                document.getElementById("roleSpread").innerText="展开";
            }
        
        },
    },
    
})