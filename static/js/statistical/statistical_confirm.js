var vue = new Vue({
	el: "#app",
	data: function () {
		return {
			dataRange: [],
			date_start: '',
			date_end: '',
			//tabledata
			tjfxtabledata: [],
			//柱图
			name_X: [],
			value_Y: [],
			//饼图
			pieTitle: '是否信息确认企业数量比例图',
			pieDataz: [],

			//总记录数
			total: 0,
			//显示加载中样
			loading: false,
			labelPosition: 'right',
			//表高度变量
			tableheight: 291,
		}
	},
	created: function () {
		loadBreadcrumb("按确认信息统计", "-1");
		this.getAllData();//获取数据
	},
	methods: {
		//获取数据
		getAllData: function () {
			this.date_start = '';
			this.date_end = '';
			var params = {};
			if (this.dataRange != null && this.dataRange.length > 0) {
				//往详情页传的参数
				this.date_start = this.dataRange[0];
				this.date_end = this.dataRange[1];
				//查询用参数
				var date = new Date(this.dataRange[0]);
				var date1 = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
				var date2 = new Date(this.dataRange[1]);
				var date3 = date2.getFullYear() + '-' + (date2.getMonth() + 1) + '-' + date2.getDate() + ' ' + date2.getHours() + ':' + date2.getMinutes() + ':' + date2.getSeconds();
				var params = {
					qrsj_start: date1,
					qrsj_end: date3
				};
			}
			axios.post('/xfxhapi/qyjbxx/ifConfirmedTjfx', params).then(function (res) {
				this.name_X = [];
				this.value_Y = [];
				this.pieDataz = [];
				this.tjfxtabledata = res.data.result;
				for (var i in this.tjfxtabledata) {
					//柱状图数据
					this.name_X.push(this.tjfxtabledata[i].qrztmc);
					this.value_Y.push(this.tjfxtabledata[i].qrztsl)
					//饼状图数据
					var arr1 = {
						name: this.tjfxtabledata[i].qrztmc,
						value: this.tjfxtabledata[i].qrztsl
					}
					this.pieDataz.push(arr1);
				}
				//画柱状图
				this.barChart();
				//画饼图
				this.pieChart();
				this.loading = false;
			}.bind(this), function (error) {
				console.log(error)
			})

		},

		// 左侧柱状图
		barChart: function () {
			var myChart = echarts.init(document.getElementById('bar'));
			option = {
				title: {
					text: '按是否信息确认统计企业数量',
					x: 'center',
					y: '-3'
				},
				tooltip: {
					trigger: 'axis',
					axisPointer: {            // 坐标轴指示器，坐标轴触发有效
						type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
					}
				},
				grid: {
					top: '20',
					bottom: '10',
					left: '20',
					right: '50',
					containLabel: true
				},
				xAxis: [
					{
						name: '数量',
						type: 'value',
						minInterval: 1,
						splitLine: {
							show: false
						},
					}

				],
				yAxis: [
					{
						type: 'category',
						data: this.name_X,
						axisLabel: {
							interval: 0,
						},
					}
				],

				series: [
					{
						name: '数量',
						type: 'bar',
						barWidth: '100%',
						stack: '面积',
						barWidth: '45',
						//柱状图
						data: this.value_Y,
						smooth: true,
						itemStyle: {
							normal: {
								barBorderRadius: [5, 5, 0, 0],
								color: function (params) {
									// build a color map as your need.
									var colorList = [
										'#C1232B', '#B5C334'
									];
									return colorList[params.dataIndex]
								},
								opacity: 0.85
							}
						}
					}

				]
			};
			myChart.setOption(option);
		},

		// 右侧玫瑰图
		pieChart: function () {
			var myChart = echarts.init(document.getElementById('pie'));
			var option = {
				title: {
					text: this.pieTitle,
					left: 'center',
					top: -3,
				},
				tooltip: {
					trigger: 'item',
					formatter: "{a} <br/>{b} : {c} ({d}%)"
				},
				legend: {
					orient: 'vertical',
					x: '68%',
					y: 'center',
					itemGap: 16,
					itemWidth: 18,
					data: this.pieDataz.name,
					align: 'right',
					itemGap: 8,
				},
				series: [
					{
						name: this.pieTitle,
						type: 'pie',
						radius: '46.5%',
						center: ['35%', '50%'],
						data: this.pieDataz,
						// data:this.pieDataz.sort(function (a, b) { return a.value - b.value; }),
						// roseType: 'radius',
						label: {
							show: true,
							// position: 'inside',
							formatter: '{d}%',
						},
						labelLine: {
							show: true,
							length: 5
						},
						animationType: 'scale',
						animationEasing: 'elasticOut',
						animationDelay: function (idx) {
							return Math.random() * 200;
						},
						itemStyle: {
							normal: {
								opacity: 0.85
							}
						}

					}
				],
				color: ['#C1232B', '#B5C334']
			};

			myChart.setOption(option);
		},
		exportClick: function () {
			window.open("/xfxhapi/qyzwyx/doExportTjfxByZwmjfw");
		},
		toCompanyList: function (val) {
			var params = {
				qrsj_start: this.date_start,
				qrsj_end: this.date_end,
				qrzt: val.qrzt
			};
			loadDivParam("statistical/exhprediction_confirm", params);
		}
	}
})
