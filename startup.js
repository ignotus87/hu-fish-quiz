const speciesImport = import("./Species/speciesList.json", {
    assert: { type: 'json' }
});

speciesImport.then(data => {

    const { createApp } = Vue

    createApp({
        data(speciesList) {
            return {
                title: 'Magyarország halai',
                speciesList: data.default,
                puzzle: null,
                incorrect1: '',
                incorrect2: '',
                incorrect3: '',
                comment: '',
                actualIndex: 1,
                totalPoints: 0,
                numberOfAnsweredQuestions: 0,
                numberOfCorrectAnswers: 0,
                previousPuzzleIDs: []
            }
        },
        computed: {
            totalSpeciesCount() {
                return this.speciesList.length;
            },
            puzzleName() {
                return this.puzzle.Name;
            },
            puzzleImage() {
                return "./SpeciesImages/" + this.puzzle.ID + ".png";
            },
            choices() {
                return this.shuffle([this.puzzleName, this.incorrect1.Name, this.incorrect2.Name, this.incorrect3.Name]);
            },
            commentToShow() {
                return this.comment;
            },
            correctRatio() {
                if (this.numberOfAnsweredQuestions === 0) {
                    return '-';
                }
                else {
                    return (100 * this.numberOfCorrectAnswers / this.numberOfAnsweredQuestions).toFixed() + "%";
                }
            },
            imageSource() {
                let temp = this.puzzle.ImageSource.replace('https://', '').replace('http://', '');
                if (temp.indexOf('/') > 0) {
                    temp = temp.substring(0, temp.indexOf('/'))
                }
                return temp;
            }
        },
        methods: {
            getRandomSpecies() {
                if (this.previousPuzzleIDs.length == this.speciesList.length) { return this.puzzle; }

                do {
                    var candidate = this.speciesList[Math.floor(Math.random() * this.speciesList.length)];
                } while (this.previousPuzzleIDs.some((id) => candidate.ID === id));

                this.previousPuzzleIDs.push(candidate.ID);

                return candidate;
            },
            getRandomSpeciesExceptIDs(ids) {
                do {
                    var result = this.speciesList[Math.floor(Math.random() * this.speciesList.length)];
                } while (ids.some((id) => result.ID === id))
                return result;
            },
            getIncorrectAnswers() {

                if (this.puzzle.SimilarSpecies.length >= 1) {
                    this.incorrect1 = this.speciesList.find((item) => item.ID === this.puzzle.SimilarSpecies[0]);
                }
                else {
                    this.incorrect1 = this.getRandomSpeciesExceptIDs([this.puzzle.ID]);
                }

                if (this.puzzle.SimilarSpecies.length >= 2) {
                    this.incorrect2 = this.speciesList.find((item) => item.ID === this.puzzle.SimilarSpecies[1]);
                }
                else {
                    this.incorrect2 = this.getRandomSpeciesExceptIDs([this.puzzle.ID, this.incorrect1.ID]);
                }

                if (this.puzzle.SimilarSpecies.length >= 3) {
                    this.incorrect3 = this.speciesList.find((item) => item.ID === this.puzzle.SimilarSpecies[2]);
                }
                else {
                    this.incorrect3 = this.getRandomSpeciesExceptIDs([this.puzzle.ID, this.incorrect1.ID, this.incorrect2.ID]);
                }
            },
            shuffle(array) {
                let currentIndex = array.length, randomIndex;

                // While there remain elements to shuffle.
                while (currentIndex != 0) {

                    // Pick a remaining element.
                    randomIndex = Math.floor(Math.random() * currentIndex);
                    currentIndex--;

                    // And swap it with the current element.
                    [array[currentIndex], array[randomIndex]] = [
                        array[randomIndex], array[currentIndex]];
                }

                return array;
            },
            isCorrect(answer) {
                return answer === this.puzzleName;
            },
            answered(answer) {
                if (this.isCorrect(answer)) {
                    this.comment = '<b class="right">Helyes!</b><br/><i>' + this.puzzle.Category + '</i>';
                    this.totalPoints++;
                    this.numberOfCorrectAnswers++;
                }
                else {
                    this.comment = '<b class="wrong"><s>' + answer + '</s></b> <b class="right">' + this.puzzleName + "</b><br/><i>" + this.puzzle.Category + '</i>';
                }
                ++this.numberOfAnsweredQuestions;

                setTimeout(() => {
                    if (this.previousPuzzleIDs.length >= this.totalSpeciesCount) {
                        this.endGame();
                    }
                    else {
                        this.nextPuzzle();
                        this.comment = '';
                    }
                }, this.isCorrect(answer) ? 2000 : 4000);
            },
            nextPuzzle() {
                this.puzzle = this.getRandomSpecies();
                this.getIncorrectAnswers();
                this.actualIndex++;
            },
            startQuiz() {
                this.previousPuzzleIDs = [];
                this.actualIndex = 1;
                this.totalPoints = 0;
                this.numberOfCorrectAnswers = 0;
                this.numberOfAnsweredQuestions = 0;
                this.puzzle = this.getRandomSpecies();
                this.getIncorrectAnswers();
                this.comment = '';
            },
            reset() {
                this.startQuiz()
            },
            endGame() {
                this.comment += "<br/>Vége a játéknak.";
            }
        },
        created() {
            this.startQuiz()
        }
    }).mount('#app')
});