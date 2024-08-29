/* Sudoku novice and intermediate level puzzle solver.
 * For browser compatibility see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/symmetricDifference#browser_compatibility
 * 2024-08-27
 * Andrew McRae
*/
class SudokuPuzzle {
    #board = [];
    #possibles = [];

    constructor(givens) {
        for (let r = 0;r<9;r++) {
            var row = new Array();
            this.#board.push(row);
            for (let c = 0; c<9; c++) {
                row.push(' ');
            }
        }
        if (givens != null) {
            for (let rindex = 0; rindex < givens.length; rindex++) {
                const row = givens[rindex];
                for (let cindex = 0; cindex < row.length; cindex++) {
                    const element = row[cindex];
                    this.setDigit(rindex,cindex,element);
                }
            }
        }
    }

    setDigit(row,col, digit) {
        this.#board[row][col] = digit;
    }

    getDigit(row,col) {
        return this.#board[row][col];
    }

    printablelines() {
        var text = ""
        for (let rindex = 0; rindex < this.#board.length; rindex++) {
            const row = this.#board[rindex];
            for (let cindex = 0; cindex < row.length; cindex++) {
                const element = row[cindex];
                text += "'"+element+"'"
                if (cindex%3==2 && cindex<8) text += "|";
                if (cindex < row.length) text += ", ";
            }
            text += "\n";
            if (rindex%3 == 2 && rindex<8) text += ("---------------------------------------------\n");
        }
        return text;
    }

    resetPossibles() {
        for (let rindex = 0; rindex < 9; rindex++) {
            const row = new Array(9);
            this.#possibles[rindex] = row;
            for (let cindex = 0; cindex < row.length; cindex++) {
                row[cindex] = new Set(['1','2','3','4','5','6','7','8','9']);
            }
        }        
    }

    count_possibles() {
        var count = 0;
        for (let rindex = 0; rindex < this.#possibles.length; rindex++) {
            const row = this.#possibles[rindex];
            for (let cindex = 0; cindex < row.length; cindex++) {
                count += row[cindex].size;
            }
        }
        return count; 
    }

    eliminate_row_poss(rindex,col,answer){
        const row = this.#possibles[rindex];
        for (let cindex = 0; cindex < row.length; cindex++) {
            if (cindex != col) {
                var pset = row[cindex];
                pset.delete(answer);
            }
        }
    }

    eliminate_col_poss(row,col,answer) {
        for (let rindex = 0; rindex < this.#possibles.length; rindex++) {
            if (rindex!=row) {
                const rowa = this.#possibles[rindex];
                var pset = rowa[col];
                pset.delete(answer);
            }
        }
    }

    // Produce index limits for a subsquare of the sudoku board.
    subsquare_ranges(row,col) {
        //answer is the subsquare containing (row,col).
        var answer = {
            row_min: row-(row%3),
            col_min: col-(col%3)
        };
        answer.row_max = answer.row_min+2;
        answer.col_max = answer.col_min+2;
        return answer;
    }

    eliminate_sqr_poss(row,col,answer) {
        const sqr_range = this.subsquare_ranges(row,col);
        for (let rindex = sqr_range.row_min; rindex <= sqr_range.row_max; rindex++) {
            const rowa = this.#possibles[rindex];
            for (let cindex = sqr_range.col_min; cindex <= sqr_range.col_max; cindex++) {
                if (!(rindex==row && cindex==col)) {
                    var pset = rowa[cindex];
                    pset.delete(answer);
                }
            }
        }
    }

    //Eliminate answer as a non-possibility in related positions.
    eliminate_possibles(row,col,answer) {
        this.eliminate_row_poss(row, col, answer);
        this.eliminate_col_poss(row, col, answer);
        this.eliminate_sqr_poss(row, col, answer);
    }

    //Where a position has been given a digit, eliminate that possibility
    // from all the other positions related by the sudoku rules.
    exclude_givens() {
        for (let rindex = 0; rindex < this.#board.length; rindex++) {
            const row = this.#board[rindex];
            for (let cindex = 0; cindex < row.length; cindex++) {
                const element = row[cindex];
                if (element != ' ') {
                    this.eliminate_possibles(rindex,cindex,element);
                    this.#possibles[rindex][cindex] = new Set([element]);
                }
            }
        }
    }

    // Where a position has been found to have only 1 possibility remaining.
    fix_solitaries() {
        for (let rindex = 0; rindex < this.#possibles.length; rindex++) {
            const row = this.#possibles[rindex];
            for (let cindex = 0; cindex < row.length; cindex++) {
                const poss = row[cindex];
                if (poss.size==1) {
                    var fix = null;
                    const eit = poss.entries();
                    for (const entry of eit) fix=entry[0];
                    this.#board[rindex][cindex] = fix;
                }
            }
        }        
    }

