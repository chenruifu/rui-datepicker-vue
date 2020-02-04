<template>
	<div class="datepicker-container" :class="wrapClass">
		<div class="datepicker-input">
			<div class="datepicker-input__view" :class="{'datepicker-input__view--placeholder': !isSelect}" @click="showPickerPopup">{{isSelect ? getInputValue('str') : '请选择出生日期'}}</div>
		</div>
		<input class="datepicker-input-hidden" type="text" :name="dateName" :value="getInputValue('date')" />
		<input class="datepicker-input-hidden" type="text" v-if="showHour" :name="hourName" :value="getInputValue('hour')" />
		<div class="datepicker-shade" @click="shadeClick" :class="{'datepicker-shade--active': popShow}"></div>
		<div class="datepicker-wrap" :class="{'datepicker-wrap--active': popShow }">
			<div class="datepicker-topinfo">
				<div class="datepicker-topinfo__leftbtn" @click="btnCancel">{{hiddenConfirm ? "取消" : "返回修改"}}</div>
				<div class="datepicker-topinfo__rightbtn" @click="btnConfirm">{{hiddenConfirm ? "完成" : "确认"}}</div>
				<div class="datepicker-topinfo__class" v-show="hiddenConfirm">
					<div class="item" :class="{'item--active': !lunarTab}" @click="solarLunarChange('solar')">公历</div>
					<div class="item" :class="{'item--active': lunarTab}" @click="solarLunarChange('lunar')">农历</div>
				</div>
				<div class="datepicker-topinfo__text" v-show="!hiddenConfirm">确认日期</div>
			</div>
			<div class="datepicker-content">
				<div class="datepicker-confirm" v-show="!hiddenConfirm">
					<div class="tip">请确认选择的时间是否正确</div>
					<div class="p"><text>{{ returnData.solarStr }}</text></div>
					<div class="p"><text>{{ returnData.lunarStr }}</text></div>
				</div>
				<van-picker
					show-toolbar
					:columns="columns"
				/>
				<!--
				<picker-view class="datepicker-picker" indicator-style="height: 80rpx;" :value="dateIndex" @change="pickerChange" v-show="hiddenConfirm">
					<picker-view-column>
						<div class="datepicker-picker__item" v-for="(item, index) in years" :key="index">{{ item }}</div>
					</picker-view-column>
					<picker-view-column>
						<div class="datepicker-picker__item" v-for="(item, index) in months" :key="index">{{ item }}</div>
					</picker-view-column>
					<picker-view-column>
						<div class="datepicker-picker__item" v-for="(item, index) in days" :key="index">{{ item }}</div>
					</picker-view-column>
					<picker-view-column v-if="showHour">
						<div class="datepicker-picker__item" v-for="(item, index) in hours" :key="index">{{ item }}</div>
					</picker-view-column>
				</picker-div> -->
			</div>
		</div>
	</div>
</template>

