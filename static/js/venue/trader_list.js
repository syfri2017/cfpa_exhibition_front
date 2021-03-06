//axios默认设置cookie
axios.defaults.withCredentials = true;
var vue = new Vue({
    el: '#app',
    data: function () {
        return {
            //搜索表单
            searchForm: {
                id: "",
                zgmc: "",
                zgtp: "",
                zghb: "",
                zgtpStr: ""
            },
            //表数据
            tableData: [],
            allRoles: [],
            //显示加载中样
            loading: false,
            //图片的显示  
            showPicVisible: false,
            previewImg: '',
            labelPosition: 'right',
            //多选值
            multipleSelection: [],
            //当前页
            currentPage: 1,
            //分页大小
            pageSize: 10,
            //总记录数
            total: 0,
            // //表高度变量
            // tableheight: 291,
            //序号
            indexData: 0,
            //Dialog Title
            dialogTitle: "展馆编辑",
            //选中的序号
            editIndex: -1,
            //修改界面是否显示
            editFormVisible: false,
            editLoading: false,
            currentUuid: '', //当前修改展馆id
            //登陆用户
            shiroData: "",
            createModel: {
                show: true,
                loading: true
            },
            createFormRules: {
                name: [{
                        required: true,
                        message: '请输入展馆名称',
                        trigger: 'blur'
                    },
                    {
                        min: 1,
                        max: 5,
                        message: '长度在 1到 5 ',
                        trigger: 'blur'
                    }
                ]
            },
            createForm: {
                name: null,
                photoName: null,
                cropperModel: false,
                selectedImage: null,
                croppedImage: null,
                imgWidth: 0,
                imgHeight: 0
            },
            editForm: {
                name: null,
                photoName: null,
                cropperModel: false,
                selectedImage: null,
                croppedImage: null,
                imgWidth: 0,
                imgHeight: 0
            }
        }
    },
    created: function () {
        /**面包屑 by li.xue 20180628*/
        loadBreadcrumb("展馆管理", "-1");
        //table高度
        tableheight = tableheight10;
        //登录用户
        this.shiroData = shiroGlobal;
        this.searchClick('click');
    },

    methods: {
        //表格修改事件
        editClick: function (val, index) {
            this.editIndex = index;
            this.dialogTitle = "展馆编辑";
            this.editSearch(val);
        },
        //修改时查询方法
        editSearch: function (val) {
            axios.get('/xfxhapi/zgjbxx/' + val.uuid).then(function (res) {
                this.createForm.name = res.data.result.zgmc;
                this.currentUuid = val.uuid
                this.editFormVisible = true;
            }.bind(this), function (error) {
                console.log(error)
            })
        },
        //表格查询事件
        searchClick: function (type) {
            //按钮事件的选择
            if (type == 'page') {
                this.tableData = [];
            } else {
                this.currentPage = 1;
            }
            var _self = this;
            _self.loading = true; //表格重新加载
            var params = {
                zgmc: this.searchForm.zgmc.replace(/%/g, "\\%"),
                pageSize: this.pageSize,
                pageNum: this.currentPage
            }
            axios.post('/xfxhapi/zgjbxx/page', params).then(function (res) {
                var tableTemp = new Array((this.currentPage - 1) * this.pageSize);
                this.tableData = tableTemp.concat(res.data.result.list);
                this.total = res.data.result.total;
                _self.loading = false;
            }.bind(this), function (error) {
                console.log(error)
            })
        },
        //新增事件
        addClick: function () {
            this.dialogTitle = "展馆新增";
            this.editFormVisible = true
            this.createForm.photoName = ''
            this.createForm.name = ''
            this.currentUuid = ''
        },
        // 选择图片
        handlerSelectedPhoto(e) {

            const file = e.target.files[0]
            if (!file.type.includes('image/')) {
                alert('请选择图片文件！')
                return
            }
            this.createForm.photoName = file.name
            if (typeof FileReader === 'function') {
                const reader = new FileReader()

                reader.onload = (e) => {
                    this.createForm.selectedImage = e.target.result
                    this.$refs.localImageInput.value = ''
                }

                reader.readAsDataURL(file)
            } else {
                alert('您的浏览器版本太低，请升级。')
            }
        },
        // 创建
        handlerCreateModalOK() {

            if (!this.createForm.name) {
                // 判断选择图片
                // alert('请确认信息是否填写完整')
                this.$message({
                    message: "请确认信息是否填写完整",
                    type: "error"
                });
                return;

            } else {
                var imageObj = new Image()
                var _THIS = this
                imageObj.onload = function () {
                    _THIS.createForm.imgWidth = imageObj.width
                    _THIS.createForm.imgHeight = imageObj.height

                    // _THIS.$alert('图片大小必须在1M以内', '提示', {confirmButtonText: '确定'}); 
                    const stageData = JSON.stringify(_THIS.createEmptyStageData({
                        width: _THIS.createForm.imgWidth,
                        height: _THIS.createForm.imgHeight,
                        backgroundImage: _THIS.createForm.selectedImage
                    }))
                    var params = {
                        zgmc: _THIS.createForm.name.replace(/%/g, "\\%"),
                    }
                    params.zgtpStr = _THIS.createForm.selectedImage
                    if (_THIS.currentUuid) {
                        //修改
                        params.url = '/xfxhapi/zgjbxx/doUpdateByVO'
                        params.uuid = _THIS.currentUuid
                    } else {
                        //新增
                        params.url = '/xfxhapi/zgjbxx/doInsertByVO'
                        params.zgzwhbStr = stageData;
                        params.cjrid = _THIS.shiroData.userid;
                        params.cjrmc = _THIS.shiroData.realName;
                    }
                    axios.post(params.url, params).then(function (res) {
                        _THIS.editFormVisible = false;
                        _THIS.searchClick('add');
                    }.bind(_THIS), function (error) {
                        console.log(error)
                    })
                }
                //图片先创建之后才可以获取长宽
                imageObj.src = this.createForm.selectedImage
                if (this.currentUuid == '' && this.createForm.selectedImage == null) {
                    _THIS.$message({
                        message: "请确认是否选择了展馆平面图",
                        type: "error"
                    });
                    return;
                }
                if (this.currentUuid != '' && this.createForm.selectedImage == null) {
                    var params = {
                        zgmc: this.createForm.name.replace(/%/g, "\\%"),
                    }
                    //修改
                    params.url = '/xfxhapi/zgjbxx/doUpdateByVO'
                    params.uuid = this.currentUuid
                    axios.post(params.url, params).then(function (res) {
                        this.editFormVisible = false;
                        this.searchClick('edit');
                    }.bind(this), function (error) {
                        console.log(error)
                    })
                }
            }
        },
        handlerSelectPhotoBtnClick() {
            this.$refs.localImageInput.click()
        },
        //清空查询条件
        clearClick: function () {
            this.searchForm.id = "",
                this.searchForm.zgmc = "",

                this.searchClick('reset');
        },
        //表格勾选事件
        selectionChange: function (val) {
            for (var i = 0; i < val.length; i++) {
                var row = val[i];
            }
            this.multipleSelection = val;
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
        //获取复选框选中值
        getCheckValue(val) {
            this.editFormSelect = val;
        },
        //删除所选，批量删除
        removeSelection: function () {
            var params = []
            for (var i in this.multipleSelection) {
                param = {}
                param.xgrid = this.shiroData.userid;
                param.xgrmc = this.shiroData.realName;
                param.uuid = this.multipleSelection[i].uuid
                params.push(param);
            }
            if (params.length <= 0) {
                this.$message({
                    type: 'info',
                    message: '请勾选信息！'
                });
                return
            }
            this.$confirm('确定删除已选中展馆信息?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                axios.post('/xfxhapi/zgjbxx/doDeleteJbxx', params).then(function (res) {
                    this.$message({
                        message: "成功删除" + res.data.result + "条展馆信息",
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
            this.$refs["createForm"].resetFields();
        },
        //编辑页按钮显示
        editFlagChange: function () {
            if (this.editFlag) {
                this.editFlag = false;
                this.editFlagText = "取消";
            } else {
                this.editFlag = true;
                this.editFlagText = "编辑";
                this.editForm.username = this.editFormUsername;
            }
        },
        //图片加载 
        imgPreview: function (val) {
            this.previewImg = val;
            this.showPicVisible = true;
        },
        //创建空画布
        createEmptyStageData: function (config) {
            var stageData = {
                "attrs": {
                    "width": 800,
                    "height": 600,
                    "mplot": "1.1.0"
                },
                "className": "Stage",
                "children": [{
                    "attrs": {
                        "name": "backgroundLayer"
                    },
                    "className": "Layer",
                    "children": []
                }, {
                    "attrs": {
                        "name": "shapesLayer"
                    },
                    "className": "Layer",
                    "children": []
                }]
            }
            const stageLayers = stageData.children
            const backgroundLayer = stageLayers.find(item => {
                return item.attrs.name === 'backgroundLayer'
            })
            const shapesLayer = stageLayers.find(item => {
                return item.attrs.name === 'shapesLayer'
            })
            var stageWidth = 800
            var stageHeight = 800
            var stageFill = '#fff'

            if (config) {
                stageWidth = config.width
                stageHeight = config.height
                shapesLayer.children.push({
                    attrs: {
                        name: 'shapeWrap',
                        _shapeCfg: {
                            name: '底图',
                            id: 'backgroundImg',
                            type: 'image',
                            style: {
                                importSize: 'image',
                                mainShape: {
                                    src: config.backgroundImage
                                }
                            }
                        },
                        activable: true
                    },
                    className: 'Group',
                    children: [{
                        attrs: {
                            name: 'shapeGroup',
                            draggable: true,
                            x: 0,
                            y: 0
                        },
                        className: 'Group',
                        children: [{
                            attrs: {
                                id: 'stageBackgroundImg',
                                name: 'mainShape',
                                x: 0,
                                y: 0,
                                width: stageWidth,
                                height: stageHeight
                            },
                            className: 'Image'
                        }]
                    }, {
                        attrs: {
                            name: 'interactiveGroup'
                        },
                        className: 'Group',
                        children: []
                    }]
                })
            }
            backgroundLayer.children.push({
                attrs: {
                    name: 'shapeWrap',
                    _shapeCfg: {
                        name: '画布区域',
                        id: 'backgroundArea',
                        type: 'Rect',
                        style: {}
                    },
                    activable: false
                },
                className: 'Group',
                children: [{
                    attrs: {
                        name: 'shapeGroup',
                        draggable: false,
                        _isDrawn: true,
                        x: 0,
                        y: 0
                    },
                    className: 'Group',
                    children: [{
                        attrs: {
                            id: 'stageBackgroundArea',
                            name: 'backgroundAreaShape',
                            x: 0,
                            y: 0,
                            width: stageWidth,
                            height: stageHeight,
                            fill: stageFill
                        },
                        className: 'Rect'
                    }]
                }]
            })
            stageData.attrs.width = stageWidth
            stageData.attrs.height = stageHeight
            return stageData
        }
    }
})