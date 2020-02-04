<template>
	<div id="app">
        <div class="input-wrap">
            <h2>男生生日</h2>
            <p @click="showBoyPicker">{{boyStr}}</p>
            <rui-datepick v-model="boyShow" @change="boyChange" @confirm="boyConfirm" />
        </div>
        <div class="input-wrap">
            <h2>女生生日</h2>
            <p @click="showGirlPicker">{{girlStr}}</p>
            <rui-datepick v-model="girlShow" @change="girlChange" @confirm="girlConfirm" />
        </div>
	</div>
</template>

<script>
import ruiDatepick from "./components/rui-datepicker/";

export default {
	name: "app",
	components: {
		ruiDatepick
	},
    data() {
        return {
            boyStr: '请选择',
            boyShow: false,
            girlStr: '请选择',
            girlShow: false
        }
    },
    methods: {
        showBoyPicker() {
            this.boyShow = true;
        },
        showGirlPicker() {
            this.girlShow = true;
        },
        boyChange(data) {
            console.log(data)
        },
        girlChange(data) {
            console.log(data)
        },
        boyConfirm(data) {
            this.boyStr = data.thisStr
            console.log(data)
        },
        girlConfirm(data) {
            this.girlStr = data.thisStr
        }
    }
};
</script>

<style scoped>
#app {
	font-family: "Avenir", Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
}
.input-wrap{
    margin: 30px 0;
}
.input-wrap h2{
    margin: 0 0 10px;
}
.input-wrap p{
    height: 40px;
    line-height: 40px;
    background-color: #ff0000;
    color: #fff;
    padding:0 20px
}
</style>
