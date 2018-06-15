


new Vue({
    el: '#app',
    data: {
        datas: {},
        filter: {},
        url: 'https://data.kcg.gov.tw/api/action/datastore_search?resource_id=92290ee5-6e61-456f-80c0-249eae2fcc97&limit=300',
        filterText: '',
        zone: [],
        zoneText: '',
        error: false,
        errorText: '',
        free: false,
        open: false
    },
    methods: {
        getDate(newUrl){
            const _this = this
            let url = (newUrl) ? newUrl : this.url
            axios.get(`${url}`)
            .then(function (response) {
                _this.datas = response.data.result.records
                _this.filter = response.data.result.records
                _this.zone = _this.makeZoneSelect
            })
            .catch(function (error) {
                console.log(error);
            });
        },

        filterKeyWord(){
            if (!this.filterText.trim()) {
                this.error = true
                this.errorText = '尚未輸入文字'
                setTimeout(() => this.error = false, 3000)
                return
            }

            this.clearFilter()
            const _this = this
            axios.get(`${this.url}&q=${this.filterText}`)
            .then(function (response) {
                _this.filter = response.data.result.records
            })
            .catch(function (error) {
                console.log(error);
            });
            this.filterText = ''
        },
        clearFilter(){
            this.free = false
            this.open = false
            this.zoneText = ''
        },

        filterZone(){
            this.free = false
            this.open = false
            if (this.zoneText === '') return this.filter = [...this.datas]
            let filterData = this.datas.filter((item)=>{
                return item.Zone === this.zoneText
            })
            this.filter = [...filterData]
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

            this.filter = repeatFilter
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
            if (this.filter.length === 0) return true
        }
    },
    created(){
        console.log("創建成功")
        this.getDate()
    }
})