new Vue({
    el: '#app',
    data: {
        datas: [],
        filterData: [],
        innerData: [],
        innerPage: false,
        url: 'https://data.kcg.gov.tw/api/action/datastore_search?resource_id=92290ee5-6e61-456f-80c0-249eae2fcc97&limit=300',
        filterText: '',
        zone: [],
        zoneText: '',
        error: false,
        errorText: '',
        free: false,
        open: false,
        pageCount: 10,
        pageIndex: 0,
        pageDisplay: 4,
        toolLocation: false,
        toolType: false,
        isLoading: false,
        inputBtn: false,
        inputEnter: false
    },
    methods: {
        getDate(newUrl){
            this.toggleLoading()
            const _this = this
            let url = (newUrl) ? newUrl : this.url
            axios.get(`${url}`)
            .then(function (response) {
                _this.datas = response.data.result.records
                _this.filterData = response.data.result.records
                _this.zone = _this.makeZoneSelect
                _this.toggleLoading()
            })
            .catch(function (error) {
                console.log(error);
            });
        },

        filterKeyWord(){
            this.inputEnter = true
            this.inputBtn = false
            this.clearFilter()

            if (!this.filterText.trim()) {
                this.error = true
                this.errorText = '尚未輸入文字'
                setTimeout(() => this.error = false, 3000)
                return
            }

            const _this = this
            axios.get(`${this.url}&q=${this.filterText}`)
            .then(function (response) {
                _this.filterData = response.data.result.records
            })
            .catch(function (error) {
                console.log(error);
            });
        },
        clearFilter(){
            this.free = false
            this.open = false
            this.zoneText = ''
        },
        filterInput(){
            this.inputBtn = true
        },
        clearInput(){
            this.filterText = ''
            this.inputEnter = false
            this.filterData = this.datas
        },
        filterZone(){
            this.free = false
            this.open = false
            if (this.zoneText === '') return this.filterData = [...this.datas]
            let newData = this.datas.filter((item)=>{
                return item.Zone === this.zoneText
            })
            this.filterData = [...newData]
        },

        // 類別條件累加判斷
        filterType(){
            let source = [...this.datas]
            let freeFilter = []
            let openFilter = []

            // 篩選免費參觀
            if (this.free) {
                source.forEach((item)=>{
                    if (item.Ticketinfo === '免費參觀') freeFilter.push(item)
                })
            } else {
                freeFilter = [...source]
            }

            // 篩選全天開放
            if (this.open) {
                source.forEach((item)=>{
                    if (item.Opentime === '全天候開放') openFilter.push(item)
                })
            } else {
                openFilter = [...source]
            }

            // 判斷兩項需皆符合
            let repeatFilter = []
            freeFilter.forEach((free)=>{
                openFilter.forEach((open) => {
                    if (free.Name == open.Name) repeatFilter.push(open)
                })
            })

            // 如有選地區，進行地區過濾篩選
            if (!this.zoneText == '') {
                repeatFilter = repeatFilter.filter((item)=>{
                    return item.Zone === this.zoneText
                })
            }

            this.filterData = repeatFilter
        },

        // 刪除Tag搜尋條件
        cancelZone(){
            this.zoneText = ''
            this.filterType()
        },
        cancelFree(){
            this.free = false
            this.filterType()
        },
        cancelOpen(){
            this.open = false
            this.filterType()
        },

        // 分頁切換判斷
        pageChange(page){
            if (page.type === 'this') this.pageIndex = page.index-1
            if (page.type === 'prev') this.pageIndex--
            if (page.type === 'next') this.pageIndex++
        },

        // 載入動畫切換
        toggleLoading(){
            this.isLoading = !this.isLoading
        },

        // 內頁轉換
        toggleInnerPage(item){
            (item) ?  this.innerData = item : this.innerData = []
            this.innerPage = !this.innerPage
            this.goTop()
        },

        // 回頂部轉場效果
        goTop(){
            let scroll = document.documentElement ? document.documentElement : document.body
            TweenMax.to(scroll, 0.5, {
                scrollTop: 10,
                ease: Power4.easeOut
            })
        }

    },
    computed: {
        // 過濾重複名稱，產生選項資料
        makeZoneSelect(){
            const datas = new Set(this.datas)
            const location = new Set()
            for (let item of datas) {
                location.add(item.Zone)
            }
            return [...location]
        },

        isNothing() {
            if (this.filterData.length === 0) return true
        },

        // 分頁功能
        // 頁數換算
        pageTotal(){
            const dataRow = this.filterData.length
            if (dataRow % this.pageCount) {
                return parseInt(dataRow / this.pageCount+1)
            } else {
                return parseInt(dataRow / this.pageCount)
            }
        },

        // 分頁按鈕
        pageBtn(){
            let length = Math.round(this.filterData.length / this.pageCount)
            let start = Math.round(this.pageIndex - this.pageDisplay / 2)
            let end = Math.round(this.pageIndex + this.pageDisplay / 2)

            if (start <= 1) {
                start = 2
                end = start + this.pageDisplay - 2
                if (end >= length - 1) {
                    end = length - 1
                }
            } else {

                // 當前頁+2數大於等於總頁數時將end設定為總長度
                // 避免按鈕超出種頁數
                if (this.pageIndex+2 >= length) {
                    end = length-1

                } else if (this.pageIndex >= start) {
                    // 如果當前頁數大於可顯示頁數 start修改為當前頁數-2
                    start = start+2
                }

            }


            // 第一頁按鈕
            let btns = {
                btn: [{index:1, value: 1, type: 'this'}]
            }

            // prev上一頁按鈕值
            if (start !== 2) {
                btns.prev = {
                    index: this.pageIndex,
                    value: '',
                    type: 'prev'
                }
            }

            // 產生按鈕值陣列 [1, 2, 3, 4]
            for (let i=start; i<=end; i++) {
                btns.btn.push({
                    index: i,
                    value: i,
                    type: 'this'
                })
            }

            // 最後一頁按鈕
            btns.btn.push({
                index: length,
                value: length,
                type: 'this'
            })

            // 下一頁按鈕
            if (end !== length && end < length-1) {
                btns.next = {
                    index: this.pageIndex,
                    value: '',
                    type: 'next'
                }
            }
            return btns
        },

        // 分頁資料
        slicePageData(){
            let start = this.pageIndex * this.pageCount
            let end = (this.pageIndex + 1) * this.pageCount
            return this.filterData.slice(start, end)
        }
    },
    created(){
        this.getDate()
    }
})