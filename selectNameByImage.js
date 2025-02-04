'use strict';

const speciesImport = import("./Species/speciesList.json", {
    assert: { type: 'json' },
    with: { type: 'json' }
});

speciesImport.then(data => {

    const { createApp } = Vue

    createApp({
        data(speciesList) {
            return {
                title: 'Magyarország halai',
                speciesList: data.default,
                puzzleItems: data.default,
                puzzle: null,
                incorrect1: '',
                incorrect2: '',
                incorrect3: '',
                comment: '',
                actualIndex: 1,
                totalPoints: 0,
                imageIndex: 0,
                numberOfAnsweredQuestions: 0,
                numberOfCorrectAnswers: 0,
                previousPuzzleIDs: [],
                game: 'SelectNameByImage',
                choices: [],
                choiceIsRight: [false, false, false, false],
                choiceIsWrong: [false, false, false, false],
                isAnswered: false,
                mistakeIndexes: [],
                gameType: 'all',
                isWrongAnswer: false,
                continueTimeoutHandle: null,
                timeoutSeconds: 0
            }
        },
        computed: {
            totalSpeciesCount() {
                return this.speciesList.length;
            },
            totalPuzzleItemsCount() {
                return this.puzzleItems.length;
            },
            puzzleName() {
                return this.puzzle.Name;
            },
            puzzleImage() {
                return "./SpeciesImages/" + this.puzzle.ID + (this.imageIndex === 0 ? "" : "_" + (this.imageIndex + 1).toString()) + ".png";
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
                let temp = this.puzzle.ImageSource[this.imageIndex].replace('https://', '').replace('http://', '');
                if (temp.indexOf('/') > 0) {
                    temp = temp.substring(0, temp.indexOf('/'))
                }
                return temp;
            },
            gameTitle() {
                if (this.game === "SelectNameByImage") {
                    if (this.gameType === 'all') {
                        return "Melyik halat látod a képen?";
                    } else {
                        return "Hibásak gyakorlása: Melyik halat látod a képen?";
                    }
                }
            },
            isRightAnswer() {
                return !this.isWrongAnswer;
            }
        },
        methods: {
            getRandomSpecies() {
                if (this.previousPuzzleIDs.length == this.puzzleItems.length) { return this.puzzle; }

                do {
                    var candidate = this.puzzleItems[Math.floor(Math.random() * this.puzzleItems.length)];
                } while (this.previousPuzzleIDs.some((id) => candidate.ID === id));

                this.previousPuzzleIDs.push(candidate.ID);

                return candidate;
            },
            getRandomSpeciesFromPuzzleItemsExceptIDs(ids) {
                do {
                    var result = this.puzzleItems[Math.floor(Math.random() * this.puzzleItems.length)];
                } while (ids.some((id) => result.ID === id))
                return result;
            },
            getRandomSpeciesFromAllItemsExceptIDs(ids) {
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
                    this.incorrect1 = this.getRandomSpeciesFromAllItemsExceptIDs([this.puzzle.ID]);
                }

                if (this.puzzle.SimilarSpecies.length >= 2) {
                    this.incorrect2 = this.speciesList.find((item) => item.ID === this.puzzle.SimilarSpecies[1]);
                }
                else {
                    this.incorrect2 = this.getRandomSpeciesFromAllItemsExceptIDs([this.puzzle.ID, this.incorrect1.ID]);
                }

                if (this.puzzle.SimilarSpecies.length >= 3) {
                    this.incorrect3 = this.speciesList.find((item) => item.ID === this.puzzle.SimilarSpecies[2]);
                }
                else {
                    this.incorrect3 = this.getRandomSpeciesFromAllItemsExceptIDs([this.puzzle.ID, this.incorrect1.ID, this.incorrect2.ID]);
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
                if (this.isAnswered) {
                    // It's a second click, it should be a "continue" trigger
                    this.continueAfterAnswer();
                    return;
                }

                this.isAnswered = true;
                var indexOfAnswer = this.choices.indexOf(answer);

                if (this.isCorrect(answer)) {
                    this.comment = '<p><img class="right-wrong-image" src="Images/green_tick.png" alt="Helyes!" />' + this.puzzle.Name + '</p><i>' + this.puzzle.Category + '</i><br/>' + this.puzzle.DistinctionInfo;
                    this.choiceIsRight[indexOfAnswer] = true;
                    this.totalPoints++;
                    this.numberOfCorrectAnswers++;

                    this.timeoutSeconds = 6;
                }
                else {
                    this.comment = '<p><img class="right-wrong-image" src="Images/red_x.png" alt="Helytelen!" />' + answer + '<br/>' +
                        '<img class="right-wrong-image" src="Images/green_tick.png" alt="Helyes:">' + this.puzzle.Name + '</p>' +
                        '<i>' + this.puzzle.Category + '</i><br/>' + this.puzzle.DistinctionInfo;
                    this.choiceIsWrong[indexOfAnswer] = true;
                    this.mistakeIndexes.push(this.puzzle.ID);
                    var indexOfCorrectAnswer = this.choices.indexOf(this.puzzleName);
                    this.choiceIsRight[indexOfCorrectAnswer] = true;
                    this.isWrongAnswer = true;

                    this.timeoutSeconds = 12;
                }

                this.continueTimeoutHandle = setTimeout(() => this.countdownToContinue(), 1000);

                ++this.numberOfAnsweredQuestions;


            },
            countdownToContinue() {
                if (this.timeoutSeconds > 0) {
                    this.timeoutSeconds--;
                    this.continueTimeoutHandle = setTimeout(() => this.countdownToContinue(), 1000);
                }
                else {
                    this.continueAfterAnswer();
                }
            },
            nextPuzzle() {
                this.puzzle = this.getRandomSpecies();
                this.imageIndex = Math.floor(Math.random() * this.puzzle.ImageSource.length);
                this.getIncorrectAnswers();
                this.randomizeChoices();
                this.resetChoiceColors();
                this.actualIndex++;
                this.isAnswered = false;
                this.isWrongAnswer = false;
            },
            startQuiz() {
                this.previousPuzzleIDs = [];
                this.actualIndex = 1;
                this.totalPoints = 0;
                this.numberOfCorrectAnswers = 0;
                this.numberOfAnsweredQuestions = 0;
                this.puzzle = this.getRandomSpecies();
                this.getIncorrectAnswers();
                this.randomizeChoices();
                this.resetChoiceColors();
                this.comment = '';
                this.isAnswered = false;
                this.isWrongAnswer = false;
            },
            reset() {
                this.gameType = 'all';
                this.puzzleItems = this.speciesList;
                this.startQuiz()
                this.mistakeIndexes = [];
            },
            restartWithMistakes() {
                this.gameType = 'mistakesOnly';
                this.puzzleItems = this.speciesList.filter((item) => this.mistakeIndexes.includes(item.ID));
                this.startQuiz()
                this.mistakeIndexes = [];
            },
            endGame() {
                this.comment = "Vége a játéknak! Eredmény: " + Math.floor(this.totalPoints / this.numberOfAnsweredQuestions * 100) + '%';
            },
            randomizeChoices() {
                this.choices = this.shuffle([this.puzzleName, this.incorrect1.Name, this.incorrect2.Name, this.incorrect3.Name]);
            },
            resetChoiceColors() {
                this.choiceIsRight = [false, false, false, false];
                this.choiceIsWrong = [false, false, false, false];
            },
            continueAfterAnswer() {

                if (this.continueTimeoutHandle != null) {
                    clearTimeout(this.continueTimeoutHandle);
                }

                if (this.previousPuzzleIDs.length >= this.totalPuzzleItemsCount) {
                    this.endGame();
                }
                else {
                    this.nextPuzzle();
                    this.comment = '';
                }
            }
        },
        created() {
            this.startQuiz()
        }
    }).mount('#app')
});