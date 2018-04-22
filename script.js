/**
 * 独立封装的一个日历组件
 * @param {[type]} window [全局window对象]
 * @param {[type]} document [document对象]
 * @param {[type]} node [初始化传入的文章节点]
 */
(function(window, document) {
    //自定义的className前缀
    var classPerfix = 'calendar';

    function Calendar(node) {
        //获取传入节点
        this.node = typeof node == 'Object' ? node : document.getElementById(node);
        //定义日期周期
        this.days =  ['日', '一', '二', '三', '四', '五', '六'];

        //定义当前日期
        this.year = new Date().getFullYear();
        this.month = new Date().getMonth() //0~11
        this.date = new Date().getDate();

        //节点引用
        this.header = null;
        //包裹节点
        this.bodyWrap = null;
        /**
         * 显示上月，本月，下月日期的table节点
         * 例如this.nowBody = {
         *    year: 2018,
         *    month: 4,
         *    date: 22,
         *    node: xxx
         * }
         */
        this.prevBody = null;
        this.nowBody = null;
        this.nextBody = null;

        //定义设备宽高
        this.width = 0;
        this.height = 0;

        //定义偏移量
        this.widthOffset = 0;

        this.init()
    }

    Calendar.prototype = {
        constructor: Calendar,

        //该方法用来进行首次初始化
        init: function() {
            var prev = new Date(this.year, this.month - 1, this.date);//上一月
            var next = new Date(this.year, this.month + 1, this.date);//下一月

            this.width = this.getViewportSize().width;
            this.height = this.getViewportSize().height;
            //偏移一个table的距离，显示为中间那个
            this.widthOffset = -this.width;

            var bodyWrap = document.createElement('div');
            bodyWrap.className = `${classPerfix}-body-wrap`;
            this.bodyWrap = bodyWrap;

            //插入当前显示节点
            this.nowBody = this.constructorDataNode(this.year, this.month, this.date);
            this.bodyWrap.insertAdjacentElement('beforeend', this.nowBody.node);
            //插入左侧节点
            this.prevBody = this.constructorDataNode(prev.getFullYear(), prev.getMonth(), prev.getDate());
            this.bodyWrap.insertAdjacentElement('afterbegin', this.prevBody.node);
            //插入右侧节点
            this.nextBody = this.constructorDataNode(next.getFullYear(), next.getMonth(), next.getDate());
            this.bodyWrap.insertAdjacentElement('beforeend', this.nextBody.node);
            //进行偏移
            this.bodyWrap.style.transform = `translate(${this.widthOffset}px)`;

            //构造节点
            this.constructorHeader();
            this.constructorTableTitle();
            this.node.appendChild(this.bodyWrap);

            this.setSlide();
        },

        /**
         * 该方法用来建立日历数据结构
         * @param {number} year [年份]
         * @param {number} month [月份]
         * @param {number} date [日期]
         * @return {object} data [日历数据结构]
         */
        constructorDataNode: function(year, month, date) {
            var data = {
                year: year,
                month: month + 1,
                date: date,
                node:  this.constructorTableBody(year, month, date)
            }
            return data;
        },

        //该方法用来构建头部
        constructorHeader: function() {
            //构建必须元素(提高性能)
            let html = `<div id="${classPerfix}-header" class="${classPerfix}-header">
                            <span id="${classPerfix}-header-year" class="${classPerfix}-header-year">${this.year}年</span>
                            <span id="${classPerfix}-header-month" class="${classPerfix}-header-month">${this.month+1}月</span>
                            <span id="${classPerfix}-header-data" class="${classPerfix}-header-date">${this.date}日</span>
                        </div>`;
            this.node.insertAdjacentHTML('afterbegin', html);
            this.header = document.getElementById(`${classPerfix}-header`);
        },

        //该方法用来构建主日历表头
        constructorTableTitle: function() {
            //构建显示页面
            var calendarTableTitle = document.createElement('table');
            var cTtr = document.createElement('tr');

            //构建表格头部
            this.days.forEach(function(item) {
                var cTth = document.createElement('th');
                cTth.textContent = item;
                cTtr.appendChild(cTth);
            });

            calendarTableTitle.appendChild(cTtr);
            calendarTableTitle.className = `${classPerfix}-calendar-title`;

            this.node.appendChild(calendarTableTitle);
        },

        /**
         * 构建表格体部
         * @param  {string} year [年份]
         * @param  {string} month [月份]
         * @param  {string} date [日期]
         * @return {Node} calendarShow [返回表格体部]
         */
        constructorTableBody: function(year, month, date) {
            var self = this;
            var fragment = document.createDocumentFragment();
            //创建渲染节点
            var calendarShow = document.createElement('table');

            //计算本月第一天是星期几 
            var firstDay = new Date(year, month, 1).getDay();
            //计算上月空余几天,从需要填补至本月的日期开始
            var lastDaysStart = new Date(year, month - 1, 0).getDate() - firstDay + 1;
            //计算当月总天数(最后一天)
            var renderDays = new Date(year, month, 0).getDate();
            //需要加载的日历行数
            var renderTr = Math.ceil((renderDays + firstDay)/7);
    
            var countLast = 1;
            var daysCount = 1;
    
            for (let i = 0; i < renderTr; i++) {
                let tr = document.createElement('tr');

                for (let j = 0; j < 7; j++) {
                    let td = document.createElement('td');
                    //计数器
                    //头行加载上月剩余天数并且有剩余天数
                    if (i === 0 && firstDay !== 0) {
                        td.textContent = lastDaysStart;
                        lastDaysStart++;
                        firstDay--;
                        td.className = `${classPerfix}-grey-name`;
                    //加载当月日期
                    } else if (daysCount <= renderDays) {
                        td.textContent = daysCount;
                        td.className = `${classPerfix}-normal-name`;
                        daysCount++;
                    } else {
                        td.textContent = countLast;
                        td.className = `${classPerfix}-grey-name`;
                        countLast++;
                    }
                    tr.appendChild(td);
                };
                fragment.appendChild(tr);
            };
            calendarShow.appendChild(fragment);
            return calendarShow;
        },

        //该方法用来设定滑动事件
        setSlide: function() {
            var self = this;
            //触摸参数
            //计算总滑动距离的参数
            var startPos = null;
            var tempPos = null;
            var endPos = null;

            addEvent(self.bodyWrap, 'touchstart', touchStart);
            addEvent(self.bodyWrap, 'touchmove', touchMove);
            addEvent(self.bodyWrap, 'touchend', touchEnd);

            function touchStart(event) {
                event.preventDefault();
                var touch = event.targetTouches[0];
                startPos = {
                    x: touch.pageX,
                    y: touch.pageY
                };
                event.stopPropagation();
                return false;
            }

            function touchMove(event) {
                event.preventDefault();
                var touch = event.targetTouches[0];
                tempPos = {
                    x: touch.pageX,
                    y: touch.pageY
                };
                //计算本次移动结果
                var thisDistance = self.judgeDistant(startPos.x, tempPos.x);
                //进行移动
                thisDistance += self.widthOffset;
                self.move(thisDistance);
                event.stopPropagation();
                return false;
            }

            function touchEnd(event) {
                var touch = event.changedTouches[0];
                event.preventDefault();
                endPos = {
                    x: touch.pageX,
                    y: touch.pageY
                };
                var thisDistance = self.judgeDistant(startPos.x, endPos.x);
                //判断移动大小是否超过屏幕一半大小
                if (Math.abs(thisDistance) > self.width / 2) {
                    if (thisDistance < 0) {
                        self.changeShow(true);
                    } else {
                        self.changeShow(false);
                    }
                }
                self.move(self.widthOffset);
                event.stopPropagation();
                return false;
            }
            
        },

        /**
         * 该方法用来判断本次滑动距离
         * @param  {number} startPos [开始坐标]
         * @param  {number} endPos [结束坐标]
         * @param  {number} lastSlide [上次滑动的距离]
         * @return {number} distant [本次滑动的距离]
         */
        judgeDistant: function(startPos, endPos) {
            startPos = parseFloat(startPos);
            endPos = parseFloat(endPos);
            return endPos - startPos;
        },

        /**
         * 该方法用来进行日历滑动
         * @param  {number} distance [滑动距离]
         */
        move: function(distant) {
            this.bodyWrap.style.transform = `translate(${distant}px)`;
        },

        //该方法用来获取屏幕宽度
        getViewportSize: function() {
            return {
                width: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
                height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
            };
        },

        /**
         * 该方法用来改变显示
         * @param  {boolean} bool [true为下一月，false为上一月]
         */
        changeShow: function(bool) {
            var newDate = null;

            if (bool) {
                this.prevBody = this.nowBody;
                this.nowBody = this.nextBody;
                this.bodyWrap.removeChild(this.bodyWrap.firstElementChild);

                //格式化
                newDate = new Date(this.nowBody.year, this.nowBody.month + 1, this.nowBody.date);
                this.nextBody = this.constructorDataNode(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
                this.bodyWrap.insertAdjacentElement('beforeend', this.nextBody.node);
            } else {
                this.nextBody = this.nowBody;
                this.nowBody = this.prevBody;
                this.bodyWrap.removeChild(this.bodyWrap.lastElementChild);
                
                //格式化
                newDate = new Date(this.nowBody.year, this.nowBody.month - 1, this.nowBody.date);
                this.prevBody = this.constructorDataNode(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
                this.bodyWrap.insertAdjacentElement('afterbegin', this.prevBody.node);
            }
        }
    }

    window.Calendar = Calendar;

})(window, document)

var calendar = new Calendar('calendar');

