/**
 * TierPilot - Decision Engine
 * 
 * Core logic that takes user inputs and returns a verdict: local, frontier, hybrid, or either.
 * 
 * This module is intentionally isolated from the UI so it can be:
 * - Tested independently
 * - Updated without touching UI code
 * - Eventually replaced with an API call (v2)
 * 
 * DECISION PHILOSOPHY:
 * The engine uses a weighted scoring system rather than hard rules because:
 * 1. Real-world decisions involve trade-offs, not binary choices
 * 2. Users have different priorities (cost vs capability vs privacy)
 * 3. The "right" answer often depends on context that's hard to capture in rules
 * 
 * The scoring system awards points to each tier based on how well it fits the user's
 * constraints. The tier with the highest score wins. If scores are close, we return "either".
 */

import { getTaskComplexity } from '../components/taskSelector.js';

/**
 * Task complexity affects which models can handle the work reliably.
 * 
 * WHY THESE CATEGORIES:
 * - Simple tasks (summarisation, classification) work well on small local models
 *   because they require pattern matching, not deep reasoning
 * - Moderate tasks (code review, first drafts) need better instruction following
 *   and benefit from larger models but don't require frontier capability
 * - Complex tasks (autonomous agents, research synthesis) require multi-step
 *   reasoning, tool use, or long-context handling that only frontier models do well
 */
const COMPLEXITY_SCORES = {
  simple: { local: 3, frontier: 1, hybrid: 1 },
  moderate: { local: 2, frontier: 2, hybrid: 2 },
  complex: { local: 0, frontier: 3, hybrid: 2 }
};

/**
 * Data sensitivity is often the deciding factor.
 * 
 * WHY THESE WEIGHTS:
 * - Not sensitive: No privacy concern, so we're neutral — let other factors decide
 * - Internal: Mild preference for local to avoid data leaving the org, but not a dealbreaker
 * - Confidential: Strong push toward local. Sending PII/regulated data to external APIs
 *   creates compliance risk (GDPR, HIPAA, etc.) that often outweighs capability benefits
 */
const SENSITIVITY_SCORES = {
  'not-sensitive': { local: 1, frontier: 1, hybrid: 1 },
  'internal': { local: 2, frontier: 0, hybrid: 1 },
  'confidential': { local: 4, frontier: -2, hybrid: 2 }
};

/**
 * Output stakes affect how much we trust the model's output without review.
 * 
 * WHY THESE WEIGHTS:
 * - Low stakes: Errors are cheap to fix, so we can use less capable models
 * - Medium stakes: Human review is expected anyway, so model capability matters less
 * - High stakes: We want the most reliable, capable model available. Frontier models
 *   have better calibration and are less likely to confidently produce wrong answers.
 *   However, hybrid approaches with human checkpoints can also work.
 */
const STAKES_SCORES = {
  'low': { local: 2, frontier: 0, hybrid: 1 },
  'medium': { local: 1, frontier: 1, hybrid: 1 },
  'high': { local: -1, frontier: 3, hybrid: 1 }
};

/**
 * Volume and frequency affect the economics of the decision.
 * 
 * WHY THESE WEIGHTS:
 * - Occasional: Setup cost of local models isn't worth it for a few uses.
 *   API pricing is fine for low volume.
 * - Regular: Both approaches work. Local saves money over time, APIs save setup effort.
 * - High volume: API costs add up fast at scale. Local models have zero marginal cost
 *   after setup. This is often the tipping point for going local.
 */
const VOLUME_SCORES = {
  'occasional': { local: 0, frontier: 2, hybrid: 1 },
  'regular': { local: 1, frontier: 1, hybrid: 1 },
  'high-volume': { local: 3, frontier: -1, hybrid: 2 }
};

/**
 * Hardware determines what local models are even possible to run.
 * 
 * WHY THESE WEIGHTS:
 * - Basic laptop: Can only run tiny models (3B-4B) which have limited capability.
 *   Strong push toward frontier unless other factors override.
 * - GPU laptop / M-series: Can run 7B-11B models comfortably. These are capable
 *   enough for most tasks, so local becomes viable.
 * - Workstation: Can run 12B-14B models. Local is very viable.
 * - Cloud: Can run anything. No hardware constraint, so we're neutral.
 */
const HARDWARE_SCORES = {
  'laptop-basic': { local: -1, frontier: 2, hybrid: 0 },
  'laptop-gpu': { local: 2, frontier: 1, hybrid: 2 },
  'workstation': { local: 3, frontier: 0, hybrid: 2 },
  'cloud': { local: 2, frontier: 1, hybrid: 2 }
};

/**
 * Tooling comfort affects the practical friction of each approach.
 * 
 * WHY THESE WEIGHTS:
 * - CLI comfortable: Can set up Ollama, run terminal commands, debug issues.
 *   Local is fully accessible.
 * - GUI preferred: Can use LM Studio or similar. Local is still accessible
 *   but with some friction.
 * - Managed only: Doesn't want to deal with local setup at all. Strong push
 *   toward frontier APIs or managed inference endpoints.
 */
