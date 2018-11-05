//axios默认设置cookie
axios.defaults.withCredentials = true;
var vue = new Vue({
    el: '#app',
    data: function () {
        return {
            //菜单选中
            activeIndex: '',
            visible: false,
            //搜索表单
            searchForm: {
                codetype: "",
                codetypeName: "",
                createTime:new Array()
            },
            tableData: [],
            //显示加载中样
            loading: false,
            //多选值
            multipleSelection: [],
            //当前页
            currentPage: 1,
            //分页大小
            pageSize: 10,
            //总记录数
            total: 10,
            //新建页面是否显示
            addFormVisible: false,
            addFormRules: {
                codetype: [
                    { required: true, message: "请输入代码集类型", trigger: "blur" },
                    { pattern: /^[0-9A-Za-z]{2,50}$/, message: '代码集类型应为2-50位字母、数字', trigger: 'blur' },
                ],
                codetypeName: [{ required: true, message: "请输入代码集类型名称", trigger: "blur" }]
            },
            //新建数据
            addForm: {
                codetype: "",
                codetypeName: "",
                remark: "",
                language: "zh_CN"
            },
            //选中的序号
            selectIndex: -1,
            //修改界面表单值是否发生改变
            editFormFlag: false,
            //修改界面是否显示
            editFormVisible: false,
            editFormRules: {
                codetype: [
                    { required: true, message: "请输入代码集类型", trigger: "blur" },
                    { pattern: /^[0-9A-Za-z]{2,50}$/, message: '代码集类型应为2-50位字母、数字', trigger: 'blur' },
                ],
                codetypeName: [{ required: true, message: "请输入代码集类型名称", trigger: "blur" }]
            },
            //修改界面数据
            editForm: {
                codetype: "",
                codetypeName: "",
                remark: "",
                language: ""
            }
        }
    },
    //表单值变化验证
    watch: {
        editForm: function (val) {
            this.editFormFlag = true;
        },
        deep: true
    },
    created: function () {
        /**面包屑 by li.xue 20180628*/
        loadBreadcrumb("代码集管理", "-1");
        //table高度
        tableheight = tableheight10;
        this.searchClick('click');
    },
    methods: {
        handleNodeClick(data) {
        },
        
        //日期控件变化时格式化
        dateChange(val) {
            this.searchForm.createTime.splice(0,this.searchForm.createTime.length);
            this.searchForm.createTime.push(val.substring(0,val.indexOf("至")));
            this.searchForm.createTime.push(val.substring(val.indexOf("至")+1));
        },

        codetypeCilck: function (val) {
            var params = {
                codeid: val.codeid
            }
            loadDivParam("system/codelist_detail", params);
            //window.location.assign("/templates/system/codelist_detail.html?codeid=" + val.codeid+"&index="+this.activeIndex);
        },

        //查询，初始化
        searchClick: function(type) {
            //按钮事件的选择
            if(type == 'page'){
                this.tableData = [];     
            }else{
                this.currentPage = 1;
            }
            var _self = this;
            _self.loading = true;//表格重新加载
            var params = {
                codetype: this.searchForm.codetype,
                codetypeName: this.searchForm.codetypeName,
                createTimeBegin: this.searchForm.createTime[0],
                createTimeEnd: this.searchForm.createTime[1],
                pageSize: this.pageSize,
                pageNum: this.currentPage
            };
            axios.post('/xfxhapi/codelist/findByVO', params).then(function (res) {
                var tableTemp = new Array((this.currentPage-1)*this.pageSize);
                this.tableData = tableTemp.concat(res.data.result.list);
                this.total = res.data.result.total;
                _self.loading = false;
            }.bind(this), function (error) {
                console.log(error)
            })
        },

        //表格勾选事件
        selectionChange: function (val) {
            this.multipleSelection = val;
        },

        //表格重新加载数据
        loadingData: function () {
            var _self = this;
            _self.loading = true;
            setTimeout(function () {
                _self.loading = false;
            }, 300);
        },

        //新建：弹出Dialog
        addClick: function () {
            var _self = this;
            _self.addFormVisible = true;
        },

        //新建：保存
        addSubmit: function (val) {
            if(this.addForm.codetype=="" || this.addForm.codetype==null) {
                this.$message.warning({
                    message: '请输入代码集类型！',
                    showClose: true
                });
                return false;
            }else if(this.addForm.codetypeName=="" || this.addForm.codetypeName==null){
                this.$message.warning({
                    message: '请输入代码集类型名称！',
                    showClose: true
                });
                return false;
            }else{
                var _self = this;
                axios.get('/xfxhapi/codelist/getNum/' + this.addForm.codetype).then(function (res) {
                    if (res.data.result != 0) {
                        _self.$message({
                            message: "代码集类型已存在!",
                            type: "error"
                        });
                    } else {
                        var params = {
                            codetype: val.codetype.trim(),
                            codetypeName: val.codetypeName.trim(),
                            remark: val.remark.trim()
                        }
                        axios.post('/xfxhapi/codelist/insertByVO', params).then(function (res) {
                            var addData = res.data.result;
                            addData.createTime = new Date();
                            _self.tableData.unshift(addData);
                            _self.total = _self.tableData.length;
                            this.$message({
                                message: "代码集新增成功！",
                                type: "success"
                            });
                        }.bind(this), function (error) {
                            console.log(error)
                        })
                        this.addFormVisible = false;
                        _self.loadingData();//重新加载数据
                    }
                }.bind(this), function (error) {
                    console.log(error)
                })
            }
        },

        //修改：弹出Dialog
        editClick: function(val) {
            var _self = this;
            var codeid = val.codeid;

            //获取选择的行号
            for (var k = 0; k < _self.tableData.length; k++) {
                if (_self.tableData[k].codeid == codeid) {
                    _self.selectIndex = k;
                }
            }

            //直接从table中取值放在form表单中
            this.editForm = Object.assign({}, _self.tableData[_self.selectIndex]);
            this.editFormVisible = true;
            this.editFormFlag = false;
        },

        //修改：保存
        editSubmit: function (val) {
            if(this.editForm.codetype=="" || this.editForm.codetype==null) {
                this.$message.warning({
                    message: '请输入代码集类型！',
                    showClose: true
                });
                return false;
            }else if(this.editForm.codetypeName=="" || this.editForm.codetypeName==null){
                this.$message.warning({
                    message: '请输入代码集类型名称！',
                    showClose: true
                });
                return false;
            }else{
                var _self = this;
                if (this.editFormFlag) {
                    var params = {
                        codeid: val.codeid,
                        codetype: val.codetype.trim(),
                        codetypeName: val.codetypeName.trim(),
                        remark: val.remark,
                        language: val.language
                    };
                    axios.post('/xfxhapi/codelist/updateByVO', params).then(function (res) {
                        this.tableData[this.selectIndex].codetype = res.data.result.codetype;
                        this.tableData[this.selectIndex].codetypeName = res.data.result.codetypeName;
                        this.tableData[this.selectIndex].remark = res.data.result.remark;
                        this.tableData[this.selectIndex].language = res.data.result.language;
                        this.tableData[this.selectIndex].alterName = res.data.result.alterName;
                        this.tableData[this.selectIndex].alterTime = new Date();
                        this.$message({
                            message: "代码集编辑成功！",
                            type: "success"
                        });
                    }.bind(this), function (error) {
                        console.log(error)
                    })
                    this.editFormVisible = false;
                    this.editFormFlag = false;
                }else {
                    this.$message({
                        message: "数据未发生改动",
                        type: "error"
                    });
                    return;
                }
            }
        },

        //删除:批量删除
        removeSelection: function(){
            this.$confirm('确认删除选中信息?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                axios.post('/xfxhapi/codelist/deleteByIds', this.multipleSelection).then(function (res) {
                    this.$message({
                        message: "成功删除" + res.data.result + "条代码集信息",
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

        closeDialog: function (val) {
            this.addFormVisible = false;
            this.editFormVisible = false;
            val.permissionname = "";
            val.permissioninfo = "";
            this.$refs[val].resetFields();
            this.editFormFlag = false;
        },

        //清空查询条件
        clearClick: function () {
            this.searchForm.codetype = "",
            this.searchForm.codetypeName = "",
            this.searchForm.createTime = new Array(),
            this.searchClick('reset');
        },
    },
})