<script>
import solarLunar from "./solarlunar";
import { Picker } from 'vant';
export default {
	name: "rui-datepicker",
	components: {
		VanPicker: Picker
	},
	props: {
		//指定最小开始时间(新历)
		start: {
			type: String,
			default: ""
		},
		//指定最大开始时间(新历)
		end: {
			type: String,
			default: ""
		},
		//默认日期(新历)
		date: {
			type: String,
			default: "1991-1-10"
		},
		//默认时辰,未知
		hour: {
			type: Number,
			default: -1
		},
		//日期，input-name
		dateName: {
			type: String,
			default: "birthday"
		},
		//时辰，input-name
		hourName: {
			type: String,
			default: "hour"
		},
		//输入框样式名
		wrapClass: {
			type: String,
			default: ""
		},
		//是否需要确认
		isConfirm: {
			type: Boolean,
			default: false
		},
		//是否有时辰选项
		showHour: {
			type: Boolean,
			default: true
		},
		//默认展示农历
		isLunar: {
			type: Boolean,
			default: true
		}
	},
	data() {
		const solarMaxDate = [new Date().getFullYear() + 1, 12, 31];
		return {
			columns: ['杭州', '宁波', '温州', '嘉兴', '湖州'],

			popShow: false,
			lunarTab: true,
			hiddenConfirm: true,
			isClickConfirm: false,
			dateIndex: [0, 0, 0, 0],
			years: [],
			months: [],
			days: [],
			hours: [],
			returnData: {},
			inputData: {},
			solarMinDate: [1940, 5, 10], //新历最小
			solarMaxDate: solarMaxDate, //新历最大
			lunarMinDate: [1940, 2, 10, false], //农历最小，第四个参数为是否闰年
			lunarMaxDate: [2020, 12, 17, false] //农历最大
		};
	},
	created() {
		// 设置最大最小值
		const startDateArr = this.start.split("-");
		const endDateArr = this.end.split("-");
		this.solarMinDate = startDateArr.length == 3 ? startDateArr : this.solarMinDate;
		this.solarMaxDate = endDateArr.length == 3 ? endDateArr : this.solarMaxDate;
		const returnMinLunar = solarLunar.solar2lunar(this.solarMinDate[0], this.solarMinDate[1], this.solarMinDate[2]);
		const returnMaxLunar = solarLunar.solar2lunar(this.solarMaxDate[0], this.solarMaxDate[1], this.solarMaxDate[2]);
		this.lunarMinDate = [returnMinLunar.lYear, returnMinLunar.lMonth, returnMinLunar.lDay, returnMinLunar.isLeap];
		this.lunarMaxDate = [returnMaxLunar.lYear, returnMaxLunar.lMonth, returnMaxLunar.lDay, returnMaxLunar.isLeap];
		// 默认农历
		if (this.isLunar == true) {
			//载入农历数据
			this.initlunar(this.date, this.hour);
		} else {
			//载入公历数据
			this.initsolar(this.date, this.hour);
		}
		// 设置配置，显示组件
		this.lunarTab = this.isLunar;
		// 设置当前日期返回数据
		this.setReturnData();
	},
	computed: {
		// 是否已经选择
		isSelect() {
			return JSON.stringify(this.inputData) === "{}" ? false : true;
		}
	},
	methods: {
		// 返回input-value
		getInputValue(type) {
			let str = "";
			if (JSON.stringify(this.inputData) === "{}") return "";
			switch (type) {
				case "hour":
					str = this.inputData.hour;
					break;
				case "date":
					str = this.inputData.year + "-" + this.inputData.month + "-" + this.inputData.day;
					break;
				case "str":
					str = this.inputData.thisStr;
					break;
			}
			return str;
		},
		// 点击输入框弹出
		showPickerPopup() {
			this.popShow = true;
		},
		// 返回中文农历名
		getLunarName(type, number) {
			const monthArr = ["正月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "腊月"];
			const dayArr = [
				"初一",
				"初二",
				"初三",
				"初四",
				"初五",
				"初六",
				"初七",
				"初八",
				"初九",
				"初十",
				"十一",
				"十二",
				"十三",
				"十四",
				"十五",
				"十六",
				"十七",
				"十八",
				"十九",
				"二十",
				"廿一",
				"廿二",
				"廿三",
				"廿四",
				"廿五",
				"廿六",
				"廿七",
				"廿八",
				"廿九",
				"三十",
				"三十一"
			];
			const hourArr = [
				"0子",
				"1丑",
				"2丑",
				"3寅",
				"4寅",
				"5卯",
				"6卯",
				"7辰",
				"8辰",
				"9巳",
				"10巳",
				"11午",
				"12午",
				"13未",
				"14未",
				"15申",
				"16申",
				"17酉",
				"18酉",
				"19戌",
				"20戌",
				"21亥",
				"22亥",
				"23子"
			];
			if (type === "month") return monthArr[number - 1];
			if (type === "day") return dayArr[number - 1];
			if (type === "hour") return hourArr[number];
		},
		// 公农历切换
		solarLunarChange(type) {
			const thisData = this.returnData;
			// 农历下点击公历切换
			if (this.lunarTab !== true && type == "lunar") {
				this.lunarTab = true;
				this.initlunar(thisData.year + "-" + thisData.month + "-" + thisData.day, thisData.hour);
			}
			// 公历下点击农历切换
			if (this.lunarTab === true && type == "solar") {
				this.lunarTab = false;
				this.initsolar(thisData.year + "-" + thisData.month + "-" + thisData.day, thisData.hour);
			}
			this.setReturnData();
		},
		// 设置返回的数据
		setReturnData() {
			const selectArr = this.dateIndex;
			let thisDateJson = {};
			thisDateJson.hour = this.showHour === false ? "" : selectArr[3] - 1;
			thisDateJson.hour = (thisDateJson.hour < 0 ? "" : thisDateJson.hour);
			if (this.lunarTab === true) {
				//农历下
				thisDateJson.lYear = selectArr[0] + this.lunarMinDate[0];
				const leapMonth = solarLunar.leapMonth(selectArr[0] + this.lunarMinDate[0]);
				if (leapMonth > 0) {
					thisDateJson.lMonth = selectArr[1] >= leapMonth ? selectArr[1] : selectArr[1] + 1;
				} else {
					thisDateJson.lMonth = selectArr[1] + 1;
				}
				thisDateJson.lDay = selectArr[2] + 1;
				thisDateJson.isLeap = leapMonth > 0 && selectArr[1] == leapMonth ? true : false;
				if (thisDateJson.isLeap == true) {
					thisDateJson.lunarStr =
						"农历:" +
						thisDateJson.lYear +
						"年闰" +
						this.getLunarName("month", thisDateJson.lMonth) +
						"" +
						this.getLunarName("day", thisDateJson.lDay);
				} else {
					thisDateJson.lunarStr =
						"农历:" +
						thisDateJson.lYear +
						"年" +
						this.getLunarName("month", thisDateJson.lMonth) +
						"" +
						this.getLunarName("day", thisDateJson.lDay);
				}
				// 公历数据
				let solarData = solarLunar.lunar2solar(thisDateJson.lYear, thisDateJson.lMonth, thisDateJson.lDay, thisDateJson.isLeap);
				thisDateJson.year = solarData.cYear;
				thisDateJson.month = solarData.cMonth;
				thisDateJson.day = solarData.cDay;
				thisDateJson.solarStr = "公历:" + thisDateJson.year + "年" + thisDateJson.month + "月" + thisDateJson.day + "日";
			} else {
				//公历下
				thisDateJson.year = selectArr[0] + this.solarMinDate[0];
				thisDateJson.month = selectArr[1] + 1;
				thisDateJson.day = selectArr[2] + 1;
				thisDateJson.solarStr = "公历:" + thisDateJson.year + "年" + thisDateJson.month + "月" + thisDateJson.day + "日";
				// 农历数据
				let lunarData = solarLunar.solar2lunar(thisDateJson.year, thisDateJson.month, thisDateJson.day);
				thisDateJson.lYear = lunarData.lYear;
				thisDateJson.lMonth = lunarData.lMonth;
				thisDateJson.lDay = lunarData.lDay;
				thisDateJson.isLeap = lunarData.isLeap;
				if (thisDateJson.isLeap == true) {
					thisDateJson.lunarStr =
						"农历:" +
						thisDateJson.lYear +
						"年闰" +
						this.getLunarName("month", thisDateJson.lMonth) +
						"" +
						this.getLunarName("day", thisDateJson.lDay);
				} else {
					thisDateJson.lunarStr =
						"农历:" +
						thisDateJson.lYear +
						"年" +
						this.getLunarName("month", thisDateJson.lMonth) +
						"" +
						this.getLunarName("day", thisDateJson.lDay);
				}
			}
			// 判断是否有选择时辰
			if (this.showHour) {
				thisDateJson.solarStr += " " + (thisDateJson.hour === "" ? "时辰未知" : thisDateJson.hour + "时");
				thisDateJson.lunarStr += " " + (thisDateJson.hour === "" ? "时辰未知" : this.getLunarName("hour", thisDateJson.hour) + "时");
			}
			//判断当前模式返回thisStr
			if (this.lunarTab === true) {
				thisDateJson.thisStr = thisDateJson.lunarStr;
			} else {
				thisDateJson.thisStr = thisDateJson.solarStr;
			}
			this.returnData = thisDateJson;
		},
		// 切换数据
		pickerChange(e) {
			// 判断在公/农历下
			if (this.lunarTab === true) {
				this.pickerLunarChange(e.detail.value);
			} else {
				this.pickerSolarChange(e.detail.value);
			}
			this.setReturnData();
			this.$emit("change", this.returnData);
		},
		// 农历切换
		pickerLunarChange(selectArr) {
			const minDate = this.lunarMinDate;
			const maxDate = this.lunarMaxDate;
			// 该年是否有闰月，0没有
			const leapMonth = solarLunar.leapMonth(selectArr[0] + minDate[0]);
			const oldMonthArr = this.months;
			let monthArr = [],
				dayArr = [];
			// 月份数据
			for (let i = 1; i <= 12; i++) {
				monthArr.push(this.getLunarName("month", i));
				// 判断是否有闰月
				if (leapMonth > 0 && i == leapMonth) {
					monthArr.push("闰" + this.getLunarName("month", i));
				}
			}
			// 日期数组
			let maxDay;
			//判断是否有闰月
			if (leapMonth > 0) {
				if (selectArr[1] < leapMonth) {
					//月份小于闰月，+1
					maxDay = solarLunar.monthDays(selectArr[0] + minDate[0], selectArr[1] + 1);
				} else {
					if (selectArr[1] == leapMonth) {
						maxDay = solarLunar.leapDays(selectArr[0] + minDate[0], leapMonth);
					} else {
						// 月份大于闰月
						maxDay = solarLunar.monthDays(selectArr[0] + minDate[0], selectArr[1]);
					}
				}
			} else {
				//没有闰月+1 (有闰月切换没闰月最大值处理)
				let thisMonth = selectArr[1] + 1 > monthArr.length ? monthArr.length : selectArr[1] + 1;
				maxDay = solarLunar.monthDays(selectArr[0] + minDate[0], thisMonth);
			}
			for (let i = 1; i <= maxDay; i++) {
				dayArr.push(this.getLunarName("day", i));
			}
			// 年切换月份位置修正：有闰年 -> 没闰年
			if (oldMonthArr.length > monthArr.length) {
				let oldLeapMonth = 0;
				for (let i = 0, max = oldMonthArr.length; i < max; i++) {
					if ("" + oldMonthArr[i].indexOf("闰") >= 0) {
						oldLeapMonth = i;
					}
				}
				selectArr[1] = selectArr[1] + 1 > oldLeapMonth ? selectArr[1] - 1 : selectArr[1];
			}
			// 年份切换月份位置修正：没闰年 -> 有闰年
			if (oldMonthArr.length < monthArr.length) {
				selectArr[1] = selectArr[1] + 1 > leapMonth ? selectArr[1] + 1 : selectArr[1];
			}

			// 判断是否超出月份最大值(有闰年切换没闰年的情况)
			selectArr[1] = selectArr[1] >= monthArr.length ? monthArr.length - 1 : selectArr[1];
			// 判断是否超出日期最大值
			selectArr[2] = selectArr[2] >= maxDay ? maxDay - 1 : selectArr[2];

			// 判断到达年份最小
			if (selectArr[0] == 0) {
				// 有无闰月
				if (leapMonth > 0) {
					selectArr[1] = selectArr[1] < minDate[1] ? minDate[1] : selectArr[1];
					// 日期最大值
					if (selectArr[1] == minDate[1] && selectArr[2] + 1 < minDate[2]) {
						selectArr[2] = minDate[2] - 1;
					}
				} else {
					selectArr[1] = selectArr[1] < minDate[1] - 1 ? minDate[1] - 1 : selectArr[1];
					// 日期最大值
					if (selectArr[1] == minDate[1] - 1 && selectArr[2] + 1 < minDate[2]) {
						selectArr[2] = minDate[2] - 1;
					}
				}
			}
			// 判断到达年份最大
			if (selectArr[0] + minDate[0] == maxDate[0]) {
				// 有无闰月
				if (leapMonth > 0) {
					selectArr[1] = selectArr[1] > maxDate[1] ? maxDate[1] : selectArr[1];
					// 日期最大值
					if (selectArr[1] == maxDate[1] && selectArr[2] + 1 > maxDate[2]) {
						selectArr[2] = maxDate[2] - 1;
					}
				} else {
					selectArr[1] = selectArr[1] > maxDate[1] - 1 ? maxDate[1] - 1 : selectArr[1];
					// 日期最大值
					if (selectArr[1] == maxDate[1] - 1 && selectArr[2] + 1 > maxDate[2]) {
						selectArr[2] = maxDate[2] - 1;
					}
				}
			}

			this.months = monthArr;
			this.days = dayArr;
			this.dateIndex = selectArr;
		},
		// 公历切换
		pickerSolarChange(selectArr) {
			const minDate = this.solarMinDate;
			const maxDate = this.solarMaxDate;
			let dayArr = [];
			let maxDay = solarLunar.solarDays(selectArr[0] + minDate[0], selectArr[1] + 1);
			for (let i = 1; i <= maxDay; i++) {
				dayArr.push(i);
			}
			// 判断是否超出日期最大值
			selectArr[2] = selectArr[2] >= maxDay ? maxDay - 1 : selectArr[2];
			// 判断月份是否到达最小
			if (selectArr[0] == 0 && selectArr[1] + 1 < minDate[1]) {
				selectArr[1] = minDate[1] - 1;
			}
			//判断日期到达最小
			if (selectArr[0] == 0 && selectArr[1] + 1 == minDate[1] && selectArr[2] + 1 < minDate[2]) {
				selectArr[2] = minDate[2] - 1;
			}
			// 判断月份是否到达最大
			if (selectArr[0] + minDate[0] == maxDate[0] && selectArr[1] + 1 >= maxDate[1]) {
				selectArr[1] = maxDate[1] - 1;
			}
			// 判断日期是否到达最大
			if (selectArr[0] + minDate[0] == maxDate[0] && selectArr[1] + 1 == maxDate[1] && selectArr[2] + 1 >= maxDate[2]) {
				selectArr[2] = maxDate[2] - 1;
			}
			// 更新日期+最小值选择
			this.days = dayArr;
			this.dateIndex = selectArr;
		},
		// 填充农历数据
		initlunar(date, hour) {
			const minDateArr = this.lunarMinDate;
			const maxDateArr = this.lunarMaxDate;
			const dateArr = date.split("-");
			// 转换公历to农历
			const lunarData = solarLunar.solar2lunar(dateArr[0], dateArr[1], dateArr[2]);
			// 该年是否有闰月，0没有
			const leapMonth = solarLunar.leapMonth(lunarData.lYear);
			let yearArr = [],
				monthArr = [],
				dayArr = [],
				hourArr = ["未知"];
			// 年份数组
			for (let i = minDateArr[0]; i <= maxDateArr[0]; i++) {
				yearArr.push(i);
			}
			// 月份数组
			for (let i = 1; i <= 12; i++) {
				monthArr.push(this.getLunarName("month", i));
				// 判断是否有闰月
				if (leapMonth > 0 && i == leapMonth) {
					monthArr.push("闰" + this.getLunarName("month", i));
				}
			}
			// 日期数组
			let maxDay;
			// 该日期是否是闰月
			if (lunarData.isLeap) {
				maxDay = solarLunar.leapDays(dateArr[0], dateArr[1]);
			} else {
				maxDay = solarLunar.monthDays(dateArr[0], dateArr[1]);
			}
			for (let i = 1; i <= maxDay; i++) {
				dayArr.push(this.getLunarName("day", i));
			}
			// 时辰数组
			for (let i = 0; i <= 23; i++) {
				hourArr.push(this.getLunarName("hour", i) + "时");
			}

			// 设置数据位置
			this.years = yearArr;
			this.months = monthArr;
			this.days = dayArr;
			this.hours = hourArr;
			this.dateIndex = [
				lunarData.lYear - minDateArr[0],
				leapMonth > 0 && leapMonth <= lunarData.lMonth ? lunarData.lMonth : lunarData.lMonth - 1,
				lunarData.lDay - 1,
				(hour === '' ? -1 : parseInt(hour)) + 1
			];
		},
		// 填充公历数据
		initsolar(date, hour) {
			const dateArr = date.split("-");
			const minDateArr = this.solarMinDate;
			const maxDateArr = this.solarMaxDate;
			let yearArr = [],
				monthArr = [],
				dayArr = [],
				hourArr = ["未知"];
			// 年份数组
			for (let i = minDateArr[0]; i <= maxDateArr[0]; i++) {
				yearArr.push(i);
			}
			// 月份数组
			for (let i = 1; i <= 12; i++) {
				monthArr.push(i);
			}
			// 日期数组
			let maxDay = solarLunar.solarDays(dateArr[0], dateArr[1]);
			for (let i = 1; i <= maxDay; i++) {
				dayArr.push(i);
			}

			// 时辰数组
			for (let i = 0; i <= 23; i++) {
				hourArr.push(i + "时");
			}

			// 设置数据位置
			this.years = yearArr;
			this.months = monthArr;
			this.days = dayArr;
			this.hours = hourArr;
			this.dateIndex = [
				dateArr[0] - minDateArr[0], 
				dateArr[1] - 1, 
				dateArr[2] - 1, 
				(hour === '' ? -1 : parseInt(hour)) + 1
			];
		},
		// 确认完成
		btnConfirm() {
			// 判断是否需要确认
			if (this.isConfirm) {
				// 判断是否在确认步骤[完成&确认]
				if (this.hiddenConfirm === false) {
					this.popShow = false;
					this.hiddenConfirm = true;
					this.inputData = this.returnData;
					this.$emit("confirm", this.inputData);
				} else {
					this.hiddenConfirm = false;
				}
			} else {
				this.popShow = false;
				this.hiddenConfirm = true;
				this.inputData = this.returnData;
				this.$emit("confirm", this.inputData);
			}
		},
		// 点击取消
		btnCancel() {
			// 判断是否在确认步骤[返回修改&取消]
			if (this.hiddenConfirm === false) {
				this.hiddenConfirm = true;
			} else {
				this.popShow = false;
			}
		},
		// 点击遮罩层关闭
		shadeClick() {
			this.hiddenConfirm = true;
			this.popShow = false;
		}
	}
};
</script>

<style lang="less" scoped>
/* 表单默认样式*/
.datepicker-container{
	height: 100%;
}
.datepicker-input{
	height: 100%;
	&__view{
		height: 100%;
		padding-right: 60rpx;
		position: relative;
		text-overflow: clip;
		overflow: hidden;
		&--placeholder{
			color: #b0b0b0;
		}
		&::after{
			content: '';
			position: absolute;
			width: 40rpx;
			height: 40rpx;
			right: 10rpx;
			top:50%;
			transform: translateY(-50%);
			background-image: url(https://img.d1xz.net/d/2020/01/5e1694065b222.png);
			background-repeat: no-repeat;
			background-size: 100% 100%;
		}
	}
}
.datepicker-input-hidden {
	display: none;
}
/*遮罩层*/
.datepicker-shade {
	position: fixed;
	width: 100%;
	height: 100%;
	top: 0;
	left: 0;
	background-color: rgba(0, 0, 0, 0.2);
	z-index: 2;
	display: none;
	&--active{
		display: block;
	}
}

/*日期选择框架*/
.datepicker-wrap {
	position: fixed;
	width: 100%;
	left: 0;
	bottom: 0;
	background-color: #fff;
	box-shadow: 0 0 2px rgba(0, 0, 0, 0.4);
	transform: translate3d(0, 300%, 0);
	transition: transform 0.3s ease-out;
	z-index: 3;
	line-height: 1.5;
	&--active{
		transform: translate3d(0, 0, 0);
	}
}

.datepicker-topinfo {
	position: relative;
	height: 80rpx;
	text-align: center;
	border-bottom: 2rpx solid #d4d4d4;
	&__class{
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		height: 48rpx;
		line-height: 48rpx;
		.item{
			display: inline-block;
			font-size: 28rpx;
			padding:0 40rpx;
			text-align: center;
			color: #fe5b00;
			border: 2rpx solid #fe5b00;
			&:first-child{
				border-top-left-radius: 6rpx;
				border-bottom-left-radius: 6rpx;
			}
			&:last-child {
				border-top-right-radius: 6rpx;
				border-bottom-right-radius: 6rpx;
			}
			&--active{
				background-color: #fe5b00;
				color: #fff;
			}
		}
	}
	&__text{
		line-height: 80rpx;
		font-size: 34rpx;
		color: #363837;
	}
	&__leftbtn,&__rightbtn{
		position: absolute;
		top: 0;
		line-height: 80rpx
	}
	&__leftbtn{
		left: 20rpx;
	}
	&__rightbtn{
		color: #fe5b00;
		right: 20rpx;
	}
}
.picker-box{
	font-size: 50px;
}
.datepicker-content {
	position: relative;
	text-align: center;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 400rpx;
}
.datepicker-picker {
	width: 100%;
	height: 100%;
	background-color: #f0f0f0;
	&__item{
		height: 80rpx;
		line-height: 80rpx
	}
}
// 确认
.datepicker-confirm {
	padding: 30rpx 20rpx;
	font-size: 16px;
	text-align: center;
	.tip{
		color: #666;
		margin-bottom: 20rpx;
	}
	.p{
		margin-bottom: 10rpx;
		text{
			color: #c91723;
		}
	}
}
</style>
