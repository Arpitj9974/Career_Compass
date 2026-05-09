const db = require('../models/db');

/**
 * Rule Engine for Career Compass
 * Evaluates eligibility rules and returns UI state for nodes
 */

// Priority order: lock > warn > recommend > normal
const PRIORITY_ORDER = { lock: 4, warn: 3, recommend: 2, hide: 1, normal: 0 };

/**
 * Evaluate all rules for a node given a student profile
 * @param {number} nodeId - The node to evaluate
 * @param {Object} profile - Student profile data
 * @returns {Object} - { state: 'normal'|'locked'|'warning'|'recommended', message: string|null }
 */
function evaluateRulesForNode(nodeId, profile) {
    // Get all rules for this node
    const rules = db.prepare(`
        SELECT * FROM rules 
        WHERE node_id = ? 
        ORDER BY priority DESC
    `).all(nodeId);

    if (rules.length === 0) {
        return { state: 'normal', message: null, rules: [] };
    }

    let highestPriority = 0;
    let resultState = 'normal';
    let resultMessage = null;
    const evaluatedRules = [];

    for (const rule of rules) {
        const evaluation = evaluateRule(rule, profile);
        evaluatedRules.push({
            ...rule,
            passed: evaluation.passed,
            message: evaluation.message
        });

        // Determine UI state based on rule effect and whether it passed
        let ruleState = 'normal';
        if (!evaluation.passed) {
            // Rule failed
            if (rule.effect === 'lock') {
                ruleState = 'locked';
            } else if (rule.effect === 'warn') {
                ruleState = 'warning';
            }
        } else {
            // Rule passed
            if (rule.effect === 'recommend') {
                ruleState = 'recommended';
            }
        }

        // Update result if this rule has higher priority
        const priority = PRIORITY_ORDER[ruleState] || 0;
        if (priority > highestPriority) {
            highestPriority = priority;
            resultState = ruleState;
            resultMessage = rule.message || evaluation.message;
        }
    }

    return {
        state: resultState,
        message: resultMessage,
        rules: evaluatedRules
    };
}

/**
 * Evaluate a single rule against student profile
 */
function evaluateRule(rule, profile) {
    const { rule_type, field, operator, value } = rule;

    try {
        let studentValue;
        let ruleValue = value;

        // Get student value based on rule type
        switch (rule_type) {
            case 'marks':
                const marks = profile.marks || {};
                studentValue = marks[field] !== undefined ? Number(marks[field]) : null;
                ruleValue = Number(value);
                break;

            case 'budget':
                studentValue = profile.budget_max || profile.budget || 0;
                ruleValue = Number(value);
                break;

            case 'stream':
                studentValue = profile.stream || '';
                break;

            case 'skill':
                studentValue = profile.skills || [];
                ruleValue = JSON.parse(value);
                break;

            case 'interest':
                studentValue = profile.interests || [];
                ruleValue = JSON.parse(value);
                break;

            default:
                return { passed: true, message: null };
        }

        // Evaluate based on operator
        let passed = false;
        switch (operator) {
            case '>=':
                passed = studentValue !== null && studentValue >= ruleValue;
                break;
            case '<=':
                passed = studentValue !== null && studentValue <= ruleValue;
                break;
            case '==':
                passed = studentValue === ruleValue;
                break;
            case '!=':
                passed = studentValue !== ruleValue;
                break;
            case 'in':
                // Check if any of student's values match any rule values
                if (Array.isArray(studentValue) && Array.isArray(ruleValue)) {
                    passed = studentValue.some(sv => ruleValue.includes(sv));
                } else if (Array.isArray(ruleValue)) {
                    passed = ruleValue.includes(studentValue);
                }
                break;
            case 'not_in':
                if (Array.isArray(studentValue) && Array.isArray(ruleValue)) {
                    passed = !studentValue.some(sv => ruleValue.includes(sv));
                } else if (Array.isArray(ruleValue)) {
                    passed = !ruleValue.includes(studentValue);
                }
                break;
            default:
                passed = true;
        }

        return {
            passed,
            message: passed
                ? `${field || rule_type}: Requirement met`
                : rule.message || `${field || rule_type}: Requirement not met`
        };

    } catch (error) {
        console.error('Rule evaluation error:', error);
        return { passed: true, message: null };
    }
}

module.exports = {
    evaluateRulesForNode,
    evaluateRule
};
