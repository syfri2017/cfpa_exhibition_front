//axios默认设置cookie
axios.defaults.withCredentials = true;
var editorHandshake = null
var vue = new Vue({
    el: '#app',
    data: function () {
        return {
            //激活pover
            visible: false,
            //激活tab
            activeName: 'first',
            currentArea: null,
            currentAreaStage: null,
            //展馆标题数据
            zgtableData: [],
            zguuid: '',
            ploter: {
                show: true
            },
            //弹出框是否打开
            dialogVisible: false,
            //保存按钮是否禁用
            isDisabled: true,
            //展位图标
            area: [{
                "name": "展位",
                "id": "base_text_jxwbk",
                "src": "../../static/images/plot/tools/base/jxwbk",
                "type": "area",
                "businessCode": "AREA",
                "businessShape": true,
                "style": {
                    "shapeType": "rectangle",
                    "textShape": [{
                        "alias": "code",
                        "text": "code",
                        "fontFamily": "simsun",
                        "fill": "#666",
                        "fontSize": 10,
                        "padding": 4,
                        "align": "left",
                        "verticalAlign": "top"
                    }, {
                        "alias": "name",
                        "text": "名称",
                        "fontFamily": "simsun",
                        "fill": "#666",
                        "fontSize": 14,
                        "fontStyle": "bold",
                        "align": "center",
                        "verticalAlign": "middle"
                    }],
                    "mainShape": {
                        "stroke": "#666",
                        "strokeWidth": 1,
                        "fill": "#eaeaea",
                        "fillPriority": "color"
                    }
                }
            }],
            //门图标
            doors: [{
                "name": "光地（四面开）",
                "id": "door_1",
                "src": "../../static/images/plot/door/icn_open4_l",
                "type": "icon",
                "style": {
                    "mainShape": {},
                    "textShape": {
                        "text": "",
                        "fontFamily": "simsun",
                        "fill": "red",
                        "angleFixed": false
                    }
                }
            }, {
                "name": "光地（三面开）",
                "id": "door-2",
                "src": "../../static/images/plot/door/icn_open3_l",
                "type": "icon",
                "style": {
                    "mainShape": {},
                    "textShape": {
                        "text": "",
                        "fontFamily": "simsun",
                        "fill": "red",
                        "angleFixed": false
                    }
                }
            }, {
                "name": "光地（两面开）",
                "id": "door-3",
                "src": "../../static/images/plot/door/icn_open2_l",
                "type": "icon",
                "style": {
                    "mainShape": {},
                    "textShape": {
                        "text": "",
                        "fontFamily": "simsun",
                        "fill": "red",
                        "angleFixed": false
                    }
                }
            }, {
                "name": "光地（两面开）",
                "id": "door-4",
                "src": "../../static/images/plot/door/icn_open2-2_l",
                "type": "icon",
                "style": {
                    "mainShape": {},
                    "textShape": {
                        "text": "",
                        "fontFamily": "simsun",
                        "fill": "red",
                        "angleFixed": false
                    }
                }
            }, {
                "name": "光地（单面开）",
                "id": "door-5",
                "src": "../../static/images/plot/door/icn_open1_l",
                "type": "icon",
                "style": {
                    "mainShape": {},
                    "textShape": {
                        "text": "",
                        "fontFamily": "simsun",
                        "fill": "red",
                        "angleFixed": false
                    }
                }
            }, {
                "name": "标准展位",
                "id": "door-6",
                "src": "../../static/images/plot/door/icn_standard_l",
                "type": "icon",
                "style": {
                    "mainShape": {},
                    "textShape": {
                        "text": "",
                        "fontFamily": "simsun",
                        "fill": "red",
                        "angleFixed": false
                    }
                }
            }
            ],
            //当前展位数据
            currentBusinessData: {},
            //选择企业信息
            //菜单编码
            activeIndex: '',
            //搜索表单
            searchForm: {
                gsmc: ''
            },
            tableData: [],
            shiroData: [],//当前用户信息
            shztData: [],//审核状态下拉框
            currentRow: '',//选中行数据
            isReject: false,//未通过flag
            previewTitle: '',
            previewImg: '',
            imgViewVisible: false,
            approveFormVisible: false,
            //显示加载中样
            loading: false,
            //当前页
            currentPage: 1,
            //分页大小
            pageSize: 10,
            //总记录数
            total: 0,
            lastEl:''
        }
    },
    created: function () {
        //登录用户
        this.shiroData = shiroGlobal;
    },
    mounted: function () {
        this.init();
        //关闭左侧菜单
        this.closeleft();
    },
    computed: {
        ploterStyle() {
            return {
                display: this.ploter.show ? 'flex' : 'none'
            }
        }
    },
    methods: {
        //关闭左侧菜单
        closeleft: function () {
            document.getElementById("menu-toggle-btn").style.right = "-26px";
            document.getElementById("menu-toggle-btn").style.transform = "rotateY(180deg)";
            var left = $('.left-sidebar'),
                main = $('.main-box'),
                $this = $(this);
            if (left.hasClass('damin')) {
                left.removeClass('damin').css('left', '0');
                main.css('padding-left', '240px');
                setTimeout(function () {
                    $this.removeClass('menu-toggle-bg').css({ "right": "0", "transform": "rotateY(0)" });
                }, 300);
            } else {
                left.addClass('damin').css('left', '-240px');
                main.css('padding-left', 0);
                setTimeout(function () {
                    $this.addClass('menu-toggle-bg').css({ "right": "-26px", "transform": "rotateY(180deg)" });
                }, 300);
            }
        },
        // tab的按键
        handleClick(tab, event) {
            //console.log(tab, event);
        },
        /**
         *选择企业信息
         */
        //表格查询事件
        searchClick: function (type) {
            //按钮事件的选择
            if (type == 'page') {
                this.tableData = [];
            } else if (type == 'delete') {
            } else {
                this.currentPage = 1;
            }
            this.loading = true;//表格重新加载
            var params = {
                gsmc: this.searchForm.gsmc.replace(/%/g, "\\%"),
                // yjdz: this.searchForm.yjdz,
                //shzt: this.searchForm.shzt,
                shzt: '03',
                approveflag: 'y',
                pageSize: this.pageSize,
                pageNum: this.currentPage,
                orgUuid: this.shiroData.organizationVO.uuid,
                orgJgid: this.shiroData.organizationVO.jgid
            }
            axios.post('/xfxhapi/qyjbxx/page', params).then(function (res) {
                var tableTemp = new Array((this.currentPage - 1) * this.pageSize);
                this.tableData = tableTemp.concat(res.data.result.list);
                this.total = res.data.result.total;
                this.loading = false;
            }.bind(this), function (error) {
                console.log(error)
            })
        },
        //清空查询条件
        clearClick: function () {
            this.searchForm.gsmc = '';
            this.searchForm.yjdz = '';
            this.searchForm.shzt = '01';
            this.searchClick('reset');
        },
        //企业详情跳转
        qyDetails: function (val) {
            var params = {
                id: val.qyid
            }
            loadDivParam("prediction/exhprediction_detail", params);
        },
        //获取选中的数据
        showRow(val) {
            this.currentRow = val;
            this.currentBusinessData
        },
        //确认功能
        confirm(val) {
            var params = {
                uuid: this.currentBusinessData.uuid,
                qyid: val.qyid
            }
            axios.post('/xfxhapi/zwjbxx/doAssign', params).then(function (res) {
                if(res.data.msg=='success'){
                    var bp = []
                    bp.push(res.data.result)
                    var businessData = this.back2plot(bp)[0]
                    //需要新增
                    editorHandshake.call('updateBusinessRecord', businessData)
                    this.currentBusinessData.qyid = {}
                    this.dialogVisible = false

                    this.$message({
                        message: '展位指定成功',
                        type: 'success',
                        center: true
                    });
                }else{
                    var msg=res.data.msg;
                    if(!msg){
                        msg="展位指定失败！"
                    }
                    var bp = []
                    bp.push(res.data.result)
                    var businessData = this.back2plot(bp)[0]
                    //需要新增
                    editorHandshake.call('updateBusinessRecord', businessData)
                    this.$alert('<span style="color:red"><h3>'+msg+'</h3></span>', '注意', {
                        confirmButtonText: '确定',
                        type:'error',
                        dangerouslyUseHTMLString:true
                      });
                }
            }.bind(this), function (error) {
                console.log(error)
            })
        },
        //初始化当前页面
        init() {
            axios.post('/xfxhapi/zgjbxx/doSearchDataListByVO').then(function (res) {
                this.zgtableData = res.data.result;
            }.bind(this), function (error) {
                console.log(error)
            })
        },
        getStage(uuid,event) {
            if(event){
                if(this.lastEl){
                    this.lastEl.style.background="#0684E5";
                    this.lastEl.disabled=false;
                }
                var el = event.currentTarget;
                if(el){
                    this.lastEl=el
                    el.style.background="#666666";
                    el.disabled=true;
                }
            }
            var params = {
                uuid: uuid
            }
            this.zguuid = uuid
            this.loading = true;
            axios.post('/xfxhapi/zgjbxx/doSearchHbListByVO', params).then(function (res) {
                this.currentAreaStage = res.data.result[0].zgzwhbStr
                this.initPlotArea()
                this.isDisabled = false
            }.bind(this), function (error) {
                console.log(error)
            })
        },
        // 初始化标绘工具
        initPlotArea() {
            if (editorHandshake) {
                editorHandshake.destroy()
                editorHandshake = null
            }
            const me = this
            const ploterWrap = this.$refs.ploterWrap
            //初始化postmate插件
            var postmate = new Postmate({
                container: ploterWrap,
                url: plotUrl,
                model: {
                    stageRecord: {
                        jsonData: this.currentAreaStage,
                        uuid: this.zguuid
                    },
                    config: {
                        readOnly: false,
                        businessShape: {
                            enable: true,
                            requestLoop: 0 // 0为不轮询
                        }
                    }
                }
            })
            postmate.then(handshake => {
                editorHandshake = handshake
                handshake.frame.className = 'app-editor-ploter-iframe'
                //绑定事件
                handshake.on('evtNeedBusinessData', me.getBusinessData.bind(me))
                handshake.on('evtSaveDataReady', me.savePlotData.bind(me))
                handshake.on('evtBusinessDataAllot', me.allotBusinessData.bind(me))
                handshake.on('evtBusinessDataUnAllot', me.evtBusinessDataUnAllot.bind(me))
                
            })
            this.loading = false;
        },
        //初始化展位数据
        getBusinessData(stageUuid) {
            var params = {
                zgid: this.zguuid
            }
            axios.post('/xfxhapi/zwjbxx/doSearchListByVO', params).then(function (res) {
                var businessData = this.back2plot(res.data.result)
                // 外到里call 里到外emit
                editorHandshake.call('updateBusinessData', businessData)
            }.bind(this), function (error) {
                console.log(error)
            })
        },
        //指定展位
        allotBusinessData(businessData) {
            this.dialogVisible = true
            this.searchClick('page')
            this.currentBusinessData = businessData
        },
        //取消指定
        evtBusinessDataUnAllot(businessData){
            var params = {
                uuid: businessData.uuid
            }
            axios.post('/xfxhapi/zwjbxx/doCancelByVO', params).then(function (res) {
                if(res.data.msg=='success'){
                    var bp = []
                    bp.push(res.data.result)
                    var businessData = this.back2plot(bp)[0]
                    //需要新增
                    editorHandshake.call('updateBusinessRecord', businessData)
                    this.currentBusinessData.qyid = {}
                    this.dialogVisible = false

                    this.$message({
                        message: '展位取消指定成功',
                        type: 'success',
                        center: true
                    });
                }
            }.bind(this), function (error) {
                console.log(error)
            })
        },
        //保存展馆展位数据
        savePlotData(data) {
            this.isDisabled = true
            var zgvo={}
            zgvo.uuid=data.stageUuid
            zgvo.zgzwhbStr=data.jsonData
            //指定展位之前屏蔽此变量
            //zgvo.zgzwhbtpStr=data.picData
            var params = {
                zwjbxxVOs: this.plot2back(data.businessData),
                zgjbxxVO: zgvo
            }
            axios.post('/xfxhapi/zwjbxx/doInsertByVO',params).then(function (res) {
                this.$message({
                    message: '保存展位成功',
                    type: 'success',
                    center: true
                });
                if (editorHandshake) {
                        //销毁当前画布
                    editorHandshake.destroy()
                    editorHandshake = null
                    this.getStage(data.stageUuid)
                }
                this.isDisabled = false
            }.bind(this), function (error) {
                console.log(error)
            })
        },
        //画展位
        handlerDrawArea() {
            if (editorHandshake) {
                editorHandshake.call('selectToolHandler', this.area[0])
            }
        },
        //画门
        handlerDrawDoor(tool) {
            if (editorHandshake) {
                editorHandshake.call('selectToolHandler', tool)
            }
        },
        handlerSaveBtnClick() {
            if (editorHandshake) {
                editorHandshake.call('saveHandler')
            }
        },
        handlerCancelBtnClick() {
            if (editorHandshake) {
                editorHandshake.destroy()
                editorHandshake = null
            }
            this.ploter.show = false
            this.ploter.show = true
        },
        //展会后台数据转绘图工具数据
        back2plot(backData) {
            var plotData = []
            for (var i = 0; i < backData.length; i++) {
                var bd = backData[i]
                var pd = {}
                pd.uuid = bd.uuid
                pd.code = bd.zwh
                pd.codeFontSize = parseInt(bd.bhzh)
                pd.codeFontStyle = bd.bhzc
                pd.codeFontFamily = bd.bhzt
                pd.name = bd.zwmc
                pd.nameFontSize = parseInt(bd.mczh)
                pd.nameFontStyle = bd.mczc
                pd.nameFontFamily = bd.mczt
                //展位类型
                pd.boothType = bd.zwlb
                //出口类型
                pd.entryType = bd.cklx
                //企业名称
                pd.tenantName = bd.qymc
                pd.lateralLength = bd.zwcd
                pd.verticalLength = bd.zwkd
                pd.area = bd.zwmj
                pd.status = bd.zwzt
                pd.stageUuid = bd.zgid
                //绘图工具展位ID
                pd.shapeUuid = bd.reserve1
                pd.tenantId = bd.qyid
                debugger
                if(!pd.name&&pd.tenantName){
                    //pd.name=pd.tenantName
                    if(bd.gsjc!=null&&parseInt(bd.zwmj)<=12){
                        pd.name=bd.gsjc
                        pd.tenantName=bd.gsjc
                    }else{
                        pd.name=pd.tenantName
                    }
                }
                plotData.push(pd)
            }
            return plotData
        },
        //绘图工具数据转展会后台数据
        plot2back(plotData) {
            var backData = []

            for (var i = 0; i < plotData.length; i++) {
                var pd = plotData[i]
                var bd = {}
                bd.uuid = pd.uuid
                bd.zwh = pd.code
                bd.bhzh = pd.codeFontSize
                bd.bhzc = pd.codeFontStyle
                bd.bhzt = pd.codeFontFamily
                if(pd.name!=pd.tenantName){
                    bd.zwmc = pd.name
                }
                bd.mczh = pd.nameFontSize
                bd.mczc = pd.nameFontStyle
                bd.mczt = pd.nameFontFamily
                //展位类型
                bd.zwlb = pd.boothType
                //出口类型
                bd.cklx = pd.entryType
                //企业名称
                bd.qymc = pd.tenantName
                bd.zwcd = pd.lateralLength
                bd.zwkd = pd.verticalLength
                bd.zwmj = pd.area
                bd.zwzt = pd.status
                bd.zgid = pd.stageUuid
                bd.reserve1 = pd.shapeUuid
                bd.qyid = pd.tenantId
                backData.push(bd)
            }
            return backData
        }
    }
})
