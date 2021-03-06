document.write('<scr' + 'ipt type="text/javascript" src="'+'../../static/js/zzzlib/jquery-3.2.1.min.js'+'"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="'+'../../static/js/zzzlib/vue.min.js'+'"></scr' + 'ipt>');
// document.write('<scr' + 'ipt type="text/javascript" src="'+'../../static/js/zzzlib/elementUI.js'+'"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="'+'../../static/js/zzzlib/element-ui/lib/index.js'+'"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="'+'../../static/js/zzzlib/axios.min.js'+'"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="'+'../../static/js/zzzlib/vue-resource.min.js'+'"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="'+'../../static/js/common/parameters.js'+'"></scr' + 'ipt>');



//公共方法-地址栏取参方法
window.getQueryString = function(name) {
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)",'i');
    var r = window.location.search.substr(1).match(reg);
    if(r!=null){
        return unescape(r[2]);
    } 
    return null;
}
//公共方法-地址栏取参方法2
window.getPathString = function(){
    var path = window.location.href;
    var start = path.search("/templates") + 10;
    var end =  path.search(".html");
    return path.substring(start,end);
}

//公共方法-详情页显示图片  
//参数1：图片类型，参数2：图片代码
window.doFindPhoto = function(picType, picValue){
    axios.get('/xfxhapi/util/doFindPhoto/' + picType + '/' + picValue).then(function (res) {
        var photo64 = res.data.result;
        var photo = document.getElementById("photo");
        if(photo64 == "" || photo64 == null){
            photo.src = "../../static/images/nopicture.png";
        }else{
            photo.src = "data:image/png;base64,"+photo64;
        }
    }.bind(this), function (error) {
        console.log(error)
    });
}
                    
//面包屑
window.loadBreadcrumb = function(firstName,secondName){
    var breadcrumb = [];
    breadcrumb.push('<div class="row main-container-header">');
    breadcrumb.push('<div class="col-md-12 rel">');
    breadcrumb.push('<div class="main-container-header-line fix">');
    breadcrumb.push('<div class="row">');
    breadcrumb.push('<div class="col-xs-6 col-md-6">');
    breadcrumb.push('<a class="a-back"');
    if(secondName == "-1"){
        breadcrumb.push('href="javascript:;"');
    }else{
        breadcrumb.push('href="javascript:backToLast()"')
    }
    breadcrumb.push('>'+ firstName +'</a>');
    if(secondName != "-1"){
        breadcrumb.push('<span>&nbsp;&gt;&nbsp;</span>');
        breadcrumb.push('<a class="a-back-detail" href="javascript:;">'+ secondName +'</a>');
    }
    breadcrumb.push('</div></div></div></div></div>');
    $("#breadcrumb_box").html(breadcrumb.join(''));
}

//面包屑跳转
window.backToLast = function(){
    var url = "../templates" + urlRewrite(getQueryString("url"));
    loadDiv(url);
    var newURL = top.location.href.substr(0,top.location.href.indexOf("&"));
    history.replaceState(null, null, newURL);
}

//urlRewrite
window.urlRewrite = function(url){
    if(url=='/prediction/exhprediction_edit' || 
        url=='/prediction/exhprediction_edit_ENG' ||
        url=='/signin/personal_edit' ||
        url=='/home' ||
        url=='/prediction/exhprediction_approve' ||
        url=='/statistical/statistical_product' ||
        url=='/statistical/statistical_area'
        ){
        return url;
    }else if(url=='/plan/plan_ENG'){
        return '/plan/plan_list';
    }else if(url.indexOf("ENG") > -1){
        return url.substr(0, url.lastIndexOf("ENG")-1) + "_list_ENG";
    }else{
        return url + "_list"
    }
}

//分页大小修改事件
window.pageSizeChange = function(val) {
    vue.pageSize = val;
    if(val == 10){
        tableheight = tableheight10;
    }else if(val == 20){
        tableheight = tableheight20;
    }else if(val == 30){
        tableheight = tableheight30;
    }
    vue.searchClick('page');
}

//当前页修改事件
window.currentPageChange = function(val) {
    if(vue.currentPage != val){
        vue.currentPage = val;
        vue.searchClick('page');
    }
}

//表格重新加载数据
window.loadingData = function () {
    vue.loading = true;
    setTimeout(function () {
        console.info("加载数据成功");
        vue.loading = false;
    }, 300);
}

