const speciesImport = import("./Species/speciesList.json", {
    assert: { type: 'json' }
});

speciesImport.then(data => {

    const { createApp } = Vue

    createApp({
        data(speciesList) {
            return {
                title: 'Magyarország halai',
                speciesList: data.default
            }
        },
        computed: {
        },
        methods: {
        },
        created() {
        }
    }).mount('#app')
});