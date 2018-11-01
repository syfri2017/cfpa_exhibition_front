//axios默认设置cookie
axios.defaults.withCredentials = true;
var viewerHandshake = null
var vue = new Vue({
    el: '#app',
    data: function () {
        return {
            currentArea: null,
            currentAreaStage: null,
            tableData: [],
            zguuid: '',
            ploter: {
                show: true
            },
            dialogVisible: false
        }
    },
    mounted: function () {
        this.init()
    },
    computed: {
        ploterStyle() {
            return {
                display: this.ploter.show ? 'flex' : 'none'
            }
        }
    },
    methods: {
        init() {
            axios.post('/xfxhapi/zgjbxx/doSearchDataListByVO').then(function (res) {
                this.tableData = res.data.result;
            }.bind(this), function (error) {
                console.log(error)
            })
        },
        getStage(uuid) {
            var params = {
                uuid: uuid
            }
            this.zguuid = uuid
            axios.post('/xfxhapi/zgjbxx/doSearchHbListByVO', params).then(function (res) {
                debugger
                this.currentAreaStage = res.data.result[0].zgzwhbStr
                this.initPlotArea()
            }.bind(this), function (error) {
                console.log(error)
            })
        },
        // 标绘工具
        initPlotArea() {
            if (viewerHandshake) {
                viewerHandshake.destroy()
                viewerHandshake = null
            }
            const me = this
            const ploterWrap = this.$refs.ploterWrap
            let postmate = new Postmate({
                container: ploterWrap,
                url: plotUrl,
                model: {
                    stageRecord: {
                        jsonData: this.currentAreaStage,
                        uuid: this.zguuid
                    },
                    config: {
                        readOnly: true,
                        businessShape: {
                            enable: true,
                            requestLoop: 0 // 0为不轮询
                        }
                    }
                }
            })
            postmate.then(handshake => {
                viewerHandshake = handshake
                handshake.frame.className = 'app-viewer-ploter-iframe'
                handshake.on('evtNeedBusinessData', me.getBusinessData.bind(me))
                handshake.on('evtBusinessShapeSelected', me.handlerBusinessShapeSelected.bind(me))
            })
        },
        getBusinessData(stageUuid) {

            var params = {
                zgid: this.zguuid
            }
            axios.post('/xfxhapi/zwjbxx/doSearchListByVO', params).then(function (res) {
                debugger
                let businessData = this.back2plot(res.data.result)
                viewerHandshake.call('updateBusinessData', businessData)
            }.bind(this), function (error) {
                console.log(error)
            })
        },
        handlerBusinessShapeSelected(data) {
            debugger
            this.$message({
                message: '展位选择成功',
                type: 'success',
                center: true
            });
            console.log(data)
        },
        back2plot(backData) {
            let plotData = []
            for (let i = 0; i < backData.length; i++) {
                let bd = backData[i]
                let pd = {}
                pd.uuid = bd.uuid
                pd.code = bd.zwh
                pd.codeFontSize = bd.bhzh
                pd.codeFontStyle = bd.bhzc
                pd.codeFontFamily = bd.bhzt
                pd.name = bd.zwmc
                pd.nameFontSize = bd.mczh
                pd.nameFontStyle = bd.mczc
                pd.nameFontFamily = bd.mczt
                pd.type = bd.zwlb
                pd.length = bd.zwcd
                pd.width = bd.zwkd
                pd.area = bd.zwmj
                pd.status = bd.zwzt
                pd.stageUuid = bd.zgid
                pd.shapeUuid = bd.reserve1
                pd.qyid = bd.qyid
                plotData.push(pd)
            }
            return plotData
        },
        plot2back(plotData) {
            let backData = []
            for (let i = 0; i < plotData.length; i++) {
                let pd = plotData[i]
                let bd = {}
                bd.uuid = pd.uuid
                bd.zwh = pd.code
                bd.bhzh = pd.codeFontSize
                bd.bhzc = pd.codeFontStyle
                bd.bhzt = pd.codeFontFamily
                bd.zwmc = pd.name
                bd.mczh = pd.nameFontSize
                bd.mczc = pd.nameFontStyle
                bd.mczt = pd.nameFontFamily
                bd.zwlb = pd.type
                bd.zwcd = pd.length
                bd.zwkd = pd.width
                bd.zwmj = pd.area
                bd.zwzt = pd.status
                bd.zgid = pd.stageUuid
                bd.reserve1 = pd.shapeUuid
                bd.qyid = pd.qyid
                backData.push(bd)
            }
            return backData
        }
    }
})