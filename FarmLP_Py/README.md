# Linear Programming Example with Pyomo

This small program solves the farm area allocation problem shown
in the current Wikipedia example for Linear Programming.
Refer to [https://en.wikipedia.org/w/index.php?title=Linear_programming&oldid=1241809516#Example](https://en.wikipedia.org/w/index.php?title=Linear_programming&oldid=1241809516#Example).  
It uses [Pyomo](https://www.pyomo.org/) to solve the constraints.

## Installation and execution

Instructions for Unix-like systems with `git` already installed.

1. Clone the parent repository `git clone https://github.com/amcrae/amcrae.github.io.git`
2. Go to the `FarmLP_Py` directory.
3. Install [GLPK solver package](https://www.gnu.org/software/glpk/) into your operating system. This will be different depending on your OS. e.g. On MacOS use `brew install glpk`
4. Optionally create a virtual env for the program.  
   `virtualenv .env`  
   `. .env/bin/activate`
5. Install python packages with `pip install -r requirements.txt`
6. Run the program with `python3 farmlp.py`

## Example Output

```
[(4.0, <pyomo.core.base.var.VarData object at 0x7fd3d9dd4040>), (3.0, <pyomo.core.base.var.VarData object at 0x7fd3d9dd40b0>)]
Model unknown

  Variables:
    areas : Size=2, Index=crops
        Key    : Lower : Value : Upper : Fixed : Stale : Domain
        Barley :     0 :   4.0 :  None : False : False : NonNegativeReals
         Wheat :     0 :   6.0 :  None : False : False : NonNegativeReals

  Objectives:
    revenue : Size=1, Index=None, Active=True
        Key  : Active : Value
        None :   True :  36.0

  Constraints:
    FertiliserConstr : Size=1
        Key  : Lower : Body : Upper
        None :  None : 42.0 :  48.0
    PesticideConstr : Size=1
        Key  : Lower : Body : Upper
        None :  None : 32.0 :  32.0
    LandConstraint : Size=1
        Key  : Lower : Body : Upper
        None :  None : 10.0 :  10.0
Correct answer!
```