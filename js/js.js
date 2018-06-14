


new Vue({
    el: '#app',
    data: {
        datas: {},
        filter: {},
        url: 'https://data.kcg.gov.tw/api/action/datastore_search?resource_id=92290ee5-6e61-456f-80c0-249eae2fcc97',
        filterText: '',
        zone: [],
        error: false,
        errorText: '',
        zoneText: '',
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
                return
            }

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
        filterMix(){
            this.filter = []
            const datas = new Set(this.datas)
            const filter = new Set()
            console.log(this.free)
            // 篩選地區
            if (this.zoneText) {
                datas.forEach((item)=>{
                    if (item.Zone === this.zoneText) {
                        filter.add(item)
                    }
                })
            } else {
                
            }

            // 篩選免費參觀
            if (this.free) {
                datas.forEach((item)=>{
                    if (item.Ticketinfo === '免費參觀') {
                        filter.add(item)
                    }
                })
            }

            // 篩選全天開放
            console.log('open ',this.open)
            if (this.open) {
                datas.forEach((item)=>{
                    if (item.Opentime === '全天候開放') {
                        filter.add(item)
                    }
                })
            }

            // 全天開放跟免費篩選
            // let = free, open, zone
            // free = this.free ? '免費參觀' : ''
            // open = this.open ? '全天候開放' : ''
            // zone = this.zoneText ? this.zoneText : ''

            // datas.forEach((item)=>{
            //     if (item.Opentime === open && item.Ticketinfo === free && item.Zone === zone){
            //         filter.add(item)
            //     }
            // })


            this.filter = [...filter]
            console.log(filter)
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
        }
    },


    created(){
        console.log("創建成功")
        this.getDate()
    }
})