    poss_elsewhere_in_row(poss, rindex, col) {
        const row = this.#possibles[rindex];
        for (let cindex = 0; cindex < row.length; cindex++) {
            if (cindex != col) {
                var pset = row[cindex];
                if (pset.has(poss)) return true;
            }
        }
        return false;
    }

    poss_elsewhere_in_col(poss, row, col) {
        for (let rindex = 0; rindex < this.#possibles.length; rindex++) {
            if (rindex!=row) {
                const rowa = this.#possibles[rindex];
                var pset = rowa[col];
                if (pset.has(poss)) return true;
            }
        }
        return false;
    }

    poss_elsewhere_in_sqr(poss, row, col) {
        const sqr_range = this.subsquare_ranges(row,col);
        for (let rindex = sqr_range.row_min; rindex <= sqr_range.row_max; rindex++) {
            const rowa = this.#possibles[rindex];
            for (let cindex = sqr_range.col_min; cindex <= sqr_range.col_max; cindex++) {
                if (!(rindex==row && cindex==col)) {
                    var pset = rowa[cindex];
                    if(pset.has(poss)) return true;
                }
            }
        }
        return false;
    }

    // Check if any of the possibilities in possibles do not occur elsewhere
    // in the same row or col or square, and return that possibility.
    // Return null if all possibilities in possibles are found elsewhere.
    find_singular_poss(possibles, rindex, cindex) {
        for (const poss of possibles) {
            var in_row = this.poss_elsewhere_in_row(poss,rindex,cindex);
            var in_col = this.poss_elsewhere_in_col(poss,rindex,cindex);
            var in_sqr = this.poss_elsewhere_in_sqr(poss,rindex,cindex);
            //Any of the 3 rules can determine the possibility is singular.
            var singular = !in_row || !in_col || !in_sqr;
            if (singular) return poss;
        }
        return null;
    }

    // Where a possibility occurs in only one position in the
    // the same row, column, or square, it must be answer.
    fix_group_inevitables() {
        for (let rindex = 0; rindex < this.#board.length; rindex++) {
            const row = this.#board[rindex];
            for (let cindex = 0; cindex < row.length; cindex++) {
                const element = row[cindex];
                let poss = this.#possibles[rindex][cindex];
                // Looking for cells which are still unknown.
                if (element == ' ' && poss.size>1) {
                    var singular = this.find_singular_poss(poss,rindex,cindex);
                    if (singular!=null) this.setDigit(rindex,cindex,singular);
                }
            }
        }
    }

    is_solved(){
        const target = new Set(['1','2','3','4','5','6','7','8','9']);
        //row condition
        for (let rindex = 0; rindex < this.#board.length; rindex++) {
            const row = this.#board[rindex];
            var found = new Set();
            for (let cindex = 0; cindex < row.length; cindex++) {
                const element = row[cindex];
                found.add(element);
            }
            //Requires browser to be later than June 2024.
            if (found.symmetricDifference(target).size>0) return false;
        }
        // col condition
        for (let cindex = 0; cindex < 9; cindex++) {
            found = new Set();
            for (let rindex = 0; rindex < this.#board.length; rindex++) {
                const row = this.#board[rindex];
                const element = row[cindex];
                found.add(element);
            }
            //Requires browser to be later than June 2024.
            if (found.symmetricDifference(target).size>0) return false;
        }
        // square condition
        for (var srow=0; srow<9;srow+=3) {
            for (var scol=0; scol<9; scol+=3) {
                var sqr_elems = this.subsquare_ranges(srow,scol);
                found = new Set();
                for (var rindex=sqr_elems.row_min; rindex<=sqr_elems.row_max;rindex++){
                    for (var cindex=sqr_elems.col_min; cindex<=sqr_elems.col_max;cindex++){
                        var elem = this.#board[rindex][cindex];
                        found.add(elem);
                    }
                }
                //Requires browser to be later than June 2024.
                if (found.symmetricDifference(target).size>0) return false;
            }
        }
        //no difference from target found.
        return true;
    }

    solve() {
        this.resetPossibles();
        var its = 0;
        do {
            var possiblesCount = this.count_possibles();
            this.exclude_givens();
            this.fix_solitaries();
            this.fix_group_inevitables();
            var possiblesPrime = this.count_possibles();
            var delta_possibles = possiblesPrime - possiblesCount;
            its += 1;
        } while (delta_possibles<0);

        var answer = {}
        if (this.is_solved()) {
            answer.is_solved = true;
            answer.soln = this
            answer.message = "Solved in "+its+" iterations.";
        } else {
            answer.is_solved = false;
            answer.soln = this
            answer.message = "Unsolved after "+its+" iterations.";
        }
        return answer;
    }

}

// Cannot use module syntax due to desire to run locally by file:// protocol.
// See https://github.com/whatwg/html/issues/8121 for proposal to relax rule.
//export {SudokuPuzzle}
