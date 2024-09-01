/* import {SudokuPuzzle} from "./sudoku.js";*/
var eg1puzz = [
    [null,null,null, null,null,'2' , '4' ,null,null,],
    [null,null,'1' , '8' , '3' ,null, null,null,'9' ,],
    [null,'8' ,null, '5' ,null,null, '1' ,'7' ,'2' ,],
    [null,null,'6' , '9' ,'2' ,null, '7' ,null,'5' ,],
    ['2' ,null,null, null,null,null, null,null,'6' ,],
    ['5' ,null,'9' , null,'1' ,'6' , '8' ,null,null,],
    ['1' ,'7' ,'2' , null,null,'8' , null,'4' ,null,],
    ['3' ,null,null, null,'9' ,'7' , '5' ,null,null,],
    [null,null,'8' , '3' ,null,null, null,null,null,]
];
var eg17puzz = [
    [null,null,null, null,null,null, null,null,'2' ,],
    [null,'6' ,'2' , null,null,'5' , null,'3' ,'8' ,],
    ['8' ,'4' ,'3' , null,'7' ,null, null,null,'1' ,],
    [null,null,null, '7' ,null,null, '3' ,'2' ,null,],
    [null,null,'4' , '3' ,'5' ,'8' , '6' ,null,null,],
    [null,'5' ,'7' , null,null,'1' , null,null,null,],
    ['5' ,null,null, null,'6' ,null, '2' ,'4' ,'9' ,],
    ['4' ,'2' ,null, '9' ,null,null, '7' ,'5' ,null,],
    ['6' ,null,null, null,null,null, null,null,null,]
];

var su = new SudokuPuzzle(eg17puzz);
console.log(su.printablelines());
$('#tlog').text($('#tlog').text() + "\n"+su.printablelines());
var answer = su.solve();
console.log(answer.message);
console.log(answer.soln.printablelines());
$('#tlog').text($('#tlog').text() + "\n"+answer.message);
$('#tlog').text($('#tlog').text() + "\n"+answer.soln.printablelines());
