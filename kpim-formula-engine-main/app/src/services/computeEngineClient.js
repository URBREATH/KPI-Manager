// computeEngineWrapper.js


async function loadComputeEngine() {
    const { ComputeEngine } = await import('@cortex-js/compute-engine');
    return ComputeEngine;
}

async function evaluateExpression(expression) {
    const ComputeEngine = await loadComputeEngine();
    let ce = new ComputeEngine();

    try {

        let result = ce.parse(expression);

        result = result.evaluate();

        result = result.N();

        const numericResult = parseFloat(result.toString());

        if (isNaN(numericResult)) {
            throw new Error("Result is not a number");
        }

        return formatNumber(numericResult)

    } catch (error) {
        console.error("Error evaluating LaTeX expression:", error);
        throw new Error("Invalid expression or unable to evaluate numerically");
    }
}

function formatNumber(num) {
    if (Math.abs(num) >= 1e6 || (Math.abs(num) < 1e-6 && num !== 0)) {
        return num.toExponential(6);
    }

    const fixed = num.toFixed(3);
    return parseFloat(fixed).toString();
}

module.exports = {
    evaluateExpression,
};
