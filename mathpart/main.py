import math
def solve_prog(a, c, b, f, u0, uN):
    if not (len(a) == len(b) == len(c) == len(f)):
        raise Exception
    n = len(a)
    u = [u0]
    for i in range(n):
        t = b[i] * 1.0 / (c[i] - u[-1][0] * a[i]), (a[i] * u[-1][1] + f[i]) * 1.0 / (c[i] - u[-1][0] * a[i])
        u.append(t)
    yn = (uN[1] + uN[0] * u[-1][1]) / (1 - uN[0] * u[-1][0])
    y = [yn]
    for i in range(n, -1, -1):
        y.append(u[i][0] * y[-1] + u[i][1])
    y.reverse()
    return y
# y0 = 2 y1 + 3
# 4y0 - 6y1+ 9y2 = -7
# y2 = 5y1 + 7
# solve_prog([4], [6], [9], [7], [2, 3], [2,0])


def solve_string_old(u0, du0, mu1, mu2, f, a, l, T, sigma, iN=150, jN=100):
    tau = l * 1.0 / iN
    h = 1.0 / jN
    jN = int(jN * T)
    u0_ = [u0(i * tau) for i in range(iN + 1)]
    u1_ = [tau * du0(i * tau) + u0_[i] for i in range(iN + 1)]
    y = [u0_, u1_]
    mu1_ = [mu1(j * h) for j in range(jN + 1)]
    mu2_ = [mu2(j * h) for j in range(jN + 1)]
    phi = [[f(i * tau, j * h)  for i in range(iN + 1)] for j in range(jN + 1)]
    gamma = tau / h
    for j in range(2,jN + 1):
        a = b = [sigma * gamma ** 2 for i in range(iN - 1)]
        c = [1 + 2 * sigma * gamma ** 2 for i in range(iN - 1)]
        f = [2 * y[-1][i] - y[-2][i] + sigma * gamma ** 2 * (y[-2][i+1] + y[-2][i-1] - 2 * y[-2][i]) + \
        (1 - 2 * sigma) * gamma ** 2 * (y[-1][i+1] + y[-1][i-1] - 2 * y[-1][i]) + tau ** 2 * phi[j][i]    for i in range(1, iN)]
        res = solve_prog(a, c, b, f, [0, mu1_[j]], [0, mu2_[j]])
        y.append(res)
    return y

def solve_string(u0, du0, mu1, mu2, f, a, l, T, sigma, iN=150, jN=150):
    h = l * 1.0 / iN
    tau = T * 1.0 / jN
    u0_ = [u0(i * h) for i in range(iN + 1)]
    u1_ = [tau * du0(i * h) + u0_[i] for i in range(iN + 1)]
    y = [u0_, u1_]
    mu1_ = [mu1(j * tau) for j in range(jN + 1)]
    mu2_ = [mu2(j * tau) for j in range(jN + 1)]
    phi = [[f(i * h, j * tau)  for i in range(iN + 1)] for j in range(jN + 1)]
    gamma = tau / h
    for j in range(2,jN + 1):
        a_ = b = [sigma * gamma ** 2 for i in range(iN - 1)]
        c = [1.0 / a ** 2 + 2 * sigma * gamma ** 2 for i in range(iN - 1)]
        f = [(2 * y[-1][i] - y[-2][i]) / a ** 2 + sigma * gamma ** 2 * (y[-2][i+1] + y[-2][i-1] - 2 * y[-2][i]) + \
        (1 - 2 * sigma) * gamma ** 2 * (y[-1][i+1] + y[-1][i-1] - 2 * y[-1][i]) + tau ** 2 * phi[j][i] / a ** 2   for i in range(1, iN)]
        res = solve_prog(a_, c, b, f, [0, mu1_[j]], [0, mu2_[j]])
        y.append(res)
    return y

# z = lambda x: 0
# z2 = lambda x, t: 0
# r = solve_string(lambda x: -x * (x-1), z, z, z, z2)

def get_json(u0, du0, mu1, mu2, f, a, l, T, sigma):
    try:
        a, l, T, sigma = (eval(i, math.__dict__) for i in (a, l, T, sigma))
        funcs = [compile(i, '<string>', 'eval') for i in (u0, du0, mu1, mu2, f)]
        u0 = lambda arg: eval(funcs[0], dict(math.__dict__, x=arg))
        du0 = lambda arg: eval(funcs[1], dict(math.__dict__, x=arg))
        mu1 = lambda arg: eval(funcs[2], dict(math.__dict__, t=arg))
        mu2 = lambda arg: eval(funcs[3], dict(math.__dict__, t=arg))
        f = lambda _x, _t: eval(funcs[4], dict(math.__dict__, x=_x, t=_t))
        r = solve_string(u0, du0, mu1, mu2, f, a, l, T, sigma)
    except Exception as exp:
        return `{'error': exp.message}`
    return `{'data': r, 'T': T, 'l': l}`

# get_json('-x*(x-1)', '0', '0', '0', '0')