const TOOLING_SCORES = {
  'cli': { local: 3, frontier: 0, hybrid: 2 },
  'gui': { local: 1, frontier: 1, hybrid: 1 },
  'managed': { local: -1, frontier: 3, hybrid: 1 }
};

/**
 * Cost sensitivity is straightforward economics.
 * 
 * WHY THESE WEIGHTS:
 * - High cost sensitivity: Local models are free after setup. Strong preference.
 * - Medium: Willing to pay for value, but mindful. Slight local preference.
 * - Low: Will pay for best results. Frontier models are worth the cost.
 */
const COST_SCORES = {
  'high': { local: 3, frontier: -1, hybrid: 2 },
  'medium': { local: 1, frontier: 1, hybrid: 1 },
  'low': { local: 0, frontier: 2, hybrid: 1 }
};

/**
 * Structured output requirement affects model choice significantly.
 * 
 * WHY THESE WEIGHTS:
 * - Yes (needs JSON): Smaller local models struggle with reliable JSON output.
 *   They often produce malformed JSON or include extra text. Frontier models
 *   have better instruction following and some (like Claude) have native JSON mode.
 *   Hybrid approaches with output validation can help local models.
 * - No (free-form): No constraint, let other factors decide.
 */
const STRUCTURED_OUTPUT_SCORES = {
  'yes': { local: -1, frontier: 2, hybrid: 1 },
  'no': { local: 1, frontier: 0, hybrid: 0 }
};

/**
 * Calculates the verdict based on user inputs.
 * 
 * @param {Object} answers - User's answers from the wizard
 * @returns {Object} Verdict object with verdict, headline, and reasoning
 */
export function calculateVerdict(answers) {
  // Initialize scores for each tier
  const scores = {
    local: 0,
    frontier: 0,
    hybrid: 0
  };

  // Get task complexity from the task selector
  const complexity = getTaskComplexity(answers.task);
  
  // Apply complexity scores
  // WHY: Task complexity is the foundation — some tasks simply need more capable models
  const complexityScore = COMPLEXITY_SCORES[complexity] || COMPLEXITY_SCORES.moderate;
  scores.local += complexityScore.local;
  scores.frontier += complexityScore.frontier;
  scores.hybrid += complexityScore.hybrid;

  // Apply data sensitivity scores
  // WHY: Privacy constraints can override capability considerations
  if (answers.dataSensitivity) {
    const sensitivityScore = SENSITIVITY_SCORES[answers.dataSensitivity];
    if (sensitivityScore) {
      scores.local += sensitivityScore.local;
      scores.frontier += sensitivityScore.frontier;
      scores.hybrid += sensitivityScore.hybrid;
    }
  }

  // Apply output stakes scores
  // WHY: High-stakes outputs need reliable models; low-stakes can tolerate errors
  if (answers.outputStakes) {
    const stakesScore = STAKES_SCORES[answers.outputStakes];
    if (stakesScore) {
      scores.local += stakesScore.local;
      scores.frontier += stakesScore.frontier;
      scores.hybrid += stakesScore.hybrid;
    }
  }

  // Apply volume/frequency scores
  // WHY: Economics change dramatically at scale — APIs get expensive, local gets cheap
  if (answers.volumeFrequency) {
    const volumeScore = VOLUME_SCORES[answers.volumeFrequency];
    if (volumeScore) {
      scores.local += volumeScore.local;
      scores.frontier += volumeScore.frontier;
      scores.hybrid += volumeScore.hybrid;
    }
  }

  // Apply hardware scores
  // WHY: Hardware sets a hard floor on what local models are even possible
  if (answers.hardware) {
    const hardwareScore = HARDWARE_SCORES[answers.hardware];
    if (hardwareScore) {
      scores.local += hardwareScore.local;
      scores.frontier += hardwareScore.frontier;
      scores.hybrid += hardwareScore.hybrid;
    }
  }

  // Apply tooling comfort scores
  // WHY: Practical friction matters — a capable local model is useless if you can't set it up
  if (answers.toolingComfort) {
    const toolingScore = TOOLING_SCORES[answers.toolingComfort];
    if (toolingScore) {
      scores.local += toolingScore.local;
      scores.frontier += toolingScore.frontier;
      scores.hybrid += toolingScore.hybrid;
    }
  }

  // Apply cost sensitivity scores
  // WHY: Budget constraints are real — sometimes the "best" model isn't affordable
  if (answers.costSensitivity) {
    const costScore = COST_SCORES[answers.costSensitivity];
    if (costScore) {
      scores.local += costScore.local;
      scores.frontier += costScore.frontier;
      scores.hybrid += costScore.hybrid;
    }
  }

  // Apply structured output scores
  // WHY: JSON reliability varies significantly between model sizes
  if (answers.structuredOutput) {
    const structuredScore = STRUCTURED_OUTPUT_SCORES[answers.structuredOutput];
    if (structuredScore) {
      scores.local += structuredScore.local;
      scores.frontier += structuredScore.frontier;
      scores.hybrid += structuredScore.hybrid;
    }
  }

  // Determine the winning tier
  // WHY: We use a threshold to detect "close calls" where either approach works
  const maxScore = Math.max(scores.local, scores.frontier, scores.hybrid);
  const threshold = 2; // If scores are within 2 points, consider it a tie
  
  let verdict;
  const closeScores = Object.entries(scores).filter(([_, score]) => maxScore - score <= threshold);
  
  if (closeScores.length > 1 && !closeScores.some(([tier]) => tier === 'hybrid')) {
    // Local and frontier are close, and hybrid isn't in the running
    verdict = 'either';
  } else if (scores.local === maxScore) {
    verdict = 'local';
  } else if (scores.frontier === maxScore) {
    verdict = 'frontier';
  } else {
    verdict = 'hybrid';
  }

  // Generate headline and reasoning
  const { headline, reasoning } = generateExplanation(verdict, answers, scores, complexity);

  return {
    verdict,
    headline,
    reasoning,
    scores // Include for debugging/transparency
  };
}

