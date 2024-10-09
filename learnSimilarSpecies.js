const speciesImport = import("./Species/speciesList.json", {
    with: { type: 'json' }
});

speciesImport.then(data => {

    const { createApp } = Vue

    createApp({
        data(speciesList) {
            return {
                title: 'Hasonló fajok megkülönböztetése',
                speciesList: data.default,
                itemsWithSimilarSpecies: data.default.filter((x) => x.SimilarSpecies.length > 0),
                actualIndex: 0
            }
        },
        computed: {
            totalSpeciesCount() {
                return this.itemsWithSimilarSpecies.length;
            },
            actualSpecies() {
                return this.itemsWithSimilarSpecies[this.actualIndex];
            }
        },
        methods: {
            getImageSourceByIDAndIndex(id, index) {
                return "SpeciesImages/" + id + (index == 0 ? "" : "_" + (index + 1)) + ".png";
            },
            createImageUrls() {
                for (var i = 0; i < this.itemsWithSimilarSpecies.length; ++i) {
                    this.itemsWithSimilarSpecies[i]["ImageUrls"] = [];
                    for (var j = 0; j < this.itemsWithSimilarSpecies[i].ImageSource.length; ++j) {
                        var url = "SpeciesImages/" + this.itemsWithSimilarSpecies[i].ID + (j === 0 ? "" : "_" + (j + 1)) + ".png";
                        this.itemsWithSimilarSpecies[i].ImageUrls.push(url);
                    }
                }
            },
            previousPage() {
                if (this.actualIndex > 0) {
                    this.actualIndex--;
                }
            },
            nextPage() {
                if (this.actualIndex < this.totalSpeciesCount) {
                    this.actualIndex++;
                }
            }
        },
        created() {
            this.createImageUrls();
        }
    }).mount('#app')
});