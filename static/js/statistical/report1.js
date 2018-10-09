var vue = new Vue({
	el: "#app",
	data: function () {
		return {
			//页面获取的uuid
			uuid: "",
			//搜索表单
			searchForm: {
				dateStart: "",
				dateEnd: "",
			},
			//tabledata
			tabledata: [
				{ name: '产品类型1', count: '2999',  zongdui: '1335', zhidui: '1335', dazhongdui: '3335', zz: '135', kk: '135' },
				{ name: '产品类型2', count: '1142',  zongdui: '335', zhidui: '335', dazhongdui: '1335', zz: '135', kk: '135' },
				{ name: '产品类型3', count: '1218',  zongdui: '1035', zhidui: '670', dazhongdui: '6035', zz: '135', kk: '135' },
				{ name: '产品类型4', count: '1021',  zongdui: '935', zhidui: '1035', dazhongdui: '1935', zz: '135', kk: '135' },
				{ name: '产品类型5', count: '1455',  zongdui: '335', zhidui: '500', dazhongdui: '1335', zz: '135', kk: '135' },
				{ name: '产品类型6', count: '1919',  zongdui: '1335', zhidui: '670', dazhongdui: '4335', zz: '135', kk: '135' }
			],
			//表高度变量
			tableheight: 1360,
			//显示加载中样
			loading: false,
			labelPosition: 'right',
		}
	},
	mounted: function () {
		this.echarts1();
	},
	created: function () {
		/**菜单选中 by li.xue 20180628*/
		// $("#activeIndex").val(getQueryString("index"));
		/**面包屑 by li.xue 20180628*/
		var type = getQueryString("type");
		if (type == "DPYL") {
			loadBreadcrumb("统计分析", "按产品分类");
		} else {
			loadBreadcrumb("按产品分类", '-1');
		}
	},
	methods: {
		//获取统计分析图表数据
		getCPLX: function () {
			
            var params = {
				cplx: cplx,
				czqysl:czqysl,
				bzzwsl:bzzwsl,
				gdzwmj:gdzwmj,
			};
			axios.post('/xfxhapi/qyzwyx/dofindtjfx', params).then(function (res) {
				this.tableData = res.data.result;
				this.loading = false;
			}.bind(this), function (error) {
				console.log(error)
			})
			
		},

		// 中央下部按产品分类柱状图
		echarts1: function () {
			var myBarChart = echarts.init(document.getElementById('bar'));
			BarmaxOption = {
				title: {
					text: '按产品分类总数柱状图',
					x: 'center'
				},
				tooltip: {
					trigger: 'axis',
					axisPointer: {            // 坐标轴指示器，坐标轴触发有效
						type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
					}
				},
				legend: {
					orient: 'horizontal',
					x: 'center',
					y: '20px',
					iGap: 16,
					iWidth: 18,
					data: this.tabledata.name,
					align: 'left',
					iGap: 8,
				},
				color: ['#ff6364', '#fdc107', '#29bb9d'],
				grid: {
					top: '50',
					bottom: '10',
					left: '15',
					right: '40',
					containLabel: true
				},
				xAxis: [
					{
						type: 'category',
						data: this.getList('name'),
						axisLabel: {
							interval: 0,
						},
					}
				],
			
				yAxis: [
					{
						type: 'value',
						name: '参展企业',
						position: 'left',
						offset: 50,
						min: 0,
						max: 1500,
						axisLine: {
							lineStyle: {
								color: '#ff6364'
							}
						},
						splitLine: {
							show: false
						}
					},
					{
						type: 'value',
						name: '标准展位',
						position: 'left',
						min: 0,
						max: 1500,
						axisLine: {
							lineStyle: {
								color: '#fdc107'
							}
						},
						splitLine: {
							show: false
						}
					},
					{
						type: 'value',
						name: '光地展位面积m²',
						min: 0,
						max: 7000,
						axisLine: {
							lineStyle: {
								color: '#29bb9d'
							}
						},
						splitLine: {
							show: false
						}
					}
				],
				series: [
					
					{
						name: '参展企业数量',
						type: 'bar',
						barWidth: '100%',
						barWidth: '45',
						data: this.getList('zongdui'),
					},
					{
						name: '标准展位数量',
						type: 'bar',
						barWidth: '100%',
						barWidth: '45',
						yAxisIndex: 1,
						data: this.getList('zhidui'),
					},
					{
						name: '光地展位面积m2',
						type: 'bar',
						barWidth: '100%',
						barWidth: '45',
						yAxisIndex: 2,
						data: this.getList('dazhongdui'),
					}
				
				]
			};
			myBarChart.setOption(BarmaxOption);
		},
		//数据为空时显示‘-’
		dataFormat: function (row, column) {
			var rowDate = row[column.property];
			if (rowDate == null || rowDate == "") {
				return '-';
			} else {
				return rowDate;
			}
		},
		getList: function (column) {
			var list = new Array();
			if ('name' == column) {
				for (var i in this.tabledata) {
					list.push(this.tabledata[i].name.replace('总队',''));
				}
			} else if ('buju' == column) {
				for (var i in this.tabledata) {
					if ('公安部消防局' == this.tabledata[i].name) {
						list.push(this.tabledata[i].count)
					}
				}
			} else if ('zongdui' == column) {
				for (var i in this.tabledata) {
					list.push(this.tabledata[i].zongdui)
				}
			} else if ('zhidui' == column) {
				for (var i in this.tabledata) {
					list.push(this.tabledata[i].zhidui)
				}
			} else if ('dazhongdui' == column) {
				for (var i in this.tabledata) {
					list.push(this.tabledata[i].dazhongdui)
				}
			}
			return list;
		},
	}
})