/**
 * Generates human-readable explanation for the verdict.
 * 
 * @param {string} verdict - The calculated verdict
 * @param {Object} answers - User's answers
 * @param {Object} scores - Calculated scores for each tier
 * @param {string} complexity - Task complexity level
 * @returns {Object} Object with headline and reasoning strings
 */
function generateExplanation(verdict, answers, scores, complexity) {
  let headline = '';
  let reasoning = '';

  // Build reasoning based on the key factors that influenced the decision
  const factors = [];

  switch (verdict) {
    case 'local':
      headline = 'A local model is your best fit for this task.';
      
      if (answers.dataSensitivity === 'confidential') {
        factors.push('Your data sensitivity requirements make keeping everything on-device essential');
      }
      if (answers.costSensitivity === 'high') {
        factors.push('local models eliminate per-token costs after initial setup');
      }
      if (answers.volumeFrequency === 'high-volume') {
        factors.push('at your usage volume, API costs would add up quickly');
      }
      if (complexity === 'simple') {
        factors.push('this task type is well within the capability of modern local models');
      }
      if (answers.hardware === 'workstation' || answers.hardware === 'cloud') {
        factors.push('your hardware can comfortably run capable local models');
      }
      break;

    case 'frontier':
      headline = 'A frontier API model is recommended for this task.';
      
      if (complexity === 'complex') {
        factors.push('this task requires multi-step reasoning that frontier models handle best');
      }
      if (answers.outputStakes === 'high') {
        factors.push('the high stakes of your output warrant the most reliable models available');
      }
      if (answers.structuredOutput === 'yes') {
        factors.push('frontier models provide more reliable structured output');
      }
      if (answers.toolingComfort === 'managed') {
        factors.push('API access requires no local setup or maintenance');
      }
      if (answers.volumeFrequency === 'occasional') {
        factors.push('for occasional use, API pricing is more practical than local setup');
      }
      break;

    case 'hybrid':
      headline = 'A hybrid approach will give you the best results.';
      
      factors.push('combining a local model with external tooling (RAG, agents, or fine-tuning) bridges the capability gap');
      if (answers.dataSensitivity === 'confidential' && complexity === 'complex') {
        factors.push('this lets you keep sensitive data local while adding the capability you need');
      }
      if (answers.costSensitivity === 'high' && complexity !== 'simple') {
        factors.push('this approach balances cost savings with the capability requirements of your task');
      }
      break;

    case 'either':
      headline = 'Both local and frontier approaches would work well here.';
      
      factors.push('your constraints don\'t strongly favor either approach');
      if (answers.dataSensitivity === 'not-sensitive') {
        factors.push('without privacy constraints, you can choose based on preference');
      }
      if (complexity === 'moderate') {
        factors.push('this task complexity is achievable with either local or frontier models');
      }
      factors.push('consider trying a local model first — you can always fall back to an API if needed');
      break;
  }

  // Combine factors into reasoning paragraph
  if (factors.length > 0) {
    reasoning = factors[0].charAt(0).toUpperCase() + factors[0].slice(1);
    if (factors.length > 1) {
      reasoning += '. Additionally, ' + factors.slice(1).join(', and ') + '.';
    } else {
      reasoning += '.';
    }
  }

  return { headline, reasoning };
}

/**
 * Exports for testing
 */
export const _testing = {
  COMPLEXITY_SCORES,
  SENSITIVITY_SCORES,
  STAKES_SCORES,
  VOLUME_SCORES,
  HARDWARE_SCORES,
  TOOLING_SCORES,
  COST_SCORES,
  STRUCTURED_OUTPUT_SCORES,
  generateExplanation
};