//日期格式化
window.dateFormat = function(val){
    var date = new Date(val);
    if (date == undefined) {
        return val;
    }
    var month = '' + (date.getMonth() + 1),
        day = '' + date.getDate(),
        year = date.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    var newDate = [year, month, day].join('-');
    return newDate;
}

//table日期格式化
window.tableDateFormat =  function (row, column) {
    var rowDate = row[column.property];
    if (rowDate == null || rowDate == "") {
        return '';
    } else {
        return dateFormat(rowDate);
    }
}

//数据格式化
window.dataFormat = function (row, column) {
    var rowDate = row[column.property];
    if (rowDate == null || rowDate == "") {
        return '无';
    } else {
        return rowDate;
    }
}

//LOAD DIV
window.loadDiv = function(loadUrl){
    var url = '../../templates/';
    //判断是否为外挂链接(lxy20180912)
    if(loadUrl.indexOf('http')!= -1){
        return ;
    }

    if(loadUrl == undefined || loadUrl == "" || loadUrl == null){
        url = url + "home" + ".html";
    }else{
        url = url + loadUrl + ".html";
    }
    $.ajax({
        url: url,
        cache: true,
        async: true,
        success: function (html) {
            $("#component").html(html);
        }
    });
}

//LOAD DIV PARAM
window.loadDivParam = function(loadUrl, params){
    var shortURL = [];
    var jump = jumpDetail();
    shortURL.push(jumpDetail());
    if(jump.indexOf("?") == -1){
        shortURL.push("?1=1");
    }
    $.each(params, function(i){
        shortURL.push("&" + i + "=" + params[i]);
    })
    history.replaceState(null, null, shortURL.join(""));

    var url = '../../templates/';
    if(loadUrl == undefined || loadUrl == "" || loadUrl == null){
        url = url + "home" + ".html";
    }else{
        url = url + loadUrl + ".html";
    }
    $.ajax({
        url: url,
        cache: true,
        async: true,
        success: function (html) {
            $("#component").html(html);
        }
    });
}

//详情页跳转
window.jumpDetail = function(){
    var topHref = top.location.href;
    if(topHref.indexOf("&") == -1){
        var shortURL = topHref;
    }else{
        var shortURL = top.location.href.substr(0, top.location.href.indexOf("&"));
    }
    return shortURL;
}

//数值校验
window.validateNum = function(val, message, type){
    //type=num:非负数，figure：数值，int：整数
    var regPos = /^\d+(\.\d+)?$/;  
    if(type == "num"){
    }else if(type == "int"){
        regPos = /^\d+$/;
    }else if(type == "figure"){
        regPos = /^(-)\d+(\.\d+)?$/;  
    }
    
    if(val!="" && val!=null){
        if(!regPos.test(val)){
            this.$message.warning({
                message: message,
                showClose: true
            });
            return false;
        }              
    }
    return true;
}

//非负整数校验
window.validateInt = function(val){
    var regPos = /^\d+$/; //非负整数
    if(val!="" && val!=null){
        if(!regPos.test(val)){
            this.$message.warning({
                message: "请输入非负整数",
                showClose: true
            });
        }              
    }
}

//验证当前用户是否有操作权限
window.hasPermission = function(val){
    var index = permissions.indexOf(val);
    if(index == -1){
        return false;
    }else{
        return true;
    }
}

//字符串每4位加一个空格
window.longNumFormat = function(val){
    if(val == null){
        return null;
    }else{
        return val.replace(/(.{4})/g,'$1 ');
    }
}

//tab每4位加一个空格格式化
window.tableLongNumFormat =  function (row, column) {
    var rowNum = row[column.property];
    if (rowNum == null || rowNum == "") {
        return '';
    } else {
        return longNumFormat(rowNum);
    }
}

//校验当前用户Session是否失效
window.validateSession = function(){ 
    axios.get('/xfxhapi/shiro').then(function (res) {
        if(res.data != null && res.data != ""){
            return true;
        }else{
            vm.$confirm('用户登陆超时，请重新登陆。', '提示', {
                confirmButtonText: '是',
                cancelButtonText: '否',
                type: 'warning'
              }).then(() => {
                window.location.href = "/templates/login.html"
              }).catch(() => {       
            });
            return false;   
        }
    }.bind(this), function (error) {
        console.log(error)
    });
}

//关闭左侧菜单
window.closeleft = function () {
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
}