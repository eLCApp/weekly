/**
 * Created with JetBrains WebStorm.
 * User: 松松
 * Date: 12-7-11
 * Time: 下午1:48
 * To change this template use File | Settings | File Templates.
 */

'use strict';

seajs.config({
    alias: {
        'jquery': '/global/jquery',
        'show-log': '/home/show-log'
    }
});


define(function (require, exports, module) {
    var $ = require('jquery');
    var showLog = require('show-log');
    var $yearNode = $('#year-trigger'),
        $monthNode = $('#month-trigger');
    var year = parseInt($yearNode.html(), 10);
    var month = parseInt($monthNode.html(), 10);
    var currentDate = new Date();
    currentDate.setDate(1);

    var hashDate = window.location.hash.substring(1).split('-');
    var _hashYear = parseInt(hashDate[0], 10);
    var _hashMonth = parseInt(hashDate[1], 10);

    //如果location.hash中有值，则显示当月的数据
    if (!isNaN(_hashYear) && !isNaN(_hashMonth) && _hashMonth > 0 && _hashMonth <= 12) {
        currentDate.setFullYear(_hashYear);
        currentDate.setMonth(_hashMonth - 1);
    } else {
        currentDate.setFullYear(year);
        currentDate.setMonth(month - 1);
    }

    var calendarPanel = $('#calendar-panel');

    /*
     * 更改日期
     * */
    KISSY.Event.on('#date b.trigger-panel', "click", function (ev) {
        var $currentTarget = $(ev.currentTarget);
        var $target = $(ev.target);
        var add = $target.hasClass('add');

        if ($currentTarget.hasClass('year')) {
            year = add ? year + 1 : year - 1;
            $yearNode.html(year);
        } else if ($currentTarget.hasClass('month')) {
            if (add) {
                month += 1;
                if (month > 12) {
                    month = 1;
                    year += 1;
                }
            } else {
                month -= 1;
                if (month < 1) {
                    month = 12;
                    year -= 1;
                }
            }
        }
        //更新日历界面
        var _tempDate = new Date();
        _tempDate.setDate(1);
        _tempDate.setFullYear(year);
        _tempDate.setMonth(month - 1);
        currentDate = _tempDate;
        ev.preventDefault();
        exports.createTableView();
    });
    KISSY.Event.on('#date', "selectstart ", function (ev) {
        ev.preventDefault();
    });

    var tipsCl;
    $('#date').click(function () {
        if (tipsCl !== undefined) {
            clearTimeout(tipsCl);
        }
        var spanTips = $(this).find('span.tips');
        spanTips.stop();
        spanTips.fadeIn(120);
        tipsCl = setTimeout(function () {
            spanTips.fadeOut(150);
        }, 3000);
    });

    /*初始化日历界面*/
    exports.init = function () {
        exports.createTableView();

        $('.J-scroll-date').click(function (ev) {
            ev.preventDefault();
        });

        if ($.browser.msie && parseInt($.browser.version, 10) < 7) {
            $yearNode.add($monthNode).hover(function () {
                $(this).addClass('hover');
            }, function () {
                $(this).removeClass('hover');
            })
        }
    };

    /*构造日历界面*/
    exports.createTableView = function () {
        var table = '<table id="calendar-container">' +
            '<thead>' +
            '<tr class="th">' +
            '<th class="weekend">周日</th>' +
            '<th>周一</th>' +
            '<th>周二</th>' +
            '<th>周三</th>' +
            '<th>周四</th>' +
            '<th>周五</th>' +
            '<th class="weekend">六</th>' +
            '</tr>' +
            '</thead>' +
            '<tbody>';

        var lastMonth = (new Date());
        (function () {
            lastMonth.setTime(currentDate.getTime());
            lastMonth.setDate(1);
            if (currentDate.getMonth() == 0) {
                lastMonth.setMonth(11);
                lastMonth.setFullYear(currentDate.getFullYear() - 1);
            } else {
                lastMonth.setMonth(currentDate.getMonth() - 1);
            }
        })();

        var nextMonth = (new Date());
        (function () {
            nextMonth.setTime(currentDate.getTime());
            nextMonth.setDate(1);
            if (currentDate.getMonth() == 11) {
                nextMonth.setMonth(0);
                nextMonth.setFullYear(currentDate.getFullYear() + 1);
            } else {
                nextMonth.setMonth(currentDate.getMonth() + 1);
            }
        })();

        var dateArr = [];
        var _tempDate = new Date();
        _tempDate.setTime(currentDate.getTime());
        _tempDate.setDate(1);
        var leftDate = _tempDate.getDay();

        var currentMaxDays = exports.getMaxDays(currentDate, currentDate.getMonth());
        var prevMaxDays = exports.getMaxDays(lastMonth, lastMonth.getMonth());

        for (var i = 0; i < leftDate; i++) {
            dateArr.push({type: 'prev', date: prevMaxDays - i});
        }
        dateArr.reverse();

        for (i = 1; i < currentMaxDays + 1; i++) {
            dateArr.push({type: 'current', date: i});
        }

        //获取月末是星期几
        _tempDate.setDate(currentMaxDays);
        for (i = 1; i <= 7 - _tempDate.getDay() - 1; i++) {
            dateArr.push({type: 'next', date: i});
        }

        //补足月末的天数
        var calendarStr = [], _current = '';
        for (var j = 0; j < dateArr.length; j++) {
            var is20 = dateArr[j].date === 20;
            switch (dateArr[j].type) {
                case "prev":
                    _current = ' class="prev" id="date-' + lastMonth.getFullYear() + (lastMonth.getMonth() + 1) + dateArr[j].date + '"';
                    break;
                case "next":
                    _current = ' class="next" id="date-' + nextMonth.getFullYear() + (nextMonth.getMonth() + 1) + dateArr[j].date + '"';
                    break;
                case "current":
                    _current = ' class="current" id="date-' + currentDate.getFullYear() + (currentDate.getMonth() + 1) + dateArr[j].date + '"';
                    break;
            }
            if (j == 0 || (j + 1) % 7 == 1) {
                calendarStr.push('<tr>')
            }
            calendarStr.push('<td' + _current + '><div class="wrapper"><div class="container ' + (function () {
                return is20 ? 'day20' : '';
            })() + '">' + (function () {
                return is20 ? '<div class="tips">统计截止日</div>' : '';
            })() + '<div class="work-diary"><div class="work-diary-list"></div></div><b class="day">' + dateArr[j].date + '</b></div></div></td>');

            if ((j + 1) % 7 == 0 && j > 0) calendarStr.push('</tr>');
            _current = '';
        }

        $yearNode.html(currentDate.getFullYear());
        var month = (currentDate.getMonth() + 1).toString();
        $monthNode.html(month.length < 2 ? '0' + month : month);
        calendarPanel.html(table + calendarStr.join('') + '</table>');
        exports.autoResetOffset();
        showLog.getData({
            callback: function () {
                showLog.updateDiaryList();
                showLog.updateUserList();
                showLog.checkedFront();
                showLog.filterData();
                showLog.filterLogList();
            }
        });
    };

    /*
     * 返回指定年、月份的最大当月天数
     * */
    exports.getMaxDays = function (date, month) {
        if (month == 0 || month == 2 || month == 4 || month == 6 || month == 7 || month == 9 || month == 11) {
            return 31;
        } else {
            return month == 1 ? date.getFullYear() % 4 == 0 ? 29 : 28 : 30;
        }
    };

    /*上一月*/
    exports.prev = function () {
        currentDate.setDate(1);
        if (currentDate.getMonth() == 0) {
            currentDate.setMonth(11);
            currentDate.setFullYear(currentDate.getFullYear() - 1);
        } else {
            currentDate.setMonth(currentDate.getMonth() - 1);
        }
        exports.createTableView();
    };

    /*下一月*/
    exports.next = function () {
        currentDate.setDate(1);
        if (currentDate.getMonth() == 11) {
            currentDate.setMonth(0);
            currentDate.setFullYear(currentDate.getFullYear() + 1);
        } else {
            currentDate.setMonth(currentDate.getMonth() + 1);
        }
        exports.createTableView();
    };

    /*调优日历界面*/
    exports.autoResetOffset = function () {
        var tdObj = $('#calendar-container td');
        var trObj = $('#calendar-container tr');
        var calendarContainer = $('#calendar-container');
        var calendarHeader = $('#calendar-header');
        var sidebarObj = $('#sidebar-wrapper');
        var mainWrapper = $('#main-wrapper');
        if (tdObj.size() > 0) {
            $([sidebarObj, mainWrapper]).height($(window).height() + 'px');
            mainWrapper.width(document.body.offsetWidth - sidebarObj[0].offsetWidth + 'px');

            var calendarWrapperHeight = mainWrapper[0].offsetHeight - calendarHeader.height();
            var calendarWrapperWidth = mainWrapper[0].offsetWidth;
            $('#calendar-wrapper').height(calendarWrapperHeight + 'px');
            $('#more-detail-wrapper').height(calendarWrapperHeight + 'px');
            calendarContainer.width(calendarWrapperWidth + 'px');
            var calendarContainerHeight = $(window).height() - calendarHeader.height() - trObj.eq(0).height();
            trObj.each(function (index, item) {
                if (index > 0) {
                    $(item).find('div.wrapper').height(parseInt(calendarContainerHeight / (trObj.size() - 1), 10) + 'px');
                }
            });
        }

    };

    $(window).on('resize', function () {
        exports.autoResetOffset();
    });
});
