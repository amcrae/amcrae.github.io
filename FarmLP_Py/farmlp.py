import pyomo.environ as pyo
from pyomo.opt import SolverFactory
infinity = float('inf')

# Example model adapted from https://en.wikipedia.org/wiki/Linear_programming#Example

model = pyo.AbstractModel()

model.crops = pyo.Set(initialize=['Wheat','Barley'])

# x (unknowns to be solved)
model.areas = pyo.Var(model.crops, within=pyo.NonNegativeReals)

# F
model.F = pyo.Param(default=48)
# F usage
f_reqs = {
    'Wheat': 3.0,
    'Barley': 6.0
}
model.f_req = pyo.Param(model.crops, initialize=f_reqs)
def fcon(model):
    return sum(model.areas[i]*model.f_req[i] for i in model.crops) <= model.F
model.FertiliserConstr = pyo.Constraint(rule=fcon)

# P
model.P = pyo.Param(default=32)
# P usage
p_reqs = {
    'Wheat': 4.0,
    'Barley': 2.0
}
model.p_req = pyo.Param(model.crops, initialize=p_reqs)
def pcon(model):
    return sum(model.areas[i]*model.p_req[i] for i in model.crops) <= model.P
model.PesticideConstr = pyo.Constraint(rule=pcon)

# S
S = {
    'Wheat': 4.0,
    'Barley': 3.0
}
model.sell_prices = pyo.Param(model.crops, initialize=S)

# L
model.L = pyo.Param(initialize=10.0)
def limit_land(model):
    return sum([model.areas[i] for i in model.crops]) <= model.L
model.LandConstraint = pyo.Constraint(rule=limit_land)

# objective r
def revenue(model):
    return sum(model.sell_prices[i] * model.areas[i] for i in model.crops)

model.revenue = pyo.Objective(rule=revenue, sense=pyo.maximize)

solver_name = 'glpk' # needs glpk package installed by O/S
opt = pyo.SolverFactory(solver_name)
instance = model.create_instance()
print([(instance.sell_prices[i], instance.areas[i]) for i in instance.crops])

results = opt.solve(instance)
instance.display()

if abs(pyo.value(instance.areas['Wheat'])-6.0)<0.001 \
    and abs(pyo.value(instance.areas['Barley'])-4.0)<0.001:
    print("Correct answer!")
else:
    print("Incorrect answer.")